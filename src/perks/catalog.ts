/**
 * Visible perk text only. No damage, rate, spread, or other base-stat numbers.
 * Effect magnitudes live in run.ts and must not be copied onto the HUD.
 */
export interface PerkDef {
  id: string;
  name: string;
  description: string;
}

export const PERK_POOL: readonly PerkDef[] = [
  {
    id: 'outlaw',
    name: 'Outlaw',
    description: 'A gun kill hastens the next reload.',
  },
  {
    id: 'feeding-frenzy',
    name: 'Feeding Frenzy',
    description: 'Rapid kills make the trigger feel lighter.',
  },
  {
    id: 'rangefinder',
    name: 'Rangefinder',
    description: 'Standing still tightens your shots.',
  },
  {
    id: 'lightweight',
    name: 'Lightweight',
    description: 'You step quicker, and your dash returns sooner.',
  },
  {
    id: 'surrounded',
    name: 'Surrounded',
    description: 'Imps crowding you take harder hits.',
  },
  {
    id: 'fourth-time',
    name: 'Fourth Time',
    description: 'Every fourth hit returns a round to the gun.',
  },
  {
    id: 'sword-logic',
    name: 'Sword Logic',
    description: 'A knife kill blesses your guns for a moment.',
  },
  {
    id: 'dragonfly',
    name: 'Dragonfly',
    description: 'Slain imps burst and wound their neighbors.',
  },
  {
    id: 'kill-clip',
    name: 'Kill Clip',
    description: 'Finishing a reload blesses that magazine.',
  },
  {
    id: 'subsistence',
    name: 'Subsistence',
    description: 'Kills slip a round back into the magazine.',
  },
];

