import React, { useMemo } from 'react';
import { Search, X, Filter, MapPin, Building2, CheckCircle2, RotateCcw, Download } from 'lucide-react';
import { MedicalCenter, SearchFilters } from '../types/center';

interface SearchAndFiltersProps {
  centers: MedicalCenter[];
  filters: SearchFilters;
  onFilterChange: (filters: SearchFilters) => void;
  filteredCount: number;
  totalCount: number;
  onExportFiltered: () => void;
}

export const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
  centers,
  filters,
  onFilterChange,
  filteredCount,
  totalCount,
  onExportFiltered,
}) => {
  // استخراج لیست یکتای استان‌ها
  const provinces = useMemo(() => {
    const list = Array.from(new Set(centers.map(c => c.province).filter(Boolean)));
    return list.sort((a, b) => a.localeCompare(b, 'fa'));
  }, [centers]);

  // استخراج لیست شهرهای متناسب با استان انتخاب شده
  const cities = useMemo(() => {
    const source = filters.province
      ? centers.filter(c => c.province === filters.province)
      : centers;
    const list = Array.from(new Set(source.map(c => c.city).filter(Boolean)));
    return list.sort((a, b) => a.localeCompare(b, 'fa'));
  }, [centers, filters.province]);

  // استخراج انواع مراکز
  const centerTypes = useMemo(() => {
    const list = Array.from(new Set(centers.map(c => c.centerType).filter(Boolean)));
    return list.sort((a, b) => a.localeCompare(b, 'fa'));
  }, [centers]);

  const hasActiveFilters = Boolean(
    filters.query ||
    filters.province ||
    filters.city ||
    filters.centerType ||
    filters.onlyOnlineLetter
  );

  const handleResetFilters = () => {
    onFilterChange({
      query: '',
      province: '',
      city: '',
      centerType: '',
      onlyOnlineLetter: false,
    });
  };

  // گزینه‌های پرتکرار نوع مرکز برای دسترسی سریع با یک کلیک
  const popularTypes = ['همه', 'بیمارستان', 'درمانگاه', 'آزمایشگاه', 'داروخانه', 'دندانپزشکی', 'تصویربرداری / رادیولوژی', 'فیزیوتراپی'];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4 sm:p-5 mb-6">
      {/* Search Input - Primary Hero Section */}
      <div className="relative mb-4">
        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-rose-800">
          <Search className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <input
          type="text"
          value={filters.query}
          onChange={(e) => onFilterChange({ ...filters, query: e.target.value })}
          placeholder="جستجو بر اساس نام مرکز، نام پزشک، نوع مرکز، شهر، آدرس، تلفن یا کد..."
          className="w-full pr-11 pl-10 py-3 sm:py-3.5 text-sm sm:text-base bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-700/30 focus:border-rose-700 transition-all placeholder:text-slate-400 text-slate-800 font-medium"
        />
        {filters.query && (
          <button
            onClick={() => onFilterChange({ ...filters, query: '' })}
            className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
            title="پاک کردن متن جستجو"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Quick Type Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-3 border-b border-slate-100 no-scrollbar">
        <span className="text-xs font-semibold text-slate-500 flex-shrink-0 ml-1">
          دسترسی سریع:
        </span>
        {popularTypes.map((type) => {
          const isSelected =
            (type === 'همه' && !filters.centerType) ||
            filters.centerType === type;
          return (
            <button
              key={type}
              type="button"
              onClick={() => {
                onFilterChange({
                  ...filters,
                  centerType: type === 'همه' ? '' : type,
                });
              }}
              className={`text-xs px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                isSelected
                  ? 'bg-rose-900 text-white shadow-sm ring-2 ring-rose-900/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              {type}
            </button>
          );
        })}
      </div>

      {/* Dropdown Filters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* فیلتر استان */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-rose-800" />
            <span>استان</span>
          </label>
          <select
            value={filters.province}
            onChange={(e) => {
              onFilterChange({
                ...filters,
                province: e.target.value,
                city: '', // ریست کردن شهر در صورت تغییر استان
              });
            }}
            className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-700/20 focus:border-rose-700 text-slate-700 transition-all font-medium"
          >
            <option value="">همه استان‌ها ({provinces.length})</option>
            {provinces.map((prov) => (
              <option key={prov} value={prov}>
                {prov}
              </option>
            ))}
          </select>
        </div>

        {/* فیلتر شهر */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-rose-800" />
            <span>شهر</span>
          </label>
          <select
            value={filters.city}
            onChange={(e) => onFilterChange({ ...filters, city: e.target.value })}
            className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-700/20 focus:border-rose-700 text-slate-700 transition-all font-medium"
          >
            <option value="">همه شهرها ({cities.length})</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        {/* فیلتر نوع مرکز */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-rose-800" />
            <span>نوع مرکز درمانی</span>
          </label>
          <select
            value={filters.centerType}
            onChange={(e) => onFilterChange({ ...filters, centerType: e.target.value })}
            className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-700/20 focus:border-rose-700 text-slate-700 transition-all font-medium"
          >
            <option value="">همه انواع مراکز ({centerTypes.length})</option>
            {centerTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* فیلتر سوئیچ معرفی‌نامه آنلاین */}
        <div className="flex flex-col justify-end">
          <label
            onClick={() => onFilterChange({ ...filters, onlyOnlineLetter: !filters.onlyOnlineLetter })}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 border rounded-xl cursor-pointer transition-all select-none ${
              filters.onlyOnlineLetter
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900 ring-2 ring-emerald-500/20'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100/70'
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2
                className={`w-4 h-4 ${
                  filters.onlyOnlineLetter ? 'text-emerald-600' : 'text-slate-400'
                }`}
              />
              <span className="text-xs sm:text-sm font-semibold">
                معرفی‌نامه آنلاین
              </span>
            </div>
            <div
              className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                filters.onlyOnlineLetter ? 'bg-emerald-600' : 'bg-slate-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  filters.onlyOnlineLetter ? '-translate-x-4' : 'translate-x-0'
                }`}
              />
            </div>
          </label>
        </div>
      </div>

      {/* Result Counter & Active Filters Summary */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2 text-xs sm:text-sm">
        <div className="flex items-center gap-2 flex-wrap text-slate-600">
          <span className="font-semibold text-rose-900 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
            {filteredCount} مرکز یافت شد
          </span>
          {filteredCount !== totalCount && (
            <span className="text-slate-400">
              (از مجموع {totalCount} مرکز)
            </span>
          )}

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-xs text-rose-700 hover:text-rose-900 hover:bg-rose-50 px-2 py-1 rounded-md transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>حذف همه فیلترها</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {filteredCount > 0 && (
            <button
              onClick={onExportFiltered}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
              title="دریافت فایل اکسل/CSV از نتایج جستجوی فعلی"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>خروجی CSV نتایج ({filteredCount})</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
