import { writable } from 'svelte/store';
import { CONTINENT_CENTROIDS } from './continents.js';

const INITIAL = CONTINENT_CENTROIDS['Europe'];

/** What region the camera should be looking at. Writing slerps the camera. */
export const cameraTarget = writable({
  lat: INITIAL.lat,
  lon: INITIAL.lon,
  distance: 3.0,
  // bumped every set, so writing the same value still triggers an animation
  ts: 0
});
export function moveCamera(lat, lon, distance = 2.6) {
  cameraTarget.set({ lat, lon, distance, ts: performance.now() });
}

/** What's currently selected/highlighted (drives info card + marker). */
export const selection = writable(null);
// selection shape: { lat, lon, status: 'loading' | 'ocean' | 'ready' | 'error',
//   country?, cityHint?, error? }

/** Texture mode controls. */
export const resolutionMode = writable('2k'); // '2k' | '4k' | '8k'
export const currentTier = writable(null);

/** Toggle for country border overlay. */
export const showBorders = writable(false);

/** Toggle for ocean boundary overlay. */
export const showOceanBorders = writable(false);

/** Natural Earth vector detail level used for borders and ocean classification. */
const SCALE_KEY = 'ei_vector_scale';
const SCALE_DEFAULT = '110m';
const SCALE_VALID = new Set(['110m', '50m', '10m']);
function loadScale() {
  try {
    const v = localStorage.getItem(SCALE_KEY);
    return SCALE_VALID.has(v) ? v : SCALE_DEFAULT;
  } catch { return SCALE_DEFAULT; }
}
export const vectorScale = writable(loadScale());
vectorScale.subscribe((v) => {
  try { localStorage.setItem(SCALE_KEY, v); } catch {}
});

/** UI: texture loader progress. */
export const progress = writable({ visible: false, title: '', pct: null, error: false });
let progressHideTimer = null;
export function showProgress(title, pct = null) {
  clearTimeout(progressHideTimer);
  progress.set({ visible: true, title, pct, error: false });
}
export function setProgressPct(pct) {
  progress.update((p) => ({ ...p, pct }));
}
export function hideProgress(delay = 400) {
  clearTimeout(progressHideTimer);
  progressHideTimer = setTimeout(() => {
    progress.update((p) => ({ ...p, visible: false }));
  }, delay);
}
export function progressError(msg) {
  clearTimeout(progressHideTimer);
  progress.set({ visible: true, title: msg, pct: 1, error: true });
  progressHideTimer = setTimeout(() => {
    progress.update((p) => ({ ...p, visible: false }));
  }, 2500);
}

/** UI: ephemeral toast. */
export const toast = writable({ visible: false, message: '' });
let toastTimer = null;
export function showToast(message, ms = 3500) {
  toast.set({ visible: true, message });
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.set({ visible: false, message: '' }), ms);
}
