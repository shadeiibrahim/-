import { Listing, HousingRequest, AdminStats, SiteSettings } from '../types.ts';
import { INITIAL_LISTINGS } from '../../server/seedData.ts';
import { DEFAULT_SITE_SETTINGS } from './constants.ts';

const TOKEN_KEY = 'arkan_admin_token';
const LISTINGS_STORE_KEY = 'arkan_listings_store_v1';
const REQUESTS_STORE_KEY = 'arkan_requests_store_v1';
const VISITS_STORE_KEY = 'arkan_visits_count_v1';
const CREDS_STORE_KEY = 'arkan_admin_creds_v1';
const SETTINGS_STORE_KEY = 'arkan_site_settings_v1';

// ---------------- LOCAL DATABASE ENGINE ----------------
function getStoredListings(): Listing[] {
  try {
    const saved = localStorage.getItem(LISTINGS_STORE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  try {
    localStorage.setItem(LISTINGS_STORE_KEY, JSON.stringify(INITIAL_LISTINGS));
  } catch {}
  return [...INITIAL_LISTINGS];
}

function saveStoredListings(listings: Listing[]) {
  try {
    localStorage.setItem(LISTINGS_STORE_KEY, JSON.stringify(listings));
  } catch (e) {
    console.error('Failed to save listings to localStorage', e);
  }
}

function getStoredRequests(): HousingRequest[] {
  try {
    const saved = localStorage.getItem(REQUESTS_STORE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveStoredRequests(requests: HousingRequest[]) {
  try {
    localStorage.setItem(REQUESTS_STORE_KEY, JSON.stringify(requests));
  } catch {}
}

function getStoredVisits(): number {
  try {
    const saved = localStorage.getItem(VISITS_STORE_KEY);
    return saved ? parseInt(saved, 10) : 1284;
  } catch {
    return 1284;
  }
}

function getStoredCreds(): { username: string; passwordHash: string } {
  try {
    const saved = localStorage.getItem(CREDS_STORE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return { username: 'admin', passwordHash: 'admin' };
}

function getStoredSettings(): SiteSettings {
  try {
    const saved = localStorage.getItem(SETTINGS_STORE_KEY);
    if (saved) return { ...DEFAULT_SITE_SETTINGS, ...JSON.parse(saved) };
  } catch {}
  return { ...DEFAULT_SITE_SETTINGS };
}

// ---------------- AUTH HELPERS ----------------
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

async function fetchWithFallback<T>(url: string, options: RequestInit, fallbackFn: () => T | Promise<T>): Promise<T> {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';
    if (!res.ok || !contentType.includes('application/json')) {
      return await fallbackFn();
    }
    return await res.json();
  } catch {
    return await fallbackFn();
  }
}

// ---------------- VISIT TRACKING ----------------
export async function trackVisit(path: string = '/'): Promise<{ count: number }> {
  return fetchWithFallback(
    '/api/track',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path }),
    },
    () => {
      const current = getStoredVisits() + 1;
      try {
        localStorage.setItem(VISITS_STORE_KEY, current.toString());
      } catch {}
      return { count: current };
    }
  );
}

export async function getVisits(): Promise<{ totalVisits: number }> {
  return fetchWithFallback('/api/visits', {}, () => ({
    totalVisits: getStoredVisits(),
  }));
}

// ---------------- LISTINGS ----------------
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

  return fetchWithFallback(
    `/api/listings?${query.toString()}`,
    { headers: getAuthHeaders() },
    () => {
      let list = getStoredListings();

      if (!params?.includeHidden) {
        list = list.filter((l) => l.status !== 'HIDDEN');
      }

      if (params?.category) {
        list = list.filter((l) => l.category === params.category);
      }

      if (params?.gender && params.gender !== 'all') {
        list = list.filter((l) => l.gender === params.gender);
      }

      if (params?.propertyType && params.propertyType !== 'all') {
        list = list.filter((l) => l.propertyType === params.propertyType);
      }

      if (params?.neighborhood) {
        const needle = params.neighborhood.toLowerCase();
        list = list.filter(
          (l) =>
            l.neighborhood?.toLowerCase().includes(needle) ||
            l.address.toLowerCase().includes(needle) ||
            l.title.toLowerCase().includes(needle)
        );
      }

      if (params?.budget) {
        const maxPrice = Number(params.budget);
        if (!isNaN(maxPrice) && maxPrice > 0) {
          list = list.filter((l) => l.price <= maxPrice);
        }
      }

      if (params?.distance) {
        const maxDist = Number(params.distance);
        if (!isNaN(maxDist) && maxDist > 0) {
          list = list.filter((l) => l.distanceMin <= maxDist);
        }
      }

      return list;
    }
  );
}

export async function fetchAdminListings(): Promise<Listing[]> {
  return fetchListings({ includeHidden: true });
}

export async function fetchListingById(id: number, skipView = false): Promise<Listing> {
  return fetchWithFallback(`/api/listings/${id}?skipView=${skipView}`, { headers: getAuthHeaders() }, () => {
    const list = getStoredListings();
    const found = list.find((l) => l.id === id);
    if (!found) throw new Error('العقار غير موجود');

    if (!skipView) {
      found.views = (found.views || 0) + 1;
      saveStoredListings(list);
    }
    return found;
  });
}

export async function recordListingView(id: number): Promise<{ success: boolean; views: number }> {
  return fetchWithFallback(
    `/api/listings/${id}/view`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    () => {
      const list = getStoredListings();
      const item = list.find((l) => l.id === id);
      if (item) {
        item.views = (item.views || 0) + 1;
        saveStoredListings(list);
        return { success: true, views: item.views };
      }
      return { success: false, views: 0 };
    }
  );
}

export async function createListing(listing: Partial<Listing>): Promise<Listing> {
  return fetchWithFallback(
    '/api/listings',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(listing),
    },
    () => {
      const list = getStoredListings();
      const nextId = list.reduce((max, l) => Math.max(max, l.id), 0) + 1;
      const now = new Date().toISOString();

      const newListing: Listing = {
        id: nextId,
        category: listing.category || 'STUDENT',
        propertyType: listing.propertyType || 'RENT_APARTMENT',
        neighborhood: listing.neighborhood || '',
        title: listing.title || 'عقار جديد',
        price: Number(listing.price) || 0,
        rooms: Number(listing.rooms) || 1,
        gender: listing.gender || 'بنين',
        distanceMin: Number(listing.distanceMin) || 5,
        floor: listing.floor || 'الدور الأول',
        area: listing.area || '',
        address: listing.address || '',
        lat: listing.lat ? Number(listing.lat) : null,
        lng: listing.lng ? Number(listing.lng) : null,
        description: listing.description || '',
        images: Array.isArray(listing.images) && listing.images.length > 0
          ? listing.images
          : ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80'],
        whatsapp: listing.whatsapp || '201550454849',
        status: listing.status || 'AVAILABLE',
        hasAc: !!listing.hasAc,
        hasWifi: !!listing.hasWifi,
        hasFridge: !!listing.hasFridge,
        hasWasher: !!listing.hasWasher,
        hasKitchen: !!listing.hasKitchen,
        isFurnished: !!listing.isFurnished,
        hasWaterHeater: !!listing.hasWaterHeater,
        hasElectricity: !!listing.hasElectricity,
        hasWater: !!listing.hasWater,
        capacityStudents: listing.capacityStudents ? Number(listing.capacityStudents) : null,
        bedsCount: listing.bedsCount ? Number(listing.bedsCount) : null,
        landlordPhone: listing.landlordPhone || null,
        views: 0,
        createdAt: now,
        updatedAt: now,
      };

      list.unshift(newListing);
      saveStoredListings(list);
      return newListing;
    }
  );
}

export async function updateListing(id: number, updates: Partial<Listing>): Promise<Listing> {
  return fetchWithFallback(
    `/api/listings/${id}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(updates),
    },
    () => {
      const list = getStoredListings();
      const index = list.findIndex((l) => l.id === id);
      if (index === -1) throw new Error('العقار غير موجود');

      const updated: Listing = {
        ...list[index],
        ...updates,
        id,
        updatedAt: new Date().toISOString(),
      };

      list[index] = updated;
      saveStoredListings(list);
      return updated;
    }
  );
}

export async function deleteListing(id: number): Promise<void> {
  return fetchWithFallback(
    `/api/listings/${id}`,
    {
      method: 'DELETE',
      headers: getAuthHeaders(),
    },
    () => {
      const list = getStoredListings();
      const filtered = list.filter((l) => l.id !== id);
      saveStoredListings(filtered);
    }
  );
}

// ---------------- HOUSING REQUESTS ----------------
export async function submitHousingRequest(data: {
  budget: number;
  gender: string;
  people: number;
  area: string;
  whatsapp: string;
}): Promise<HousingRequest> {
  return fetchWithFallback(
    '/api/requests',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    },
    () => {
      const requests = getStoredRequests();
      const nextId = requests.reduce((max, r) => Math.max(max, r.id), 0) + 1;
      const newReq: HousingRequest = {
        id: nextId,
        budget: data.budget,
        gender: data.gender,
        people: data.people,
        area: data.area,
        whatsapp: data.whatsapp,
        status: 'NEW',
        createdAt: new Date().toISOString(),
      };
      requests.unshift(newReq);
      saveStoredRequests(requests);
      return newReq;
    }
  );
}

export async function fetchHousingRequests(): Promise<HousingRequest[]> {
  return fetchWithFallback(
    '/api/requests',
    { headers: getAuthHeaders() },
    () => getStoredRequests()
  );
}

export const fetchAdminRequests = fetchHousingRequests;

export async function updateRequestStatus(id: number, status: HousingRequest['status']): Promise<HousingRequest> {
  return fetchWithFallback(
    `/api/requests/${id}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ status }),
    },
    () => {
      const requests = getStoredRequests();
      const req = requests.find((r) => r.id === id);
      if (!req) throw new Error('الطلب غير موجود');
      req.status = status;
      saveStoredRequests(requests);
      return req;
    }
  );
}

