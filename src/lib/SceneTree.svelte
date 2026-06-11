<script>
  /**
   * Contents of the <Canvas>. Lives inside the Threlte context, so it can
   * call interactivity() and use useTask / useThrelte freely.
   */
  import { T } from '@threlte/core';
  import { OrbitControls, interactivity } from '@threlte/extras';
  import Earth from './Earth.svelte';
  import Atmosphere from './Atmosphere.svelte';
  import GeoLines from './GeoLines.svelte';
  import Stars from './Stars.svelte';
  import Marker from './Marker.svelte';
  import CameraController from './CameraController.svelte';
  import { CONTINENT_CENTROIDS } from './continents.js';
  import { EARTH_RADIUS, latLonToVec3 } from './coords.js';
  import { showBorders, showOceanBorders, vectorScale } from './stores.js';
  import { loadCountryPolys, loadMarinePolys } from './marinePolys.js';

  interactivity();

  const init = CONTINENT_CENTROIDS['Europe'];
  const initVec = latLonToVec3(init.lat, init.lon).multiplyScalar(3.0);

  let controlsRef = $state(null);

  // Both go through the shared poly cache so the overlay reuses the
  // fetch+parse that classification already did (and vice versa).
  const loadCountryFeatures = async (scale) =>
    (await loadCountryPolys(scale)).features;
  const loadMarineFeatures = async (scale) =>
    (await loadMarinePolys(scale)).features;
</script>

<T.PerspectiveCamera
  makeDefault
  position={[initVec.x, initVec.y, initVec.z]}
  fov={42}
  near={0.1}
  far={200}
/>

<CameraController controls={controlsRef} />

<T.AmbientLight intensity={0.5} />
<T.DirectionalLight position={[5, 3, 5]} intensity={1.1} />

<Stars />
<Earth />
<GeoLines
  visible={$showBorders}
  scale={$vectorScale}
  color={0xffd27a}
  opacity={0.7}
  radius={EARTH_RADIUS * 1.0015}
  load={loadCountryFeatures}
/>
<GeoLines
  visible={$showOceanBorders}
  scale={$vectorScale}
  color={0x7ad7ff}
  opacity={0.75}
  radius={EARTH_RADIUS * 1.002}
  load={loadMarineFeatures}
/>
<Atmosphere />
<Marker />

<OrbitControls
  bind:ref={controlsRef}
  enableDamping
  dampingFactor={0.08}
  rotateSpeed={0.5}
  zoomSpeed={0.7}
  minDistance={1.35}
  maxDistance={8}
  enablePan={false}
/>
