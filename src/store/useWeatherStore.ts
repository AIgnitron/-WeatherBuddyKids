import { create } from 'zustand';
import { Platform } from 'react-native';
import * as Location from 'expo-location';
import type { City, ForecastData, FriendlyError } from '../types';
import { fetchForecast, geocodeCities, cityIdFromLatLon } from '../api/openMeteo';
import { loadPrefs, savePrefs, loadForecastCache, saveForecastCache, type StoredPrefs } from '../storage/storage';

const DEFAULT_CITY: City = {
  id: cityIdFromLatLon(45.4215, -75.6972),
  name: 'Ottawa',
  admin1: 'Ontario',
  country: 'Canada',
  latitude: 45.4215,
  longitude: -75.6972,
  timezone: 'America/Toronto'
};

type Status = 'idle' | 'loading' | 'ready' | 'cached' | 'error';

export type WeatherState = {
  inited: boolean;
  status: Status;
  kidMode: boolean;
  selectedCity: City;
  favorites: City[];
  forecast?: ForecastData;
  lastError?: FriendlyError;

  searchQuery: string;
  searchResults: City[];
  searchStatus: 'idle' | 'loading' | 'ready' | 'error';

  init: () => Promise<void>;
  refresh: (opts?: { city?: City }) => Promise<void>;
  selectCity: (city: City) => Promise<void>;
  setKidMode: (value: boolean) => Promise<void>;
  addFavorite: (city: City) => Promise<void>;
  removeFavorite: (cityId: string) => Promise<void>;
  useMyLocation: () => Promise<void>;
  setSearchQuery: (q: string) => void;
  runCitySearch: () => Promise<void>;
};

const toFriendlyError = (code: unknown): FriendlyError => {
  const msg = String(code || '');
  if (msg.includes('geo_failed')) {
    return { title: "Oops!", message: "I can’t find that city. Try another!" };
  }
  return { title: "Oops!", message: "Clouds got in the way. Try again!" };
};

async function persistPrefs(prefs: StoredPrefs) {
  try {
    await savePrefs(prefs);
  } catch {
    // ignore
  }
}

export const useWeatherStore = create<WeatherState>((set, get) => ({
  inited: false,
  status: 'idle',
  kidMode: true,
  selectedCity: DEFAULT_CITY,
  favorites: [DEFAULT_CITY],
  forecast: undefined,
  lastError: undefined,

  searchQuery: '',
  searchResults: [],
  searchStatus: 'idle',

  init: async () => {
    if (get().inited) return;

    const stored = await loadPrefs();
    const selectedCity = stored?.selectedCity ?? DEFAULT_CITY;
    const favorites = (stored?.favorites?.length ? stored.favorites : [DEFAULT_CITY]).slice(0, 5);
    const kidMode = typeof stored?.kidMode === 'boolean' ? stored.kidMode : true;

    set({
      selectedCity,
      favorites,
      kidMode,
      inited: true,
      status: 'loading'
    });

    // show cache immediately if it exists
    const cached = await loadForecastCache(selectedCity.id);
    if (cached) {
      set({ forecast: cached, status: 'cached' });
    }

    // then refresh from network
    await get().refresh({ city: selectedCity });
  },

  refresh: async (opts) => {
    const city = opts?.city ?? get().selectedCity;
    set({ status: 'loading', lastError: undefined });

    try {
      const data = await fetchForecast({ city });
      set({ forecast: data, status: 'ready', lastError: undefined });
      await saveForecastCache(city.id, data);

      // keep prefs consistent
      const prefs: StoredPrefs = {
        selectedCity: city,
        favorites: get().favorites,
        kidMode: get().kidMode
      };
      await persistPrefs(prefs);
    } catch (e) {
      const cached = await loadForecastCache(city.id);
      if (cached) {
        set({ forecast: cached, status: 'cached', lastError: toFriendlyError(e) });
      } else {
        set({ status: 'error', lastError: toFriendlyError(e) });
      }
    }
  },

  selectCity: async (city) => {
    set({ selectedCity: city, lastError: undefined });

    const cached = await loadForecastCache(city.id);
    if (cached) set({ forecast: cached, status: 'cached' });

    const prefs: StoredPrefs = {
      selectedCity: city,
      favorites: get().favorites,
      kidMode: get().kidMode
    };
    await persistPrefs(prefs);

    await get().refresh({ city });
  },

  setKidMode: async (value) => {
    set({ kidMode: value });
    const prefs: StoredPrefs = {
      selectedCity: get().selectedCity,
      favorites: get().favorites,
      kidMode: value
    };
    await persistPrefs(prefs);
  },

  addFavorite: async (city) => {
    const cur = get().favorites;
    if (cur.some((c) => c.id === city.id)) return;
    const next = [city, ...cur].slice(0, 5);
    set({ favorites: next });

    const prefs: StoredPrefs = {
      selectedCity: get().selectedCity,
      favorites: next,
      kidMode: get().kidMode
    };
    await persistPrefs(prefs);
  },

  removeFavorite: async (cityId) => {
    const cur = get().favorites;
    const next = cur.filter((c) => c.id !== cityId);
    const safeNext = next.length ? next : [DEFAULT_CITY];
    set({ favorites: safeNext });

    const prefs: StoredPrefs = {
      selectedCity: get().selectedCity,
      favorites: safeNext,
      kidMode: get().kidMode
    };
    await persistPrefs(prefs);
  },

  useMyLocation: async () => {
    // Web: let browser permission flow. If it fails, we fall back.
    if (Platform.OS === 'web') {
      try {
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const city: City = {
          id: cityIdFromLatLon(lat, lon),
          name: 'My Place',
          country: '',
          latitude: lat,
          longitude: lon
        };
        await get().selectCity(city);
        return;
      } catch (e) {
        set({ lastError: { title: 'Oops!', message: 'No location. Showing Ottawa!' } });
        await get().selectCity(DEFAULT_CITY);
        return;
      }
    }

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        set({ lastError: { title: 'Oops!', message: 'No location. Showing Ottawa!' } });
        await get().selectCity(DEFAULT_CITY);
        return;
      }

      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;

      // reverse geocode to get a friendly name
      let name = 'My Place';
      let admin1: string | undefined;
      let country = '';
      try {
        const rev = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
        const first = rev?.[0];
        if (first) {
          name = first.city || first.subregion || first.region || name;
          admin1 = first.region || undefined;
          country = first.country || '';
        }
      } catch {
        // ignore
      }

      const city: City = {
        id: cityIdFromLatLon(lat, lon),
        name,
        admin1,
        country,
        latitude: lat,
        longitude: lon
      };

      await get().addFavorite(city);
      await get().selectCity(city);
    } catch (e) {
      set({ lastError: { title: 'Oops!', message: 'No location. Showing Ottawa!' } });
      await get().selectCity(DEFAULT_CITY);
    }
  },

  setSearchQuery: (q) => {
    set({ searchQuery: q });
  },

  runCitySearch: async () => {
    const q = get().searchQuery;
    if (!q.trim()) {
      set({ searchResults: [], searchStatus: 'idle' });
      return;
    }
    set({ searchStatus: 'loading' });
    try {
      const results = await geocodeCities(q, 10);
      set({ searchResults: results, searchStatus: 'ready' });
    } catch (e) {
      set({ searchStatus: 'error', searchResults: [] });
    }
  }
}));
