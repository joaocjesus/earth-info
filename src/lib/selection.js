import { selection, moveCamera } from './stores.js';
import { reverseGeocode, getCountryByCode } from './api.js';

/** Click on the globe or coordinate-input submit. */
export async function selectAt(lat, lon) {
  selection.set({ lat, lon, status: 'loading' });
  try {
    const geo = await reverseGeocode(lat, lon);
    if (!geo || !geo.countryCode) {
      selection.set({ lat, lon, status: 'ocean' });
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
