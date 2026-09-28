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

function overlapsXZ(x: number, z: number, box: Aabb): boolean {
  if (x + PLAYER_RADIUS <= box.minX || x - PLAYER_RADIUS >= box.maxX) return false;
  if (z + PLAYER_RADIUS <= box.minZ || z - PLAYER_RADIUS >= box.maxZ) return false;
  return true;
}

function resolveVertical(
  x: number,
  z: number,
  feetY: number,
  dy: number,
  bodyHeight: number,
  boxes: readonly Aabb[],
): { feetY: number; grounded: boolean; hitCeil: boolean } {
  let next = feetY + dy;
  let grounded = false;
  let hitCeil = false;

  if (dy > 0) {
    let limit = Number.POSITIVE_INFINITY;
    const prevHead = feetY + bodyHeight;
    for (const box of boxes) {
      if (!overlapsXZ(x, z, box)) continue;
      if (prevHead <= box.minY + 1e-3 && next + bodyHeight > box.minY) {
        limit = Math.min(limit, box.minY - bodyHeight);
      }
    }
    if (limit !== Number.POSITIVE_INFINITY) {
      next = limit;
      hitCeil = true;
    }
  } else {
    let support = 0;
    for (const box of boxes) {
      if (!overlapsXZ(x, z, box)) continue;
      if (feetY >= box.maxY - 1e-3 && next < box.maxY) {
        support = Math.max(support, box.maxY);
      }
    }
    if (next <= support) {
      next = support;
      grounded = true;
    }
  }

  if (next <= 0) {
    next = 0;
    grounded = true;
    hitCeil = false;
  }

  return { feetY: next, grounded, hitCeil };
}

export interface BodyMove {
  x: number;
  z: number;
  feetY: number;
  grounded: boolean;
  hitCeil: boolean;
}

const MAX_STEP = 0.2;

/** Substepped XZ slide plus floor / ceiling so a dash cannot tunnel solids. */
export function moveBody(
  x: number,
  z: number,
  feetY: number,
  dx: number,
  dy: number,
  dz: number,
  bodyHeight: number,
  boxes: readonly Aabb[],
): BodyMove {
  const distance = Math.max(Math.hypot(dx, dz), Math.abs(dy));
  const steps = Math.max(1, Math.ceil(distance / MAX_STEP));
  const sx = dx / steps;
  const sz = dz / steps;
  let stepY = dy / steps;
  let grounded = false;
  let hitCeil = false;

  for (let i = 0; i < steps; i += 1) {
    const horiz = moveWithCollision(x, z, sx, sz, feetY, feetY + bodyHeight, boxes);
    x = horiz.x;
    z = horiz.z;
    if (stepY === 0) continue;
    const vertical = resolveVertical(x, z, feetY, stepY, bodyHeight, boxes);
    feetY = vertical.feetY;
    grounded = vertical.grounded;
    if (vertical.grounded || vertical.hitCeil) stepY = 0;
    if (vertical.hitCeil) hitCeil = true;
  }

  if (feetY <= 1e-4) grounded = true;
  return { x, z, feetY, grounded, hitCeil };
}

