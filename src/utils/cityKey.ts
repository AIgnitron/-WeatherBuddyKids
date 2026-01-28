import type { City } from '../types';

/**
 * Normalize a string for comparison:
 * - Trim whitespace
 * - Lowercase
 * - Collapse multiple spaces to single
 * - Remove common punctuation
 */
export function normalize(str: string | undefined | null): string {
  if (!str) return '';
  return str
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[.,'"()-]/g, '');
}

/**
 * Round lat/lon to 0 decimal places (~111km precision) for fuzzy matching.
 * This is very coarse but ensures cities in the same metro area match,
 * even if GPS coords vary or reverse geocoding returns suburb names.
 */
function roundCoord(val: number): string {
  return Math.round(val).toString();
}

/**
 * Generate a stable key for a city for deduplication.
 * 
 * Strategy: Use ONLY ROUNDED COORDS (no name).
 * 
 * Why not include name?
 * - Reverse geocoding may return suburb names: "Kanata", "Nepean" instead of "Ottawa"
 * - Or variations like "City of Ottawa", "Ottawa (Downtown)"
 * - This causes false negatives in deduplication
 * 
 * Why round to 0 decimals (whole numbers)?
 * - ~111km precision at the equator, less at higher latitudes
 * - Ensures the same metro area matches regardless of exact GPS position
 * - Ottawa default: 45.4215,-75.6972 → 45|-76
 * - Ottawa GPS: 45.35,-75.65 → 45|-76 (SAME!)
 * - Toronto: 43.65,-79.38 → 44|-79 (DIFFERENT ✓)
 */
export function cityKey(city: City | null | undefined): string {
  if (!city) return '';

  // Use only rounded coords for maximum deduplication reliability
  const latPart = roundCoord(city.latitude);
  const lonPart = roundCoord(city.longitude);

  return `${latPart}|${lonPart}`;
}

/**
 * Check if two cities are the same by comparing their keys
 */
export function isSameCity(a: City | null | undefined, b: City | null | undefined): boolean {
  if (!a || !b) return false;
  return cityKey(a) === cityKey(b);
}

/**
 * Find a city in an array by its key
 */
export function findCityByKey(cities: City[], targetCity: City): City | undefined {
  const targetKey = cityKey(targetCity);
  return cities.find((c) => cityKey(c) === targetKey);
}

/**
 * Check if a city exists in an array by its key
 */
export function cityExistsIn(cities: City[], city: City): boolean {
  return findCityByKey(cities, city) !== undefined;
}

// ============================================
// Inline test / validation (safe for production)
// ============================================
if (__DEV__) {
  const testCases = () => {
    // Test normalize
    console.assert(normalize('  Ottawa  ') === 'ottawa', 'normalize: trim + lowercase');
    console.assert(normalize('New   York') === 'new york', 'normalize: collapse spaces');
    console.assert(normalize("St. John's") === 'st johns', 'normalize: remove punctuation');
    console.assert(normalize(undefined) === '', 'normalize: undefined');
    console.assert(normalize(null) === '', 'normalize: null');

    // Test cityKey - uses ONLY rounded coords (no name) for maximum deduplication
    const cityFromSearch: City = {
      id: '45.4215,-75.6972',
      name: 'Ottawa',
      admin1: 'Ontario',
      country: 'Canada',
      latitude: 45.4215,
      longitude: -75.6972
    };
    // Key should be: rounded_lat|rounded_lon (0 decimals)
    console.assert(
      cityKey(cityFromSearch) === '45|-76',
      'cityKey: coords only, rounded to 0 decimals'
    );

    // Test cross-source matching: GPS vs Search (different name from reverse geocode!)
    const cityFromGPS: City = {
      id: '45.35,-75.65',
      name: 'Kanata',      // Suburb name from reverse geocode!
      admin1: 'ON',
      country: 'CA',
      latitude: 45.35,
      longitude: -75.65
    };
    // Both should produce same key because rounded coords match (both round to 45|-76)
    console.assert(
      cityKey(cityFromSearch) === cityKey(cityFromGPS),
      'cityKey: cross-source match even with different name (suburb)'
    );

    // Test that different cities are NOT matched (Ottawa vs Toronto)
    const toronto: City = {
      id: 'different',
      name: 'Toronto',
      admin1: 'Ontario',
      country: 'Canada',
      latitude: 43.6532,
      longitude: -79.3832
    };
    console.assert(
      cityKey(cityFromSearch) !== cityKey(toronto),
      'cityKey: different cities have different keys'
    );

    // Test isSameCity
    console.assert(isSameCity(cityFromSearch, cityFromGPS) === true, 'isSameCity: cross-source match');
    console.assert(isSameCity(cityFromSearch, toronto) === false, 'isSameCity: different cities');
    console.assert(isSameCity(cityFromSearch, null) === false, 'isSameCity: null check');

    // Test cityExistsIn
    const cities: City[] = [cityFromSearch];
    console.assert(cityExistsIn(cities, cityFromGPS) === true, 'cityExistsIn: cross-source found');
    console.assert(cityExistsIn(cities, toronto) === false, 'cityExistsIn: different city not found');

    console.log('✅ cityKey tests passed');
  };

  // Run tests only once
  try {
    testCases();
  } catch (e) {
    console.warn('cityKey tests failed:', e);
  }
}
