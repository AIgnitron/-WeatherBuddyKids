import type { WeatherThemeKey } from '../types';

export const cityEmoji = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('ottawa')) return '🦫';
  if (n.includes('toronto')) return '🦉';
  if (n.includes('montreal') || n.includes('montréal')) return '🍁';
  if (n.includes('vancouver')) return '🐳';
  if (n.includes('calgary')) return '🐴';
  if (n.includes('edmonton')) return '🛷';
  if (n.includes('new york')) return '🗽';
  if (n.includes('london')) return '🎡';
  return '🏙️';
};

export const buddyEmojiForTheme = (k: WeatherThemeKey) => {
  switch (k) {
    case 'sunny':
      return '😎';
    case 'rain':
      return '☂️';
    case 'snow':
      return '🧣';
    case 'wind':
      return '🍃';
    case 'night':
      return '😴';
    default:
      return '☁️';
  }
};
