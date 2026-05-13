<script>
  import { Canvas } from '@threlte/core';
  import SceneTree from './SceneTree.svelte';
</script>

<div class="globe">
  <Canvas>
    <SceneTree />
  </Canvas>
</div>

<style>
  .globe { position: absolute; inset: 0; cursor: grab; }
  .globe:active { cursor: grabbing; }
</style>
