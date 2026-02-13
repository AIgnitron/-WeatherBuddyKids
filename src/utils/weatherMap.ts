import type { WeatherThemeKey } from '../types';

export const weatherEmojiForTheme = (k: WeatherThemeKey) => {
  switch (k) {
    case 'sunny':
      return '☀️';
    case 'rain':
      return '🌧️';
    case 'snow':
      return '❄️';
    case 'wind':
      return '💨';
    case 'night':
      return '🌙';
    default:
      return '☁️';
  }
};

export const shortLabelForTheme = (k: WeatherThemeKey) => {
  switch (k) {
    case 'sunny':
      return 'Sun';
    case 'rain':
      return 'Rain';
    case 'snow':
      return 'Snow';
    case 'wind':
      return 'Wind';
    case 'night':
      return 'Night';
    default:
      return 'Cloud';
  }
};

const isSnowCode = (code: number) => {
  // Snow fall (71-77), snow showers (85-86), freezing drizzle (56-57), freezing rain (66-67)
  return (
    (code >= 71 && code <= 77) ||
    code === 85 ||
    code === 86 ||
    code === 56 ||
    code === 57 ||
    code === 66 ||
    code === 67
  );
};

const isRainCode = (code: number) => {
  // drizzle (51-55), rain (61-65), rain showers (80-82), thunderstorm (95, 96, 99)
  // Excludes freezing drizzle (56-57) and freezing rain (66-67) which are snow
  return (
    (code >= 51 && code <= 55) ||
    (code >= 61 && code <= 65) ||
    (code >= 80 && code <= 82) ||
    code === 95 ||
    code === 96 ||
    code === 99
  );
};

export const themeKeyFrom = (weatherCode: number, isDay: boolean, windKph?: number): WeatherThemeKey => {
  if (!isDay) return 'night';
  if (isSnowCode(weatherCode)) return 'snow';
  if (isRainCode(weatherCode)) return 'rain';
  if (typeof windKph === 'number' && windKph >= 28) return 'wind';

  if (weatherCode === 0 || weatherCode === 1) return 'sunny';
  // 2-3 and fog = cloudy
  return 'cloud';
};
