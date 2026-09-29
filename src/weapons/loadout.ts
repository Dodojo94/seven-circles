import { rollWeapon } from './roll';
import type { WeaponArchetype, WeaponSlot } from './catalog';

export interface HudModel {
  active: WeaponSlot;
  names: Record<WeaponSlot, string>;
  /** Mag / reserve, RELOAD, or ∞. Never a damage or rate readout. */
  ammo: string;
}

interface RuntimeWeapon {
  arch: WeaponArchetype;
  perkIds: readonly string[];
  mag: number;
  reserve: number;
  cooldown: number;
  reloading: number;
}

const SLOT_ORDER: readonly WeaponSlot[] = ['primary', 'secondary', 'melee'];

export class Loadout {
  active: WeaponSlot = 'primary';
  private readonly weapons: Record<WeaponSlot, RuntimeWeapon>;
  private readonly names: Record<WeaponSlot, string>;

  constructor(random: () => number = Math.random) {
    const weapons = {} as Record<WeaponSlot, RuntimeWeapon>;
    const names = {} as Record<WeaponSlot, string>;
    for (const slot of SLOT_ORDER) {
      const rolled = rollWeapon(slot, random);
      const arch = rolled.archetype;
      weapons[slot] = {
        arch,
        perkIds: rolled.perkIds,
        mag: arch.fire === 'melee' ? 0 : arch.magSize,
        reserve: arch.fire === 'melee' ? 0 : arch.reserve,
        cooldown: 0,
        reloading: 0,
      };
      names[slot] = arch.name;
    }
    this.weapons = weapons;
    this.names = names;
  }

  activePerks(): readonly string[] {
    return this.weapons[this.active].perkIds;
  }

  /** Advances cooldowns and reloads. True when a reload just finished. */
  tick(dt: number): boolean {
    let finished = false;
    for (const slot of SLOT_ORDER) {
      const weapon = this.weapons[slot];
      weapon.cooldown = Math.max(0, weapon.cooldown - dt);
      if (weapon.reloading <= 0) continue;
      weapon.reloading -= dt;
      if (weapon.reloading > 0) continue;
      weapon.reloading = 0;
      const need = weapon.arch.magSize - weapon.mag;
      const take = Math.min(need, weapon.reserve);
      weapon.mag += take;
      weapon.reserve -= take;
      finished = true;
    }
    return finished;
  }

  swap(slot: WeaponSlot): void {
    if (slot === this.active) return;
    this.weapons[this.active].reloading = 0;
    this.active = slot;
  }

  /** Starts a reload. `reloadMul` scales the hidden duration. */
  requestReload(reloadMul = 1): boolean {
    const weapon = this.weapons[this.active];
    if (weapon.arch.fire === 'melee') return false;
    if (weapon.reloading > 0) return false;
    if (weapon.reserve <= 0) return false;
    if (weapon.mag >= weapon.arch.magSize) return false;
    weapon.reloading = weapon.arch.reload * Math.max(0.25, reloadMul);
    return true;
  }

  /**
   * Consume a trigger pull. `held` is for full-auto; `edge` is a fresh click
   * for the pistol and knife. Returns the hidden archetype when a shot fires.
   */
  pull(held: boolean, edge: boolean, intervalMul = 1): WeaponArchetype | null {
    const weapon = this.weapons[this.active];
    if (weapon.reloading > 0 || weapon.cooldown > 0) return null;
    const trigger = weapon.arch.fire === 'auto' ? held : edge;
    if (!trigger) return null;
    if (weapon.arch.fire !== 'melee') {
      if (weapon.mag <= 0) return null;
      weapon.mag -= 1;
    }
    weapon.cooldown = weapon.arch.interval * Math.max(0.25, intervalMul);
    return weapon.arch;
  }

  /** Puts one round back into the active gun, or the primary if a knife is out. */
  refundRound(): boolean {
    const active = this.weapons[this.active];
    const weapon = active.arch.fire === 'melee' ? this.weapons.primary : active;
    if (weapon.arch.fire === 'melee') return false;
    if (weapon.reloading > 0) return false;
    if (weapon.mag < weapon.arch.magSize) weapon.mag += 1;
    else weapon.reserve += 1;
    return true;
  }

  hud(): HudModel {
    const weapon = this.weapons[this.active];
    let ammo = '∞';
    if (weapon.arch.fire !== 'melee') {
      ammo = weapon.reloading > 0 ? 'RELOAD' : `${weapon.mag} / ${weapon.reserve}`;
    }
    return { active: this.active, names: this.names, ammo };
  }
}
