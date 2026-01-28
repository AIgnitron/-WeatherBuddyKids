import type { ForecastData } from '../types';
import type { AlertRule } from '../storage/storage';

export type AlertHit = {
  id: AlertRule['id'];
  title: string;
  body: string;
};

// Fixed thresholds - no longer user-configurable
const FIXED_THRESHOLDS = {
  rain: 60, // % precipitation probability
  wind: 35, // kph
  cold: 0, // °C
  heat: 30, // °C max
  uv: 6 // UV index
};

export function getDefaultAlertRules(): AlertRule[] {
  return [
    { id: 'rain', enabled: true, threshold: FIXED_THRESHOLDS.rain },
    { id: 'wind', enabled: true, threshold: FIXED_THRESHOLDS.wind },
    { id: 'cold', enabled: true, threshold: FIXED_THRESHOLDS.cold },
    { id: 'heat', enabled: true, threshold: FIXED_THRESHOLDS.heat },
    { id: 'uv', enabled: true, threshold: FIXED_THRESHOLDS.uv }
  ];
}

export function evaluateAlerts(forecast: ForecastData, rules: AlertRule[]): AlertHit[] {
  const today = forecast.daily?.[0];
  const hits: AlertHit[] = [];

  for (const r of rules) {
    if (!r.enabled) continue;

    // Use fixed thresholds regardless of stored value
    const threshold = FIXED_THRESHOLDS[r.id];

    if (r.id === 'rain') {
      const rainPct = today?.rainChancePct ?? forecast.current.rainChancePctNow;
      if (typeof rainPct === 'number' && rainPct >= threshold) {
        hits.push({
          id: 'rain',
          title: '🌧️ Rain Alert!',
          body: `${Math.round(rainPct)}% chance of rain. Umbrella time! ☔`
        });
      }
    }

    if (r.id === 'wind') {
      const wind = today?.windMaxKph ?? forecast.current.windKph;
      if (typeof wind === 'number' && wind >= threshold) {
        hits.push({
          id: 'wind',
          title: '💨 Wind Alert!',
          body: `Windy day ahead (${Math.round(wind)} kph). Hold onto your hat! 🎩`
        });
      }
    }

    if (r.id === 'cold') {
      const tempMin = today?.tempMinC ?? forecast.current.temperatureC;
      if (typeof tempMin === 'number' && tempMin <= threshold) {
        hits.push({
          id: 'cold',
          title: '❄️ Cold Alert!',
          body: `Brrr! It's ${Math.round(tempMin)}°C. Bundle up warm! 🧣`
        });
      }
    }

    if (r.id === 'heat') {
      const tempMax = today?.tempMaxC;
      if (typeof tempMax === 'number' && tempMax >= threshold) {
        hits.push({
          id: 'heat',
          title: '🥵 Heat Alert!',
          body: `Hot day! High of ${Math.round(tempMax)}°C. Stay cool! 💧`
        });
      }
    }

    if (r.id === 'uv') {
      const uv = today?.uvMax;
      if (typeof uv === 'number' && uv >= threshold) {
        hits.push({
          id: 'uv',
          title: '☀️ UV Alert!',
          body: `Strong sun (UV ${Math.round(uv)}). Wear sunscreen! 🧴`
        });
      }
    }
  }

  return hits;
}
