import * as THREE from 'three';

/**
 * FPS camera stub.
 * Movement locks: single walk speed, crouch, jump — NO slide/sprint.
 */
export interface FpsControls {
  update(dt: number): void;
}

const WALK_SPEED = 6;
const CROUCH_SPEED = 3;
const JUMP_VELOCITY = 7;
const GRAVITY = 22;
const EYE_HEIGHT = 1.6;
const CROUCH_HEIGHT = 0.9;

export function createFpsControls(
  camera: THREE.PerspectiveCamera,
  domElement: HTMLElement,
): FpsControls {
  const keys = new Set<string>();
  let yaw = 0;
  let pitch = 0;
  let velocityY = 0;
  let grounded = true;
  let crouched = false;
  let pointerLocked = false;

  const euler = new THREE.Euler(0, 0, 0, 'YXZ');

  domElement.addEventListener('click', () => {
    if (!pointerLocked) {
      void domElement.requestPointerLock();
    }
  });

  document.addEventListener('pointerlockchange', () => {
    pointerLocked = document.pointerLockElement === domElement;
  });

  document.addEventListener('mousemove', (e) => {
    if (!pointerLocked) return;
    const sens = 0.0022;
    yaw -= e.movementX * sens;
    pitch -= e.movementY * sens;
    pitch = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, pitch));
  });

  window.addEventListener('keydown', (e) => {
    keys.add(e.code);
    // Weapon slot stubs (1/2/3) — HUD highlights via custom event
    if (e.code === 'Digit1' || e.code === 'Digit2' || e.code === 'Digit3') {
      window.dispatchEvent(
        new CustomEvent('weapon-slot', { detail: e.code }),
      );
    }
  });
  window.addEventListener('keyup', (e) => {
    keys.delete(e.code);
  });

  return {
    update(dt: number): void {
      crouched = keys.has('KeyC');
      const speed = crouched ? CROUCH_SPEED : WALK_SPEED;
      const targetEye = crouched ? CROUCH_HEIGHT : EYE_HEIGHT;

      const forward = new THREE.Vector3(
        -Math.sin(yaw),
        0,
        -Math.cos(yaw),
      );
      const right = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));

      const move = new THREE.Vector3();
      if (keys.has('KeyW')) move.add(forward);
      if (keys.has('KeyS')) move.sub(forward);
      if (keys.has('KeyA')) move.sub(right);
      if (keys.has('KeyD')) move.add(right);
      if (move.lengthSq() > 0) {
        move.normalize().multiplyScalar(speed * dt);
        camera.position.x += move.x;
        camera.position.z += move.z;
      }

      if (grounded && keys.has('Space')) {
        velocityY = JUMP_VELOCITY;
        grounded = false;
      }

      velocityY -= GRAVITY * dt;
      camera.position.y += velocityY * dt;

      const floorY = targetEye;
      if (camera.position.y <= floorY) {
        camera.position.y = floorY;
        velocityY = 0;
        grounded = true;
      }

      // Smooth crouch height when grounded
      if (grounded) {
        camera.position.y += (targetEye - camera.position.y) * Math.min(1, 12 * dt);
      }

      euler.set(pitch, yaw, 0);
      camera.quaternion.setFromEuler(euler);
    },
  };
}
