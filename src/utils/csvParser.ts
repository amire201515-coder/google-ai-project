import { MedicalCenter } from '../types/center';

// نگاشت ستون‌های مختلف CSV (فارسی و انگلیسی) به فیلدهای مدل
export const COLUMN_ALIASES = {
  mcId: ['MCId', 'MCID', 'mcid', 'کد مرکز', 'کد مرکز درمانی', 'کد', 'شناسه', 'کدمرکز'],
  centerName: ['Name', 'CenterName', 'نام مرکز', 'نام', 'نام مرکز درمانی', 'مرکز', 'عنوان', 'نام مرجع'],
  centerType: ['CenterKindText', 'CenterType', 'نوع مرکز', 'نوع مرکز درمانی', 'نوع', 'نوع خدمت', 'نوع مرجع'],
  phone: ['Tel', 'Phone', 'تلفن', 'شماره تماس', 'تلفن همراه', 'موبایل', 'شماره تلفن', 'تلفن مرکز'],
  address: ['Address', 'آدرس', 'نشانی', 'آدرس کامل', 'محل'],
  city: ['CityName', 'City', 'نام شهر', 'شهر', 'شهرستان'],
  province: ['ProvinceName', 'Province', 'نام استان', 'استان'],
  onlineLetter: [
    'HasOnlineMoarefinameText',
    'HasOnlineMoarefiname',
    'معرفی نامه آنلاین',
    'معرفی نامه',
    'امکان معرفی نامه',
    'معرفینامه آنلاین',
    'معرفینامه'
  ],
  doctorName: ['DoctorName', 'Doctor', 'نام پزشک', 'پزشک', 'نام دکتر', 'دکتر', 'مسئول فنی'],
  specialty: ['Specialty', 'تخصص', 'خدمات', 'رشته'],
  active: ['Active', 'فعال/غیرفعال', 'وضعیت', 'active', 'فعال']
};

/**
 * پاکسازی مقادیر رشته‌ای و حذف فاصله‌های اضافی
 */
function cleanValue(val: string): string {
  if (!val) return '';
  return val.trim().replace(/^["']|["']$/g, '');
}

/**
 * تشخیص جداکننده CSV (ویرگول، سمیکالن یا تب)
 */
function detectDelimiter(firstLine: string): string {
  const commaCount = (firstLine.match(/,/g) || []).length;
  const semicolonCount = (firstLine.match(/;/g) || []).length;
  const tabCount = (firstLine.match(/\t/g) || []).length;

  if (semicolonCount > commaCount && semicolonCount > tabCount) return ';';
  if (tabCount > commaCount && tabCount > semicolonCount) return '\t';
  return ',';
}

/**
 * تجزیه خط CSV با پشتیبانی از مقادیر داخل کوتیشن
 */
function parseLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"' || char === "'") {
      if (inQuotes && line[i + 1] === char) {
        current += char;
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(cleanValue(current));
      current = '';
    } else {
      current += char;
    }
  }

  result.push(cleanValue(current));
  return result;
}

/**
 * تشخیص تطابق ستون با فیلدهای سیستم
 */
function matchColumn(headerName: string): keyof typeof COLUMN_ALIASES | null {
  const normalized = headerName.trim().toLowerCase();

  for (const [key, aliases] of Object.entries(COLUMN_ALIASES)) {
    for (const alias of aliases) {
      if (alias.toLowerCase() === normalized) {
        return key as keyof typeof COLUMN_ALIASES;
      }
    }
  }

  // بررسی تطابق نسبی برای سرستون‌های فارسی
  for (const [key, aliases] of Object.entries(COLUMN_ALIASES)) {
    for (const alias of aliases) {
      if (normalized.includes(alias.toLowerCase())) {
        return key as keyof typeof COLUMN_ALIASES;
      }
    }
  }

  return null;
}

/**
 * بررسی وضعیت معرفی‌نامه آنلاین
 */
function parseOnlineLetter(value: string | undefined): boolean {
  if (!value) return false;
  const v = value.trim().toLowerCase();
  return (
    v === 'بله' ||
    v === 'دارد' ||
    v === 'true' ||
    v === '1' ||
    v === 'yes' ||
    v === 'فعال' ||
    v.includes('دارد') ||
    v.includes('بله')
  );
}

/**
 * پارس کردن کامل محتوای متنی CSV
 */
