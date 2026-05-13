<script>
  import { selection } from './stores.js';
  import { formatCoords } from './coords.js';
  import { clearSelection } from './selection.js';

  let sel = $state(null);
  selection.subscribe((v) => (sel = v));

  function fmtNum(n, suffix = '') {
    if (n == null || isNaN(n)) return '—';
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n) + suffix;
  }

  let visible = $derived(sel !== null);
</script>

<aside class="card" class:visible>
  {#if sel}
    {#if sel.status === 'loading'}
      <div class="coords">{formatCoords(sel.lat, sel.lon)}</div>
      <div class="loading">Looking up location…</div>
    {:else if sel.status === 'ocean'}
      <div class="coords">{formatCoords(sel.lat, sel.lon)}</div>
      <h2>Open ocean</h2>
      <div class="dim">No country at this point.</div>
    {:else if sel.status === 'error'}
      <div class="coords">{formatCoords(sel.lat, sel.lon)}</div>
      <div class="err">Couldn't load location info: {sel.error}</div>
    {:else if sel.status === 'ready' && sel.country}
      {@const c = sel.country}
      {@const pop = c.population}
      {@const area = c.area}
      {@const density = (pop && area) ? pop / area : null}
      <div class="flag">{c.flag || ''}</div>
      <h2>{c.name?.common || 'Unknown'}</h2>
      <div class="coords">{formatCoords(sel.lat, sel.lon)}</div>
      {#if sel.cityHint}<div class="city">{sel.cityHint}</div>{/if}
      <dl class="facts">
        <dt>Capital</dt><dd>{c.capital?.[0] || '—'}</dd>
        <dt>Region</dt><dd>{c.region || '—'}</dd>
        <dt>Population</dt><dd>{fmtNum(pop)}</dd>
        <dt>Area</dt><dd>{fmtNum(area, ' km²')}</dd>
        <dt>Density</dt><dd>{density != null ? fmtNum(density, ' /km²') : '—'}</dd>
      </dl>
    {/if}
    <button class="close" aria-label="Close" onclick={clearSelection}>×</button>
  {/if}
</aside>

<style>
  .card {
    position: absolute; bottom: 16px; left: 16px;
    width: 320px; max-width: calc(100vw - 32px);
    background: rgba(10, 14, 24, 0.82);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 14px;
    padding: 18px 20px 16px;
    z-index: 10;
    opacity: 0;
    transform: translateY(8px);
    transition: opacity .25s ease, transform .25s ease;
    pointer-events: none;
  }
  .card.visible { opacity: 1; transform: translateY(0); pointer-events: auto; }
  .flag { font-size: 30px; line-height: 1; margin-bottom: 4px; }
  h2 { font-size: 19px; margin: 0 0 4px; font-weight: 600; }
  .coords {
    font-size: 12px; color: #8b96b3; margin-bottom: 12px;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  }
  .city {
    font-size: 12px; color: #8b96b3; margin-top: -6px; margin-bottom: 10px;
  }
  .facts {
    display: grid; grid-template-columns: auto 1fr;
    gap: 6px 14px; font-size: 13px; margin: 0;
  }
  dt { color: #8b96b3; }
  dd { color: #e6e6e6; margin: 0; }
  .loading { color: #8b96b3; font-style: italic; font-size: 13px; }
  .dim { color: #8b96b3; font-size: 13px; }
  .err { color: #ff7e7e; font-size: 13px; }
  .close {
    position: absolute; top: 8px; right: 12px; background: none; border: none;
    color: #8b96b3; cursor: pointer; font-size: 20px; line-height: 1;
    padding: 4px 6px; border-radius: 6px;
  }
  .close:hover { color: #fff; background: rgba(255,255,255,0.06); }
</style>
