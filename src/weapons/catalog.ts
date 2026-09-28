/**
 * Hidden weapon numbers. Gameplay code may read these.
 * The HUD must not: no damage, spread, range, or rate — name and ammo only.
 *
 * Feel targets (not shown): AK full-auto ~600 rpm, mild spread;
 * Desert Eagle semi, one pellet, harder hit, tighter than the AK;
 * knife is a short swing with no magazine.
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
    name: 'AK-47',
    fire: 'auto',
    damage: 13,
    interval: 0.1,
    pellets: 1,
    spread: 0.03,
    range: 90,
    magSize: 30,
    reserve: 90,
    reload: 2.4,
  },
  {
    slot: 'secondary',
    name: 'Desert Eagle',
    fire: 'semi',
    damage: 40,
    interval: 0.34,
    pellets: 1,
    spread: 0.008,
    range: 75,
    magSize: 7,
    reserve: 35,
    reload: 2.15,
  },
  {
    slot: 'melee',
    name: 'Knife',
    fire: 'melee',
    damage: 55,
    interval: 0.45,
    pellets: 1,
    spread: 0,
    range: 2.15,
    magSize: 0,
    reserve: 0,
    reload: 0,
  },
];
