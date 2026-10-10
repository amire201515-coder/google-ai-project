import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Download,
  RotateCcw,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Info,
  Trash2,
  PlusCircle,
  FileText,
  AlertCircle,
  Check,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { MedicalCenter, ImportResult } from '../types/center';
import { importCSVFile, importExcelFile } from '../utils/fileImporter';
import { exportToCSV, getSampleCSVTemplate } from '../utils/csvParser';

interface UpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCenters: MedicalCenter[];
  onReplaceAll: (newCenters: MedicalCenter[]) => Promise<void>;
  onAppendNew: (newCenters: MedicalCenter[]) => Promise<void>;
  onDeleteImported: () => Promise<void>;
  lastUpdated: string | null;
}

export const UpdateModal: React.FC<UpdateModalProps> = ({
  isOpen,
  onClose,
  currentCenters,
  onReplaceAll,
  onAppendNew,
  onDeleteImported,
  lastUpdated,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [showErrorList, setShowErrorList] = useState(false);
  const [isConfirmReplaceOpen, setIsConfirmReplaceOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleProcessFile = async (file: File) => {
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    setImportResult(null);
    setIsConfirmReplaceOpen(false);

    try {
      const ext = file.name.split('.').pop()?.toLowerCase();
      let result: ImportResult;

      if (ext === 'xlsx' || ext === 'xls') {
        result = await importExcelFile(file);
      } else if (ext === 'csv' || file.type === 'text/csv' || file.type.includes('comma-separated')) {
        result = await importCSVFile(file);
      } else {
        // تلاش برای خواندن به عنوان CSV حتی اگر پسوند استاندارد نباشد
        result = await importCSVFile(file);
      }

      if (result.successCount === 0 && result.errorCount === 0) {
        setErrorMessage('هیچ داده‌ای در فایل شناسایی نشد. لطفاً از وجود اطلاعات در فایل اطمینان حاصل کنید.');
      } else {
        setImportResult(result);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'خطای ناشناخته در پردازش فایل';
      setErrorMessage(`خطا در باز کردن و پردازش فایل: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  // اقدام ۱: جایگزینی کامل اطلاعات
  const handleExecuteReplace = async () => {
    if (!importResult || importResult.centers.length === 0) return;
    setIsLoading(true);
    try {
      await onReplaceAll(importResult.centers);
      setSuccessMessage(`${importResult.successCount.toLocaleString('fa-IR')} مرکز با موفقیت جایگزین و ایندکس جستجو به‌روزرسانی شد.`);
      setIsConfirmReplaceOpen(false);
      setTimeout(() => {
        onClose();
        setImportResult(null);
        setSuccessMessage('');
      }, 1500);
    } catch (err: unknown) {
      setErrorMessage(`خطا در ذخیره‌سازی داده‌ها: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  // اقدام ۲: افزودن به اطلاعات قبلی
  const handleExecuteAppend = async () => {
    if (!importResult || importResult.centers.length === 0) return;
    setIsLoading(true);
    try {
      await onAppendNew(importResult.centers);
      setSuccessMessage(`${importResult.successCount.toLocaleString('fa-IR')} مرکز به لیست موجود افزوده شد و ایندکس جستجو بازسازی گردید.`);
      setTimeout(() => {
        onClose();
        setImportResult(null);
        setSuccessMessage('');
      }, 1500);
    } catch (err: unknown) {
      setErrorMessage(`خطا در افزودن داده‌ها: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  // اقدام ۳: حذف اطلاعات واردشده و بازنشانی
  const handleDeleteData = async () => {
    if (window.confirm('آیا مطمئن هستید که می‌خواهید تمام اطلاعات واردشده را حذف کرده و دیتابیس را به حالت اولیه بازنشانی کنید؟')) {
      setIsLoading(true);
      try {
        await onDeleteImported();
        setImportResult(null);
        setSuccessMessage('تمام داده‌های واردشده با موفقیت حذف شدند و اطلاعات به حالت اولیه بازگشت.');
        setTimeout(() => {
          setSuccessMessage('');
        }, 2000);
      } catch (err: unknown) {
        setErrorMessage(`خطا در حذف داده‌ها: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // دانلود قالب آماده
  const handleDownloadTemplate = () => {
    const template = getSampleCSVTemplate();
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'قالب_استاندارد_مراکز_بیمه_نوین.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // خروجی دیتای فعلی
  const handleExportCurrent = () => {
    const csvContent = exportToCSV(currentCenters);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `مراکز_درمانی_بیمه_نوین_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 sm:px-6 bg-gradient-to-l from-rose-950 via-rose-900 to-pink-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <FileSpreadsheet className="w-5 h-5 text-rose-200" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                به‌روزرسانی و مدیریت داده‌های مراکز (CSV و Excel)
              </h2>
              <p className="text-xs text-rose-200/80">
                پشتیبانی کامل از فایل‌های CSV (با UTF-8 و BOM) و فایل‌های اکسل (XLSX و XLS)
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
          {/* Status summary */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex items-center justify-between flex-wrap gap-2 text-xs sm:text-sm">
            <div>
              <span className="text-slate-500">تعداد کل مراکز فعال در دیتابیس: </span>
              <strong className="text-rose-900 font-bold text-base">{currentCenters.length.toLocaleString('fa-IR')} مرکز</strong>
            </div>
            {lastUpdated && (
              <div className="text-slate-500 text-xs">
                آخرین به‌روزرسانی: <span className="font-semibold text-slate-700">{lastUpdated}</span>
              </div>
            )}
          </div>

          {/* Quick Action buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              onClick={handleDownloadTemplate}
              type="button"
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100/70 text-rose-900 font-semibold text-xs transition-colors"
            >
              <Download className="w-4 h-4 text-rose-700" />
              <span>دانلود قالب استاندارد CSV</span>
            </button>

            <button
              onClick={handleExportCurrent}
              type="button"
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span>خروجی گرفتن از تمام {currentCenters.length.toLocaleString('fa-IR')} مرکز فعلی</span>
            </button>
          </div>

          {/* Drag and Drop Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-rose-600 bg-rose-50/70'
                : 'border-slate-300 hover:border-rose-500 hover:bg-slate-50/60'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleProcessFile(e.target.files[0]);
                }
              }}
            />
            <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-800 shadow-2xs">
              <Upload className="w-6 h-6" />
            </div>
            <p className="font-bold text-slate-800 text-sm mb-1">
              فایل CSV یا Excel جدید را اینجا بکشید یا برای انتخاب کلیک کنید
            </p>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              پشتیبانی کامل از فرمت‌های <strong>CSV (Comma/Semicolon)</strong>، <strong>XLSX</strong> و <strong>XLS</strong> بدون هیچ‌گونه محدودیت در تعداد ردیف‌ها (۱۹۵۸، ۳۰۰۰، ۵۰۰۰+ مرکز)
            </p>
          </div>

          {/* Loading Indicator */}
          {isLoading && (
            <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl flex items-center justify-center gap-3 text-rose-900 text-sm">
              <div className="w-5 h-5 border-2 border-rose-800 border-t-transparent rounded-full animate-spin" />
              <span>در حال پردازش، اعتبارسنجی و ذخیره‌سازی داده‌ها...</span>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-xl flex items-start gap-2 text-xs sm:text-sm">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-600 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl flex items-start gap-2 text-xs sm:text-sm">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Detailed Import Results Breakdown */}
          {importResult && (
            <div className="border border-slate-200 bg-slate-50/50 rounded-2xl p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm sm:text-base">
                  <FileText className="w-5 h-5 text-rose-800" />
                  <span>نتیجه بررسی فایل: {importResult.fileName}</span>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-slate-200 text-slate-700 font-mono uppercase">
                  {importResult.fileType}
                </span>
              </div>

              {/* Stats Counters Grid */}
              <div className="grid grid-cols-3 gap-2.5 text-center">
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-[11px] text-slate-500 block mb-1">کل ردیف‌های فایل</span>
                  <strong className="text-base sm:text-lg font-black text-slate-800 font-mono">
                    {importResult.totalRows.toLocaleString('fa-IR')}
                  </strong>
                </div>

                <div className="bg-emerald-50/80 p-3 rounded-xl border border-emerald-200 shadow-2xs">
                  <span className="text-[11px] text-emerald-700 block mb-1">رکوردهای موفق</span>
                  <strong className="text-base sm:text-lg font-black text-emerald-800 font-mono">
                    {importResult.successCount.toLocaleString('fa-IR')}
                  </strong>
                </div>

                <div className={`p-3 rounded-xl border shadow-2xs ${importResult.errorCount > 0 ? 'bg-red-50 border-red-200 text-red-800' : 'bg-slate-100/60 border-slate-200 text-slate-500'}`}>
                  <span className="text-[11px] block mb-1">رکوردهای ردشده</span>
                  <strong className="text-base sm:text-lg font-black font-mono">
                    {importResult.errorCount.toLocaleString('fa-IR')}
                  </strong>
                </div>
              </div>

              {/* Error list expansion if errors exist */}
              {importResult.errorCount > 0 && (
                <div className="border border-red-200 bg-red-50/40 rounded-xl p-3">
                  <button
                    type="button"
                    onClick={() => setShowErrorList(!showErrorList)}
                    className="flex items-center justify-between w-full text-xs font-bold text-red-800"
                  >
                    <div className="flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <span>مشاهده جزئیات {importResult.errorCount} ردیف ردشده</span>
                    </div>
                    {showErrorList ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {showErrorList && (
                    <div className="mt-2.5 max-h-36 overflow-y-auto space-y-1.5 text-xs text-red-700 pr-1">
                      {importResult.errors.map((err, idx) => (
                        <div key={idx} className="bg-white/80 p-2 rounded-lg border border-red-100 flex items-start gap-2">
                          <span className="font-mono font-bold text-red-900 bg-red-100 px-1.5 py-0.5 rounded text-[11px]">
                            ردیف {err.rowNumber}
                          </span>
                          <span>{err.reason}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Data Sample Preview */}
              {importResult.successCount > 0 && (
                <div>
                  <span className="text-xs font-semibold text-slate-600 block mb-2">
                    پیش‌نمایش داده‌های خوانده‌شده (۵ رکورد اول):
                  </span>
                  <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white max-h-44 text-xs">
                    <table className="w-full text-right">
                      <thead className="bg-slate-100 text-slate-700 sticky top-0">
                        <tr>
                          <th className="p-2 border-b">کد</th>
                          <th className="p-2 border-b">نام مرکز</th>
                          <th className="p-2 border-b">نوع</th>
                          <th className="p-2 border-b">شهر</th>
                          <th className="p-2 border-b">معرفی‌نامه</th>
                          <th className="p-2 border-b">تلفن</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-600">
                        {importResult.centers.slice(0, 5).map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-2 font-mono">{row.mcId}</td>
                            <td className="p-2 font-medium text-slate-900">{row.centerName}</td>
                            <td className="p-2">{row.centerType}</td>
                            <td className="p-2">{row.city}</td>
                            <td className="p-2">{row.onlineLetter ? 'دارد' : 'ندارد'}</td>
                            <td className="p-2 font-mono" dir="ltr">{row.phone}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Action Buttons: Replace vs Append */}
              {importResult.successCount > 0 && (
                <div className="pt-2 space-y-2">
                  {!isConfirmReplaceOpen ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setIsConfirmReplaceOpen(true)}
                        className="py-3 px-4 rounded-xl bg-rose-900 hover:bg-rose-950 text-white font-bold text-xs sm:text-sm shadow-sm transition-all active:scale-98 flex items-center justify-center gap-2"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>جایگزینی کامل اطلاعات ({importResult.successCount.toLocaleString('fa-IR')} مرکز)</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleExecuteAppend}
                        className="py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-sm transition-all active:scale-98 flex items-center justify-center gap-2"
                      >
                        <PlusCircle className="w-4 h-4" />
                        <span>افزودن به اطلاعات قبلی</span>
                      </button>
                    </div>
                  ) : (
                    /* Confirmation Dialog for Replace */
                    <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 space-y-3 animate-in fade-in duration-150">
                      <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                        <span>تأیید جایگزینی کامل اطلاعات</span>
                      </div>
                      <p className="text-xs text-amber-800 leading-relaxed">
                        با انتخاب این گزینه، تمامی {currentCenters.length.toLocaleString('fa-IR')} مرکز قبلی با <strong>{importResult.successCount.toLocaleString('fa-IR')} مرکز جدید</strong> جایگزین شده و ایندکس جستجو مجدداً از نو ساخته خواهد شد. آیا مطمئن هستید؟
                      </p>
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => setIsConfirmReplaceOpen(false)}
                          className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-100"
                        >
                          انصراف
                        </button>
                        <button
                          type="button"
                          onClick={handleExecuteReplace}
                          className="px-4 py-1.5 rounded-lg text-xs font-bold bg-rose-900 text-white hover:bg-rose-950 shadow-sm"
                        >
                          بله، جایگزین کن
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Supported columns guidelines */}
          <div className="bg-slate-50 rounded-2xl p-4 text-xs text-slate-600 space-y-2 border border-slate-200">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <Info className="w-4 h-4 text-rose-800" />
              <span>ستون‌های استاندارد پشتیبانی‌شده در فایل</span>
            </div>
            <p>
              سیستم به طور خودکار سرستون‌های زیر را به زبان فارسی یا انگلیسی شناسایی می‌کند:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 font-medium text-slate-700 pt-1">
              <span className="bg-white px-2 py-1 rounded border border-slate-200">کد مرکز</span>
              <span className="bg-white px-2 py-1 rounded border border-slate-200">نام مرکز</span>
              <span className="bg-white px-2 py-1 rounded border border-slate-200">نوع مرکز</span>
              <span className="bg-white px-2 py-1 rounded border border-slate-200">استان</span>
              <span className="bg-white px-2 py-1 rounded border border-slate-200">شهر</span>
              <span className="bg-white px-2 py-1 rounded border border-slate-200">آدرس</span>
              <span className="bg-white px-2 py-1 rounded border border-slate-200">تلفن</span>
              <span className="bg-white px-2 py-1 rounded border border-slate-200">معرفی نامه آنلاین</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between flex-wrap gap-2">
          <button
            type="button"
            onClick={handleDeleteData}
            className="inline-flex items-center gap-1.5 text-xs text-red-700 hover:text-red-900 hover:bg-red-50 px-3 py-1.5 rounded-xl border border-red-200 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>حذف اطلاعات واردشده و بازنشانی اولیه</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};
