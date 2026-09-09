import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Listing, HousingRequest, Visit, LoginAttempt, AdminStats, SiteSettings } from '../src/types.ts';
import { INITIAL_LISTINGS, DEFAULT_SITE_SETTINGS } from './seedData.ts';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'arkan_store.json');

interface DatabaseSchema {
  listings: Listing[];
  housingRequests: HousingRequest[];
  visits: Visit[];
  loginAttempts: LoginAttempt[];
  nextListingId: number;
  nextRequestId: number;
  nextVisitId: number;
  adminCredentials?: {
    username: string;
    password: string;
  };
  siteSettings?: SiteSettings;
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // Ensure listings are seeded if empty
        if (!parsed.listings || parsed.listings.length === 0) {
          parsed.listings = INITIAL_LISTINGS;
          parsed.nextListingId = Math.max(...INITIAL_LISTINGS.map(l => l.id)) + 1;
        }
        if (!parsed.housingRequests) parsed.housingRequests = [];
        if (!parsed.visits) parsed.visits = [];
        if (!parsed.loginAttempts) parsed.loginAttempts = [];
        if (!parsed.nextRequestId) parsed.nextRequestId = 1;
        if (!parsed.nextVisitId) parsed.nextVisitId = parsed.visits.length + 1;
        parsed.siteSettings = parsed.siteSettings
          ? { ...DEFAULT_SITE_SETTINGS, ...parsed.siteSettings }
          : DEFAULT_SITE_SETTINGS;
        return parsed;
      }
    } catch (e) {
      console.error('Error loading database file, initializing defaults:', e);
    }

    const defaultData: DatabaseSchema = {
      listings: INITIAL_LISTINGS,
      housingRequests: [
        {
          id: 1,
          budget: 1500,
          gender: 'بنين',
          people: 3,
          area: 'المساعيد - شارع أسيوط',
          whatsapp: '01550454849',
          status: 'NEW',
          createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        },
        {
          id: 2,
          budget: 2000,
          gender: 'بنات',
          people: 2,
          area: 'بجوار بوابة الجامعة مباشرة',
          whatsapp: '01550454849',
          status: 'CONTACTED',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        }
      ],
      visits: Array.from({ length: 428 }).map((_, i) => ({
        id: i + 1,
        path: '/',
        createdAt: new Date(Date.now() - (428 - i) * 120000).toISOString(),
      })),
      loginAttempts: [],
      nextListingId: Math.max(...INITIAL_LISTINGS.map(l => l.id)) + 1,
      nextRequestId: 3,
      nextVisitId: 429,
      siteSettings: DEFAULT_SITE_SETTINGS,
    };

    this.saveData(defaultData);
    return defaultData;
  }

  private saveData(dataToSave: DatabaseSchema = this.data) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to save database file:', e);
    }
  }

  // --- VISITS TRACKING ---
  public recordVisit(pathStr: string): number {
    const visit: Visit = {
      id: this.data.nextVisitId++,
      path: pathStr || '/',
      createdAt: new Date().toISOString(),
    };
    this.data.visits.push(visit);
    this.saveData();
    return this.data.visits.length;
  }

  public getTotalVisits(): number {
    return this.data.visits.length;
  }

  // --- LISTINGS ---
  public getListings(options: {
    category?: string;
    budget?: string;
    distance?: string;
    gender?: string;
    propertyType?: string;
    neighborhood?: string;
    includeHidden?: boolean;
  }): Listing[] {
    let result = [...this.data.listings];

    if (!options.includeHidden) {
      result = result.filter(l => l.status !== 'HIDDEN');
    }

    if (options.category) {
      result = result.filter(l => l.category === options.category);
    }

    if (options.propertyType) {
      result = result.filter(l => l.propertyType === options.propertyType);
    }

    if (options.gender && options.gender !== 'all' && options.gender !== 'الكل') {
      result = result.filter(l => l.gender === options.gender);
    }

    if (options.neighborhood && options.neighborhood.trim()) {
      const q = options.neighborhood.trim().toLowerCase();
      result = result.filter(l =>
        (l.neighborhood && l.neighborhood.toLowerCase().includes(q)) ||
        l.address.toLowerCase().includes(q) ||
        l.title.toLowerCase().includes(q)
      );
    }

    if (options.distance) {
      const maxDist = parseInt(options.distance, 10);
      if (!isNaN(maxDist) && maxDist > 0) {
        result = result.filter(l => l.distanceMin <= maxDist);
      }
    }

    if (options.budget) {
      // Handles formats like "1000", "1000-1500", "2000-2500", "2500"
      if (options.budget.includes('-')) {
        const [minStr, maxStr] = options.budget.split('-');
        const min = parseInt(minStr, 10);
        const max = parseInt(maxStr, 10);
        if (!isNaN(min) && !isNaN(max)) {
          result = result.filter(l => l.price >= min && l.price <= max);
        }
      } else {
        const max = parseInt(options.budget, 10);
        if (!isNaN(max)) {
          result = result.filter(l => l.price <= max);
        }
      }
    }

    // Sort: Available first, then by date desc
    return result.sort((a, b) => {
      if (a.status === 'AVAILABLE' && b.status !== 'AVAILABLE') return -1;
      if (a.status !== 'AVAILABLE' && b.status === 'AVAILABLE') return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  public getListingById(id: number, incrementViews = false): Listing | null {
    const listing = this.data.listings.find(l => l.id === id);
    if (!listing) return null;

    if (incrementViews) {
      listing.views = (listing.views || 0) + 1;
      this.saveData();
    }

    return listing;
  }

  public createListing(listingData: Omit<Listing, 'id' | 'views' | 'createdAt' | 'updatedAt'>): Listing {
    const newListing: Listing = {
      ...listingData,
      id: this.data.nextListingId++,
      views: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.listings.unshift(newListing);
    this.saveData();
    return newListing;
  }

  public updateListing(id: number, updates: Partial<Listing>): Listing | null {
    const idx = this.data.listings.findIndex(l => l.id === id);
    if (idx === -1) return null;

    const existing = this.data.listings[idx];
    const updated: Listing = {
      ...existing,
      ...updates,
      id: existing.id, // prevent id change
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    };

    this.data.listings[idx] = updated;
    this.saveData();
    return updated;
  }

  public updateListingStatus(id: number, status: Listing['status']): Listing | null {
    return this.updateListing(id, { status });
  }

  public deleteListing(id: number): boolean {
    const initialLen = this.data.listings.length;
    this.data.listings = this.data.listings.filter(l => l.id !== id);
    if (this.data.listings.length !== initialLen) {
      this.saveData();
      return true;
    }
    return false;
  }

  // --- HOUSING REQUESTS ---
  public getHousingRequests(): HousingRequest[] {
    return [...this.data.housingRequests].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public createHousingRequest(req: {
    budget: number;
    gender: string;
    people: number;
    area: string;
    whatsapp: string;
  }): HousingRequest {
    const newReq: HousingRequest = {
      id: this.data.nextRequestId++,
      budget: req.budget,
      gender: req.gender,
      people: req.people,
      area: req.area,
      whatsapp: req.whatsapp,
      status: 'NEW',
      createdAt: new Date().toISOString(),
    };
    this.data.housingRequests.unshift(newReq);
    this.saveData();
    return newReq;
  }

  public updateHousingRequestStatus(id: number, status: HousingRequest['status']): HousingRequest | null {
    const target = this.data.housingRequests.find(r => r.id === id);
    if (!target) return null;
    target.status = status;
    this.saveData();
    return target;
  }

  public deleteHousingRequest(id: number): boolean {
    const initialLen = this.data.housingRequests.length;
    this.data.housingRequests = this.data.housingRequests.filter(r => r.id !== id);
    if (this.data.housingRequests.length !== initialLen) {
      this.saveData();
      return true;
    }
    return false;
  }

  // --- STATS ---
  public getStats(): AdminStats {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const todayVisits = this.data.visits.filter(v => new Date(v.createdAt).getTime() >= startOfToday).length;

    const sortedByViews = [...this.data.listings].sort((a, b) => (b.views || 0) - (a.views || 0));
    const mostViewedListing = sortedByViews[0] || null;

    const newRequests = this.data.housingRequests.filter(r => r.status === 'NEW').length;

    return {
      totalVisits: this.data.visits.length,
      todayVisits,
      totalListings: this.data.listings.length,
      activeListings: this.data.listings.filter(l => l.status === 'AVAILABLE').length,
      mostViewedListing,
      totalRequests: this.data.housingRequests.length,
      newRequests,
    };
  }

  // --- RATE LIMITING & AUTH ---
  public recordLoginAttempt(ip: string, success: boolean): void {
    const attempt: LoginAttempt = {
      id: Date.now(),
      ip,
      success,
      createdAt: new Date().toISOString(),
    };
    this.data.loginAttempts.push(attempt);
    // Keep only last 24h
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    this.data.loginAttempts = this.data.loginAttempts.filter(
      a => new Date(a.createdAt).getTime() > cutoff
    );
    this.saveData();
  }

  public isRateLimited(ip: string): boolean {
    const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
    const recentFailedAttempts = this.data.loginAttempts.filter(
      a => a.ip === ip && !a.success && new Date(a.createdAt).getTime() > tenMinutesAgo
    );
    return recentFailedAttempts.length >= 5;
  }

  public resetRateLimit(ip: string): void {
    this.data.loginAttempts = this.data.loginAttempts.filter(a => a.ip !== ip);
    this.saveData();
  }

  public getAdminCredentials(): { username: string; password: string } {
    if (this.data.adminCredentials && this.data.adminCredentials.username && this.data.adminCredentials.password) {
      return this.data.adminCredentials;
    }
    return {
      username: process.env.ADMIN_USERNAME || 'shadeiibrahim',
      password: process.env.ADMIN_PASSWORD || 'shadeiibrahim1997',
    };
  }

  public setAdminCredentials(username: string, password: string): void {
    this.data.adminCredentials = {
      username: username.trim(),
      password: password.trim(),
    };
    this.saveData();
  }

  public getSiteSettings(): SiteSettings {
    if (!this.data.siteSettings) {
      this.data.siteSettings = DEFAULT_SITE_SETTINGS;
      this.saveData();
    }
    return this.data.siteSettings;
  }

  public updateSiteSettings(settings: Partial<SiteSettings>): SiteSettings {
    const current = this.getSiteSettings();
    this.data.siteSettings = {
      ...current,
      ...settings,
    };
    this.saveData();
    return this.data.siteSettings;
  }

  public resetSiteSettings(): SiteSettings {
    this.data.siteSettings = { ...DEFAULT_SITE_SETTINGS };
    this.saveData();
    return this.data.siteSettings;
  }
}

export const db = new Database();

// --- AUTH TOKEN HELPERS ---
const SESSION_SECRET = process.env.SESSION_SECRET || 'arkan-secure-jwt-session-secret-key-2025';

export function generateToken(username: string): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(
    JSON.stringify({
      sub: username,
      role: 'ADMIN',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
    })
  ).toString('base64url');

  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(`${header}.${payload}`)
    .digest('base64url');

  return `${header}.${payload}.${signature}`;
}

export function verifyToken(token: string): { sub: string; role: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [header, payload, signature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(`${header}.${payload}`)
      .digest('base64url');

    if (signature !== expectedSignature) return null;

    const decodedPayload = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (decodedPayload.exp && decodedPayload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return decodedPayload;
  } catch {
    return null;
  }
}
