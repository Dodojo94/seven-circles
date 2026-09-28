import * as THREE from 'three';

/** V0 test arena: flat floor + a few box walls. */
export function createArena(scene: THREE.Scene): void {
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x2a1010,
    roughness: 0.95,
    metalness: 0.05,
  });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  // Grid hint on floor
  const grid = new THREE.GridHelper(40, 40, 0x4a1818, 0x2a0c0c);
  grid.position.y = 0.01;
  scene.add(grid);

  const wallMat = new THREE.MeshStandardMaterial({
    color: 0x3a1518,
    roughness: 0.9,
    metalness: 0.1,
  });

  const wallSpecs: Array<{ x: number; z: number; w: number; h: number; d: number }> = [
    { x: 0, z: -12, w: 16, h: 4, d: 1 },
    { x: -10, z: -4, w: 1, h: 4, d: 10 },
    { x: 10, z: -4, w: 1, h: 4, d: 10 },
    { x: -6, z: 6, w: 6, h: 3, d: 1 },
    { x: 7, z: 2, w: 1, h: 3.5, d: 5 },
  ];

  for (const spec of wallSpecs) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(spec.w, spec.h, spec.d),
      wallMat,
    );
    mesh.position.set(spec.x, spec.h / 2, spec.z);
    scene.add(mesh);
  }

  // Stub exit marker (run complete placeholder)
  const exitMat = new THREE.MeshStandardMaterial({
    color: 0x664400,
    emissive: 0x442200,
    emissiveIntensity: 0.4,
  });
  const exit = new THREE.Mesh(new THREE.BoxGeometry(2, 0.15, 2), exitMat);
  exit.position.set(0, 0.08, -14);
  exit.name = 'exit-stub';
  scene.add(exit);
}
