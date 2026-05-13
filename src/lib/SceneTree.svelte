<script>
  /**
   * Contents of the <Canvas>. Lives inside the Threlte context, so it can
   * call interactivity() and use useTask / useThrelte freely.
   */
  import { T } from '@threlte/core';
  import { OrbitControls, interactivity } from '@threlte/extras';
  import Earth from './Earth.svelte';
  import Atmosphere from './Atmosphere.svelte';
  import Borders from './Borders.svelte';
  import OceanBorders from './OceanBorders.svelte';
  import Stars from './Stars.svelte';
  import Marker from './Marker.svelte';
  import CameraController from './CameraController.svelte';
  import { CONTINENT_CENTROIDS } from './continents.js';
  import { latLonToVec3 } from './coords.js';

  interactivity();

  const init = CONTINENT_CENTROIDS['Europe'];
  const initVec = latLonToVec3(init.lat, init.lon).multiplyScalar(3.0);
</script>

<T.PerspectiveCamera
  makeDefault
  position={[initVec.x, initVec.y, initVec.z]}
  fov={42}
  near={0.1}
  far={200}
/>

<CameraController />

<T.AmbientLight intensity={0.5} />
<T.DirectionalLight position={[5, 3, 5]} intensity={1.1} />

<Stars />
<Earth />
<Borders />
<OceanBorders />
<Atmosphere />
<Marker />

<OrbitControls
  enableDamping
  dampingFactor={0.08}
  rotateSpeed={0.5}
  zoomSpeed={0.7}
  minDistance={1.35}
  maxDistance={8}
  enablePan={false}
/>
