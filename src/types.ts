export type WeatherThemeKey = 'sunny' | 'rain' | 'snow' | 'wind' | 'night' | 'cloud';

export type City = {
  id: string; // stable key we create from lat/lon
  name: string;
  admin1?: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone?: string;
};

export type CurrentForecast = {
  timeISO: string;
  temperatureC: number;
  feelsLikeC: number;
  humidityPct: number;
  windKph: number;
  weatherCode: number;
  isDay: boolean;
  rainChancePctNow?: number;
  uvNow?: number;
};

export type DailyForecast = {
  dateISO: string;
  weatherCode: number;
  tempMaxC: number;
  tempMinC: number;
  rainChancePct: number;
  uvMax: number;
  windMaxKph: number;
  sunriseISO: string;
  sunsetISO: string;
};

export type ForecastData = {
  city: City;
  fetchedAt: number;
  current: CurrentForecast;
  daily: DailyForecast[]; // usually 7
};

export type FriendlyError = {
  title: string;
  message: string;
};
