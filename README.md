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

Click the canvas for pointer lock. **WASD** walk (one speed) · **Space** jump · **Ctrl** or **C** crouch · **1 / 2 / 3** swap Hellbore / Ash Scatter / Cleaver · **LMB** fire · **R** reload. Guns show ammo counts only — no damage or rate. Melee is infinite. No sprint, no slide. Walls block movement and shots.

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
