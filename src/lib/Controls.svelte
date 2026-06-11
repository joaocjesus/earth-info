<script>
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
  let borders = $state(false);
  let oceanBorders = $state(false);

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

  function onBordersChange() {
    showBorders.set(borders);
  }

  function onOceanBordersChange() {
    showOceanBorders.set(oceanBorders);
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
  <h3>Explore</h3>

  <div class="group">
    <label for="continent">Continent</label>
    <select id="continent" bind:value={continent} onchange={onContinentChange}>
      <option value="all">— All —</option>
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
    <label for="coords">Coordinates</label>
    <div class="row">
      <input
        id="coords"
        type="text"
        bind:value={coordsInput}
        onkeydown={onCoordsKey}
        placeholder="48.8566, 2.3522"
      />
      <button class="go" onclick={goCoords}>Go</button>
    </div>
  </div>
</section>

<section>
  <h3>Display</h3>

  <div class="group">
    <label class="toggle" for="borders">
      <input id="borders" type="checkbox" bind:checked={borders} onchange={onBordersChange} />
      <span>Country borders</span>
    </label>
    <label class="toggle" for="ocean-borders">
      <input
        id="ocean-borders"
        type="checkbox"
        bind:checked={oceanBorders}
        onchange={onOceanBordersChange}
      />
      <span>Ocean borders</span>
    </label>
  </div>
</section>

<style>
  section {
    padding: 14px 0 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  }
  h3 {
    margin: 0 0 10px;
    font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em;
    color: #6f7a96; font-weight: 600;
  }
  .group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; }
  .group:last-child { margin-bottom: 0; }
  label {
    font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em;
    color: #8b96b3; font-weight: 600;
  }
  select, input {
    width: 100%; box-sizing: border-box;
    background: rgba(20, 26, 40, 0.92);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #e6e6e6;
    padding: 9px 11px; border-radius: 9px; font-size: 13px;
    outline: none; transition: border-color 0.15s, box-shadow 0.15s;
  }
  select:focus, input:focus {
    border-color: #5e8df0;
    box-shadow: 0 0 0 3px rgba(94, 141, 240, 0.18);
  }
  .row { display: flex; gap: 6px; }
  .row input { flex: 1; min-width: 0; }
  .go {
    background: #2d5cc0; color: white; border: none; border-radius: 9px;
    padding: 0 16px; font-weight: 600; cursor: pointer;
    transition: background 0.15s; font-size: 13px;
  }
  .go:hover { background: #3a6dd6; }
  .go:active { background: #244ea8; }
  .toggle {
    display: flex; align-items: center; gap: 8px;
    padding: 9px 11px; border-radius: 9px;
    background: rgba(20, 26, 40, 0.92);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #e6e6e6; font-size: 13px; cursor: pointer;
    text-transform: none; letter-spacing: normal; font-weight: normal;
  }
  .toggle input {
    width: auto; margin: 0; cursor: pointer; accent-color: #5e8df0;
  }
</style>
