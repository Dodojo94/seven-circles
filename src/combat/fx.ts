import * as THREE from 'three';

interface TimedSprite {
  sprite: THREE.Sprite;
  life: number;
  max: number;
}

interface TimedLine {
  line: THREE.Line;
  positions: Float32Array;
  life: number;
  max: number;
}

export interface ShotFx {
  /** World-space start, already in front of the camera. */
  origin: THREE.Vector3;
  dir: THREE.Vector3;
  /** Set only when the ray actually hit a wall or enemy. */
  impact: THREE.Vector3 | null;
  melee: boolean;
  flesh: boolean;
}

const TRACER_LIFE = 0.08;
const TRACER_LENGTH = 0.7;
const SPARK_LIFE = 0.09;

/**
 * Local muzzle flash, a stub tracer under 100ms, and a small impact spark.
 * No beam across the room.
 */
export function createCombatFx(scene: THREE.Scene, camera: THREE.Camera): {
  shot(fx: ShotFx): void;
  update(dt: number): void;
} {
  const flashMat = new THREE.SpriteMaterial({
    color: 0xfff1c2,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
  });
  const muzzle = new THREE.Sprite(flashMat);
  muzzle.position.set(0.16, -0.12, -0.55);
  muzzle.scale.setScalar(0.2);
  muzzle.visible = false;
  camera.add(muzzle);
  if (camera.parent !== scene) scene.add(camera);

  const light = new THREE.PointLight(0xffe2a0, 0, 2.4, 2);
  light.position.set(0.12, -0.08, -0.45);
  camera.add(light);

  let flashLife = 0;
  let flashMax = TRACER_LIFE;
  const sparks: TimedSprite[] = [];
  const tracers: TimedLine[] = [];

  function takeSprite(): TimedSprite {
    const free = sparks.find((item) => item.life <= 0);
    if (free) return free;
    if (sparks.length < 24) {
      const material = new THREE.SpriteMaterial({
        color: 0xffc56a,
        transparent: true,
        opacity: 1,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const sprite = new THREE.Sprite(material);
      sprite.visible = false;
      sprite.scale.setScalar(0.14);
      scene.add(sprite);
      const created = { sprite, life: 0, max: SPARK_LIFE };
      sparks.push(created);
      return created;
    }
    let oldest = sparks[0];
    if (!oldest) throw new Error('spark pool empty');
    for (const item of sparks) {
      if (item.life < oldest.life) oldest = item;
    }
    return oldest;
  }

  function takeLine(): TimedLine {
    const free = tracers.find((item) => item.life <= 0);
    if (free) return free;
    if (tracers.length < 16) {
      const positions = new Float32Array(6);
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const material = new THREE.LineBasicMaterial({
        color: 0xffe7b8,
        transparent: true,
        opacity: 0.45,
        depthWrite: false,
      });
      const line = new THREE.Line(geometry, material);
      line.frustumCulled = false;
      line.visible = false;
      scene.add(line);
      const created = { line, positions, life: 0, max: TRACER_LIFE };
      tracers.push(created);
      return created;
    }
    let oldest = tracers[0];
    if (!oldest) throw new Error('tracer pool empty');
    for (const item of tracers) {
      if (item.life < oldest.life) oldest = item;
    }
    return oldest;
  }

  return {
    shot(fx: ShotFx): void {
      flashLife = fx.melee ? 0.06 : 0.04;
      flashMax = flashLife;
      flashMat.color.setHex(fx.melee ? 0xff5522 : 0xfff1c2);
      flashMat.opacity = 0.9;
      muzzle.scale.setScalar(fx.melee ? 0.38 : 0.18);
      muzzle.visible = true;
      light.color.copy(flashMat.color);
      light.intensity = fx.melee ? 1.1 : 1.6;

      if (!fx.melee && fx.dir.lengthSq() > 1e-6) {
        const tracer = takeLine();
        const start = fx.origin;
        const endX = start.x + fx.dir.x * TRACER_LENGTH;
        const endY = start.y + fx.dir.y * TRACER_LENGTH;
        const endZ = start.z + fx.dir.z * TRACER_LENGTH;
        tracer.positions[0] = start.x;
        tracer.positions[1] = start.y;
        tracer.positions[2] = start.z;
        tracer.positions[3] = endX;
        tracer.positions[4] = endY;
        tracer.positions[5] = endZ;
        const attribute = tracer.line.geometry.getAttribute('position');
        attribute.needsUpdate = true;
        tracer.line.geometry.computeBoundingSphere();
        const material = tracer.line.material;
        if (!Array.isArray(material)) material.opacity = 0.5;
        tracer.life = TRACER_LIFE;
        tracer.max = TRACER_LIFE;
        tracer.line.visible = true;
      }

      if (!fx.impact) return;
      const spark = takeSprite();
      spark.sprite.position.copy(fx.impact).addScaledVector(fx.dir, -0.06);
      const material = spark.sprite.material;
      material.color.setHex(fx.flesh ? 0xff4428 : 0xffd27a);
      material.opacity = 1;
      spark.sprite.scale.setScalar(fx.melee ? 0.22 : 0.12);
      spark.sprite.visible = true;
      spark.life = SPARK_LIFE;
      spark.max = SPARK_LIFE;
    },

    update(dt: number): void {
      if (flashLife > 0) {
        flashLife -= dt;
        const fade = Math.max(0, flashLife / flashMax);
        flashMat.opacity = fade * 0.9;
        light.intensity = fade * 1.6;
        muzzle.visible = flashLife > 0;
        if (flashLife <= 0) light.intensity = 0;
      }

      for (const tracer of tracers) {
        if (tracer.life <= 0) continue;
        tracer.life -= dt;
        const material = tracer.line.material;
        if (!Array.isArray(material)) material.opacity = Math.max(0, tracer.life / tracer.max) * 0.45;
        if (tracer.life <= 0) tracer.line.visible = false;
      }

      for (const spark of sparks) {
        if (spark.life <= 0) continue;
        spark.life -= dt;
        spark.sprite.material.opacity = Math.max(0, spark.life / spark.max);
        if (spark.life <= 0) spark.sprite.visible = false;
      }
    },
  };
}
