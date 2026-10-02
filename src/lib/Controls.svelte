<script>
  import Icon from './Icon.svelte';
  import { onMount } from 'svelte';
  import { CONTINENTS, CONTINENT_CENTROIDS } from './continents.js';
  import { getAllCountries } from './api.js';
  import { parseCoords } from './coords.js';
  import {
    moveCamera, showToast, showBorders, showOceanBorders
  } from './stores.js';
  import { selectAt, selectCountryByCode, clearSelection } from './selection.js';

  let continent = $state('all');
  let countryCode = $state('');
  let coordsInput = $state('');
  let countries = $state([]);
  let loading = $state(true);

  async function loadCountries(forContinent) {
    loading = true;
    try {
      const all = await getAllCountries();
      countries = all
        .filter((c) => forContinent === 'all'
          || (Array.isArray(c.continents) && c.continents.includes(forContinent)))
        .sort((a, b) => a.name.common.localeCompare(b.name.common));
    } catch {
      countries = [];
      showToast('Couldn’t load the country list. Check your connection and retry.');
    } finally {
      loading = false;
    }
  }

  // Initial load — inside onMount so Svelte 5 doesn't warn about
  // capturing the initial $state value outside a reactive context.
  onMount(() => loadCountries(continent));

  function onContinentChange() {
    countryCode = '';
    if (continent !== 'all') {
      const c = CONTINENT_CENTROIDS[continent];
      if (c) moveCamera(c.lat, c.lon, 3.0);
    }
    clearSelection();
    loadCountries(continent);
  }

  function onCountryChange() {
    if (!countryCode) return;
    selectCountryByCode(countryCode);
  }

  function goCoords() {
    const parsed = parseCoords(coordsInput);
    if (!parsed) {
      showToast('Couldn’t parse coordinates. Try: 48.8566, 2.3522  or  48°51′N 2°21′E');
      return;
    }
    moveCamera(parsed.lat, parsed.lon, 2.5);
    selectAt(parsed.lat, parsed.lon);
  }

  function onCoordsKey(e) {
    if (e.key === 'Enter') goCoords();
  }
</script>

