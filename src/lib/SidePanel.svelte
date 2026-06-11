<script>
  import { fly, fade } from 'svelte/transition';
  import Controls from './Controls.svelte';
  import InfoCard from './InfoCard.svelte';
  import { selection } from './stores.js';

  let { onOpenSettings, onOpenCredits } = $props();
  let collapsed = $state(false);

  // A new selection should always be visible — reopen if collapsed.
  $effect(() => {
    if ($selection) collapsed = false;
  });
</script>

{#if collapsed}
  <button
    class="reopen"
    onclick={() => (collapsed = false)}
    aria-label="Open panel"
    transition:fade={{ duration: 150 }}
  >🌍</button>
{:else}
  <aside class="panel" transition:fly={{ x: -360, duration: 250, opacity: 1 }}>
    <header>
      <div class="brand">
        <span class="logo">🌍</span>
        <h1>Earth Info</h1>
      </div>
      <button class="icon-btn" onclick={() => (collapsed = true)} aria-label="Collapse panel" title="Hide panel">
        ‹
      </button>
    </header>

    <div class="scroll">
      <Controls />
      <InfoCard />
    </div>

    <footer>
      <button class="link" onclick={onOpenCredits}>Credits</button>
      <button class="settings-btn" onclick={onOpenSettings}>
        <span class="gear">⚙</span> Settings
      </button>
    </footer>
  </aside>
{/if}

<style>
  .panel {
    position: absolute;
    top: 16px; left: 16px; bottom: 16px;
    width: min(320px, calc(100vw - 32px));
    display: flex; flex-direction: column;
    background: linear-gradient(170deg, rgba(13, 18, 31, 0.82), rgba(8, 11, 20, 0.88));
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 18px;
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
    z-index: 10;
    overflow: hidden;
  }

  header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 18px 14px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  }
  .brand { display: flex; align-items: center; gap: 10px; }
  .logo { font-size: 22px; line-height: 1; }
  h1 {
    margin: 0; font-size: 15px; font-weight: 600;
    letter-spacing: 0.04em; color: #e6ecf8;
  }
  .icon-btn {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #8b96b3; border-radius: 8px;
    width: 28px; height: 28px; line-height: 1;
    font-size: 18px; cursor: pointer;
    transition: color 0.15s, background 0.15s;
  }
  .icon-btn:hover { color: #fff; background: rgba(255, 255, 255, 0.1); }

  .scroll {
    flex: 1; overflow-y: auto;
    padding: 4px 18px 12px;
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.15) transparent;
  }

  footer {
    display: flex; align-items: center; justify-content: space-between;
    padding: 10px 18px;
    border-top: 1px solid rgba(255, 255, 255, 0.07);
    font-size: 12px;
  }
  .settings-btn {
    display: inline-flex; align-items: center; gap: 6px;
    background: rgba(94, 141, 240, 0.12);
    border: 1px solid rgba(94, 141, 240, 0.35);
    color: #9db9f7; border-radius: 8px;
    padding: 6px 12px; font-size: 12px; font-weight: 600;
    cursor: pointer;
    transition: color 0.15s, background 0.15s;
  }
  .settings-btn:hover { color: #fff; background: rgba(94, 141, 240, 0.25); }
  .settings-btn .gear { font-size: 13px; line-height: 1; }
  .link {
    background: none; border: none; padding: 0; cursor: pointer;
    color: #80a8f5; font: inherit;
  }
  .link:hover { text-decoration: underline; }

  .reopen {
    position: absolute; top: 16px; left: 16px;
    width: 44px; height: 44px;
    font-size: 22px; line-height: 1;
    background: rgba(13, 18, 31, 0.82);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    cursor: pointer; z-index: 10;
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4);
    transition: transform 0.15s, border-color 0.15s;
  }
  .reopen:hover { transform: scale(1.06); border-color: rgba(94, 141, 240, 0.5); }
</style>
