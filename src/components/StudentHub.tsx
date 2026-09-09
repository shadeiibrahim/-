import React from 'react';
import { Bus, ShoppingCart, Pill, UtensilsCrossed, Shirt, MapPin } from 'lucide-react';
import { SiteSettings, TransportCategory } from '../types.ts';

interface StudentHubProps {
  siteSettings?: SiteSettings;
}

const DEFAULT_SERVICES_DATA = [
  {
    id: 'transport',
    icon: '🚌',
    title: 'مواصلات الجامعة والخطوط',
    badge: 'بوابات ومواقف',
    places: [
      { name: 'موقف ميكروباص الجامعة الرئيسي', note: 'أمام البوابة الشمالية لكليات العلوم والصيدلة', distance: '1 دقيقة' },
      { name: 'خط المساعيد - الجامعة الداخلي', note: 'متاح كل 5 دقائق على مدار اليوم', distance: 'مباشر' },
      { name: 'أتوبيسات نقل الطلاب للمحافظات', note: 'موقف الأمل يومي الخميس والجمعة', distance: '8 دقائق' },
    ],
  },
  {
    id: 'markets',
    icon: '🛒',
    title: 'سوبر ماركت وبقالة',
    badge: 'احتياجات يومية',
    places: [
      { name: 'هايبر ماركت البركة', note: 'توصيل مجاني لسكن الطلاب حتى 2 صباحاً', distance: '3 دقائق' },
      { name: 'ماركت المدينة الطلابية', note: 'أجبان، مأكولات سريعة، مستلزمات دراسية', distance: '5 دقائق' },
      { name: 'سوبر ماركت أولاد رجب الفرع الجديد', note: 'خضار وفواكه طازجة ولحوم', distance: '7 دقائق' },
    ],
  },
  {
    id: 'pharmacies',
    icon: '💊',
    title: 'صيدليات وخدمات طبية',
    badge: 'طوارئ 24/7',
    places: [
      { name: 'صيدلية النور (خدمة 24 ساعة)', note: 'شارع أسيوط، خصم خاص لطلاب جامعة سيناء', distance: '4 دقائق' },
      { name: 'صيدلية الشفاء التخصصية', note: 'توصيل سريع للسكن والأدوية المستوردة', distance: '6 دقائق' },
      { name: 'مجمع العيادات التخصصي الخيري', note: 'كشف واستشارات طبية بأسعار رمزية للطلاب', distance: '9 دقائق' },
    ],
  },
  {
    id: 'restaurants',
    icon: '🍽️',
    title: 'مطاعم وكافيهات للمذاكرة',
    badge: 'وجبات وواي فاي',
    places: [
      { name: 'كافيه سنترال ستيودنت (Student Zone)', note: 'أماكن هادئة للمذاكرة، نت فايبر سريع، مشروبات', distance: '3 دقائق' },
      { name: 'مطعم حضرموت سيناء للوجبات', note: 'وجبات غداء اقتصادية خاصة بالطلبة', distance: '5 دقائق' },
      { name: 'شاورما وجريل الشام', note: 'سندوتشات سريعة ودليفري حتى الفجر', distance: '4 دقائق' },
    ],
  },
  {
    id: 'laundry',
    icon: '🧺',
    title: 'مغاسل ودراي كلين',
    badge: 'تنظيف وكي',
    places: [
      { name: 'مغسلة الأمانة السريعة للطلاب', note: 'غسيل وكي ملابس السكن مع الاستلام والتوصيل', distance: '4 دقائق' },
      { name: 'دراي كلين النجوم بالمساعيد', note: 'تنظيف البطاطين والمفروشات بالبخار', distance: '6 دقائق' },
      { name: 'مغسلة إكسبريس الحديثة', note: 'خدمة تسليم خلال 3 ساعات', distance: '7 دقائق' },
    ],
  },
];

export const StudentHub: React.FC<StudentHubProps> = ({ siteSettings }) => {
  const badgeText = siteSettings?.studentHubBadge || '📍 دليل الطالب في سيناء';
  const titleText = siteSettings?.studentHubTitle || 'الخدمات القريبة من جامعة سيناء';
  const subtitleText = siteSettings?.studentHubSubtitle || 'كل ما تحتاجه يومياً حول محيط سكنك الجامعي وقاعات المحاضرات';

  const categories: TransportCategory[] = siteSettings?.transportCategories && siteSettings.transportCategories.length > 0
    ? siteSettings.transportCategories
    : DEFAULT_SERVICES_DATA;

  return (
    <div className="mt-14 pt-10 border-t border-[#E4DDD0]">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-[#FAF3E5] text-[#A67C3D] px-3 py-1 rounded-full text-xs font-bold mb-2 border border-[#E8DCBF]">
            <span>{badgeText}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1B1712]">
            {titleText}
          </h2>
          <p className="text-sm text-[#6B6255] mt-1">
            {subtitleText}
          </p>
        </div>

        <div className="text-xs text-[#6B6255] bg-white px-3 py-1.5 rounded-xl border border-[#E4DDD0] shadow-2xs self-start">
          ✓ تم التحقق من العناوين ومسافات المشي
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white rounded-2xl border border-[#E4DDD0] p-5 shadow-xs hover:border-[#C9A15E] transition-all"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#FAF7F1]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#FAF7F1] flex items-center justify-center border border-[#E4DDD0] text-base">
                  {cat.icon || '📍'}
                </div>
                <h3 className="font-bold text-sm sm:text-base text-[#1B1712]">
                  {cat.title}
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-[#A67C3D] bg-[#FAF3E5] px-2 py-0.5 rounded-md">
                {cat.badge}
              </span>
            </div>

            {/* Places List */}
            <div className="space-y-3">
              {cat.places && cat.places.map((place, idx) => (
                <div
                  key={idx}
                  className="bg-[#FAF7F1] p-3 rounded-xl border border-[#E4DDD0]/60 hover:bg-[#FAF3E5]/40 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-semibold text-xs text-[#1B1712]">
                      {place.name}
                    </span>
                    <span className="text-[10px] font-mono text-[#6B6255] bg-white px-1.5 py-0.5 rounded border border-[#E4DDD0]">
                      {place.distance}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6B6255] leading-relaxed">
                    {place.note}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
