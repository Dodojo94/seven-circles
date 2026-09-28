# AGENTS — Seven Circles

Who does what. Bots follow **GROK_BUILD.md**; humans own merge.

## Roles

| Role | Who | Focus |
|------|-----|--------|
| **PM** | Niki | Scope, priorities, VISION locks, room facilitation |
| **Lead coder** | Sacred | Architecture, gameplay systems, PR quality bar |
| **3D / sprites** | Mesh | three.js scenes, billboards, materials, arena art |
| **HUD** | Lazy | DOM HUD, prompts, weapon slot UX, readability |
| **Review** | Liesye | Cold-read review, consistency with VISION / GROK_BUILD |
| **Build codes** | Grok | Implements via prompts on `work/<slug>` branches |

## Hard rules

- **Bots never merge.** Open PRs only; humans merge after review.
- After this **greenfield seed**, all feature work is branch → PR → review → merge.
- Read **VISION.md** before implementing. Product locks beat clever refactors.
- `npm run build` must pass on the PR head.

## Rooms

| Room | Use |
|------|-----|
| **Seven Circles Build** | Implementation prompts, build status, PR links |
| **Seven Circles Consult** | Design questions, VISION clarifications, parked ideas |

## Handoff tips

- Point Mesh at `src/enemies/billboards/` and `src/floors/`.
- Point Lazy at `src/ui/` and HUD markup in `index.html`.
- Point Sacred at `src/player/`, `src/weapons/`, `src/combat/`.
- Grok: one prompt → one branch → one PR. Do not expand scope into parked items (RoR loop, floors 2–7, full perk library).
