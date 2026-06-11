<script>
  import { trapFocus } from './focusTrap.js';

  let { open, onClose } = $props();

  function close() { onClose?.(); }
  function onKey(e) { if (e.key === 'Escape' && open) close(); }
</script>

<svelte:window onkeydown={onKey} />

{#if open}
  <div
    class="backdrop"
    onclick={(e) => { if (e.target === e.currentTarget) close(); }}
    role="presentation"
  >
    <div
      class="dialog"
      use:trapFocus
      role="dialog"
      aria-modal="true"
      aria-label="Credits"
      tabindex="-1"
    >
      <header>
        <h2>Credits</h2>
        <button class="x" onclick={close} aria-label="Close">×</button>
      </header>

      <section>
        <h3>Earth textures</h3>
        <ul>
          <li>
            <b>2K — Blue Marble Atmos</b> · NASA Visible Earth (public domain), via
            <a href="https://github.com/mrdoob/three.js" target="_blank" rel="noreferrer">three.js</a> examples (MIT).
          </li>
          <li>
            <b>4K — Blue Marble Clear</b> · NASA Blue Marble Next Generation (public domain), via
            <a href="https://github.com/turban/webgl-earth" target="_blank" rel="noreferrer">turban/webgl-earth</a> (MIT).
          </li>
          <li>
            <b>8K — Solar System Scope</b> · ©
            <a href="https://www.solarsystemscope.com/textures/" target="_blank" rel="noreferrer">Solar System Scope</a>,
            licensed under
            <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a>.
          </li>
        </ul>

        <h3>Country borders & ocean polygons</h3>
        <ul>
          <li>
            <a href="https://www.naturalearthdata.com/" target="_blank" rel="noreferrer">Natural Earth</a>
            — admin-0 countries and marine polygons (110m / 50m / 10m,
            selectable in Settings) — public domain.
          </li>
        </ul>

        <h3>Country data</h3>
        <ul>
          <li>
            <a href="https://restcountries.com" target="_blank" rel="noreferrer">REST Countries</a>
            open dataset (Mozilla Public License 2.0), served from their
            <a href="https://gitlab.com/restcountries/restcountries" target="_blank" rel="noreferrer">GitLab repository</a>
            via CDN mirror. Reverse geocoding by
            <a href="https://www.bigdatacloud.com" target="_blank" rel="noreferrer">BigDataCloud</a>.
          </li>
        </ul>

        <h3>Libraries</h3>
        <ul>
          <li><a href="https://threejs.org/" target="_blank" rel="noreferrer">three.js</a> (MIT)</li>
          <li><a href="https://threlte.xyz/" target="_blank" rel="noreferrer">Threlte</a> (MIT)</li>
          <li><a href="https://svelte.dev/" target="_blank" rel="noreferrer">Svelte</a> (MIT)</li>
        </ul>
      </section>
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
    border-radius: 14px;
    max-width: 560px; width: calc(100% - 32px);
    max-height: 80vh; overflow: auto;
    color: #e6e6e6;
    box-shadow: 0 30px 80px rgba(0,0,0,0.5);
  }
  header {
    display: flex; justify-content: space-between; align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid rgba(255,255,255,0.08);
  }
  h2 { margin: 0; font-size: 16px; font-weight: 600; letter-spacing: 0.02em; }
  h3 {
    margin: 18px 0 6px;
    font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em;
    color: #8b96b3; font-weight: 600;
  }
  section { padding: 8px 20px 20px; font-size: 13px; line-height: 1.55; }
  ul { margin: 0; padding-left: 18px; }
  li { margin: 4px 0; }
  a { color: #80a8f5; text-decoration: none; }
  a:hover { text-decoration: underline; }
  .x {
    background: transparent; border: none; color: #8b96b3;
    font-size: 24px; line-height: 1; cursor: pointer; padding: 0 4px;
  }
  .x:hover { color: #e6e6e6; }
</style>
