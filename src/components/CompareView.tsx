import React from 'react';
import { ArrowRight, Trash2, Check, Minus, MessageCircle } from 'lucide-react';
import { Listing } from '../types.ts';

interface CompareViewProps {
  comparedListings: Listing[];
  onRemoveFromCompare: (id: number) => void;
  onClearCompare: () => void;
  onSelectListing: (id: number) => void;
  onBackToHome: () => void;
}

export const CompareView: React.FC<CompareViewProps> = ({
  comparedListings,
  onRemoveFromCompare,
  onClearCompare,
  onSelectListing,
  onBackToHome,
}) => {
  const amenitiesKeys = [
    { key: 'hasAc', label: 'تكييف هوائي' },
    { key: 'hasWifi', label: 'واي فاي فائق السرعة' },
    { key: 'hasFridge', label: 'ثلاجة' },
    { key: 'hasWasher', label: 'غسالة ملابس' },
    { key: 'hasKitchen', label: 'مطبخ مجهز' },
    { key: 'isFurnished', label: 'مفروشة بالكامل' },
    { key: 'hasWaterHeater', label: 'سخان مياه' },
    { key: 'hasElectricity', label: 'عداد كهرباء مستقل' },
    { key: 'hasWater', label: 'مياه متواصلة / خزان' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-[#E4DDD0]">
        <div>
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-1.5 text-xs text-[#6B6255] hover:text-[#1B1712] font-semibold mb-2 cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة للتصفح</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1B1712]">
            جدول المقارنة بين العقارات
          </h1>
          <p className="text-xs sm:text-sm text-[#6B6255] mt-1">
            قارن بين الأسعار، المواصفات، والمرافق التسعة المتوفرة لاتخاذ القرار الأنسب
          </p>
        </div>

        {comparedListings.length > 0 && (
          <button
            onClick={onClearCompare}
            className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 px-4 py-2.5 rounded-xl border border-rose-200 cursor-pointer self-start"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>مسح المقارنة</span>
          </button>
        )}
      </div>

      {comparedListings.length >= 1 ? (
        <div className="overflow-x-auto pb-6">
          <table className="w-full min-w-[700px] border-collapse bg-white rounded-3xl overflow-hidden border border-[#E4DDD0] shadow-xs text-xs sm:text-sm">
            <thead>
              <tr className="bg-[#17140F] text-[#FAF7F1] divide-x divide-x-reverse divide-[#2A241B]">
                <th className="p-4 text-right font-bold w-48 shrink-0">
                  المقارنة / العقار
                </th>
                {comparedListings.map((listing) => (
                  <th key={listing.id} className="p-4 text-center font-bold relative min-w-[200px]">
                    <button
                      onClick={() => onRemoveFromCompare(listing.id)}
                      className="absolute top-2 left-2 text-rose-400 hover:text-rose-300 p-1 rounded-lg hover:bg-white/10 cursor-pointer"
                      title="إزالة"
                    >
                      ✕
                    </button>
                    <div className="w-full h-28 rounded-xl overflow-hidden mb-2 bg-[#2A241B]">
                      <img
                        src={listing.images?.[0] || ''}
                        alt={listing.title}
                        className="w-full h-full object-cover cursor-pointer hover:opacity-90"
                        onClick={() => onSelectListing(listing.id)}
                      />
                    </div>
                    <button
                      onClick={() => onSelectListing(listing.id)}
                      className="hover:underline text-[#C9A15E] line-clamp-2 text-xs font-bold"
                    >
                      {listing.title}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-[#E4DDD0]">
              {/* Price */}
              <tr className="bg-[#FAF7F1]/50 divide-x divide-x-reverse divide-[#E4DDD0]">
                <td className="p-3.5 font-bold text-[#1B1712]">السعر الشهري</td>
                {comparedListings.map((l) => (
                  <td key={l.id} className="p-3.5 text-center font-bold text-base text-[#1B1712]">
                    {(l.price ?? 0).toLocaleString('ar-EG')} ج.م
                  </td>
                ))}
              </tr>

              {/* Rooms */}
              <tr className="divide-x divide-x-reverse divide-[#E4DDD0]">
                <td className="p-3.5 font-semibold text-[#6B6255]">عدد الغرف</td>
                {comparedListings.map((l) => (
                  <td key={l.id} className="p-3.5 text-center font-medium">
                    {l.rooms} غرف
                  </td>
                ))}
              </tr>

              {/* Distance */}
              <tr className="bg-[#FAF7F1]/50 divide-x divide-x-reverse divide-[#E4DDD0]">
                <td className="p-3.5 font-semibold text-[#6B6255]">المسافة للجامعة / المنطقة</td>
                {comparedListings.map((l) => (
                  <td key={l.id} className="p-3.5 text-center font-medium text-[#A67C3D]">
                    {l.category === 'STUDENT' ? `${l.distanceMin} دقيقة مشي` : (l.neighborhood || 'البلد')}
                  </td>
                ))}
              </tr>

              {/* Type / Gender */}
              <tr className="divide-x divide-x-reverse divide-[#E4DDD0]">
                <td className="p-3.5 font-semibold text-[#6B6255]">نوع السكن / العقار</td>
                {comparedListings.map((l) => (
                  <td key={l.id} className="p-3.5 text-center font-medium">
                    {l.gender}
                  </td>
                ))}
              </tr>

              {/* Area */}
              <tr className="bg-[#FAF7F1]/50 divide-x divide-x-reverse divide-[#E4DDD0]">
                <td className="p-3.5 font-semibold text-[#6B6255]">المساحة</td>
                {comparedListings.map((l) => (
                  <td key={l.id} className="p-3.5 text-center font-medium">
                    {l.area || '—'}
                  </td>
                ))}
              </tr>

              {/* Floor */}
              <tr className="divide-x divide-x-reverse divide-[#E4DDD0]">
                <td className="p-3.5 font-semibold text-[#6B6255]">الدور</td>
                {comparedListings.map((l) => (
                  <td key={l.id} className="p-3.5 text-center font-medium">
                    {l.floor || '—'}
                  </td>
                ))}
              </tr>

              {/* 9 Amenities Rows */}
              {amenitiesKeys.map((amenity, idx) => (
                <tr
                  key={amenity.key}
                  className={`${idx % 2 === 0 ? 'bg-[#FAF7F1]/30' : ''} divide-x divide-x-reverse divide-[#E4DDD0]`}
                >
                  <td className="p-3.5 text-[#1B1712] font-medium">
                    {amenity.label}
                  </td>
                  {comparedListings.map((l) => {
                    const hasIt = Boolean((l as any)[amenity.key]);
                    return (
                      <td key={l.id} className="p-3.5 text-center">
                        {hasIt ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold">
                            <Check className="w-4 h-4" />
                          </span>
                        ) : (
                          <span className="text-[#6B6255]/40 text-base font-bold">
                            <Minus className="w-4 h-4 mx-auto" />
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* Action Rows */}
              <tr className="bg-white divide-x divide-x-reverse divide-[#E4DDD0]">
                <td className="p-4 font-bold text-[#1B1712]">التواصل والحجز</td>
                {comparedListings.map((l) => (
                  <td key={l.id} className="p-4 text-center">
                    <a
                      href={`https://wa.me/${l.whatsapp || '201550454849'}?text=${encodeURIComponent(`السلام عليكم، بخصوص العقار #${l.id}: ${l.title} المعروض على أركان، حابب أستفسر عنه.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-xs"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>واتساب</span>
                    </a>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-dashed border-[#E4DDD0] p-12 text-center max-w-md mx-auto my-12">
          <h2 className="text-xl font-bold text-[#1B1712] mb-2">
            لم تقم باختيار شقق للمقارنة بعد
          </h2>
          <p className="text-xs sm:text-sm text-[#6B6255] leading-relaxed mb-6">
            اضغط على زرار "+ قارن" الموجود في بطاقة أي شقة لإضافتها هنا والمقارنة حتى 4 شقق في نفس الوقت.
          </p>
          <button
            onClick={onBackToHome}
            className="bg-[#17140F] hover:bg-[#2A241B] text-[#FAF7F1] px-6 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer"
          >
            تصفح الشقق الآن
          </button>
        </div>
      )}
    </div>
  );
};
