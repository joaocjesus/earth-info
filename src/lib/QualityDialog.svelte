<script>
  /**
   * First-run graphics quality picker. Dismissing (Esc / backdrop) accepts
   * the recommended Auto mode.
   */
  import Icon from './Icon.svelte';
  import { trapFocus } from './focusTrap.js';
  import { textureQuality } from './stores.js';

  let { open, onClose } = $props();

  function choose(q) {
    textureQuality.set(q);
    onClose?.();
  }
  function onKey(e) {
    if (e.key === 'Escape' && open) choose('auto');
  }
</script>

<svelte:window onkeydown={onKey} />

{#if open}
  <div
    class="backdrop"
    onclick={(e) => { if (e.target === e.currentTarget) choose('auto'); }}
    role="presentation"
  >
    <div
      class="dialog"
      use:trapFocus
      role="dialog"
      aria-modal="true"
      aria-label="Graphics quality"
      tabindex="-1"
    >
      <div class="globe-icon"><Icon name="globe" size={34} /></div>
      <p class="eyebrow">Welcome to Earth Info</p>
      <h2>Your window to the world.</h2>
      <p class="muted">
        Start exploring with the detail that suits your device.
        You can change this anytime in Settings.
      </p>

      <button class="choice recommended" onclick={() => choose('auto')}>
        <div class="t">Auto <span class="resolution">8K</span> <span class="badge">Recommended</span></div>
        <div class="n">
          Our clearest view of the planet. Starts with a quick preview, then loads rich 8K detail (~5 MB).
        </div>
      </button>

      <button class="choice" onclick={() => choose('low')}>
        <div class="t">Lite <span class="resolution">2K</span></div>
        <div class="n">
          A smaller download and lighter on your device. Ideal for slower connections.
        </div>
      </button>
    </div>
  </div>
{/if}

<style>
  .backdrop {
    position: fixed; inset: 0;
    display: flex; align-items: center; justify-content: center;
    z-index: 100;
  }
  .dialog {
    max-width: 440px; width: calc(100% - 32px);
    padding: 32px 28px 24px; max-height: calc(100dvh - 32px); overflow: auto;
    color: var(--text); text-align: center;
    box-shadow: 0 30px 80px rgba(0,0,0,0.5);
  }
  .globe-icon { display: grid; place-items: center; color: var(--accent); width: 68px; height: 68px; margin: 0 auto 20px; background: var(--accent-soft); border: 1px solid #9be3cf26; border-radius: 20px; }
  .eyebrow { font-size: 9px; color: var(--accent); letter-spacing: .15em; text-transform: uppercase; margin: 0 0 10px; }
  .resolution { color: var(--muted); font: 10px var(--mono); margin-left: 4px; }
  h2 { margin: 0 0 8px; font-size: 25px; font-weight: 500; letter-spacing: -.7px; }
  .muted { color: var(--muted); font-size: 13px; line-height: 1.55; margin: 0 0 18px; }

  .choice {
    display: block; width: 100%; text-align: left;
    background: var(--surface-raised);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    padding: 14px 16px; margin-bottom: 10px;
    color: var(--text); cursor: pointer;
    transition: border-color .15s, background .15s, transform .1s;
  }
  .choice:hover { border-color: var(--accent); background: var(--accent-soft); }
  .choice:active { transform: scale(0.99); }
  .choice.recommended { border-color: #9be3cf66; }
  .t { font-size: 14px; font-weight: 600; margin-bottom: 4px; }
  .n { font-size: 12px; color: var(--muted); line-height: 1.5; }
  .badge {
    display: inline-block; margin-left: 6px;
    font-size: 8px; font-weight: 600; letter-spacing: 0.05em;
    text-transform: uppercase; color: var(--accent);
    background: var(--accent-soft);
    border: 1px solid #9be3cf33;
    padding: 2px 7px; border-radius: 999px;
    vertical-align: 2px;
  }
</style>
