import { SiteSettings } from '../types.ts';

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  siteName: 'أركان للتسويق العقاري',
  siteSlogan: 'غيّرنا شكل السمسرة',
  logoUrl: '/logo.png',
  logoLetter: 'A',
  commissionBadge: '0% عمولة',
  pricingModelText: '30 جنيه فقط للمُعلن • 0% من المستأجر',
  heroNotice: 'أول منصة رقمية متخصصة لسكن طلاب جامعة سيناء وعقارات العريش بدون سماسرة',
  phone: '01550454849',
  whatsappNumber: '201550454849',
  whatsappWelcomeMsg: 'السلام عليكم، حابب أعرض عقاري مع أركان للتسويق العقاري بميزة الـ 30 جنيه فقط و 0% عمولة.',
  facebookUrl: 'https://www.facebook.com/share/17e8UBzfbi/',
  instagramUrl: 'https://www.instagram.com/arkan_real_estate?stkn=MWhqc21nbm1pZnZkMw==',
  tiktokUrl: 'https://www.tiktok.com/@arkan_real_estate?_r=1&_t=ZS-99YaNTroP3K',
  footerDesc: 'المنصة المتخصصة الأولى لسكن طلاب جامعة سيناء بالعريش، وعقارات البلد للأهالي والسكان المحليين. تعامل مباشر وبدون وسيط.',
  copyrightText: 'أركان للتسويق العقاري (Arkan Real Estate Marketing). جميع الحقوق محفوظة.',
  aboutTitle: 'لماذا أسسنا "أركان"؟',
  aboutText: 'تأسست أركان للتسويق العقاري كأول منصة رقمية متخصصة تجمع بين السكن الطلابي لجامعة سيناء بالعريش وسوق العقارات المحلي في البلد. هدفنا التخلص تمامًا من أسلوب السمسرة التقليدي والعمولات الباهظة التي تثقل كاهل الطلاب والأهالي.',
  aboutPoints: [
    { title: 'عمولة صفر على المستأجر', desc: 'الطالب أو المستأجر لا يدفع أي عمولة أو رسوم معاينة نهائيًا.', badge: '0%' },
    { title: '30 جنيه فقط للمالك', desc: 'رسم رمزي ثابت للمالك أو المُعلن لعرض شقته وتسويقها حتى يتم تأجيرها.', badge: '30 ج' },
    { title: 'عقود وإجراءات موثوقة', desc: 'تواصل وتنسيق مباشر بين الطرفين بشفافية كاملة وصور حقيقية.', badge: 'موثق' },
    { title: 'تغطية شاملة للمدينة والبلد', desc: 'سكن طلاب قريب من كليات جامعة سيناء + شقق عائلية وأراضي وتجاري.', badge: 'شامل' }
  ],
  mapCenterLat: 31.1340,
  mapCenterLng: 33.8055,
  mapDefaultZoom: 15,
  universityGateName: 'بوابة جامعة سيناء الرئيسية',
  universityGateNote: 'نقطة قياس مسافات السكن الطلابي',
  mapLandmarks: [
    {
      id: 'uni-gate-main',
      name: 'بوابة جامعة سيناء الرئيسية',
      category: 'university',
      note: 'البوابة الشمالية أمام كليات الصيدلة وطب الأسنان والعلوم',
      lat: 31.1340,
      lng: 33.8055,
      icon: '🎓'
    },
    {
      id: 'student-parking',
      name: 'موقف سيارات وميكروباص الطلاب',
      category: 'transport',
      note: 'موقف الانتقالات الداخلي وسيارات المساعيد والمحافظات',
      lat: 31.1332,
      lng: 33.8042,
      icon: '🚌'
    },
    {
      id: 'baraka-market',
      name: 'هايبر ماركت البركة',
      category: 'market',
      note: 'أكبر مركز تسوق غذائي قريب من سكن الطلاب',
      lat: 31.1355,
      lng: 33.8080,
      icon: '🛒'
    },
    {
      id: 'nour-pharmacy',
      name: 'صيدلية النور (24 ساعة)',
      category: 'hospital',
      note: 'خدمة 24/7 مع توصيل سريع للسكن الجامعي',
      lat: 31.1325,
      lng: 33.8070,
      icon: '💊'
    },
    {
      id: 'masaeed-beach',
      name: 'كورنيش وشاطئ المساعيد',
      category: 'beach',
      note: 'متنزه ترفيهي وكافيهات مطلة على البحر للطلاب',
      lat: 31.1410,
      lng: 33.8020,
      icon: '🌊'
    }
  ],
  transportHeaderTitle: 'الخدمات القريبة من جامعة سيناء',
  transportHeaderSubtitle: 'كل ما تحتاجه يومياً حول محيط سكنك الجامعي وقاعات المحاضرات',
  transportCategories: [
    {
      id: 'transport',
      icon: 'bus',
      title: 'مواصلات الجامعة والخطوط',
      badge: 'بوابات ومواقف',
      places: [
        { name: 'موقف ميكروباص الجامعة الرئيسي', note: 'أمام البوابة الشمالية لكليات العلوم والصيدلة', distance: '1 دقيقة' },
        { name: 'خط المساعيد - الجامعة الداخلي', note: 'متاح كل 5 دقائق على مدار اليوم', distance: 'مباشر' },
        { name: 'أتوبيسات نقل الطلاب للمحافظات', note: 'موقف الأمل يومي الخميس والجمعة', distance: '8 دقائق' }
      ]
    },
    {
      id: 'markets',
      icon: 'shopping-cart',
      title: 'سوبر ماركت وبقالة',
      badge: 'احتياجات يومية',
      places: [
        { name: 'هايبر ماركت البركة', note: 'توصيل مجاني لسكن الطلاب حتى 2 صباحاً', distance: '3 دقائق' },
        { name: 'ماركت المدينة الطلابية', note: 'أجبان، مأكولات سريعة، مستلزمات دراسية', distance: '5 دقائق' },
        { name: 'سوبر ماركت أولاد رجب الفرع الجديد', note: 'خضار وفواكه طازجة ولحوم', distance: '7 دقائق' }
      ]
    },
    {
      id: 'pharmacies',
      icon: 'pill',
      title: 'صيدليات وخدمات طبية',
      badge: 'طوارئ 24/7',
      places: [
        { name: 'صيدلية النور (خدمة 24 ساعة)', note: 'شارع أسيوط، خصم خاص لطلاب جامعة سيناء', distance: '4 دقائق' },
        { name: 'صيدلية الشفاء التخصصية', note: 'توصيل سريع للسكن والأدوية المستوردة', distance: '6 دقائق' },
        { name: 'مجمع العيادات التخصصي الخيري', note: 'كشف واستشارات طبية بأسعار رمزية للطلاب', distance: '9 دقائق' }
      ]
    },
    {
      id: 'restaurants',
      icon: 'utensils',
      title: 'مطاعم وكافيهات للمذاكرة',
      badge: 'وجبات وواي فاي',
      places: [
        { name: 'كافيه سنترال ستيودنت (Student Zone)', note: 'أماكن هادئة للمذاكرة، نت فايبر سريع، مشروبات', distance: '3 دقائق' },
        { name: 'مطعم حضرموت سيناء للوجبات', note: 'وجبات غداء اقتصادية خاصة بالطلبة', distance: '5 دقائق' },
        { name: 'شاورما وجريل الشام', note: 'سندوتشات سريعة ودليفري حتى الفجر', distance: '4 دقائق' }
      ]
    },
    {
      id: 'laundry',
      icon: 'shirt',
      title: 'مغاسل ودراي كلين',
      badge: 'تنظيف وكي',
      places: [
        { name: 'مغسلة الأمانة السريعة للطلاب', note: 'غسيل وكي ملابس السكن مع الاستلام والتوصيل', distance: '4 دقائق' },
        { name: 'دراي كلين النجوم بالمساعيد', note: 'تنظيف البطاطين والمفروشات بالبخار', distance: '6 دقائق' },
        { name: 'مغسلة إكسبريس الحديثة', note: 'خدمة تسليم خلال 3 ساعات', distance: '7 دقائق' }
      ]
    }
  ]
};
