import { get } from 'svelte/store';
import { selection, moveCamera, vectorScale } from './stores.js';
import { reverseGeocode, getCountryByCode } from './api.js';
import { classifyOcean, oceanFromFeature } from './oceans.js';
import { loadMarinePolys, classifyByPolys } from './marinePolys.js';

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

/** Click on the globe or coordinate-input submit. */
export async function selectAt(lat, lon) {
  selection.set({ lat, lon, status: 'loading' });
  try {
    const geo = await reverseGeocode(lat, lon);
    if (!geo || !geo.countryCode) {
      const ocean = await classifyOceanAt(lat, lon);
      selection.set({ lat, lon, status: 'ocean', ocean });
      return;
    }
    const country = await getCountryByCode(geo.countryCode);
    selection.set({
      lat, lon,
      status: 'ready',
      country,
      cityHint: geo.city || geo.locality || null
    });
  } catch (err) {
    selection.set({ lat, lon, status: 'error', error: err?.message || String(err) });
  }
}

/** Country picked from the dropdown. */
export async function selectCountryByCode(code) {
  const country = await getCountryByCode(code);
  if (!country) return;
  const [lat, lon] = country.latlng || [0, 0];
  moveCamera(lat, lon, 2.6);
  selection.set({ lat, lon, status: 'ready', country });
}

export function clearSelection() {
  selection.set(null);
}
