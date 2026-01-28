import { useMemo } from 'react';
import type { ForecastData, WeatherThemeKey } from '../types';
import { THEMES, type AppTheme } from './theme';
import { themeKeyFrom } from '../utils/weatherMap';

export function useAppTheme(
  forecast?: ForecastData,
  themeChoice?: 'auto' | WeatherThemeKey
): { themeKey: WeatherThemeKey; theme: AppTheme } {
  return useMemo(() => {
    const autoKey: WeatherThemeKey = forecast
      ? themeKeyFrom(forecast.current.weatherCode, forecast.current.isDay, forecast.current.windKph)
      : 'sunny';

    const themeKey: WeatherThemeKey =
      themeChoice && themeChoice !== 'auto'
        ? themeChoice
        : autoKey;

    return { themeKey, theme: THEMES[themeKey] };
  }, [forecast, themeChoice]);
}
