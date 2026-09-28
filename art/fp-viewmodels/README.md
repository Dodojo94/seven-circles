# FP viewmodel build scripts

Headless Blender 4.2 scripts that generate the GLBs in `public/weapons/fp/`.

```bash
BLENDER=/path/to/blender-4.2.x/blender
$BLENDER -b -P scripts/build_ak47.py
$BLENDER -b -P scripts/build_deagle.py
$BLENDER -b -P scripts/build_knife.py
# Optional previews:
$BLENDER -b -P scripts/render_previews.py -- ak47
```

Exports land next to the scripts’ parent `exports/` when run from the art scratch
copy; for the game repo, copy resulting `.glb` files into `public/weapons/fp/`.

See `public/weapons/fp/README.md` for pivot convention and attach offsets.
