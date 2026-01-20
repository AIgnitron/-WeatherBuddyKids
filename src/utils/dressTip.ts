import type { CurrentForecast, DailyForecast } from '../types';

export const getDressTip = (current: CurrentForecast, today?: DailyForecast) => {
  const t = current.feelsLikeC ?? current.temperatureC;
  const rain = typeof current.rainChancePctNow === 'number'
    ? current.rainChancePctNow
    : today?.rainChancePct;
  const uv = typeof current.uvNow === 'number' ? current.uvNow : today?.uvMax;
  const wind = current.windKph;

  let base: string;
  let baseEmoji: string;

  if (t <= -5) {
    base = 'Big coat';
    baseEmoji = '🧥';
  } else if (t <= 5) {
    base = 'Coat';
    baseEmoji = '🧥';
  } else if (t <= 15) {
    base = 'Jacket';
    baseEmoji = '🧥';
  } else if (t <= 25) {
    base = 'T-shirt';
    baseEmoji = '👕';
  } else {
    base = 'Shorts';
    baseEmoji = '🩳';
  }

  const extras: string[] = [];
  if (typeof rain === 'number' && rain >= 50) extras.push('☂️');
  if (typeof wind === 'number' && wind >= 25) extras.push('🧢');
  if (typeof uv === 'number' && uv >= 7) extras.push('🧴');

  const text = extras.length ? `${base} ${baseEmoji} + ${extras.join('')}` : `${base} ${baseEmoji}`;
  return {
    short: base,
    text,
    emoji: baseEmoji,
    extras,
  };
};
