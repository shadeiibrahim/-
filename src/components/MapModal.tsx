import React, { useEffect, useRef, useState } from 'react';
import { X, MapPin, ExternalLink, Navigation } from 'lucide-react';
import L from 'leaflet';
import { Listing, SiteSettings } from '../types.ts';
import { SINAI_UNIVERSITY_COORDS } from '../lib/haversine.ts';

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  listings: Listing[];
  onSelectListing: (id: number) => void;
  siteSettings?: SiteSettings;
}

type MapLayerType = 'google-streets' | 'google-satellite' | 'osm';

export const MapModal: React.FC<MapModalProps> = ({
  isOpen,
  onClose,
  listings,
  onSelectListing,
  siteSettings,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const [activeLayer, setActiveLayer] = useState<MapLayerType>('google-streets');

  const getTileUrl = (type: MapLayerType) => {
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

  const getTileAttribution = (type: MapLayerType) => {
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

  const switchLayer = (type: MapLayerType) => {
    setActiveLayer(type);
    if (!mapInstanceRef.current) return;

    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }

    const newLayer = L.tileLayer(getTileUrl(type), {
      maxZoom: 20,
      attribution: getTileAttribution(type),
    }).addTo(mapInstanceRef.current);

    tileLayerRef.current = newLayer;
  };

  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    // Center & Zoom from siteSettings or fallback
    const centerLat = siteSettings?.mapCenterLat ?? SINAI_UNIVERSITY_COORDS.lat;
    const centerLng = siteSettings?.mapCenterLng ?? SINAI_UNIVERSITY_COORDS.lng;
    const zoomLevel = siteSettings?.mapDefaultZoom ?? 15;

    // Small delay to ensure modal DOM is painted
    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Initialize map centered at customized coordinates
      const map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLng],
        zoom: zoomLevel,
        zoomControl: true,
      });

      // Add Tile Layer
      const initialLayer = L.tileLayer(getTileUrl(activeLayer), {
        maxZoom: 20,
        attribution: getTileAttribution(activeLayer),
      }).addTo(map);

      tileLayerRef.current = initialLayer;

      // 1. Dynamic Landmarks from Admin Site Settings
      const landmarks = siteSettings?.mapLandmarks && siteSettings.mapLandmarks.length > 0
        ? siteSettings.mapLandmarks
        : [
            {
              id: 'uni_gate_default',
              name: 'بوابة جامعة سيناء الرئيسية',
              category: 'جامعة',
              lat: SINAI_UNIVERSITY_COORDS.lat,
              lng: SINAI_UNIVERSITY_COORDS.lng,
              icon: '🎓',
              description: 'نقطة قياس مسافات السكن الطلابي',
            },
          ];

      landmarks.forEach((landmark) => {
        const landmarkIcon = L.divIcon({
          className: 'custom-landmark-marker',
          html: `
            <div style="background-color: #17140F; border: 2px solid #C9A15E; color: #C9A15E; width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; box-shadow: 0 4px 12px rgba(0,0,0,0.35);">
              ${landmark.icon || '📍'}
            </div>
          `,
          iconSize: [38, 38],
          iconAnchor: [19, 19],
        });

        const landmarkMarker = L.marker([landmark.lat, landmark.lng], { icon: landmarkIcon }).addTo(map);
        landmarkMarker.bindPopup(`
          <div style="direction: rtl; text-align: right; font-family: 'IBM Plex Sans Arabic', sans-serif; padding: 6px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
              <strong style="color: #17140F; font-size: 14px;">${landmark.name}</strong>
              <span style="background-color: #FAF3E5; color: #A67C3D; padding: 2px 6px; border-radius: 6px; font-size: 10px; font-weight: bold;">${landmark.category}</span>
            </div>
            <p style="color: #6B6255; font-size: 12px; margin: 0 0 6px 0; line-height: 1.4;">${landmark.description || ''}</p>
            <a href="https://www.google.com/maps/dir/?api=1&destination=${landmark.lat},${landmark.lng}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 4px; color: #A67C3D; font-size: 11px; font-weight: bold; text-decoration: none;">
              <span>فتح الاتجاهات في خرائط جوجل ↗</span>
            </a>
          </div>
        `);
      });

      // 2. Listing Markers (📍)
      const validListings = listings.filter((l) => l.lat && l.lng);

      validListings.forEach((listing) => {
        const isStudent = listing.category === 'STUDENT';
        const priceText = `${(listing.price ?? 0).toLocaleString('ar-EG')} ج`;

        const listingIcon = L.divIcon({
          className: 'custom-listing-marker',
          html: `
            <div style="background-color: #FAF7F1; border: 2px solid ${isStudent ? '#C9A15E' : '#17140F'}; color: #1B1712; padding: 4px 8px; border-radius: 12px; font-weight: bold; font-size: 11px; white-space: nowrap; box-shadow: 0 3px 8px rgba(0,0,0,0.25); display: flex; align-items: center; gap: 4px; font-family: 'IBM Plex Sans Arabic', sans-serif;">
              <span>📍</span>
              <span>${priceText}</span>
            </div>
          `,
          iconSize: [80, 30],
          iconAnchor: [40, 15],
        });

        const marker = L.marker([listing.lat!, listing.lng!], { icon: listingIcon }).addTo(map);

        // Interactive Popup
        const popupContent = document.createElement('div');
        popupContent.dir = 'rtl';
        popupContent.style.fontFamily = "'IBM Plex Sans Arabic', sans-serif";
        popupContent.style.textAlign = 'right';
        popupContent.style.padding = '4px';

        popupContent.innerHTML = `
          <div style="width: 230px;">
            <div style="height: 100px; border-radius: 8px; overflow: hidden; margin-bottom: 6px; background: #17140F;">
              <img src="${listing.images?.[0] || ''}" style="width: 100%; height: 100%; object-fit: cover;" />
            </div>
            <strong style="color: #1B1712; font-size: 13px; display: block; margin-bottom: 4px; line-height: 1.3;">
              ${listing.title}
            </strong>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="color: #A67C3D; font-weight: bold; font-size: 13px;">${(listing.price ?? 0).toLocaleString('ar-EG')} ج.م</span>
              <span style="color: #6B6255; font-size: 11px;">⏱️ ${listing.distanceMin} دقيقة</span>
            </div>
            <div style="display: flex; flex-direction: column; gap: 6px;">
              <button id="view-listing-${listing.id}" style="width: 100%; background-color: #17140F; color: #FAF7F1; border: none; padding: 7px 10px; border-radius: 8px; font-size: 12px; font-weight: bold; cursor: pointer;">
                عرض التفاصيل الكاملة
              </button>
              <a href="https://www.google.com/maps/dir/?api=1&destination=${listing.lat},${listing.lng}" target="_blank" rel="noopener noreferrer" style="display: flex; align-items: center; justify-content: center; gap: 4px; width: 100%; background-color: #FAF3E5; color: #17140F; border: 1px solid #E4DDD0; padding: 5px 10px; border-radius: 8px; font-size: 11px; font-weight: bold; text-decoration: none; cursor: pointer;">
                <span>📍 الاتجاهات في خرائط جوجل</span>
              </a>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);

        marker.on('popupopen', () => {
          const btn = document.getElementById(`view-listing-${listing.id}`);
          if (btn) {
            btn.onclick = () => {
              onClose();
              onSelectListing(listing.id);
            };
          }
        });
      });

      mapInstanceRef.current = map;
    }, 150);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen, listings, siteSettings]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-6 animate-in fade-in">
      <div className="relative w-full max-w-5xl h-[88vh] bg-white rounded-3xl shadow-2xl border border-[#E4DDD0] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-white px-5 py-3.5 border-b border-[#E4DDD0] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FAF3E5] flex items-center justify-center text-[#A67C3D]">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1B1712]">
                الخريطة التفاعلية لعقارات أركان
              </h2>
              <span className="text-xs text-[#6B6255]">
                اضغط على أي ماركر لعرض السعر وصورة العقار ومسافته عن الجامعة أو فتح الاتجاهات
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-3 text-xs bg-[#FAF7F1] px-3 py-1.5 rounded-xl border border-[#E4DDD0]">
              <span className="flex items-center gap-1">
                <span>🎓</span>
                <span className="font-semibold text-[#1B1712]">معالم الخريطة ({siteSettings?.mapLandmarks?.length ?? 1})</span>
              </span>
              <span className="text-[#E4DDD0]">|</span>
              <span className="flex items-center gap-1">
                <span>📍</span>
                <span className="font-semibold text-[#1B1712]">العقارات المتاحة ({listings.filter((l) => l.lat && l.lng).length})</span>
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#6B6255] hover:text-[#1B1712] hover:bg-[#FAF7F1] border border-[#E4DDD0] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Map Container with Layer Switcher */}
        <div className="flex-1 w-full h-full relative">
          
          {/* Layer switcher */}
          <div className="absolute top-3 left-3 z-[1000] bg-white/95 backdrop-blur-xs p-1 rounded-xl shadow-md border border-[#E4DDD0] flex items-center gap-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => switchLayer('google-streets')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeLayer === 'google-streets'
                  ? 'bg-[#17140F] text-[#C9A15E] shadow-2xs'
                  : 'text-[#6B6255] hover:text-[#1B1712]'
              }`}
            >
              🗺️ شوارع جوجل
            </button>
            <button
              type="button"
              onClick={() => switchLayer('google-satellite')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeLayer === 'google-satellite'
                  ? 'bg-[#17140F] text-[#C9A15E] shadow-2xs'
                  : 'text-[#6B6255] hover:text-[#1B1712]'
              }`}
            >
              🛰️ أقمار صناعية هجين
            </button>
            <button
              type="button"
              onClick={() => switchLayer('osm')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeLayer === 'osm'
                  ? 'bg-[#17140F] text-[#C9A15E] shadow-2xs'
                  : 'text-[#6B6255] hover:text-[#1B1712]'
              }`}
            >
              🌐 قياسي
            </button>
          </div>

          <div ref={mapContainerRef} className="w-full h-full" />
        </div>

        {/* Footer info bar */}
        <div className="bg-[#FAF7F1] px-5 py-2.5 border-t border-[#E4DDD0] text-xs text-[#6B6255] flex items-center justify-between">
          <span>خريطة تفاعلية مع إمكانية التبديل بين شوارع وأقمار صناعية جوجل والتوجيه المباشر</span>
          <span className="font-medium text-[#1B1712]">{siteSettings?.siteName || 'أركان للتسويق العقاري'} • {siteSettings?.commissionBadge || '0% عمولة'}</span>
        </div>

      </div>
    </div>
  );
};
