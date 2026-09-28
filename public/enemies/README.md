# Floor 1 imp — temp billboard sheet (Mesh)

Original hell-imp placeholder art for yaw-only `THREE` billboards. **Not** Doom / CRUEL rips.

## Files

| File | Use |
|------|-----|
| `imp_sheet_v0.png` | Horizontal strip (preferred for Sacred wiring) |
| `imp_idle.png` | Frame 0 alone |
| `imp_hurt.png` | Frame 1 alone (hit flash / snarl) |
| `imp_death_0.png` … `imp_death_2.png` | Death sequence (3 frames) |
| `imp_sheet_v0_GUIDE.png` | Dev overlay only (head band + feet pivot) — do not load in-game |

## Sheet layout

- **Frame size:** `64 × 96` px (≈ 2:3, matches current quad `1.7 × 2.55`)
- **Frame count:** 5 — order L→R: `idle` · `hurt` · `death_0` · `death_1` · `death_2`
- **Sheet size:** `320 × 96` (`imp_sheet_v0.png`)
- **Color:** RGBA, transparent outside silhouette; `NearestFilter` recommended
- **Texel budget:** ~30 KB total sheet; keep nearest sampling

## Pivot / placement

- **Feet pivot:** bottom-center of each frame `(32, 96)` in frame space
- World: place mesh so feet sit on ground (`y ≈ halfQuadHeight` if plane origin is center — current placeholder uses center origin at `y ≈ 1.28`)
- **Yaw-only** billboard (existing `faceBillboard`)

## Head band (for later height-based crits)

- Clear **head region = top ~29%** of the quad / frame: rows `0 … 27` of 96 (`HEAD_END = 28`)
- Niki ask was top **25–35%** — we locked **~29%**
- Crits = hitscan UV/height in that band; **not wired in this PR** (Sacred later)
- Idle / hurt / early death keep horns + skull inside that band

## Suggested loader (Sacred later)

```ts
// UV strip: frameIndex / 5
const FRAME = { idle: 0, hurt: 1, death0: 2, death1: 3, death2: 4 } as const;
// map.repeat.set(1/5, 1); map.offset.set(frame / 5, 0);
```

## Out of scope here

- Hitscan headshot logic
- Replacing canvas blob in `placeholder.ts` (follow-up)
- Floors 2–7 enemy variants
