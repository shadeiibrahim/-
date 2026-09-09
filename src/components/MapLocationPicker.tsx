import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Search,
  LocateFixed,
  Layers,
  ExternalLink,
  Link2,
  Check,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Compass,
} from 'lucide-react';
import L from 'leaflet';
import { SINAI_UNIVERSITY_COORDS, calculateHaversineDistance } from '../lib/haversine.ts';

// Predefined Arish & Sinai University landmarks for 1-click positioning
const ARISH_PRESETS = [
  { name: 'بوابة جامعة سيناء', lat: 31.1304, lng: 33.8032, icon: '🎓' },
  { name: 'حي المساعيد (سكن الطلاب)', lat: 31.1325, lng: 33.7845, icon: '🏢' },
  { name: 'شارع البحر / الكورنيش', lat: 31.1390, lng: 33.7950, icon: '🌊' },
  { name: 'حي الريسة', lat: 31.1450, lng: 33.8350, icon: '🌴' },
  { name: 'حي الكوثر والزهور', lat: 31.1250, lng: 33.7900, icon: '🏡' },
  { name: 'وسط البلد / الرفاعي', lat: 31.1310, lng: 33.8010, icon: '🛍️' },
  { name: 'ضاحية السلام', lat: 31.1370, lng: 33.8200, icon: '🏘️' },
];

export type MapTileProvider = 'google-streets' | 'google-satellite' | 'osm';

interface MapLocationPickerProps {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
  onDistanceCalculated?: (distanceMin: number) => void;
  title?: string;
  subtitle?: string;
  showDistanceHint?: boolean;
}

