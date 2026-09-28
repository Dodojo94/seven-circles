import * as THREE from 'three';
import { moveWithCollision, type Aabb } from './collision';

/**
 * Pointer-lock FPS controller.
 * One walk speed, crouch (slower + lower camera), jump. No slide, no sprint.
 */
export interface FpsControls {
  update(dt: number): void;
  /** Multiplier on mouse look. 1 is the default mid sensitivity. */
  setLookScale(scale: number): void;
}

const WALK_SPEED = 6;
const CROUCH_SPEED = 3;
const JUMP_VELOCITY = 7;
const GRAVITY = 22;
const STAND_EYE = 1.6;
const CROUCH_EYE = 0.9;
/** Extra height above the eyes so the head clips tall walls, not the camera point. */
const HEAD_CLEARANCE = 0.2;
const BASE_LOOK = 0.0022;

export function createFpsControls(
  camera: THREE.PerspectiveCamera,
  domElement: HTMLElement,
  colliders: readonly Aabb[],
): FpsControls {
  const keys = new Set<string>();
  let yaw = 0;
  let pitch = 0;
  let velocityY = 0;
  let grounded = true;
  let eye = STAND_EYE;
  let feetY = 0;
  let pointerLocked = false;
  let lookScale = 1;

  const euler = new THREE.Euler(0, 0, 0, 'YXZ');
  const forward = new THREE.Vector3();
  const right = new THREE.Vector3();
  const move = new THREE.Vector3();

  domElement.addEventListener('click', () => {
    if (!pointerLocked) void domElement.requestPointerLock();
  });

  document.addEventListener('pointerlockchange', () => {
    pointerLocked = document.pointerLockElement === domElement;
  });

  document.addEventListener('mousemove', (e) => {
    if (!pointerLocked) return;
    const sens = BASE_LOOK * lookScale;
    yaw -= e.movementX * sens;
    pitch -= e.movementY * sens;
    const limit = Math.PI / 2 - 0.01;
    pitch = Math.max(-limit, Math.min(limit, pitch));
  });

  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'KeyC') e.preventDefault();
    keys.add(e.code);
  });

  window.addEventListener('keyup', (e) => {
    keys.delete(e.code);
  });

  window.addEventListener('blur', () => {
    keys.clear();
  });

  return {
    update(dt: number): void {
      const crouched =
        keys.has('KeyC') || keys.has('ControlLeft') || keys.has('ControlRight');
      const speed = crouched ? CROUCH_SPEED : WALK_SPEED;
      const targetEye = crouched ? CROUCH_EYE : STAND_EYE;
      eye += (targetEye - eye) * Math.min(1, 12 * dt);

      forward.set(-Math.sin(yaw), 0, -Math.cos(yaw));
      right.set(Math.cos(yaw), 0, -Math.sin(yaw));
      move.set(0, 0, 0);
      if (keys.has('KeyW')) move.add(forward);
      if (keys.has('KeyS')) move.sub(forward);
      if (keys.has('KeyA')) move.sub(right);
      if (keys.has('KeyD')) move.add(right);
      if (move.lengthSq() > 0) {
        move.normalize().multiplyScalar(speed * dt);
      }

      const headY = feetY + eye + HEAD_CLEARANCE;
      const next = moveWithCollision(
        camera.position.x,
        camera.position.z,
        move.x,
        move.z,
        feetY,
        headY,
        colliders,
      );
      camera.position.x = next.x;
      camera.position.z = next.z;

      if (grounded && keys.has('Space')) {
        velocityY = JUMP_VELOCITY;
        grounded = false;
      }

      velocityY -= GRAVITY * dt;
      feetY += velocityY * dt;
      if (feetY <= 0) {
        feetY = 0;
        velocityY = 0;
        grounded = true;
      }

      camera.position.y = feetY + eye;
      euler.set(pitch, yaw, 0);
      camera.quaternion.setFromEuler(euler);
    },
    setLookScale(scale: number): void {
      lookScale = Number.isFinite(scale) ? Math.min(3, Math.max(0.15, scale)) : 1;
    },
  };
}
