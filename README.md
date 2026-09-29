# Seven Circles

Hell-descent **billboard-sprite boomer shooter** (Doom / CRUEL vibe, Dante’s Inferno–flavored). Built with **Vite + TypeScript + three.js** only — no React, no R3F, no Babylon.

**V0** ships **one floor** for playtesting. Full game target: 7 descending floors, semi-random layouts, bosses, permadeath.

## Play / Dev

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # tsc + vite build → dist/
npm run preview  # serve production build
```

Click the canvas for pointer lock. Floor 1 is one handcrafted room about 80×80, with cover, imps, and a gold exit pad to the north. The top-right map is fixed north (N at the top): you are the wedge, imps are red dots, cover is blocks, the exit is the gold diamond. **Aim** sits above the map; the sensitivity panel opens underneath it. **WASD** walk (one speed) · **Space** jump (hold to bunnyhop; **A/D** plus look strafes in the air) · **Ctrl** or **C** crouch · **Shift** dash (tap, look-relative, works in the air) · **1 / 2 / 3** swap AK-47 / Desert Eagle / Knife · **LMB** fire · **R** reload. The gun is a sprite in the lower right; its muzzle sits on the crosshair and flashes when it fires. Guns show ammo counts only — no damage or rate. Knife is infinite. Each gun spawns with 1–2 perks (name and one line on the left; swap weapons to read the others). A headshot flashes **CRIT**. **Esc** or the Aim button opens sensitivity (saved in the browser). No sprint-hold, no slide, no double jump. Walls block movement and shots. Killed imps play a short death, then return after 5 seconds.

## Stack

| Piece | Choice |
|-------|--------|
| Bundler | Vite |
| Language | TypeScript |
| 3D | three.js |
| UI | DOM HUD (no React) |

## Docs

| File | Purpose |
|------|---------|
| [START.md](./START.md) | Clone, run, Windows notes, bot path |
| [VISION.md](./VISION.md) | North star, product locks, V0 vs full |
| [AGENTS.md](./AGENTS.md) | Roles, rooms, merge rules |
| [FOLDERS.md](./FOLDERS.md) | Proposed `src/` layout |
| [GROK_BUILD.md](./GROK_BUILD.md) | Standing rules for Grok Build agents |

## License

Private / TBD.