export const MapLocationPicker: React.FC<MapLocationPickerProps> = ({
  lat,
  lng,
  onChange,
  onDistanceCalculated,
  title = 'تحديد الموقع على خريطة جوجل التفاعلية',
  subtitle = 'اضغط مباشرة على الخريطة أو اسحب العلامة لتحديد مكان العقار بدقة',
  showDistanceHint = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Map Tile Type: Google Streets or Google Satellite Hybrid or OSM
  const [mapType, setMapType] = useState<MapTileProvider>('google-streets');

  // Input states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string>('');

  const [googleMapsUrl, setGoogleMapsUrl] = useState<string>('');
  const [isResolvingUrl, setIsResolvingUrl] = useState<boolean>(false);
  const [urlMessage, setUrlMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [isLocatingUser, setIsLocatingUser] = useState<boolean>(false);
  const [showManualInputs, setShowManualInputs] = useState<boolean>(false);
  const [copiedCoords, setCopiedCoords] = useState<boolean>(false);

  // Ensure valid fallback coordinates (Sinai University / Masaeed default)
  const currentLat = typeof lat === 'number' && !isNaN(lat) && lat !== 0 ? lat : 31.1325;
  const currentLng = typeof lng === 'number' && !isNaN(lng) && lng !== 0 ? lng : 33.7845;

  // Calculate distance in km and approximate walking minutes
  const distanceKm = calculateHaversineDistance(currentLat, currentLng);
  const walkMinutes = Math.max(1, Math.round(distanceKm * 12)); // ~5km/h walking
  const driveMinutes = Math.max(1, Math.round(distanceKm * 2)); // ~30km/h driving

  // Update distance to parent if callback provided
  useEffect(() => {
    if (onDistanceCalculated) {
      onDistanceCalculated(walkMinutes);
    }
  }, [currentLat, currentLng, walkMinutes, onDistanceCalculated]);

  // Create custom marker icon
  const createPinIcon = () => {
    return L.divIcon({
      className: 'custom-location-pin',
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: grab;">
          <div style="
            background: linear-gradient(135deg, #C9A15E 0%, #17140F 100%);
            color: #FAF7F1;
            width: 42px;
            height: 42px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 15px rgba(0,0,0,0.4);
            border: 2.5px solid #FFFFFF;
          ">
            <span style="transform: rotate(45deg); font-size: 18px; margin-top: -2px;">📍</span>
          </div>
          <div style="
            width: 14px;
            height: 6px;
            background: rgba(0,0,0,0.3);
            border-radius: 50%;
            filter: blur(1.5px);
            margin-top: 2px;
          "></div>
        </div>
      `,
      iconSize: [42, 50],
      iconAnchor: [21, 50],
    });
  };

  // Helper to get tile layer URL
  const getTileUrl = (type: MapTileProvider) => {
    switch (type) {
      case 'google-streets':
        return 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';
      case 'google-satellite':
        return 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}';
      case 'osm':
      default:
        return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    }
  };

  const getTileAttribution = (type: MapTileProvider) => {
    switch (type) {
      case 'google-streets':
        return 'خرائط جوجل © Google Maps';
      case 'google-satellite':
        return 'أقمار صناعية © Google Imagery';
      case 'osm':
      default:
        return '© OpenStreetMap contributors';
    }
  };

  // Switch Tile Layer
  const switchTileLayer = (newType: MapTileProvider) => {
    setMapType(newType);
    if (!mapInstanceRef.current) return;

    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }

    const newLayer = L.tileLayer(getTileUrl(newType), {
      maxZoom: 20,
      attribution: getTileAttribution(newType),
    }).addTo(mapInstanceRef.current);

    tileLayerRef.current = newLayer;
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapContainerRef.current, {
        center: [currentLat, currentLng],
        zoom: 16,
        zoomControl: true,
      });

      // Add Tile Layer
      const initialLayer = L.tileLayer(getTileUrl(mapType), {
        maxZoom: 20,
        attribution: getTileAttribution(mapType),
      }).addTo(map);

      tileLayerRef.current = initialLayer;

      // Add Draggable Marker
      const pinMarker = L.marker([currentLat, currentLng], {
        icon: createPinIcon(),
        draggable: true,
        autoPan: true,
      }).addTo(map);

      // Bind popup info
      pinMarker.bindPopup(`
        <div style="direction: rtl; text-align: right; font-family: 'IBM Plex Sans Arabic', sans-serif; padding: 4px;">
          <strong style="color: #17140F; font-size: 13px; display: block; margin-bottom: 2px;">موقع العقار المحدد</strong>
          <span style="color: #A67C3D; font-size: 11px; font-weight: bold;">اسحب العلامة لتغيير المكان بدقة</span>
        </div>
      `);

      // Handle Marker Drag
      pinMarker.on('dragend', () => {
        const position = pinMarker.getLatLng();
        onChange(Number(position.lat.toFixed(6)), Number(position.lng.toFixed(6)));
      });

      // Handle Map Click (move marker to clicked point)
      map.on('click', (e: L.LeafletMouseEvent) => {
        const clickedLat = Number(e.latlng.lat.toFixed(6));
        const clickedLng = Number(e.latlng.lng.toFixed(6));
        pinMarker.setLatLng([clickedLat, clickedLng]);
        onChange(clickedLat, clickedLng);
      });

      mapInstanceRef.current = map;
      markerRef.current = pinMarker;

      // Invalidate size after container renders
      setTimeout(() => {
        map.invalidateSize();
      }, 200);
    }, 100);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update marker position if coordinates change externally
  useEffect(() => {
    if (markerRef.current && mapInstanceRef.current) {
      const markerPos = markerRef.current.getLatLng();
      if (
        Math.abs(markerPos.lat - currentLat) > 0.00001 ||
        Math.abs(markerPos.lng - currentLng) > 0.00001
      ) {
        markerRef.current.setLatLng([currentLat, currentLng]);
        mapInstanceRef.current.panTo([currentLat, currentLng]);
      }
    }
  }, [currentLat, currentLng]);

  // Set location directly (fly map to it)
  const setLocation = (targetLat: number, targetLng: number, zoomLevel: number = 16) => {
    const validLat = Number(targetLat.toFixed(6));
    const validLng = Number(targetLng.toFixed(6));
    onChange(validLat, validLng);

    if (markerRef.current) {
      markerRef.current.setLatLng([validLat, validLng]);
    }
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([validLat, validLng], zoomLevel, {
        duration: 1,
      });
    }
  };

  // Search Address or Place Name via Nominatim
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError('');

    try {
      // Prioritize Arish query
      const queryParam = searchQuery.includes('العريش') ? searchQuery : `${searchQuery} العريش مصر`;
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        queryParam
      )}&limit=5&countrycodes=eg`;

      const res = await fetch(url, {
        headers: {
          'Accept-Language': 'ar,en',
        },
      });
      const data = await res.json();

      if (data && data.length > 0) {
        const firstResult = data[0];
        const newLat = parseFloat(firstResult.lat);
        const newLng = parseFloat(firstResult.lon);
        setLocation(newLat, newLng, 17);
        setSearchError('');
      } else {
        setSearchError('لم يتم العثور على نتائج لهذا البحث. جرب اسم حي آخر مثل المساعيد أو شارع البحر.');
      }
    } catch {
      setSearchError('حدث خطأ أثناء البحث، يرجى المحاولة لاحقاً أو النقر مباشرة على الخريطة.');
    } finally {
      setIsSearching(false);
    }
  };

  // Parse and extract coordinates from Google Maps Link or Coordinates string
  const handleExtractFromUrl = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const input = googleMapsUrl.trim();
    if (!input) return;

    setUrlMessage(null);

    // 1. Direct coordinates: e.g. "31.1325, 33.7845" or "31.1325 33.7845"
    const directCoordsMatch = input.match(
      /^(-?\d+(\.\d+)?)[,\s]+(-?\d+(\.\d+)?)$/
    );
    if (directCoordsMatch) {
      const parsedLat = parseFloat(directCoordsMatch[1]);
      const parsedLng = parseFloat(directCoordsMatch[3]);
      if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
        setLocation(parsedLat, parsedLng, 17);
        setUrlMessage({ type: 'success', text: 'تم استخراج الإحداثيات وتحديد المكان على الخريطة بنجاح!' });
        return;
      }
    }

    // 2. Direct regex match on Google Maps URLs (e.g. @31.1325,33.7845 or ?q=31.1325,33.7845)
    const urlRegexMatch =
      input.match(/@([0-9.-]+),([0-9.-]+)/) ||
      input.match(/[?&]q=([0-9.-]+),([0-9.-]+)/) ||
      input.match(/[?&]ll=([0-9.-]+),([0-9.-]+)/) ||
      input.match(/destination=([0-9.-]+),([0-9.-]+)/) ||
      input.match(/!3d([0-9.-]+)!4d([0-9.-]+)/);

    if (urlRegexMatch) {
      const parsedLat = parseFloat(urlRegexMatch[1]);
      const parsedLng = parseFloat(urlRegexMatch[2]);
      if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
        setLocation(parsedLat, parsedLng, 17);
        setUrlMessage({ type: 'success', text: 'تم استخراج الموقع من رابط خرائط جوجل وتثبيته على الخريطة!' });
        return;
      }
    }

    // 3. If it's a short URL (maps.app.goo.gl or goo.gl/maps), resolve via backend
    setIsResolvingUrl(true);
    try {
      const res = await fetch('/api/resolve-maps-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: input }),
      });
      const data = await res.json();
      if (data.success && data.lat && data.lng) {
        setLocation(data.lat, data.lng, 17);
        setUrlMessage({ type: 'success', text: 'تم فك رابط خرائط جوجل بنجاح وتحديد الموقع على الخريطة!' });
      } else {
        setUrlMessage({
          type: 'error',
          text: data.error || 'تعذر استخراج الإحداثيات من هذا الرابط. يمكنك الضغط مباشرة على المكان بالخريطة.',
        });
      }
    } catch {
      setUrlMessage({
        type: 'error',
        text: 'تعذر الاتصال بخادم فك الروابط. يرجى النقر مباشرة على الخريطة.',
      });
    } finally {
      setIsResolvingUrl(false);
    }
  };

  // Get current device GPS location
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('خاصية تحديد الموقع الجغرافي (GPS) غير مدعومة في متصفحك.');
      return;
    }

    setIsLocatingUser(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocatingUser(false);
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        setLocation(userLat, userLng, 17);
      },
      (error) => {
        setIsLocatingUser(false);
        alert('تعذر الوصول لموقعك الحالي: ' + error.message);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Copy coordinates
  const handleCopyCoords = () => {
    navigator.clipboard.writeText(`${currentLat}, ${currentLng}`);
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2000);
  };

  return (
    <div className="bg-[#FAF7F1] p-4 sm:p-5 rounded-3xl border border-[#E4DDD0] space-y-4 text-xs sm:text-sm">
      
      {/* Header & Description */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E4DDD0] pb-3">
        <div>
          <h3 className="font-bold text-[#1B1712] text-sm sm:text-base flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#C9A15E]" />
            <span>{title}</span>
          </h3>
          <p className="text-xs text-[#6B6255] mt-0.5">{subtitle}</p>
        </div>

        {/* GPS & External Link buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleGetCurrentLocation}
            disabled={isLocatingUser}
            className="flex items-center gap-1.5 bg-white hover:bg-[#FAF3E5] text-[#1B1712] border border-[#E4DDD0] px-3 py-1.5 rounded-xl font-semibold text-xs transition-colors cursor-pointer"
            title="تحديد موقعي الحالي بالـ GPS"
          >
            <LocateFixed className={`w-3.5 h-3.5 text-[#C9A15E] ${isLocatingUser ? 'animate-spin' : ''}`} />
            <span>{isLocatingUser ? 'جاري التحديد...' : 'موقعي الحالي'}</span>
          </button>

          <a
            href={`https://www.google.com/maps?q=${currentLat},${currentLng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-white hover:bg-[#FAF3E5] text-[#1B1712] border border-[#E4DDD0] px-3 py-1.5 rounded-xl font-semibold text-xs transition-colors"
            title="معاينة في تطبيق خرائط جوجل"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#C9A15E]" />
            <span>فتح في خرائط جوجل</span>
          </a>
        </div>
      </div>

      {/* Tool 1: Fast Search + Preset Chips */}
      <div className="space-y-2.5">
        {/* Search Input */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-2.5 w-4 h-4 text-[#6B6255]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن اسم حي أو شارع بالعريش (مثال: المساعيد، شارع البحر، مستشفى العريش)..."
              className="w-full bg-white border border-[#E4DDD0] rounded-xl pr-9 pl-3 py-2 text-xs text-[#1B1712] outline-none focus:border-[#C9A15E]"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="bg-[#17140F] hover:bg-[#2A241B] text-[#C9A15E] px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0"
          >
            {isSearching ? 'جاري البحث...' : 'بحث بالخريطة'}
          </button>
        </form>

        {searchError && (
          <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded-xl border border-rose-200">
            {searchError}
          </p>
        )}

        {/* Arish Quick Presets Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-[11px] font-bold text-[#6B6255] shrink-0">أماكن سريعة:</span>
          {ARISH_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setLocation(preset.lat, preset.lng, 16)}
              className="shrink-0 bg-white hover:bg-[#FAF3E5] hover:border-[#C9A15E] border border-[#E4DDD0] px-2.5 py-1 rounded-xl text-[11px] font-semibold text-[#1B1712] flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
            >
              <span>{preset.icon}</span>
              <span>{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tool 2: Paste Google Maps Link or Coordinates */}
      <div className="bg-white p-3 rounded-2xl border border-[#E4DDD0] space-y-2">
        <label className="block text-xs font-bold text-[#1B1712] flex items-center gap-1.5">
          <Link2 className="w-3.5 h-3.5 text-[#C9A15E]" />
          <span>أو ألصق رابط مشاركة من تطبيق خرائط جوجل (Google Maps Link):</span>
        </label>
        <form onSubmit={handleExtractFromUrl} className="flex gap-2">
          <input
            type="text"
            value={googleMapsUrl}
            onChange={(e) => setGoogleMapsUrl(e.target.value)}
            placeholder="ضع رابط خرائط جوجل (مثال: https://maps.app.goo.gl/... أو 31.1325, 33.7845)"
            className="flex-1 bg-[#FAF7F1] border border-[#E4DDD0] rounded-xl px-3 py-1.5 text-xs text-[#1B1712] outline-none font-mono focus:border-[#C9A15E]"
          />
          <button
            type="submit"
            disabled={isResolvingUrl || !googleMapsUrl.trim()}
            className="bg-[#C9A15E] hover:bg-[#A67C3D] text-[#17140F] hover:text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 disabled:opacity-50"
          >
            {isResolvingUrl ? 'جاري الفك...' : 'استخراج الموقع'}
          </button>
        </form>

        {urlMessage && (
          <p
            className={`text-xs p-2 rounded-xl border ${
              urlMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}
          >
            {urlMessage.text}
          </p>
        )}
      </div>

      {/* Interactive Leaflet Map Container */}
      <div className="relative rounded-2xl overflow-hidden border border-[#E4DDD0] shadow-sm">
        
        {/* Layer Switcher Pills (Top Left) */}
        <div className="absolute top-3 left-3 z-[1000] bg-white/95 backdrop-blur-xs p-1 rounded-xl shadow-md border border-[#E4DDD0] flex items-center gap-1 text-[11px] font-bold">
          <button
            type="button"
            onClick={() => switchTileLayer('google-streets')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
              mapType === 'google-streets'
                ? 'bg-[#17140F] text-[#C9A15E] shadow-2xs'
                : 'text-[#6B6255] hover:text-[#1B1712]'
            }`}
          >
            <span>🗺️ شوارع جوجل</span>
          </button>

          <button
            type="button"
            onClick={() => switchTileLayer('google-satellite')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
              mapType === 'google-satellite'
                ? 'bg-[#17140F] text-[#C9A15E] shadow-2xs'
                : 'text-[#6B6255] hover:text-[#1B1712]'
            }`}
          >
            <span>🛰️ قمر صناعي هجين</span>
          </button>

          <button
            type="button"
            onClick={() => switchTileLayer('osm')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
              mapType === 'osm'
                ? 'bg-[#17140F] text-[#C9A15E] shadow-2xs'
                : 'text-[#6B6255] hover:text-[#1B1712]'
            }`}
          >
            <span>🌐 قياسي (OSM)</span>
          </button>
        </div>

        {/* Interactive Instruction Pill (Top Right) */}
        <div className="absolute top-3 right-3 z-[1000] bg-black/75 backdrop-blur-xs text-white px-3 py-1 rounded-xl text-[11px] font-semibold flex items-center gap-1.5 pointer-events-none">
          <span>👆 انقر أو اسحب العلامة لتحديد المكان</span>
        </div>

        {/* Map Canvas */}
        <div
          ref={mapContainerRef}
          className="w-full h-80 sm:h-96 bg-[#FAF7F1]"
        />

        {/* Live Coordinates Pill (Bottom Right) */}
        <div className="absolute bottom-3 right-3 z-[1000] bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-xl shadow-md border border-[#E4DDD0] flex items-center gap-2 text-xs font-mono">
          <span className="text-[#A67C3D] font-bold">📍 الإحداثيات:</span>
          <span className="text-[#1B1712] font-semibold" dir="ltr">
            {currentLat.toFixed(5)}, {currentLng.toFixed(5)}
          </span>
          <button
            type="button"
            onClick={handleCopyCoords}
            className="text-[#6B6255] hover:text-[#1B1712] p-1 cursor-pointer"
            title="نسخ الإحداثيات"
          >
            {copiedCoords ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Sparkles className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Calculated Distance & University Proximity Box */}
      {showDistanceHint && (
        <div className="bg-[#FAF3E5] border border-[#E8DCBF] p-3 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[#A67C3D] font-bold">
            <Compass className="w-4 h-4 shrink-0" />
            <span>المسافة المباشرة إلى بوابة جامعة سيناء:</span>
          </div>

          <div className="flex items-center gap-3 font-semibold text-[#1B1712]">
            <span className="bg-white px-2.5 py-1 rounded-lg border border-[#E8DCBF]">
              📏 <strong>{distanceKm} كم</strong>
            </span>
            <span className="bg-white px-2.5 py-1 rounded-lg border border-[#E8DCBF] text-[#A67C3D]">
              🚶 <strong>~{walkMinutes} دقيقة مشي</strong> (تم التحديث تلقائياً)
            </span>
            <span className="bg-white px-2.5 py-1 rounded-lg border border-[#E8DCBF]">
              🚗 <strong>~{driveMinutes} دقيقة بالسيارة</strong>
            </span>
          </div>
        </div>
      )}

      {/* Collapsible Manual Input for Advanced Users */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setShowManualInputs(!showManualInputs)}
          className="text-xs text-[#6B6255] hover:text-[#1B1712] font-semibold flex items-center gap-1 cursor-pointer"
        >
          <span>تعديل يدوي بالأرقام (خط العرض وخط الطول)</span>
          {showManualInputs ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showManualInputs && (
          <div className="grid grid-cols-2 gap-3 mt-2 bg-white p-3 rounded-2xl border border-[#E4DDD0] animate-in fade-in">
            <div>
              <label className="block text-[11px] font-bold text-[#1B1712] mb-1">
                خط العرض (Latitude)
              </label>
              <input
                type="number"
                step="any"
                value={currentLat}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (!isNaN(val)) onChange(val, currentLng);
                }}
                className="w-full bg-[#FAF7F1] border border-[#E4DDD0] rounded-xl p-2 text-xs text-[#1B1712] font-mono outline-none focus:border-[#C9A15E]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#1B1712] mb-1">
                خط الطول (Longitude)
              </label>
              <input
                type="number"
                step="any"
                value={currentLng}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (!isNaN(val)) onChange(currentLat, val);
                }}
                className="w-full bg-[#FAF7F1] border border-[#E4DDD0] rounded-xl p-2 text-xs text-[#1B1712] font-mono outline-none focus:border-[#C9A15E]"
              />
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
