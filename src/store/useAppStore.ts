import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  City, FavoriteCity,
  TemperatureUnit, WindUnit, PressureUnit, Theme, MapStyle,
} from '../types/weather';

export type Page = 'dashboard' | 'forecast' | 'map' | 'alerts' | 'compare' | 'settings';

interface AppState {
  selectedCity:  City | null;
  unit:          TemperatureUnit;
  windUnit:      WindUnit;
  pressureUnit:  PressureUnit;
  theme:         Theme;
  mapStyle:      MapStyle;
  favorites:     FavoriteCity[];
  recentSearches: City[];
  currentPage:   Page;
  // dashboard display toggles
  showHumidity:  boolean;
  showWind:      boolean;
  showUV:        boolean;
  showPressure:  boolean;
  showDewPoint:  boolean;
  autoRefresh:   boolean;
  notificationsEnabled: boolean;

  setSelectedCity:  (city: City | null) => void;
  setUnit:          (u: TemperatureUnit)  => void;
  setWindUnit:      (u: WindUnit)         => void;
  setPressureUnit:  (u: PressureUnit)     => void;
  setTheme:         (t: Theme)            => void;
  setMapStyle:      (s: MapStyle)         => void;
  setPage:          (p: Page)             => void;
  setSetting:       (key: string, val: boolean) => void;
  toggleFavorite:   (city: City) => void;
  isFavorite:       (city: City) => boolean;
  addRecentSearch:  (city: City) => void;
  clearRecent:      () => void;
  clearAll:         () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      selectedCity:  null,
      unit:          'celsius',
      windUnit:      'kmh',
      pressureUnit:  'hpa',
      theme:         'dark',
      mapStyle:      'satellite',
      favorites:     [],
      recentSearches: [],
      currentPage:   'dashboard',
      showHumidity:  true,
      showWind:      true,
      showUV:        true,
      showPressure:  true,
      showDewPoint:  true,
      autoRefresh:   true,
      notificationsEnabled: true,

      setSelectedCity: (city) => {
        set({ selectedCity: city });
        if (city) get().addRecentSearch(city);
      },
      setUnit:         (unit)         => set({ unit }),
      setWindUnit:     (windUnit)     => set({ windUnit }),
      setPressureUnit: (pressureUnit) => set({ pressureUnit }),
      setTheme:        (theme)        => set({ theme }),
      setMapStyle:     (mapStyle)     => set({ mapStyle }),
      setPage:         (currentPage)  => set({ currentPage }),
      setSetting:      (key, val)     => set({ [key]: val } as any),

      toggleFavorite: (city) => {
        const favs  = get().favorites;
        const exists = favs.find(f => f.lat === city.lat && f.lon === city.lon);
        if (exists) {
          set({ favorites: favs.filter(f => f.id !== exists.id) });
        } else {
          set({ favorites: [...favs, { ...city, id: `${city.lat}-${city.lon}`, addedAt: Date.now() }] });
        }
      },
      isFavorite:     (city) => get().favorites.some(f => f.lat === city.lat && f.lon === city.lon),
      addRecentSearch: (city) => {
        const recent = get().recentSearches.filter(r => !(r.lat === city.lat && r.lon === city.lon));
        set({ recentSearches: [city, ...recent].slice(0, 8) });
      },
      clearRecent: () => set({ recentSearches: [] }),
      clearAll: () => {
        localStorage.removeItem('skypulse-storage');
        set({
          selectedCity: null, favorites: [], recentSearches: [],
          unit: 'celsius', windUnit: 'kmh', pressureUnit: 'hpa',
          theme: 'dark', currentPage: 'dashboard',
        });
      },
    }),
    {
      name: 'skypulse-storage',
      partialize: (s) => ({
        unit: s.unit, windUnit: s.windUnit, pressureUnit: s.pressureUnit,
        theme: s.theme, mapStyle: s.mapStyle,
        favorites: s.favorites, recentSearches: s.recentSearches,
        showHumidity: s.showHumidity, showWind: s.showWind,
        showUV: s.showUV, showPressure: s.showPressure, showDewPoint: s.showDewPoint,
        autoRefresh: s.autoRefresh, notificationsEnabled: s.notificationsEnabled,
      }),
    }
  )
);
