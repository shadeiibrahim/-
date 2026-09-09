import React from 'react';
import { Heart, MessageCircle, Shield, Users, Eye, Sparkles, MapPin, FileText } from 'lucide-react';
import { ListingCategory, SiteSettings } from '../types.ts';

export interface HeaderProps {
  activeTab?: ListingCategory;
  onTabChange?: (tab: ListingCategory) => void;
  currentTab?: 'STUDENT' | 'LOCAL' | 'ADMIN' | 'FAVORITES' | 'COMPARE';
  onSelectTab?: (tab: 'STUDENT' | 'LOCAL' | 'ADMIN' | 'FAVORITES' | 'COMPARE') => void;
  favoritesCount?: number;
  compareCount?: number;
  totalVisits?: number;
  onOpenFavorites?: () => void;
  onOpenCompare?: () => void;
  onOpenMap?: () => void;
  onOpenHousingRequest?: () => void;
  onOpenAbout?: () => void;
  onOpenAdmin?: () => void;
  siteSettings?: SiteSettings;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab = 'STUDENT',
  onTabChange,
  currentTab,
  onSelectTab,
  favoritesCount = 0,
  compareCount = 0,
  totalVisits = 1280,
  onOpenFavorites,
  onOpenCompare,
  onOpenMap,
  onOpenHousingRequest,
  onOpenAbout,
  onOpenAdmin,
  siteSettings,
}) => {
  const whatsappNumber = siteSettings?.whatsappNumber || '201550454849';
  const whatsappMsg = siteSettings?.whatsappWelcomeMsg || 'السلام عليكم، حابب أعرض عقاري مع أركان للتسويق العقاري بميزة الـ 30 جنيه فقط و 0% عمولة.';
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMsg)}`;

  const siteName = siteSettings?.siteName || 'أركان للتسويق العقاري';
  const siteSlogan = siteSettings?.siteSlogan || 'غيّرنا شكل السمسرة';
  const logoUrl = siteSettings?.logoUrl || '/logo.png';
  const logoLetter = siteSettings?.logoLetter || 'A';
  const commissionBadge = siteSettings?.commissionBadge || '0% عمولة';
  const facebookUrl = siteSettings?.facebookUrl || 'https://www.facebook.com/share/17e8UBzfbi/';
  const instagramUrl = siteSettings?.instagramUrl || 'https://www.instagram.com/arkan_real_estate?stkn=MWhqc21nbm1pZnZkMw==';
  const tiktokUrl = siteSettings?.tiktokUrl || 'https://www.tiktok.com/@arkan_real_estate?_r=1&_t=ZS-99YaNTroP3K';

  const resolvedActiveTab: ListingCategory = (activeTab === 'LOCAL' || currentTab === 'LOCAL') ? 'LOCAL' : 'STUDENT';

  const handleTabClick = (tab: ListingCategory) => {
    if (onTabChange) {
      onTabChange(tab);
    } else if (onSelectTab) {
      onSelectTab(tab);
    }
  };

  const handleNavClick = (view: 'favorites' | 'compare' | 'admin' | 'about') => {
    if (view === 'favorites') {
      if (onOpenFavorites) onOpenFavorites();
      else if (onSelectTab) onSelectTab('FAVORITES');
    } else if (view === 'compare') {
      if (onOpenCompare) onOpenCompare();
      else if (onSelectTab) onSelectTab('COMPARE');
    } else if (view === 'admin') {
      if (onOpenAdmin) onOpenAdmin();
      else if (onSelectTab) onSelectTab('ADMIN');
    } else if (view === 'about') {
      if (onOpenAbout) onOpenAbout();
    }
  };

  const logoClicksRef = React.useRef<number>(0);
  const logoTimerRef = React.useRef<any>(null);

  const handleLogoSecretClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onTabChange) onTabChange('STUDENT');
    else if (onSelectTab) onSelectTab('STUDENT');

    logoClicksRef.current += 1;
    if (logoClicksRef.current >= 5) {
      logoClicksRef.current = 0;
      if (onOpenAdmin) onOpenAdmin();
      else if (onSelectTab) onSelectTab('ADMIN');
      return;
    }

    if (logoTimerRef.current) clearTimeout(logoTimerRef.current);
    logoTimerRef.current = setTimeout(() => {
      logoClicksRef.current = 0;
    }, 2500);
  };

  return (
    <header className="sticky top-0 z-40 w-full shadow-xs">
      {/* 1. Thin Top Bar (#17140F) */}
      <div className="bg-[#17140F] text-[#FAF7F1] text-xs py-2 px-4 sm:px-8 border-b border-[#2A241B]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Social Icons (Right in RTL) */}
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-xs text-[#C9A15E] font-medium">تابعنا:</span>
            <a
              href={facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#FAF7F1]/80 hover:text-[#C9A15E] transition-colors flex items-center gap-1.5"
              title={`فيسبوك ${siteName}`}
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span className="hidden md:inline">فيسبوك</span>
            </a>
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#FAF7F1]/80 hover:text-[#C9A15E] transition-colors flex items-center gap-1.5"
              title={`إنستجرام ${siteName}`}
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <span className="hidden md:inline">إنستجرام</span>
            </a>
            <a
              href={tiktokUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#FAF7F1]/80 hover:text-[#C9A15E] transition-colors flex items-center gap-1.5"
              title={`تيك توك ${siteName}`}
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.47 6.27 6.27 0 0 0 1.89-4.47V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-.9-.06z"/>
              </svg>
              <span className="hidden md:inline">تيك توك</span>
            </a>
          </div>

          {/* Live Visitor Counter (Left in RTL) */}
          <div className="flex items-center gap-2 font-mono text-xs bg-[#241F17] px-3 py-1 rounded-full border border-[#3D3425]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[#FAF7F1]/90">
              زوار الموقع: <strong className="text-[#C9A15E] font-semibold">{(totalVisits ?? 0).toLocaleString('ar-EG')}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* 2. Main Header Bar */}
      <div className="bg-[#FAF7F1]/95 backdrop-blur-md border-b border-[#E4DDD0] px-4 sm:px-8 py-3 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Logo & Slogan */}
          <div
            onClick={handleLogoSecretClick}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-[#17140F] border border-[#C9A15E]/40 flex items-center justify-center shadow-xs transition-transform group-hover:scale-105">
              <img
                src={logoUrl}
                alt={`لوجو ${siteName}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <span className="text-[#C9A15E] font-bold text-lg">{logoLetter}</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg sm:text-xl font-bold tracking-tight text-[#1B1712]">
                  {siteName}
                </span>
                <span className="hidden lg:inline-flex items-center gap-0.5 text-[11px] bg-[#C9A15E]/15 text-[#A67C3D] px-2 py-0.5 rounded-full font-medium border border-[#C9A15E]/30">
                  <Sparkles className="w-3 h-3" />
                  {commissionBadge}
                </span>
              </div>
              <p className="text-xs text-[#6B6255] font-medium tracking-wide">
                {siteSlogan}
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-5 text-sm font-medium">
            <button
              onClick={() => handleTabClick(resolvedActiveTab)}
              className="transition-colors cursor-pointer py-1 border-b-2 border-[#C9A15E] text-[#1B1712] font-semibold"
            >
              العقارات المتاحة
            </button>

            {onOpenMap && (
              <button
                onClick={onOpenMap}
                className="transition-colors cursor-pointer flex items-center gap-1.5 py-1 border-b-2 border-transparent text-[#6B6255] hover:text-[#1B1712]"
              >
                <MapPin className="w-4 h-4 text-[#C9A15E]" />
                <span>الخريطة التفاعلية</span>
              </button>
            )}

            {onOpenHousingRequest && (
              <button
                onClick={onOpenHousingRequest}
                className="transition-colors cursor-pointer flex items-center gap-1.5 py-1 border-b-2 border-transparent text-[#6B6255] hover:text-[#1B1712]"
              >
                <FileText className="w-4 h-4 text-[#C9A15E]" />
                <span>اطلب سكن خاص</span>
              </button>
            )}

            <button
              onClick={() => handleNavClick('favorites')}
              className="relative transition-colors cursor-pointer flex items-center gap-1.5 py-1 border-b-2 border-transparent text-[#6B6255] hover:text-[#1B1712]"
            >
              <Heart className={`w-4 h-4 ${favoritesCount > 0 ? 'text-rose-500 fill-rose-500' : ''}`} />
              <span>المفضلة</span>
              {favoritesCount > 0 && (
                <span className="bg-rose-500 text-white text-[11px] font-bold px-1.5 py-0.2 rounded-full">
                  {favoritesCount}
                </span>
              )}
            </button>

            {compareCount > 0 && (
              <button
                onClick={() => handleNavClick('compare')}
                className="relative transition-colors cursor-pointer flex items-center gap-1.5 py-1 border-b-2 border-transparent text-[#6B6255] hover:text-[#1B1712]"
              >
                <span>المقارنة</span>
                <span className="bg-[#C9A15E] text-[#17140F] text-[11px] font-bold px-1.5 py-0.2 rounded-full">
                  {compareCount}
                </span>
              </button>
            )}

            <button
              onClick={() => handleNavClick('about')}
              className="text-[#6B6255] hover:text-[#1B1712] transition-colors cursor-pointer py-1 border-b-2 border-transparent"
            >
              عن أركان
            </button>
          </nav>

          {/* Action Buttons: WhatsApp CTA */}
          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#C9A15E] hover:bg-[#A67C3D] text-[#17140F] hover:text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-xs active:scale-95"
            >
              <MessageCircle className="w-4 h-4" />
              <span>اعرض شقتك معنا</span>
            </a>
          </div>
        </div>
      </div>

      {/* 3. Category Switcher Tabs */}
      <div className="bg-[#FAF7F1] border-b border-[#E4DDD0] px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex gap-2 sm:gap-4 overflow-x-auto py-2.5 no-scrollbar">
            {/* Tab 1: المدينة الجديدة */}
            <button
              onClick={() => handleTabClick('STUDENT')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer shrink-0 ${
                resolvedActiveTab === 'STUDENT'
                  ? 'bg-[#17140F] text-[#C9A15E] shadow-sm'
                  : 'bg-white/80 text-[#6B6255] hover:bg-white hover:text-[#1B1712] border border-[#E4DDD0]'
              }`}
            >
              <span>🎓</span>
              <span>المدينة الجديدة</span>
              <span className="text-xs opacity-75 font-normal hidden sm:inline">(سكن طلاب جامعة سيناء)</span>
            </button>

            {/* Tab 2: البلد */}
            <button
              onClick={() => handleTabClick('LOCAL')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer shrink-0 ${
                resolvedActiveTab === 'LOCAL'
                  ? 'bg-[#17140F] text-[#C9A15E] shadow-sm'
                  : 'bg-white/80 text-[#6B6255] hover:bg-white hover:text-[#1B1712] border border-[#E4DDD0]'
              }`}
            >
              <span>🏡</span>
              <span>البلد</span>
              <span className="text-xs opacity-75 font-normal hidden sm:inline">(سكان محليين: عائلات، بيع، محلات، أراضي)</span>
            </button>

            {/* Mobile Map button */}
            {onOpenMap && (
              <button
                onClick={onOpenMap}
                className="md:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border border-[#E4DDD0] bg-white text-[#6B6255] cursor-pointer shrink-0"
              >
                <MapPin className="w-3.5 h-3.5 text-[#C9A15E]" />
                <span>الخريطة</span>
              </button>
            )}

            {/* Mobile Housing Request button */}
            {onOpenHousingRequest && (
              <button
                onClick={onOpenHousingRequest}
                className="md:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border border-[#E4DDD0] bg-white text-[#6B6255] cursor-pointer shrink-0"
              >
                <FileText className="w-3.5 h-3.5 text-[#C9A15E]" />
                <span>طلب سكن</span>
              </button>
            )}

            {/* Mobile-visible favorites link */}
            <button
              onClick={() => handleNavClick('favorites')}
              className="md:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border border-[#E4DDD0] cursor-pointer shrink-0 bg-white text-[#6B6255]"
            >
              <Heart className="w-3.5 h-3.5" />
              <span>المفضلة</span>
              {favoritesCount > 0 && <span className="text-xs text-rose-500 font-bold">({favoritesCount})</span>}
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs text-[#6B6255]">
            <span className="inline-block w-2 h-2 rounded-full bg-[#C9A15E]"></span>
            <span>نموذج العمل: 30 جنيه فقط للمُعلن • 0% من المستأجر</span>
          </div>
        </div>
      </div>
    </header>
  );
};
