import { TextureLoader, SRGBColorSpace } from 'three';
import { showProgress, hideProgress, progressError } from './stores.js';

// jsDelivr mirrors the three.js GitHub repo and always serves CORS headers.
// NASA Visible Earth is a reliable public-domain fallback for higher tiers.
// All sources are equirectangular (2:1) Earth daymaps served with CORS.
export const TEXTURE_TIERS = {
  '2k': {
    label: '2K',
    size: 2048,
    urls: [
      'https://cdn.jsdelivr.net/gh/mrdoob/three.js/examples/textures/planets/earth_atmos_2048.jpg',
      'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg'
    ]
  },
  '4k': {
    label: '4K',
    size: 4096,
    urls: [
      'https://cdn.jsdelivr.net/gh/turban/webgl-earth@master/images/2_no_clouds_4k.jpg'
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

export const TIER_ORDER = ['2k', '4k', '8k'];

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
