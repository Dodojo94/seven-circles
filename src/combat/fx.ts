import * as THREE from 'three';

interface Tracer {
  line: THREE.Line;
  life: number;
}

/** Short-lived tracers and a camera-local muzzle flash. Not a stat readout. */
export function createCombatFx(scene: THREE.Scene, camera: THREE.Camera): {
  shot(from: THREE.Vector3, to: THREE.Vector3, melee: boolean): void;
  update(dt: number): void;
} {
  const flash = new THREE.PointLight(0xffe2a0, 0, 7, 2);
  flash.position.set(0.12, -0.1, -0.5);
  camera.add(flash);
  if (camera.parent !== scene) scene.add(camera);

  let intensity = 0;
  const tracers: Tracer[] = [];

  return {
    shot(from: THREE.Vector3, to: THREE.Vector3, melee: boolean): void {
      flash.color.setHex(melee ? 0xff4422 : 0xffe2a0);
      intensity = melee ? 3.2 : 6;
      const geometry = new THREE.BufferGeometry().setFromPoints([from, to]);
      const material = new THREE.LineBasicMaterial({
        color: melee ? 0xff5533 : 0xffe2b0,
        transparent: true,
        opacity: 0.85,
      });
      const line = new THREE.Line(geometry, material);
      scene.add(line);
      tracers.push({ line, life: melee ? 0.09 : 0.05 });
    },

    update(dt: number): void {
      intensity = Math.max(0, intensity - dt * 70);
      flash.intensity = intensity;
      for (let i = tracers.length - 1; i >= 0; i -= 1) {
        const tracer = tracers[i];
        if (!tracer) continue;
        tracer.life -= dt;
        if (tracer.life > 0) continue;
        scene.remove(tracer.line);
        tracer.line.geometry.dispose();
        const material = tracer.line.material;
        if (!Array.isArray(material)) material.dispose();
        tracers.splice(i, 1);
      }
    },
  };
}
