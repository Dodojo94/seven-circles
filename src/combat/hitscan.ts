import * as THREE from 'three';
import type { LiveEnemy } from '../enemies/billboards/enemy';

const raycaster = new THREE.Raycaster();
const direction = new THREE.Vector3();
const right = new THREE.Vector3();
const up = new THREE.Vector3();
const worldUp = new THREE.Vector3(0, 1, 0);
const toEnemy = new THREE.Vector3();

export interface RayHit {
  enemy: LiveEnemy | null;
  point: THREE.Vector3;
  /** False when the ray died in the air — no impact spark. */
  struck: boolean;
}

function aimDirection(camera: THREE.Camera, spread: number): THREE.Vector3 {
  camera.getWorldDirection(direction);
  if (spread <= 0) return direction;
  right.crossVectors(direction, worldUp);
  if (right.lengthSq() < 1e-8) right.set(1, 0, 0);
  right.normalize();
  up.crossVectors(right, direction).normalize();
  direction
    .addScaledVector(right, (Math.random() - 0.5) * spread)
    .addScaledVector(up, (Math.random() - 0.5) * spread)
    .normalize();
  return direction;
}

/** Single hitscan pellet. Walls in `solids` block the ray. */
export function castPellet(
  camera: THREE.Camera,
  solids: readonly THREE.Object3D[],
  enemies: readonly LiveEnemy[],
  range: number,
  spread: number,
): RayHit {
  const dir = aimDirection(camera, spread);
  raycaster.set(camera.position, dir);
  raycaster.far = range;

  const solidHit = raycaster.intersectObjects(solids as THREE.Object3D[], false)[0];
  const solidDist = solidHit?.distance ?? Infinity;
  const meshes = enemies.filter((enemy) => enemy.alive).map((enemy) => enemy.mesh);
  const enemyHit = raycaster.intersectObjects(meshes, false)[0];

  if (enemyHit && enemyHit.distance <= solidDist && enemyHit.distance <= range) {
    const enemy = enemies.find((item) => item.mesh === enemyHit.object) ?? null;
    return { enemy, point: enemyHit.point.clone(), struck: true };
  }

  if (solidHit && solidHit.distance <= range) {
    return { enemy: null, point: solidHit.point.clone(), struck: true };
  }

  return {
    enemy: null,
    point: camera.position.clone().addScaledVector(dir, range),
    struck: false,
  };
}

/**
 * Short cleave: enemies in front of the camera, inside range, not behind a wall.
 * `coneCos` is the minimum dot against the view direction (1 = dead ahead).
 */
export function cleaveOverlap(
  camera: THREE.Camera,
  solids: readonly THREE.Object3D[],
  enemies: readonly LiveEnemy[],
  range: number,
  coneCos: number,
): { enemies: LiveEnemy[]; point: THREE.Vector3 } {
  camera.getWorldDirection(direction);
  const hit: LiveEnemy[] = [];
  let closest = range;

  for (const enemy of enemies) {
    if (!enemy.alive) continue;
    toEnemy.subVectors(enemy.mesh.position, camera.position);
    const dist = toEnemy.length();
    if (dist > range || dist < 1e-4) continue;
    toEnemy.multiplyScalar(1 / dist);
    if (direction.dot(toEnemy) < coneCos) continue;

    raycaster.set(camera.position, toEnemy);
    raycaster.far = dist;
    const blocked = raycaster.intersectObjects(solids as THREE.Object3D[], false)[0];
    if (blocked && blocked.distance < dist - 0.25) continue;

    hit.push(enemy);
    if (dist < closest) closest = dist;
  }

  return {
    enemies: hit,
    point: camera.position.clone().addScaledVector(direction, closest),
  };
}
