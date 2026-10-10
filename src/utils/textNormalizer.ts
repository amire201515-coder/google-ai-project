import { MedicalCenter } from '../types/center';

/**
 * یکسان‌سازی حروف فارسی و عربی (ی، ك، ارقام، فاصله‌ها و نیم‌فاصله‌ها)
 */
export function normalizePersian(text: string | undefined | null): string {
  if (!text) return '';

  return text
    .toString()
    .toLowerCase()
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/ة/g, 'ه')
    .replace(/[\u200C\u200B]/g, ' ') // نیم‌فاصله‌ها
    .replace(/[۰-۹]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 1728)) // ارقام فارسی به انگلیسی
    .replace(/[٠-٩]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 1584)) // ارقام عربی به انگلیسی
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * ایجاد ایندکس متنی بهینه‌سازی‌شده برای جستجوی فوری بر روی تمام رکوردهای واردشده
 */
export function buildSearchIndex(center: Partial<MedicalCenter>): string {
  const parts = [
    normalizePersian(center.mcId),
    normalizePersian(center.centerName),
    normalizePersian(center.centerType),
    normalizePersian(center.province),
    normalizePersian(center.city),
    normalizePersian(center.address),
    normalizePersian(center.phone),
    center.doctorName ? normalizePersian(center.doctorName) : '',
    center.specialty ? normalizePersian(center.specialty) : '',
    center.onlineLetter ? 'دارد بله انلاین آنلاین' : 'ندارد خیر'
  ];

  return parts.filter(Boolean).join(' ');
}
