import React, { useState } from 'react';
import { Home, Search, RotateCcw, MapPin, Sparkles, Filter, Building, Tag } from 'lucide-react';
import { Listing, PropertyType, SiteSettings } from '../types.ts';
import { ListingCard } from './ListingCard.tsx';
import { CommissionBanner } from './CommissionBanner.tsx';

interface BaladSectionProps {
  listings: Listing[];
  favorites: number[];
  comparedIds: number[];
  onToggleFavorite: (id: number) => void;
  onToggleCompare: (listing: Listing) => void;
  onSelectListing: (id: number) => void;
  onOpenAbout: () => void;
  siteSettings?: SiteSettings;
}

export const BaladSection: React.FC<BaladSectionProps> = ({
  listings,
  favorites,
  comparedIds,
  onToggleFavorite,
  onToggleCompare,
  onSelectListing,
  onOpenAbout,
  siteSettings,
}) => {
  const [propertyType, setPropertyType] = useState<string>('all');
  const [neighborhood, setNeighborhood] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('all');

  const heroBadge = siteSettings?.heroLocalBadge || 'قسم البلد • لأهالي وسكان المنطقة المحليين';
  const heroTitle = siteSettings?.heroLocalTitle || '🏡 العقار المناسب في قلب البلد — إيجار وبيع';
  const heroDesc = siteSettings?.heroLocalDesc || 'شقق عائلية راقية للإيجار، شقق وفيلات تمليك، محلات تجارية بمواقع استراتيجية، وأراضي بناء مسجلة ومضمونة بدون وسيط أو عمولات مرهقة.';
  const commissionBadge = siteSettings?.commissionBadge || 'عمولة على المستأجر';
  const listingFeeText = siteSettings?.listingFeeText || '30 جنيه فقط للمُعلن';

  const filteredListings = listings.filter((item) => {
    if (item.category !== 'LOCAL') return false;

    // Property Type
    if (propertyType !== 'all' && item.propertyType !== propertyType) {
      return false;
    }

    // Neighborhood
    if (neighborhood.trim()) {
      const q = neighborhood.trim().toLowerCase();
      const match =
        (item.neighborhood && item.neighborhood.toLowerCase().includes(q)) ||
        item.address.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q);
      if (!match) return false;
    }

    // Price
    if (maxPrice !== 'all') {
      const max = parseInt(maxPrice, 10);
      if (!isNaN(max) && item.price > max) return false;
    }

    return true;
  });

  const resetFilters = () => {
    setPropertyType('all');
    setNeighborhood('');
    setMaxPrice('all');
  };

  const localListings = listings.filter((l) => l.category === 'LOCAL');

  return (
    <div className="w-full">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FAF3E5] to-[#FAF7F1] pt-12 pb-16 px-4 sm:px-8 border-b border-[#E4DDD0]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
            
            {/* Text & Pitch */}
            <div className="max-w-2xl text-center lg:text-right">
              <div className="inline-flex items-center gap-2 bg-[#17140F] text-[#C9A15E] px-3.5 py-1.5 rounded-full text-xs font-semibold mb-4 shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{heroBadge}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold text-[#1B1712] tracking-tight leading-tight sm:leading-tight mb-4">
                {heroTitle}
              </h1>

              <p className="text-base sm:text-lg text-[#6B6255] leading-relaxed mb-6">
                {heroDesc}
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs sm:text-sm text-[#1B1712] font-semibold">
                <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-[#E4DDD0]">
                  <span className="text-[#C9A15E]">✓</span> شقق عائلية للإيجار
                </div>
                <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-[#E4DDD0]">
                  <span className="text-[#C9A15E]">✓</span> بيع وتمليك
                </div>
                <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-[#E4DDD0]">
                  <span className="text-[#C9A15E]">✓</span> محلات تجارية
                </div>
                <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-[#E4DDD0]">
                  <span className="text-[#C9A15E]">✓</span> أراضي للبناء
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="w-full lg:w-auto grid grid-cols-2 gap-4 max-w-md">
              <div className="bg-white p-5 rounded-2xl border border-[#E4DDD0] shadow-xs text-center">
                <span className="text-3xl sm:text-4xl font-extrabold text-[#C9A15E] font-mono">
                  {localListings.length}
                </span>
                <span className="text-xs sm:text-sm font-bold text-[#1B1712] block mt-1">
                  عقارات معروضة
                </span>
                <span className="text-[11px] text-[#6B6255]">في أحياء ومناطق البلد</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#E4DDD0] shadow-xs text-center">
                <span className="text-3xl sm:text-4xl font-extrabold text-[#1B1712] font-mono">
                  0%
                </span>
                <span className="text-xs sm:text-sm font-bold text-[#1B1712] block mt-1">
                  {commissionBadge}
                </span>
                <span className="text-[11px] text-[#6B6255]">{listingFeeText}</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. Commission Banner */}
      <CommissionBanner onOpenAbout={onOpenAbout} siteSettings={siteSettings} />

      {/* 3. Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
        
        {/* Filters Bar */}
        <div className="bg-white rounded-2xl border border-[#E4DDD0] p-5 sm:p-6 mb-8 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#FAF7F1]">
            <div className="flex items-center gap-2 font-bold text-[#1B1712] text-sm sm:text-base">
              <Filter className="w-4 h-4 text-[#C9A15E]" />
              <span>تصفية عقارات البلد</span>
            </div>

            {(propertyType !== 'all' || neighborhood !== '' || maxPrice !== 'all') && (
              <button
                onClick={resetFilters}
                className="text-xs text-[#A67C3D] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>إعادة ضبط</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Property Type */}
            <div>
              <label className="block text-xs font-semibold text-[#6B6255] mb-1.5">
                نوع العقار
              </label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full bg-[#FAF7F1] border border-[#E4DDD0] focus:border-[#C9A15E] rounded-xl px-3 py-2.5 text-xs sm:text-sm text-[#1B1712] outline-none font-medium cursor-pointer"
              >
                <option value="all">كل أنواع العقارات</option>
                <option value="RENT_APARTMENT">شقق عائلية للإيجار</option>
                <option value="SALE">عقارات للبيع والشراء</option>
                <option value="COMMERCIAL">محلات تجارية</option>
                <option value="LAND">أراضي للبناء</option>
              </select>
            </div>

            {/* Neighborhood / Search */}
            <div>
              <label className="block text-xs font-semibold text-[#6B6255] mb-1.5">
                الحي أو المنطقة
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="مثال: وسط البلد، الكرامة، النخيل..."
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  className="w-full bg-[#FAF7F1] border border-[#E4DDD0] focus:border-[#C9A15E] rounded-xl px-3 py-2.5 text-xs sm:text-sm text-[#1B1712] outline-none font-medium pr-9"
                />
                <MapPin className="w-4 h-4 text-[#6B6255] absolute top-3 right-3 pointer-events-none" />
              </div>
            </div>

            {/* Max Price */}
            <div>
              <label className="block text-xs font-semibold text-[#6B6255] mb-1.5">
                الحد الأقصى للسعر
              </label>
              <select
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full bg-[#FAF7F1] border border-[#E4DDD0] focus:border-[#C9A15E] rounded-xl px-3 py-2.5 text-xs sm:text-sm text-[#1B1712] outline-none font-medium cursor-pointer"
              >
                <option value="all">أي سعر</option>
                <option value="3000">حتى 3,000 ج (إيجار)</option>
                <option value="6000">حتى 6,000 ج (تجاري/إيجار)</option>
                <option value="700000">حتى 700,000 ج (بيع/أرض)</option>
                <option value="1500000">حتى 1,500,000 ج</option>
              </select>
            </div>
          </div>
        </div>

        {/* Listings Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#1B1712]">
              عقارات البلد المتاحة
            </h2>
            <p className="text-xs text-[#6B6255] mt-0.5">
              عرض {filteredListings.length} عقار متوافق
            </p>
          </div>
        </div>

        {/* Grid */}
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
              🏡
            </div>
            <h3 className="font-bold text-lg text-[#1B1712] mb-1">
              لم نعثر على عقارات تطابق بحثك في البلد
            </h3>
            <p className="text-xs sm:text-sm text-[#6B6255] mb-6">
              يمكنك تجربة إلغاء فلاتر البحث أو التواصل معنا مباشرة عبر واتساب لعرض طلبك.
            </p>
            <button
              onClick={resetFilters}
              className="bg-[#C9A15E] hover:bg-[#A67C3D] text-[#17140F] hover:text-white px-5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer"
            >
              إلغاء الفلاتر وعرض كل العقارات
            </button>
          </div>
        )}

      </main>
    </div>
  );
};
