# START — Seven Circles

Cold-start for humans and bots.

## Clone & run

```bash
git clone https://github.com/Dodojo94/seven-circles.git
cd seven-circles
npm install
npm run dev
```

Open the URL Vite prints (default `http://localhost:5173`). Click the game view to capture the mouse. **WASD** walk · **Space** jump · **Ctrl** or **C** crouch. You cannot walk through the box walls.

### Scripts

| Script | What it does |
|--------|----------------|
| `npm run dev` | Vite HMR dev server |
| `npm run build` | `tsc` typecheck + production bundle to `dist/` |
| `npm run preview` | Serve `dist/` locally |

**Always** run `npm run build` before opening a PR. Build must pass.

## Windows notes

- Prefer **Node 20 LTS** (or newer current LTS). Install from [nodejs.org](https://nodejs.org/) or `winget install OpenJS.NodeJS.LTS`.
- Use **Git Bash**, **PowerShell**, or **WSL2**. Path separators in docs use `/`; Windows accepts them in npm scripts.
- If `npm run dev` fails on port bind, free `5173` or set `server.port` in `vite.config.ts`.
- Pointer lock may need a real click on the canvas; some remote-desktop tools block it.

## Bot path (Grok Build / agents)

1. Read **VISION.md** and **GROK_BUILD.md** before coding.
2. Branch: `work/<slug>` (never push features straight to `main` after this seed).
3. Implement only what the prompt asks; respect V0 locks (one floor, no RoR loop, movement/weapons/stats rules).
4. `npm run build` must succeed.
5. Open a **PR**. Bots **never merge**. Humans merge after review.

Local workspace for this seed: `/workspace/seven-circles` (box). On a laptop, any clone path is fine.

## First-look checklist

- [ ] Dark hellish scene, flat floor, box walls
- [ ] HUD: “Seven Circles V0 — Floor 1”
- [ ] Weapon labels: Primary / Secondary / Melee
- [ ] One billboard enemy placeholder facing the camera
- [ ] Walk / crouch / jump only (no slide/sprint)
