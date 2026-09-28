# GROK_BUILD — standing rules

For every Grok Build (and similar bot) task on this repo.

## Workflow

1. **Branch:** `work/<slug>` (short kebab-case). Do not commit feature work on `main` after the greenfield seed.
2. **Read:** `VISION.md` (and this file) before coding.
3. **Build:** `npm run build` must pass (`tsc` + Vite).
4. **PR:** open a pull request against `main`. **Never merge.** Humans merge.
5. **Scope:** implement only the prompt. Do not pull in parked work.

## Product locks (V0)

| Rule | Detail |
|------|--------|
| **One floor** | V0 = Floor 1 test arena only |
| **No RoR loop** | Risk of Rain time/item loop is parked |
| **Billboards** | Enemies = `THREE.Sprite` or camera-facing quads |
| **Hidden stats** | Base gun stats stay hidden (CS feel) |
| **Perks visible** | When perks exist, show perks — not raw DPS sheets |
| **Movement** | Walk + crouch + jump + Shift dash — **no slide, no sprint-hold** |
| **Weapons** | Exactly 3 slots: Primary / Secondary / Melee; swap `1` / `2` / `3` |
| **Stack** | Vite + TypeScript + three.js only — no React / R3F / Babylon |

## Definition of done (typical prompt)

- [ ] Branch named `work/<slug>`
- [ ] Changes match VISION locks
- [ ] `npm run build` succeeds
- [ ] PR opened with short summary + test notes
- [ ] No merge by the bot

## Seed exception

The **initial greenfield seed** may push directly to `main` once. All subsequent work uses the branch → PR path above.
