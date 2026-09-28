# FOLDERS — proposed `src/` layout

Scaffold folders exist; grow modules inside them rather than inventing parallel trees.

```
src/
  main.ts                 # boot: scene, renderer, loop
  vite-env.d.ts
  player/                 # FPS camera, movement (walk/crouch/jump), input
  weapons/                # primary / secondary / melee definitions & swap
  combat/                 # hitscan/projectiles, damage, death
  enemies/
    billboards/           # Sprite / camera-facing quad enemies
  floors/                 # V0 arena; later: generators for circles 1–7
  perks/                  # visible Destiny-like perks (base stats stay hidden)
  ui/                     # HUD helpers (title, weapon slots, future prompts)
```

## Notes

- **Billboards live under `enemies/billboards/`** — keep mesh enemies out of V0 unless VISION changes.
- **Perks ≠ base gun stats.** Put displayable perk data in `perks/`; do not surface raw damage tables in HUD.
- **Floors:** V0 uses `floors/arena.ts`. Floors 2–7 stay parked.
- Public static assets (textures, audio) go in `public/` when added.
- Prefer small named modules over a single god-file; keep `main.ts` as composition root.
