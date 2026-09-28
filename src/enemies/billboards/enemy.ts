import * as THREE from 'three';
import { createBillboardEnemy, faceBillboard } from './placeholder';

/** Hidden. Not shown on the HUD. */
const ENEMY_HP = 36;

export interface LiveEnemy {
  readonly mesh: THREE.Mesh;
  alive: boolean;
  applyDamage(amount: number): void;
}

interface Gib {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  life: number;
}

const gibGeometry = new THREE.BoxGeometry(0.16, 0.16, 0.16);
const gibMaterial = new THREE.MeshBasicMaterial({ color: 0x9a1a12 });

export interface EnemyWorld {
  alive(): LiveEnemy[];
  update(dt: number, camera: THREE.Camera): void;
}

class BillboardActor implements LiveEnemy {
  readonly mesh: THREE.Mesh;
  alive = true;
  private hp = ENEMY_HP;
  private flash = 0;
  private readonly material: THREE.MeshBasicMaterial;

  constructor(mesh: THREE.Mesh) {
    this.mesh = mesh;
    const material = mesh.material;
    if (Array.isArray(material) || !(material instanceof THREE.MeshBasicMaterial)) {
      throw new Error('billboard material missing');
    }
    this.material = material;
  }

  applyDamage(amount: number): void {
    if (!this.alive) return;
    this.hp -= amount;
    this.flash = 0.08;
    this.material.color.setRGB(4, 3.2, 2.2);
    if (this.hp <= 0) this.alive = false;
  }

  updateFlash(dt: number): void {
    if (!this.alive || this.flash <= 0) return;
    this.flash -= dt;
    if (this.flash <= 0) this.material.color.setRGB(1, 1, 1);
  }
}

export function createEnemyWorld(scene: THREE.Scene): EnemyWorld & {
  spawn(x: number, y: number, z: number): void;
} {
  const actors: BillboardActor[] = [];
  const gibs: Gib[] = [];

  function burst(origin: THREE.Vector3): void {
    for (let i = 0; i < 7; i += 1) {
      const mesh = new THREE.Mesh(gibGeometry, gibMaterial);
      mesh.position.copy(origin);
      mesh.position.y += (Math.random() - 0.4) * 0.6;
      scene.add(mesh);
      gibs.push({
        mesh,
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 7,
          2.2 + Math.random() * 4,
          (Math.random() - 0.5) * 7,
        ),
        life: 0.55 + Math.random() * 0.35,
      });
    }
  }

  function disposeActor(actor: BillboardActor): void {
    scene.remove(actor.mesh);
    const material = actor.mesh.material;
    if (!Array.isArray(material)) {
      if (material instanceof THREE.MeshBasicMaterial) material.map?.dispose();
      material.dispose();
    }
    actor.mesh.geometry.dispose();
  }

  return {
    spawn(x: number, y: number, z: number): void {
      const mesh = createBillboardEnemy();
      mesh.position.set(x, y, z);
      scene.add(mesh);
      actors.push(new BillboardActor(mesh));
    },

    alive(): LiveEnemy[] {
      return actors.filter((actor) => actor.alive);
    },

    update(dt: number, camera: THREE.Camera): void {
      for (let i = actors.length - 1; i >= 0; i -= 1) {
        const actor = actors[i];
        if (!actor) continue;
        if (!actor.alive) {
          burst(actor.mesh.position);
          disposeActor(actor);
          actors.splice(i, 1);
          continue;
        }
        actor.updateFlash(dt);
        faceBillboard(actor.mesh, camera);
      }

      for (let i = gibs.length - 1; i >= 0; i -= 1) {
        const gib = gibs[i];
        if (!gib) continue;
        gib.life -= dt;
        gib.velocity.y -= 16 * dt;
        gib.mesh.position.addScaledVector(gib.velocity, dt);
        gib.mesh.rotation.x += dt * 9;
        gib.mesh.rotation.z += dt * 6;
        if (gib.life > 0 && gib.mesh.position.y > 0.05) continue;
        scene.remove(gib.mesh);
        gibs.splice(i, 1);
      }
    },
  };
}
