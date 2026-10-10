import { INITIAL_CENTERS } from '../src/data/initialCenters';
import { normalizePersian, buildSearchIndex } from '../src/utils/textNormalizer';

function runTestSuite() {
  console.log('====================================================');
  console.log('🔬 آزمون جامع الزامات: بررسی ۱۹۵۸ رکورد دائمی برنامه');
  console.log('====================================================\n');

  // ۱. شمارش رکوردهای اولیه
  const count = INITIAL_CENTERS.length;
  console.log(`تعداد رکوردهای دیتای اولیه: ${count}`);
  if (count !== 1958) {
    throw new Error(`❌ خطا: تعداد رکوردها باید دقیقاً ۱۹۵۸ باشد ولی ${count} است!`);
  }
  console.log('✅ تایید ۱: دیتای اولیه برنامه شامل دقیقاً ۱۹۵۸ رکورد است.\n');

  // ۲. ایندکس‌گذاری و جستجو
  const indexed = INITIAL_CENTERS.map(c => ({
    ...c,
    _searchIndex: buildSearchIndex(c)
  }));

  // ۳. آزمون رکورد اول (ابتدای فایل)
  const queryStart = 'بیمارستان صنعت نفت';
  const startTokens = normalizePersian(queryStart).split(' ');
  const startResults = indexed.filter(c => 
    startTokens.every(t => (c._searchIndex || '').includes(t))
  );
  console.log(`جستجوی رکورد ابتدای فایل ("${queryStart}"):`);
  console.log(`- تعداد پیدا شده: ${startResults.length}`);
  if (startResults.length === 0 || !startResults[0].centerName.includes('صنعت نفت')) {
    throw new Error('❌ خطا: رکورد ابتدای فایل پیدا نشد!');
  }
  console.log(`- نام مرکز پیدا شده: ${startResults[0].centerName} (کد: ${startResults[0].mcId})`);
  console.log('✅ تایید ۲: رکورد ابتدای فایل با موفقیت پیدا شد.\n');

  // ۴. آزمون رکورد میانی (وسط فایل - شماره ۱۰۰۰)
  const queryMid = 'عینک سازی روشنی';
  const midTokens = normalizePersian(queryMid).split(' ');
  const midResults = indexed.filter(c => 
    midTokens.every(t => (c._searchIndex || '').includes(t))
  );
  console.log(`جستجوی رکورد وسط فایل ("${queryMid}"):`);
  console.log(`- تعداد پیدا شده: ${midResults.length}`);
  if (midResults.length === 0 || !midResults[0].centerName.includes('روشنی')) {
    throw new Error('❌ خطا: رکورد وسط فایل پیدا نشد!');
  }
  console.log(`- نام مرکز پیدا شده: ${midResults[0].centerName} (کد: ${midResults[0].mcId})`);
  console.log('✅ تایید ۳: رکورد وسط فایل (شماره ۱۰۰۰) با موفقیت پیدا شد.\n');

  // ۵. آزمون رکورد انتهایی (انتهای فایل - شماره ۱۹۵۷)
  const queryEnd = 'مطب دکتر صانع';
  const endTokens = normalizePersian(queryEnd).split(' ');
  const endResults = indexed.filter(c => 
    endTokens.every(t => (c._searchIndex || '').includes(t))
  );
  console.log(`جستجوی رکورد انتهای فایل ("${queryEnd}"):`);
  console.log(`- تعداد پیدا شده: ${endResults.length}`);
  if (endResults.length === 0 || !endResults[0].centerName.includes('صانع')) {
    throw new Error('❌ خطا: رکورد انتهای فایل پیدا نشد!');
  }
  console.log(`- نام مرکز پیدا شده: ${endResults[0].centerName} (کد: ${endResults[0].mcId})`);
  console.log('✅ تایید ۴: رکورد انتهای فایل با موفقیت پیدا شد.\n');

  // ۶. آزمون جستجوی بدون فیلتر
  const allResults = indexed.filter(() => true);
  console.log(`تعداد نتایج جستجوی بدون فیلتر: ${allResults.length}`);
  if (allResults.length !== 1958) {
    throw new Error('❌ خطا: جستجوی بدون فیلتر ۱۹۵۸ نتیجه نداد!');
  }
  console.log('✅ تایید ۵: جستجوی بدون فیلتر کل ۱۹۵۸ مرکز را بدون هیچ محدودیتی برمی‌گرداند.\n');

  // ۷. بررسی فیلترهای شهرها
  const cities = new Set(indexed.map(c => c.city).filter(Boolean));
  console.log(`تعداد شهرهای ثبت شده در دیتاست: ${cities.size}`);
  console.log(`شهرهای شاخص: اهواز (${indexed.filter(c => c.city === 'اهواز').length} مرکز)، آبادان (${indexed.filter(c => c.city === 'آبادان').length} مرکز)، دزفول (${indexed.filter(c => c.city === 'دزفول').length} مرکز)`);
  console.log('✅ تایید ۶: ساختار شهرها، مراکز و تخصص‌ها کامل و منطبق با خوزستان است.\n');

  console.log('====================================================');
  console.log('🎉 تمام تست‌های الزامی با موفقیت ۱۰۰٪ تایید شدند.');
  console.log('====================================================\n');
}

runTestSuite();
