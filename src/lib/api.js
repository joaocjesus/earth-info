/**
 * Cached fetch helpers for countries metadata and BigDataCloud (reverse
 * geocoding). Persists to localStorage with TTLs.
 *
 * The REST Countries v3.1 API was shut down (v5 requires an API key, which
 * can't be kept secret in a client-only app), so countries come from the
 * project's open-data dump — identical v3.1 record shape — served by CORS
 * mirrors of their GitLab repo.
 */

const COUNTRIES_KEY = 'ei_countries_v1';
const GEOCODE_KEY = 'ei_geocode_v1';
const COUNTRIES_TTL = 7 * 24 * 60 * 60 * 1000;   // 7 days
const GEOCODE_TTL   = 30 * 24 * 60 * 60 * 1000;  // 30 days

function lsGet(k) {
  try {
    const raw = localStorage.getItem(k);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function lsSet(k, v) {
  try { localStorage.setItem(k, JSON.stringify(v)); }
  catch (err) { console.warn('lsSet failed', k, err); }
}

/* ---------- Countries ---------- */
const COUNTRIES_URLS = [
  'https://glcdn.githack.com/restcountries/restcountries/-/raw/master/src/main/resources/countriesV3.1.json',
  'https://cdn.statically.io/gl/restcountries/restcountries@master/src/main/resources/countriesV3.1.json'
];

// The dump ships every field (~1.4 MB); keep only what the app uses so the
// localStorage cache stays small.
function slimCountry(c) {
  return {
    name: { common: c.name?.common, official: c.name?.official },
    cca2: c.cca2,
    cca3: c.cca3,
    capital: c.capital,
    population: c.population,
    area: c.area,
    latlng: c.latlng,
    continents: c.continents,
    region: c.region,
    flag: c.flag
  };
}

async function fetchCountries() {
  let lastErr;
  for (const url of COUNTRIES_URLS) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
      if (!res.ok) throw new Error(`countries fetch failed: ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('countries payload is not a list');
      }
      return data.map(slimCountry);
    } catch (err) {
      lastErr = err;
      console.warn('countries source failed', url, err);
    }
  }
  throw lastErr || new Error('all countries sources failed');
}

let countriesPromise = null;
export function getAllCountries() {
  if (countriesPromise) return countriesPromise;

  const cached = lsGet(COUNTRIES_KEY);
  if (cached && cached.ts && Date.now() - cached.ts < COUNTRIES_TTL && Array.isArray(cached.data)) {
    countriesPromise = Promise.resolve(cached.data);
    return countriesPromise;
  }

  countriesPromise = (async () => {
    const data = await fetchCountries();
    lsSet(COUNTRIES_KEY, { ts: Date.now(), data });
    return data;
  })().catch((err) => {
    countriesPromise = null;
    const stale = lsGet(COUNTRIES_KEY);
    if (stale && Array.isArray(stale.data)) {
      console.warn('using stale countries cache after fetch failure');
      countriesPromise = Promise.resolve(stale.data);
      return stale.data;
    }
    throw err;
  });

  return countriesPromise;
}

export async function getCountryByCode(code) {
  if (!code) return null;
  const all = await getAllCountries();
  return all.find((c) => c.cca2 === code || c.cca3 === code) || null;
}

/* ---------- Reverse geocode (rounded ~10 km cache key) ---------- */
let geocodeCache = lsGet(GEOCODE_KEY) || {};

// Prune expired entries on load.
{
  const now = Date.now();
  let pruned = false;
  for (const k of Object.keys(geocodeCache)) {
    if (!geocodeCache[k].ts || now - geocodeCache[k].ts > GEOCODE_TTL) {
      delete geocodeCache[k];
      pruned = true;
    }
  }
  if (pruned) lsSet(GEOCODE_KEY, geocodeCache);
}

let flushTimer = null;
function scheduleFlush() {
  clearTimeout(flushTimer);
  flushTimer = setTimeout(() => lsSet(GEOCODE_KEY, geocodeCache), 500);
}

function geocodeKey(lat, lon) {
  return `${lat.toFixed(1)},${lon.toFixed(1)}`;
}

/** Drop cached countries + geocode results (storage and in-memory). */
export function clearApiCaches() {
  try { localStorage.removeItem(COUNTRIES_KEY); } catch {}
  try { localStorage.removeItem(GEOCODE_KEY); } catch {}
  countriesPromise = null;
  geocodeCache = {};
}

export async function reverseGeocode(lat, lon) {
  const k = geocodeKey(lat, lon);
  const hit = geocodeCache[k];
  if (hit && hit.ts && Date.now() - hit.ts < GEOCODE_TTL) return hit.data;

  const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
  const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`reverse geocode failed: ${res.status}`);
  const data = await res.json();

  geocodeCache[k] = { ts: Date.now(), data };
  scheduleFlush();
  return data;
}
