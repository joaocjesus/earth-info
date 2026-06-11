<script>
  import { T, useTask, useThrelte } from '@threlte/core';
  import { DoubleSide, Color } from 'three';
  import { EARTH_RADIUS, latLonToVec3 } from './coords.js';
  import { selection } from './stores.js';

  const { camera, invalidate } = useThrelte();

  // World scale per unit of camera distance — keeps the pin the same
  // apparent size on screen at any zoom (≈ current look at distance 2.6).
  const SCREEN_SCALE = 0.385;

  let visible = $state(false);
  let position = $state([0, 0, 0]);
  let zoomScale = $state(1);
  let ringScale = $state(1);
  let ringOpacity = $state(0.8);
  let pulse = 0;
  let ringRef = $state(null);

  $effect(() => {
    const sel = $selection;
    if (!sel || sel.status === 'error') {
      visible = false;
      return;
    }
    const v = latLonToVec3(sel.lat, sel.lon).multiplyScalar(EARTH_RADIUS * 1.012);
    position = [v.x, v.y, v.z];
    visible = true;
    pulse = 0;
  });

  useTask((delta) => {
    if (!visible || !camera.current) return;
    pulse += delta * 2.4;  // time-based so refresh rate doesn't change speed
    ringScale = 1 + Math.sin(pulse) * 0.25;
    ringOpacity = 0.45 + 0.35 * (1 + Math.cos(pulse)) * 0.5;
    const cam = camera.current.position;
    const dx = cam.x - position[0];
    const dy = cam.y - position[1];
    const dz = cam.z - position[2];
    zoomScale = Math.sqrt(dx * dx + dy * dy + dz * dz) * SCREEN_SCALE;
    if (ringRef) ringRef.lookAt(cam);
    invalidate?.();
  });
</script>

{#if visible}
  <T.Group {position} scale={[zoomScale, zoomScale, zoomScale]}>
    <T.Mesh>
      <T.SphereGeometry args={[0.014, 16, 16]} />
      <T.MeshBasicMaterial color={new Color(0xff5e5e)} />
    </T.Mesh>
    <T.Mesh bind:ref={ringRef} scale={[ringScale, ringScale, ringScale]}>
      <T.RingGeometry args={[0.022, 0.032, 32]} />
      <T.MeshBasicMaterial color={new Color(0xff5e5e)} side={DoubleSide} transparent opacity={ringOpacity} />
    </T.Mesh>
  </T.Group>
{/if}
