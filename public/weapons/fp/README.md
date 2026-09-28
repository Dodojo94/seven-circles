# Floor 1 FP viewmodels — graybox V0 (Mesh)

Original first-person weapon blockouts for the three Floor 1 archetypes in
`src/weapons/catalog.ts`. **Not** CS / Valve / Doom / CRUEL mesh rips — box/cylinder
silhouettes only. Enemies stay billboards; this folder is weapons only.

## Files

| File | Slot | Notes |
|------|------|-------|
| `ak47_fp_v0.glb` | primary (AK-47) | Full-auto assault-rifle silhouette + right-hand stub |
| `deagle_fp_v0.glb` | secondary (Desert Eagle) | Large semi pistol silhouette + hand stub |
| `knife_fp_v0.glb` | melee (Knife) | Blade + handle + hand stub |

Idle pose only. PBR materials are untextured gray / wood / skin placeholders
(Principled BSDF) so Sacred can swap textures later.

Rebuild sources (Blender 4.2 Python): `art/fp-viewmodels/scripts/`.

## Pivot / axes (LOCKED for V0)

**One convention for all three:**

| Axis | Meaning |
|------|---------|
| **Origin** | Grip cradle (trigger hand / handle center) |
| **Local −Z** | Muzzle / blade tip (forward = Three.js camera look dir) |
| **Local +Y** | Up |
| **Local +X** | Right of FOV |

glTF export uses Y-up. When the GLB is parented to the Three.js camera with
**no extra mesh rotation**, −Z points where the player aims.

Root node names: `ak47_fp` / `deagle_fp` / `knife_fp` (empty) with children
`*_gun` / `knife_blade` and `fp_hand`.

## Suggested attach (Sacred)

```ts
// After GLTFLoader — do NOT rotate the mesh to "fix" forward; convention is −Z.
camera.add(model);
model.position.set(0.28, -0.32, -0.55); // lower-right, slightly forward of eye
model.rotation.set(0, 0, 0);
// Optional FOV readability scale:
// model.scale.setScalar(1.05);
```

Tune offsets per weapon if the hand stub clips the near plane. Knife may sit
slightly closer / more centered for slash readability (phase 2).

## Scale

- World intent: **1 unit ≈ 1 m**
- FP models are **slightly oversized** for FOV readability
- AK overall length ≈ **1.05–1.10** local units (muzzle→stock); pistol / knife shorter

## Poly counts (approx, after triangulate)

| Asset | Gun/blade | Hand stub | Total tris |
|-------|-----------|-----------|------------|
| AK-47 | ~216 | ~72 | **~288** |
| Desert Eagle | ~264 | ~72 | **~336** |
| Knife | ~192 | ~72 | **~264** |

Low/mid graybox — clean quads→tris, no intentional N-gon mess. Separate meshes
(gun + hand) are OK.

## Phase 2 (parked — not in this PR)

- Fire / recoil kick poses
- Reload (mag out / in)
- Knife slash / stab anims
- Hellish wear bevels, unique trim, textures
- Left-hand / dual-grip stubs if needed
- Gameplay wiring / loader (Sacred)

## Out of scope here

- Wiring into the FPS camera or HUD
- Audio / muzzle flash
- Floors 2–7 weapon variants
- Merging this PR (bots don’t merge)

## Dev notes

- Art vibe: non-cartoony hell, readable silhouettes (same lane as `public/enemies/` imp sheet)
- Style questions (exact AK wood vs all-metal hell iron, Deagle chrome vs scorched, knife shape): escalate to Niki — no product locks invented here
- Previews for review live on the art scratch machine at
  `/workspace/seven-circles-art/fp-viewmodels/previews/` (not committed)
