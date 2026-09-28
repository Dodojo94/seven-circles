import { PERK_POOL } from './catalog';
import type { WeaponSlot } from '../weapons/catalog';

/** Hidden multipliers. Gameplay only — never render these. */
export interface CombatMods {
  gunDamage: number;
  meleeDamage: number;
  interval: number;
  spread: number;
  reload: number;
  walk: number;
  dashCooldown: number;
}

export interface PerkView {
  name: string;
  description: string;
  hot: boolean;
}

export interface KillEvent {
  melee: boolean;
  /** Splash kills must not chain another burst. */
  splash: boolean;
}

export interface KillResult {
  splash: boolean;
  refund: boolean;
  toast: string | null;
}

const OUTLAW_TIME = 3.5;
const FRENZY_GAP = 2.2;
const FRENZY_TIME = 3;
const SWORD_TIME = 4;
const CLIP_TIME = 4.5;
const PULSE = 0.45;

const EMPTY_MODS: CombatMods = {
  gunDamage: 1,
  meleeDamage: 1,
  interval: 1,
  spread: 1,
  reload: 1,
  walk: 1,
  dashCooldown: 1,
};

interface SlotBuff {
  hitStreak: number;
  lastKillAt: number;
  outlawUntil: number;
  frenzyUntil: number;
  clipUntil: number;
  pulse: Map<string, number>;
}

function freshBuff(): SlotBuff {
  return {
    hitStreak: 0,
    lastKillAt: -999,
    outlawUntil: 0,
    frenzyUntil: 0,
    clipUntil: 0,
    pulse: new Map(),
  };
}

/**
 * Perks on the equipped weapon only.
 * Sword Logic is the exception: a knife that has it blesses guns after you swap.
 */
export interface WeaponPerks {
  tick(dt: number): void;
  setEquipped(slot: WeaponSlot, perkIds: readonly string[]): void;
  modifiers(ctx: { moving: boolean; nearby: number }): CombatMods;
  onGunHit(): boolean;
  onKill(event: KillEvent): KillResult;
  onReloadComplete(): string | null;
  views(ctx: { moving: boolean; nearby: number }): PerkView[];
  splashDamage(): number;
}

export function createWeaponPerks(): WeaponPerks {
  const buffs: Record<WeaponSlot, SlotBuff> = {
    primary: freshBuff(),
    secondary: freshBuff(),
    melee: freshBuff(),
  };
  let slot: WeaponSlot = 'primary';
  let ids: readonly string[] = [];
  let now = 0;
  let swordUntil = 0;

  function has(id: string): boolean {
    return ids.includes(id);
  }

  function buff(): SlotBuff {
    return buffs[slot];
  }

  return {
    tick(dt: number): void {
      now += dt;
    },

    setEquipped(next: WeaponSlot, perkIds: readonly string[]): void {
      slot = next;
      ids = perkIds;
    },

    modifiers(ctx: { moving: boolean; nearby: number }): CombatMods {
      const mods = { ...EMPTY_MODS };
      const state = buff();
      if (has('outlaw') && now < state.outlawUntil) mods.reload *= 0.45;
      if (has('feeding-frenzy') && now < state.frenzyUntil) mods.interval *= 0.62;
      if (has('rangefinder') && !ctx.moving) mods.spread *= 0.4;
      if (has('lightweight')) {
        mods.walk *= 1.15;
        mods.dashCooldown *= 0.62;
      }
      if (has('surrounded') && ctx.nearby >= 2) {
        mods.gunDamage *= 1.4;
        mods.meleeDamage *= 1.4;
      }
      if (now < swordUntil) mods.gunDamage *= 1.45;
      if (has('kill-clip') && now < state.clipUntil) mods.gunDamage *= 1.35;
      return mods;
    },

    onGunHit(): boolean {
      if (!has('fourth-time')) return false;
      const state = buff();
      state.hitStreak += 1;
      if (state.hitStreak < 4) return false;
      state.hitStreak = 0;
      state.pulse.set('fourth-time', now + PULSE);
      return true;
    },

    onKill(event: KillEvent): KillResult {
      const result: KillResult = { splash: false, refund: false, toast: null };
      const state = buff();

      if (!event.splash && has('feeding-frenzy')) {
        if (now - state.lastKillAt <= FRENZY_GAP) {
          state.frenzyUntil = now + FRENZY_TIME;
          result.toast = 'Feeding Frenzy';
          state.pulse.set('feeding-frenzy', now + PULSE);
        }
      }
      state.lastKillAt = now;

      if (!event.splash && !event.melee && has('outlaw')) {
        state.outlawUntil = now + OUTLAW_TIME;
        result.toast = 'Outlaw';
        state.pulse.set('outlaw', now + PULSE);
      }
      if (!event.splash && event.melee && has('sword-logic')) {
        swordUntil = now + SWORD_TIME;
        result.toast = 'Sword Logic';
        state.pulse.set('sword-logic', now + PULSE);
      }
      if (!event.splash && has('subsistence')) {
        result.refund = true;
        state.pulse.set('subsistence', now + PULSE);
      }
      if (!event.splash && has('dragonfly')) {
        result.splash = true;
        result.toast = result.toast ?? 'Dragonfly';
        state.pulse.set('dragonfly', now + PULSE);
      }
      return result;
    },

    onReloadComplete(): string | null {
      if (!has('kill-clip')) return null;
      const state = buff();
      state.clipUntil = now + CLIP_TIME;
      state.pulse.set('kill-clip', now + PULSE);
      return 'Kill Clip';
    },

    views(ctx: { moving: boolean; nearby: number }): PerkView[] {
      const state = buff();
      const views: PerkView[] = [];
      for (const id of ids) {
        const perk = PERK_POOL.find((item) => item.id === id);
        if (!perk) continue;
        const until = state.pulse.get(id) ?? 0;
        let hot = now < until;
        if (id === 'outlaw' && now < state.outlawUntil) hot = true;
        if (id === 'feeding-frenzy' && now < state.frenzyUntil) hot = true;
        if (id === 'sword-logic' && now < swordUntil) hot = true;
        if (id === 'kill-clip' && now < state.clipUntil) hot = true;
        if (id === 'lightweight') hot = true;
        if (id === 'rangefinder' && !ctx.moving) hot = true;
        if (id === 'surrounded' && ctx.nearby >= 2) hot = true;
        views.push({ name: perk.name, description: perk.description, hot });
      }
      return views;
    },

    splashDamage(): number {
      return 16;
    },
  };
}
