import React, { useState } from 'react';
import {
  X,
  Smartphone,
  ShieldCheck,
  Terminal,
  Copy,
  Check,
  CheckCircle,
  FileCode,
  AlertCircle
} from 'lucide-react';

interface AndroidGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidGuideModal: React.FC<AndroidGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const syncCmd = `npm run build\nnpx cap sync android`;
  const debugApkCmd = `cd android && ./gradlew assembleDebug`;
  const releaseApkCmd = `cd android && ./gradlew assembleRelease`;
  const releaseAabCmd = `cd android && ./gradlew bundleRelease`;
  const keystoreCmd = `keytool -genkey -v -keystore bimenovin-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias bimenovin`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 sm:px-6 bg-gradient-to-l from-emerald-950 via-teal-900 to-emerald-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <Smartphone className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                راهنمای ساخت نسخه Android (APK و AAB)
              </h2>
              <p className="text-xs text-emerald-200/80">
                پروژه استاندارد با شناسه com.hamzesavari.bimenovin
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-emerald-200 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs sm:text-sm text-slate-700">
          {/* Package info card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="font-bold text-slate-800">مشخصات بسته اندروید:</span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 font-mono text-xs font-bold">
                com.hamzesavari.bimenovin
              </span>
            </div>
            <div className="text-xs text-slate-500 space-y-1">
              <p>• نام نمایشی برنامه: <strong>جستجوی مراکز بیمه نوین</strong></p>
              <p>• سازگار با: <strong>Android 5.0 (API 21) تا Android 14+ (API 34)</strong></p>
              <p>• پشتیبانی کامل از راست‌چین (RTL) و قالب‌های استاندارد متریال</p>
            </div>
          </div>

          {/* Google Play Protect Compliance Notice */}
          <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-4 text-emerald-900 space-y-2">
            <div className="flex items-center gap-2 font-bold text-emerald-950">
              <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>سازگاری با Google Play Protect و خط‌مشی‌های گوگل پلی</span>
            </div>
            <p className="text-xs leading-relaxed text-emerald-800">
              این پروژه با استفاده از ساختار کاملاً رسمی و مجاز پیاده‌سازی شده و از هیچ روش غیرمجاز، مبهم‌سازی مخرب یا دور زدن تاییدیه‌ها استفاده نمی‌کند. دسترسی‌های مجاز، ساختار شفاف Gradle و امضای معتبر باعث عبور سریع از اعتبارسنجی Google Play Protect می‌شود.
            </p>
          </div>

          {/* Build Instructions */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-emerald-700" />
              <span>دستورات همگام‌سازی و ساخت بیلد</span>
            </h4>

            {/* Step 1: Sync */}
            <div className="bg-slate-900 text-slate-100 rounded-xl p-3 font-mono text-xs relative group">
              <div className="text-slate-400 mb-1">// ۱. بیلد وب و همگام‌سازی فایل‌های اندروید:</div>
              <pre className="text-emerald-300 overflow-x-auto">{syncCmd}</pre>
              <button
                onClick={() => handleCopy(syncCmd, 'sync')}
                className="absolute top-2 left-2 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                title="کپی دستور"
              >
                {copiedCmd === 'sync' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Step 2: Debug APK */}
            <div className="bg-slate-900 text-slate-100 rounded-xl p-3 font-mono text-xs relative group">
              <div className="text-slate-400 mb-1">// ۲. ساخت APK دیباگ جهت تست و نصب مستقیم در گوشی:</div>
              <pre className="text-emerald-300 overflow-x-auto">{debugApkCmd}</pre>
              <p className="text-slate-400 text-[11px] mt-1.5">
                مسیر خروجی: android/app/build/outputs/apk/debug/app-debug.apk
              </p>
              <button
                onClick={() => handleCopy(debugApkCmd, 'debug')}
                className="absolute top-2 left-2 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                title="کپی دستور"
              >
                {copiedCmd === 'debug' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Step 3: Release AAB for Google Play */}
            <div className="bg-slate-900 text-slate-100 rounded-xl p-3 font-mono text-xs relative group">
              <div className="text-slate-400 mb-1">// ۳. ساخت بسته انتشار AAB (Android App Bundle) برای Google Play:</div>
              <pre className="text-emerald-300 overflow-x-auto">{releaseAabCmd}</pre>
              <p className="text-slate-400 text-[11px] mt-1.5">
                مسیر خروجی: android/app/build/outputs/bundle/release/app-release.aab
              </p>
              <button
                onClick={() => handleCopy(releaseAabCmd, 'aab')}
                className="absolute top-2 left-2 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                title="کپی دستور"
              >
                {copiedCmd === 'aab' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Step 4: Release APK */}
            <div className="bg-slate-900 text-slate-100 rounded-xl p-3 font-mono text-xs relative group">
              <div className="text-slate-400 mb-1">// ۴. ساخت APK نهایی (Release APK) برای نصب عمومی:</div>
              <pre className="text-emerald-300 overflow-x-auto">{releaseApkCmd}</pre>
              <p className="text-slate-400 text-[11px] mt-1.5">
                مسیر خروجی: android/app/build/outputs/apk/release/app-release-unsigned.apk
              </p>
              <button
                onClick={() => handleCopy(releaseApkCmd, 'apk')}
                className="absolute top-2 left-2 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                title="کپی دستور"
              >
                {copiedCmd === 'apk' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Keystore Signing Security Guide */}
          <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-2.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <FileCode className="w-4 h-4 text-emerald-700" />
              <span>ایجاد کلید اختصاصی امضای Release (بدون اطلاعات محرمانه هاردکد شده)</span>
            </div>
            <p className="text-xs text-slate-600">
              هیچ رمز عبور یا کلید خصوصی نباید درون مخزن یا کدها قرار گیرد. برای تولید فایل Keystore اختصاصی خود:
            </p>
            <div className="bg-slate-900 text-slate-100 rounded-xl p-2.5 font-mono text-xs relative">
              <pre className="text-amber-300 overflow-x-auto">{keystoreCmd}</pre>
              <button
                onClick={() => handleCopy(keystoreCmd, 'keytool')}
                className="absolute top-2 left-2 p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300"
                title="کپی دستور"
              >
                {copiedCmd === 'keytool' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
            <p className="text-xs text-slate-500">
              راهنمای کامل در فایل <code>RELEASE_SIGNING_GUIDE_FA.md</code> در ریشه پروژه قرار دارد.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            سازگار با Android Studio 2024+
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-800 hover:bg-emerald-900 text-white transition-colors shadow-sm"
          >
            متوجه شدم
          </button>
        </div>
      </div>
    </div>
  );
};
