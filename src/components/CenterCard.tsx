import React, { useState } from 'react';
import {
  Phone,
  Copy,
  Check,
  Navigation,
  Share2,
  MapPin,
  Building2,
  UserCheck,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Activity,
  Pill,
  TestTubes,
  Eye,
  Smile,
  ScanLine
} from 'lucide-react';
import { MedicalCenter } from '../types/center';

interface CenterCardProps {
  center: MedicalCenter;
}

export const CenterCard: React.FC<CenterCardProps> = ({ center }) => {
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [sharedFeedback, setSharedFeedback] = useState(false);

  // انتخاب آیکون و رنگ بر اساس نوع مرکز
  const getTypeBadge = (type: string) => {
    if (type.includes('بیمارستان')) {
      return {
        icon: Building2,
        color: 'bg-rose-50 text-rose-800 border-rose-200'
      };
    }
    if (type.includes('آزمایشگاه')) {
      return {
        icon: TestTubes,
        color: 'bg-indigo-50 text-indigo-800 border-indigo-200'
      };
    }
    if (type.includes('داروخانه')) {
      return {
        icon: Pill,
        color: 'bg-emerald-50 text-emerald-800 border-emerald-200'
      };
    }
    if (type.includes('دندانپزشکی')) {
      return {
        icon: Smile,
        color: 'bg-cyan-50 text-cyan-800 border-cyan-200'
      };
    }
    if (type.includes('تصویربرداری') || type.includes('رادیولوژی') || type.includes('ام‌آر‌آی')) {
      return {
        icon: ScanLine,
        color: 'bg-purple-50 text-purple-800 border-purple-200'
      };
    }
    if (type.includes('فیزیوتراپی')) {
      return {
        icon: Activity,
        color: 'bg-amber-50 text-amber-800 border-amber-200'
      };
    }
    if (type.includes('چشم')) {
      return {
        icon: Eye,
        color: 'bg-teal-50 text-teal-800 border-teal-200'
      };
    }
    return {
      icon: Building2,
      color: 'bg-slate-50 text-slate-700 border-slate-200'
    };
  };

  const badgeConfig = getTypeBadge(center.centerType);
  const TypeIcon = badgeConfig.icon;

  // کپی شماره تلفن به کلیپ‌بورد
  const handleCopyPhone = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!center.phone || center.phone === 'ثبت نشده') return;
    navigator.clipboard.writeText(center.phone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  // کپی آدرس کامل
  const handleCopyAddress = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!center.address || center.address === 'ثبت نشده') return;
    navigator.clipboard.writeText(center.address);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  // ایجاد لینک Google Maps برای مسیریابی
  const getMapsUrl = () => {
    const query = `${center.centerName} ${center.city} ${center.address}`;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  };

  // اشتراک‌گذاری مشخصات مرکز در شبکه‌های اجتماعی یا کپی متن
  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareText = `🏥 مرکز درمانی طرف قرارداد بیمه نوین:
📌 نام مرکز: ${center.centerName}
🏷️ کد مرکز: ${center.mcId}
🏥 نوع مرکز: ${center.centerType}
📍 شهر: ${center.city} (${center.province})
📞 تلفن: ${center.phone}
${center.doctorName ? `👨‍⚕️ نام پزشک/مسئول فنی: ${center.doctorName}\n` : ''}✅ معرفی‌نامه آنلاین: ${center.onlineLetter ? 'دارد' : 'ندارد'}
🏢 نشانی: ${center.address}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `مرکز ${center.centerName} - بیمه نوین`,
          text: shareText,
          url: window.location.href,
        });
      } catch {
        // کاربر کنسل کرد
      }
    } else {
      // فال‌بک: کپی در کلیپ‌بورد
      navigator.clipboard.writeText(shareText);
      setSharedFeedback(true);
      setTimeout(() => setSharedFeedback(false), 2000);
    }
  };

  return (
    <article className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-200 p-4 sm:p-5 flex flex-col justify-between group hover:border-rose-300">
      <div>
        {/* Top Badges Row */}
        <div className="flex items-center justify-between gap-2 mb-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* نوع مرکز */}
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${badgeConfig.color}`}>
              <TypeIcon className="w-3.5 h-3.5" />
              <span>{center.centerType}</span>
            </span>

            {/* کد مرکز */}
            <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200" title="کد یکتای مرکز در بیمه نوین (MCId)">
              کد: {center.mcId}
            </span>
          </div>

          {/* وضعیت معرفی‌نامه آنلاین */}
          <div>
            {center.onlineLetter ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>معرفی‌نامه آنلاین: دارد</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
                <XCircle className="w-3 h-3 text-slate-400" />
                <span>معرفی‌نامه آنلاین: ندارد</span>
              </span>
            )}
          </div>
        </div>

        {/* Center Name */}
        <h2 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-rose-950 transition-colors leading-snug mb-2">
          {center.centerName}
        </h2>

        {/* Doctor / Specialist Name (only if present in dataset) */}
        {center.doctorName && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-900 bg-rose-50/70 border border-rose-100 px-2.5 py-1 rounded-lg mb-2.5 w-fit">
            <UserCheck className="w-3.5 h-3.5 text-rose-700 flex-shrink-0" />
            <span>پزشک / مسئول فنی: {center.doctorName}</span>
          </div>
        )}

        {/* Specialty or service details */}
        {center.specialty && (
          <p className="text-xs text-slate-500 mb-3 line-clamp-2 leading-relaxed">
            {center.specialty}
          </p>
        )}

        {/* Location & Address Section */}
        <div className="space-y-1.5 mb-4 text-xs sm:text-sm text-slate-600">
          <div className="flex items-center gap-1.5 font-semibold text-slate-700">
            <MapPin className="w-3.5 h-3.5 text-rose-800 flex-shrink-0" />
            <span>{center.province} • {center.city}</span>
          </div>

          <div className="flex items-start justify-between gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs text-slate-600">
            <p className="leading-relaxed flex-1 select-text">
              {center.address}
            </p>
            <button
              onClick={handleCopyAddress}
              className="flex-shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
              title="کپی آدرس"
            >
              {copiedAddress ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
        {/* Phone & Direct Call */}
        <div className="flex items-center gap-1.5 flex-1">
          {center.phone && center.phone !== 'ثبت نشده' ? (
            <>
              <a
                href={`tel:${center.phone}`}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold bg-rose-900 hover:bg-rose-950 active:scale-95 text-white transition-all shadow-sm"
                title="تماس مستقیم با مرکز"
              >
                <Phone className="w-3.5 h-3.5 text-rose-200" />
                <span dir="ltr">{center.phone}</span>
                <span className="text-[11px] font-normal text-rose-200 mr-1">(تماس)</span>
              </a>

              <button
                onClick={handleCopyPhone}
                className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 active:scale-95 transition-all"
                title="کپی شماره تلفن"
              >
                {copiedPhone ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </>
          ) : (
            <span className="text-xs text-slate-400 py-1.5">شماره تلفن ثبت نشده</span>
          )}
        </div>

        {/* Google Maps & Share */}
        <div className="flex items-center gap-1.5 justify-end">
          <a
            href={getMapsUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1 px-2.5 py-2 rounded-xl text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors"
            title="مسیریابی با نقشه گوگل (Google Maps)"
          >
            <Navigation className="w-3.5 h-3.5 text-emerald-700" />
            <span>مسیریابی</span>
            <ExternalLink className="w-3 h-3 opacity-60 mr-0.5" />
          </a>

          <button
            onClick={handleShare}
            className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 active:scale-95 transition-all"
            title="اشتراک‌گذاری اطلاعات مرکز"
          >
            {sharedFeedback ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <Share2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </article>
  );
};
