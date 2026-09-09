import React from 'react';
import { ShieldCheck, Percent, Zap, CheckCircle2 } from 'lucide-react';
import { SiteSettings } from '../types.ts';

export const CommissionBanner: React.FC<{ onOpenAbout?: () => void; siteSettings?: SiteSettings }> = ({ onOpenAbout, siteSettings }) => {
  const commissionBadge = siteSettings?.commissionBadge || '0% عمولة من المستأجر';
  const listingFeeText = siteSettings?.listingFeeText ? `${siteSettings.listingFeeText} (يدفعها المُعلن / المؤجِّر)` : '30 جنيه فقط لعرض عقارك (يدفعها المُعلن / المؤجِّر)';

  return (
    <div className="w-full bg-[#17140F] text-[#FAF7F1] py-3.5 px-4 sm:px-8 border-y border-[#3D3425] shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-right">
        
        {/* Main Banner Message */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
          <div className="flex items-center gap-1.5 bg-[#C9A15E] text-[#17140F] font-bold text-xs sm:text-sm px-3 py-1 rounded-full shadow-xs">
            <Percent className="w-4 h-4" />
            <span>{commissionBadge}</span>
          </div>

          <span className="hidden sm:inline text-[#C9A15E] font-bold text-lg">•</span>

          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#FAF7F1]">
            <Zap className="w-4 h-4 text-[#C9A15E]" />
            <span>{listingFeeText}</span>
          </div>
        </div>

        {/* Value Proposition Points */}
        <div className="flex items-center gap-4 text-xs text-[#E4DDD0]/80">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#C9A15E]" />
            بدون أي مصاريف خفية
          </span>
          <span className="hidden sm:flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C9A15E]" />
            تواصل مباشر مع المالك
          </span>
          {onOpenAbout && (
            <button
              onClick={onOpenAbout}
              className="text-[#C9A15E] underline hover:text-white transition-colors cursor-pointer"
            >
              كيف نعمل؟
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
