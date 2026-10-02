<script>
  import Controls from './Controls.svelte';
  import InfoCard from './InfoCard.svelte';
  import Icon from './Icon.svelte';
  import { selection } from './stores.js';

  let { onOpenSettings, onOpenCredits, collapsed = $bindable(false) } = $props();

  let scrollArea = $state();
  const selectedPlace = $derived($selection ? `${$selection.lat},${$selection.lon}` : null);
  $effect(() => {
    if (selectedPlace && scrollArea) scrollArea.scrollTop = 0;
  });

  $effect(() => {
    if ($selection) collapsed = false;
  });
</script>

{#if collapsed}
  <button class="reopen" onclick={() => (collapsed = false)} aria-label="Open panel" aria-expanded="false" aria-controls="explorer-panel">
    <Icon name="globe" size={21} /> <span>Explore places</span>
  </button>
{/if}

<aside id="explorer-panel" class="panel" hidden={collapsed} aria-label="Earth explorer">
  <header>
    <div class="brand">
      <span class="logo"><Icon name="globe" size={25} /></span>
      <div><h1>Earth Info<span>.</span></h1><p>Your interactive atlas</p></div>
    </div>
    <button class="icon-btn" onclick={() => (collapsed = true)} aria-label="Collapse panel" aria-expanded="true" aria-controls="explorer-panel" title="Hide panel">
      <Icon name="chevron" size={18} />
    </button>
  </header>

  <div class="scroll" bind:this={scrollArea}>
    {#if $selection}<InfoCard />{/if}
    <Controls />
    {#if !$selection}<InfoCard />{/if}
  </div>

  <footer>
    <button class="link" onclick={onOpenCredits}>About & credits</button>
    <button class="settings-btn" onclick={onOpenSettings}><Icon name="settings" size={16} /> Settings</button>
  </footer>
</aside>

<style>
  .panel {
    position: absolute; top: 24px; left: 24px; bottom: 24px;
    width: var(--panel-width); display: flex; flex-direction: column;
    background: rgba(14, 23, 32, 0.96);
    border: 1px solid var(--line); border-radius: 20px;
    box-shadow: 0 16px 56px rgba(0, 0, 0, 0.2);
    z-index: 10; overflow: hidden;
  }
  .panel[hidden] { display: none; }
  header { display: flex; align-items: center; justify-content: space-between; padding: 24px 22px; border-bottom: 1px solid var(--line); flex-shrink: 0; }
  .brand { display: flex; align-items: center; gap: 12px; }
  .logo { display: flex; color: var(--accent); }
  h1 { margin: 0; font-size: 20px; font-weight: 650; letter-spacing: -0.7px; }
  h1 span { color: var(--accent); }
  .brand p { margin: 5px 0 0; color: var(--muted); font-size: 11px; letter-spacing: 0.035em; }
  .icon-btn { display: grid; place-items: center; background: transparent; border: 1px solid var(--line); color: var(--muted); border-radius: 9px; width: 32px; height: 36px; cursor: pointer; transition: color .2s, background .2s; }
  .icon-btn:hover { color: var(--text); background: var(--surface-raised); }
  .scroll { flex: 1; min-height: 0; overflow-y: auto; overscroll-behavior: contain; padding: 0 22px; scrollbar-width: thin; scrollbar-color: #30434e transparent; }
  footer { display: flex; align-items: center; justify-content: space-between; padding: 12px 18px; border-top: 1px solid var(--line); flex-shrink: 0; }
  .settings-btn, .link { display: inline-flex; align-items: center; justify-content: center; gap: 7px; border: 0; background: transparent; color: var(--muted); padding: 8px 4px; font-size: 11px; cursor: pointer; border-radius: 6px; }
  .settings-btn:hover, .link:hover { color: var(--accent); }
  .reopen { position: absolute; top: 28px; left: 28px; display: flex; align-items: center; gap: 10px; padding: 12px 16px; font-size: 13px; font-weight: 600; color: var(--accent); background: var(--surface); border: 1px solid var(--line); border-radius: 12px; cursor: pointer; z-index: 10; box-shadow: 0 8px 30px #0003; }
  .reopen:hover { border-color: var(--accent); }
  @media (max-width: 700px), (max-width: 900px) and (orientation: portrait) {
    .panel { top: auto; left: 12px; right: 12px; bottom: max(12px, env(safe-area-inset-bottom)); width: auto; height: 46dvh; border-radius: 20px; }
    header { padding: 14px 18px; }
    h1 { font-size: 18px; }
    .brand p { font-size: 10px; margin-top: 3px; }
    .icon-btn { transform: rotate(-90deg); width: 40px; height: 40px; }
    .scroll { padding: 0 18px; }
    footer { padding: 6px 16px; }
    .settings-btn, .link { min-height: 36px; }
    .reopen { top: auto; bottom: max(20px, env(safe-area-inset-bottom)); left: 50%; transform: translateX(-50%); white-space: nowrap; min-height: 48px; }
  }
  @media (min-width: 701px) and (max-height: 700px) {
    .panel { top: 16px; bottom: 16px; }
    header { padding: 18px 22px; }
  }
</style>
