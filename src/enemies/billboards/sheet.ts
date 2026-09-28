/** Mesh temp imp sheet. Do not load imp_sheet_v0_GUIDE.png. */
export const IMP_SHEET_URL = '/enemies/imp_sheet_v0.png';
export const FRAME_W = 64;
export const FRAME_H = 96;
export const FRAME_COUNT = 5;
/** Rows 0–27. Top ~29% of the frame. */
export const HEAD_END = 28;
export const QUAD_W = 1.7;
export const QUAD_H = 2.55;

export const IMP_FRAME = {
  idle: 0,
  hurt: 1,
  death0: 2,
  death1: 3,
  death2: 4,
} as const;

/** World Y where the head band starts. Hits at or above this are crits. */
export function headBandY(centerY: number, scaleY: number): number {
  const height = QUAD_H * scaleY;
  const top = centerY + height / 2;
  return top - (HEAD_END / FRAME_H) * height;
}
