import * as THREE from 'three';
import { createBillboardEnemy, faceBillboard } from './placeholder';

/** Hidden. Not shown on the HUD. */
const ENEMY_HP = 36;

export interface LiveEnemy {
  readonly mesh: THREE.Mesh;
  alive: boolean;
  /** Returns true when this hit drops the imp. */
  applyDamage(amount: number): boolean;
}

interface Gib {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  life: number;
}

const gibGeometry = new THREE.BoxGeometry(0.16, 0.16, 0.16);
const gibMaterial = new THREE.MeshBasicMaterial({ color: 0x9a1a12 });

/** Wall-clock delay from the gib frame until the same spawn is alive again. */
const RESPAWN_MS = 5000;
const POP_TIME = 0.22;

export interface EnemyWorld {
  alive(): LiveEnemy[];
  update(dt: number, camera: THREE.Camera): void;
}

class BillboardActor implements LiveEnemy {
  readonly mesh: THREE.Mesh;
  alive = true;
  private hp = ENEMY_HP;
  private flash = 0;
  private pop = POP_TIME;
  private readonly material: THREE.MeshBasicMaterial;

  constructor(mesh: THREE.Mesh) {
    this.mesh = mesh;
    const material = mesh.material;
    if (Array.isArray(material) || !(material instanceof THREE.MeshBasicMaterial)) {
      throw new Error('billboard material missing');
    }
    this.material = material;
    mesh.scale.setScalar(0.2);
  }

  applyDamage(amount: number): boolean {
    if (!this.alive) return false;
    this.hp -= amount;
    this.flash = 0.08;
    this.material.color.setRGB(4, 3.2, 2.2);
    if (this.hp > 0) return false;
    this.alive = false;
    return true;
  }

  updateFlash(dt: number): void {
    if (!this.alive || this.flash <= 0) return;
    this.flash -= dt;
    if (this.flash <= 0) this.material.color.setRGB(1, 1, 1);
  }

  updatePop(dt: number): void {
    if (this.pop <= 0) return;
    this.pop -= dt;
    const t = 1 - Math.max(this.pop, 0) / POP_TIME;
    this.mesh.scale.setScalar(0.2 + 0.8 * t);
  }

  respawn(x: number, y: number, z: number): void {
    this.hp = ENEMY_HP;
    this.alive = true;
    this.flash = 0;
    this.pop = POP_TIME;
    this.material.color.setRGB(1, 1, 1);
    this.mesh.position.set(x, y, z);
    this.mesh.scale.setScalar(0.2);
  }
}

export function createEnemyWorld(scene: THREE.Scene): EnemyWorld & {
  spawn(x: number, y: number, z: number): void;
} {
  const slots: Array<{
    actor: BillboardActor;
    x: number;
    y: number;
    z: number;
    /** 0 while alive. Set to now+5000ms on the gib frame. */
    respawnAt: number;
  }> = [];
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

  return {
    spawn(x: number, y: number, z: number): void {
      const mesh = createBillboardEnemy();
      mesh.position.set(x, y, z);
      scene.add(mesh);
      slots.push({ actor: new BillboardActor(mesh), x, y, z, respawnAt: 0 });
    },

    alive(): LiveEnemy[] {
      return slots.filter((slot) => slot.actor.alive).map((slot) => slot.actor);
    },

    update(dt: number, camera: THREE.Camera): void {
      const now = performance.now();
      for (const slot of slots) {
        const actor = slot.actor;
        if (!actor.alive) {
          if (slot.respawnAt === 0) {
            burst(actor.mesh.position);
            scene.remove(actor.mesh);
            slot.respawnAt = now + RESPAWN_MS;
          } else if (now >= slot.respawnAt) {
            actor.respawn(slot.x, slot.y, slot.z);
            scene.add(actor.mesh);
            slot.respawnAt = 0;
          }
          continue;
        }
        actor.updateFlash(dt);
        actor.updatePop(dt);
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
