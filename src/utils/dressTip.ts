import type { CurrentForecast, DailyForecast } from '../types';

export type DressTipResult = {
  short: string;
  text: string;
  emoji: string;
  extras: string[];
  details: string[];
  outfit: string;
};

export const getDressTip = (current: CurrentForecast, today?: DailyForecast): DressTipResult => {
  const t = current.feelsLikeC ?? current.temperatureC;
  const rain = typeof current.rainChancePctNow === 'number'
    ? current.rainChancePctNow
    : today?.rainChancePct;
  const uv = typeof current.uvNow === 'number' ? current.uvNow : today?.uvMax;
  const wind = current.windKph;
  const humidity = current.humidityPct;
  const snow = current.snowfallCm ?? today?.snowfallCmSum ?? 0;

  let base: string;
  let baseEmoji: string;
  let outfit: string;
  const details: string[] = [];

  // Temperature-based clothing
  if (t <= -10) {
    base = 'Heavy winter gear';
    baseEmoji = '🧥';
    outfit = '🧥🧣🧤🥾';
    details.push('Very cold! Layer up with thermal underwear');
  } else if (t <= -5) {
    base = 'Big coat';
    baseEmoji = '🧥';
    outfit = '🧥🧣🧤';
    details.push('Bundle up! Wear warm layers');
  } else if (t <= 5) {
    base = 'Coat & scarf';
    baseEmoji = '🧥';
    outfit = '🧥🧣';
    details.push('Chilly out there!');
  } else if (t <= 10) {
    base = 'Warm jacket';
    baseEmoji = '🧥';
    outfit = '🧥';
    details.push('A bit cool, dress warmly');
  } else if (t <= 15) {
    base = 'Light jacket';
    baseEmoji = '🧥';
    outfit = '🧥👖';
    details.push('Nice and mild');
  } else if (t <= 20) {
    base = 'Long sleeves';
    baseEmoji = '👔';
    outfit = '👔👖';
    details.push('Comfortable weather');
  } else if (t <= 25) {
    base = 'T-shirt';
    baseEmoji = '👕';
    outfit = '👕👖';
    details.push('Warm and pleasant');
  } else if (t <= 30) {
    base = 'Shorts & tee';
    baseEmoji = '🩳';
    outfit = '👕🩳';
    details.push('It\'s hot! Stay cool');
  } else {
    base = 'Light clothes';
    baseEmoji = '🩳';
    outfit = '🎽🩳';
    details.push('Very hot! Wear light, breathable clothes');
  }

  // Additional accessories
  const extras: string[] = [];

  // Rain check
  if (typeof rain === 'number') {
    if (rain >= 80) {
      extras.push('☂️');
      details.push('Bring an umbrella, rain is likely!');
    } else if (rain >= 50) {
      extras.push('☂️');
      details.push('Pack an umbrella just in case');
    } else if (rain >= 30) {
      details.push('Small chance of rain');
    }
  }

  // Snow check
  if (snow > 0) {
    extras.push('🥾');
    details.push('Snow! Wear waterproof boots');
  }

  // Wind check
  if (typeof wind === 'number') {
    if (wind >= 40) {
      extras.push('🧢');
      details.push('Very windy! Hold onto your hat');
    } else if (wind >= 25) {
      extras.push('🧢');
      details.push('Windy day ahead');
    }
  }

  // UV check
  if (typeof uv === 'number') {
    if (uv >= 8) {
      extras.push('🧴');
      extras.push('🕶️');
      extras.push('🧢');
      details.push('Very high UV! Sunscreen & sunglasses are a must');
    } else if (uv >= 6) {
      extras.push('🧴');
      extras.push('🕶️');
      details.push('High UV, wear sunscreen');
    } else if (uv >= 3) {
      extras.push('🧴');
      details.push('Moderate UV, consider sunscreen');
    }
  }

  // Humidity check
  if (typeof humidity === 'number' && humidity >= 80 && t >= 20) {
    details.push('Very humid, wear breathable fabrics');
  }

  const text = extras.length ? `${base} ${baseEmoji} + ${extras.join('')}` : `${base} ${baseEmoji}`;
  
  return {
    short: base,
    text,
    emoji: baseEmoji,
    extras,
    details,
    outfit,
  };
};
