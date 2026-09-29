# VISION — Seven Circles

North star and product locks. Encode these in every feature decision.

## Identity

| Lock | Value |
|------|--------|
| **Name** | Seven Circles |
| **Genre** | Hell-descent **billboard-sprite boomer shooter** (Doom / CRUEL vibe) |
| **Flavor** | Dante’s *Inferno* — seven circles descending |
| **Stack** | **Vite + TypeScript + three.js only** — no React, no React Three Fiber, no Babylon |

## Full game (target)

- **7 floors** descending; difficulty and set dressing escalate.
- **Semi-random layouts** per floor.
- **Bosses** on some floors.
- **Permadeath** — a run ends on death; restart from Floor 1.
- **Weapons:** hold **3 at once** — **primary**, **secondary**, **melee**; swap with **1 / 2 / 3**.
- **Movement:** **single walk speed**, **crouch**, **jump**, **Shift dash** (short look-relative burst, including vertical), plus **air-strafe / bunnyhop** (CS:S-style, not Quake surf). **NO slide. NO sprint-hold. NO double jump.**
- **Stats:** base gun stats **HIDDEN** (Counter-Strike feel). **Destiny 1** inspiration = **visible PERKS only** (players read perks, not raw DPS tables).
- **Enemies:** **billboard sprites** (`THREE.Sprite` or camera-facing quads), not skinned meshes (unless later art exception).

## V0 (this scaffold — playtesting)

### In

- **ONE floor only** — a test arena (flat floor + box walls).
- Minimal hellish lighting / fog.
- FPS camera stub (pointer lock OK as stub).
- One **billboard** enemy placeholder.
- HUD: title **“Seven Circles V0 — Floor 1”** + weapon slot labels Primary / Secondary / Melee.
- Exit can **stub** “run complete” (marker / no full flow required).
- Movement + 3 weapon slot **hooks** matching the locks above (walk, crouch, jump, Shift dash, air-strafe / bhop).

### Out (parked for later)

- Floors **2–7**
- Full **Risk of Rain** time / item loop
- Full perk library
- Real combat balance, AI, bosses, permadeath meta-progression
- Slide, sprint-hold, extra weapon slots, visible base gun stat sheets

## Non-negotiables (do not “improve away”)

1. Stack stays Vite + TS + three.js.
2. Billboard enemies for V0+.
3. Hidden base gun stats; perks visible when they exist.
4. Three weapon slots only (primary / secondary / melee).
5. Walk + crouch + jump + Shift dash + air-strafe / bhop — no slide, no sprint-hold, no double jump.
6. V0 remains **one floor** until VISION is updated.

## Tone

Infernal, readable, arcade-brutal. Prefer readable silhouettes and punchy feedback over photorealism.
