import * as XLSX from 'xlsx';
import { MedicalCenter, ImportResult, ImportErrorItem } from '../types/center';
import { buildSearchIndex, normalizePersian } from './textNormalizer';

// جدول نگاشت تمامی حالات ممکن سرستون‌های فارسی و انگلیسی
export const COLUMN_MAPPINGS: Partial<Record<keyof MedicalCenter | 'status', string[]>> = {
  mcId: [
    'کد مرکز', 'کدمرکز', 'کد', 'شناسه', 'کد مرکز درمانی', 'شناسه مرکز',
    'mcid', 'mc_id', 'code', 'centercode', 'center_code', 'id'
  ],
  centerName: [
    'نام مرکز', 'نام', 'مرکز', 'عنوان', 'نام مرکز درمانی', 'نام مرجع', 'مرجع درمانی',
    'name', 'centername', 'center_name', 'title'
  ],
  centerType: [
    'نوع مرکز', 'نوع', 'نوع خدمت', 'نوع مرکز درمانی', 'نوع مرجع',
    'centerkindtext', 'centertype', 'center_type', 'type', 'kind'
  ],
  province: [
    'استان', 'نام استان', 'استان مرکز',
    'provincename', 'province_name', 'province', 'state'
  ],
  city: [
    'شهر', 'نام شهر', 'شهرستان', 'شهر مرکز',
    'cityname', 'city_name', 'city'
  ],
  address: [
    'آدرس', 'نشانی', 'آدرس کامل', 'محل', 'موقعیت',
    'address', 'fulladdress', 'location'
  ],
  phone: [
    'تلفن', 'شماره تماس', 'تلفن همراه', 'موبایل', 'شماره تلفن', 'تلفن مرکز', 'تماس',
    'tel', 'phone', 'telephone', 'mobile', 'tell'
  ],
  onlineLetter: [
    'معرفی نامه آنلاین', 'معرفی نامه', 'امکان معرفی نامه', 'معرفینامه آنلاین', 'معرفینامه',
    'hasonlinemoarefinametext', 'hasonlinemoarefiname', 'onlineletter', 'online_letter', 'moarefiname'
  ],
  doctorName: [
    'نام پزشک', 'پزشک', 'نام دکتر', 'دکتر', 'مسئول فنی', 'پزشک معالج',
    'doctorname', 'doctor_name', 'doctor'
  ],
  specialty: [
    'تخصص', 'خدمات', 'رشته', 'بخش',
    'specialty', 'services'
  ],
  active: [
    'فعال/غیرفعال', 'وضعیت', 'فعال',
    'active', 'status'
  ],
  id: ['id'],
  _searchIndex: ['_searchIndex']
};

/**
 * نرمال‌سازی نام ستون برای مقایسه بدون حساسیت به فاصله، خط تیره و حروف
 */
function normalizeColumnHeader(header: string): string {
  if (!header) return '';
  return header
    .toString()
    .toLowerCase()
    .replace(/[\s_\-–—\(\)\[\]\.:]/g, '')
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .trim();
}

/**
 * پیدا کردن فیلد متناظر با یک سرستون
 */
function matchFieldToHeader(header: string): keyof MedicalCenter | null {
  const norm = normalizeColumnHeader(header);
  if (!norm) return null;

  for (const [field, aliases] of Object.entries(COLUMN_MAPPINGS)) {
    for (const alias of aliases) {
      if (normalizeColumnHeader(alias) === norm) {
        return field as keyof MedicalCenter;
      }
    }
  }

  // بررسی تطابق جزئی برای سرستون‌های فارسی
  for (const [field, aliases] of Object.entries(COLUMN_MAPPINGS)) {
    for (const alias of aliases) {
      const normAlias = normalizeColumnHeader(alias);
      if (norm.includes(normAlias) || normAlias.includes(norm)) {
        return field as keyof MedicalCenter;
      }
    }
  }

  return null;
}

/**
 * تبدیل مقادیر متنوع معرفی‌نامه آنلاین به مقدار بولی
 */
function parseOnlineLetterValue(value: unknown): boolean {
  if (value === true || value === 1) return true;
  if (!value) return false;

  const str = String(value).trim().toLowerCase();
  const normalized = normalizePersian(str);

  return (
    normalized === 'بله' ||
    normalized === 'دارد' ||
    normalized === 'true' ||
    normalized === '1' ||
    normalized === 'yes' ||
    normalized === 'فعال' ||
    normalized.includes('دارد') ||
    normalized.includes('بله')
  );
}

/**
 * پارسر کامل و استاندارد CSV مطابق RFC 4180
 * با پشتیبانی از فیلدهای چندخطی، کوتیشن‌های تو در تو و تشخیص هوشمند جداکننده
 */
