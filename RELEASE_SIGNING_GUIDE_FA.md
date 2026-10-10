# راهنمای امضای دیجیتال و انتشار نسخه Android
## برنامه: «جستجوی مراکز بیمه نوین»
**سازنده: حمزه سواری (09168275768 - 09394723353)**  
**شناسه بسته (ApplicationId): `com.hamzesavari.bimenovin`**

---

### ۱. مقدمه و استانداردهای امنیتی
طبق الزامات رسمی انتشار، هیچ‌گونه کلید خصوصی (Keystore)، رمز عبور یا اطلاعات محرمانه نباید درون کدهای برنامه یا مخزن گیت قرار داده شود (Hard-code نشود).
همچنین این پروژه به‌صورت کاملاً استاندارد پیکربندی شده و **هیچ روش غیرمجازی برای دور زدن Google Play Protect ندارد** تا نرم‌افزار بدون مشکل از بررسی‌های امنیتی گوگل عبور نماید.

---

### ۲. ساخت کلید خصوصی (Keystore) با ابزار استاندارد keytool

در ترمینال سیستم خود دستور زیر را اجرا کنید تا کلید امضا تولید شود:

```bash
keytool -genkey -v -keystore bimenovin-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias bimenovin
```

- پس از اجرای دستور، از شما یک رمز عبور (Password) و مشخصات هویتی پرسیده می‌شود.
- فایل خروجی `bimenovin-release-key.jks` در پوشه جاری ایجاد می‌شود.
- **مهم:** از این فایل و رمز عبور آن در مکانی امن نسخه پشتیبان تهیه کنید. برای به‌روزرسانی‌های آینده در گوگل‌پلی دقیقاً به همین کلید نیاز خواهید داشت.

---

### ۳. تنظیم فایل `key.properties` بدون درج در گیت

فایل نمونه با نام `key.properties.example` در ریشه پروژه قرار دارد. آن را در مسیر ریشه با نام `key.properties` ذخیره کنید و اطلاعات خود را قرار دهید:

```properties
storeFile=bimenovin-release-key.jks
storePassword=رمز_عبور_کلید_شما
keyAlias=bimenovin
keyPassword=رمز_عبور_کلید_شما
```

> ⚠️ فایل `key.properties` و پسوندهای `*.jks` قبلاً در `.gitignore` قرار گرفته‌اند و وارد گیت نخواهند شد.

---

### ۴. ساخت فایل‌های نصبی (APK و AAB)

ابتدا مطمئن شوید بیلد فرانت‌اند ساخته و همگام شده است:

```bash
# بیلد وب و همگام‌سازی با پروژه اندروید
npm run build
npx cap sync android
```

#### الف) ساخت APK برای تست و نصب مستقیم در گوشی (Debug یا Release)

**برای تست سریع (Debug APK):**
```bash
cd android
./gradlew assembleDebug
```
- مسیر خروجی: `android/app/build/outputs/apk/debug/app-debug.apk`
- این فایل را می‌توانید مستقیماً به گوشی منتقل و نصب کنید.

**برای APK نهایی و امضاشده (Release APK):**
```bash
cd android
./gradlew assembleRelease
```
- مسیر خروجی: `android/app/build/outputs/apk/release/app-release.apk`

---

#### ب) ساخت AAB (Android App Bundle) برای انتشار در Google Play

گوگل پلی برای انتشار برنامه‌های جدید فرمت **AAB** را الزامی می‌داند:

```bash
cd android
./gradlew bundleRelease
```
- مسیر خروجی: `android/app/build/outputs/bundle/release/app-release.aab`
- این فایل آماده بارگذاری در پنل **Google Play Console** در بخش Production یا Open/Closed Testing است.

---

### ۵. انطباق کامل با Google Play Protect

این برنامه تمام شرایط امنیتی Play Protect را داراست:
1. **دسترسی‌های مجاز و حداقلی:** تنها دسترسی به اینترنت (`android.permission.INTERNET`) و وضعیت شبکه برای مسیریابی و تماس فعال است.
2. **عدم استفاده از کدهای پویا یا خطرناک:** تمام فایل‌های کلاینت به‌صورت آفلاین و محلی درون پکیج اپلیکیشن بسته‌بندی شده‌اند.
3. **شفافیت کامل در ساختار Gradle و Manifest:** شناسه‌ها، تگ‌ها و پشتیبانی RTL استاندارد است.
4. **هدف‌گیری جدیدترین API های اندروید:** نسخه هدف Android 14+ (API 34) تنظیم شده است.
