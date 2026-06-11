<script>
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
  import { vectorScale, qualityChosen } from './lib/stores.js';
  import { getAllCountries } from './lib/api.js';

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

<main>
  <Scene />
  <SidePanel
    onOpenSettings={() => (settingsOpen = true)}
    onOpenCredits={() => (creditsOpen = true)}
  />
  <ProgressWidget />
  <Toast />
  <div class="hint">Drag to rotate · Scroll to zoom · Click the globe</div>
  <Credits open={creditsOpen} onClose={() => (creditsOpen = false)} />
  <Settings open={settingsOpen} onClose={() => (settingsOpen = false)} />
  <QualityDialog
    open={qualityOpen}
    onClose={() => { qualityOpen = false; qualityChosen.set(true); }}
  />
</main>

<style>
  main { position: relative; width: 100%; height: 100%; }
  .hint {
    position: absolute; bottom: 16px; right: 16px;
    font-size: 11px; color: #5e6a85; z-index: 5;
    background: rgba(10, 14, 24, 0.5); padding: 6px 10px; border-radius: 8px;
    border: 1px solid rgba(255,255,255,0.05);
  }
</style>
