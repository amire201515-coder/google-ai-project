import React from 'react';
import { Shield, RefreshCw, Info, Smartphone, Building, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  totalCenters: number;
  onlineCount: number;
  lastUpdated: string | null;
  onOpenUpdate: () => void;
  onOpenAbout: () => void;
  onOpenAndroidGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  totalCenters,
  onlineCount,
  lastUpdated,
  onOpenUpdate,
  onOpenAbout,
  onOpenAndroidGuide,
}) => {
  return (
    <header className="bg-gradient-to-l from-rose-950 via-rose-900 to-pink-900 text-white shadow-xl border-b border-rose-800/40 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-3 sm:py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Logo and Titles */}
          <div className="flex items-center gap-3.5">
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-rose-600 to-pink-500 flex items-center justify-center shadow-lg shadow-rose-950/40 ring-2 ring-white/20">
                <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                <span className="absolute -bottom-1 -left-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-rose-900 flex items-center justify-center text-[10px] font-bold text-white shadow">
                  +
                </span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-2xl font-black tracking-tight text-white">
                  جستجوی مراکز بیمه نوین
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-800/80 text-rose-200 border border-rose-700/60">
                  طرف قرارداد
                </span>
              </div>
              <p className="text-xs sm:text-sm text-rose-200/80 mt-0.5 line-clamp-1">
                سامانه هوشمند و دسترسی سریع به اطلاعات مراکز درمانی و بیمارستان‌ها
              </p>
            </div>
          </div>

          {/* Quick Stats and Action Buttons */}
          <div className="flex items-center justify-between md:justify-end gap-2 flex-wrap">
            <div className="hidden lg:flex items-center gap-3 bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/10 text-xs">
              <div className="flex items-center gap-1.5 text-rose-200">
                <Building className="w-3.5 h-3.5" />
                <span>کل مراکز: <strong className="text-white">{totalCenters}</strong></span>
              </div>
              <span className="text-rose-500">•</span>
              <div className="flex items-center gap-1.5 text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>معرفی‌نامه آنلاین: <strong className="text-white">{onlineCount}</strong></span>
              </div>
              {lastUpdated && (
                <>
                  <span className="text-rose-500">•</span>
                  <span className="text-rose-200/70 text-[11px]">به‌روزرسانی: {lastUpdated}</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={onOpenUpdate}
                type="button"
                className="flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium bg-white/10 hover:bg-white/20 active:scale-95 transition-all border border-white/15 text-white"
                title="به‌روزرسانی داده‌ها از فایل CSV"
              >
                <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-pink-300" />
                <span>به‌روزرسانی CSV</span>
              </button>

              <button
                onClick={onOpenAndroidGuide}
                type="button"
                className="flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-200 border border-emerald-500/30 active:scale-95 transition-all"
                title="راهنمای ساخت نسخه Android (APK / AAB)"
              >
                <Smartphone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-300" />
                <span className="hidden xs:inline">نسخه اندروید</span>
                <span className="xs:hidden">اندروید</span>
              </button>

              <button
                onClick={onOpenAbout}
                type="button"
                className="flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium bg-rose-800/70 hover:bg-rose-700/80 text-rose-100 border border-rose-600/40 active:scale-95 transition-all"
                title="درباره سازنده و برنامه"
              >
                <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-300" />
                <span>درباره سازنده</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
