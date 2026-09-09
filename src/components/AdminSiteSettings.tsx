import React, { useState } from 'react';
import {
  Save,
  RotateCcw,
  Upload,
  Image as ImageIcon,
  MapPin,
  Bus,
  FileText,
  Phone,
  MessageCircle,
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  Check,
  AlertCircle,
  Layers,
  Compass,
  ExternalLink,
} from 'lucide-react';
import { SiteSettings, MapLandmark, ServiceCategory, ServicePlace, AboutPoint } from '../types.ts';
import { updateSiteSettings, resetSiteSettings } from '../lib/api.ts';
import { MapLocationPicker } from './MapLocationPicker.tsx';

interface AdminSiteSettingsProps {
  settings: SiteSettings;
  onSettingsUpdated: (updated: SiteSettings) => void;
}

export const AdminSiteSettings: React.FC<AdminSiteSettingsProps> = ({
  settings: initialSettings,
  onSettingsUpdated,
}) => {
  const [form, setForm] = useState<SiteSettings>({ ...initialSettings });
  const [activeSection, setActiveSection] = useState<'branding' | 'map' | 'transport' | 'footer'>('branding');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState<boolean>(false);

  // New Landmark Modal / Form State
  const [isLandmarkModalOpen, setIsLandmarkModalOpen] = useState<boolean>(false);
  const [editingLandmarkId, setEditingLandmarkId] = useState<string | null>(null);
  const [landmarkForm, setLandmarkForm] = useState<MapLandmark>({
    id: '',
    name: '',
    category: 'landmark',
    note: '',
    lat: 31.1340,
    lng: 33.8055,
    icon: '📍',
  });

  // Handle Input Changes in General Settings
  const handleChange = (key: keyof SiteSettings, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // Upload Logo
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('يرجى اختيار ملف صورة صالح (PNG, JPG, WEBP)');
      return;
    }

    setIsUploadingLogo(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = (reader.result as string).split(',')[1];
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('arkan_admin_token') || ''}`,
          },
          body: JSON.stringify({
            data: base64,
            filename: file.name,
            mimeType: file.type,
          }),
        });
        const json = await res.json();
        if (json.url) {
          handleChange('logoUrl', json.url);
          setStatusMsg({ type: 'success', text: 'تم رفع صورة الشعار بنجاح! لا تنس الضغط على حفظ التغييرات' });
        } else {
          alert(json.error || 'فشل رفع الصورة');
        }
      } catch (err: any) {
        alert('حدث خطأ أثناء رفع الصورة: ' + err.message);
      } finally {
        setIsUploadingLogo(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Save Settings
  const handleSave = async () => {
    setIsSaving(true);
    setStatusMsg(null);
    try {
      const res = await updateSiteSettings(form);
      if (res.success) {
        onSettingsUpdated(res.settings);
        setForm({ ...res.settings });
        setStatusMsg({ type: 'success', text: 'تم حفظ كافة تعديلات وإعدادات الموقع بنجاح!' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'فشل حفظ الإعدادات' });
    } finally {
      setIsSaving(false);
    }
  };

  // Reset Settings
  const handleReset = async () => {
    if (!confirm('هل أنت متأكد من استعادة كافة إعدادات ونصوص الموقع الافتراضية الأصلية؟')) {
      return;
    }
    setIsResetting(true);
    setStatusMsg(null);
    try {
      const res = await resetSiteSettings();
      if (res.success) {
        onSettingsUpdated(res.settings);
        setForm({ ...res.settings });
        setStatusMsg({ type: 'success', text: 'تمت استعادة إعدادات ونصوص الموقع الافتراضية بنجاح!' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'فشل استعادة الإعدادات' });
    } finally {
      setIsResetting(false);
    }
  };

  // --- MAP LANDMARKS MANAGEMENT ---
  const handleOpenAddLandmark = () => {
    setEditingLandmarkId(null);
    setLandmarkForm({
      id: 'landmark-' + Date.now(),
      name: '',
      category: 'landmark',
      note: '',
      lat: 31.1340,
      lng: 33.8055,
      icon: '📍',
    });
    setIsLandmarkModalOpen(true);
  };

  const handleOpenEditLandmark = (item: MapLandmark) => {
    setEditingLandmarkId(item.id);
    setLandmarkForm({ ...item });
    setIsLandmarkModalOpen(true);
  };

  const handleSaveLandmark = () => {
    if (!landmarkForm.name.trim()) {
      alert('يرجى كتابة اسم المكان أو العلامة');
      return;
    }
    if (editingLandmarkId) {
      setForm((prev) => ({
        ...prev,
        mapLandmarks: prev.mapLandmarks.map((lm) =>
          lm.id === editingLandmarkId ? landmarkForm : lm
        ),
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        mapLandmarks: [...prev.mapLandmarks, landmarkForm],
      }));
    }
    setIsLandmarkModalOpen(false);
  };

  const handleDeleteLandmark = (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المكان من الخريطة؟')) return;
    setForm((prev) => ({
      ...prev,
      mapLandmarks: prev.mapLandmarks.filter((lm) => lm.id !== id),
    }));
  };

  // --- TRANSPORT & SERVICES MANAGEMENT ---
  const handleAddServicePlace = (catIndex: number) => {
    const name = prompt('اسم المحطة أو الخدمة أو الخط:');
    if (!name) return;
    const distance = prompt('المسافة أو زمن الوصول (مثال: 3 دقائق أو مباشر):') || 'قريب';
    const note = prompt('ملاحظات تفصيلية (مثال: متوفر طوال اليوم):') || '';

    setForm((prev) => {
      const updatedCats = [...prev.transportCategories];
      updatedCats[catIndex] = {
        ...updatedCats[catIndex],
        places: [...updatedCats[catIndex].places, { name, distance, note }],
      };
      return { ...prev, transportCategories: updatedCats };
    });
  };

  const handleDeleteServicePlace = (catIndex: number, placeIndex: number) => {
    setForm((prev) => {
      const updatedCats = [...prev.transportCategories];
      const newPlaces = [...updatedCats[catIndex].places];
      newPlaces.splice(placeIndex, 1);
      updatedCats[catIndex] = { ...updatedCats[catIndex], places: newPlaces };
      return { ...prev, transportCategories: updatedCats };
    });
  };

  const handleAddCategory = () => {
    const title = prompt('عنوان القسم الجديد (مثال: مكتبات وخدمات طباعة):');
    if (!title) return;
    const badge = prompt('الشارة التعريفية (مثال: تصوير وطباعة):') || 'خدمة طلابية';

    const newCategory: ServiceCategory = {
      id: 'cat-' + Date.now(),
      title,
      badge,
      icon: 'map-pin',
      places: [],
    };

    setForm((prev) => ({
      ...prev,
      transportCategories: [...prev.transportCategories, newCategory],
    }));
  };

  const handleDeleteCategory = (catIndex: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا القسم بالكامل؟')) return;
    setForm((prev) => {
      const newCats = [...prev.transportCategories];
      newCats.splice(catIndex, 1);
      return { ...prev, transportCategories: newCats };
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Header & Save Actions */}
      <div className="bg-white rounded-3xl p-6 border border-[#E4DDD0] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-[#FAF3E5] text-[#A67C3D]">
              <Sparkles className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-[#1B1712]">
              التحكم الشامل في محتوى ونصوص وإعدادات الموقع
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#6B6255]">
            تغيير شعار الموقع، النصوص، الخريطة التفاعلية، دليل المواصلات، وأسفل الموقع (الفوتر).
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={handleReset}
            disabled={isResetting || isSaving}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold cursor-pointer transition-all"
            title="استعادة الإعدادات والنصوص الافتراضية الأصلية"
          >
            <RotateCcw className={`w-4 h-4 ${isResetting ? 'animate-spin' : ''}`} />
            <span>استعادة الافتراضي</span>
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#17140F] hover:bg-[#2A241B] text-[#C9A15E] px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-md cursor-pointer transition-all active:scale-95 disabled:opacity-50"
          >
            <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
            <span>{isSaving ? 'جاري الحفظ...' : 'حفظ كافة التغييرات'}</span>
          </button>
        </div>
      </div>

      {/* Status Message Notification */}
      {statusMsg && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-sm font-medium ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMsg.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span>{statusMsg.text}</span>
          </div>
          <button onClick={() => setStatusMsg(null)} className="text-xs underline cursor-pointer">
            إغلاق
          </button>
        </div>
      )}

      {/* Section Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setActiveSection('branding')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 ${
            activeSection === 'branding'
              ? 'bg-[#17140F] text-[#C9A15E] shadow-sm'
              : 'bg-white text-[#6B6255] hover:bg-[#FAF7F1] border border-[#E4DDD0]'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>الشعار والنصوص الرئيسية</span>
        </button>

        <button
          onClick={() => setActiveSection('map')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 ${
            activeSection === 'map'
              ? 'bg-[#17140F] text-[#C9A15E] shadow-sm'
              : 'bg-white text-[#6B6255] hover:bg-[#FAF7F1] border border-[#E4DDD0]'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>الخريطة التفاعلية والأماكن ({form.mapLandmarks.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('transport')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 ${
            activeSection === 'transport'
              ? 'bg-[#17140F] text-[#C9A15E] shadow-sm'
              : 'bg-white text-[#6B6255] hover:bg-[#FAF7F1] border border-[#E4DDD0]'
          }`}
        >
          <Bus className="w-4 h-4" />
          <span>دليل المواصلات والخدمات</span>
        </button>

        <button
          onClick={() => setActiveSection('footer')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 ${
            activeSection === 'footer'
              ? 'bg-[#17140F] text-[#C9A15E] shadow-sm'
              : 'bg-white text-[#6B6255] hover:bg-[#FAF7F1] border border-[#E4DDD0]'
          }`}
        >
          <Phone className="w-4 h-4" />
          <span>أرقام التواصل والفوتر</span>
        </button>
      </div>

      {/* SECTION 1: BRANDING & TEXTS */}
      {activeSection === 'branding' && (
        <div className="space-y-6">
          {/* Logo & Identity */}
          <div className="bg-white rounded-3xl p-6 border border-[#E4DDD0] shadow-xs space-y-5">
            <h3 className="text-base font-bold text-[#1B1712] flex items-center gap-2 border-b border-[#FAF7F1] pb-3">
              <ImageIcon className="w-4 h-4 text-[#C9A15E]" />
              <span>لوجو وشعار الموقع</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* Logo Preview */}
              <div className="flex flex-col items-center justify-center p-6 bg-[#FAF7F1] rounded-2xl border border-[#E4DDD0]">
                <span className="text-xs text-[#6B6255] mb-2 font-medium">المعاينة الحالية للشعار:</span>
                <div className="w-20 h-20 rounded-2xl bg-[#17140F] border-2 border-[#C9A15E] overflow-hidden flex items-center justify-center shadow-md mb-2">
                  <img
                    src={form.logoUrl || '/logo.png'}
                    alt="Logo preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <span className="text-[#C9A15E] font-bold text-2xl">{form.logoLetter || 'A'}</span>
                </div>
                <span className="text-xs font-bold text-[#1B1712]">{form.siteName}</span>
                <span className="text-[11px] text-[#C9A15E]">{form.siteSlogan}</span>
              </div>

              {/* Logo Inputs */}
              <div className="md:col-span-2 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#1B1712] mb-1">
                    رابط صورة اللوجو (URL)
                  </label>
                  <input
                    type="text"
                    value={form.logoUrl}
                    onChange={(e) => handleChange('logoUrl', e.target.value)}
                    placeholder="/logo.png أو رابط صورة خارجي مباشر"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4DDD0] text-sm focus:outline-none focus:border-[#C9A15E]"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <label className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 bg-[#FAF7F1] hover:bg-[#FAF3E5] text-[#1B1712] px-4 py-2.5 rounded-xl border border-[#E4DDD0] text-xs font-semibold cursor-pointer transition-colors">
                    <Upload className="w-4 h-4 text-[#C9A15E]" />
                    <span>{isUploadingLogo ? 'جاري رفع الشعار...' : 'رفع صورة شعار جديدة من جهازك'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      disabled={isUploadingLogo}
                      className="hidden"
                    />
                  </label>

                  <div className="w-full sm:w-auto flex items-center gap-2">
                    <label className="text-xs font-bold text-[#6B6255] shrink-0">الحرف البديل:</label>
                    <input
                      type="text"
                      maxLength={2}
                      value={form.logoLetter}
                      onChange={(e) => handleChange('logoLetter', e.target.value)}
                      className="w-16 px-2 py-2 text-center rounded-xl border border-[#E4DDD0] text-sm font-bold uppercase"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Names, Slogans & Badges */}
          <div className="bg-white rounded-3xl p-6 border border-[#E4DDD0] shadow-xs space-y-4">
            <h3 className="text-base font-bold text-[#1B1712] flex items-center gap-2 border-b border-[#FAF7F1] pb-3">
              <Sparkles className="w-4 h-4 text-[#C9A15E]" />
              <span>النصوص والعناوين الرئيسية</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#1B1712] mb-1">
                  اسم المنصة أو الموقع
                </label>
                <input
                  type="text"
                  value={form.siteName}
                  onChange={(e) => handleChange('siteName', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4DDD0] text-sm focus:outline-none focus:border-[#C9A15E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B1712] mb-1">
                  الشعار اللفظي (السلوجان)
                </label>
                <input
                  type="text"
                  value={form.siteSlogan}
                  onChange={(e) => handleChange('siteSlogan', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4DDD0] text-sm focus:outline-none focus:border-[#C9A15E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B1712] mb-1">
                  نص شارة العمولة (Badge)
                </label>
                <input
                  type="text"
                  value={form.commissionBadge}
                  onChange={(e) => handleChange('commissionBadge', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4DDD0] text-sm focus:outline-none focus:border-[#C9A15E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B1712] mb-1">
                  جملة نموذج العمل المختصرة
                </label>
                <input
                  type="text"
                  value={form.pricingModelText}
                  onChange={(e) => handleChange('pricingModelText', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4DDD0] text-sm focus:outline-none focus:border-[#C9A15E]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1B1712] mb-1">
                الشريط التنبيهي / الإعلان العلوي (Hero Notice)
              </label>
              <textarea
                rows={2}
                value={form.heroNotice}
                onChange={(e) => handleChange('heroNotice', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4DDD0] text-sm focus:outline-none focus:border-[#C9A15E]"
              />
            </div>
          </div>

          {/* About Us Narrative */}
          <div className="bg-white rounded-3xl p-6 border border-[#E4DDD0] shadow-xs space-y-4">
            <h3 className="text-base font-bold text-[#1B1712] flex items-center gap-2 border-b border-[#FAF7F1] pb-3">
              <FileText className="w-4 h-4 text-[#C9A15E]" />
              <span>نافذة "عن أركان" وقصة التأسيس</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-[#1B1712] mb-1">عنوان النافذة</label>
              <input
                type="text"
                value={form.aboutTitle}
                onChange={(e) => handleChange('aboutTitle', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4DDD0] text-sm focus:outline-none focus:border-[#C9A15E]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1B1712] mb-1">نص القصة والهدف</label>
              <textarea
                rows={3}
                value={form.aboutText}
                onChange={(e) => handleChange('aboutText', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4DDD0] text-sm focus:outline-none focus:border-[#C9A15E]"
              />
            </div>

            {/* About points */}
            <div>
              <label className="block text-xs font-bold text-[#1B1712] mb-2">
                بطاقات مميزات نموذج العمل (النقاط الأربعة)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {form.aboutPoints.map((pt, idx) => (
                  <div key={idx} className="p-3 bg-[#FAF7F1] rounded-2xl border border-[#E4DDD0] space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={pt.badge}
                        onChange={(e) => {
                          const pts = [...form.aboutPoints];
                          pts[idx].badge = e.target.value;
                          handleChange('aboutPoints', pts);
                        }}
                        className="w-14 text-center px-1.5 py-1 rounded-lg bg-white border border-[#E4DDD0] text-xs font-bold text-[#C9A15E]"
                        placeholder="0%"
                      />
                      <input
                        type="text"
                        value={pt.title}
                        onChange={(e) => {
                          const pts = [...form.aboutPoints];
                          pts[idx].title = e.target.value;
                          handleChange('aboutPoints', pts);
                        }}
                        className="flex-1 px-2.5 py-1 rounded-lg bg-white border border-[#E4DDD0] text-xs font-bold text-[#1B1712]"
                        placeholder="عنوان الميزة"
                      />
                    </div>
                    <textarea
                      rows={2}
                      value={pt.desc}
                      onChange={(e) => {
                        const pts = [...form.aboutPoints];
                        pts[idx].desc = e.target.value;
                        handleChange('aboutPoints', pts);
                      }}
                      className="w-full px-2.5 py-1 rounded-lg bg-white border border-[#E4DDD0] text-xs text-[#6B6255]"
                      placeholder="الشرح المختصر"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: MAP & LANDMARKS */}
      {activeSection === 'map' && (
        <div className="space-y-6">
          {/* Map Center Coordinates & University Pin */}
          <div className="bg-white rounded-3xl p-6 border border-[#E4DDD0] shadow-xs space-y-4">
            <h3 className="text-base font-bold text-[#1B1712] flex items-center gap-2 border-b border-[#FAF7F1] pb-3">
              <Compass className="w-4 h-4 text-[#C9A15E]" />
              <span>إعدادات مركز الخريطة وبوابة الجامعة</span>
            </h3>

            <div className="space-y-4">
              <MapLocationPicker
                lat={form.mapCenterLat || 31.1340}
                lng={form.mapCenterLng || 33.8055}
                onChange={(newLat, newLng) => {
                  handleChange('mapCenterLat', newLat);
                  handleChange('mapCenterLng', newLng);
                }}
                title="تحديد مركز الخريطة التفاعلية للموقع"
                subtitle="انقر على الخريطة لتغيير نقطة البداية والمركز الافتراضي الذي تفتح عليه الخريطة للزوار والطلاب"
                showDistanceHint={false}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-[#1B1712] mb-1">
                  اسم بوابة الجامعة الرئيسية على الخريطة
                </label>
                <input
                  type="text"
                  value={form.universityGateName}
                  onChange={(e) => handleChange('universityGateName', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E4DDD0] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B1712] mb-1">
                  ملاحظة نقطة قياس المسافات
                </label>
                <input
                  type="text"
                  value={form.universityGateNote}
                  onChange={(e) => handleChange('universityGateNote', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E4DDD0] text-sm"
                />
              </div>
            </div>
          </div>

          {/* Landmarks List */}
          <div className="bg-white rounded-3xl p-6 border border-[#E4DDD0] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#FAF7F1] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#1B1712] flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#C9A15E]" />
                  <span>الأماكن والمعالم الثابتة على الخريطة التفاعلية</span>
                </h3>
                <span className="text-xs text-[#6B6255]">
                  تظهر هذه العلامات المميزة على الخريطة للطلاب والزوار إلى جانب علامات الشقق
                </span>
              </div>

              <button
                onClick={handleOpenAddLandmark}
                className="flex items-center gap-1.5 bg-[#17140F] hover:bg-[#2A241B] text-[#C9A15E] px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة مكان على الخريطة</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {form.mapLandmarks.map((lm) => (
                <div
                  key={lm.id}
                  className="p-4 bg-[#FAF7F1] rounded-2xl border border-[#E4DDD0] flex items-start justify-between gap-3 hover:border-[#C9A15E] transition-all"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl p-2 rounded-xl bg-white border border-[#E4DDD0] shadow-2xs">
                      {lm.icon || '📍'}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-[#1B1712]">{lm.name}</h4>
                      <p className="text-xs text-[#6B6255] mt-0.5 line-clamp-2">{lm.note}</p>
                      <div className="flex items-center gap-3 text-[11px] text-[#A67C3D] mt-2 font-mono" dir="ltr">
                        <span>Lat: {lm.lat}</span>
                        <span>Lng: {lm.lng}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleOpenEditLandmark(lm)}
                      className="p-1.5 rounded-lg text-[#6B6255] hover:text-[#1B1712] hover:bg-white border border-transparent hover:border-[#E4DDD0] cursor-pointer"
                      title="تعديل المكان"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteLandmark(lm.id)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-200 cursor-pointer"
                      title="حذف من الخريطة"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: TRANSPORTATION & SERVICES */}
      {activeSection === 'transport' && (
        <div className="space-y-6">
          {/* Header Texts */}
          <div className="bg-white rounded-3xl p-6 border border-[#E4DDD0] shadow-xs space-y-4">
            <h3 className="text-base font-bold text-[#1B1712] flex items-center gap-2 border-b border-[#FAF7F1] pb-3">
              <Bus className="w-4 h-4 text-[#C9A15E]" />
              <span>عنوان ووصف قسم الخدمات والمواصلات (دليل الطالب)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#1B1712] mb-1">
                  العنوان الرئيسي للقسم
                </label>
                <input
                  type="text"
                  value={form.transportHeaderTitle}
                  onChange={(e) => handleChange('transportHeaderTitle', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4DDD0] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B1712] mb-1">
                  الوصف التوضيحي للقسم
                </label>
                <input
                  type="text"
                  value={form.transportHeaderSubtitle}
                  onChange={(e) => handleChange('transportHeaderSubtitle', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4DDD0] text-sm"
                />
              </div>
            </div>
          </div>

          {/* Categories & Lines */}
          <div className="bg-white rounded-3xl p-6 border border-[#E4DDD0] shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-[#FAF7F1] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#1B1712] flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#C9A15E]" />
                  <span>أقسام وخطوط وخدمات محيط الجامعة</span>
                </h3>
                <span className="text-xs text-[#6B6255]">
                  المواصلات، السوبرماركت، الصيدليات، المطاعم والكافيهات، المغاسل
                </span>
              </div>

              <button
                onClick={handleAddCategory}
                className="flex items-center gap-1.5 bg-[#17140F] hover:bg-[#2A241B] text-[#C9A15E] px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة فئة خدمات جديدة</span>
              </button>
            </div>

            <div className="space-y-5">
              {form.transportCategories.map((cat, catIdx) => (
                <div
                  key={cat.id || catIdx}
                  className="p-5 rounded-2xl border border-[#E4DDD0] bg-[#FAF7F1] space-y-4"
                >
                  <div className="flex items-center justify-between gap-3 border-b border-[#E4DDD0] pb-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={cat.title}
                        onChange={(e) => {
                          const updated = [...form.transportCategories];
                          updated[catIdx].title = e.target.value;
                          handleChange('transportCategories', updated);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-white border border-[#E4DDD0] text-sm font-bold text-[#1B1712]"
                        placeholder="عنوان القسم (مثال: مواصلات الجامعة)"
                      />
                      <input
                        type="text"
                        value={cat.badge}
                        onChange={(e) => {
                          const updated = [...form.transportCategories];
                          updated[catIdx].badge = e.target.value;
                          handleChange('transportCategories', updated);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white border border-[#E4DDD0] text-xs text-[#A67C3D] font-semibold"
                        placeholder="الشارة (بوابات ومواقف)"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAddServicePlace(catIdx)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-[#C9A15E] text-[#1B1712] hover:bg-[#C9A15E]/10 text-xs font-bold cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 text-[#C9A15E]" />
                        <span>إضافة محطة / مكان</span>
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(catIdx)}
                        className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-100/60 cursor-pointer"
                        title="حذف هذا القسم بالكامل"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Places list in this category */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {cat.places.map((place, pIdx) => (
                      <div
                        key={pIdx}
                        className="p-3 bg-white rounded-xl border border-[#E4DDD0] shadow-2xs relative group"
                      >
                        <button
                          onClick={() => handleDeleteServicePlace(catIdx, pIdx)}
                          className="absolute top-2 left-2 text-rose-400 hover:text-rose-600 p-1 cursor-pointer opacity-70 group-hover:opacity-100"
                          title="حذف"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <div className="flex items-center justify-between gap-2 pl-6 mb-1">
                          <input
                            type="text"
                            value={place.name}
                            onChange={(e) => {
                              const updated = [...form.transportCategories];
                              updated[catIdx].places[pIdx].name = e.target.value;
                              handleChange('transportCategories', updated);
                            }}
                            className="w-full font-bold text-xs text-[#1B1712] focus:outline-none"
                            placeholder="اسم المحطة / الخدمة"
                          />
                        </div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-[11px] text-[#A67C3D] font-bold">المسافة:</span>
                          <input
                            type="text"
                            value={place.distance}
                            onChange={(e) => {
                              const updated = [...form.transportCategories];
                              updated[catIdx].places[pIdx].distance = e.target.value;
                              handleChange('transportCategories', updated);
                            }}
                            className="w-20 px-1 py-0.5 text-[11px] rounded border border-[#E4DDD0] text-center"
                            placeholder="3 دقائق"
                          />
                        </div>
                        <input
                          type="text"
                          value={place.note}
                          onChange={(e) => {
                            const updated = [...form.transportCategories];
                            updated[catIdx].places[pIdx].note = e.target.value;
                            handleChange('transportCategories', updated);
                          }}
                          className="w-full text-[11px] text-[#6B6255] border-t border-[#FAF7F1] pt-1 focus:outline-none"
                          placeholder="ملاحظات وتفاصيل..."
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: CONTACT & FOOTER */}
      {activeSection === 'footer' && (
        <div className="space-y-6">
          {/* Phone & WhatsApp */}
          <div className="bg-white rounded-3xl p-6 border border-[#E4DDD0] shadow-xs space-y-4">
            <h3 className="text-base font-bold text-[#1B1712] flex items-center gap-2 border-b border-[#FAF7F1] pb-3">
              <Phone className="w-4 h-4 text-[#C9A15E]" />
              <span>أرقام الهواتف والواتساب المباشرة</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#1B1712] mb-1">
                  رقم الهاتف المباشر (المكالمات)
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={form.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4DDD0] text-sm focus:outline-none focus:border-[#C9A15E]"
                  placeholder="01550454849"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B1712] mb-1">
                  رقم الواتساب الرسمي (مع كود الدولة، مثال: 201550454849)
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={form.whatsappNumber}
                  onChange={(e) => handleChange('whatsappNumber', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4DDD0] text-sm focus:outline-none focus:border-[#C9A15E]"
                  placeholder="201550454849"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1B1712] mb-1">
                رسالة الواتساب الجاهزة عند الضغط على "اعرض شقتك معنا" أو تواصل معنا
              </label>
              <textarea
                rows={2}
                value={form.whatsappWelcomeMsg}
                onChange={(e) => handleChange('whatsappWelcomeMsg', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4DDD0] text-sm focus:outline-none focus:border-[#C9A15E]"
              />
            </div>
          </div>

          {/* Social Media Links */}
          <div className="bg-white rounded-3xl p-6 border border-[#E4DDD0] shadow-xs space-y-4">
            <h3 className="text-base font-bold text-[#1B1712] flex items-center gap-2 border-b border-[#FAF7F1] pb-3">
              <MessageCircle className="w-4 h-4 text-[#C9A15E]" />
              <span>روابط صفحات التواصل الاجتماعي</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#1B1712] mb-1">رابط صفحة فيسبوك</label>
                <input
                  type="text"
                  dir="ltr"
                  value={form.facebookUrl}
                  onChange={(e) => handleChange('facebookUrl', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E4DDD0] text-xs focus:outline-none focus:border-[#C9A15E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B1712] mb-1">رابط حساب إنستجرام</label>
                <input
                  type="text"
                  dir="ltr"
                  value={form.instagramUrl}
                  onChange={(e) => handleChange('instagramUrl', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E4DDD0] text-xs focus:outline-none focus:border-[#C9A15E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B1712] mb-1">رابط حساب تيك توك</label>
                <input
                  type="text"
                  dir="ltr"
                  value={form.tiktokUrl}
                  onChange={(e) => handleChange('tiktokUrl', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E4DDD0] text-xs focus:outline-none focus:border-[#C9A15E]"
                />
              </div>
            </div>
          </div>

          {/* Footer Texts & Copyright */}
          <div className="bg-white rounded-3xl p-6 border border-[#E4DDD0] shadow-xs space-y-4">
            <h3 className="text-base font-bold text-[#1B1712] flex items-center gap-2 border-b border-[#FAF7F1] pb-3">
              <FileText className="w-4 h-4 text-[#C9A15E]" />
              <span>نصوص وحقوق أسفل الموقع (الفوتر)</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-[#1B1712] mb-1">
                الفقرة التعريفية المختصرة في الفوتر
              </label>
              <textarea
                rows={2}
                value={form.footerDesc}
                onChange={(e) => handleChange('footerDesc', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4DDD0] text-sm focus:outline-none focus:border-[#C9A15E]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1B1712] mb-1">
                سطر حقوق الملكية (Copyright Notice)
              </label>
              <input
                type="text"
                value={form.copyrightText}
                onChange={(e) => handleChange('copyrightText', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4DDD0] text-sm focus:outline-none focus:border-[#C9A15E]"
              />
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT MAP LANDMARK */}
      {isLandmarkModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-[#E4DDD0] shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-[#1B1712] flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#C9A15E]" />
              <span>{editingLandmarkId ? 'تعديل مكان على الخريطة' : 'إضافة مكان أو علامة جديدة على الخريطة'}</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#1B1712] mb-1">اسم المكان / العلامة</label>
                <input
                  type="text"
                  value={landmarkForm.name}
                  onChange={(e) => setLandmarkForm({ ...landmarkForm, name: e.target.value })}
                  placeholder="مثال: هايبر ماركت البركة أو مستشفى العريش"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E4DDD0] text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1B1712] mb-1">رمز الأيقونة (إيموجي)</label>
                  <select
                    value={landmarkForm.icon}
                    onChange={(e) => setLandmarkForm({ ...landmarkForm, icon: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E4DDD0] text-sm"
                  >
                    <option value="📍">📍 علامة عامة</option>
                    <option value="🎓">🎓 جامعة أو كلية</option>
                    <option value="🚌">🚌 موقف أو باص</option>
                    <option value="🛒">🛒 سوبر ماركت أو تسوق</option>
                    <option value="💊">💊 صيدلية أو علاج</option>
                    <option value="🏥">🏥 مستشفى أو عيادة</option>
                    <option value="☕">☕ كافيه أو مذاكرة</option>
                    <option value="🌊">🌊 شاطئ أو كورنيش</option>
                    <option value="🏢">🏢 مبنى إداري أو سكني</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1B1712] mb-1">التصنيف</label>
                  <select
                    value={landmarkForm.category}
                    onChange={(e) => setLandmarkForm({ ...landmarkForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E4DDD0] text-sm"
                  >
                    <option value="landmark">معلم عام</option>
                    <option value="university">تعليم وجامعة</option>
                    <option value="transport">مواصلات ومواقف</option>
                    <option value="market">تسوق وبقالة</option>
                    <option value="hospital">صحة وصيدليات</option>
                    <option value="beach">شاطئ وترفيه</option>
                    <option value="other">أخرى</option>
                  </select>
                </div>
              </div>

              <div>
                <MapLocationPicker
                  lat={landmarkForm.lat || 31.1340}
                  lng={landmarkForm.lng || 33.8055}
                  onChange={(newLat, newLng) => {
                    setLandmarkForm((prev) => ({ ...prev, lat: newLat, lng: newLng }));
                  }}
                  title="تحديد موقع المعلم على الخريطة"
                  subtitle="انقر على الخريطة أو ابحث عن المكان لتثبيت نقطة المعلم بدقة"
                  showDistanceHint={false}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B1712] mb-1">ملاحظات تظهر داخل النافذة التفاعلية</label>
                <textarea
                  rows={2}
                  value={landmarkForm.note}
                  onChange={(e) => setLandmarkForm({ ...landmarkForm, note: e.target.value })}
                  placeholder="وصف مختصر للمكان، مواعيد العمل أو قربه من بوابات كليات الجامعة"
                  className="w-full px-3 py-2 rounded-xl border border-[#E4DDD0] text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#FAF7F1]">
              <button
                onClick={() => setIsLandmarkModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#6B6255] hover:bg-[#FAF7F1] cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveLandmark}
                className="px-5 py-2 rounded-xl bg-[#17140F] text-[#C9A15E] text-xs font-bold hover:bg-[#2A241B] cursor-pointer shadow-xs"
              >
                تثبيت المكان
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
