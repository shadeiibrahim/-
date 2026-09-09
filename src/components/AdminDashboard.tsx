import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Plus,
  Trash2,
  Edit2,
  LogOut,
  RefreshCw,
  Eye,
  CheckCircle,
  Clock,
  Building,
  User,
  MessageCircle,
  Phone,
  Image as ImageIcon,
  Check,
  X,
  MapPin,
  KeyRound,
  Settings as SettingsIcon,
} from 'lucide-react';
import { Listing, HousingRequest, ListingCategory, PropertyType, SiteSettings } from '../types.ts';
import {
  adminLogin,
  adminLogout,
  checkAdminAuth,
  fetchAdminListings,
  createListing,
  updateListing,
  deleteListing,
  fetchAdminRequests,
  updateRequestStatus,
  deleteHousingRequest,
  updateAdminCredentials,
} from '../lib/api.ts';
import { AdminSiteSettings } from './AdminSiteSettings.tsx';
import { MapLocationPicker } from './MapLocationPicker.tsx';

interface AdminDashboardProps {
  onBackToSite: () => void;
  onListingUpdated: () => void;
  siteSettings: SiteSettings;
  onUpdateSiteSettings: (settings: SiteSettings) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onBackToSite,
  onListingUpdated,
  siteSettings,
  onUpdateSiteSettings,
}) => {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);
  const [usernameInput, setUsernameInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // Change Credentials Modal State
  const [isCredentialsModalOpen, setIsCredentialsModalOpen] = useState<boolean>(false);
  const [newUsername, setNewUsername] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [credentialsMsg, setCredentialsMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSavingCreds, setIsSavingCreds] = useState<boolean>(false);

  // Tab state
  const [activeTab, setActiveTab] = useState<'listings' | 'requests' | 'settings'>('listings');

  // Data states
  const [listings, setListings] = useState<Listing[]>([]);
  const [requests, setRequests] = useState<HousingRequest[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);

  // Listing Form state (for Create / Edit modal)
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingListingId, setEditingListingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<Listing>>({
    category: 'STUDENT',
    propertyType: 'RENT_APARTMENT',
    title: '',
    price: 1500,
    address: 'بجوار جامعة سيناء، العريش',
    neighborhood: 'المساعيد',
    description: '',
    rooms: 2,
    area: '90 م²',
    floor: 'الدور الثاني',
    gender: 'بنين',
    capacityStudents: 2,
    bedsCount: 2,
    distanceMin: 5,
    lat: 31.1325,
    lng: 33.7845,
    status: 'AVAILABLE',
    landlordPhone: '01550454849',
    whatsapp: '201550454849',
    images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80'],
    hasAc: true,
    hasWifi: true,
    hasFridge: true,
    hasWasher: true,
    hasKitchen: true,
    isFurnished: true,
    hasWaterHeater: true,
    hasElectricity: true,
    hasWater: true,
  });

  const [imageUrlInput, setImageUrlInput] = useState<string>('');

  // Check auth on mount
  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    try {
      setIsCheckingAuth(true);
      const res = await checkAdminAuth();
      if (res.authenticated) {
        setIsAuthenticated(true);
        loadAllData();
      } else {
        setIsAuthenticated(false);
      }
    } catch {
      setIsAuthenticated(false);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const loadAllData = async () => {
    try {
      setIsLoadingData(true);
      const [allListings, allRequests] = await Promise.all([
        fetchAdminListings(),
        fetchAdminRequests(),
      ]);
      setListings(allListings);
      setRequests(allRequests);
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    try {
      await adminLogin(passwordInput, usernameInput);
      setIsAuthenticated(true);
      setPasswordInput('');
      loadAllData();
    } catch (err: any) {
      setLoginError(err.message || 'اسم المستخدم أو كلمة المرور غير صحيحة');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleUpdateCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.trim().length < 4) {
      setCredentialsMsg({ type: 'error', text: 'كلمة المرور الجديدة يجب أن تكون 4 أحرف أو أرقام على الأقل' });
      return;
    }
    setIsSavingCreds(true);
    setCredentialsMsg(null);
    try {
      const res = await updateAdminCredentials(newUsername, newPassword);
      setCredentialsMsg({ type: 'success', text: res.message || 'تم تحديث بيانات الدخول بنجاح!' });
      setTimeout(() => {
        setIsCredentialsModalOpen(false);
        setCredentialsMsg(null);
        setNewPassword('');
      }, 1500);
    } catch (err: any) {
      setCredentialsMsg({ type: 'error', text: err.message || 'فشل تحديث البيانات' });
    } finally {
      setIsSavingCreds(false);
    }
  };

  const handleLogout = async () => {
    try {
      await adminLogout();
      setIsAuthenticated(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Open Form for creating new
  const handleOpenCreateForm = () => {
    setEditingListingId(null);
    setFormData({
      category: 'STUDENT',
      propertyType: 'RENT_APARTMENT',
      title: '',
      price: 1500,
      address: 'بجوار جامعة سيناء، العريش',
      neighborhood: 'المساعيد',
      description: '',
      rooms: 2,
      area: '90 م²',
      floor: 'الدور الثاني',
      gender: 'بنين',
      capacityStudents: 2,
      bedsCount: 2,
      distanceMin: 5,
      lat: 31.1325,
      lng: 33.7845,
      status: 'AVAILABLE',
      landlordPhone: '01550454849',
      whatsapp: '201550454849',
      images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80'],
      hasAc: true,
      hasWifi: true,
      hasFridge: true,
      hasWasher: true,
      hasKitchen: true,
      isFurnished: true,
      hasWaterHeater: true,
      hasElectricity: true,
      hasWater: true,
    });
    setIsFormOpen(true);
  };

  // Open Form for edit
  const handleOpenEditForm = (listing: Listing) => {
    setEditingListingId(listing.id);
    setFormData({ ...listing });
    setIsFormOpen(true);
  };

  const handleSaveListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.price) {
      alert('يرجى ملء البيانات الإلزامية كالعنوان والسعر');
      return;
    }

    try {
      if (editingListingId) {
        await updateListing(editingListingId, formData);
      } else {
        await createListing(formData);
      }
      setIsFormOpen(false);
      loadAllData();
      onListingUpdated();
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء حفظ العقار');
    }
  };

  const handleDeleteListing = async (id: number) => {
    if (!confirm('هل أنت متأكد من رغبتك في حذف هذا العقار نهائيًا؟')) return;
    try {
      await deleteListing(id);
      loadAllData();
      onListingUpdated();
    } catch (err: any) {
      alert(err.message || 'فشل حذف العقار');
    }
  };

  const handleToggleStatus = async (listing: Listing, newStatus: 'AVAILABLE' | 'RESERVED' | 'RENTED') => {
    try {
      await updateListing(listing.id, { status: newStatus });
      loadAllData();
      onListingUpdated();
    } catch (err: any) {
      alert(err.message || 'فشل تحديث الحالة');
    }
  };

  const handleUpdateReqStatus = async (id: number, status: HousingRequest['status']) => {
    try {
      await updateRequestStatus(id, status);
      loadAllData();
    } catch (err: any) {
      alert(err.message || 'فشل تحديث حالة الطلب');
    }
  };

  const handleDeleteReq = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا الطلب؟')) return;
    try {
      await deleteHousingRequest(id);
      loadAllData();
    } catch (err: any) {
      alert(err.message || 'فشل الحذف');
    }
  };

  const addImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    const currentImages = formData.images || [];
    setFormData({
      ...formData,
      images: [...currentImages, imageUrlInput.trim()],
    });
    setImageUrlInput('');
  };

  const removeImageUrl = (index: number) => {
    const currentImages = formData.images || [];
    setFormData({
      ...formData,
      images: currentImages.filter((_, i) => i !== index),
    });
  };

  // 1. Loading View
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#FAF7F1] flex items-center justify-center p-6">
        <div className="flex items-center gap-2 text-sm text-[#6B6255]">
          <RefreshCw className="w-4 h-4 animate-spin text-[#C9A15E]" />
          <span>جارٍ التحقق من صلاحيات المدير...</span>
        </div>
      </div>
    );
  }

  // 2. Login View if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl border border-[#E4DDD0] shadow-xl p-8">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-[#17140F] text-[#C9A15E] rounded-2xl flex items-center justify-center mx-auto mb-3 font-bold text-xl border border-[#3D3425]">
              A
            </div>
            <h1 className="text-xl font-bold text-[#1B1712]">
              تسجيل دخول الإدارة
            </h1>
            <p className="text-xs text-[#6B6255] mt-1">
              الرجاء إدخال اسم المستخدم وكلمة المرور للمتابعة
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl font-medium">
                {loginError}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#1B1712] mb-1.5">
                اسم المستخدم (Username)
              </label>
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="أدخل اسم المستخدم..."
                required
                className="w-full bg-[#FAF7F1] border border-[#E4DDD0] focus:border-[#C9A15E] rounded-xl px-4 py-2.5 text-sm text-[#1B1712] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1B1712] mb-1.5">
                كلمة المرور (Password)
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="أدخل كلمة المرور..."
                required
                className="w-full bg-[#FAF7F1] border border-[#E4DDD0] focus:border-[#C9A15E] rounded-xl px-4 py-2.5 text-sm text-[#1B1712] outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-[#17140F] hover:bg-[#2A241B] text-[#FAF7F1] py-3 rounded-xl font-bold text-sm transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              {isLoggingIn ? 'جارٍ التحقق...' : 'دخول'}
            </button>

            <button
              type="button"
              onClick={onBackToSite}
              className="w-full text-xs text-[#6B6255] hover:text-[#1B1712] text-center pt-2 cursor-pointer"
            >
              ← العودة للموقع العام
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 3. Stats Calculations
  const totalListings = listings.length;
  const availableListings = listings.filter((l) => l.status === 'AVAILABLE').length;
  const rentedListings = listings.filter((l) => l.status === 'RENTED').length;
  const pendingRequests = requests.filter((r) => r.status === 'NEW').length;
  const totalViews = listings.reduce((acc, l) => acc + (l.views || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
      {/* Top Navbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-[#E4DDD0]">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#17140F] text-[#C9A15E] text-xs font-bold px-2.5 py-1 rounded-lg">
              لوحة المدير
            </span>
            <h1 className="text-2xl font-bold text-[#1B1712]">
              إدارة أركان للتسويق العقاري
            </h1>
          </div>
          <p className="text-xs text-[#6B6255] mt-1">
            إدارة العقارات المعروضة، تعديل الحالات، ومتابعة طلبات السكن
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setIsCredentialsModalOpen(true);
              setCredentialsMsg(null);
              setNewUsername('');
              setNewPassword('');
            }}
            className="flex items-center gap-1.5 text-xs text-[#1B1712] bg-white border border-[#E4DDD0] hover:border-[#C9A15E] px-3.5 py-2 rounded-xl font-semibold cursor-pointer shadow-2xs"
            title="تغيير اسم المستخدم أو كلمة المرور"
          >
            <KeyRound className="w-3.5 h-3.5 text-[#C9A15E]" />
            <span>بيانات الدخول</span>
          </button>
          <button
            onClick={onBackToSite}
            className="text-xs bg-white text-[#1B1712] border border-[#E4DDD0] hover:border-[#C9A15E] px-4 py-2 rounded-xl font-semibold cursor-pointer shadow-2xs"
          >
            عرض الموقع
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs text-rose-600 bg-rose-50 border border-rose-200 px-3.5 py-2 rounded-xl font-semibold cursor-pointer hover:bg-rose-100"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>تسجيل خروج</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-4 rounded-2xl border border-[#E4DDD0] shadow-2xs">
          <span className="text-xs text-[#6B6255] block mb-1">إجمالي العقارات</span>
          <span className="text-2xl font-bold text-[#1B1712] font-mono">{totalListings}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E4DDD0] shadow-2xs">
          <span className="text-xs text-emerald-600 font-semibold block mb-1">عقارات متاحة</span>
          <span className="text-2xl font-bold text-emerald-600 font-mono">{availableListings}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E4DDD0] shadow-2xs">
          <span className="text-xs text-rose-600 font-semibold block mb-1">تم التأجير</span>
          <span className="text-2xl font-bold text-rose-600 font-mono">{rentedListings}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E4DDD0] shadow-2xs">
          <span className="text-xs text-amber-600 font-semibold block mb-1">طلبات سكن جديدة</span>
          <span className="text-2xl font-bold text-amber-600 font-mono">{pendingRequests}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E4DDD0] shadow-2xs col-span-2 sm:col-span-1">
          <span className="text-xs text-[#A67C3D] font-semibold block mb-1">إجمالي المشاهدات</span>
          <span className="text-2xl font-bold text-[#1B1712] font-mono">{totalViews}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between gap-4 mb-6 border-b border-[#E4DDD0] pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('listings')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'listings'
                ? 'bg-[#17140F] text-[#C9A15E]'
                : 'text-[#6B6255] hover:text-[#1B1712]'
            }`}
          >
            🏢 العقارات والشقق ({listings.length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer relative ${
              activeTab === 'requests'
                ? 'bg-[#17140F] text-[#C9A15E]'
                : 'text-[#6B6255] hover:text-[#1B1712]'
            }`}
          >
            <span>📩 طلبات السكن ({requests.length})</span>
            {pendingRequests > 0 && (
              <span className="mr-1.5 bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                {pendingRequests}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'settings'
                ? 'bg-[#17140F] text-[#C9A15E]'
                : 'text-[#6B6255] hover:text-[#1B1712]'
            }`}
          >
            <SettingsIcon className="w-4 h-4 text-[#C9A15E]" />
            <span>⚙️ التحكم بالموقع (الشعار، الخريطة، النصوص، الفوتر)</span>
          </button>
        </div>

        {activeTab === 'listings' && (
          <button
            onClick={handleOpenCreateForm}
            className="bg-[#C9A15E] hover:bg-[#A67C3D] text-[#17140F] hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة عقار جديد</span>
          </button>
        )}
      </div>

      {/* Tab Content 1: Listings Table */}
      {activeTab === 'listings' && (
        <div className="bg-white rounded-3xl border border-[#E4DDD0] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right divide-y divide-[#E4DDD0]">
              <thead className="bg-[#FAF7F1] text-[#6B6255] font-bold">
                <tr>
                  <th className="p-3.5">الكود</th>
                  <th className="p-3.5">العقار</th>
                  <th className="p-3.5">القسم</th>
                  <th className="p-3.5">السعر</th>
                  <th className="p-3.5">المسافة/الحي</th>
                  <th className="p-3.5">الحالة</th>
                  <th className="p-3.5">المشاهدات</th>
                  <th className="p-3.5 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4DDD0]">
                {listings.map((l) => (
                  <tr key={l.id} className="hover:bg-[#FAF7F1]/50 transition-colors">
                    <td className="p-3.5 font-mono text-[#6B6255]">#{l.id}</td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={l.images?.[0] || ''}
                          alt={l.title}
                          className="w-12 h-10 rounded-lg object-cover bg-neutral-100 shrink-0"
                        />
                        <div>
                          <strong className="text-[#1B1712] block max-w-xs truncate">{l.title}</strong>
                          <span className="text-[11px] text-[#6B6255]">{l.address}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                        l.category === 'STUDENT' ? 'bg-[#FAF3E5] text-[#A67C3D]' : 'bg-blue-50 text-blue-700'
                      }`}>
                        {l.category === 'STUDENT' ? 'سكن طلاب' : 'البلد'}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-[#1B1712]">
                      {(l.price ?? 0).toLocaleString('ar-EG')} ج
                    </td>
                    <td className="p-3.5 text-[#6B6255]">
                      {l.category === 'STUDENT' ? `${l.distanceMin} دقيقة` : (l.neighborhood || '—')}
                    </td>
                    <td className="p-3.5">
                      <select
                        value={l.status}
                        onChange={(e) => handleToggleStatus(l, e.target.value as any)}
                        className={`text-[11px] font-bold px-2 py-1 rounded-lg border outline-none cursor-pointer ${
                          l.status === 'AVAILABLE'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : l.status === 'RENTED'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        <option value="AVAILABLE">متاح 🟢</option>
                        <option value="RESERVED">محجوز 🟡</option>
                        <option value="RENTED">تم التأجير 🔴</option>
                      </select>
                    </td>
                    <td className="p-3.5 font-mono text-[#6B6255]">
                      {l.views || 0}
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEditForm(l)}
                          className="p-1.5 rounded-lg text-[#6B6255] hover:text-[#1B1712] hover:bg-[#FAF7F1] cursor-pointer"
                          title="تعديل"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteListing(l.id)}
                          className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
                          title="حذف"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content 2: Housing Requests Table */}
      {activeTab === 'requests' && (
        <div className="bg-white rounded-3xl border border-[#E4DDD0] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right divide-y divide-[#E4DDD0]">
              <thead className="bg-[#FAF7F1] text-[#6B6255] font-bold">
                <tr>
                  <th className="p-3.5">رقم الطلب</th>
                  <th className="p-3.5">تاريخ الإرسال</th>
                  <th className="p-3.5">الميزانية</th>
                  <th className="p-3.5">النوع</th>
                  <th className="p-3.5">عدد الأفراد</th>
                  <th className="p-3.5">المنطقة المطلوبة</th>
                  <th className="p-3.5">الواتساب والتواصل</th>
                  <th className="p-3.5">الحالة</th>
                  <th className="p-3.5 text-center">حذف</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4DDD0]">
                {requests.map((r) => (
                  <tr key={r.id} className="hover:bg-[#FAF7F1]/50 transition-colors">
                    <td className="p-3.5 font-mono text-[#6B6255]">#{r.id}</td>
                    <td className="p-3.5 text-[#6B6255]">
                      {r.createdAt ? new Date(r.createdAt).toLocaleDateString('ar-EG') : '—'}
                    </td>
                    <td className="p-3.5 font-bold text-[#1B1712]">
                      {(r.budget ?? 0).toLocaleString('ar-EG')} ج
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-neutral-100">
                        {r.gender}
                      </span>
                    </td>
                    <td className="p-3.5 font-semibold text-[#1B1712]">
                      {r.people} طلاب
                    </td>
                    <td className="p-3.5 text-[#6B6255]">
                      {r.area || 'أي منطقة'}
                    </td>
                    <td className="p-3.5">
                      <a
                        href={`https://wa.me/${r.whatsapp}?text=${encodeURIComponent(`السلام عليكم، بخصوص طلب السكن المقدم على أركان للتسويق العقاري (طلب #${r.id} بميزانية ${r.budget} ج)، متوفر لدينا عروض تناسب طلبك.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 bg-[#25D366] hover:bg-[#1EBE5D] text-white px-2.5 py-1 rounded-lg font-bold text-[11px]"
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span>{r.whatsapp}</span>
                      </a>
                    </td>
                    <td className="p-3.5">
                      <select
                        value={r.status}
                        onChange={(e) => handleUpdateReqStatus(r.id, e.target.value as HousingRequest['status'])}
                        className={`text-[11px] font-bold px-2 py-1 rounded-lg border outline-none cursor-pointer ${
                          r.status === 'NEW'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : r.status === 'CONTACTED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-neutral-100 text-neutral-600 border-neutral-300'
                        }`}
                      >
                        <option value="NEW">جديد 🔴</option>
                        <option value="CONTACTED">تم التواصل 🟢</option>
                        <option value="CLOSED">مقفول ⚪</option>
                      </select>
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => handleDeleteReq(r.id)}
                        className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
                        title="حذف الطلب"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content 3: Site Settings (CMS Control) */}
      {activeTab === 'settings' && (
        <AdminSiteSettings
          settings={siteSettings}
          onSettingsUpdated={onUpdateSiteSettings}
        />
      )}

      {/* Listing Form Modal (Create or Edit) */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-[#E4DDD0] overflow-hidden max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-[#17140F] text-[#FAF7F1] px-6 py-4 flex items-center justify-between border-b border-[#3D3425]">
              <h2 className="text-base font-bold">
                {editingListingId ? `تعديل العقار #${editingListingId}` : 'إضافة عقار جديد'}
              </h2>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-white/70 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveListing} className="p-6 overflow-y-auto space-y-6 text-xs sm:text-sm">
              
              {/* Category & Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#1B1712] mb-1">القسم الرئيسي *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ListingCategory })}
                    className="w-full bg-[#FAF7F1] border border-[#E4DDD0] rounded-xl p-2.5 text-[#1B1712] outline-none"
                  >
                    <option value="STUDENT">المدينة الجديدة (سكن طلاب جامعة سيناء)</option>
                    <option value="LOCAL">البلد (عائلات، بيع، تجاري، أراضي)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#1B1712] mb-1">نوع العقار *</label>
                  <select
                    value={formData.propertyType}
                    onChange={(e) => setFormData({ ...formData, propertyType: e.target.value as PropertyType })}
                    className="w-full bg-[#FAF7F1] border border-[#E4DDD0] rounded-xl p-2.5 text-[#1B1712] outline-none"
                  >
                    <option value="RENT_APARTMENT">شقة للإيجار</option>
                    <option value="SALE">عقار للبيع والتمليك</option>
                    <option value="COMMERCIAL">محل تجاري</option>
                    <option value="LAND">أرض</option>
                  </select>
                </div>
              </div>

              {/* Title & Price */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-[#1B1712] mb-1">عنوان الإعلان / الشقة *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="مثال: شقة مفروشة فاخرة على بعد 3 دقائق من بوابة الجامعة"
                    className="w-full bg-[#FAF7F1] border border-[#E4DDD0] rounded-xl p-2.5 text-[#1B1712] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#1B1712] mb-1">السعر (جنيه) *</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    placeholder="1500"
                    className="w-full bg-[#FAF7F1] border border-[#E4DDD0] rounded-xl p-2.5 text-[#1B1712] outline-none font-bold"
                  />
                </div>
              </div>

              {/* Address & Neighborhood */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#1B1712] mb-1">العنوان بالتفصيل *</label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="العريش، المساعيد، شارع أسيوط..."
                    className="w-full bg-[#FAF7F1] border border-[#E4DDD0] rounded-xl p-2.5 text-[#1B1712] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#1B1712] mb-1">الحي / المنطقة</label>
                  <input
                    type="text"
                    value={formData.neighborhood || ''}
                    onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                    placeholder="المساعيد، وسط البلد، الكرامة..."
                    className="w-full bg-[#FAF7F1] border border-[#E4DDD0] rounded-xl p-2.5 text-[#1B1712] outline-none"
                  />
                </div>
              </div>

              {/* Specs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-semibold text-[#1B1712] mb-1">عدد الغرف</label>
                  <input
                    type="number"
                    value={formData.rooms}
                    onChange={(e) => setFormData({ ...formData, rooms: Number(e.target.value) })}
                    className="w-full bg-[#FAF7F1] border border-[#E4DDD0] rounded-xl p-2 text-[#1B1712] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#1B1712] mb-1">المساحة</label>
                  <input
                    type="text"
                    value={formData.area || ''}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    placeholder="90 م²"
                    className="w-full bg-[#FAF7F1] border border-[#E4DDD0] rounded-xl p-2 text-[#1B1712] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#1B1712] mb-1">الدور</label>
                  <input
                    type="text"
                    value={formData.floor || ''}
                    onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                    placeholder="الدور الثالث"
                    className="w-full bg-[#FAF7F1] border border-[#E4DDD0] rounded-xl p-2 text-[#1B1712] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#1B1712] mb-1">فئة السكن / النوع</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full bg-[#FAF7F1] border border-[#E4DDD0] rounded-xl p-2 text-[#1B1712] outline-none"
                  >
                    <option value="بنين">طلاب (بنين)</option>
                    <option value="بنات">طالبات (بنات)</option>
                    <option value="عائلات">عائلات</option>
                    <option value="تجاري">تجاري / مفتوح</option>
                  </select>
                </div>
              </div>

              {/* Student specific: Distance, capacity, beds */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#FAF3E5] p-3 rounded-2xl border border-[#E8DCBF]">
                <div>
                  <label className="block font-semibold text-[#A67C3D] mb-1">المسافة للجامعة (دقائق)</label>
                  <input
                    type="number"
                    value={formData.distanceMin}
                    onChange={(e) => setFormData({ ...formData, distanceMin: Number(e.target.value) })}
                    placeholder="5"
                    className="w-full bg-white border border-[#E4DDD0] rounded-xl p-2 text-[#1B1712] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#A67C3D] mb-1">سعة الشقة (طلاب)</label>
                  <input
                    type="number"
                    value={formData.capacityStudents || 2}
                    onChange={(e) => setFormData({ ...formData, capacityStudents: Number(e.target.value) })}
                    placeholder="2"
                    className="w-full bg-white border border-[#E4DDD0] rounded-xl p-2 text-[#1B1712] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#A67C3D] mb-1">عدد الأسرّة</label>
                  <input
                    type="number"
                    value={formData.bedsCount || 2}
                    onChange={(e) => setFormData({ ...formData, bedsCount: Number(e.target.value) })}
                    placeholder="2"
                    className="w-full bg-white border border-[#E4DDD0] rounded-xl p-2 text-[#1B1712] outline-none"
                  />
                </div>
              </div>

              {/* Interactive Google Map Location Picker */}
              <div>
                <MapLocationPicker
                  lat={formData.lat || 31.1325}
                  lng={formData.lng || 33.7845}
                  onChange={(newLat, newLng) => {
                    setFormData((prev) => ({ ...prev, lat: newLat, lng: newLng }));
                  }}
                  onDistanceCalculated={(calculatedMin) => {
                    if (formData.category === 'STUDENT') {
                      setFormData((prev) => ({ ...prev, distanceMin: calculatedMin }));
                    }
                  }}
                  title="تحديد موقع العقار على الخريطة مباشرة"
                  subtitle="انقر على أي مكان على الخريطة أو اسحب العلامة لتحديد مكان العقار بدقة دون الحاجة لكتابة خط العرض وخط الطول"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold text-[#1B1712] mb-1">الوصف الكامل *</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="وصف مميزات الشقة والفرش وتفاصيل الاستئجار..."
                  className="w-full bg-[#FAF7F1] border border-[#E4DDD0] rounded-xl p-2.5 text-[#1B1712] outline-none"
                />
              </div>

              {/* Contacts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#1B1712] mb-1">هاتف المالك</label>
                  <input
                    type="text"
                    value={formData.landlordPhone || ''}
                    onChange={(e) => setFormData({ ...formData, landlordPhone: e.target.value })}
                    placeholder="01550454849"
                    className="w-full bg-[#FAF7F1] border border-[#E4DDD0] rounded-xl p-2.5 text-[#1B1712] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#1B1712] mb-1">رقم الواتساب للتواصل (بدون +)</label>
                  <input
                    type="text"
                    value={formData.whatsapp || '201550454849'}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    placeholder="201550454849"
                    className="w-full bg-[#FAF7F1] border border-[#E4DDD0] rounded-xl p-2.5 text-[#1B1712] outline-none font-mono"
                  />
                </div>
              </div>

              {/* 9 Amenities checkboxes */}
              <div>
                <label className="block font-bold text-[#1B1712] mb-2">المرافق والتجهيزات المتوفرة:</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { key: 'hasAc', label: 'تكييف هوائي' },
                    { key: 'hasWifi', label: 'واي فاي' },
                    { key: 'hasFridge', label: 'ثلاجة' },
                    { key: 'hasWasher', label: 'غسالة ملابس' },
                    { key: 'hasKitchen', label: 'مطبخ مجهز' },
                    { key: 'isFurnished', label: 'مفروشة بالكامل' },
                    { key: 'hasWaterHeater', label: 'سخان مياه' },
                    { key: 'hasElectricity', label: 'عداد كهرباء مستقل' },
                    { key: 'hasWater', label: 'مياه متواصلة / خزان' },
                  ].map((amenity) => (
                    <label
                      key={amenity.key}
                      className="flex items-center gap-2 bg-[#FAF7F1] p-2.5 rounded-xl border border-[#E4DDD0] cursor-pointer hover:bg-white"
                    >
                      <input
                        type="checkbox"
                        checked={Boolean((formData as any)[amenity.key])}
                        onChange={(e) => setFormData({ ...formData, [amenity.key]: e.target.checked })}
                        className="rounded text-[#C9A15E] focus:ring-[#C9A15E]"
                      />
                      <span className="font-semibold text-[#1B1712]">{amenity.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Images Manager */}
              <div>
                <label className="block font-bold text-[#1B1712] mb-1">روابط صور العقار</label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="url"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    placeholder="ضع رابط صورة من Unsplash أو Cloudinary..."
                    className="flex-1 bg-[#FAF7F1] border border-[#E4DDD0] rounded-xl px-3 py-2 text-xs outline-none"
                  />
                  <button
                    type="button"
                    onClick={addImageUrl}
                    className="bg-[#17140F] text-[#C9A15E] px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    إضافة صورة
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {(formData.images || []).map((img, idx) => (
                    <div key={idx} className="relative w-20 h-16 rounded-xl overflow-hidden border border-[#E4DDD0] group">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImageUrl(idx)}
                        className="absolute inset-0 bg-red-600/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-[#E4DDD0] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="bg-[#FAF7F1] hover:bg-[#E4DDD0] text-[#1B1712] px-5 py-2.5 rounded-xl font-bold text-xs cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-[#C9A15E] hover:bg-[#A67C3D] text-[#17140F] hover:text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-sm cursor-pointer"
                >
                  {editingListingId ? 'حفظ التعديلات' : 'نشر العقار الآن'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Change Credentials Modal */}
      {isCredentialsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-[#E4DDD0] shadow-2xl p-6 relative">
            <div className="flex items-center justify-between pb-4 border-b border-[#E4DDD0] mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#FAF7F1] border border-[#E4DDD0] flex items-center justify-center">
                  <KeyRound className="w-4 h-4 text-[#C9A15E]" />
                </div>
                <h3 className="font-bold text-base text-[#1B1712]">
                  تغيير بيانات تسجيل الدخول
                </h3>
              </div>
              <button
                onClick={() => setIsCredentialsModalOpen(false)}
                className="p-1.5 rounded-lg text-[#6B6255] hover:bg-[#FAF7F1] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {credentialsMsg && (
              <div
                className={`text-xs p-3 rounded-xl mb-4 font-medium ${
                  credentialsMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {credentialsMsg.text}
              </div>
            )}

            <form onSubmit={handleUpdateCredentials} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1B1712] mb-1.5">
                  اسم المستخدم الجديد (اتركه فارغاً للإبقاء على الحالي)
                </label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="مثال: arkan_manager"
                  className="w-full bg-[#FAF7F1] border border-[#E4DDD0] focus:border-[#C9A15E] rounded-xl px-4 py-2.5 text-sm text-[#1B1712] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1B1712] mb-1.5">
                  كلمة المرور الجديدة (مطلوبة)
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور الجديدة (4 خانات على الأقل)..."
                  required
                  className="w-full bg-[#FAF7F1] border border-[#E4DDD0] focus:border-[#C9A15E] rounded-xl px-4 py-2.5 text-sm text-[#1B1712] outline-none"
                />
              </div>

              <div className="pt-3 border-t border-[#E4DDD0] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCredentialsModalOpen(false)}
                  className="bg-[#FAF7F1] hover:bg-[#E4DDD0] text-[#1B1712] px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSavingCreds}
                  className="bg-[#17140F] hover:bg-[#2A241B] text-[#FAF7F1] px-5 py-2 rounded-xl text-xs font-bold shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isSavingCreds ? 'جارٍ الحفظ...' : 'حفظ البيانات الجديدة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
