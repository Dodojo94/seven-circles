import { PERK_POOL } from '../perks/catalog';
import { ARCHETYPES, type WeaponArchetype, type WeaponSlot } from './catalog';

/** Archetype plus the perk ids rolled onto this copy. Text stays in the perk catalog. */
export interface WeaponInstance {
  archetype: WeaponArchetype;
  perkIds: readonly string[];
}

/**
 * Roll 1–2 unique perks onto one archetype.
 * TODO: floor loot will call rollWeapon when a drop spawns. No world drops yet.
 */
export function rollWeapon(slot: WeaponSlot, random: () => number = Math.random): WeaponInstance {
  const archetype = ARCHETYPES.find((item) => item.slot === slot);
  if (!archetype) throw new Error(`missing archetype ${slot}`);
  const count = random() < 0.5 ? 1 : 2;
  const bag = PERK_POOL.map((perk) => perk.id);
  const perkIds: string[] = [];
  while (perkIds.length < count && bag.length > 0) {
    const index = Math.floor(random() * bag.length);
    const id = bag.splice(index, 1)[0];
    if (id) perkIds.push(id);
  }
  return { archetype, perkIds };
}
