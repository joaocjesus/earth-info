<script>
  import { vectorScale, textureQuality, currentTier } from './stores.js';
  import {
    marineUrl, countriesUrl, isMarineCached, isCountriesCached
  } from './marinePolys.js';
  import { fetchCachedJson, clearVectorCache } from './geojsonCache.js';
  import { clearApiCaches } from './api.js';
  import { trapFocus } from './focusTrap.js';

  let { open, onClose } = $props();

  const SCALES = [
    { value: '110m', label: '110m — Low detail',
      note: 'Smallest download (~750 KB total). Coarse coastlines, major seas only.' },
    { value: '50m',  label: '50m — Medium detail',
      note: 'Balanced (~2.5 MB total). Most islands and named seas.' },
    { value: '10m',  label: '10m — High detail',
      note: 'Heavy (~30 MB total). Every small island, richest sea names.' }
  ];

  let cached = $state(new Set());
  let busy = $state(null);          // scale currently downloading
  let progress = $state(0);         // 0-100 for current download
  let indeterminate = $state(false); // true if no content-length
  let clearing = $state(false);
  let error = $state(null);

  async function refreshCached() {
    const set = new Set();
    for (const s of SCALES) {
      const [a, b] = await Promise.all([
        isCountriesCached(s.value),
        isMarineCached(s.value)
      ]);
      if (a && b) set.add(s.value);
    }
    cached = set;
    // If the active scale isn't cached but 110m is, fall back so the UI
    // doesn't show a row that's "selected" yet uncached.
    if ($vectorScale !== '110m' && !set.has($vectorScale) && set.has('110m')) {
      vectorScale.set('110m');
    }
  }
  $effect(() => { if (open) refreshCached(); });

  async function fetchScale(scale, { select: doSelect = false } = {}) {
    if (busy) return;
    busy = scale;
    progress = 0;
    indeterminate = false;
    error = null;

    const parts = [{ loaded: 0, total: 0 }, { loaded: 0, total: 0 }];
    const recompute = () => {
      const totalAll  = parts[0].total  + parts[1].total;
      const loadedAll = parts[0].loaded + parts[1].loaded;
      if (totalAll > 0) {
        indeterminate = false;
        progress = Math.min(100, Math.round((loadedAll / totalAll) * 100));
      } else {
        indeterminate = true;
      }
    };
    const onProg = (i) => (l, t) => { parts[i] = { loaded: l, total: t }; recompute(); };

    try {
      await Promise.all([
        fetchCachedJson(countriesUrl(scale), onProg(0)),
        fetchCachedJson(marineUrl(scale),    onProg(1))
      ]);
      if (doSelect) vectorScale.set(scale);
      await refreshCached();
    } catch (err) {
      console.error('scale download failed', err);
      error = err?.message || String(err);
    } finally {
      busy = null;
      progress = 0;
      indeterminate = false;
    }
  }

  function download(scale) { fetchScale(scale, { select: true }); }
  function select(scale) {
    if (busy) return;
    vectorScale.set(scale);
  }

  async function clearAll() {
    clearing = true;
    try {
      await clearVectorCache();
      await refreshCached();
    } finally {
      clearing = false;
    }
    // Smallest scale should always be cached. Re-fetch silently after clear.
    if (!cached.has('110m') && !busy) fetchScale('110m');
  }

  /** Map data plus cached country facts and geocoding results. */
  async function clearEverything() {
    clearApiCaches();
    await clearAll();
  }

  function close() { onClose?.(); }
  function onKey(e) { if (e.key === 'Escape' && open) close(); }
</script>

<svelte:window onkeydown={onKey} />

