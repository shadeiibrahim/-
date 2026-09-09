import { Listing, HousingRequest, AdminStats, SiteSettings } from '../types.ts';

const TOKEN_KEY = 'arkan_admin_token';

export function getAdminToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAdminToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeAdminToken() {
  localStorage.removeItem(TOKEN_KEY);
}

function getAuthHeaders(): HeadersInit {
  const token = getAdminToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Track Visit
export async function trackVisit(path: string = '/'): Promise<{ count: number }> {
  try {
    const res = await fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path }),
    });
    return await res.json();
  } catch (err) {
    console.error('Failed to track visit:', err);
    return { count: 0 };
  }
}

// Get Total Visits
export async function getVisits(): Promise<{ totalVisits: number }> {
  try {
    const res = await fetch('/api/visits');
    return await res.json();
  } catch {
    return { totalVisits: 0 };
  }
}

// Fetch Listings (Public)
export async function fetchListings(params?: {
  category?: string;
  budget?: string;
  distance?: string;
  gender?: string;
  propertyType?: string;
  neighborhood?: string;
  includeHidden?: boolean;
}): Promise<Listing[]> {
  const query = new URLSearchParams();
  if (params?.category) query.set('category', params.category);
  if (params?.budget) query.set('budget', params.budget);
  if (params?.distance) query.set('distance', params.distance);
  if (params?.gender) query.set('gender', params.gender);
  if (params?.propertyType) query.set('propertyType', params.propertyType);
  if (params?.neighborhood) query.set('neighborhood', params.neighborhood);
  if (params?.includeHidden) query.set('includeHidden', 'true');

  const res = await fetch(`/api/listings?${query.toString()}`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error('فشل جلب قائمة العقارات');
  return await res.json();
}

// Fetch Admin Listings (includes hidden)
export async function fetchAdminListings(): Promise<Listing[]> {
  return fetchListings({ includeHidden: true });
}

// Fetch Single Listing
export async function fetchListingById(id: number, skipView = false): Promise<Listing> {
  const res = await fetch(`/api/listings/${id}?skipView=${skipView}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('فشل تحميل تفاصيل العقار');
  return await res.json();
}

// Increment View count
export async function recordListingView(id: number): Promise<{ success: boolean; views: number }> {
  try {
    const res = await fetch(`/api/listings/${id}/view`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) return { success: false, views: 0 };
    return await res.json();
  } catch {
    return { success: false, views: 0 };
  }
}

// Create Listing
export async function createListing(listing: Partial<Listing>): Promise<Listing> {
  const res = await fetch('/api/listings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(listing),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'فشل إضافة العقار');
  }
  return await res.json();
}

// Update Listing
export async function updateListing(id: number, updates: Partial<Listing>): Promise<Listing> {
  const res = await fetch(`/api/listings/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'فشل تحديث العقار');
  }
  return await res.json();
}

// Quick status change
export async function updateListingStatus(id: number, status: Listing['status']): Promise<Listing> {
  const res = await fetch(`/api/listings/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'فشل تحديث حالة العقار');
  }
  return await res.json();
}

// Delete Listing
export async function deleteListing(id: number): Promise<void> {
  const res = await fetch(`/api/listings/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'فشل حذف العقار');
  }
}

// Submit Housing Request
export async function submitHousingRequest(data: {
  budget: number;
  gender: string;
  people: number;
  area: string;
  whatsapp: string;
}): Promise<HousingRequest> {
  const res = await fetch('/api/requests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'فشل إرسال طلب السكن');
  }
  return await res.json();
}

// Fetch Housing Requests (Admin)
export async function fetchHousingRequests(): Promise<HousingRequest[]> {
  const res = await fetch('/api/requests', {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('فشل جلب طلبات السكن');
  return await res.json();
}

export const fetchAdminRequests = fetchHousingRequests;

// Update Housing Request Status
export async function updateRequestStatus(id: number, status: HousingRequest['status']): Promise<HousingRequest> {
  const res = await fetch(`/api/requests/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'فشل تحديث حالة الطلب');
  }
  return await res.json();
}

export const updateHousingRequestStatus = updateRequestStatus;

// Delete Housing Request
export async function deleteHousingRequest(id: number): Promise<void> {
  const res = await fetch(`/api/requests/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'فشل حذف الطلب');
  }
}

// Admin Login
export async function adminLogin(password: string, username = 'admin'): Promise<{ token: string; user: any }> {
  const res = await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'فشل تسجيل الدخول');
  }

  setAdminToken(data.token);
  return data;
}

// Check Admin Auth
export async function checkAdminAuth(): Promise<{ authenticated: boolean; user?: any }> {
  try {
    const res = await fetch('/api/admin/me', {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    return data;
  } catch {
    return { authenticated: false };
  }
}

// Admin Logout
export async function adminLogout(): Promise<void> {
  try {
    await fetch('/api/admin/logout', { method: 'POST', headers: getAuthHeaders() });
  } finally {
    removeAdminToken();
  }
}

// Update Admin Credentials
export async function updateAdminCredentials(newUsername?: string, newPassword?: string): Promise<{ success: boolean; message: string; username?: string }> {
  const res = await fetch('/api/admin/credentials', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ newUsername, newPassword }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'فشل تحديث بيانات الدخول');
  }
  return data;
}

// Admin Stats
export async function fetchAdminStats(): Promise<AdminStats> {
  const res = await fetch('/api/admin/stats', {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('فشل جلب الإحصائيات');
  return await res.json();
}

// Fetch Site Settings (Public)
export async function fetchSiteSettings(): Promise<SiteSettings> {
  const res = await fetch('/api/settings');
  if (!res.ok) throw new Error('فشل جلب إعدادات الموقع');
  return await res.json();
}

// Update Site Settings (Admin)
export async function updateSiteSettings(settings: Partial<SiteSettings>): Promise<{ success: boolean; settings: SiteSettings; message: string }> {
  const res = await fetch('/api/admin/settings', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(settings),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'فشل حفظ الإعدادات');
  }
  return data;
}

// Reset Site Settings to Defaults (Admin)
export async function resetSiteSettings(): Promise<{ success: boolean; settings: SiteSettings; message: string }> {
  const res = await fetch('/api/admin/settings/reset', {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'فشل استعادة الإعدادات');
  }
  return data;
}
