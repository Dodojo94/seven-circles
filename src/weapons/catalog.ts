/**
 * Hidden weapon numbers. Gameplay code may read these.
 * The HUD must not: no damage, spread, range, or rate — name and ammo only.
 */
export type WeaponSlot = 'primary' | 'secondary' | 'melee';

export type FireMode = 'auto' | 'semi' | 'melee';

export interface WeaponArchetype {
  slot: WeaponSlot;
  name: string;
  fire: FireMode;
  damage: number;
  /** Seconds between shots. */
  interval: number;
  pellets: number;
  /** Random aim offset, radians, applied around the view axis. */
  spread: number;
  range: number;
  magSize: number;
  reserve: number;
  /** Seconds for a full reload. Melee ignores this. */
  reload: number;
}

export const ARCHETYPES: readonly WeaponArchetype[] = [
  {
    slot: 'primary',
    name: 'Hellbore',
    fire: 'auto',
    damage: 11,
    interval: 0.09,
    pellets: 1,
    spread: 0.02,
    range: 80,
    magSize: 30,
    reserve: 90,
    reload: 1.45,
  },
  {
    slot: 'secondary',
    name: 'Ash Scatter',
    fire: 'semi',
    damage: 8,
    interval: 0.55,
    pellets: 8,
    spread: 0.28,
    range: 18,
    magSize: 6,
    reserve: 24,
    reload: 2.05,
  },
  {
    slot: 'melee',
    name: 'Cleaver',
    fire: 'melee',
    damage: 48,
    interval: 0.42,
    pellets: 1,
    spread: 0,
    range: 2.5,
    magSize: 0,
    reserve: 0,
    reload: 0,
  },
];
