import type { WeaponSlot } from '../weapons/catalog';
import type { HudModel } from '../weapons/loadout';

const SLOT_IDS: Record<WeaponSlot, string> = {
  primary: 'slot-primary',
  secondary: 'slot-secondary',
  melee: 'slot-melee',
};

/** Name + ammo + which slot is held. No damage, rate, or other base stats. */
export function initHud(): { sync(model: HudModel): void } {
  const slots = {} as Record<WeaponSlot, HTMLElement>;
  for (const slot of Object.keys(SLOT_IDS) as WeaponSlot[]) {
    const element = document.getElementById(SLOT_IDS[slot]);
    if (!element) throw new Error(`#${SLOT_IDS[slot]} missing`);
    slots[slot] = element;
  }
  const ammo = document.getElementById('hud-ammo');
  if (!ammo) throw new Error('#hud-ammo missing');

  const keys: Record<WeaponSlot, string> = {
    primary: '1',
    secondary: '2',
    melee: '3',
  };

  return {
    sync(model: HudModel): void {
      for (const slot of Object.keys(slots) as WeaponSlot[]) {
        const element = slots[slot];
        element.textContent = `[${keys[slot]}] ${model.names[slot]}`;
        element.classList.toggle('active', slot === model.active);
      }
      ammo.textContent = model.ammo;
    },
  };
}
