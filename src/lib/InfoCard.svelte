<script>
  import Icon from './Icon.svelte';
  import { selection } from './stores.js';
  import { formatCoords } from './coords.js';
  import { clearSelection } from './selection.js';

  let sel = $derived($selection);

  function fmtNum(n, suffix = '') {
    if (n == null || isNaN(n)) return '—';
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n) + suffix;
  }
</script>

<section aria-live="polite">
  <h3>{sel ? 'Selected location' : 'Let curiosity lead'}</h3>

  {#if sel}
    <div class="card">
      {#if sel.status === 'loading'}
        <div class="coords">{formatCoords(sel.lat, sel.lon)}</div>
        <div class="loading"><span class="spinner"></span> Looking up location…</div><div class="skeleton"></div><div class="skeleton short"></div>
      {:else if sel.status === 'ocean'}
        {@const o = sel.ocean}
        <div class="emblem ocean"><Icon name="waves" size={30} /></div>
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
      <button class="close" aria-label="Clear selection" onclick={clearSelection}><Icon name="close" size={16} /></button>
    </div>
  {:else}
    <div class="placeholder">
      <span class="empty-icon"><Icon name="pin" size={22} /></span>
      <div><h4>Every place has a story.</h4><p>Choose a destination or tap the globe to discover what’s there.</p></div>
    </div>
  {/if}
</section>

<style>
  section { padding: 22px 0; border-bottom: 1px solid var(--line); }
  h3 { margin: 0 0 16px; font-size: 10px; text-transform: uppercase; letter-spacing: .14em; color: var(--muted); font-weight: 600; }
  .placeholder { display: flex; gap: 12px; align-items: flex-start; }
  .empty-icon { width: 36px; height: 40px; display: grid; place-items: center; flex-shrink: 0; color: var(--accent); background: var(--accent-soft); border: 1px solid #9be3cf1a; border-radius: 10px; }
  h4 { margin: 1px 0 6px; color: #d3e0e6; font-size: 12px; font-weight: 500; }
  .placeholder p { margin: 0; font-size: 11px; line-height: 1.7; color: var(--muted); }
  .card { position: relative; animation: rise .25s ease; }
  @keyframes rise { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
  .emblem { font-size: 30px; line-height: 1; margin-bottom: 10px; }
  .emblem.ocean { color: #7ad7ff; }
  h2 { font-size: 25px; line-height: 1.15; margin: 0 26px 9px 0; font-weight: 500; letter-spacing: -.6px; color: var(--text); overflow-wrap: anywhere; }
  .coords { font: 10px var(--mono); color: var(--accent); margin-bottom: 16px; letter-spacing: .015em; }
  .sub { font-size: 12px; color: var(--muted); line-height: 1.6; margin: -4px 0 14px; }
  .facts { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 0 14px; font-size: 12px; margin: 0; }
  dt, dd { padding: 9px 0; border-bottom: 1px solid var(--line); }
  dt:last-of-type, dd:last-of-type { border-bottom: 0; }
  dt { color: var(--muted); }
  dd { color: var(--text); margin: 0; text-align: right; overflow-wrap: anywhere; font-variant-numeric: tabular-nums; }
  .loading { display: flex; align-items: center; gap: 8px; color: var(--muted); font-size: 13px; }
  .skeleton { height: 10px; margin-top: 18px; background: var(--surface-raised); border-radius: 5px; width: 90%; }
  .skeleton.short { width: 60%; margin-top: 10px; }
  .verify { display: flex; align-items: center; gap: 7px; margin-top: 12px; font-size: 11px; color: var(--muted); }
  .spinner { width: 11px; height: 11px; flex-shrink: 0; border: 2px solid #9be3cf33; border-top-color: var(--accent); border-radius: 50%; animation: spin .7s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .dim { color: var(--muted); font-size: 13px; }
  .err { color: #ffb0b0; font-size: 13px; line-height: 1.6; }
  .close { position: absolute; top: -6px; right: -5px; display: grid; place-items: center; width: 32px; height: 32px; background: none; border: 1px solid var(--line); color: var(--muted); cursor: pointer; border-radius: 8px; }
  .close:hover { color: var(--text); background: var(--surface-raised); }
  @media (max-width: 700px), (max-width: 900px) and (orientation: portrait) { .close { width: 40px; height: 40px; } }
</style>
