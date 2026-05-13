<script>
  import { onMount } from 'svelte';
  import { CONTINENTS, CONTINENT_CENTROIDS } from './continents.js';
  import { getAllCountries } from './api.js';
  import { parseCoords } from './coords.js';
  import {
    resolutionMode, moveCamera, showToast, showBorders
  } from './stores.js';
  import { selectAt, selectCountryByCode, clearSelection } from './selection.js';

  let continent = $state('Europe');
  let countryCode = $state('');
  let resolution = $state('2k');
  let coordsInput = $state('');
  let countries = $state([]);
  let loading = $state(true);
  let borders = $state(false);

  async function loadCountries(forContinent) {
    loading = true;
    try {
      const all = await getAllCountries();
      countries = all
        .filter((c) => Array.isArray(c.continents) && c.continents.includes(forContinent))
        .sort((a, b) => a.name.common.localeCompare(b.name.common));
    } catch {
      countries = [];
    } finally {
      loading = false;
    }
  }

  // Initial load — inside onMount so Svelte 5 doesn't warn about
  // capturing the initial $state value outside a reactive context.
  onMount(() => loadCountries(continent));

  function onContinentChange() {
    countryCode = '';
    const c = CONTINENT_CENTROIDS[continent];
    if (c) moveCamera(c.lat, c.lon, 3.0);
    clearSelection();
    loadCountries(continent);
  }

  function onCountryChange() {
    if (!countryCode) return;
    selectCountryByCode(countryCode);
  }

  function onResolutionChange() {
    resolutionMode.set(resolution);
  }

  function onBordersChange() {
    showBorders.set(borders);
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

<div class="controls">
  <div class="group">
    <label for="continent">Continent</label>
    <select id="continent" bind:value={continent} onchange={onContinentChange}>
      {#each CONTINENTS as c}
        <option value={c}>{c}</option>
      {/each}
    </select>
  </div>

  <div class="group">
    <label for="country">Country</label>
    <select id="country" bind:value={countryCode} onchange={onCountryChange} disabled={loading}>
      {#if loading}
        <option>Loading…</option>
      {:else}
        <option value="">— Select a country —</option>
        {#each countries as c}
          <option value={c.cca2}>{c.flag || ''} {c.name.common}</option>
        {/each}
      {/if}
    </select>
  </div>

  <div class="group">
    <label for="resolution">Map Texture</label>
    <select id="resolution" bind:value={resolution} onchange={onResolutionChange}>
      <option value="2k">Blue Marble Atmos (low — 2K)</option>
      <option value="4k">Blue Marble Clear (high — 4K)</option>
      <option value="8k">Solar System Scope (ultra — 8K)</option>
    </select>
  </div>

  <div class="group">
    <label for="borders">Overlay</label>
    <label class="toggle" for="borders">
      <input id="borders" type="checkbox" bind:checked={borders} onchange={onBordersChange} />
      <span>Country borders</span>
    </label>
  </div>

  <div class="group wide">
    <label for="coords">Coordinates</label>
    <div class="row">
      <input
        id="coords"
        type="text"
        bind:value={coordsInput}
        onkeydown={onCoordsKey}
        placeholder="48.8566, 2.3522   or   48°51'N 2°21'E"
      />
      <button class="go" onclick={goCoords}>Go</button>
    </div>
  </div>
</div>

<style>
  .controls {
    position: absolute; top: 16px; left: 16px; right: 16px;
    display: flex; gap: 12px; flex-wrap: wrap; align-items: flex-end;
    background: rgba(10, 14, 24, 0.72);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 14px; padding: 14px;
    z-index: 10;
  }
  .group { display: flex; flex-direction: column; gap: 6px; min-width: 150px; }
  .group.wide { flex: 1; min-width: 260px; }
  label {
    font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em;
    color: #8b96b3; font-weight: 600;
  }
  select, input {
    background: rgba(20, 26, 40, 0.92);
    border: 1px solid rgba(255,255,255,0.1);
    color: #e6e6e6;
    padding: 9px 11px; border-radius: 8px; font-size: 13px;
    outline: none; transition: border-color .15s, box-shadow .15s;
  }
  select:focus, input:focus {
    border-color: #5e8df0;
    box-shadow: 0 0 0 3px rgba(94,141,240,0.18);
  }
  .row { display: flex; gap: 6px; }
  .row input { flex: 1; min-width: 0; }
  .go {
    background: #2d5cc0; color: white; border: none; border-radius: 8px;
    padding: 0 16px; font-weight: 600; cursor: pointer;
    transition: background .15s; font-size: 13px;
  }
  .go:hover { background: #3a6dd6; }
  .go:active { background: #244ea8; }
  .toggle {
    display: flex; align-items: center; gap: 8px;
    padding: 9px 11px; border-radius: 8px;
    background: rgba(20, 26, 40, 0.92);
    border: 1px solid rgba(255,255,255,0.1);
    color: #e6e6e6; font-size: 13px; cursor: pointer;
    text-transform: none; letter-spacing: normal; font-weight: normal;
  }
  .toggle input { margin: 0; cursor: pointer; accent-color: #5e8df0; }
</style>