function parseCSVToGrid(csvText: string): string[][] {
  // حذف UTF-8 BOM
  const text = csvText.replace(/^\uFEFF/, '');
  if (!text.trim()) return [];

  // تشخیص خودکار جداکننده از روی ۵ خط اول
  const sample = text.slice(0, 3000);
  const commaCount = (sample.match(/,/g) || []).length;
  const semicolonCount = (sample.match(/;/g) || []).length;
  const tabCount = (sample.match(/\t/g) || []).length;

  let delimiter = ',';
  if (semicolonCount > commaCount && semicolonCount > tabCount) {
    delimiter = ';';
  } else if (tabCount > commaCount && tabCount > semicolonCount) {
    delimiter = '\t';
  }

  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // کوتیشن دابل در داخل فیلد
        currentField += '"';
        i++;
      } else {
        // تغییر وضعیت ورود/خروج از کوتیشن
        insideQuotes = !insideQuotes;
      }
    } else if (char === delimiter && !insideQuotes) {
      currentRow.push(currentField.trim());
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(currentField.trim());
      // ردیف‌های خالی صرف‌نظر می‌شوند
      if (currentRow.some(c => c.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }

  // افزودن آخرین فیلد و ردیف
  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some(c => c.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

/**
 * وارد کردن و تبدیل فایل اکسل (XLSX یا XLS) با کتابخانه SheetJS
 */
export async function importExcelFile(file: File): Promise<ImportResult> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });

  if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
    throw new Error('فایل اکسل انتخاب‌شده فاقد هرگونه صفحه (Sheet) معتبر است.');
  }

  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  // خروجی جدول دو بعدی بدون اسکیپ کردن هیچ ردیفی
  const rawGrid = XLSX.utils.sheet_to_json<string[]>(worksheet, {
    header: 1,
    defval: '',
    raw: false,
    blankrows: false
  });

  return processGridToCenters(rawGrid, file.name, 'excel');
}

/**
 * وارد کردن و تبدیل فایل CSV با پارسر استاندارد
 */
export async function importCSVFile(file: File): Promise<ImportResult> {
  const text = await file.text();
  const rawGrid = parseCSVToGrid(text);
  return processGridToCenters(rawGrid, file.name, 'csv');
}

/**
 * پردازش شبکه دو بعدی داده‌ها (Grid) و تبدیل به آرایه رکوردهای استاندارد
 * همراه با بررسی ردیف به ردیف و گزارش دقیق خطاهای احتمالی
 */
function processGridToCenters(grid: (string | unknown)[][], fileName: string, fileType: 'csv' | 'excel'): ImportResult {
  if (grid.length < 2) {
    return {
      totalRows: 0,
      successCount: 0,
      errorCount: 0,
      centers: [],
      errors: [{ rowNumber: 1, reason: 'فایل خالی است یا فقط دارای یک ردیف سرستون می‌باشد.' }],
      fileName,
      fileType
    };
  }

  const rawHeaders = (grid[0] || []).map(h => String(h || '').trim());
  const headerMap: { [columnIndex: number]: keyof MedicalCenter } = {};

  rawHeaders.forEach((h, colIdx) => {
    const matched = matchFieldToHeader(h);
    if (matched) {
      headerMap[colIdx] = matched;
    }
  });

  const totalDataRows = grid.length - 1;
  const centers: MedicalCenter[] = [];
  const errors: ImportErrorItem[] = [];

  for (let r = 1; r < grid.length; r++) {
    const row = grid[r] || [];
    const rowNumber = r + 1; // شماره ردیف واقعی برای نمایش به کاربر (سرستون = ردیف ۱)

    // بررسی اینکه آیا تمام خانه‌های این ردیف کاملاً خالی هستند
    const isEmpty = row.every(val => !val || String(val).trim() === '');
    if (isEmpty) {
      continue;
    }

    const rowObj: Partial<MedicalCenter> = {
      active: true,
      onlineLetter: false
    };

    row.forEach((val, colIdx) => {
      const field = headerMap[colIdx];
      if (!field) return;

      const strVal = val != null ? String(val).trim() : '';

      if (field === 'onlineLetter') {
        rowObj.onlineLetter = parseOnlineLetterValue(val);
      } else if (field === 'active') {
        rowObj.active = strVal !== '0' && strVal.toLowerCase() !== 'false' && strVal !== 'غیرفعال';
      } else {
        (rowObj as Record<string, unknown>)[field] = strVal;
      }
    });

    // حداقل اعتبارسنجی: باید حداقل نام مرکز یا کد مرکز مشخص باشد
    const hasName = Boolean(rowObj.centerName && rowObj.centerName.trim().length > 0);
    const hasCode = Boolean(rowObj.mcId && rowObj.mcId.trim().length > 0);

    if (!hasName && !hasCode) {
      errors.push({
        rowNumber,
        reason: 'فاقد نام مرکز و کد مرکز می‌باشد و قابل شناسایی نیست.',
        rawData: row as string[]
      });
      continue;
    }

    const centerName = rowObj.centerName || `مرکز درمانی کد ${rowObj.mcId}`;
    const mcId = rowObj.mcId || String(1000 + centers.length + 1);

    const center: MedicalCenter = {
      id: `mc-${mcId}-${r}-${Date.now()}`,
      mcId,
      centerName,
      centerType: rowObj.centerType || 'سایر',
      province: rowObj.province || 'نامشخص',
      city: rowObj.city || 'نامشخص',
      address: rowObj.address || 'ثبت نشده',
      phone: rowObj.phone || 'ثبت نشده',
      onlineLetter: Boolean(rowObj.onlineLetter),
      doctorName: rowObj.doctorName || undefined,
      specialty: rowObj.specialty || undefined,
      active: rowObj.active ?? true
    };

    // تولید ایندکس جستجوی بهینه‌سازی‌شده
    center._searchIndex = buildSearchIndex(center);

    centers.push(center);
  }

  return {
    totalRows: totalDataRows,
    successCount: centers.length,
    errorCount: errors.length,
    centers,
    errors,
    fileName,
    fileType
  };
}
