<script>
  import { Canvas } from '@threlte/core';
  import SceneTree from './SceneTree.svelte';
</script>

<div class="globe">
  <div class="viewport">
    <Canvas>
      <SceneTree />
    </Canvas>
  </div>
</div>

<style>
  .globe { position: absolute; top: 110px; bottom: 80px; left: var(--scene-left); right: 24px; cursor: grab; touch-action: none; display: grid; place-items: center; container-type: size; }
  .viewport { width: min(100cqw, 100cqh); height: min(100cqw, 100cqh); }
  @media (max-width: 700px), (max-width: 900px) and (orientation: portrait) {
    .globe { top: 88px; bottom: calc(46dvh + 54px); left: 12px; right: 12px; }
    :global(.panel-collapsed) .globe { bottom: 114px; }
  }
  .globe:active { cursor: grabbing; }
</style>
