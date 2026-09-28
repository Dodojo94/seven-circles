import * as THREE from 'three';
import { boxFromCenter, type Aabb } from '../player/collision';

/**
 * Handcrafted Floor 1 test arena: dark floor, perimeter, and a few boxes.
 * No procgen. Returns solid AABBs for the FPS controller (exit pad is not solid).
 */
export function createArena(scene: THREE.Scene): Aabb[] {
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x2a1010,
    roughness: 0.95,
    metalness: 0.05,
  });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), floorMat);
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  const grid = new THREE.GridHelper(40, 40, 0x4a1818, 0x2a0c0c);
  grid.position.y = 0.01;
  scene.add(grid);

  const wallMat = new THREE.MeshStandardMaterial({
    color: 0x3a1518,
    roughness: 0.9,
    metalness: 0.1,
  });
  const crateMat = new THREE.MeshStandardMaterial({
    color: 0x4a2018,
    roughness: 0.85,
    metalness: 0.08,
  });

  const wallSpecs: Array<{ x: number; z: number; w: number; h: number; d: number; crate?: boolean }> = [
    // Outer shell so the test floor is a room.
    { x: 0, z: -18, w: 36, h: 5, d: 1 },
    { x: 0, z: 18, w: 36, h: 5, d: 1 },
    { x: -18, z: 0, w: 1, h: 5, d: 36 },
    { x: 18, z: 0, w: 1, h: 5, d: 36 },
    // Interior cover.
    { x: 0, z: -12, w: 16, h: 4, d: 1 },
    { x: -10, z: -4, w: 1, h: 4, d: 10 },
    { x: 10, z: -4, w: 1, h: 4, d: 10 },
    { x: -6, z: 6, w: 6, h: 3, d: 1 },
    { x: 7, z: 2, w: 1, h: 3.5, d: 5 },
    { x: -2, z: -1, w: 1.6, h: 1.2, d: 1.6, crate: true },
    { x: 3.2, z: 8, w: 1.4, h: 1.1, d: 1.4, crate: true },
  ];

  const colliders: Aabb[] = [];
  for (const spec of wallSpecs) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(spec.w, spec.h, spec.d),
      spec.crate ? crateMat : wallMat,
    );
    mesh.position.set(spec.x, spec.h / 2, spec.z);
    scene.add(mesh);
    colliders.push(boxFromCenter(spec.x, spec.z, spec.w, spec.h, spec.d));
  }

  const exitMat = new THREE.MeshStandardMaterial({
    color: 0x664400,
    emissive: 0x442200,
    emissiveIntensity: 0.4,
  });
  const exit = new THREE.Mesh(new THREE.BoxGeometry(2, 0.15, 2), exitMat);
  exit.position.set(0, 0.08, -14);
  exit.name = 'exit-stub';
  scene.add(exit);

  return colliders;
}
