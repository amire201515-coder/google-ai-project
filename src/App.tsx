import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { MedicalCenter, SearchFilters } from './types/center';
import {
  getStoredCenters,
  saveStoredCenters,
  appendStoredCenters,
  resetToDefaults,
  getLastUpdatedDate,
  getStorageStats
} from './utils/storage';
import { normalizePersian } from './utils/textNormalizer';
import { exportToCSV } from './utils/csvParser';
import { Header } from './components/Header';
import { SearchAndFilters } from './components/SearchAndFilters';
import { CenterCard } from './components/CenterCard';
import { UpdateModal } from './components/UpdateModal';
import { AboutModal } from './components/AboutModal';
import { AndroidGuideModal } from './components/AndroidGuideModal';
import {
  Building2,
  Phone,
  ShieldCheck,
  ChevronDown,
  Info,
  Smartphone,
  Sparkles,
  ArrowUp,
  Database,
  Eye,
  CheckCircle2
} from 'lucide-react';

export default function App() {
  const [centers, setCenters] = useState<MedicalCenter[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Modals state
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isAndroidModalOpen, setIsAndroidModalOpen] = useState(false);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Display pagination / dynamic windowing for 60fps performance
  const [pageSize, setPageSize] = useState<number>(60);
  const [visibleCount, setVisibleCount] = useState<number>(60);
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);

  // Filters state
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    province: '',
    city: '',
    centerType: '',
    onlyOnlineLetter: false,
  });

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  }, []);

  // بارگذاری داده‌ها از دیتابیس دائمی IndexedDB
  const loadData = useCallback(async () => {
    setIsInitializing(true);
    try {
      const loaded = await getStoredCenters();
      setCenters(loaded);
      const updatedDate = await getLastUpdatedDate();
      setLastUpdated(updatedDate);
    } catch (err) {
      console.error('Error loading centers:', err);
    } finally {
      setIsInitializing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // مدیریت دکمه بازگشت به بالا در اسکرول
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ریست کردن تعداد موارد قابل مشاهده در تغییر فیلترها
  useEffect(() => {
    setVisibleCount(pageSize);
  }, [filters, pageSize]);

  // فیلتر کردن و جستجوی تمام رکوردهای واردشده بدون هیچ محدودیتی
  const filteredCenters = useMemo(() => {
    const normalizedQuery = normalizePersian(filters.query);
    const queryTokens = normalizedQuery.split(' ').filter(Boolean);

    return centers.filter((center) => {
      // فیلتر استان
      if (filters.province && center.province !== filters.province) {
        return false;
      }

      // فیلتر شهر
      if (filters.city && center.city !== filters.city) {
        return false;
      }

      // فیلتر نوع مرکز
      if (filters.centerType && center.centerType !== filters.centerType) {
        return false;
      }

      // فیلتر معرفی‌نامه آنلاین
      if (filters.onlyOnlineLetter && !center.onlineLetter) {
        return false;
      }

      // اگر عبارت متنی جستجو خالی است، شرط برقرار است
      if (queryTokens.length === 0) {
        return true;
      }

      // استفاده از ایندکس جستجوی از پیش ساخته‌شده برای سرعت فوق‌العاده
      const indexText = center._searchIndex || '';
      return queryTokens.every((token) => indexText.includes(token));
    });
  }, [centers, filters]);

  // محاسبه آمار کلی
  const stats = useMemo(() => getStorageStats(centers), [centers]);

  // اقدام ۱: جایگزینی کامل اطلاعات
  const handleReplaceAll = async (newCenters: MedicalCenter[]) => {
    await saveStoredCenters(newCenters);
    setCenters(newCenters);
    const updated = await getLastUpdatedDate();
    setLastUpdated(updated);
    setVisibleCount(pageSize);
    showToast(`✅ تمام ${newCenters.length.toLocaleString('fa-IR')} مرکز با موفقیت جایگزین و ذخیره شدند.`);
  };

  // اقدام ۲: افزودن به اطلاعات قبلی
  const handleAppendNew = async (newCenters: MedicalCenter[]) => {
    const merged = await appendStoredCenters(newCenters);
    setCenters(merged);
    const updated = await getLastUpdatedDate();
    setLastUpdated(updated);
    setVisibleCount(pageSize);
    showToast(`✅ ${newCenters.length.toLocaleString('fa-IR')} مرکز افزوده شد. مجموع مراکز: ${merged.length.toLocaleString('fa-IR')}`);
  };

  // اقدام ۳: حذف اطلاعات واردشده و بازنشانی
  const handleDeleteImported = async () => {
    const baseline = await resetToDefaults();
    setCenters(baseline);
    setLastUpdated(null);
    setVisibleCount(pageSize);
    showToast('اطلاعات واردشده حذف شد و دیتابیس به حالت اولیه بازگشت.');
  };

  // خروجی نتایج فیلتر شده به فایل CSV
  const handleExportFiltered = () => {
    const csvContent = exportToCSV(filteredCenters);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `نتایج_مراکز_بیمه_نوین_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShowAll = () => {
    setVisibleCount(filteredCenters.length);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-rose-100 selection:text-rose-950">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-white/20 text-xs sm:text-sm font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation Bar */}
      <Header
        totalCenters={stats.total}
        onlineCount={stats.onlineCount}
        lastUpdated={lastUpdated}
        onOpenUpdate={() => setIsUpdateModalOpen(true)}
        onOpenAbout={() => setIsAboutModalOpen(true)}
        onOpenAndroidGuide={() => setIsAndroidModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
        {/* Welcome Notice Banner */}
        <div className="mb-4 bg-gradient-to-l from-rose-900/5 via-pink-900/5 to-transparent border border-rose-200/60 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700">
            <Sparkles className="w-4 h-4 text-rose-700 flex-shrink-0" />
            <span>
              سامانه سریع جستجوی مراکز درمانی بیمه نوین • توسعه‌دهنده: <strong>حمزه سواری</strong>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-white/80 px-2.5 py-1 rounded-xl border border-slate-200">
              <Database className="w-3.5 h-3.5 text-rose-800" />
              <span>مراکز بارگذاری‌شده: <strong className="text-rose-900">{centers.length.toLocaleString('fa-IR')}</strong></span>
            </div>
            <button
              onClick={() => setIsAboutModalOpen(true)}
              className="text-xs text-rose-800 hover:text-rose-950 font-bold underline underline-offset-4 flex items-center gap-1"
            >
              <Info className="w-3.5 h-3.5" />
              <span>اهداف و سلب مسئولیت</span>
            </button>
          </div>
        </div>

        {/* Search & Dynamic Filters Section */}
        <SearchAndFilters
          centers={centers}
          filters={filters}
          onFilterChange={setFilters}
          filteredCount={filteredCenters.length}
          totalCount={centers.length}
          onExportFiltered={handleExportFiltered}
        />

        {/* Results Info & Display Controls */}
        {filteredCenters.length > 0 && (
          <div className="mb-4 bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between flex-wrap gap-2 text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <Eye className="w-4 h-4 text-slate-400" />
              <span>
                نمایش <strong>۱</strong> تا <strong>{Math.min(visibleCount, filteredCenters.length).toLocaleString('fa-IR')}</strong> از مجموع{' '}
                <strong className="text-rose-950 font-bold">{filteredCenters.length.toLocaleString('fa-IR')} مرکز یافته‌شده</strong>
              </span>
              <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-xs">
                (تمام {filteredCenters.length.toLocaleString('fa-IR')} مرکز در جستجو فعال هستند)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">تعداد در هر صفحه:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setPageSize(val);
                  setVisibleCount(val);
                }}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-rose-800"
              >
                <option value={30}>۳۰</option>
                <option value={60}>۶۰</option>
                <option value={120}>۱۲۰</option>
                <option value={300}>۳۰۰</option>
                <option value={1000}>۱,۰۰۰</option>
              </select>

              {filteredCenters.length > visibleCount && (
                <button
                  type="button"
                  onClick={handleShowAll}
                  className="text-xs font-bold text-rose-800 hover:text-rose-950 hover:bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 transition-colors"
                >
                  نمایش یکجای همه ({filteredCenters.length.toLocaleString('fa-IR')})
                </button>
              )}
            </div>
          </div>
        )}

        {/* Results Grid */}
        {isInitializing ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center my-6">
            <div className="w-10 h-10 border-4 border-rose-800 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">در حال بارگذاری و آماده‌سازی ایندکس مراکز درمانی...</p>
          </div>
        ) : filteredCenters.length > 0 ? (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {filteredCenters.slice(0, visibleCount).map((center) => (
                <CenterCard key={center.id || center.mcId} center={center} />
              ))}
            </div>

            {/* Load More Button */}
            {filteredCenters.length > visibleCount && (
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => prev + pageSize)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-rose-900 font-bold text-sm border border-slate-200 shadow-sm transition-all active:scale-95"
                >
                  <span>بارگذاری موارد بیشتر ({filteredCenters.length - visibleCount} مرکز دیگر)</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleShowAll}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-3.5 rounded-2xl bg-rose-900 hover:bg-rose-950 text-white font-bold text-sm shadow-sm transition-all active:scale-95"
                >
                  <span>نمایش همه {filteredCenters.length.toLocaleString('fa-IR')} مرکز</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center max-w-lg mx-auto shadow-sm my-6">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-800 flex items-center justify-center mx-auto mb-4 border border-rose-100">
              <Building2 className="w-8 h-8 text-rose-600" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-2">
              مرکزی با این مشخصات یافت نشد
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mb-5 leading-relaxed">
              عبارت جستجو شده را تغییر دهید یا فیلترهای شهر، استان یا نوع مرکز را بردارید تا همه {centers.length.toLocaleString('fa-IR')} مرکز نمایش داده شوند.
            </p>
            <button
              onClick={() =>
                setFilters({
                  query: '',
                  province: '',
                  city: '',
                  centerType: '',
                  onlyOnlineLetter: false,
                })
              }
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-900 text-white font-semibold text-xs sm:text-sm hover:bg-rose-950 transition-colors shadow-sm"
            >
              پاک کردن همه فیلترها و نمایش همه مراکز
            </button>
          </div>
        )}
      </main>

      {/* Floating Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 left-6 p-3 rounded-2xl bg-rose-900 hover:bg-rose-950 text-white shadow-lg transition-all active:scale-90 z-20 flex items-center justify-center border border-rose-700/50"
          title="بازگشت به ابتدای صفحه"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 sm:py-8 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1 justify-center md:justify-start">
                <ShieldCheck className="w-4 h-4 text-rose-800" />
                <span className="font-bold text-slate-800 text-sm">
                  جستجوی مراکز بیمه نوین
                </span>
              </div>
              <p className="text-slate-500 text-center md:text-right">
                سامانه تسهیل و تسریع جستجوی مراکز درمانی طرف قرارداد در سراسر کشور
              </p>
            </div>

            {/* Creator Credits */}
            <div className="text-center md:text-left bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <div className="font-semibold text-slate-700">
                سازنده: <strong className="text-slate-900">حمزه سواری</strong>
              </div>
              <div className="flex items-center justify-center md:justify-end gap-3 mt-1.5 font-mono text-xs">
                <a
                  href="tel:09168275768"
                  className="flex items-center gap-1 text-rose-800 hover:text-rose-950 font-bold"
                  dir="ltr"
                >
                  <Phone className="w-3 h-3" />
                  <span>09168275768</span>
                </a>
                <span className="text-slate-300">|</span>
                <a
                  href="tel:09394723353"
                  className="flex items-center gap-1 text-rose-800 hover:text-rose-950 font-bold"
                  dir="ltr"
                >
                  <Phone className="w-3 h-3" />
                  <span>09394723353</span>
                </a>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
            <p>
              این برنامه صرفاً ابزار جستجو است و هیچگونه خدمات درمانی، پزشکی، تشخیصی یا مشاوره ارائه نمی‌کند.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsAndroidModalOpen(true)}
                className="hover:text-emerald-700 transition-colors flex items-center gap-1"
              >
                <Smartphone className="w-3 h-3" />
                <span>نسخه اندروید (APK / AAB)</span>
              </button>
              <span>•</span>
              <button
                onClick={() => setIsAboutModalOpen(true)}
                className="hover:text-rose-700 transition-colors"
              >
                درباره سازنده
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <UpdateModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        currentCenters={centers}
        onReplaceAll={handleReplaceAll}
        onAppendNew={handleAppendNew}
        onDeleteImported={handleDeleteImported}
        lastUpdated={lastUpdated}
      />

      <AboutModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
      />

      <AndroidGuideModal
        isOpen={isAndroidModalOpen}
        onClose={() => setIsAndroidModalOpen(false)}
      />
    </div>
  );
}
