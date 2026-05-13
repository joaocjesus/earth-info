<script>
  import { T, useThrelte } from '@threlte/core';
  import { Color, MeshPhongMaterial } from 'three';
  import { EARTH_RADIUS, vec3ToLatLon } from './coords.js';
  import { getTexture } from './textures.js';
  import { resolutionMode, currentTier } from './stores.js';
  import { selectAt } from './selection.js';

  const threlte = useThrelte();
  const { invalidate } = threlte;
  const getMaxAnisotropy = () =>
    threlte.renderer?.capabilities?.getMaxAnisotropy?.() ?? 1;

  const material = new MeshPhongMaterial({
    color: new Color(0x223044),
    specular: new Color(0x222831),
    shininess: 14
  });

  let activeTier = null;
  let loading = false;

  async function applyTier(tier) {
    if (activeTier === tier || loading) return;
    loading = true;
    try {
      const tex = await getTexture(tier);
      const aniso = getMaxAnisotropy();
      if (tex.anisotropy !== aniso) {
        tex.anisotropy = aniso;
        tex.needsUpdate = true;
      }
      if (material.map && material.map !== tex) material.map.dispose();
      material.map = tex;
      material.color.set(0xffffff);
      material.needsUpdate = true;
      activeTier = tier;
      currentTier.set(tier);
      invalidate?.();
    } catch (err) {
      console.error('failed to load tier', tier, err);
    } finally {
      loading = false;
    }
  }

  resolutionMode.subscribe((mode) => {
    if (mode) applyTier(mode);
  });

  function handleClick(e) {
    const { lat, lon } = vec3ToLatLon(e.point);
    selectAt(lat, lon);
  }
</script>

<T.Mesh onclick={handleClick} {material}>
  <T.SphereGeometry args={[EARTH_RADIUS, 64, 64]} />
</T.Mesh>
