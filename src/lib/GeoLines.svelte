<script>
  /**
   * Renders GeoJSON polygon outlines as line segments on the globe.
   * Shared by the country-border and ocean-boundary overlays.
   */
  import { T, useThrelte } from '@threlte/core';
  import { onDestroy, untrack } from 'svelte';
  import {
    BufferGeometry, BufferAttribute, LineBasicMaterial, Color
  } from 'three';
  import { latLonToVec3 } from './coords.js';

  let {
    visible = false,
    scale,            // Natural Earth scale ('110m' | '50m' | '10m')
    color,
    opacity = 0.7,
    radius,           // sphere radius the lines sit on
    load              // async (scale) => GeoJSON features
  } = $props();

  const { invalidate } = useThrelte();

  let geometry = $state(null);
  let loadedScale = null;
  let token = 0;

  // color/opacity are fixed per instance; untrack documents that the
  // material deliberately captures their initial values.
  const material = new LineBasicMaterial({
    color: new Color(untrack(() => color)),
    transparent: true,
    opacity: untrack(() => opacity),
    depthWrite: false
  });

  $effect(() => {
    if (!visible || scale === loadedScale) return;
    const t = ++token;
    const want = scale;
    load(want)
      .then((features) => {
        if (t !== token) return; // superseded
        geometry?.dispose();
        geometry = buildGeometry(features);
        loadedScale = want;
        invalidate?.();
      })
      .catch((err) => console.error('failed to load overlay lines', err));
  });

  onDestroy(() => {
    geometry?.dispose();
    material.dispose();
  });

  function buildGeometry(features) {
    const positions = [];
    const pushSegment = (a, b) => {
      const va = latLonToVec3(a[1], a[0], radius);
      const vb = latLonToVec3(b[1], b[0], radius);
      positions.push(va.x, va.y, va.z, vb.x, vb.y, vb.z);
    };
    const ring = (coords) => {
      for (let i = 0; i < coords.length - 1; i++) pushSegment(coords[i], coords[i + 1]);
    };
    const polygon = (poly) => poly.forEach(ring);
    for (const f of features) {
      const g = f.geometry;
      if (!g) continue;
      if (g.type === 'Polygon') polygon(g.coordinates);
      else if (g.type === 'MultiPolygon') g.coordinates.forEach(polygon);
    }
    const geom = new BufferGeometry();
    geom.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
    return geom;
  }
</script>

{#if visible && geometry}
  <T.LineSegments {geometry} {material} renderOrder={1} />
{/if}
