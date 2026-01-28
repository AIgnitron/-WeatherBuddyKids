import AsyncStorage from '@react-native-async-storage/async-storage';
import type { City, ForecastData, WeatherThemeKey, TemperatureUnit } from '../types';

const PREFS_KEY = 'wbk_prefs_v1';
const cacheKey = (cityId: string) => `wbk_forecast_${cityId}`;

export type AlertRule = {
  id: 'rain' | 'wind' | 'cold' | 'heat' | 'uv';
  enabled: boolean;
  // thresholds are kid-friendly and coarse
  threshold: number;
};

export type StoredPrefs = {
  selectedCity: City;
  favorites: City[];
  kidMode: boolean;
  themeChoice?: 'auto' | WeatherThemeKey;
  temperatureUnit?: TemperatureUnit;
  notificationsEnabled?: boolean;
  notificationSound?: boolean;
  alertRules?: AlertRule[];
  lastAlertFiredAtById?: Record<string, number>;
  dailyReminderEnabled?: boolean;
  dailyReminderHour?: number;
  dailyReminderMinute?: number;
  dailyReminderId?: string | null;
};

export const safeJsonParse = <T>(raw: string | null): T | null => {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

export async function loadPrefs(): Promise<StoredPrefs | null> {
  const raw = await AsyncStorage.getItem(PREFS_KEY);
  return safeJsonParse<StoredPrefs>(raw);
}

export async function savePrefs(prefs: StoredPrefs): Promise<void> {
  await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

export async function loadForecastCache(cityId: string): Promise<ForecastData | null> {
  const raw = await AsyncStorage.getItem(cacheKey(cityId));
  return safeJsonParse<ForecastData>(raw);
}

export async function saveForecastCache(cityId: string, data: ForecastData): Promise<void> {
  await AsyncStorage.setItem(cacheKey(cityId), JSON.stringify(data));
}

export async function clearForecastCache(cityId: string): Promise<void> {
  await AsyncStorage.removeItem(cacheKey(cityId));
}
