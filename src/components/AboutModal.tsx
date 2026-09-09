import React from 'react';
import { X, CheckCircle2, ShieldCheck, Sparkles, Phone, MessageCircle } from 'lucide-react';
import { SiteSettings } from '../types.ts';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  siteSettings?: SiteSettings;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose, siteSettings }) => {
  if (!isOpen) return null;

  const siteName = siteSettings?.siteName || 'أركان للتسويق العقاري';
  const siteSlogan = siteSettings?.siteSlogan || 'غيّرنا شكل السمسرة';
  const logoUrl = siteSettings?.logoUrl || '/logo.png';
  const logoLetter = siteSettings?.logoLetter || 'A';
  const commissionBadge = siteSettings?.commissionBadge || '0% عمولة على المستأجر';
  const listingFeeText = siteSettings?.listingFeeText || '30 جنيه فقط للمُعلن';
  const phone = siteSettings?.contactPhone || '01550454849';
  const whatsappNumber = siteSettings?.whatsappNumber || '201550454849';
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(siteSettings?.whatsappWelcomeMsg || 'مرحباً، أود الاستفسار بخصوص منصة أركان العقارية')}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#E4DDD0] overflow-hidden">
        
        {/* Top Banner */}
        <div className="bg-[#17140F] text-[#FAF7F1] p-6 relative border-b border-[#3D3425]">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 text-[#FAF7F1]/70 hover:text-white p-1 rounded-xl cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#2A241B] border border-[#C9A15E] flex items-center justify-center font-bold text-[#C9A15E] text-lg overflow-hidden">
              <img
                src={logoUrl}
                alt={siteName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <span>{logoLetter}</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#FAF7F1]">
                {siteName}
              </h2>
              <p className="text-xs text-[#C9A15E] font-medium">
                {siteSlogan}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-6 text-[#1B1712]">
          
          {/* Pitch */}
          <div>
            <h3 className="text-lg font-bold text-[#1B1712] mb-2">
              لماذا أسسنا "{siteName}"؟
            </h3>
            <p className="text-sm text-[#6B6255] leading-relaxed">
              تأسست <strong>{siteName}</strong> كأول منصة رقمية متخصصة تجمع بين السكن الطلابي لجامعة سيناء بالعريش وسوق العقارات المحلي في البلد. هدفنا التخلص تمامًا من أسلوب السمسرة التقليدي والعمولات الباهظة التي تثقل كاهل الطلاب والأهالي.
            </p>
          </div>

          {/* Model Points */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#FAF7F1] p-4 rounded-2xl border border-[#E4DDD0]">
              <div className="flex items-center gap-2 font-bold text-sm text-[#1B1712] mb-1">
                <span className="w-6 h-6 rounded-full bg-[#C9A15E] text-[#17140F] flex items-center justify-center text-xs font-bold">
                  0%
                </span>
                <span>{commissionBadge}</span>
              </div>
              <p className="text-xs text-[#6B6255] leading-relaxed">
                لا يدفع الطالب أو المستأجر أي عمولة أو مصاريف خفية، السعر المعروض هو السعر الفعلي للإيجار.
              </p>
            </div>

            <div className="bg-[#FAF7F1] p-4 rounded-2xl border border-[#E4DDD0]">
              <div className="flex items-center gap-2 font-bold text-sm text-[#1B1712] mb-1">
                <span className="w-6 h-6 rounded-full bg-[#17140F] text-[#C9A15E] flex items-center justify-center text-xs font-bold">
                  🏷️
                </span>
                <span>{listingFeeText}</span>
              </div>
              <p className="text-xs text-[#6B6255] leading-relaxed">
                يدفع صاحب العقار رسوم رمزية قدرها {listingFeeText} فقط لنشر إعلانه والوصول لآلاف الطلاب والمستأجرين.
              </p>
            </div>
          </div>

          {/* Direct Contact Info */}
          <div className="bg-[#FAF3E5] p-5 rounded-2xl border border-[#E8DCBF] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-[#A67C3D] block mb-0.5">
                تواصل معنا أو اعرض شقتك الآن
              </span>
              <a
                href={`tel:${phone}`}
                className="text-base font-bold text-[#1B1712] hover:text-[#A67C3D] flex items-center gap-1.5"
              >
                <Phone className="w-4 h-4 text-[#C9A15E]" />
                <span dir="ltr">{phone}</span>
              </a>
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-xs cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>محادثة واتساب مباشرة</span>
            </a>
          </div>

          <div className="pt-2 text-center">
            <button
              onClick={onClose}
              className="bg-[#17140F] text-[#FAF7F1] px-6 py-2.5 rounded-xl text-xs font-semibold cursor-pointer"
            >
              فهمت، إغلاق
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
