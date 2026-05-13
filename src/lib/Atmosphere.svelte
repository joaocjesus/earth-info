<script>
  import { T } from '@threlte/core';
  import { BackSide, AdditiveBlending, ShaderMaterial } from 'three';
  import { EARTH_RADIUS } from './coords.js';

  const vertexShader = `
    varying vec3 vNormal;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    varying vec3 vNormal;
    void main() {
      float d = dot(vNormal, vec3(0.0, 0.0, 1.0));
      float intensity = pow(max(0.55 - d, 0.0), 2.4);
      gl_FragColor = vec4(0.35, 0.6, 1.0, 1.0) * intensity;
    }
  `;

  const material = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: true,
    side: BackSide,
    depthWrite: false,
    blending: AdditiveBlending
  });
</script>

<T.Mesh {material}>
  <T.SphereGeometry args={[EARTH_RADIUS * 1.04, 64, 64]} />
</T.Mesh>
