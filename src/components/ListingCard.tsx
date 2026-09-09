import React from 'react';
import { Heart, Plus, Check, MapPin, Eye, Home, Layers } from 'lucide-react';
import { Listing } from '../types.ts';

interface ListingCardProps {
  listing: Listing;
  isFavorite: boolean;
  isCompared: boolean;
  onToggleFavorite: (id: number) => void;
  onToggleCompare: (listing: Listing) => void;
  onClick: (id: number) => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  isFavorite,
  isCompared,
  onToggleFavorite,
  onToggleCompare,
  onClick,
}) => {
  const isStudent = listing.category === 'STUDENT';
  const firstImage = listing.images?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80';

  // Status badge styling
  const renderStatusBadge = () => {
    if (listing.status === 'RENTED') {
      return (
        <span className="bg-rose-600 text-white font-bold text-xs px-2.5 py-1 rounded-lg shadow-sm">
          تم التأجير
        </span>
      );
    }
    if (listing.status === 'RESERVED') {
      return (
        <span className="bg-amber-600 text-white font-bold text-xs px-2.5 py-1 rounded-lg shadow-sm">
          محجوزة مؤقتًا
        </span>
      );
    }
    return null;
  };

  // Property type badge
  const renderTypeBadge = () => {
    if (isStudent) {
      const isFemale = listing.gender === 'بنات';
      return (
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-lg shadow-xs ${
            isFemale
              ? 'bg-purple-100 text-purple-800 border border-purple-200'
              : 'bg-blue-100 text-blue-800 border border-blue-200'
          }`}
        >
          {isFemale ? 'سكن بنات' : 'سكن بنين'}
        </span>
      );
    }

    // Balad types
    switch (listing.propertyType) {
      case 'RENT_APARTMENT':
        return <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded-lg border border-emerald-200">إيجار عائلي</span>;
      case 'SALE':
        return <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-1 rounded-lg border border-amber-200">للبيع والتمليك</span>;
      case 'COMMERCIAL':
        return <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-1 rounded-lg border border-indigo-200">محل تجاري</span>;
      case 'LAND':
        return <span className="bg-orange-100 text-orange-800 text-xs font-semibold px-2.5 py-1 rounded-lg border border-orange-200">أرض للبيع</span>;
      default:
        return <span className="bg-neutral-100 text-neutral-800 text-xs font-semibold px-2.5 py-1 rounded-lg">عقار</span>;
    }
  };

  return (
    <div
      onClick={() => onClick(listing.id)}
      className="group bg-white rounded-2xl border border-[#E4DDD0] hover:border-[#C9A15E] shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col cursor-pointer"
    >
      {/* Image Container */}
      <div className="relative w-full h-52 bg-[#17140F] overflow-hidden">
        <img
          src={firstImage}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Top Floating Controls */}
        <div className="absolute top-3 inset-x-3 flex items-start justify-between pointer-events-none">
          {/* Status badge if rented / reserved */}
          <div>
            {renderStatusBadge()}
          </div>

          {/* Action buttons: Favorite & Compare */}
          <div className="flex items-center gap-2 pointer-events-auto">
            {/* Compare Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleCompare(listing);
              }}
              title={isCompared ? 'إزالة من المقارنة' : 'إضافة للمقارنة'}
              className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all backdrop-blur-md shadow-xs ${
                isCompared
                  ? 'bg-[#C9A15E] text-[#17140F]'
                  : 'bg-black/40 hover:bg-black/60 text-white'
              }`}
            >
              {isCompared ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span className="text-[11px] hidden sm:inline">مقارنة</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span className="text-[11px] hidden sm:inline">قارن</span>
                </>
              )}
            </button>

            {/* Favorite Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(listing.id);
              }}
              title={isFavorite ? 'إزالة من المفضلة' : 'حفظ في المفضلة'}
              className={`p-2 rounded-xl transition-all backdrop-blur-md shadow-xs ${
                isFavorite
                  ? 'bg-rose-50 text-rose-600'
                  : 'bg-black/40 hover:bg-black/60 text-white'
              }`}
            >
              <Heart
                className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`}
              />
            </button>
          </div>
        </div>

        {/* Bottom overlay in image: Type badge & Views */}
        <div className="absolute bottom-3 inset-x-3 flex items-center justify-between pointer-events-none">
          <div>
            {renderTypeBadge()}
          </div>

          <div className="bg-black/50 backdrop-blur-xs text-white/90 text-[11px] px-2 py-0.5 rounded-md flex items-center gap-1 font-mono">
            <Eye className="w-3 h-3" />
            <span>{listing.views || 0}</span>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Price Header */}
          <div className="flex items-baseline justify-between mb-2">
            <div>
              <span className="text-xl sm:text-2xl font-bold text-[#1B1712]">
                {(listing.price ?? 0).toLocaleString('ar-EG')}
              </span>
              <span className="text-xs text-[#6B6255] mr-1 font-medium">
                {listing.propertyType === 'SALE' || listing.propertyType === 'LAND'
                  ? 'جنيه إجمالي'
                  : 'جنيه / شهر'}
              </span>
            </div>

            {/* Distance or Neighborhood Badge */}
            {isStudent ? (
              <span className="text-xs font-semibold text-[#A67C3D] bg-[#FAF3E5] px-2.5 py-1 rounded-md border border-[#E8DCBF]">
                ⏱️ {listing.distanceMin} دقيقة للجامعة
              </span>
            ) : (
              <span className="text-xs font-medium text-[#6B6255] bg-[#FAF7F1] px-2 py-1 rounded-md border border-[#E4DDD0] truncate max-w-[120px]">
                📍 {listing.neighborhood || 'وسط البلد'}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-base font-bold text-[#1B1712] line-clamp-2 leading-snug group-hover:text-[#A67C3D] transition-colors mb-2">
            {listing.title}
          </h3>

          {/* Address Line */}
          <p className="text-xs text-[#6B6255] flex items-center gap-1 line-clamp-1 mb-3">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-[#C9A15E]" />
            <span>{listing.address}</span>
          </p>
        </div>

        {/* Specs Footer Grid */}
        <div className="pt-3 border-t border-[#E4DDD0] grid grid-cols-3 gap-2 text-center text-xs text-[#6B6255]">
          <div className="bg-[#FAF7F1] py-1.5 px-2 rounded-lg">
            <span className="block text-[11px] text-[#6B6255]/80">
              {isStudent ? 'الغرف' : (listing.propertyType === 'LAND' ? 'الواجهة' : 'الغرف')}
            </span>
            <span className="font-semibold text-[#1B1712]">
              {listing.rooms > 0 ? `${listing.rooms} غرف` : 'مفتوحة'}
            </span>
          </div>

          <div className="bg-[#FAF7F1] py-1.5 px-2 rounded-lg">
            <span className="block text-[11px] text-[#6B6255]/80">المساحة</span>
            <span className="font-semibold text-[#1B1712]">
              {listing.area || '—'}
            </span>
          </div>

          <div className="bg-[#FAF7F1] py-1.5 px-2 rounded-lg">
            <span className="block text-[11px] text-[#6B6255]/80">
              {isStudent ? 'السعة' : 'الدور'}
            </span>
            <span className="font-semibold text-[#1B1712] truncate">
              {isStudent
                ? (listing.capacityStudents ? `${listing.capacityStudents} طلاب` : 'غير محدد')
                : (listing.floor || '—')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
