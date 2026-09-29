/**
 * CS:S-flavored air control. Not Quake surf.
 * Walk, jump, dash, and gravity stay on the controller; these are the strafe/bhop knobs.
 */
export const MOVE_TUNE = {
  /** Source `sv_airaccelerate` style gain. */
  airAccelerate: 50,
  /** Cap on speed added along the strafe wish (Source's 30-unit air cap, rescaled). */
  airWishCap: 2.6,
  /** Horizontal speed the air soft-cap pulls back toward. */
  maxAirSpeed: 12.5,
  /** How fast speed above maxAirSpeed bleeds off (1/seconds). */
  airBleed: 18,
  groundFriction: 6,
  stopSpeed: 1.4,
  groundAccelerate: 55,
  /** Early tap still hops if you land inside this window. Hold Space also rehops. */
  jumpBufferMs: 120,
  /** Horizontal speed kept when a hop leaves the ground. */
  hopRetain: 0.94,
} as const;

export interface Vec2 {
  vx: number;
  vz: number;
}

/** Ground or air accelerate. `speedCap` limits the wish (Infinity on the ground). */
export function accelerate(
  vel: Vec2,
  dirX: number,
  dirZ: number,
  wishSpeed: number,
  accel: number,
  dt: number,
  speedCap: number,
): Vec2 {
  if (wishSpeed <= 1e-6) return vel;
  const capped = Math.min(wishSpeed, speedCap);
  const current = vel.vx * dirX + vel.vz * dirZ;
  const add = capped - current;
  if (add <= 0) return vel;
  let accelspeed = accel * wishSpeed * dt;
  if (accelspeed > add) accelspeed = add;
  return {
    vx: vel.vx + accelspeed * dirX,
    vz: vel.vz + accelspeed * dirZ,
  };
}

export function applyFriction(vel: Vec2, friction: number, stopSpeed: number, dt: number): Vec2 {
  const speed = Math.hypot(vel.vx, vel.vz);
  if (speed < 1e-5) return { vx: 0, vz: 0 };
  const control = Math.max(speed, stopSpeed);
  const next = Math.max(0, speed - control * friction * dt);
  const scale = next / speed;
  return { vx: vel.vx * scale, vz: vel.vz * scale };
}

/** Pull horizontal speed down toward `maxSpeed` without a hard stop. */
export function softCap(vel: Vec2, maxSpeed: number, bleed: number, dt: number): Vec2 {
  const speed = Math.hypot(vel.vx, vel.vz);
  if (speed <= maxSpeed || speed < 1e-5) return vel;
  const target = maxSpeed + (speed - maxSpeed) * Math.exp(-bleed * dt);
  const scale = target / speed;
  return { vx: vel.vx * scale, vz: vel.vz * scale };
}
