/**
 * Floor 1 plan. +Z is south (spawn), −Z is north (exit). Fixed north on the minimap.
 * Inner faces of the shell sit at ±40, so the walkable room is about 80×80.
 */
export interface Block {
  x: number;
  z: number;
  w: number;
  h: number;
  d: number;
  crate?: boolean;
}

/** Outer wall centerline. Inner face is 40. */
export const SHELL = 40.5;

export const PLAYER_SPAWN = { x: 0, z: 28 };

export const EXIT_PAD = { x: 0, z: -34, w: 3, h: 0.15, d: 3 };

export const IMP_SPAWNS: ReadonlyArray<readonly [number, number]> = [
  [-10, 30],
  [12, 30],
  [0, 22],
  [-28, 18],
  [24, 18],
  [-8, 8],
  [4, -14],
  [-26, -12],
  [28, -8],
  [0, -22],
  [-20, -32],
  [20, -32],
];

export const BLOCKS: readonly Block[] = [
  { x: 0, z: -SHELL, w: 82, h: 5, d: 1 },
  { x: 0, z: SHELL, w: 82, h: 5, d: 1 },
  { x: -SHELL, z: 0, w: 1, h: 5, d: 80 },
  { x: SHELL, z: 0, w: 1, h: 5, d: 80 },

  // Spawn gate. Opening is x ∈ (−7, 7).
  { x: -22.5, z: 16, w: 31, h: 4, d: 1 },
  { x: 22.5, z: 16, w: 31, h: 4, d: 1 },

  { x: -18, z: 4, w: 1, h: 4, d: 18 },
  { x: -28, z: -4, w: 20, h: 4, d: 1 },

  { x: 18, z: 6, w: 1, h: 4, d: 16 },
  { x: 28, z: -2, w: 18, h: 4, d: 1 },

  { x: 0, z: 2, w: 12, h: 3.5, d: 1 },
  { x: -8, z: -8, w: 1, h: 4, d: 12 },
  { x: 9, z: -6, w: 1, h: 3.5, d: 10 },
  { x: 2, z: -18, w: 14, h: 3, d: 1 },

  // Exit screen. Opening is x ∈ (−8, 8).
  { x: -22, z: -26, w: 28, h: 4, d: 1 },
  { x: 22, z: -26, w: 28, h: 4, d: 1 },

  { x: -30, z: 30, w: 12, h: 3, d: 8 },
  { x: 32, z: 28, w: 10, h: 3, d: 10 },
  { x: -33, z: -30, w: 10, h: 4, d: 1 },
  { x: 34, z: -16, w: 1, h: 4, d: 16 },

  { x: -8, z: 24, w: 1.6, h: 1.2, d: 1.6, crate: true },
  { x: 9, z: 26, w: 1.5, h: 1.1, d: 1.5, crate: true },
  { x: -30, z: 8, w: 1.8, h: 1.3, d: 1.8, crate: true },
  { x: 26, z: 12, w: 1.6, h: 1.2, d: 1.6, crate: true },
  { x: -2, z: -6, w: 1.6, h: 1.2, d: 1.6, crate: true },
  { x: 14, z: -14, w: 1.5, h: 1.1, d: 1.5, crate: true },
  { x: -22, z: -16, w: 1.6, h: 1.2, d: 1.6, crate: true },
  { x: 8, z: -32, w: 1.4, h: 1.1, d: 1.4, crate: true },
  { x: -12, z: -32, w: 1.5, h: 1.2, d: 1.5, crate: true },
];
