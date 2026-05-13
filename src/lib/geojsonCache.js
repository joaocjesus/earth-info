// Persistent cache for fetched geojson, backed by the browser Cache Storage
// API. Works offline once a URL has been hit. Falls back to plain fetch (no
// persistence) if Cache Storage is unavailable.
//
// Bodies are validated as JSON before being stored, and corrupt cached
// entries are evicted and refetched.

const CACHE_NAME = 'earthinfo-vectors-v1';

async function openCache() {
  if (typeof caches === 'undefined') return null;
  try { return await caches.open(CACHE_NAME); } catch { return null; }
}

async function readCached(cache, url) {
  const hit = await cache.match(url);
  if (!hit) return null;
  try {
    const text = await hit.text();
    return JSON.parse(text);
  } catch (err) {
    console.warn('corrupt cached entry, evicting', url, err);
    try { await cache.delete(url); } catch {}
    return null;
  }
}

/**
 * @param {string} url
 * @param {(loaded: number, total: number) => void} [onProgress]
 *   Called with byte counts while streaming. total may be 0 if the server
 *   doesn't send a Content-Length header.
 */
export async function fetchCachedJson(url, onProgress) {
  const cache = await openCache();
  if (cache) {
    const data = await readCached(cache, url);
    if (data) {
      onProgress?.(1, 1);
      return data;
    }
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fetch failed ${res.status} ${url}`);
  const text = await streamToText(res, onProgress);
  let data;
  try { data = JSON.parse(text); }
  catch (err) { throw new Error(`invalid JSON from ${url}: ${err.message}`); }
  if (cache) {
    try {
      const fresh = new Response(text, {
        headers: { 'Content-Type': 'application/geo+json' }
      });
      await cache.put(url, fresh);
    } catch (err) {
      console.warn('cache put failed', err);
    }
  }
  return data;
}

async function streamToText(res, onProgress) {
  const total = Number(res.headers.get('content-length')) || 0;
  if (!res.body || typeof res.body.getReader !== 'function') {
    const text = await res.text();
    onProgress?.(text.length, total || text.length);
    return text;
  }
  const reader = res.body.getReader();
  const chunks = [];
  let loaded = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    chunks.push(value);
    loaded += value.byteLength;
    onProgress?.(loaded, total);
  }
  const blob = new Blob(chunks);
  return await blob.text();
}

export async function isCached(url) {
  const cache = await openCache();
  if (!cache) return false;
  const hit = await cache.match(url);
  return !!hit;
}

export async function clearVectorCache() {
  if (typeof caches === 'undefined') return;
  try { await caches.delete(CACHE_NAME); } catch (err) { console.warn('cache delete failed', err); }
}
