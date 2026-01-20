import type { WeatherThemeKey } from '../types';

export type AppTheme = {
  key: WeatherThemeKey;
  label: string;
  bgTop: string;
  bgBottom: string;
  card: string;
  cardAlt: string;
  outline: string;
  text: string;
  textSoft: string;
  accent: string;
};

export const TOKENS = {
  radius: 24,
  radiusBig: 32,
  pad: 16,
  gap: 16,
  touch: 56
} as const;

export const THEMES: Record<WeatherThemeKey, AppTheme> = {
  sunny: {
    key: 'sunny',
    label: 'Sun',
    bgTop: '#FFE07A',
    bgBottom: '#FFB703',
    card: '#FFF6D7',
    cardAlt: '#FFFFFF',
    outline: '#F59E0B',
    text: '#1F2937',
    textSoft: '#374151',
    accent: '#F97316'
  },
  rain: {
    key: 'rain',
    label: 'Rain',
    bgTop: '#BFE6FF',
    bgBottom: '#5DADE2',
    card: '#EAF6FF',
    cardAlt: '#FFFFFF',
    outline: '#2E86C1',
    text: '#102A43',
    textSoft: '#243B53',
    accent: '#2563EB'
  },
  snow: {
    key: 'snow',
    label: 'Snow',
    bgTop: '#EAF7FF',
    bgBottom: '#BBDFF3',
    card: '#FFFFFF',
    cardAlt: '#F1FAFF',
    outline: '#7FB3D5',
    text: '#0B2545',
    textSoft: '#13315C',
    accent: '#38BDF8'
  },
  wind: {
    key: 'wind',
    label: 'Wind',
    bgTop: '#D7FFE7',
    bgBottom: '#66D19E',
    card: '#ECFFF4',
    cardAlt: '#FFFFFF',
    outline: '#10B981',
    text: '#064E3B',
    textSoft: '#065F46',
    accent: '#059669'
  },
  night: {
    key: 'night',
    label: 'Night',
    bgTop: '#1B2559',
    bgBottom: '#0B102D',
    card: '#1E2A6A',
    cardAlt: '#2A3A8A',
    outline: '#8B5CF6',
    text: '#F9FAFB',
    textSoft: '#E5E7EB',
    accent: '#A78BFA'
  },
  cloud: {
    key: 'cloud',
    label: 'Cloud',
    bgTop: '#E5E7EB',
    bgBottom: '#9CA3AF',
    card: '#F9FAFB',
    cardAlt: '#FFFFFF',
    outline: '#6B7280',
    text: '#111827',
    textSoft: '#374151',
    accent: '#64748B'
  }
};
