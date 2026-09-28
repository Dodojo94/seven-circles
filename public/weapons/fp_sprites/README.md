# FP weapon sprites V0 (Mesh)

Original first-person **sprite** sheets for Seven Circles — Doom / CRUEL lane
(screen-space camera-attached HUD quads). **Not** ripped from CS / Valve / Doom / CRUEL.
Painted procedurally to match Floor 1 imp hell palette.

> Product lock (dodo via Niki): FP weapons are **SPRITES**, not 3D GLBs.
> PR #9 GLB grayboxes stay open/unmerged; this path supersedes them for FP.

## Files (runtime)

| File | Frames (L→R) |
|------|----------------|
| `ak47_fp_sheet_v0.png` | `idle` · `fire` (muzzle flash + recoil pose) |
| `deagle_fp_sheet_v0.png` | `idle` · `fire` |
| `knife_fp_sheet_v0.png` | `idle` · `slash` |

Guide overlays (`*_GUIDE.png`) are **dev-only** — do not load in-game.

Reload frames = phase 2 (skipped for V0).

## Sheet layout

- **Cell size:** `320 × 240` px (wide FP aspect)
- **Frame count:** 2 per weapon
- **Sheet size:** `640 × 240` (horizontal strip)
- **Color:** RGBA, transparent outside silhouette
- **Filter:** `NearestFilter`, **no mipmaps** (match enemy imp sheet)
- **Hand:** classic FP right-hand grip visible lower-right of each cell

## Pivot / anchor

- **Pivot:** **bottom-center** of each cell → `(160, 240)` in cell space
- Sacred: pin that point to lower FOV (slightly right of screen center / lower third)
- **Aim lock:** muzzle / blade tip in cell near `~(112, 30)` / `~(100, 25–45)` (upper, slightly left of
  center); grip near `~(230–260, 190–220)`. Steep up-left from grip → tip so that after
  lower-right HUD placement the barrel/blade points at **screen-center crosshair**
  (~480, 302 on 960×720), not a shallow left mid-screen aim.
- Cell contents compose the weapon for Doom-style HUD when pivot-locked

## Suggested Three.js attach (Sacred later)

```ts
// Orthographic or perspective HUD quad parented to camera (NOT world billboard)
const COLS = 2;
const FRAME = { idle: 0, fire: 1 } as const; // knife: slash == fire index 1

map.magFilter = THREE.NearestFilter;
map.minFilter = THREE.NearestFilter;
map.generateMipmaps = false;
map.repeat.set(1 / COLS, 1);
map.offset.set(frameIndex / COLS, 0);
// on fire: swap to FRAME.fire for ~1–3 frames, then idle
```

Quad sits in camera space; scale/offset so bottom-center pivot lands in lower FOV.

## Style notes

- Hell vibe: deep maroons, near-black steel, infernal wood, bruised flesh hands
- Muzzle / slash accents use imp-eye orange (`#FFBE40`) + flash red (`#FF4628`)
- Arcade-brutal wear (blood grime dots) — readable silhouettes, non-cartoony
- Screen-space only — never world billboards

## Out of scope

- Reload / inspect / empty frames
- Wiring into Sacred FPS controller (follow-up)
- Merging or polishing PR #9 GLBs
