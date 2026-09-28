import { KILLS_PER_OFFER, MAX_ACTIVE_PERKS, PERK_POOL, type PerkDef } from './catalog';

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

function shuffle(source: readonly PerkDef[], random: () => number): PerkDef[] {
  const copy = source.slice();
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    const swap = copy[i];
    const next = copy[j];
    if (!swap || !next) continue;
    copy[i] = next;
    copy[j] = swap;
  }
  return copy;
}

export interface PerkRun {
  tick(dt: number): void;
  isOffering(): boolean;
  offer(): readonly PerkDef[];
  choose(index: number): void;
  modifiers(ctx: { moving: boolean; nearby: number }): CombatMods;
  onGunHit(): boolean;
  onKill(event: KillEvent): KillResult;
  onReloadComplete(): string | null;
  views(ctx: { moving: boolean; nearby: number }): PerkView[];
  /** Hidden splash amount. Zero when this kill should not burst. */
  splashDamage(): number;
}

export function createPerkRun(random: () => number = Math.random): PerkRun {
  const owned: PerkDef[] = [];
  let offerCards: PerkDef[] = [];
  let kills = 0;
  let now = 0;
  let hitStreak = 0;
  let lastKillAt = -999;
  let outlawUntil = 0;
  let frenzyUntil = 0;
  let swordUntil = 0;
  let clipUntil = 0;
  const pulse = new Map<string, number>();

  function owns(id: string): boolean {
    return owned.some((perk) => perk.id === id);
  }

  function pulsePerk(id: string): void {
    pulse.set(id, now + PULSE);
  }

  function rollOffer(): void {
    if (owned.length >= MAX_ACTIVE_PERKS) {
      offerCards = [];
      return;
    }
    const taken = new Set(owned.map((perk) => perk.id));
    const fresh = shuffle(
      PERK_POOL.filter((perk) => !taken.has(perk.id)),
      random,
    );
    offerCards = fresh.slice(0, 3);
  }

  rollOffer();

  return {
    tick(dt: number): void {
      now += dt;
    },

    isOffering(): boolean {
      return offerCards.length > 0;
    },

    offer(): readonly PerkDef[] {
      return offerCards;
    },

    choose(index: number): void {
      const picked = offerCards[index];
      if (!picked) return;
      if (owned.some((perk) => perk.id === picked.id)) return;
      owned.push(picked);
      offerCards = [];
    },

    modifiers(ctx: { moving: boolean; nearby: number }): CombatMods {
      const mods = { ...EMPTY_MODS };
      if (owns('outlaw') && now < outlawUntil) mods.reload *= 0.45;
      if (owns('feeding-frenzy') && now < frenzyUntil) mods.interval *= 0.62;
      if (owns('rangefinder') && !ctx.moving) mods.spread *= 0.4;
      if (owns('lightweight')) {
        mods.walk *= 1.15;
        mods.dashCooldown *= 0.62;
      }
      if (owns('surrounded') && ctx.nearby >= 2) {
        mods.gunDamage *= 1.4;
        mods.meleeDamage *= 1.4;
      }
      if (owns('sword-logic') && now < swordUntil) mods.gunDamage *= 1.45;
      if (owns('kill-clip') && now < clipUntil) mods.gunDamage *= 1.35;
      return mods;
    },

    onGunHit(): boolean {
      if (!owns('fourth-time')) return false;
      hitStreak += 1;
      if (hitStreak < 4) return false;
      hitStreak = 0;
      pulsePerk('fourth-time');
      return true;
    },

    onKill(event: KillEvent): KillResult {
      const result: KillResult = { splash: false, refund: false, toast: null };
      kills += 1;

      if (!event.splash && owns('feeding-frenzy')) {
        if (now - lastKillAt <= FRENZY_GAP) {
          frenzyUntil = now + FRENZY_TIME;
          result.toast = 'Feeding Frenzy';
          pulsePerk('feeding-frenzy');
        }
      }
      lastKillAt = now;

      if (!event.splash && !event.melee && owns('outlaw')) {
        outlawUntil = now + OUTLAW_TIME;
        result.toast = 'Outlaw';
        pulsePerk('outlaw');
      }
      if (!event.splash && event.melee && owns('sword-logic')) {
        swordUntil = now + SWORD_TIME;
        result.toast = 'Sword Logic';
        pulsePerk('sword-logic');
      }
      if (!event.splash && owns('subsistence')) {
        result.refund = true;
        pulsePerk('subsistence');
      }
      if (!event.splash && owns('dragonfly')) {
        result.splash = true;
        result.toast = result.toast ?? 'Dragonfly';
        pulsePerk('dragonfly');
      }

      if (owned.length < MAX_ACTIVE_PERKS && kills % KILLS_PER_OFFER === 0) rollOffer();
      return result;
    },

    onReloadComplete(): string | null {
      if (!owns('kill-clip')) return null;
      clipUntil = now + CLIP_TIME;
      pulsePerk('kill-clip');
      return 'Kill Clip';
    },

    views(ctx: { moving: boolean; nearby: number }): PerkView[] {
      return owned.map((perk) => {
        const until = pulse.get(perk.id) ?? 0;
        let hot = now < until;
        if (perk.id === 'outlaw' && now < outlawUntil) hot = true;
        if (perk.id === 'feeding-frenzy' && now < frenzyUntil) hot = true;
        if (perk.id === 'sword-logic' && now < swordUntil) hot = true;
        if (perk.id === 'kill-clip' && now < clipUntil) hot = true;
        if (perk.id === 'lightweight') hot = true;
        if (perk.id === 'rangefinder' && !ctx.moving) hot = true;
        if (perk.id === 'surrounded' && ctx.nearby >= 2) hot = true;
        return { name: perk.name, description: perk.description, hot };
      });
    },

    splashDamage(): number {
      return 16;
    },
  };
}
