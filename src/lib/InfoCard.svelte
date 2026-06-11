<script>
  import { selection } from './stores.js';
  import { formatCoords } from './coords.js';
  import { clearSelection } from './selection.js';

  let sel = $derived($selection);

  function fmtNum(n, suffix = '') {
    if (n == null || isNaN(n)) return '—';
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n) + suffix;
  }
</script>

<section>
  <h3>Location</h3>

  {#if sel}
    <div class="card">
      {#if sel.status === 'loading'}
        <div class="coords">{formatCoords(sel.lat, sel.lon)}</div>
        <div class="loading">Looking up location…</div>
      {:else if sel.status === 'ocean'}
        {@const o = sel.ocean}
        <div class="emblem">🌊</div>
        <h2>{o?.name || 'Open ocean'}</h2>
        <div class="coords">{formatCoords(sel.lat, sel.lon)}</div>
        {#if o?.parent}<div class="sub">Part of the {o.parent}.</div>
        {:else if o?.info}<div class="sub">{o.info}</div>{/if}
        {#if o && (o.area || o.avgDepthM || o.maxDepthM)}
          <dl class="facts">
            {#if o.area}<dt>Area</dt><dd>{fmtNum(o.area, ' km²')}</dd>{/if}
            {#if o.avgDepthM}<dt>Avg depth</dt><dd>{fmtNum(o.avgDepthM, ' m')}</dd>{/if}
            {#if o.maxDepthM}<dt>Max depth</dt><dd>{fmtNum(o.maxDepthM, ' m')}</dd>{/if}
            {#if o.maxDepthName}<dt>Deepest</dt><dd>{o.maxDepthName}</dd>{/if}
          </dl>
        {:else if !o}
          <div class="dim">No country at this point.</div>
        {/if}
        {#if sel.verifying}
          <div class="verify"><span class="spinner"></span> Checking for nearby land…</div>
        {/if}
      {:else if sel.status === 'error'}
        <div class="coords">{formatCoords(sel.lat, sel.lon)}</div>
        <div class="err">Couldn't load location info: {sel.error}</div>
      {:else if sel.status === 'ready' && sel.country}
        {@const c = sel.country}
        {@const pop = c.population}
        {@const area = c.area}
        {@const density = (pop && area) ? pop / area : null}
        {@const island = sel.islandHint}
        {@const countryName = c.name?.common || 'Unknown'}
        <div class="emblem">{c.flag || ''}</div>
        <h2>{island || countryName}</h2>
        <div class="coords">{formatCoords(sel.lat, sel.lon)}</div>
        {#if island}
          <div class="sub">Part of {countryName}{sel.cityHint ? ` · ${sel.cityHint}` : ''}</div>
        {:else if sel.cityHint}
          <div class="sub">{sel.cityHint}</div>
        {/if}
        <dl class="facts">
          {#if island}<dt>Country</dt><dd>{countryName}</dd>{/if}
          <dt>Capital</dt><dd>{c.capital?.[0] || '—'}</dd>
          <dt>Region</dt><dd>{c.region || '—'}</dd>
          <dt>Population</dt><dd>{fmtNum(pop)}</dd>
          <dt>Area</dt><dd>{fmtNum(area, ' km²')}</dd>
          <dt>Density</dt><dd>{density != null ? fmtNum(density, ' /km²') : '—'}</dd>
        </dl>
        {#if sel.locating}
          <div class="verify"><span class="spinner"></span> Looking up local details…</div>
        {/if}
      {/if}
      <button class="close" aria-label="Clear selection" onclick={clearSelection}>×</button>
    </div>
  {:else}
    <p class="placeholder">
      Click the globe — or pick a country above — and details show up here.
    </p>
  {/if}
</section>

<style>
  section { padding: 14px 0 16px; }
  h3 {
    margin: 0 0 10px;
    font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em;
    color: #6f7a96; font-weight: 600;
  }
  .placeholder {
    margin: 0; font-size: 12.5px; line-height: 1.6; color: #5e6a85;
  }
  .card {
    position: relative;
    background: rgba(20, 26, 40, 0.65);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 14px 16px 14px;
    animation: rise 0.25s ease;
  }
  @keyframes rise {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .emblem { font-size: 28px; line-height: 1; margin-bottom: 6px; }
  h2 { font-size: 18px; margin: 0 0 4px; font-weight: 600; color: #f0f4ff; }
  .coords {
    font-size: 11.5px; color: #8b96b3; margin-bottom: 10px;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  }
  .sub { font-size: 12px; color: #8b96b3; margin: -4px 0 10px; }
  .facts {
    display: grid; grid-template-columns: auto 1fr;
    gap: 6px 14px; font-size: 12.5px; margin: 0;
  }
  dt { color: #8b96b3; }
  dd { color: #e6e6e6; margin: 0; }
  .loading { color: #8b96b3; font-style: italic; font-size: 13px; }
  .verify {
    display: flex; align-items: center; gap: 7px;
    margin-top: 10px; font-size: 11.5px; color: #6f7a96;
  }
  .spinner {
    width: 11px; height: 11px; flex-shrink: 0;
    border: 2px solid rgba(139, 150, 179, 0.25);
    border-top-color: #8b96b3;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .dim { color: #8b96b3; font-size: 13px; }
  .err { color: #ff7e7e; font-size: 13px; }
  .close {
    position: absolute; top: 6px; right: 10px; background: none; border: none;
    color: #8b96b3; cursor: pointer; font-size: 18px; line-height: 1;
    padding: 4px 6px; border-radius: 6px;
  }
  .close:hover { color: #fff; background: rgba(255, 255, 255, 0.06); }
</style>
