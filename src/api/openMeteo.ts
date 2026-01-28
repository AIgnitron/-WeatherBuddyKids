import type { City, ForecastData } from '../types';

const GEO_BASE = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_BASE = 'https://api.open-meteo.com/v1/forecast';

export const cityIdFromLatLon = (lat: number, lon: number) => {
  // round to 4 decimals ~ 11m precision
  const a = lat.toFixed(4);
  const b = lon.toFixed(4);
  return `${a},${b}`;
};

export async function geocodeCities(query: string, count = 8): Promise<City[]> {
  const q = query.trim();
  if (!q) return [];
  const url = `${GEO_BASE}?name=${encodeURIComponent(q)}&count=${count}&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('geo_failed');
  const json = (await res.json()) as any;
  const results = Array.isArray(json?.results) ? json.results : [];
  return results.map((r: any) => {
    const lat = Number(r.latitude);
    const lon = Number(r.longitude);
    const id = cityIdFromLatLon(lat, lon);
    return {
      id,
      name: String(r.name || ''),
      admin1: r.admin1 ? String(r.admin1) : undefined,
      country: String(r.country || ''),
      latitude: lat,
      longitude: lon,
      timezone: r.timezone ? String(r.timezone) : undefined
    } as City;
  });
}

type ForecastArgs = {
  city: City;
};

export async function fetchForecast({ city }: ForecastArgs): Promise<ForecastData> {
  const url = `${FORECAST_BASE}?latitude=${city.latitude}&longitude=${city.longitude}`
    + `&current=temperature_2m,apparent_temperature,relative_humidity_2m,is_day,weather_code,wind_speed_10m,snowfall`
    + `&hourly=precipitation_probability,uv_index,snowfall`
    + `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max,sunrise,sunset,wind_speed_10m_max,snowfall_sum`
    + `&timezone=auto`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('forecast_failed');
  const json = (await res.json()) as any;

  const current = json.current;
  const hourly = json.hourly;
  const daily = json.daily;

  const currentTime = String(current?.time);

  const nearestIndex = (() => {
    const times: string[] = Array.isArray(hourly?.time) ? hourly.time : [];
    if (!times.length) return -1;
    // find the first time >= current time
    const i = times.findIndex((t) => t >= currentTime);
    return i === -1 ? times.length - 1 : i;
  })();

  const rainNow = (() => {
    const arr: any[] = Array.isArray(hourly?.precipitation_probability) ? hourly.precipitation_probability : [];
    if (nearestIndex < 0 || nearestIndex >= arr.length) return undefined;
    const v = Number(arr[nearestIndex]);
    return Number.isFinite(v) ? v : undefined;
  })();

  const uvNow = (() => {
    const arr: any[] = Array.isArray(hourly?.uv_index) ? hourly.uv_index : [];
    if (nearestIndex < 0 || nearestIndex >= arr.length) return undefined;
    const v = Number(arr[nearestIndex]);
    return Number.isFinite(v) ? v : undefined;
  })();

  const snowfallNow = (() => {
    const arr: any[] = Array.isArray(hourly?.snowfall) ? hourly.snowfall : [];
    if (nearestIndex < 0 || nearestIndex >= arr.length) return undefined;
    const v = Number(arr[nearestIndex]);
    return Number.isFinite(v) ? v : undefined;
  })();

  const dailyList = (() => {
    const dates: string[] = Array.isArray(daily?.time) ? daily.time : [];
    const codes: any[] = Array.isArray(daily?.weather_code) ? daily.weather_code : [];
    const tmax: any[] = Array.isArray(daily?.temperature_2m_max) ? daily.temperature_2m_max : [];
    const tmin: any[] = Array.isArray(daily?.temperature_2m_min) ? daily.temperature_2m_min : [];
    const rain: any[] = Array.isArray(daily?.precipitation_probability_max) ? daily.precipitation_probability_max : [];
    const uv: any[] = Array.isArray(daily?.uv_index_max) ? daily.uv_index_max : [];
    const sunrise: any[] = Array.isArray(daily?.sunrise) ? daily.sunrise : [];
    const sunset: any[] = Array.isArray(daily?.sunset) ? daily.sunset : [];
    const wind: any[] = Array.isArray(daily?.wind_speed_10m_max) ? daily.wind_speed_10m_max : [];
    const snowSum: any[] = Array.isArray(daily?.snowfall_sum) ? daily.snowfall_sum : [];

    return dates.map((d, i) => ({
      dateISO: String(d),
      weatherCode: Number(codes[i] ?? 0),
      tempMaxC: Number(tmax[i] ?? 0),
      tempMinC: Number(tmin[i] ?? 0),
      rainChancePct: Number(rain[i] ?? 0),
      uvMax: Number(uv[i] ?? 0),
      windMaxKph: Number(wind[i] ?? 0),
      sunriseISO: String(sunrise[i] ?? ''),
      sunsetISO: String(sunset[i] ?? ''),
      snowfallCmSum: Number(snowSum[i] ?? 0)
    }));
  })();

  const data: ForecastData = {
    city,
    fetchedAt: Date.now(),
    current: {
      timeISO: currentTime,
      temperatureC: Number(current?.temperature_2m ?? 0),
      feelsLikeC: Number(current?.apparent_temperature ?? 0),
      humidityPct: Number(current?.relative_humidity_2m ?? 0),
      windKph: Number(current?.wind_speed_10m ?? 0),
      weatherCode: Number(current?.weather_code ?? 0),
      isDay: Boolean(current?.is_day),
      rainChancePctNow: rainNow,
      uvNow,
      snowfallCm: snowfallNow
    },
    daily: dailyList
  };

  return data;
}
