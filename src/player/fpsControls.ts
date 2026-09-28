import * as THREE from 'three';
import { moveBody, type Aabb } from './collision';

/**
 * Pointer-lock FPS controller.
 * Walk, crouch, jump, and a Shift dash. No slide, no sprint-hold, no double jump.
 */
export interface FpsControls {
  update(dt: number): void;
  /** Multiplier on mouse look. 1 is the default mid sensitivity. */
  setLookScale(scale: number): void;
}

export interface FpsControlOptions {
  onDash?: () => void;
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
const BASE_FOV = 75;
const DASH_SPEED = 22;
const DASH_TIME = 0.18;
const DASH_COOLDOWN = 0.8;

export function createFpsControls(
  camera: THREE.PerspectiveCamera,
  domElement: HTMLElement,
  colliders: readonly Aabb[],
  options: FpsControlOptions = {},
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
  let dashTime = 0;
  let dashCooldown = 0;
  let fovKick = 0;

  const euler = new THREE.Euler(0, 0, 0, 'YXZ');
  const forward = new THREE.Vector3();
  const right = new THREE.Vector3();
  const move = new THREE.Vector3();
  const look = new THREE.Vector3();
  const planar = new THREE.Vector3();
  const dashDir = new THREE.Vector3();

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

  function tryDash(): void {
    if (dashTime > 0 || dashCooldown > 0) return;
    euler.set(pitch, yaw, 0);
    camera.quaternion.setFromEuler(euler);
    camera.getWorldDirection(look);

    planar.set(0, 0, 0);
    forward.set(-Math.sin(yaw), 0, -Math.cos(yaw));
    right.set(Math.cos(yaw), 0, -Math.sin(yaw));
    if (keys.has('KeyW')) planar.add(forward);
    if (keys.has('KeyS')) planar.sub(forward);
    if (keys.has('KeyA')) planar.sub(right);
    if (keys.has('KeyD')) planar.add(right);

    if (planar.lengthSq() < 1e-6) {
      dashDir.copy(look);
    } else {
      planar.normalize();
      const vertical = THREE.MathUtils.clamp(look.y, -1, 1);
      const horizontal = Math.sqrt(Math.max(0, 1 - vertical * vertical));
      dashDir.set(planar.x * horizontal, vertical, planar.z * horizontal);
      if (dashDir.lengthSq() < 1e-6) dashDir.copy(look);
      else dashDir.normalize();
    }

    dashTime = DASH_TIME;
    fovKick = 6;
    grounded = false;
    options.onDash?.();
  }

  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'KeyC') e.preventDefault();
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
      if (!e.repeat) tryDash();
      return;
    }
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

      let dx = 0;
      let dy = 0;
      let dz = 0;

      if (dashTime > 0) {
        const step = Math.min(dt, dashTime);
        dx = dashDir.x * DASH_SPEED * step;
        dy = dashDir.y * DASH_SPEED * step;
        dz = dashDir.z * DASH_SPEED * step;
        dashTime -= dt;
        if (dashTime <= 0) {
          dashTime = 0;
          velocityY = dashDir.y * 6;
          dashCooldown = DASH_COOLDOWN;
        }
      } else {
        dashCooldown = Math.max(0, dashCooldown - dt);
        forward.set(-Math.sin(yaw), 0, -Math.cos(yaw));
        right.set(Math.cos(yaw), 0, -Math.sin(yaw));
        move.set(0, 0, 0);
        if (keys.has('KeyW')) move.add(forward);
        if (keys.has('KeyS')) move.sub(forward);
        if (keys.has('KeyA')) move.sub(right);
        if (keys.has('KeyD')) move.add(right);
        if (move.lengthSq() > 0) {
          move.normalize().multiplyScalar(speed * dt);
          dx = move.x;
          dz = move.z;
        }

        if (grounded && keys.has('Space')) {
          velocityY = JUMP_VELOCITY;
          grounded = false;
        }
        velocityY -= GRAVITY * dt;
        dy = velocityY * dt;
      }

      const bodyHeight = eye + HEAD_CLEARANCE;
      const next = moveBody(
        camera.position.x,
        camera.position.z,
        feetY,
        dx,
        dy,
        dz,
        bodyHeight,
        colliders,
      );
      camera.position.x = next.x;
      camera.position.z = next.z;
      feetY = next.feetY;
      if (next.grounded) {
        grounded = true;
        if (velocityY < 0) velocityY = 0;
        if (dashDir.y < 0) dashDir.y = 0;
      } else if (dashTime <= 0) {
        grounded = false;
      }
      if (next.hitCeil) {
        if (velocityY > 0) velocityY = 0;
        if (dashDir.y > 0) dashDir.y = 0;
      }

      camera.position.y = feetY + eye;
      euler.set(pitch, yaw, 0);
      camera.quaternion.setFromEuler(euler);

      const fade = Math.max(0, fovKick - dt * 30);
      if (fade !== fovKick) {
        fovKick = fade;
        camera.fov = BASE_FOV + fovKick;
        camera.updateProjectionMatrix();
      }
    },
    setLookScale(scale: number): void {
      lookScale = Number.isFinite(scale) ? Math.min(3, Math.max(0.15, scale)) : 1;
    },
  };
}
