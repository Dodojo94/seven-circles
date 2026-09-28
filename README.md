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

Click the canvas for pointer lock. **WASD** walk (one speed) · **Space** jump · **Ctrl** or **C** crouch · **Shift** dash (tap, look-relative, works in the air) · **1 / 2 / 3** swap AK-47 / Desert Eagle / Knife · **LMB** fire · **R** reload. Guns show ammo counts only — no damage or rate. Knife is infinite. A perk offer appears at the start and every few kills (names and one-line text only, three active max). **Esc** or the Aim button opens sensitivity (saved in the browser). No sprint-hold, no slide. Walls block movement and shots. Killed billboards respawn after 5 seconds.

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