<section>
  <div class="section-title"><h3>Find a place</h3><Icon name="compass" size={16} /></div>
  <p class="intro">Somewhere familiar. Somewhere new.</p>
  <div class="group">
    <label for="continent">Continent</label>
    <div class="select-wrap">
      <select id="continent" bind:value={continent} onchange={onContinentChange}>
        <option value="all">All continents</option>
        {#each CONTINENTS as c}<option value={c}>{c}</option>{/each}
      </select>
      <span class="select-chevron"><Icon name="chevron" size={14} /></span>
    </div>
  </div>
  <div class="group">
    <label for="country">Country or territory</label>
    <div class="select-wrap">
      <select id="country" bind:value={countryCode} onchange={onCountryChange} disabled={loading}>
        {#if loading}<option>Loading places…</option>
        {:else}
          <option value="">Choose a destination</option>
          {#each countries as c}<option value={c.cca2}>{c.flag || ''} {c.name.common}</option>{/each}
        {/if}
      </select>
      <span class="select-chevron"><Icon name="chevron" size={14} /></span>
    </div>
  </div>
  <div class="group">
    <label for="coords">Coordinates <span>Latitude, longitude</span></label>
    <div class="row">
      <input id="coords" type="text" bind:value={coordsInput} onkeydown={onCoordsKey} placeholder="48.8566, 2.3522" spellcheck="false" />
      <button class="go" onclick={goCoords} aria-label="Go to coordinates" title="Go to coordinates"><Icon name="arrow" size={19} /></button>
    </div>
  </div>
</section>

<section class="layers">
  <div class="section-title"><h3>Map layers</h3><Icon name="layers" size={16} /></div>
  <label class="toggle" for="borders">
    <span class="layer-key land"></span><span class="toggle-label">Country borders</span>
    <input id="borders" type="checkbox" bind:checked={$showBorders} />
    <span class="switch" aria-hidden="true"></span>
  </label>
  <label class="toggle" for="ocean-borders">
    <span class="layer-key ocean"></span><span class="toggle-label">Ocean boundaries</span>
    <input id="ocean-borders" type="checkbox" bind:checked={$showOceanBorders} />
    <span class="switch" aria-hidden="true"></span>
  </label>
</section>

<style>
  section { padding: 22px 0; border-bottom: 1px solid var(--line); }
  .section-title { display: flex; align-items: center; justify-content: space-between; color: var(--subtle); margin-bottom: 14px; }
  h3 { margin: 0; font-size: 10px; text-transform: uppercase; letter-spacing: .14em; color: var(--muted); font-weight: 600; }
  .intro { margin: -3px 0 20px; font-size: 12px; line-height: 1.5; color: var(--muted); }
  .group { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
  .group:last-child { margin-bottom: 0; }
  label { font-size: 11px; color: #c3d0d8; font-weight: 500; }
  label > span:not(.toggle-label, .switch, .layer-key) { float: right; color: var(--subtle); font-size: 10px; font-weight: 400; }
  select, input[type="text"] { width: 100%; background: var(--surface-raised); border: 1px solid var(--line); color: var(--text); padding: 12px; border-radius: 9px; font-size: 12px; transition: border-color .15s, background .15s; }
  select { appearance: none; padding-right: 32px; cursor: pointer; }
  select:disabled { cursor: wait; opacity: .6; }
  select:hover, input[type="text"]:hover { border-color: #3a535f; }
  select:focus, input[type="text"]:focus { border-color: var(--accent); }
  input::placeholder { color: var(--subtle); }
  .select-wrap { position: relative; }
  .select-chevron { position: absolute; right: 12px; top: 50%; transform: translateY(-50%) rotate(-90deg); display: flex; color: var(--muted); pointer-events: none; }
  .row { display: flex; gap: 8px; }
  .row input { flex: 1; min-width: 0; font: 11px var(--mono); }
  .go { display: grid; place-items: center; width: 42px; flex-shrink: 0; background: var(--accent); color: #122d25; border: 1px solid transparent; border-radius: 9px; cursor: pointer; transition: background .15s; }
  .go:hover { background: #bdf1e1; }
  .go:active { background: #7ccab5; }
  .layers { padding: 20px 0 16px; }
  .layers .section-title { margin-bottom: 10px; }
  .toggle { position: relative; display: flex; align-items: center; gap: 10px; min-height: 40px; color: #d2dee5; font-size: 12px; font-weight: 400; cursor: pointer; }
  .toggle-label { flex: 1; }
  .layer-key { width: 13px; height: 9px; border: 1px solid #e4bb70; border-radius: 2px; }
  .layer-key.ocean { border-color: #7ad7ff; border-style: dashed; }
  .toggle input { position: absolute; right: 0; opacity: 0; width: 34px; height: 22px; margin: 0; cursor: pointer; }
  .switch { width: 32px; height: 18px; background: #263642; border: 1px solid #40515d; border-radius: 12px; pointer-events: none; transition: background .2s; }
  .switch::after { content: ''; display: block; width: 10px; height: 10px; margin: 3px; background: #acbac4; border-radius: 50%; transition: transform .2s, background .2s; }
  .toggle input:checked + .switch { background: var(--accent); border-color: var(--accent); }
  .toggle input:checked + .switch::after { background: #17362c; transform: translateX(13px); }
  .toggle input:focus-visible + .switch { outline: 2px solid var(--accent); outline-offset: 4px; }
  @media (max-width: 700px), (max-width: 900px) and (orientation: portrait) { section { padding: 18px 0; } select, input[type="text"] { min-height: 44px; font-size: 16px; } .row input { font-size: 14px; } .toggle { min-height: 44px; } }
</style>
