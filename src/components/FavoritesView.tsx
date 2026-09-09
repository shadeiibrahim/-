import React from 'react';
import { Heart, ArrowRight, Trash2 } from 'lucide-react';
import { Listing } from '../types.ts';
import { ListingCard } from './ListingCard.tsx';

interface FavoritesViewProps {
  listings: Listing[];
  favorites: number[];
  comparedIds: number[];
  onToggleFavorite: (id: number) => void;
  onToggleCompare: (listing: Listing) => void;
  onSelectListing: (id: number) => void;
  onClearFavorites: () => void;
  onBackToHome: () => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  listings,
  favorites,
  comparedIds,
  onToggleFavorite,
  onToggleCompare,
  onSelectListing,
  onClearFavorites,
  onBackToHome,
}) => {
  const favoriteListings = listings.filter((l) => favorites.includes(l.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-[#E4DDD0]">
        <div>
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-1.5 text-xs text-[#6B6255] hover:text-[#1B1712] font-semibold mb-2 cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة للشقق المتاحة</span>
          </button>
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1B1712]">
              الشقق المحفوظة في المفضلة
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#6B6255] mt-1">
            تم حفظ هذه العقارات محليًا في جهازك للرجوع إليها في أي وقت بدون الحاجة لتسجيل حساب
          </p>
        </div>

        {favoriteListings.length > 0 && (
          <button
            onClick={onClearFavorites}
            className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 px-4 py-2.5 rounded-xl border border-rose-200 cursor-pointer self-start"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>مسح كل المفضلة</span>
          </button>
        )}
      </div>

      {/* Content */}
      {favoriteListings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteListings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              isFavorite={true}
              isCompared={comparedIds.includes(listing.id)}
              onToggleFavorite={onToggleFavorite}
              onToggleCompare={onToggleCompare}
              onClick={onSelectListing}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-dashed border-[#E4DDD0] p-12 text-center max-w-md mx-auto my-12">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-400 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-[#1B1712] mb-2">
            قائمة المفضلة فارغة حاليًا
          </h2>
          <p className="text-xs sm:text-sm text-[#6B6255] leading-relaxed mb-6">
            اضغط على علامة القلب ❤️ في أي شقة أثناء تصفحك للموقع لحفظها هنا ومقارنتها لاحقًا بسهولة.
          </p>
          <button
            onClick={onBackToHome}
            className="bg-[#17140F] hover:bg-[#2A241B] text-[#FAF7F1] px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-sm cursor-pointer"
          >
            تصفح الشقق المتاحة الآن
          </button>
        </div>
      )}
    </div>
  );
};
