import { create } from 'zustand';
import { Platform } from 'react-native';
import * as Location from 'expo-location';
import type { City, ForecastData, FriendlyError, WeatherThemeKey, TemperatureUnit } from '../types';
import { fetchForecast, geocodeCities, cityIdFromLatLon } from '../api/openMeteo';
import {
  loadPrefs,
  savePrefs,
  loadForecastCache,
  saveForecastCache,
  type StoredPrefs,
  type AlertRule
} from '../storage/storage';
import { evaluateAlerts, getDefaultAlertRules } from '../alerts/alertEngine';
import {
  ensureNotificationsReady,
  fireLocalNotification,
  requestNotificationPermission,
  scheduleDailyReminder,
  cancelScheduledNotification
} from '../notifications/notifications';
import { cityKey, cityExistsIn, findCityByKey } from '../utils/cityKey';

export type ToastMessage = {
  id: number;
  text: string;
  emoji?: string;
};

const TOAST_DURATION = 1500;

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
  themeChoice: 'auto' | WeatherThemeKey;
  temperatureUnit: TemperatureUnit;

  notificationsEnabled: boolean;
  notificationSound: boolean;
  alertRules: AlertRule[];
  lastAlertFiredAtById: Record<string, number>;
  
  // Daily reminder
  dailyReminderEnabled: boolean;
  dailyReminderHour: number;
  dailyReminderMinute: number;
  dailyReminderId: string | null;
  
  selectedCity: City;
  favorites: City[];
  forecast?: ForecastData;
  lastError?: FriendlyError;

  searchQuery: string;
  searchResults: City[];
  searchStatus: 'idle' | 'loading' | 'ready' | 'error';

  // Toast/snackbar for UI feedback
  toasts: ToastMessage[];
  showToast: (text: string, emoji?: string) => void;
  dismissToast: (id: number) => void;

  init: () => Promise<void>;
  refresh: (opts?: { city?: City }) => Promise<void>;
  selectCity: (city: City) => Promise<void>;
  setKidMode: (value: boolean) => Promise<void>;
  setThemeChoice: (value: 'auto' | WeatherThemeKey) => Promise<void>;
  setTemperatureUnit: (value: TemperatureUnit) => Promise<void>;
  setNotificationsEnabled: (value: boolean) => Promise<void>;
  setNotificationSound: (value: boolean) => Promise<void>;
  setAlertRule: (id: AlertRule['id'], patch: Partial<AlertRule>) => Promise<void>;
  setDailyReminder: (enabled: boolean, hour?: number, minute?: number) => Promise<{ success: boolean; permissionDenied?: boolean }>;
  addFavorite: (city: City) => Promise<{ added: boolean; wasDuplicate: boolean }>;
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

function buildPrefsFromState(state: Pick<
  WeatherState,
  | 'selectedCity'
  | 'favorites'
  | 'kidMode'
  | 'themeChoice'
  | 'temperatureUnit'
  | 'notificationsEnabled'
  | 'notificationSound'
  | 'alertRules'
  | 'lastAlertFiredAtById'
  | 'dailyReminderEnabled'
  | 'dailyReminderHour'
  | 'dailyReminderMinute'
  | 'dailyReminderId'
>): StoredPrefs {
  return {
    selectedCity: state.selectedCity,
    favorites: state.favorites,
    kidMode: state.kidMode,
    themeChoice: state.themeChoice,
    temperatureUnit: state.temperatureUnit,
    notificationsEnabled: state.notificationsEnabled,
    notificationSound: state.notificationSound,
    alertRules: state.alertRules,
    lastAlertFiredAtById: state.lastAlertFiredAtById,
    dailyReminderEnabled: state.dailyReminderEnabled,
    dailyReminderHour: state.dailyReminderHour,
    dailyReminderMinute: state.dailyReminderMinute,
    dailyReminderId: state.dailyReminderId
  };
}

function safeRules(input?: AlertRule[] | null): AlertRule[] {
  const base = getDefaultAlertRules();
  if (!input?.length) return base;
  const byId = new Map(input.map((r) => [r.id, r]));
  return base.map((r) => ({ ...r, ...(byId.get(r.id) ?? {}) }));
}

