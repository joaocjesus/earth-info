// Natural Earth marine polygons — used for ocean classification by point-in-
// polygon test, and for drawing accurate ocean boundary outlines.
//
// Source: nvkelso/natural-earth-vector (public domain). Files exist at three
// scales: 110m (~100 KB), 50m (~500 KB), 10m (~5 MB).

import { fetchCachedJson, isCached } from './geojsonCache.js';

const BASE_SCALE = '110m';

/** Make sure the smallest scale's data is cached and parsed. Idempotent. */
export async function prefetchBase() {
  try {
    await Promise.all([
      loadPolys(countriesUrl(BASE_SCALE)),
      loadPolys(marineUrl(BASE_SCALE))
    ]);
  } catch (err) {
    console.warn('base prefetch failed', err);
  }
}

/**
 * Fetch + parse both vector files for a scale in the background, so the
 * first click classifies from memory instead of paying download/parse cost.
 */
export function warmScale(scale) {
  loadCountryPolys(scale).catch(() => {});
  loadMarinePolys(scale).catch(() => {});
}

// Natural Earth ships marine polygons at 50m and 10m only — no 110m variant.
// At low scale we substitute 50m (still small) so ocean classification keeps
// working.
function marineScale(scale) {
  return scale === '110m' ? '50m' : scale;
}

// Hosted on rawcdn.githack.com — a permanent CDN mirror of GitHub raw files.
// jsDelivr's @master proxy returns a "429: Too Many Requests" body for large
// files like ne_10m_admin_0_countries.geojson (13 MB), so we use githack.
const CDN = 'https://rawcdn.githack.com/nvkelso/natural-earth-vector/master/geojson';

export function marineUrl(scale) {
  return `${CDN}/ne_${marineScale(scale)}_geography_marine_polys.geojson`;
}

export function countriesUrl(scale) {
  return `${CDN}/ne_${scale}_admin_0_countries.geojson`;
}

const memCache = new Map();  // url → Promise<{ features, bboxes }>

// Caches the promise (not the result) so concurrent callers — startup
// prefetch, a click, the borders overlay — share one fetch+parse.
function loadPolys(url) {
  if (memCache.has(url)) return memCache.get(url);
  const p = (async () => {
    const raw = await fetchCachedJson(url);
    const features = (raw.features || []).filter((f) => {
      const t = f.geometry?.type;
      return t === 'Polygon' || t === 'MultiPolygon';
    });
    const bboxes = features.map(featureBBox);
    return { features, bboxes };
  })();
  memCache.set(url, p);
  p.catch(() => memCache.delete(url));
  return p;
}

export function loadMarinePolys(scale) {
  return loadPolys(marineUrl(scale));
}

export function loadCountryPolys(scale) {
  return loadPolys(countriesUrl(scale));
}

/**
 * Country code + display name from a Natural Earth admin-0 feature.
 * ISO_A2 is '-99' for some countries (France, Norway — NE quirk); the _EH
 * variants carry the real codes.
 */
export function countryFromFeature(f) {
  if (!f) return null;
  const p = f.properties || {};
  const a2 = p.ISO_A2_EH || p.ISO_A2;
  const a3 = p.ISO_A3_EH || p.ISO_A3 || p.ADM0_A3;
  const code = /^[A-Za-z]{2}$/.test(a2 || '') ? a2
    : /^[A-Za-z]{3}$/.test(a3 || '') ? a3
    : null;
  if (!code) return null;
  return { code, name: p.NAME || p.ADMIN || null };
}

export async function isMarineCached(scale) {
  return isCached(marineUrl(scale));
}

export async function isCountriesCached(scale) {
  return isCached(countriesUrl(scale));
}

/** Returns the most specific named feature containing (lat, lon), or null. */
export function classifyByPolys(lat, lon, parsed) {
  if (!parsed) return null;
  const { features, bboxes } = parsed;
  let best = null;
  let bestArea = Infinity;
  for (let i = 0; i < features.length; i++) {
    const bb = bboxes[i];
    if (lon < bb.minLon || lon > bb.maxLon || lat < bb.minLat || lat > bb.maxLat) continue;
    const f = features[i];
    if (!pointInFeature(lon, lat, f)) continue;
    const area = (bb.maxLon - bb.minLon) * (bb.maxLat - bb.minLat);
    if (area < bestArea) {
      bestArea = area;
      best = f;
    }
  }
  return best;
}

function featureBBox(f) {
  let minLon = Infinity, minLat = Infinity, maxLon = -Infinity, maxLat = -Infinity;
  const visit = (poly) => {
    for (const ring of poly) {
      for (const [x, y] of ring) {
        if (x < minLon) minLon = x;
        if (x > maxLon) maxLon = x;
        if (y < minLat) minLat = y;
        if (y > maxLat) maxLat = y;
      }
    }
  };
  if (f.geometry.type === 'Polygon') visit(f.geometry.coordinates);
  else for (const poly of f.geometry.coordinates) visit(poly);
  return { minLon, minLat, maxLon, maxLat };
}

function pointInFeature(x, y, f) {
  if (f.geometry.type === 'Polygon') return pointInPolygon(x, y, f.geometry.coordinates);
  for (const poly of f.geometry.coordinates) {
    if (pointInPolygon(x, y, poly)) return true;
  }
  return false;
}

function pointInPolygon(x, y, rings) {
  if (!rings.length) return false;
  if (!pointInRing(x, y, rings[0])) return false;
  for (let i = 1; i < rings.length; i++) {
    if (pointInRing(x, y, rings[i])) return false;  // inside hole
  }
  return true;
}

function pointInRing(x, y, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];
    const intersects = ((yi > y) !== (yj > y)) &&
      (x < (xj - xi) * (y - yi) / (yj - yi + 1e-12) + xi);
    if (intersects) inside = !inside;
  }
  return inside;
}
