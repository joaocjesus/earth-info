<script>
  import Scene from './lib/Scene.svelte';
  import Controls from './lib/Controls.svelte';
  import InfoCard from './lib/InfoCard.svelte';
  import ProgressWidget from './lib/ProgressWidget.svelte';
  import Toast from './lib/Toast.svelte';
  import Credits from './lib/Credits.svelte';

  let creditsOpen = $state(false);
</script>

<main>
  <Scene />
  <Controls />
  <ProgressWidget />
  <InfoCard />
  <Toast />
  <div class="hint">
    Drag to rotate · Scroll to zoom · Click a country ·
    <button class="link" onclick={() => (creditsOpen = true)}>Credits</button>
  </div>
  <Credits open={creditsOpen} onClose={() => (creditsOpen = false)} />
</main>

<style>
  main { position: relative; width: 100%; height: 100%; }
  .hint {
    position: absolute; bottom: 16px; right: 16px;
    font-size: 11px; color: #5e6a85; z-index: 5;
    background: rgba(10, 14, 24, 0.5); padding: 6px 10px; border-radius: 8px;
    border: 1px solid rgba(255,255,255,0.05);
  }
  .link {
    background: none; border: none; padding: 0; cursor: pointer;
    color: #80a8f5; font: inherit;
  }
  .link:hover { text-decoration: underline; }
</style>
