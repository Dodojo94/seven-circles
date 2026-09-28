"""
ORIGINAL combat knife FP graybox (melee).
Pivot at handle grip center; blade tip along local -Z.
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
    mat_blade = make_mat("kn_blade", (0.55, 0.58, 0.62, 1), rough=0.25, metal=0.85)
    mat_handle = make_mat("kn_handle", (0.12, 0.10, 0.09, 1), rough=0.85, metal=0.0)
    mat_guard = make_mat("kn_guard", (0.25, 0.25, 0.28, 1), rough=0.45, metal=0.6)
    mat_skin = make_mat("fp_skin", (0.55, 0.40, 0.32, 1), rough=0.8, metal=0.0)
    mat_sleeve = make_mat("fp_sleeve", (0.15, 0.12, 0.10, 1), rough=0.9, metal=0.0)

    # Blade — long flat silhouette, tip toward -Z
    blade = box("kn_blade", (0.006, 0.045, 0.22), loc=(0.0, 0.01, -0.14), mat=mat_blade)
    # Tip taper (smaller box)
    tip = box("kn_tip", (0.005, 0.028, 0.05), loc=(0.0, 0.005, -0.27), mat=mat_blade)
    # False edge / spine ridge
    spine = box("kn_spine", (0.004, 0.012, 0.18), loc=(0.0, 0.03, -0.12), mat=mat_blade)

    # Crossguard
    guard = box("kn_guard", (0.055, 0.02, 0.025), loc=(0.0, 0.0, -0.02), mat=mat_guard)
    # Ricasso
    ricasso = box("kn_ricasso", (0.01, 0.035, 0.03), loc=(0.0, 0.0, -0.04), mat=mat_blade)

    # Handle
    handle = box("kn_handle", (0.028, 0.035, 0.11), loc=(0.0, 0.0, 0.05), mat=mat_handle)
    # Handle wrap rings
    for i, z in enumerate((0.02, 0.05, 0.08)):
        cyl(
            f"kn_ring_{i}",
            0.018,
            0.012,
            loc=(0.0, 0.0, z),
            verts=10,
            mat=mat_guard,
        )
    # Pommel
    pommel = box("kn_pommel", (0.032, 0.038, 0.025), loc=(0.0, 0.0, 0.12), mat=mat_guard)

    parts = [
        "kn_blade",
        "kn_tip",
        "kn_spine",
        "kn_guard",
        "kn_ricasso",
        "kn_handle",
        "kn_pommel",
    ] + [f"kn_ring_{i}" for i in range(3)]

    knife = join_named(parts, "knife_blade")
    grip_pivot = (0.0, 0.0, 0.05)
    set_origin_world(knife, grip_pivot)
    import bpy as _bpy
    _bpy.ops.object.select_all(action="DESELECT")
    knife.select_set(True)
    _bpy.context.view_layer.objects.active = knife
    _bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    knife.location = (0.0, 0.0, 0.0)

    hand = make_right_hand_stub(mat_skin, mat_sleeve, grip_at=(0.0, 0.0, 0.0))
    _bpy.ops.object.select_all(action="DESELECT")
    hand.select_set(True)
    _bpy.context.view_layer.objects.active = hand
    _bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    hand.location = (0.0, 0.0, 0.0)

    root = bpy.data.objects.new("knife_fp", None)
    bpy.context.collection.objects.link(root)
    root.empty_display_type = "ARROWS"
    root.empty_display_size = 0.05
    knife.parent = root
    hand.parent = root

    triangulate(knife)
    triangulate(hand)
    tris_g = count_tris(knife)
    tris_h = count_tris(hand)
    print(f"Knife tris: blade={tris_g} hand={tris_h} total={tris_g + tris_h}")

    out = Path(__file__).resolve().parents[1] / "exports" / "knife_fp_v0.glb"
    out.parent.mkdir(parents=True, exist_ok=True)
    export_glb(str(out), [root])
    print(f"Exported {out}")
    return tris_g, tris_h


if __name__ == "__main__":
    build()
