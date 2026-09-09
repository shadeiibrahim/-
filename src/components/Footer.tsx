import React from 'react';
import { Phone, MessageCircle, MapPin, ShieldCheck, Heart, Sparkles, ExternalLink } from 'lucide-react';
import { ListingCategory, SiteSettings } from '../types.ts';

interface FooterProps {
  onNavigateTab: (tab: 'STUDENT' | 'LOCAL') => void;
  onOpenFavorites: () => void;
  onOpenCompare: () => void;
  onOpenAbout: () => void;
  onOpenAdmin: () => void;
  siteSettings?: SiteSettings;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigateTab,
  onOpenFavorites,
  onOpenCompare,
  onOpenAbout,
  onOpenAdmin,
  siteSettings,
}) => {
  const footerClicksRef = React.useRef<number>(0);
  const footerTimerRef = React.useRef<any>(null);

  const siteName = siteSettings?.siteName || 'أركان للتسويق العقاري';
  const siteSlogan = siteSettings?.siteSlogan || 'غيّرنا شكل السمسرة';
  const logoUrl = siteSettings?.logoUrl || '/logo.png';
  const footerAboutText = siteSettings?.footerAboutText || 'المنصة المتخصصة الأولى لسكن طلاب جامعة سيناء بالعريش، وعقارات البلد للأهالي والسكان المحليين. تعامل مباشر وبدون وسيط.';
  const commissionBadge = siteSettings?.commissionBadge || '0% عمولة على المستأجر';
  const listingFeeText = siteSettings?.listingFeeText || '30 جنيه فقط للمعلن / المالك';
  const phone = siteSettings?.contactPhone || '01550454849';
  const whatsappNumber = siteSettings?.whatsappNumber || '201550454849';
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(siteSettings?.whatsappWelcomeMsg || 'مرحباً، أود الاستفسار بخصوص منصة أركان العقارية')}`;
  const facebookUrl = siteSettings?.facebookUrl || 'https://www.facebook.com/share/17e8UBzfbi/';
  const instagramUrl = siteSettings?.instagramUrl || 'https://www.instagram.com/arkan_real_estate?stkn=MWhqc21nbm1pZnZkMw==';
  const tiktokUrl = siteSettings?.tiktokUrl || 'https://www.tiktok.com/@arkan_real_estate?_r=1&_t=ZS-99YaNTroP3K';
  const copyrightText = siteSettings?.footerCopyrightText || `© ${new Date().getFullYear()} ${siteName}. جميع الحقوق محفوظة.`;
  const locationNote = siteSettings?.footerLocationNote || 'صُنع لخدمة طلاب جامعة سيناء وسكان شمال سيناء بالعريش';

  const handleSecretFooterClick = (e: React.MouseEvent) => {
    e.preventDefault();
    footerClicksRef.current += 1;
    if (footerClicksRef.current >= 5) {
      footerClicksRef.current = 0;
      onOpenAdmin();
      return;
    }

    if (footerTimerRef.current) clearTimeout(footerTimerRef.current);
    footerTimerRef.current = setTimeout(() => {
      footerClicksRef.current = 0;
    }, 2500);
  };
  return (
    <footer className="w-full bg-[#17140F] text-[#FAF7F1] border-t border-[#3D3425] mt-16 pt-12 pb-8 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10 pb-10 border-b border-[#2A241B]">
          
          {/* Col 1: Brand & Slogan */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2.5">
              <img
                src={logoUrl}
                alt={`شعار ${siteName}`}
                className="w-9 h-9 object-contain rounded-lg border border-[#C9A15E]"
              />
              <div>
                <span className="text-base font-bold text-[#FAF7F1] tracking-wide block">
                  {siteName}
                </span>
                <span className="text-xs text-[#C9A15E] font-medium block">
                  {siteSlogan}
                </span>
              </div>
            </div>
            <p className="text-xs text-[#E4DDD0]/70 leading-relaxed">
              {footerAboutText}
            </p>
            <div className="inline-flex items-center gap-1.5 bg-[#2A241B] text-[#C9A15E] px-3 py-1 rounded-full text-xs font-semibold border border-[#3D3425]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{commissionBadge}</span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div>
            <h3 className="text-xs font-bold text-[#C9A15E] tracking-wider uppercase mb-3">
              أقسام المنصة
            </h3>
            <ul className="space-y-2 text-xs text-[#E4DDD0]/80">
              <li>
                <button
                  onClick={() => onNavigateTab('STUDENT')}
                  className="hover:text-[#C9A15E] transition-colors cursor-pointer"
                >
                  🎓 سكن طلاب جامعة سيناء (المدينة الجديدة)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('LOCAL')}
                  className="hover:text-[#C9A15E] transition-colors cursor-pointer"
                >
                  🏡 عقارات البلد (عائلات، بيع، تجاري، أراضي)
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenFavorites}
                  className="hover:text-[#C9A15E] transition-colors cursor-pointer"
                >
                  ❤️ العقارات المحفوظة في المفضلة
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenCompare}
                  className="hover:text-[#C9A15E] transition-colors cursor-pointer"
                >
                  ⚖️ مقارنة الشقق والعقارات
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: About & How it Works */}
          <div>
            <h3 className="text-xs font-bold text-[#C9A15E] tracking-wider uppercase mb-3">
              عن المنصة ونموذج العمل
            </h3>
            <ul className="space-y-2 text-xs text-[#E4DDD0]/80">
              <li>
                <button
                  onClick={onOpenAbout}
                  className="hover:text-[#C9A15E] transition-colors cursor-pointer"
                >
                  💡 كيف تعمل منصة أركان؟
                </button>
              </li>
              <li>
                <span className="text-[#FAF7F1] font-semibold">
                  🏷️ {listingFeeText}
                </span>
              </li>
              <li>
                <span className="text-[#FAF7F1] font-semibold">
                  🚫 بدون أي عمولة أو مصاريف خفية
                </span>
              </li>
              <li>
                <button
                  onClick={onOpenAdmin}
                  className="text-[#6B6255] hover:text-[#C9A15E] transition-colors cursor-pointer block pt-2 text-[11px]"
                >
                  🔒 دخول لوحة تحكم الإدارة
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Socials */}
          <div>
            <h3 className="text-xs font-bold text-[#C9A15E] tracking-wider uppercase mb-3">
              التواصل المباشر
            </h3>
            <div className="space-y-2.5 text-xs text-[#E4DDD0]">
              <a
                href={`tel:${phone}`}
                className="flex items-center gap-2 hover:text-[#C9A15E] transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-[#C9A15E]" />
                <span dir="ltr">{phone}</span>
              </a>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[#25D366] hover:underline"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>محادثة واتساب سريعة</span>
              </a>

              <div className="pt-2">
                <span className="text-[11px] text-[#6B6255] block mb-1">
                  تابعنا على منصات التواصل:
                </span>
                <div className="flex items-center gap-3 text-xs">
                  <a
                    href={facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#C9A15E] transition-colors"
                  >
                    فيسبوك
                  </a>
                  <span>•</span>
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#C9A15E] transition-colors"
                  >
                    إنستغرام
                  </a>
                  <span>•</span>
                  <a
                    href={tiktokUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#C9A15E] transition-colors"
                  >
                    تيك توك
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#6B6255] text-center sm:text-right select-none">
          <div
            onClick={handleSecretFooterClick}
            className="cursor-default"
            title=""
          >
            {copyrightText}
          </div>
          <div>
            {locationNote}
          </div>
        </div>

      </div>
    </footer>
  );
};
