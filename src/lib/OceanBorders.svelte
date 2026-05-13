<script>
  import { T, useThrelte } from '@threlte/core';
  import {
    BufferGeometry, BufferAttribute, LineBasicMaterial, Color
  } from 'three';
  import { EARTH_RADIUS, latLonToVec3 } from './coords.js';
  import { showOceanBorders, vectorScale } from './stores.js';
  import { loadMarinePolys } from './marinePolys.js';

  const { invalidate } = useThrelte();

  let visible = $state(false);
  let geometry = $state(null);
  let currentScale = null;
  let currentToken = 0;

  const material = new LineBasicMaterial({
    color: new Color(0x7ad7ff),
    transparent: true,
    opacity: 0.75,
    depthWrite: false
  });

  showOceanBorders.subscribe((on) => {
    visible = on;
    if (on) ensureLoaded();
    invalidate?.();
  });

  vectorScale.subscribe((s) => {
    if (s !== currentScale) {
      currentScale = s;
      geometry = null;
      if (visible) ensureLoaded();
    }
  });

  async function ensureLoaded() {
    const token = ++currentToken;
    const scale = currentScale;
    try {
      const polys = await loadMarinePolys(scale);
      if (token !== currentToken) return;
      geometry = buildGeometry(polys.features);
      invalidate?.();
    } catch (err) {
      console.error('failed to load ocean borders', err);
    }
  }

  function buildGeometry(features) {
    const positions = [];
    const R = EARTH_RADIUS * 1.002;
    const pushSegment = (a, b) => {
      const va = latLonToVec3(a[1], a[0], R);
      const vb = latLonToVec3(b[1], b[0], R);
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
