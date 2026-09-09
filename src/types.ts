export type ListingStatus = 'AVAILABLE' | 'RESERVED' | 'RENTED' | 'HIDDEN';

export type ListingCategory = 'STUDENT' | 'LOCAL';

export type PropertyType = 'RENT_APARTMENT' | 'SALE' | 'COMMERCIAL' | 'LAND';

export interface Listing {
  id: number;
  category: ListingCategory;
  propertyType?: PropertyType | null;
  neighborhood?: string | null;
  title: string;
  price: number;
  rooms: number;
  gender: string; // 'بنين' | 'بنات' | 'عائلي' | 'مختلط'
  distanceMin: number;
  floor: string;
  area: string;
  address: string;
  lat?: number | null;
  lng?: number | null;
  description: string;
  images: string[]; // parsed array of URLs
  whatsapp: string;
  status: ListingStatus;
  hasAc: boolean;
  hasWifi: boolean;
  hasFridge: boolean;
  hasWasher: boolean;
  hasKitchen: boolean;
  isFurnished: boolean;
  hasWaterHeater: boolean;
  hasElectricity: boolean;
  hasWater: boolean;
  capacityStudents?: number | null;
  bedsCount?: number | null;
  landlordPhone?: string | null;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface HousingRequest {
  id: number;
  budget: number;
  gender: string;
  people: number;
  area: string;
  whatsapp: string;
  status: 'NEW' | 'CONTACTED' | 'CLOSED';
  createdAt: string;
}

export interface Visit {
  id: number;
  path: string;
  createdAt: string;
}

export interface LoginAttempt {
  id: number;
  ip: string;
  success: boolean;
  createdAt: string;
}

export interface AdminStats {
  totalVisits: number;
  todayVisits: number;
  totalListings: number;
  activeListings: number;
  mostViewedListing: Listing | null;
  totalRequests: number;
  newRequests: number;
}

export interface MapLandmark {
  id: string;
  name: string;
  category: 'university' | 'hospital' | 'market' | 'transport' | 'beach' | 'landmark' | 'other';
  note: string;
  lat: number;
  lng: number;
  icon?: string;
}

export interface ServicePlace {
  name: string;
  note: string;
  distance: string;
}

export interface ServiceCategory {
  id: string;
  icon: string; // 'bus' | 'shopping-cart' | 'pill' | 'utensils' | 'shirt' | 'map-pin'
  title: string;
  badge: string;
  places: ServicePlace[];
}

export type TransportCategory = ServiceCategory;

export interface AboutPoint {
  title: string;
  desc: string;
  badge: string;
}

export interface SiteSettings {
  siteName: string;
  siteSlogan: string;
  logoUrl: string;
  logoLetter: string;
  commissionBadge: string;
  pricingModelText: string;
  listingFeeText?: string;
  heroNotice: string;
  heroStudentBadge?: string;
  heroStudentTitle?: string;
  heroStudentDesc?: string;
  heroLocalBadge?: string;
  heroLocalTitle?: string;
  heroLocalDesc?: string;
  phone: string;
  whatsappNumber: string;
  whatsappWelcomeMsg: string;
  facebookUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  footerDesc: string;
  copyrightText: string;
  aboutTitle: string;
  aboutText: string;
  aboutPoints: AboutPoint[];
  mapCenterLat: number;
  mapCenterLng: number;
  mapDefaultZoom: number;
  universityGateName: string;
  universityGateNote: string;
  mapLandmarks: MapLandmark[];
  transportHeaderTitle: string;
  transportHeaderSubtitle: string;
  transportCategories: ServiceCategory[];
}
