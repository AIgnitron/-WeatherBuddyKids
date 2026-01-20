import { useMemo } from 'react';
import type { ForecastData, WeatherThemeKey } from '../types';
import { THEMES, type AppTheme } from './theme';
import { themeKeyFrom } from '../utils/weatherMap';

export function useAppTheme(
  forecast?: ForecastData
): { themeKey: WeatherThemeKey; theme: AppTheme } {
  return useMemo(() => {
    const themeKey: WeatherThemeKey = forecast
      ? themeKeyFrom(
          forecast.current.weatherCode,
          forecast.current.isDay,
          forecast.current.windKph
        )
      : 'sunny';

    return { themeKey, theme: THEMES[themeKey] };
  }, [forecast]);
}
