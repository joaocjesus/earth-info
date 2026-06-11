import { TextureLoader, SRGBColorSpace } from 'three';
import { showProgress, hideProgress, progressError } from './stores.js';

// Both tiers are the same Solar System Scope daymap (CC BY 4.0) so the
// 2K → 8K background upgrade changes sharpness only, never the look.
// The 2K is a byte-identical mirror of solarsystemscope.com's download
// (their server doesn't send CORS headers; the mirror + githack do).
// The three.js example texture is a last-resort fallback — different
// color grading, but better than an untextured globe.
export const TEXTURE_TIERS = {
  '2k': {
    label: '2K',
    size: 2048,
    urls: [
      'https://cdn.jsdelivr.net/gh/matheusflc/SistemaSolar@master/texturas/2k_earth_daymap.jpg',
      'https://rawcdn.githack.com/matheusflc/SistemaSolar/master/texturas/2k_earth_daymap.jpg',
      'https://cdn.jsdelivr.net/gh/mrdoob/three.js/examples/textures/planets/earth_atmos_2048.jpg'
    ]
  },
  '8k': {
    label: '8K',
    size: 8192,
    urls: [
      'https://upload.wikimedia.org/wikipedia/commons/0/04/Solarsystemscope_texture_8k_earth_daymap.jpg'
    ]
  }
};

const cache = new Map(); // tier -> Promise<Texture>
const loader = new TextureLoader();
loader.setCrossOrigin('anonymous');

function loadOne(url) {
  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (tex) => {
        tex.colorSpace = SRGBColorSpace;
        resolve(tex);
      },
      // TextureLoader never reports progress (ImageLoader limitation),
      // so the progress UI runs in indeterminate mode instead.
      undefined,
      () => reject(new Error(`failed to load ${url}`))
    );
  });
}

export function getTexture(tier) {
  if (cache.has(tier)) return cache.get(tier);
  const cfg = TEXTURE_TIERS[tier];
  if (!cfg) throw new Error(`unknown tier ${tier}`);

  const p = (async () => {
    let lastErr;
    for (const url of cfg.urls) {
      try {
        showProgress(`Loading ${cfg.label} texture…`);
        const tex = await loadOne(url);
        hideProgress(200);
        return tex;
      } catch (err) {
        lastErr = err;
        console.warn('texture URL failed', url, err);
      }
    }
    progressError(`Failed to load ${cfg.label}`);
    throw lastErr || new Error('all sources failed');
  })();

  cache.set(tier, p);
  p.catch(() => cache.delete(tier));
  return p;
}

/** Drop a tier from the cache (call after disposing its texture). */
export function evictTexture(tier) {
  cache.delete(tier);
}