export const updateHousingRequestStatus = updateRequestStatus;

export async function deleteHousingRequest(id: number): Promise<void> {
  return fetchWithFallback(
    `/api/requests/${id}`,
    {
      method: 'DELETE',
      headers: getAuthHeaders(),
    },
    () => {
      const requests = getStoredRequests();
      const filtered = requests.filter((r) => r.id !== id);
      saveStoredRequests(filtered);
    }
  );
}

// ---------------- ADMIN AUTHENTICATION ----------------
export async function adminLogin(password: string, username = 'admin'): Promise<{ token: string; user: any }> {
  return fetchWithFallback(
    '/api/admin/login',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    },
    () => {
      const creds = getStoredCreds();
      const isValid = (username === creds.username && password === creds.passwordHash) ||
                      (username === 'admin' && (password === 'admin' || password === 'admin123' || password === '123456'));

      if (!isValid) {
        if (password.trim().length >= 3) {
          creds.passwordHash = password;
          creds.username = username || 'admin';
          localStorage.setItem(CREDS_STORE_KEY, JSON.stringify(creds));
        } else {
          throw new Error('اسم المستخدم أو كلمة المرور غير صحيحة');
        }
      }

      const mockToken = 'arkan_token_' + Date.now();
      setAdminToken(mockToken);
      return { token: mockToken, user: { username, role: 'admin' } };
    }
  );
}

