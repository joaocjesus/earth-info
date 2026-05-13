<script>
  import { T } from '@threlte/core';
  import { BufferGeometry, BufferAttribute } from 'three';

  const starCount = 1400;
  const positions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const r = 50 + Math.random() * 30;
    const theta = Math.acos(2 * Math.random() - 1);
    const phi = Math.random() * Math.PI * 2;
    positions[i * 3]     = r * Math.sin(theta) * Math.cos(phi);
    positions[i * 3 + 1] = r * Math.cos(theta);
    positions[i * 3 + 2] = r * Math.sin(theta) * Math.sin(phi);
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(positions, 3));
</script>

<T.Points {geometry}>
  <T.PointsMaterial color={0xffffff} size={0.08} sizeAttenuation={true} />
</T.Points>
