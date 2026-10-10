export interface MedicalCenter {
  id: string;
  mcId: string;              // کد مرکز
  centerName: string;        // نام مرکز
  centerType: string;        // نوع مرکز (بیمارستان، درمانگاه، آزمایشگاه و...)
  province: string;          // استان
  city: string;              // شهر
  address: string;           // آدرس کامل
  phone: string;             // شماره تماس
  onlineLetter: boolean;     // معرفی‌نامه آنلاین
  doctorName?: string;       // نام پزشک یا مسئول فنی (در صورت وجود)
  specialty?: string;        // تخصص یا خدمات ارائه شده
  active?: boolean;          // وضعیت فعالیت
  _searchIndex?: string;     // ایندکس متنی بهینه‌سازی‌شده برای جستجوی فوری
}

export interface SearchFilters {
  query: string;
  province: string;
  city: string;
  centerType: string;
  onlyOnlineLetter: boolean;
}

export interface ImportErrorItem {
  rowNumber: number;
  reason: string;
  rawData?: Record<string, unknown> | string[];
}

export interface ImportResult {
  totalRows: number;
  successCount: number;
  errorCount: number;
  centers: MedicalCenter[];
  errors: ImportErrorItem[];
  fileName: string;
  fileType: 'csv' | 'excel';
}