export function parseCSV(csvText: string): MedicalCenter[] {
  if (!csvText || !csvText.trim()) return [];

  // حذف BOM در صورت وجود
  const cleanText = csvText.replace(/^\uFEFF/, '').trim();
  const rawLines = cleanText.split(/\r?\n/).filter(line => line.trim().length > 0);

  if (rawLines.length < 2) return [];

  const delimiter = detectDelimiter(rawLines[0]);
  const headers = parseLine(rawLines[0], delimiter);

  // نگاشت اندیس‌ها
  const fieldMapping: { [index: number]: keyof typeof COLUMN_ALIASES } = {};
  headers.forEach((header, idx) => {
    const matched = matchColumn(header);
    if (matched) {
      fieldMapping[idx] = matched;
    }
  });

  const centers: MedicalCenter[] = [];

  for (let i = 1; i < rawLines.length; i++) {
    const values = parseLine(rawLines[i], delimiter);
    if (values.length === 0 || values.every(v => v === '')) continue;

    const centerData: Partial<MedicalCenter> = {
      id: `mc-${i}-${Date.now()}`,
      active: true,
      onlineLetter: false
    };

    values.forEach((val, idx) => {
      const field = fieldMapping[idx];
      if (!field) return;

      if (field === 'onlineLetter') {
        centerData.onlineLetter = parseOnlineLetter(val);
      } else if (field === 'active') {
        centerData.active = val !== '0' && val.toLowerCase() !== 'false' && val !== 'غیرفعال';
      } else {
        (centerData as Record<string, unknown>)[field] = val;
      }
    });

    // حداقل شرط اعتبار رکورد: داشتن نام مرکز یا کد مرکز
    if (centerData.centerName || centerData.mcId) {
      centers.push({
        id: centerData.id || `mc-${i}`,
        mcId: centerData.mcId || String(1000 + i),
        centerName: centerData.centerName || 'مرکز درمانی بدون نام',
        centerType: centerData.centerType || 'سایر',
        province: centerData.province || 'نامشخص',
        city: centerData.city || 'نامشخص',
        address: centerData.address || 'ثبت نشده',
        phone: centerData.phone || 'ثبت نشده',
        onlineLetter: Boolean(centerData.onlineLetter),
        doctorName: centerData.doctorName || undefined,
        specialty: centerData.specialty || undefined,
        active: centerData.active ?? true
      });
    }
  }

  return centers;
}

/**
 * خروجی CSV استاندارد به همراه BOM برای باز شدن صحیح در اکسل
 */
export function exportToCSV(centers: MedicalCenter[]): string {
  const headers = [
    'کد مرکز',
    'نام مرکز',
    'نوع مرکز',
    'استان',
    'شهر',
    'آدرس',
    'تلفن',
    'معرفی نامه آنلاین',
    'نام پزشک'
  ];

  const escapeCSV = (str: string | undefined) => {
    if (!str) return '""';
    const clean = str.replace(/"/g, '""');
    return `"${clean}"`;
  };

  const rows = centers.map(c => [
    escapeCSV(c.mcId),
    escapeCSV(c.centerName),
    escapeCSV(c.centerType),
    escapeCSV(c.province),
    escapeCSV(c.city),
    escapeCSV(c.address),
    escapeCSV(c.phone),
    escapeCSV(c.onlineLetter ? 'بله' : 'خیر'),
    escapeCSV(c.doctorName || '')
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  return '\uFEFF' + csvContent;
}

/**
 * قالب آماده CSV برای راهنمایی کاربر جهت به‌روزرسانی در آینده
 */
export function getSampleCSVTemplate(): string {
  const template = `کد مرکز,نام مرکز,نوع مرکز,استان,شهر,آدرس,تلفن,معرفی نامه آنلاین,نام پزشک
10101,بیمارستان تخصصی پارس,بیمارستان,تهران,تهران,میدان ولیعصر، بلوار کشاورز، پلاک ۱۱۰,02188960051,بله,دکتر رضایی
10102,درمانگاه شبانه‌روزی رازی,درمانگاه,اصفهان,اصفهان,خیابان شمس آبادی، کوچه کازرونی,03132205510,بله,
10103,آزمایشگاه پاتوبیولوژی نور,آزمایشگاه,خوزستان,اهواز,خیابان کیانپارس، نبش خیابان ۳ شرقی,06133334455,خیر,دکتر محمدی
10104,داروخانه دکتر کریمی,داروخانه,فارس,شیراز,خیابان زند، روبروی بیمارستان شهید فقیهی,07132301122,بله,دکتر کریمی
10105,مرکز فیزیوتراپی بهار,فیزیوتراپی,خراسان رضوی,مشهد,احمدآباد، خیابان عدالت، ساختمان پزشکان,05138402233,بله,
10106,کلینیک دندانپزشکی نگین,دندانپزشکی,البرز,کرج,میدان شهدا، ابتدای خیابان بهار,02632244556,خیر,دکتر کاظمی`;

  return '\uFEFF' + template;
}
