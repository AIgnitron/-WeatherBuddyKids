import type { TemperatureUnit } from '../types';

export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export const round0 = (n: number) => Math.round(n);

export const celsiusToFahrenheit = (c: number) => (c * 9) / 5 + 32;

export const formatTemp = (c: number, unit: TemperatureUnit = 'C') => {
  if (unit === 'F') {
    return `${round0(celsiusToFahrenheit(c))}°`;
  }
  return `${round0(c)}°`;
};

export const formatSnowfall = (cm: number | undefined) => {
  if (typeof cm !== 'number') return '--';
  if (cm <= 0) return '0 cm';
  if (cm < 1) return `${round0(cm * 10)} mm`;
  return `${cm.toFixed(1)} cm`;
};

export const formatPct = (p: number | undefined) => (typeof p === 'number' ? `${round0(p)}%` : '--');

export const formatKph = (kph: number | undefined) => (typeof kph === 'number' ? `${round0(kph)} kph` : '--');

export const formatTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
};

export const formatDayShort = (isoDate: string) => {
  const d = new Date(isoDate);
  return d.toLocaleDateString(undefined, { weekday: 'short' });
};

export const formatDayLong = (isoDate: string) => {
  const d = new Date(isoDate);
  return d.toLocaleDateString(undefined, { weekday: 'long' });
};
