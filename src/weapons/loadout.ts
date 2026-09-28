import { ARCHETYPES, type WeaponArchetype, type WeaponSlot } from './catalog';

export interface HudModel {
  active: WeaponSlot;
  names: Record<WeaponSlot, string>;
  /** Mag / reserve, RELOAD, or ∞. Never a damage or rate readout. */
  ammo: string;
}

interface RuntimeWeapon {
  arch: WeaponArchetype;
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

  constructor(archetypes: readonly WeaponArchetype[] = ARCHETYPES) {
    const weapons = {} as Record<WeaponSlot, RuntimeWeapon>;
    const names = {} as Record<WeaponSlot, string>;
    for (const slot of SLOT_ORDER) {
      const arch = archetypes.find((item) => item.slot === slot);
      if (!arch) throw new Error(`missing archetype ${slot}`);
      weapons[slot] = {
        arch,
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

  tick(dt: number): void {
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
    }
  }

  swap(slot: WeaponSlot): void {
    if (slot === this.active) return;
    this.weapons[this.active].reloading = 0;
    this.active = slot;
  }

  /** Starts a reload. False when melee, already reloading, full, or no reserve. */
  requestReload(): boolean {
    const weapon = this.weapons[this.active];
    if (weapon.arch.fire === 'melee') return false;
    if (weapon.reloading > 0) return false;
    if (weapon.reserve <= 0) return false;
    if (weapon.mag >= weapon.arch.magSize) return false;
    weapon.reloading = weapon.arch.reload;
    return true;
  }

  /**
   * Consume a trigger pull. `held` is for full-auto; `edge` is a fresh click
   * for the pistol and knife. Returns the hidden archetype when a shot fires.
   */
  pull(held: boolean, edge: boolean): WeaponArchetype | null {
    const weapon = this.weapons[this.active];
    if (weapon.reloading > 0 || weapon.cooldown > 0) return null;
    const trigger = weapon.arch.fire === 'auto' ? held : edge;
    if (!trigger) return null;
    if (weapon.arch.fire !== 'melee') {
      if (weapon.mag <= 0) return null;
      weapon.mag -= 1;
    }
    weapon.cooldown = weapon.arch.interval;
    return weapon.arch;
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
