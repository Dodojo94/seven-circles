import type { WeaponSlot } from './catalog';

export interface WeaponButtons {
  held: boolean;
  edge: boolean;
  reload: boolean;
  slot: WeaponSlot | null;
}

/** Pointer-lock LMB, R, and 1/2/3. The click that captures the mouse does not fire. */
export function bindWeaponInput(domElement: HTMLElement): { read(): WeaponButtons } {
  let held = false;
  let edge = false;
  let reload = false;
  let slot: WeaponSlot | null = null;

  domElement.addEventListener('mousedown', (event) => {
    if (event.button !== 0) return;
    if (document.pointerLockElement !== domElement) return;
    held = true;
    edge = true;
  });

  window.addEventListener('mouseup', (event) => {
    if (event.button !== 0) return;
    held = false;
  });

  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    if (event.code === 'KeyR') reload = true;
    if (event.code === 'Digit1') slot = 'primary';
    if (event.code === 'Digit2') slot = 'secondary';
    if (event.code === 'Digit3') slot = 'melee';
  });

  window.addEventListener('blur', () => {
    held = false;
  });

  return {
    read(): WeaponButtons {
      const snap = { held, edge, reload, slot };
      edge = false;
      reload = false;
      slot = null;
      return snap;
    },
  };
}
