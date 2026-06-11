<script>
  /**
   * First-run graphics quality picker. Dismissing (Esc / backdrop) accepts
   * the recommended Auto mode.
   */
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
      <div class="globe-icon">🌍</div>
      <h2>Pick your graphics quality</h2>
      <p class="muted">
        Both options use the same Earth imagery — only sharpness and download
        size differ. You can change this anytime in Settings.
      </p>

      <button class="choice recommended" onclick={() => choose('auto')}>
        <div class="t">Auto — sharp 8K <span class="badge">Recommended</span></div>
        <div class="n">
          A quick 2K preview (~0.5 MB) shows instantly, then the full 8K
          texture (~5 MB) loads silently in the background.
        </div>
      </button>

      <button class="choice" onclick={() => choose('low')}>
        <div class="t">Lite — 2K only</div>
        <div class="n">
          Lightest on memory, bandwidth, and GPU. Best for older or
          low-spec machines.
        </div>
      </button>
    </div>
  </div>
{/if}

<style>
  .backdrop {
    position: fixed; inset: 0; background: rgba(0,0,0,0.55);
    display: flex; align-items: center; justify-content: center;
    z-index: 100; backdrop-filter: blur(4px);
  }
  .dialog {
    background: rgba(14, 18, 30, 0.96);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 16px;
    max-width: 440px; width: calc(100% - 32px);
    padding: 26px 24px 22px;
    color: #e6e6e6; text-align: center;
    box-shadow: 0 30px 80px rgba(0,0,0,0.5);
  }
  .globe-icon { font-size: 40px; line-height: 1; margin-bottom: 10px; }
  h2 { margin: 0 0 8px; font-size: 18px; font-weight: 600; }
  .muted { color: #8b96b3; font-size: 13px; line-height: 1.55; margin: 0 0 18px; }

  .choice {
    display: block; width: 100%; text-align: left;
    background: rgba(20, 26, 40, 0.7);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    padding: 14px 16px; margin-bottom: 10px;
    color: #e6e6e6; cursor: pointer;
    transition: border-color .15s, background .15s, transform .1s;
  }
  .choice:hover { border-color: #5e8df0; background: rgba(94,141,240,0.1); }
  .choice:active { transform: scale(0.99); }
  .choice.recommended { border-color: rgba(94,141,240,0.45); }
  .t { font-size: 14px; font-weight: 600; margin-bottom: 4px; }
  .n { font-size: 12px; color: #8b96b3; line-height: 1.5; }
  .badge {
    display: inline-block; margin-left: 6px;
    font-size: 10px; font-weight: 700; letter-spacing: 0.05em;
    text-transform: uppercase; color: #9db9f7;
    background: rgba(94,141,240,0.18);
    border: 1px solid rgba(94,141,240,0.4);
    padding: 2px 7px; border-radius: 999px;
    vertical-align: 2px;
  }
</style>
