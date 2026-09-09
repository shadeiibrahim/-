import React, { useState, useEffect } from 'react';
import {
  X,
  Heart,
  Share2,
  MapPin,
  Eye,
  CheckCircle,
  Phone,
  MessageCircle,
  Wifi,
  Wind,
  Refrigerator,
  Sparkles,
  Zap,
  Droplets,
  Flame,
  Layers,
  Users,
  BedDouble,
  Building,
  ExternalLink,
} from 'lucide-react';
import { Listing } from '../types.ts';
import { formatUniversityDistance } from '../lib/haversine.ts';

interface ListingDetailModalProps {
  listing: Listing | null;
  isOpen: boolean;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (id: number) => void;
}

export const ListingDetailModal: React.FC<ListingDetailModalProps> = ({
  listing,
  isOpen,
  onClose,
  isFavorite,
  onToggleFavorite,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [listing?.id]);

  if (!isOpen || !listing) return null;

  const isStudent = listing.category === 'STUDENT';
  const images = listing.images?.length > 0
    ? listing.images
    : ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80'];

  // Haversine distance if lat and lng exist
  const distanceInfo = (listing.lat && listing.lng)
    ? formatUniversityDistance(listing.lat, listing.lng)
    : null;

  // WhatsApp click handler
  const targetWhatsapp = listing.whatsapp || '201550454849';
  const whatsappMsg = `السلام عليكم، بخصوص عقار معروض على أركان للتسويق العقاري: "${listing.title}" كود #${listing.id} بقيمة ${(listing.price ?? 0).toLocaleString('ar-EG')} ج. حابب أستفسر عن التفاصيل وحجز موعد للمعاينة.`;
  const whatsappUrl = `https://wa.me/${targetWhatsapp}?text=${encodeURIComponent(whatsappMsg)}`;

  // Amenities definitions
  const amenitiesList = [
    { key: 'hasAc', label: 'تكييف هوائي', icon: <Wind className="w-4 h-4 text-[#C9A15E]" />, value: listing.hasAc },
    { key: 'hasWifi', label: 'إنترنت واي فاي سريع', icon: <Wifi className="w-4 h-4 text-[#C9A15E]" />, value: listing.hasWifi },
    { key: 'hasFridge', label: 'ثلاجة كهربائية', icon: <Refrigerator className="w-4 h-4 text-[#C9A15E]" />, value: listing.hasFridge },
    { key: 'hasWasher', label: 'غسالة ملابس', icon: <Sparkles className="w-4 h-4 text-[#C9A15E]" />, value: listing.hasWasher },
    { key: 'hasKitchen', label: 'مطبخ مجهز', icon: <Building className="w-4 h-4 text-[#C9A15E]" />, value: listing.hasKitchen },
    { key: 'isFurnished', label: 'شقة مفروشة بالكامل', icon: <BedDouble className="w-4 h-4 text-[#C9A15E]" />, value: listing.isFurnished },
    { key: 'hasWaterHeater', label: 'سخان مياه', icon: <Flame className="w-4 h-4 text-[#C9A15E]" />, value: listing.hasWaterHeater },
    { key: 'hasElectricity', label: 'عداد كهرباء مستقل', icon: <Zap className="w-4 h-4 text-[#C9A15E]" />, value: listing.hasElectricity },
    { key: 'hasWater', label: 'مياه متواصلة / خزان', icon: <Droplets className="w-4 h-4 text-[#C9A15E]" />, value: listing.hasWater },
  ];

  const activeAmenities = amenitiesList.filter((a) => a.value);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: listing.title,
        text: `عقار في أركان: ${listing.title}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-[#E4DDD0] overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header Bar */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-5 py-3.5 border-b border-[#E4DDD0] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#A67C3D] bg-[#FAF3E5] px-2.5 py-1 rounded-lg border border-[#E8DCBF]">
              {isStudent ? 'سكن طلابي' : 'عقار بلد'}
            </span>
            <span className="text-xs text-[#6B6255] font-mono">
              كود العقار: #{listing.id}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-xl text-[#6B6255] hover:text-[#1B1712] hover:bg-[#FAF7F1] border border-[#E4DDD0] transition-colors cursor-pointer"
              title="مشاركة العقار"
            >
              <Share2 className="w-4 h-4" />
            </button>
            {copied && (
              <span className="text-xs text-emerald-600 font-semibold">تم نسخ الرابط!</span>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#6B6255] hover:text-[#1B1712] hover:bg-[#FAF7F1] border border-[#E4DDD0] transition-colors cursor-pointer"
              title="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-5 sm:p-8 space-y-8">
          
          {/* 1. Image Gallery */}
          <div className="space-y-3">
            <div className="relative w-full h-72 sm:h-96 bg-[#17140F] rounded-2xl overflow-hidden shadow-inner">
              <img
                src={images[activeImageIndex] || images[0]}
                alt={listing.title}
                className="w-full h-full object-cover transition-opacity duration-300"
              />

              {/* Status Badge */}
              <div className="absolute top-4 right-4">
                {listing.status === 'RENTED' && (
                  <span className="bg-rose-600 text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow-md">
                    تم التأجير
                  </span>
                )}
                {listing.status === 'RESERVED' && (
                  <span className="bg-amber-600 text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow-md">
                    محجوزة مؤقتًا
                  </span>
                )}
                {listing.status === 'AVAILABLE' && (
                  <span className="bg-emerald-600 text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow-md">
                    متاح للحجز والمعاينة 🟢
                  </span>
                )}
              </div>

              {/* Favorite Button */}
              <div className="absolute top-4 left-4">
                <button
                  type="button"
                  onClick={() => onToggleFavorite(listing.id)}
                  className={`p-3 rounded-2xl shadow-md backdrop-blur-md transition-all cursor-pointer ${
                    isFavorite
                      ? 'bg-rose-50 text-rose-600 scale-110'
                      : 'bg-black/50 hover:bg-black/70 text-white'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-rose-500' : ''}`} />
                </button>
              </div>

              {/* Views Counter */}
              <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-xs text-white text-xs px-3 py-1 rounded-xl flex items-center gap-1.5 font-mono">
                <Eye className="w-3.5 h-3.5 text-[#C9A15E]" />
                <span>{listing.views || 0} مشاهدة</span>
              </div>
            </div>

            {/* Thumbnails strip */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                      activeImageIndex === idx
                        ? 'border-[#C9A15E] scale-95 shadow-sm'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`صورة مصغرة ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 2. Main Title & Meta */}
          <div className="space-y-3">
            {/* If Balad: Property Type & Neighborhood above Title */}
            {!isStudent && (
              <div className="flex items-center gap-2 text-xs font-semibold text-[#A67C3D]">
                <span className="bg-[#FAF3E5] px-2.5 py-1 rounded-md border border-[#E8DCBF]">
                  {listing.propertyType === 'RENT_APARTMENT' && 'شقة عائلية للإيجار'}
                  {listing.propertyType === 'SALE' && 'عقار للبيع والتمليك'}
                  {listing.propertyType === 'COMMERCIAL' && 'محل تجاري'}
                  {listing.propertyType === 'LAND' && 'أرض للبناء'}
                </span>
                {listing.neighborhood && (
                  <span className="text-[#6B6255]">📍 {listing.neighborhood}</span>
                )}
              </div>
            )}

            <h1 className="text-xl sm:text-3xl font-extrabold text-[#1B1712] leading-snug">
              {listing.title}
            </h1>

            <p className="text-sm text-[#6B6255] flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#C9A15E] shrink-0" />
              <span>{listing.address}</span>
            </p>

            {/* Automatic Haversine Distance Line if New City */}
            {isStudent && distanceInfo && (
              <div className="bg-[#FAF3E5] border border-[#E8DCBF] text-[#A67C3D] p-3 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2">
                <span>{distanceInfo.formattedText}</span>
              </div>
            )}
          </div>

          {/* 3. Specs & Sidebar Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Left Content (2 cols) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Description */}
              <div>
                <h3 className="font-bold text-base text-[#1B1712] mb-2 pb-1 border-b border-[#FAF7F1]">
                  وصف العقار بالتفصيل
                </h3>
                <p className="text-sm text-[#1B1712] leading-relaxed whitespace-pre-line bg-[#FAF7F1] p-4 rounded-2xl border border-[#E4DDD0]">
                  {listing.description}
                </p>
              </div>

              {/* Specs Grid */}
              <div>
                <h3 className="font-bold text-base text-[#1B1712] mb-3 pb-1 border-b border-[#FAF7F1]">
                  المواصفات الرئيسية
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-[#FAF7F1] p-3 rounded-xl border border-[#E4DDD0]">
                    <span className="text-[#6B6255] block mb-1">عدد الغرف</span>
                    <strong className="text-[#1B1712] text-sm">{listing.rooms} غرف</strong>
                  </div>

                  <div className="bg-[#FAF7F1] p-3 rounded-xl border border-[#E4DDD0]">
                    <span className="text-[#6B6255] block mb-1">المساحة</span>
                    <strong className="text-[#1B1712] text-sm">{listing.area || '—'}</strong>
                  </div>

                  <div className="bg-[#FAF7F1] p-3 rounded-xl border border-[#E4DDD0]">
                    <span className="text-[#6B6255] block mb-1">الدور / الطابق</span>
                    <strong className="text-[#1B1712] text-sm">{listing.floor || '—'}</strong>
                  </div>

                  <div className="bg-[#FAF7F1] p-3 rounded-xl border border-[#E4DDD0]">
                    <span className="text-[#6B6255] block mb-1">فئة السكن</span>
                    <strong className="text-[#1B1712] text-sm">{listing.gender}</strong>
                  </div>

                  {isStudent && (
                    <>
                      <div className="bg-[#FAF7F1] p-3 rounded-xl border border-[#E4DDD0]">
                        <span className="text-[#6B6255] block mb-1">سعة الشقة</span>
                        <strong className="text-[#1B1712] text-sm">
                          {listing.capacityStudents ? `${listing.capacityStudents} طلاب` : 'حسب الاتفاق'}
                        </strong>
                      </div>

                      <div className="bg-[#FAF7F1] p-3 rounded-xl border border-[#E4DDD0]">
                        <span className="text-[#6B6255] block mb-1">عدد الأسرّة المتاحة</span>
                        <strong className="text-[#1B1712] text-sm">
                          {listing.bedsCount ? `${listing.bedsCount} سرير` : '—'}
                        </strong>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* 9 Amenities Grid (Active only) */}
              <div>
                <h3 className="font-bold text-base text-[#1B1712] mb-3 pb-1 border-b border-[#FAF7F1]">
                  المرافق والتجهيزات المتوفرة ({activeAmenities.length})
                </h3>

                {activeAmenities.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeAmenities.map((amenity) => (
                      <div
                        key={amenity.key}
                        className="flex items-center gap-3 bg-white p-3 rounded-xl border border-[#E4DDD0] shadow-2xs"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#FAF3E5] flex items-center justify-center shrink-0">
                          {amenity.icon}
                        </div>
                        <div className="flex-1">
                          <span className="text-xs font-semibold text-[#1B1712]">
                            {amenity.label}
                          </span>
                        </div>
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#6B6255] bg-[#FAF7F1] p-3 rounded-xl">
                    لا توجد مرافق خاصة مسجلة لهذا العقار
                  </p>
                )}
              </div>

              {/* Location Map Preview */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-1 border-b border-[#FAF7F1]">
                  <h3 className="font-bold text-base text-[#1B1712]">
                    الموقع والخريطة
                  </h3>
                  {listing.lat && listing.lng && (
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${listing.lat},${listing.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#A67C3D] hover:text-[#17140F] bg-[#FAF3E5] hover:bg-[#F3E5C8] border border-[#E8DCBF] px-3 py-1.5 rounded-xl transition-all w-fit cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>فتح في تطبيق خرائط جوجل (Google Maps)</span>
                    </a>
                  )}
                </div>
                {listing.lat && listing.lng ? (
                  <div className="w-full h-60 rounded-2xl overflow-hidden border border-[#E4DDD0] shadow-xs">
                    <iframe
                      title="موقع العقار على الخريطة"
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${listing.lng - 0.005}%2C${listing.lat - 0.005}%2C${listing.lng + 0.005}%2C${listing.lat + 0.005}&layer=mapnik&marker=${listing.lat}%2C${listing.lng}`}
                      className="w-full h-full"
                    />
                  </div>
                ) : (
                  <div className="bg-[#FAF7F1] p-4 rounded-xl border border-[#E4DDD0] text-xs text-[#6B6255]">
                    📍 {listing.address} (تواصل مع المالك للمعاينة وتحديد الموقع بدقة)
                  </div>
                )}
              </div>

            </div>

            {/* Right Sticky Sidebar (Contact & Booking) */}
            <div className="bg-[#FAF7F1] p-5 sm:p-6 rounded-3xl border border-[#E4DDD0] space-y-6 sticky top-20 shadow-xs">
              
              {/* Price Block */}
              <div>
                <span className="text-xs text-[#6B6255] font-semibold block mb-1">
                  قيمة الإيجار / السعر المطلوب
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-black text-[#1B1712]">
                    {(listing.price ?? 0).toLocaleString('ar-EG')}
                  </span>
                  <span className="text-xs font-bold text-[#A67C3D]">
                    {listing.propertyType === 'SALE' || listing.propertyType === 'LAND'
                      ? 'جنيه مصري'
                      : 'جنيه / شهرياً'}
                  </span>
                </div>
                <div className="mt-2 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg inline-block">
                  ✓ 0% عمولة من المستأجر
                </div>
              </div>

              {/* Direct Landlord Phone if available */}
              {listing.landlordPhone && (
                <div className="bg-white p-3.5 rounded-2xl border border-[#E4DDD0]">
                  <span className="text-[11px] text-[#6B6255] block mb-1">رقم هاتف المالك / المسؤول</span>
                  <a
                    href={`tel:${listing.landlordPhone}`}
                    className="flex items-center justify-between text-sm font-bold text-[#1B1712] hover:text-[#A67C3D]"
                  >
                    <span>{listing.landlordPhone}</span>
                    <Phone className="w-4 h-4 text-[#C9A15E]" />
                  </a>
                </div>
              )}

              {/* Primary WhatsApp Action */}
              <div className="space-y-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#25D366] hover:bg-[#1EBE5D] text-white py-3.5 px-4 rounded-2xl font-bold text-sm sm:text-base transition-all shadow-md flex items-center justify-center gap-2 active:scale-95"
                >
                  <MessageCircle className="w-5 h-5 fill-current" />
                  <span>تواصل عبر واتساب</span>
                </a>
                <p className="text-[11px] text-[#6B6255] text-center">
                  سيتم فتح محادثة مباشرة مع رسالة مجهزة ببيانات الشقة
                </p>
              </div>

              {/* Guarantee badge */}
              <div className="pt-4 border-t border-[#E4DDD0] text-center space-y-1">
                <span className="text-xs font-bold text-[#1B1712] block">
                  أركان للتسويق العقاري
                </span>
                <span className="text-[11px] text-[#6B6255] block">
                  غيّرنا شكل السمسرة • 30 جنيه فقط للمُعلن
                </span>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