{#if open}
  <div
    class="backdrop"
    onclick={(e) => { if (e.target === e.currentTarget) close(); }}
    role="presentation"
  >
    <div
      class="dialog"
      use:trapFocus
      role="dialog"
      aria-modal="true"
      aria-label="Settings"
      tabindex="-1"
    >
      <header>
        <h2>Settings</h2>
        <button class="x" onclick={close} aria-label="Close">×</button>
      </header>

      <section>
        <h3>Graphics quality</h3>
        <p class="muted">
          Same Earth imagery in both modes — only sharpness and download
          size differ.
        </p>
        <div class="scales">
          <label class="scale choice-row" class:active={$textureQuality === 'auto'}>
            <input type="radio" name="quality" value="auto" bind:group={$textureQuality} />
            <div class="scale-body">
              <div class="scale-title">Auto — sharp 8K</div>
              <div class="scale-note">
                Quick 2K preview, then the full 8K texture (~5 MB) loads in
                the background.
              </div>
            </div>
          </label>
          <label class="scale choice-row" class:active={$textureQuality === 'low'}>
            <input type="radio" name="quality" value="low" bind:group={$textureQuality} />
            <div class="scale-body">
              <div class="scale-title">Lite — 2K only</div>
              <div class="scale-note">
                Lightest on memory and GPU. Best for low-spec machines.
              </div>
            </div>
          </label>
        </div>
        <p class="muted tier">
          Currently shown: {$currentTier ? $currentTier.toUpperCase() : 'loading…'}
        </p>
      </section>

      <section>
        <h3>Vector data detail</h3>
        <p class="muted">
          Controls Natural Earth resolution for country borders and ocean
          classification. Downloaded data is cached locally for offline use.
        </p>

        <div class="scales">
          {#each SCALES as s}
            {@const isActive = $vectorScale === s.value}
            {@const isCached = cached.has(s.value)}
            {@const isBusy = busy === s.value}
            <div class="scale" class:active={isActive}>
              <div class="scale-body">
                <div class="scale-title">{s.label}</div>
                <div class="scale-note">{s.note}</div>
              </div>
              <div class="scale-action">
                {#if isBusy}
                  <button
                    class="btn downloading"
                    style="--progress: {indeterminate ? 100 : progress}%"
                    aria-busy="true"
                    disabled
                  >
                    <span class="lbl">
                      {indeterminate ? 'Downloading…' : `Downloading ${progress}%`}
                    </span>
                  </button>
                {:else if isCached && isActive}
                  <span class="state">Selected</span>
                {:else if isCached}
                  <button class="btn select" onclick={() => select(s.value)} disabled={!!busy}>
                    Select
                  </button>
                {:else if s.value === '110m'}
                  <button class="btn" disabled>Preparing…</button>
                {:else}
                  <button class="btn download" onclick={() => download(s.value)} disabled={!!busy}>
                    Download
                  </button>
                {/if}
              </div>
            </div>
          {/each}
        </div>

        {#if error}
          <div class="err">Couldn't download: {error}</div>
        {/if}

        <div class="footer">
          <button class="mini" onclick={clearAll} disabled={clearing || !!busy}>
            Clear cached map data
          </button>
          <button class="mini danger" onclick={clearEverything} disabled={clearing || !!busy}>
            Clear all cache
          </button>
        </div>
      </section>
    </div>
  </div>
{/if}

<style>
  .backdrop {
    position: fixed; inset: 0; background: rgba(0,0,0,0.55);
    display: flex; align-items: center; justify-content: center;
    z-index: 100; backdrop-filter: blur(4px);
  }
  .dialog {
    background: rgba(14, 18, 30, 0.96);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 14px;
    max-width: 560px; width: calc(100% - 32px);
    max-height: 85vh; overflow: auto;
    color: #e6e6e6;
    box-shadow: 0 30px 80px rgba(0,0,0,0.5);
  }
  header {
    display: flex; justify-content: space-between; align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid rgba(255,255,255,0.08);
  }
  h2 { margin: 0; font-size: 16px; font-weight: 600; letter-spacing: 0.02em; }
  h3 {
    margin: 4px 0 6px;
    font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em;
    color: #8b96b3; font-weight: 600;
  }
  section { padding: 16px 20px 20px; font-size: 13px; line-height: 1.55; }
  section + section { border-top: 1px solid rgba(255,255,255,0.07); }
  .muted { color: #8b96b3; margin: 0 0 14px; }
  .muted.tier { margin: 10px 0 0; font-size: 12px; }
  .choice-row { cursor: pointer; }
  .choice-row input {
    margin: 0 2px 0 0; cursor: pointer; accent-color: #5e8df0; flex-shrink: 0;
  }

  .scales { display: flex; flex-direction: column; gap: 8px; }
  .scale {
    display: flex; align-items: center; gap: 12px;
    padding: 12px 14px; border-radius: 10px;
    background: rgba(20, 26, 40, 0.7);
    border: 1px solid rgba(255,255,255,0.08);
  }
  .scale.active { border-color: #5e8df0; background: rgba(94,141,240,0.1); }
  .scale-body { flex: 1; min-width: 0; }
  .scale-title { font-weight: 600; margin-bottom: 4px; }
  .scale-note { color: #8b96b3; font-size: 12px; }
  .scale-action { flex-shrink: 0; min-width: 110px; text-align: right; }
  .state {
    font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em;
    color: #74e29a; font-weight: 600;
  }

  .btn {
    font-size: 12px; padding: 7px 14px; border-radius: 8px;
    font-weight: 600; cursor: pointer; min-width: 110px;
    transition: background .15s, border-color .15s;
  }
  .btn:disabled:not(.downloading) { opacity: 0.6; cursor: not-allowed; }
  .btn.download {
    background: #2d5cc0; color: white; border: 1px solid #2d5cc0;
  }
  .btn.download:hover:not(:disabled) { background: #3a6dd6; border-color: #3a6dd6; }
  .btn.select {
    background: rgba(94,141,240,0.15); color: #b9cdf5;
    border: 1px solid rgba(94,141,240,0.45);
  }
  .btn.select:hover:not(:disabled) { background: rgba(94,141,240,0.28); }

  .btn.downloading {
    position: relative; overflow: hidden;
    background: rgba(94,141,240,0.15); color: #cfe0ff;
    border: 1px solid rgba(94,141,240,0.6);
    cursor: progress; opacity: 1;
  }
  .btn.downloading::before {
    content: ''; position: absolute; inset: 0;
    width: var(--progress, 0%);
    background: linear-gradient(90deg,
      rgba(94,141,240,0.45) 0%,
      rgba(94,141,240,0.65) 100%);
    transition: width .12s linear;
  }
  .btn.downloading .lbl {
    position: relative; z-index: 1;
    display: inline-flex; align-items: center; gap: 6px;
  }
  .btn.downloading .lbl::before {
    content: ''; display: inline-block;
    width: 8px; height: 8px; border-radius: 50%;
    background: #b9cdf5;
    animation: pulse 1s ease-in-out infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 0.35; transform: scale(0.8); }
    50%      { opacity: 1;    transform: scale(1.1); }
  }

  .err { color: #ff7e7e; font-size: 12px; margin-top: 10px; }

  .mini {
    font-size: 12px; padding: 6px 10px; border-radius: 6px;
    background: rgba(255,255,255,0.06); color: #b8c2d8;
    border: 1px solid rgba(255,255,255,0.15); cursor: pointer;
  }
  .mini:hover:not(:disabled) { background: rgba(255,255,255,0.12); }
  .mini:disabled { opacity: 0.5; cursor: not-allowed; }
  .mini.danger {
    background: rgba(255,126,126,0.12); color: #ffb0b0;
    border-color: rgba(255,126,126,0.35);
  }
  .mini.danger:hover:not(:disabled) { background: rgba(255,126,126,0.2); }

  .footer { margin-top: 16px; display: flex; justify-content: flex-end; gap: 8px; }
  .x {
    background: transparent; border: none; color: #8b96b3;
    font-size: 24px; line-height: 1; cursor: pointer; padding: 0 4px;
  }
  .x:hover { color: #e6e6e6; }
</style>
