import { get } from 'svelte/store';
import { selection, moveCamera, vectorScale } from './stores.js';
import { reverseGeocode, getCountryByCode } from './api.js';
import { classifyOcean, oceanFromFeature } from './oceans.js';
import {
  loadMarinePolys, loadCountryPolys, classifyByPolys, countryFromFeature
} from './marinePolys.js';

// Bumped on every new selection intent so in-flight lookups from an older
// click can't overwrite a newer selection.
let selectToken = 0;

async function classifyOceanAt(lat, lon) {
  try {
    const polys = await loadMarinePolys(get(vectorScale));
    const feat = classifyByPolys(lat, lon, polys);
    const fromPoly = oceanFromFeature(feat);
    if (fromPoly) return fromPoly;
  } catch (err) {
    console.warn('marine poly classify failed, falling back to bbox', err);
  }
  return classifyOcean(lat, lon);
}

/** Offline country lookup via cached Natural Earth polygons. */
async function classifyCountryAt(lat, lon) {
  try {
    const polys = await loadCountryPolys(get(vectorScale));
    return countryFromFeature(classifyByPolys(lat, lon, polys));
  } catch (err) {
    console.warn('local country classify failed', err);
    return null;
  }
}

/** Best-effort: swap the provisional country for the full facts record. */
function enrichCountry(token, code) {
  getCountryByCode(code)
    .then((country) => {
      if (token !== selectToken || !country) return;
      selection.update((s) => (s && s.status === 'ready' ? { ...s, country } : s));
    })
    .catch((err) => console.warn('country facts unavailable', err));
}

// An entry describes an island when the island word leads its description
// ("island of Portugal", "largest island of Japan", "One of the main
// islands…") — within the first clause, near the start. Mentions buried
// deeper ("one of 8 regions of Japan in the central island of Honshū")
// describe something *on* an island, not the island itself.
const ISLAND_DESC_RE = /^[^,;.]{0,30}\b(island|isle|atoll|archipelago)s?\b/i;

/**
 * Most specific island/archipelago name in a BigDataCloud response, e.g.
 * 'Tenerife', 'Sao Miguel Island', 'Honshu'. Entries carry an ascending
 * `order` (broad → specific); highest matching order wins.
 */
function islandFromGeo(geo) {
  const info = geo?.localityInfo;
  if (!info) return null;
  const entries = [...(info.administrative || []), ...(info.informative || [])];
  let best = null;
  for (const e of entries) {
    const desc = e?.description || '';
    if (!ISLAND_DESC_RE.test(desc)) continue;
    // "island country in East Asia" etc. — that's the nation itself.
    if (/\bcountry\b/i.test(desc)) continue;
    if (e.name === geo.countryName) continue;
    if ((e.order ?? -1) > (best?.order ?? -1)) best = e;
  }
  return best?.name || null;
}

/** Best-effort: add nearby city + island names from reverse geocoding. */
function enrichLocality(token, lat, lon) {
  reverseGeocode(lat, lon)
    .then((geo) => {
      if (token !== selectToken || !geo) return;
      const cityHint = geo.city || geo.locality || null;
      const islandHint = islandFromGeo(geo);
      if (!cityHint && !islandHint) return;
      selection.update((s) =>
        s && s.status === 'ready' ? { ...s, cityHint, islandHint } : s
      );
    })
    .catch(() => {});
}

/** Click on the globe or coordinate-input submit. */
export async function selectAt(lat, lon) {
  const token = ++selectToken;
  selection.set({ lat, lon, status: 'loading' });
  try {
    // Local point-in-polygon lookup first: no network on land clicks.
    const local = await classifyCountryAt(lat, lon);
    if (token !== selectToken) return;
    if (local) {
      selection.set({
        lat, lon,
        status: 'ready',
        country: { name: { common: local.name || local.code }, cca2: local.code },
        cityHint: null
      });
      enrichCountry(token, local.code);
      enrichLocality(token, lat, lon);
      return;
    }

    // No local hit — either ocean, or land the current vector scale is too
    // coarse to carry (small islands at 110m). Geocode decides.
    let geo = null;
    try {
      geo = await reverseGeocode(lat, lon);
    } catch (err) {
      console.warn('reverse geocode failed', err);
    }
    if (token !== selectToken) return;

    if (geo && geo.countryCode) {
      selection.set({
        lat, lon,
        status: 'ready',
        country: {
          name: { common: geo.countryName || geo.countryCode },
          cca2: geo.countryCode
        },
        cityHint: geo.city || geo.locality || null,
        islandHint: islandFromGeo(geo)
      });
      enrichCountry(token, geo.countryCode);
      return;
    }

    const ocean = await classifyOceanAt(lat, lon);
    if (token !== selectToken) return;
    selection.set({ lat, lon, status: 'ocean', ocean });
  } catch (err) {
    if (token !== selectToken) return;
    selection.set({ lat, lon, status: 'error', error: err?.message || String(err) });
  }
}

/** Country picked from the dropdown. */
export async function selectCountryByCode(code) {
  const token = ++selectToken;
  const country = await getCountryByCode(code);
  if (token !== selectToken || !country) return;
  const hasLatLng = Array.isArray(country.latlng) && country.latlng.length >= 2;
  const [lat, lon] = hasLatLng ? country.latlng : [0, 0];
  if (hasLatLng) moveCamera(lat, lon, 2.6);
  selection.set({ lat, lon, status: 'ready', country });
}

export function clearSelection() {
  ++selectToken;
  selection.set(null);
}
