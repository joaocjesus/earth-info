<script>
  import { T, useTask, useThrelte } from '@threlte/core';
  import { DoubleSide, Color } from 'three';
  import { EARTH_RADIUS, latLonToVec3 } from './coords.js';
  import { selection } from './stores.js';

  const { camera, invalidate } = useThrelte();

  let visible = $state(false);
  let position = $state([0, 0, 0]);
  let ringScale = $state(1);
  let ringOpacity = $state(0.8);
  let pulse = 0;
  let ringRef = $state(null);

  selection.subscribe((sel) => {
    if (!sel || sel.status === 'error') {
      visible = false;
      return;
    }
    const v = latLonToVec3(sel.lat, sel.lon).multiplyScalar(EARTH_RADIUS * 1.012);
    position = [v.x, v.y, v.z];
    visible = true;
    pulse = 0;
  });

  useTask(() => {
    if (!visible) return;
    pulse += 0.04;
    ringScale = 1 + Math.sin(pulse) * 0.25;
    ringOpacity = 0.45 + 0.35 * (1 + Math.cos(pulse)) * 0.5;
    if (ringRef && camera.current) ringRef.lookAt(camera.current.position);
    invalidate?.();
  });
</script>

{#if visible}
  <T.Mesh {position}>
    <T.SphereGeometry args={[0.014, 16, 16]} />
    <T.MeshBasicMaterial color={new Color(0xff5e5e)} />
  </T.Mesh>
  <T.Mesh bind:ref={ringRef} {position} scale={[ringScale, ringScale, ringScale]}>
    <T.RingGeometry args={[0.022, 0.032, 32]} />
    <T.MeshBasicMaterial color={new Color(0xff5e5e)} side={DoubleSide} transparent opacity={ringOpacity} />
  </T.Mesh>
{/if}
