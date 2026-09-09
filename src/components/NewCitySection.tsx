import React, { useState } from 'react';
import { Map, HelpCircle, Search, RotateCcw, Building2, Timer, Sparkles, Filter } from 'lucide-react';
import { Listing, SiteSettings } from '../types.ts';
import { ListingCard } from './ListingCard.tsx';
import { CommissionBanner } from './CommissionBanner.tsx';
import { StudentHub } from './StudentHub.tsx';

interface NewCitySectionProps {
  listings: Listing[];
  favorites: number[];
  comparedIds: number[];
  onToggleFavorite: (id: number) => void;
  onToggleCompare: (listing: Listing) => void;
  onSelectListing: (id: number) => void;
  onOpenMap: () => void;
  onOpenHousingRequest: () => void;
  onOpenAbout: () => void;
  siteSettings?: SiteSettings;
}

export const NewCitySection: React.FC<NewCitySectionProps> = ({
  listings,
  favorites,
  comparedIds,
  onToggleFavorite,
  onToggleCompare,
  onSelectListing,
  onOpenMap,
  onOpenHousingRequest,
  onOpenAbout,
  siteSettings,
}) => {
  // Filter States
  const [budget, setBudget] = useState<string>('all');
  const [distance, setDistance] = useState<string>('all');
  const [gender, setGender] = useState<string>('all');

  const heroBadge = siteSettings?.heroStudentBadge || 'المنصة الأولى المعتمدة لسكن طلاب جامعة سيناء بالعريش';
  const heroTitle = siteSettings?.heroStudentTitle || '🏠 لاقي سكنك جنب جامعة سيناء';
  const heroDesc = siteSettings?.heroStudentDesc || 'شقق واستوديوهات مفروشة بالكامل، بنين وبنات، على بعد خطوات من قاعات المحاضرات. تعامل مباشر مع المالك بدون سماسرة، و0% عمولة على الطالب نهائيًا.';

  // Filter listings
  const filteredListings = listings.filter((item) => {
    if (item.category !== 'STUDENT') return false;

    // Gender filter
    if (gender !== 'all' && item.gender !== gender) {
      return false;
    }

    // Distance filter
    if (distance !== 'all') {
      const maxDist = parseInt(distance, 10);
      if (!isNaN(maxDist) && item.distanceMin > maxDist) return false;
    }

    // Budget filter
    if (budget !== 'all') {
      if (budget === '1000') {
        if (item.price > 1000) return false;
      } else if (budget === '1000-1500') {
        if (item.price < 1000 || item.price > 1500) return false;
      } else if (budget === '1500-2000') {
        if (item.price < 1500 || item.price > 2000) return false;
      } else if (budget === '2000-2500') {
        if (item.price < 2000 || item.price > 2500) return false;
      }
    }

    return true;
  });

  const studentListings = listings.filter((l) => l.category === 'STUDENT');
  const availableCount = studentListings.filter((l) => l.status === 'AVAILABLE').length;
  const closestDistance = studentListings.length > 0
    ? Math.min(...studentListings.map((l) => l.distanceMin))
    : 3;

  const scrollToGrid = () => {
    const el = document.getElementById('student-listings-grid');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const resetFilters = () => {
    setBudget('all');
    setDistance('all');
    setGender('all');
  };

  return (
    <div className="w-full">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FAF3E5] to-[#FAF7F1] pt-12 pb-16 px-4 sm:px-8 border-b border-[#E4DDD0]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
            
            {/* Text & Primary Actions */}
            <div className="max-w-2xl text-center lg:text-right">
              <div className="inline-flex items-center gap-2 bg-[#17140F] text-[#C9A15E] px-3.5 py-1.5 rounded-full text-xs font-semibold mb-4 shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{heroBadge}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold text-[#1B1712] tracking-tight leading-tight sm:leading-tight mb-4">
                {heroTitle}
              </h1>

              <p className="text-base sm:text-lg text-[#6B6255] leading-relaxed mb-8">
                {heroDesc}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                <button
                  onClick={scrollToGrid}
                  className="bg-[#17140F] hover:bg-[#2A241B] text-[#FAF7F1] px-6 py-3.5 rounded-xl font-bold text-sm sm:text-base transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-2"
                >
                  <Building2 className="w-4 h-4 text-[#C9A15E]" />
                  <span>تصفح الشقق المتاحة</span>
                </button>

                <button
                  onClick={onOpenMap}
                  className="bg-white hover:bg-[#FAF7F1] text-[#1B1712] border border-[#E4DDD0] hover:border-[#C9A15E] px-5 py-3.5 rounded-xl font-bold text-sm sm:text-base transition-all shadow-2xs active:scale-95 cursor-pointer flex items-center gap-2"
                >
                  <Map className="w-4 h-4 text-[#A67C3D]" />
                  <span>اعرض على الخريطة</span>
                </button>

                <button
                  onClick={onOpenHousingRequest}
                  className="bg-[#FAF3E5] hover:bg-[#EFE5D0] text-[#A67C3D] border border-[#E8DCBF] px-5 py-3.5 rounded-xl font-bold text-sm sm:text-base transition-all shadow-2xs active:scale-95 cursor-pointer flex items-center gap-2"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>❓ مش لاقي اللي يناسبك؟</span>
                </button>
              </div>
            </div>

            {/* Quick Stats Box */}
            <div className="w-full lg:w-auto grid grid-cols-2 gap-4 max-w-md">
              <div className="bg-white p-5 rounded-2xl border border-[#E4DDD0] shadow-xs text-center flex flex-col justify-center">
                <span className="text-3xl sm:text-4xl font-extrabold text-[#C9A15E] font-mono">
                  {availableCount}
                </span>
                <span className="text-xs sm:text-sm font-bold text-[#1B1712] mt-1">
                  شقة وسكن متاح
                </span>
                <span className="text-[11px] text-[#6B6255] mt-0.5">جاهزة للمعاينة والحجز</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#E4DDD0] shadow-xs text-center flex flex-col justify-center">
                <div className="flex items-center justify-center gap-1 text-3xl sm:text-4xl font-extrabold text-[#1B1712] font-mono">
                  <span>{closestDistance}</span>
                  <span className="text-lg font-bold text-[#A67C3D]">دقائق</span>
                </div>
                <span className="text-xs sm:text-sm font-bold text-[#1B1712] mt-1">
                  أقرب مسافة للجامعة
                </span>
                <span className="text-[11px] text-[#6B6255] mt-0.5">مشي على الأقدام</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. Commission Banner */}
      <CommissionBanner onOpenAbout={onOpenAbout} siteSettings={siteSettings} />

      {/* 3. Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-10" id="student-listings-grid">
        
        {/* Instant Search Bar */}
        <div className="bg-white rounded-2xl border border-[#E4DDD0] p-5 sm:p-6 mb-8 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#FAF7F1]">
            <div className="flex items-center gap-2 font-bold text-[#1B1712] text-sm sm:text-base">
              <Filter className="w-4 h-4 text-[#C9A15E]" />
              <span>البحث الفوري وتصفية سكن الطلاب</span>
            </div>
            
            {(budget !== 'all' || distance !== 'all' || gender !== 'all') && (
              <button
                onClick={resetFilters}
                className="text-xs text-[#A67C3D] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>إعادة تعيين الفلاتر</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Budget */}
            <div>
              <label className="block text-xs font-semibold text-[#6B6255] mb-1.5">
                الميزانية الشهرية للطالب
              </label>
              <select
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full bg-[#FAF7F1] border border-[#E4DDD0] focus:border-[#C9A15E] rounded-xl px-3 py-2.5 text-xs sm:text-sm text-[#1B1712] outline-none font-medium cursor-pointer"
              >
                <option value="all">كل الميزانيات</option>
                <option value="1000">حتى 1000 جنيه</option>
                <option value="1000-1500">1000 - 1500 جنيه</option>
                <option value="1500-2000">1500 - 2000 جنيه</option>
                <option value="2000-2500">2000 - 2500 جنيه</option>
              </select>
            </div>

            {/* Distance */}
            <div>
              <label className="block text-xs font-semibold text-[#6B6255] mb-1.5">
                المسافة من بوابة الجامعة
              </label>
              <select
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                className="w-full bg-[#FAF7F1] border border-[#E4DDD0] focus:border-[#C9A15E] rounded-xl px-3 py-2.5 text-xs sm:text-sm text-[#1B1712] outline-none font-medium cursor-pointer"
              >
                <option value="all">كل المسافات</option>
                <option value="5">حتى 5 دقائق مشي</option>
                <option value="10">حتى 10 دقائق مشي</option>
                <option value="15">حتى 15 دقيقة مشي</option>
              </select>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-semibold text-[#6B6255] mb-1.5">
                نوع السكن الطلابي
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full bg-[#FAF7F1] border border-[#E4DDD0] focus:border-[#C9A15E] rounded-xl px-3 py-2.5 text-xs sm:text-sm text-[#1B1712] outline-none font-medium cursor-pointer"
              >
                <option value="all">الكل (بنين وبنات)</option>
                <option value="بنين">سكن طلاب (بنين)</option>
                <option value="بنات">سكن طالبات (بنات)</option>
              </select>
            </div>

            {/* Action CTA */}
            <div className="flex items-end">
              <button
                type="button"
                onClick={scrollToGrid}
                className="w-full bg-[#C9A15E] hover:bg-[#A67C3D] text-[#17140F] hover:text-white py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                <span>🔎 ابحث عن سكن ({filteredListings.length})</span>
              </button>
            </div>
          </div>
        </div>

        {/* Listings Header & Counter */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#1B1712]">
              شقق السكن الطلابي المتاحة
            </h2>
            <p className="text-xs text-[#6B6255] mt-0.5">
              عرض {filteredListings.length} عقار متوافق مع خياراتك
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenMap}
              className="text-xs bg-white text-[#1B1712] border border-[#E4DDD0] hover:border-[#C9A15E] px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <Map className="w-3.5 h-3.5 text-[#C9A15E]" />
              <span className="hidden sm:inline">عرض المواقع بالخريطة</span>
              <span className="sm:hidden">الخريطة</span>
            </button>
          </div>
        </div>

        {/* Listings Grid */}
        {filteredListings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                isFavorite={favorites.includes(listing.id)}
                isCompared={comparedIds.includes(listing.id)}
                onToggleFavorite={onToggleFavorite}
                onToggleCompare={onToggleCompare}
                onClick={onSelectListing}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-dashed border-[#E4DDD0] p-12 text-center max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-full bg-[#FAF3E5] text-[#A67C3D] flex items-center justify-center mx-auto mb-4 text-xl">
              🔍
            </div>
            <h3 className="font-bold text-lg text-[#1B1712] mb-1">
              لم نعثر على شقق تطابق خيارات البحث الحالية
            </h3>
            <p className="text-xs sm:text-sm text-[#6B6255] mb-6">
              جرب تغيير معايير التصفية أو أرسل طلب سكن خاص لنبحث لك عن الشقة المناسبة مجانًا!
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={resetFilters}
                className="bg-[#FAF7F1] hover:bg-[#E4DDD0] text-[#1B1712] px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
              >
                إلغاء الفلاتر
              </button>
              <button
                onClick={onOpenHousingRequest}
                className="bg-[#C9A15E] hover:bg-[#A67C3D] text-[#17140F] hover:text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
              >
                ❓ أرسل طلب سكن خاص
              </button>
            </div>
          </div>
        )}

        {/* 4. Student Hub Section */}
        <StudentHub siteSettings={siteSettings} />

      </main>
    </div>
  );
};