function shouldFire(lastFiredAt: number | undefined, now: number): boolean {
  if (!lastFiredAt) return true;
  // at most once every 6 hours per alert key (kid-safe, avoids spam)
  return now - lastFiredAt > 6 * 60 * 60 * 1000;
}

/**
 * Generate a composite key for deduplicating alerts: cityId|date|alertId
 * This ensures alerts fire at most once per day per city per alert type.
 */
function makeAlertKey(cityId: string, alertId: string): string {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  return `${cityId}|${today}|${alertId}`;
}

export const useWeatherStore = create<WeatherState>((set, get) => ({
  inited: false,
  status: 'idle',
  kidMode: true,
  themeChoice: 'auto',
  temperatureUnit: 'C',
  notificationsEnabled: true,
  notificationSound: true,
  alertRules: getDefaultAlertRules(),
  lastAlertFiredAtById: {},
  dailyReminderEnabled: false,
  dailyReminderHour: 7,
  dailyReminderMinute: 30,
  dailyReminderId: null,
  selectedCity: DEFAULT_CITY,
  favorites: [DEFAULT_CITY],
  forecast: undefined,
  lastError: undefined,

  searchQuery: '',
  searchResults: [],
  searchStatus: 'idle',

  toasts: [],

  showToast: (text, emoji) => {
    const id = Date.now();
    set((s) => ({ toasts: [...s.toasts, { id, text, emoji }] }));
    setTimeout(() => {
      get().dismissToast(id);
    }, TOAST_DURATION);
  },

  dismissToast: (id) => {
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
  },

  init: async () => {
    if (get().inited) return;

    const stored = await loadPrefs();
    const selectedCity = stored?.selectedCity ?? DEFAULT_CITY;
    
    // Dedupe favorites on load to handle any legacy duplicates
    const rawFavorites = stored?.favorites?.length ? stored.favorites : [DEFAULT_CITY];
    const seenKeys = new Set<string>();
    const favorites = rawFavorites.filter((c) => {
      const key = cityKey(c);
      if (seenKeys.has(key)) return false;
      seenKeys.add(key);
      return true;
    }).slice(0, 5);
    
    const kidMode = typeof stored?.kidMode === 'boolean' ? stored.kidMode : true;
    const themeChoice: 'auto' | WeatherThemeKey = stored?.themeChoice ?? 'auto';
    const temperatureUnit: TemperatureUnit = stored?.temperatureUnit ?? 'C';
    const notificationsEnabled = typeof stored?.notificationsEnabled === 'boolean' ? stored.notificationsEnabled : true;
    const notificationSound = typeof stored?.notificationSound === 'boolean' ? stored.notificationSound : true;
    const alertRules = safeRules(stored?.alertRules);
    const lastAlertFiredAtById = stored?.lastAlertFiredAtById ?? {};
    
    // Daily reminder state
    const dailyReminderEnabled = typeof stored?.dailyReminderEnabled === 'boolean' ? stored.dailyReminderEnabled : false;
    const dailyReminderHour = typeof stored?.dailyReminderHour === 'number' ? stored.dailyReminderHour : 7;
    const dailyReminderMinute = typeof stored?.dailyReminderMinute === 'number' ? stored.dailyReminderMinute : 30;
    const dailyReminderId = stored?.dailyReminderId ?? null;

    set({
      selectedCity,
      favorites,
      kidMode,
      themeChoice,
      temperatureUnit,
      notificationsEnabled,
      notificationSound,
      alertRules,
      lastAlertFiredAtById,
      dailyReminderEnabled,
      dailyReminderHour,
      dailyReminderMinute,
      dailyReminderId,
      inited: true,
      status: 'loading'
    });

    // Sync sound setting with sounds utility
    const { setSoundEnabled } = await import('../utils/sounds');
    await setSoundEnabled(notificationSound);

    if (notificationsEnabled) {
      await ensureNotificationsReady();
    }

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

      // alerts + notifications (best-effort; only while app is open)
      if (get().notificationsEnabled) {
        try {
          const now = Date.now();
          const hits = evaluateAlerts(data, get().alertRules);
          for (const hit of hits) {
            // Use composite key: cityId|date|alertId to limit to once per day per city
            const alertKey = makeAlertKey(city.id, hit.id);
            const last = get().lastAlertFiredAtById[alertKey];
            if (!shouldFire(last, now)) continue;
            
            await fireLocalNotification({
              title: hit.title,
              body: hit.body,
              soundEnabled: get().notificationSound
            });
            
            // Also show in-app toast for immediate feedback
            get().showToast(hit.body, hit.title.split(' ')[0]);
            
            set((s) => ({
              lastAlertFiredAtById: { ...s.lastAlertFiredAtById, [alertKey]: now }
            }));
            
            // Persist updated alert history
            await persistPrefs(buildPrefsFromState({
              ...get(),
              lastAlertFiredAtById: { ...get().lastAlertFiredAtById, [alertKey]: now }
            }));
          }
        } catch {
          // ignore notification errors
        }
      }

      // keep prefs consistent
      await persistPrefs(buildPrefsFromState({ ...get(), selectedCity: city }));
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

    await persistPrefs(buildPrefsFromState({ ...get(), selectedCity: city }));

    await get().refresh({ city });
  },

  setKidMode: async (value) => {
    set({ kidMode: value });
    await persistPrefs(buildPrefsFromState({ ...get(), kidMode: value }));
  },

  setThemeChoice: async (value) => {
    set({ themeChoice: value });
    await persistPrefs(buildPrefsFromState({ ...get(), themeChoice: value }));
  },

  setTemperatureUnit: async (value) => {
    set({ temperatureUnit: value });
    await persistPrefs(buildPrefsFromState({ ...get(), temperatureUnit: value }));
  },

  setNotificationsEnabled: async (value) => {
    set({ notificationsEnabled: value });
    if (value) {
      try {
        await ensureNotificationsReady();
      } catch {
        // ignore
      }
    }
    await persistPrefs(buildPrefsFromState({ ...get(), notificationsEnabled: value }));
  },

  setNotificationSound: async (value) => {
    set({ notificationSound: value });
    // Sync with sounds utility - stops all sounds if disabling
    const { setSoundEnabled } = await import('../utils/sounds');
    await setSoundEnabled(value);
    await persistPrefs(buildPrefsFromState({ ...get(), notificationSound: value }));
  },

  setAlertRule: async (id, patch) => {
    const next = get().alertRules.map((r) => (r.id === id ? { ...r, ...patch } : r));
    set({ alertRules: next });
    await persistPrefs(buildPrefsFromState({ ...get(), alertRules: next }));
  },

  setDailyReminder: async (enabled, hour, minute) => {
    console.log('[DailyReminder] setDailyReminder called, enabled:', enabled);
    const state = get();
    const newHour = hour ?? state.dailyReminderHour;
    const newMinute = minute ?? state.dailyReminderMinute;
    
    // Cancel existing reminder if any
    if (state.dailyReminderId) {
      console.log('[DailyReminder] Cancelling existing reminder:', state.dailyReminderId);
      await cancelScheduledNotification(state.dailyReminderId);
    }
    
    if (!enabled) {
      // Turning off - just clear the state
      console.log('[DailyReminder] Turning OFF');
      set({
        dailyReminderEnabled: false,
        dailyReminderId: null,
        dailyReminderHour: newHour,
        dailyReminderMinute: newMinute
      });
      await persistPrefs(buildPrefsFromState({
        ...get(),
        dailyReminderEnabled: false,
        dailyReminderId: null,
        dailyReminderHour: newHour,
        dailyReminderMinute: newMinute
      }));
      get().showToast('Reminder cancelled');
      return { success: true };
    }
    
    // Turning on - request permission first
    console.log('[DailyReminder] Turning ON - requesting permission');
    const permissionStatus = await requestNotificationPermission();
    console.log('[DailyReminder] Permission status:', permissionStatus);
    
    if (permissionStatus !== 'granted') {
      // Permission denied
      get().showToast('Notifications are off in settings');
      set({
        dailyReminderEnabled: false,
        dailyReminderId: null
      });
      await persistPrefs(buildPrefsFromState({
        ...get(),
        dailyReminderEnabled: false,
        dailyReminderId: null
      }));
      return { success: false, permissionDenied: true };
    }
    
    // Schedule the daily reminder
    const newId = await scheduleDailyReminder({
      hour: newHour,
      minute: newMinute,
      soundEnabled: state.notificationSound
    });
    
    // Check if scheduling failed
    if (!newId) {
      get().showToast('Could not schedule reminder');
      set({
        dailyReminderEnabled: false,
        dailyReminderId: null
      });
      await persistPrefs(buildPrefsFromState({
        ...get(),
        dailyReminderEnabled: false,
        dailyReminderId: null
      }));
      return { success: false };
    }
    
    console.log('[DailyReminder] Store: enabled with id:', newId);
    
    set({
      dailyReminderEnabled: true,
      dailyReminderHour: newHour,
      dailyReminderMinute: newMinute,
      dailyReminderId: newId
    });
    
    await persistPrefs(buildPrefsFromState({
      ...get(),
      dailyReminderEnabled: true,
      dailyReminderHour: newHour,
      dailyReminderMinute: newMinute,
      dailyReminderId: newId
    }));
    
    get().showToast('Daily reminder set!');
    return { success: true };
  },

  addFavorite: async (city) => {
    const cur = get().favorites;
    const selected = get().selectedCity;
    
    // Check both favorites AND selectedCity for duplicates
    const existingInFavorites = findCityByKey(cur, city);
    const isSelectedSame = cityKey(selected) === cityKey(city);
    const existingCity = existingInFavorites || (isSelectedSame ? selected : null);

    if (existingCity) {
      // City already exists - move it to front of favorites if not already there
      const withoutExisting = cur.filter((c) => cityKey(c) !== cityKey(existingCity));
      const alreadyInFavorites = cur.some((c) => cityKey(c) === cityKey(existingCity));
      const next = alreadyInFavorites 
        ? [existingCity, ...withoutExisting].slice(0, 5)
        : cur; // Don't modify favorites if it was only in selectedCity
      
      set({ favorites: next, selectedCity: existingCity });

      // Show friendly duplicate message
      get().showToast('Already added 😊');

      await persistPrefs(buildPrefsFromState({ ...get(), favorites: next, selectedCity: existingCity }));
      
      // Trigger refresh for the existing city
      await get().refresh({ city: existingCity });
      
      return { added: false, wasDuplicate: true };
    }

    // New city - add to front of favorites and select it
    const next = [city, ...cur].slice(0, 5);
    set({ favorites: next, selectedCity: city });

    await persistPrefs(buildPrefsFromState({ ...get(), favorites: next, selectedCity: city }));
    
    // Trigger refresh for the new city
    await get().refresh({ city });
    
    return { added: true, wasDuplicate: false };
  },

  removeFavorite: async (cityId) => {
    const { favorites: cur, selectedCity, refresh } = get();
    
    // Find index of city being removed
    const removedIndex = cur.findIndex((c) => c.id === cityId);
    if (removedIndex === -1) return; // City not in favorites, nothing to do
    
    // Remove the city
    const next = cur.filter((c) => c.id !== cityId);
    const safeNext = next.length ? next : [DEFAULT_CITY];
    
    // Check if we're removing the currently selected city
    const isRemovingSelected = selectedCity.id === cityId;
    
    if (isRemovingSelected) {
      // Auto-select next city: prefer same index (or closest), else first remaining
      let nextSelected: City;
      if (next.length > 0) {
        // Try same index, else clamp to last valid index
        const nextIndex = Math.min(removedIndex, next.length - 1);
        nextSelected = next[nextIndex];
      } else {
        nextSelected = DEFAULT_CITY;
      }
      
      // Update state with new favorites AND new selected city
      set({ favorites: safeNext, selectedCity: nextSelected });
      await persistPrefs(buildPrefsFromState({ ...get(), favorites: safeNext }));
      
      // Trigger refresh for the newly selected city (will use cache if offline)
      await refresh({ city: nextSelected });
    } else {
      // Not removing selected city, just update favorites
      set({ favorites: safeNext });
      await persistPrefs(buildPrefsFromState({ ...get(), favorites: safeNext }));
    }
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

      // addFavorite handles dedup, selection, and refresh
      await get().addFavorite(city);
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
