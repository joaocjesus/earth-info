<script>
  import { progress } from './stores.js';
  let p = $state({ visible: false, title: '', pct: null, error: false });
  progress.subscribe((v) => (p = v));

  let indeterminate = $derived(p.pct == null);
  let pctText = $derived(indeterminate ? '' : `${Math.round((p.pct ?? 0) * 100)}%`);
  let barStyle = $derived(indeterminate ? '' : `width: ${((p.pct ?? 0) * 100).toFixed(1)}%`);
</script>

<div class="progress" class:visible={p.visible} class:error={p.error} class:indeterminate>
  <div class="label">
    <span class="title">{p.title}</span>
    <span class="pct">{pctText}</span>
  </div>
  <div class="bar"><div style={barStyle}></div></div>
</div>

<style>
  .progress {
    position: absolute; top: 16px; right: 16px;
    min-width: 220px; max-width: 280px;
    background: rgba(10, 14, 24, 0.85);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 10px; padding: 10px 12px;
    z-index: 11;
    opacity: 0; transform: translateY(-4px);
    transition: opacity .2s, transform .2s;
    pointer-events: none;
  }
  .progress.visible { opacity: 1; transform: translateY(0); }
  .progress.error { border-color: rgba(255,120,120,0.4); }
  .label {
    display: flex; justify-content: space-between; align-items: center;
    font-size: 11px; color: #b8c2d8; margin-bottom: 6px; font-weight: 500;
  }
  .pct { color: #8b96b3; font-family: ui-monospace, monospace; font-size: 11px; }
  .bar {
    height: 4px; background: rgba(255,255,255,0.08);
    border-radius: 2px; overflow: hidden;
  }
  .bar > div {
    height: 100%;
    background: linear-gradient(90deg, #5e8df0, #7eb0ff);
    width: 0%;
    transition: width .15s ease;
  }
  .progress.error .bar > div { background: #ff5e5e; width: 100% !important; }
  .progress.indeterminate .bar > div {
    width: 35% !important;
    animation: indet 1.2s linear infinite;
  }
  @keyframes indet {
    0%   { transform: translateX(-100%); }
    100% { transform: translateX(285%); }
  }
</style>
