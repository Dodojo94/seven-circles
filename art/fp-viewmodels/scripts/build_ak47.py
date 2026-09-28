"""
ORIGINAL AK-pattern assault rifle FP graybox (idle).
Not a Valve/CS/Doom mesh — box/cyl silhouette only.

Pivot convention (all FP weapons):
  - Root at grip (pistol grip cradle / trigger hand)
  - Muzzle / forward along local -Z (Three.js camera look dir when parented)
  - +Y up, +X right of FOV
"""
import sys
from pathlib import Path
from math import radians

SCRIPTS = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPTS))

import bpy
from common import (
    reset_scene,
    make_mat,
    box,
    cyl,
    join_named,
    make_right_hand_stub,
    set_origin_world,
    apply_all,
    triangulate,
    count_tris,
    export_glb,
)


def build():
    reset_scene()
    mat_gun = make_mat("ak_metal", (0.32, 0.34, 0.36, 1), rough=0.55, metal=0.55)
    mat_wood = make_mat("ak_wood", (0.28, 0.18, 0.12, 1), rough=0.85, metal=0.0)
    mat_dark = make_mat("ak_dark", (0.12, 0.12, 0.13, 1), rough=0.7, metal=0.2)
    mat_skin = make_mat("fp_skin", (0.55, 0.40, 0.32, 1), rough=0.8, metal=0.0)
    mat_sleeve = make_mat("fp_sleeve", (0.15, 0.12, 0.10, 1), rough=0.9, metal=0.0)

    # --- Receiver (body). Grip cradle at origin later.
    # Layout in build space before origin shift: barrel toward -Z.
    receiver = box("ak_receiver", (0.055, 0.085, 0.28), loc=(0.0, 0.02, 0.02), mat=mat_gun)
    # Dust cover / top rail stub
    top_cover = box("ak_top", (0.045, 0.025, 0.22), loc=(0.0, 0.07, 0.0), mat=mat_dark)
    # Rear sight block
    rear_sight = box("ak_rsight", (0.03, 0.035, 0.04), loc=(0.0, 0.09, 0.10), mat=mat_dark)
    # Front sight / gas block area
    gas_block = box("ak_gas", (0.04, 0.05, 0.05), loc=(0.0, 0.05, -0.28), mat=mat_gun)
    front_sight = box("ak_fsight", (0.012, 0.045, 0.02), loc=(0.0, 0.09, -0.30), mat=mat_dark)

    # Barrel (cylinder along Z then we rotate — default cyl is along Z)
    barrel = cyl(
        "ak_barrel",
        0.012,
        0.38,
        loc=(0.0, 0.035, -0.42),
        verts=10,
        mat=mat_gun,
    )
    # Muzzle brake
    muzzle = box("ak_muzzle", (0.028, 0.028, 0.045), loc=(0.0, 0.035, -0.62), mat=mat_dark)

    # Handguard (wood-ish)
    handguard = box("ak_hg", (0.06, 0.07, 0.18), loc=(0.0, 0.02, -0.16), mat=mat_wood)
    # Lower handguard
    handguard_lo = box("ak_hg_lo", (0.055, 0.035, 0.16), loc=(0.0, -0.02, -0.15), mat=mat_wood)

    # Mag (curved AK-style — approximate with angled boxes)
    mag = box("ak_mag", (0.035, 0.12, 0.07), loc=(0.0, -0.09, 0.02), rot=(radians(12), 0, 0), mat=mat_dark)
    mag2 = box("ak_mag2", (0.032, 0.08, 0.06), loc=(0.0, -0.16, 0.0), rot=(radians(22), 0, 0), mat=mat_dark)

    # Pistol grip (wood) — this is near our final pivot
    grip = box("ak_grip", (0.035, 0.10, 0.055), loc=(0.0, -0.06, 0.12), rot=(radians(8), 0, 0), mat=mat_wood)
    # Trigger guard
    tg = box("ak_tg", (0.025, 0.035, 0.05), loc=(0.0, -0.02, 0.08), mat=mat_gun)

    # Stock
    stock_neck = box("ak_stock_n", (0.04, 0.05, 0.12), loc=(0.0, 0.01, 0.22), mat=mat_wood)
    stock = box("ak_stock", (0.045, 0.11, 0.18), loc=(0.0, 0.0, 0.36), mat=mat_wood)
    stock_pad = box("ak_pad", (0.05, 0.12, 0.025), loc=(0.0, 0.0, 0.46), mat=mat_dark)

    gun = join_named(
        [
            "ak_receiver",
            "ak_top",
            "ak_rsight",
            "ak_gas",
            "ak_fsight",
            "ak_barrel",
            "ak_muzzle",
            "ak_hg",
            "ak_hg_lo",
            "ak_mag",
            "ak_mag2",
            "ak_grip",
            "ak_tg",
            "ak_stock_n",
            "ak_stock",
            "ak_pad",
        ],
        "ak47_gun",
    )

    # Pivot at grip cradle (approx center of pistol grip top)
    grip_pivot = (0.0, -0.02, 0.12)
    set_origin_world(gun, grip_pivot)
    # Origin now at grip in world; slide object to world 0 WITHOUT re-applying location
    # (apply_all(location=True) would shift the origin off the grip).
    import bpy as _bpy
    _bpy.ops.object.select_all(action="DESELECT")
    gun.select_set(True)
    _bpy.context.view_layer.objects.active = gun
    _bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    gun.location = (0.0, 0.0, 0.0)

    hand = make_right_hand_stub(mat_skin, mat_sleeve, grip_at=(0.0, -0.02, 0.0))
    _bpy.ops.object.select_all(action="DESELECT")
    hand.select_set(True)
    _bpy.context.view_layer.objects.active = hand
    _bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    # Hand was built around grip_at ≈ (0,-0.02,0); nudge so palm sits on grip
    hand.location = (0.0, 0.0, 0.0)

    # Empty root
    root = bpy.data.objects.new("ak47_fp", None)
    bpy.context.collection.objects.link(root)
    root.empty_display_type = "ARROWS"
    root.empty_display_size = 0.08
    gun.parent = root
    hand.parent = root

    triangulate(gun)
    triangulate(hand)
    tris_g = count_tris(gun)
    tris_h = count_tris(hand)
    print(f"AK47 tris: gun={tris_g} hand={tris_h} total={tris_g + tris_h}")

    out = Path(__file__).resolve().parents[1] / "exports" / "ak47_fp_v0.glb"
    out.parent.mkdir(parents=True, exist_ok=True)
    export_glb(str(out), [root])
    print(f"Exported {out}")
    return tris_g, tris_h


if __name__ == "__main__":
    build()
