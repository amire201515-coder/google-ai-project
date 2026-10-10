import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';
import { MedicalCenter } from '../src/types/center';
import { INITIAL_CENTERS } from '../src/data/initialCenters';
import { COLUMN_MAPPINGS } from '../src/utils/fileImporter';
import { normalizePersian, buildSearchIndex } from '../src/utils/textNormalizer';

async function runComprehensiveVerification() {
  console.log('================================================================');
  console.log('🚀 اجرای آزمون الزامی: بررسی کامل ۱۹۵۸ مرکز در دیتای اصلی برنامه');
  console.log('================================================================\n');

  // تست ۱: شمارش رکوردهای اولیه موجود در سورس کد و asset ها
  const initialCount = INITIAL_CENTERS.length;
  console.log(`📊 ۱. شمارش رکوردهای دیتای اولیه برنامه: ${initialCount} رکورد`);
  if (initialCount !== 1958) {
    throw new Error(`❌ خطا: تعداد رکوردهای اولیه باید ۱۹۵۸ باشد، اما ${initialCount} است!`);
  }
  console.log('✅ تایید شد: تعداد رکوردهای اولیه دقیقاً ۱۹۵۸ رکورد است.');

  // تست ۲: جستجوی رکورد از ابتدای داده
  console.log('\n🔍 ۲. جستجوی رکورد از ابتدای داده:');
  const recordStart = INITIAL_CENTERS[0];
  console.log(`- رکورد ۰: ${recordStart.centerName} (کد: ${recordStart.mcId}، شهر: ${recordStart.city})`);
  const queryStart = 'صنعت نفت';
  const foundStart = INITIAL_CENTERS.filter(c => buildSearchIndex(c).includes(normalizePersian(queryStart)));
  console.log(`- نتیجه جستجوی "${queryStart}": ${foundStart.length} رکورد پیدا شد.`);
  if (!foundStart.some(c => c.mcId === '5573142')) {
    throw new Error('❌ رکورد ابتدای داده پیدا نشد!');
  }
  console.log('✅ تایید شد: رکورد ابتدای داده (بیمارستان صنعت نفت) با موفقیت پیدا شد.');

  // تست ۳: جستجوی رکورد از وسط داده (رکورد ۱۰۰۰)
  console.log('\n🔍 ۳. جستجوی رکورد از وسط داده (ایندکس ۱۰۰۰):');
  const recordMid = INITIAL_CENTERS[1000];
  console.log(`- رکورد ۱۰۰۰: ${recordMid.centerName} (کد: ${recordMid.mcId}، شهر: ${recordMid.city})`);
  const queryMid = 'عینک سازی روشنی';
  const foundMid = INITIAL_CENTERS.filter(c => buildSearchIndex(c).includes(normalizePersian(queryMid)));
  console.log(`- نتیجه جستجوی "${queryMid}": ${foundMid.length} رکورد پیدا شد.`);
  if (!foundMid.some(c => c.mcId === '8478375')) {
    throw new Error('❌ رکورد وسط داده پیدا نشد!');
  }
  console.log('✅ تایید شد: رکورد میانه داده (عینک سازی روشنی آبادان) با موفقیت پیدا شد.');

  // تست ۴: جستجوی رکورد از انتهای داده (ایندکس ۱۹۵۷)
  console.log('\n🔍 ۴. جستجوی رکورد از انتهای داده (ایندکس ۱۹۵۷):');
  const recordEnd = INITIAL_CENTERS[1957];
  console.log(`- رکورد ۱۹۵۷: ${recordEnd.centerName} (کد: ${recordEnd.mcId}، آدرس: ${recordEnd.address})`);
  const queryEnd = 'دکتر صانع';
  const foundEnd = INITIAL_CENTERS.filter(c => buildSearchIndex(c).includes(normalizePersian(queryEnd)));
  console.log(`- نتیجه جستجوی "${queryEnd}": ${foundEnd.length} رکورد پیدا شد.`);
  if (!foundEnd.some(c => c.centerName.includes('صانع'))) {
    throw new Error('❌ رکورد انتهای داده پیدا نشد!');
  }
  console.log('✅ تایید شد: رکورد انتهای داده (مطب دکتر صانع در ملاشیه) با موفقیت پیدا شد.');

  // تست ۵: بررسی وجود فایل JSON در asset های Android
  console.log('\n📱 ۵. بررسی وجود دیتای کامل در assets پکیج اندروید...');
  const androidAssetPath = path.resolve(process.cwd(), 'android/app/src/main/assets/public/centers1958.json');
  if (!fs.existsSync(androidAssetPath)) {
    throw new Error(`❌ فایل در مسیر ${androidAssetPath} یافت نشد!`);
  }
  const androidContent = JSON.parse(fs.readFileSync(androidAssetPath, 'utf-8'));
  console.log(`- تعداد رکوردها در asset اندروید: ${androidContent.length} رکورد`);
  if (androidContent.length !== 1958) {
    throw new Error(`❌ تعداد رکوردها در asset اندروید برابر ۱۹۵۸ نیست! (${androidContent.length})`);
  }
  console.log('✅ تایید شد: دیتای کامل ۱۹۵۸ مرکز داخل assets اندروید برای APK/AAB قرار دارد.');

  console.log('\n================================================================');
  console.log('🎉 تمام ۵ شرط آزمون الزامی با موفقیت ۱۰۰٪ پاس شدند!');
  console.log('================================================================\n');
}

runComprehensiveVerification().catch(err => {
  console.error('\n❌ خطا در آزمون:', err);
  process.exit(1);
});
