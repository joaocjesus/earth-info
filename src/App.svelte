<script>
  import Icon from './lib/Icon.svelte';
  import Scene from './lib/Scene.svelte';
  import SidePanel from './lib/SidePanel.svelte';
  import ProgressWidget from './lib/ProgressWidget.svelte';
  import Toast from './lib/Toast.svelte';
  import Credits from './lib/Credits.svelte';
  import Settings from './lib/Settings.svelte';
  import QualityDialog from './lib/QualityDialog.svelte';
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { prefetchBase, warmScale } from './lib/marinePolys.js';
  import { vectorScale, qualityChosen, currentTier } from './lib/stores.js';
  import { getAllCountries } from './lib/api.js';

  let panelCollapsed = $state(false);
  let creditsOpen = $state(false);
  let settingsOpen = $state(false);
  let qualityOpen = $state(!get(qualityChosen));

  onMount(async () => {
    getAllCountries().catch(() => {});  // warm country facts early
    await prefetchBase();
    // Warm the active scale now (downloading it on first run) and any scale
    // the user switches to later, so clicks classify from memory.
    vectorScale.subscribe((s) => warmScale(s));
  });
</script>

<main class:panel-collapsed={panelCollapsed}>
  <div class="scene-heading">
    <p class="eyebrow">A closer look at our planet</p>
    <h2>A world to discover.</h2>
  </div>
  <div class="imagery"><span class="status-dot"></span> Satellite imagery <span class="tier">{$currentTier ? $currentTier.toUpperCase() : '…'}</span></div>
  <Scene />
  <SidePanel
    bind:collapsed={panelCollapsed}
    onOpenSettings={() => (settingsOpen = true)}
    onOpenCredits={() => (creditsOpen = true)}
  />
  <ProgressWidget />
  <Toast />
  <div class="hint" aria-label="Globe controls">
    <span><Icon name="rotate" size={15} /> <span class="desktop-hint">Drag to rotate</span><span class="touch-hint">Drag to explore</span></span>
    <span><Icon name="zoom" size={15} /> <span class="desktop-hint">Scroll to zoom</span><span class="touch-hint">Pinch to zoom</span></span>
    <span class="click-hint"><Icon name="pin" size={15} /> Click a place</span>
  </div>
  <Credits open={creditsOpen} onClose={() => (creditsOpen = false)} />
  <Settings open={settingsOpen} onClose={() => (settingsOpen = false)} />
  <QualityDialog
    open={qualityOpen}
    onClose={() => { qualityOpen = false; qualityChosen.set(true); }}
  />
</main>

<style>
  main {
    position: relative; width: 100%; height: 100%; height: 100dvh;
    --scene-left: calc(var(--panel-width) + 64px);
    background: radial-gradient(ellipse at 70% 48%, #11202c 0%, #0b131c 35%, var(--bg) 70%);
  }
  main.panel-collapsed { --scene-left: 28px; }
  .scene-heading { position: absolute; top: 39px; left: var(--scene-left); pointer-events: none; z-index: 2; }
  .eyebrow { color: var(--accent); text-transform: uppercase; font-size: 9px; font-weight: 600; letter-spacing: .18em; margin: 0 0 10px; }
  h2 { font-size: clamp(23px, 2.4vw, 32px); font-weight: 400; letter-spacing: -1px; margin: 0; }
  .imagery { position: absolute; top: 43px; right: 32px; display: flex; align-items: center; gap: 8px; color: var(--muted); font-size: 10px; z-index: 2; }
  .status-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--accent); }
  .tier { border: 1px solid var(--line); border-radius: 4px; padding: 3px 5px; font: 9px var(--mono); }
  .hint { position: absolute; bottom: 34px; left: var(--scene-left); right: 24px; display: flex; align-items: center; justify-content: center; gap: 26px; font-size: 11px; color: var(--muted); pointer-events: none; z-index: 5; }
  .hint > span { display: flex; align-items: center; gap: 7px; }
  .hint :global(svg) { color: var(--subtle); }
  .touch-hint { display: none; }
  .panel-collapsed .scene-heading { left: 230px; }
  @media (max-width: 1050px) { .imagery { top: auto; bottom: 70px; right: 28px; } .hint { gap: 14px; font-size: 10px; } }
  @media (max-width: 700px), (max-width: 900px) and (orientation: portrait) {
    main { --scene-left: 0px; background: radial-gradient(ellipse at 50% 30%, #142733, var(--bg) 65%); }
    main.panel-collapsed { --scene-left: 0px; }
    .scene-heading, .panel-collapsed .scene-heading { top: 25px; left: 24px; }
    .eyebrow { font-size: 8px; letter-spacing: .14em; margin-bottom: 7px; }
    h2 { font-size: 25px; }
    .imagery { top: 29px; bottom: auto; right: 22px; font-size: 0; gap: 6px; }
    .hint { bottom: calc(46dvh + 29px); left: 0; right: 0; gap: 22px; font-size: 10px; }
    .hint .click-hint { display: none; }
    .panel-collapsed .hint { bottom: 88px; }
  }
  @media (pointer: coarse) { .desktop-hint { display: none; } .touch-hint { display: inline; } }
</style>
