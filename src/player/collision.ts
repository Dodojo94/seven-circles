/** Axis-aligned box in world space. Static arena geometry only. */
export interface Aabb {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
}

/** Horizontal half-extent of the player capsule, approximated as an AABB. */
export const PLAYER_RADIUS = 0.35;

export function boxFromCenter(
  x: number,
  z: number,
  width: number,
  height: number,
  depth: number,
): Aabb {
  return {
    minX: x - width / 2,
    maxX: x + width / 2,
    minY: 0,
    maxY: height,
    minZ: z - depth / 2,
    maxZ: z + depth / 2,
  };
}

function overlaps(
  x: number,
  z: number,
  feetY: number,
  headY: number,
  box: Aabb,
): boolean {
  if (headY <= box.minY || feetY >= box.maxY) return false;
  if (x + PLAYER_RADIUS <= box.minX || x - PLAYER_RADIUS >= box.maxX) return false;
  if (z + PLAYER_RADIUS <= box.minZ || z - PLAYER_RADIUS >= box.maxZ) return false;
  return true;
}

/**
 * Move in X then Z, dropping an axis that would intersect a solid.
 * Gives wall sliding without a physics engine.
 */
export function moveWithCollision(
  x: number,
  z: number,
  dx: number,
  dz: number,
  feetY: number,
  headY: number,
  boxes: readonly Aabb[],
): { x: number; z: number } {
  let nx = x + dx;
  if (boxes.some((box) => overlaps(nx, z, feetY, headY, box))) nx = x;
  let nz = z + dz;
  if (boxes.some((box) => overlaps(nx, nz, feetY, headY, box))) nz = z;
  return { x: nx, z: nz };
}
