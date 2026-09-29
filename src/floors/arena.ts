import * as THREE from 'three';
import { boxFromCenter, type Aabb } from '../player/collision';
import { BLOCKS, EXIT_PAD, SHELL } from './layout';

export interface ArenaLevel {
  colliders: Aabb[];
  /** Geometry that blocks hitscan. The exit pad blocks shots but not walking. */
  solids: THREE.Mesh[];
}

/**
 * Handcrafted Floor 1: one ~80×80 room, cover, and an exit pad.
 * No procgen. The pad is not a movement collider.
 */
export function createArena(scene: THREE.Scene): ArenaLevel {
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x2a1010,
    roughness: 0.95,
    metalness: 0.05,
  });
  const floorSize = (SHELL + 1) * 2;
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(floorSize, floorSize), floorMat);
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  const grid = new THREE.GridHelper(80, 40, 0x4a1818, 0x2a0c0c);
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

  const colliders: Aabb[] = [];
  const solids: THREE.Mesh[] = [floor];
  for (const spec of BLOCKS) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(spec.w, spec.h, spec.d),
      spec.crate ? crateMat : wallMat,
    );
    mesh.position.set(spec.x, spec.h / 2, spec.z);
    scene.add(mesh);
    solids.push(mesh);
    colliders.push(boxFromCenter(spec.x, spec.z, spec.w, spec.h, spec.d));
  }

  const exitMat = new THREE.MeshStandardMaterial({
    color: 0x664400,
    emissive: 0x442200,
    emissiveIntensity: 0.55,
  });
  const exit = new THREE.Mesh(new THREE.BoxGeometry(EXIT_PAD.w, EXIT_PAD.h, EXIT_PAD.d), exitMat);
  exit.position.set(EXIT_PAD.x, EXIT_PAD.h / 2, EXIT_PAD.z);
  exit.name = 'exit-stub';
  scene.add(exit);
  solids.push(exit);

  return { colliders, solids };
}
