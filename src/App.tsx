import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.tsx';
import { NewCitySection } from './components/NewCitySection.tsx';
import { BaladSection } from './components/BaladSection.tsx';
import { ListingDetailModal } from './components/ListingDetailModal.tsx';
import { FavoritesView } from './components/FavoritesView.tsx';
import { CompareView } from './components/CompareView.tsx';
import { CompareFloatingBar } from './components/CompareFloatingBar.tsx';
import { MapModal } from './components/MapModal.tsx';
import { HousingRequestModal } from './components/HousingRequestModal.tsx';
import { AboutModal } from './components/AboutModal.tsx';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import { Footer } from './components/Footer.tsx';
import { Listing, ListingCategory, SiteSettings } from './types.ts';
import { fetchListings, recordListingView, trackVisit, fetchSiteSettings } from './lib/api.ts';
import { DEFAULT_SITE_SETTINGS } from './lib/constants.ts';

export default function App() {
  // Navigation & View States
  const [activeTab, setActiveTab] = useState<ListingCategory>('STUDENT');
  const [currentView, setCurrentView] = useState<'home' | 'favorites' | 'compare' | 'admin'>('home');

  // Modal States
  const [selectedListingId, setSelectedListingId] = useState<number | null>(null);
  const [isMapOpen, setIsMapOpen] = useState<boolean>(false);
  const [isHousingRequestOpen, setIsHousingRequestOpen] = useState<boolean>(false);
  const [isAboutOpen, setIsAboutOpen] = useState<boolean>(false);

  // Site Settings (Dynamic CMS)
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);

  // Data States
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string>('');
  const [totalVisits, setTotalVisits] = useState<number>(1280);

  // LocalStorage state: Favorites
  const [favorites, setFavorites] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('arkan_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // LocalStorage state: Compare (up to 4 listings)
  const [comparedListings, setComparedListings] = useState<Listing[]>(() => {
    try {
      const saved = localStorage.getItem('arkan_compare');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persist Favorites
  useEffect(() => {
    try {
      localStorage.setItem('arkan_favorites', JSON.stringify(favorites));
    } catch (e) {
      console.error(e);
    }
  }, [favorites]);

  // Persist Compare
  useEffect(() => {
    try {
      localStorage.setItem('arkan_compare', JSON.stringify(comparedListings));
    } catch (e) {
      console.error(e);
    }
  }, [comparedListings]);

  // Listen for hidden admin triggers: URL parameter ?admin=true, #admin, /admin or Ctrl+Shift+A
  useEffect(() => {
    const checkAdminTrigger = () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        if (
          urlParams.get('admin') === 'true' ||
          window.location.hash === '#admin' ||
          window.location.pathname === '/admin'
        ) {
          setCurrentView('admin');
        }
      } catch (err) {
        console.error(err);
      }
    };

    checkAdminTrigger();
    window.addEventListener('hashchange', checkAdminTrigger);
    window.addEventListener('popstate', checkAdminTrigger);

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + Shift + A or Cmd + Shift + A
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a' || e.key === 'ش')) {
        e.preventDefault();
        setCurrentView((prev) => (prev === 'admin' ? 'home' : 'admin'));
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('hashchange', checkAdminTrigger);
      window.removeEventListener('popstate', checkAdminTrigger);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Fetch listings, site settings, and track visits on mount
  useEffect(() => {
    loadListings();
    loadSiteSettings();
    trackVisit().then((res) => {
      if (res?.count) setTotalVisits(res.count);
    }).catch(() => {});
  }, []);

  const loadSiteSettings = async () => {
    try {
      const settings = await fetchSiteSettings();
      if (settings && Object.keys(settings).length > 0) {
        setSiteSettings(settings);
      }
    } catch (err) {
      console.error('Error fetching site settings:', err);
    }
  };

  const loadListings = async () => {
    try {
      setIsLoading(true);
      setFetchError('');
      const data = await fetchListings();
      setListings(data);
    } catch (err: any) {
      console.error('Error fetching listings:', err);
      setFetchError('تعذر تحميل العقارات في الوقت الحالي. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle Favorite
  const handleToggleFavorite = (id: number) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Toggle Compare (max 4)
  const handleToggleCompare = (listing: Listing) => {
    setComparedListings((prev) => {
      const exists = prev.some((l) => l.id === listing.id);
      if (exists) {
        return prev.filter((l) => l.id !== listing.id);
      }
      if (prev.length >= 4) {
        alert('يمكنك مقارنة 4 شقق كحد أقصى في المرة الواحدة.');
        return prev;
      }
      return [...prev, listing];
    });
  };

  // Remove from compare
  const handleRemoveFromCompare = (id: number) => {
    setComparedListings((prev) => prev.filter((l) => l.id !== id));
  };

  // Clear all compare
  const handleClearCompare = () => {
    setComparedListings([]);
  };

  // Clear all favorites
  const handleClearFavorites = () => {
    setFavorites([]);
  };

  // Select Listing & increment views
  const handleSelectListing = (id: number) => {
    setSelectedListingId(id);
    recordListingView(id)
      .then((res) => {
        if (res?.views) {
          setListings((prev) =>
            prev.map((l) => (l.id === id ? { ...l, views: res.views } : l))
          );
        }
      })
      .catch(() => {});
  };

  const selectedListing = listings.find((l) => l.id === selectedListingId) || null;
  const comparedIds = comparedListings.map((l) => l.id);

  return (
    <div className="min-h-screen bg-[#FAF7F1] text-[#1B1712] font-sans flex flex-col selection:bg-[#C9A15E] selection:text-[#17140F]">
      
      {/* 1. Header Navigation Bar */}
      <Header
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setCurrentView('home');
        }}
        favoritesCount={favorites.length}
        compareCount={comparedListings.length}
        totalVisits={totalVisits}
        onOpenFavorites={() => setCurrentView('favorites')}
        onOpenCompare={() => setCurrentView('compare')}
        onOpenMap={() => setIsMapOpen(true)}
        onOpenHousingRequest={() => setIsHousingRequestOpen(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
        onOpenAdmin={() => setCurrentView('admin')}
        siteSettings={siteSettings}
      />

      {/* 2. Main Body View Routing */}
      <div className="flex-1">
        {currentView === 'admin' ? (
          <AdminDashboard
            onBackToSite={() => setCurrentView('home')}
            onListingUpdated={loadListings}
            siteSettings={siteSettings}
            onUpdateSiteSettings={(newSettings) => setSiteSettings(newSettings)}
          />
        ) : currentView === 'favorites' ? (
          <FavoritesView
            listings={listings}
            favorites={favorites}
            comparedIds={comparedIds}
            onToggleFavorite={handleToggleFavorite}
            onToggleCompare={handleToggleCompare}
            onSelectListing={handleSelectListing}
            onClearFavorites={handleClearFavorites}
            onBackToHome={() => setCurrentView('home')}
          />
        ) : currentView === 'compare' ? (
          <CompareView
            comparedListings={comparedListings}
            onRemoveFromCompare={handleRemoveFromCompare}
            onClearCompare={handleClearCompare}
            onSelectListing={handleSelectListing}
            onBackToHome={() => setCurrentView('home')}
          />
        ) : (
          /* Home View: Tabs (New City vs. Balad) */
          <>
            {isLoading ? (
              <div className="py-24 text-center">
                <div className="w-10 h-10 border-4 border-[#C9A15E] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm font-semibold text-[#6B6255]">
                  جارٍ تحميل عقارات أركان...
                </p>
              </div>
            ) : fetchError ? (
              <div className="max-w-md mx-auto my-16 p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center">
                <p className="text-sm text-rose-700 font-bold mb-3">{fetchError}</p>
                <button
                  onClick={loadListings}
                  className="bg-[#17140F] text-[#FAF7F1] px-4 py-2 rounded-xl text-xs font-semibold"
                >
                  إعادة المحاولة
                </button>
              </div>
            ) : activeTab === 'STUDENT' ? (
              <NewCitySection
                listings={listings}
                favorites={favorites}
                comparedIds={comparedIds}
                onToggleFavorite={handleToggleFavorite}
                onToggleCompare={handleToggleCompare}
                onSelectListing={handleSelectListing}
                onOpenMap={() => setIsMapOpen(true)}
                onOpenHousingRequest={() => setIsHousingRequestOpen(true)}
                onOpenAbout={() => setIsAboutOpen(true)}
                siteSettings={siteSettings}
              />
            ) : (
              <BaladSection
                listings={listings}
                favorites={favorites}
                comparedIds={comparedIds}
                onToggleFavorite={handleToggleFavorite}
                onToggleCompare={handleToggleCompare}
                onSelectListing={handleSelectListing}
                onOpenAbout={() => setIsAboutOpen(true)}
                siteSettings={siteSettings}
              />
            )}
          </>
        )}
      </div>

      {/* 3. Floating Compare Bar (Visible when >= 2 items selected and not on compare page) */}
      {currentView !== 'compare' && (
        <CompareFloatingBar
          comparedListings={comparedListings}
          onOpenCompare={() => setCurrentView('compare')}
          onClearCompare={handleClearCompare}
        />
      )}

      {/* 4. Footer */}
      <Footer
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          setCurrentView('home');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenFavorites={() => setCurrentView('favorites')}
        onOpenCompare={() => setCurrentView('compare')}
        onOpenAbout={() => setIsAboutOpen(true)}
        onOpenAdmin={() => setCurrentView('admin')}
        siteSettings={siteSettings}
      />

      {/* 5. Modals */}
      {/* Listing Detail Modal */}
      <ListingDetailModal
        listing={selectedListing}
        isOpen={Boolean(selectedListingId)}
        onClose={() => setSelectedListingId(null)}
        isFavorite={selectedListingId ? favorites.includes(selectedListingId) : false}
        onToggleFavorite={handleToggleFavorite}
      />

      {/* Interactive Leaflet Map Modal */}
      <MapModal
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        listings={listings}
        onSelectListing={handleSelectListing}
        siteSettings={siteSettings}
      />

      {/* Housing Request Form Modal */}
      <HousingRequestModal
        isOpen={isHousingRequestOpen}
        onClose={() => setIsHousingRequestOpen(false)}
      />

      {/* About & Commission Model Modal */}
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
        siteSettings={siteSettings}
      />

    </div>
  );
}
