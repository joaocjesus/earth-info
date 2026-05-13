<script>
  import { T, useThrelte } from '@threlte/core';
  import {
    BufferGeometry, BufferAttribute, LineBasicMaterial, Color
  } from 'three';
  import { EARTH_RADIUS, latLonToVec3 } from './coords.js';
  import { showBorders } from './stores.js';

  const BORDER_URL =
    'https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@master/geojson/ne_110m_admin_0_countries.geojson';

  const { invalidate } = useThrelte();

  let geometry = $state(null);
  let visible = $state(false);
  let loading = false;

  const material = new LineBasicMaterial({
    color: new Color(0xffd27a),
    transparent: true,
    opacity: 0.7,
    depthWrite: false
  });

  showBorders.subscribe((on) => {
    visible = on;
    if (on && !geometry && !loading) loadBorders();
  });

  async function loadBorders() {
    loading = true;
    try {
      const res = await fetch(BORDER_URL);
      const geo = await res.json();
      geometry = buildGeometry(geo);
      invalidate?.();
    } catch (err) {
      console.error('failed to load borders', err);
    } finally {
      loading = false;
    }
  }

  function buildGeometry(geo) {
    const positions = [];
    const R = EARTH_RADIUS * 1.0015;
    const pushSegment = (a, b) => {
      const va = latLonToVec3(a[1], a[0], R);
      const vb = latLonToVec3(b[1], b[0], R);
      positions.push(va.x, va.y, va.z, vb.x, vb.y, vb.z);
    };
    const ring = (coords) => {
      for (let i = 0; i < coords.length - 1; i++) pushSegment(coords[i], coords[i + 1]);
    };
    const polygon = (poly) => poly.forEach(ring);
    for (const f of geo.features) {
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
