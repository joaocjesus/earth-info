<script>
  import { T, useThrelte } from '@threlte/core';
  import { Color, MeshPhongMaterial } from 'three';
  import { EARTH_RADIUS, vec3ToLatLon } from './coords.js';
  import { getTexture, evictTexture } from './textures.js';
  import { textureQuality, qualityChosen, currentTier } from './stores.js';
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
  let desiredTier = null;
  let loading = false;

  // Loads tiers until the most recently requested one is active, so a tier
  // change made while a download is in flight isn't dropped.
  async function requestTier(tier) {
    desiredTier = tier;
    if (loading) return;
    loading = true;
    try {
      while (desiredTier !== activeTier) {
        const want = desiredTier;
        try {
          const tex = await getTexture(want);
          if (desiredTier !== want) continue;  // superseded mid-download
          const aniso = getMaxAnisotropy();
          if (tex.anisotropy !== aniso) {
            tex.anisotropy = aniso;
            tex.needsUpdate = true;
          }
          if (material.map && material.map !== tex) {
            material.map.dispose();
            evictTexture(activeTier);
          }
          material.map = tex;
          material.color.set(0xffffff);
          material.needsUpdate = true;
          activeTier = want;
          currentTier.set(want);
          invalidate?.();
        } catch (err) {
          console.error('failed to load tier', want, err);
          if (desiredTier === want) desiredTier = activeTier;
        }
      }
    } finally {
      loading = false;
    }
  }

  // 'auto': request 2K then immediately queue 8K — the load loop applies 2K
  // for a fast first paint, then upgrades in the background. 'low': 2K only
  // (and switching down later disposes + evicts the 8K). The 8K download is
  // held until the first-run dialog is answered.
  $effect(() => {
    const quality = $textureQuality;
    requestTier('2k');
    if (quality === 'auto' && $qualityChosen) requestTier('8k');
  });

  // Distinguish clicks from orbit drags: ignore pointer travel beyond ~6 px.
  let downX = 0;
  let downY = 0;
  function onPointerDown(e) {
    downX = e.clientX;
    downY = e.clientY;
  }

  function handleClick(e) {
    const ne = e.nativeEvent ?? e;
    const dx = (ne.clientX ?? downX) - downX;
    const dy = (ne.clientY ?? downY) - downY;
    if (dx * dx + dy * dy > 36) return;
    const { lat, lon } = vec3ToLatLon(e.point);
    selectAt(lat, lon);
  }
</script>

<svelte:window onpointerdown={onPointerDown} />

<T.Mesh onclick={handleClick} {material}>
  <T.SphereGeometry args={[EARTH_RADIUS, 64, 64]} />
</T.Mesh>