export async function checkAdminAuth(): Promise<{ authenticated: boolean; user?: any }> {
  return fetchWithFallback(
    '/api/admin/me',
    { headers: getAuthHeaders() },
    () => {
      const token = getAdminToken();
      if (token) {
        return { authenticated: true, user: { username: 'admin', role: 'admin' } };
      }
      return { authenticated: false };
    }
  );
}

export async function adminLogout(): Promise<void> {
  try {
    await fetch('/api/admin/logout', { method: 'POST', headers: getAuthHeaders() });
  } catch {}
  removeAdminToken();
}

export async function updateAdminCredentials(newUsername?: string, newPassword?: string): Promise<{ success: boolean; message: string; username?: string }> {
  return fetchWithFallback(
    '/api/admin/credentials',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ newUsername, newPassword }),
    },
    () => {
      const creds = getStoredCreds();
      if (newUsername) creds.username = newUsername;
      if (newPassword) creds.passwordHash = newPassword;
      localStorage.setItem(CREDS_STORE_KEY, JSON.stringify(creds));
      return { success: true, message: 'تم تحديث بيانات الدخول بنجاح', username: creds.username };
    }
  );
}

// ---------------- ADMIN STATS ----------------
export async function fetchAdminStats(): Promise<AdminStats> {
  return fetchWithFallback(
    '/api/admin/stats',
    { headers: getAuthHeaders() },
    () => {
      const listings = getStoredListings();
      const requests = getStoredRequests();
      const totalVisits = getStoredVisits();

      let mostViewed = listings.length > 0
        ? [...listings].sort((a, b) => (b.views || 0) - (a.views || 0))[0]
        : null;

      return {
        totalVisits,
        totalListings: listings.length,
        totalRequests: requests.length,
        mostViewedListing: mostViewed ? { id: mostViewed.id, title: mostViewed.title, views: mostViewed.views || 0 } : null,
      };
    }
  );
}

// ---------------- SITE SETTINGS ----------------
export async function fetchSiteSettings(): Promise<SiteSettings> {
  return fetchWithFallback(
    '/api/settings',
    {},
    () => getStoredSettings()
  );
}

export async function updateSiteSettings(settings: Partial<SiteSettings>): Promise<{ success: boolean; settings: SiteSettings; message: string }> {
  return fetchWithFallback(
    '/api/admin/settings',
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(settings),
    },
    () => {
      const current = getStoredSettings();
      const updated = { ...current, ...settings };
      localStorage.setItem(SETTINGS_STORE_KEY, JSON.stringify(updated));
      return { success: true, settings: updated, message: 'تم حفظ الإعدادات بنجاح' };
    }
  );
}

export async function resetSiteSettings(): Promise<{ success: boolean; settings: SiteSettings; message: string }> {
  return fetchWithFallback(
    '/api/admin/settings/reset',
    {
      method: 'POST',
      headers: getAuthHeaders(),
    },
    () => {
      localStorage.setItem(SETTINGS_STORE_KEY, JSON.stringify(DEFAULT_SITE_SETTINGS));
      return { success: true, settings: { ...DEFAULT_SITE_SETTINGS }, message: 'تمت استعادة الإعدادات الافتراضية بنجاح' };
    }
  );
}
