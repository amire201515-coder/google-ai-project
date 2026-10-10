import React, { useState } from 'react';
import {
  X,
  User,
  Phone,
  Copy,
  Check,
  ShieldAlert,
  Sparkles,
  Info
} from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  const [copied1, setCopied1] = useState(false);
  const [copied2, setCopied2] = useState(false);

  if (!isOpen) return null;

  const phone1 = '09168275768';
  const phone2 = '09394723353';

  const handleCopy = (num: string, setFn: (val: boolean) => void) => {
    navigator.clipboard.writeText(num);
    setFn(true);
    setTimeout(() => setFn(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 sm:px-6 bg-gradient-to-l from-rose-950 via-rose-900 to-pink-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <Info className="w-5 h-5 text-rose-200" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                درباره برنامه و سازنده
              </h2>
              <p className="text-xs text-rose-200/80">
                جستجوی مراکز درمانی طرف قرارداد بیمه نوین
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-rose-200 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-sm">
          {/* Creator Profile Card */}
          <div className="bg-gradient-to-br from-rose-50 via-pink-50/40 to-slate-50 border border-rose-200/80 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-900 text-white flex items-center justify-center shadow-md">
                <User className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-semibold text-rose-700">توسعه‌دهنده و سازنده</span>
                <h3 className="text-lg font-black text-slate-900">
                  حمزه سواری
                </h3>
              </div>
            </div>

            {/* Phone Numbers List */}
            <div className="space-y-2 mt-3 pt-3 border-t border-rose-200/60">
              <span className="text-xs font-semibold text-slate-600 block">
                شماره‌های تماس سازنده:
              </span>

              {/* شماره ۱ */}
              <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-rose-200/70 shadow-2xs">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-rose-800" />
                  <span className="font-mono text-sm font-bold text-slate-800" dir="ltr">
                    {phone1}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <a
                    href={`tel:${phone1}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-900 text-white hover:bg-rose-950 transition-colors"
                  >
                    <span>تماس</span>
                  </a>
                  <button
                    onClick={() => handleCopy(phone1, setCopied1)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                    title="کپی شماره"
                  >
                    {copied1 ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* شماره ۲ */}
              <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-rose-200/70 shadow-2xs">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-rose-800" />
                  <span className="font-mono text-sm font-bold text-slate-800" dir="ltr">
                    {phone2}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <a
                    href={`tel:${phone2}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-900 text-white hover:bg-rose-950 transition-colors"
                  >
                    <span>تماس</span>
                  </a>
                  <button
                    onClick={() => handleCopy(phone2, setCopied2)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                    title="کپی شماره"
                  >
                    {copied2 ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Official Purpose and Description */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-slate-900 flex items-center gap-2 text-sm sm:text-base">
              <Sparkles className="w-4 h-4 text-rose-800" />
              <span>هدف و توضیحات رسمی برنامه</span>
            </h4>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs sm:text-sm text-slate-700 leading-relaxed space-y-3">
              <p>
                این برنامه صرفاً با هدف تسهیل و تسریع جستجوی مراکز درمانی طراحی و ساخته شده است.
              </p>
              <p>
                کاربر می‌تواند با جستجوی نام مرکز، نوع مرکز، شهر، آدرس، تلفن یا کد مرکز، اطلاعات مراکز درمانی موجود را به‌سرعت پیدا کند و در صورت نیاز از امکاناتی مانند تماس تلفنی و مسیریابی استفاده نماید.
              </p>
            </div>
          </div>

          {/* Legal Notice & Medical Disclaimer */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-900 space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-950">
              <ShieldAlert className="w-4 h-4 text-amber-700 flex-shrink-0" />
              <span>سلب مسئولیت و نکات قانونی</span>
            </div>
            <p className="leading-relaxed">
              این برنامه صرفاً یک ابزار جستجو و دسترسی سریع به اطلاعات مراکز درمانی است و هیچگونه خدمات درمانی، پزشکی، تشخیصی یا مشاوره پزشکی ارائه نمی‌کند.
            </p>
            <p className="leading-relaxed text-amber-800">
              اطلاعات مراکز بر اساس داده‌های موجود در برنامه نمایش داده می‌شوند و استفاده از اطلاعات و خدمات هر مرکز بر عهده کاربر است.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            نسخه برنامه: ۱.۰.۰ (تولید استاندارد)
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-rose-900 hover:bg-rose-950 text-white transition-colors shadow-sm"
          >
            متوجه شدم
          </button>
        </div>
      </div>
    </div>
  );
};
