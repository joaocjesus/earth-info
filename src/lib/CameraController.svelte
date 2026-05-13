<script>
  /**
   * Listens to the `cameraTarget` store and smoothly slerps the camera to
   * face the requested lat/lon at the requested distance.
   */
  import { useTask, useThrelte } from '@threlte/core';
  import { MathUtils } from 'three';
  import { latLonToVec3 } from './coords.js';
  import { cameraTarget } from './stores.js';

  const { camera, invalidate } = useThrelte();

  let anim = null;
  let firstSubscribe = true;

  cameraTarget.subscribe((target) => {
    if (!camera.current) return;
    // On first subscribe, snap to the initial position rather than animating
    // from (0,0,0) to it.
    if (firstSubscribe) {
      firstSubscribe = false;
      const pos = latLonToVec3(target.lat, target.lon).multiplyScalar(target.distance);
      camera.current.position.copy(pos);
      camera.current.lookAt(0, 0, 0);
      invalidate?.();
      return;
    }
    const startDir = camera.current.position.clone().normalize();
    const startLen = camera.current.position.length();
    const targetDir = latLonToVec3(target.lat, target.lon).normalize();
    const dot = MathUtils.clamp(startDir.dot(targetDir), -1, 1);
    const theta = Math.acos(dot);
    anim = {
      startDir,
      startLen,
      targetDir,
      targetLen: target.distance,
      theta,
      sinTheta: Math.sin(theta),
      startTime: performance.now(),
      duration: 850
    };
  });

  useTask(() => {
    if (!anim || !camera.current) return;
    const t = Math.min(1, (performance.now() - anim.startTime) / anim.duration);
    const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

    let dir;
    if (anim.theta < 1e-4) {
      dir = anim.targetDir.clone();
    } else {
      const a = Math.sin((1 - e) * anim.theta) / anim.sinTheta;
      const b = Math.sin(e * anim.theta) / anim.sinTheta;
      dir = anim.startDir.clone().multiplyScalar(a)
        .add(anim.targetDir.clone().multiplyScalar(b));
    }
    const len = anim.startLen * (1 - e) + anim.targetLen * e;
    camera.current.position.copy(dir.multiplyScalar(len));
    if (t >= 1) anim = null;
  });
</script>
