"""
ORIGINAL large semi-auto pistol FP graybox (Desert Eagle–class silhouette).
Not a licensed mesh — blockout only.
Pivot: grip root; muzzle along local -Z.
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
    mat_slide = make_mat("dg_slide", (0.42, 0.44, 0.46, 1), rough=0.4, metal=0.7)
    mat_frame = make_mat("dg_frame", (0.22, 0.22, 0.24, 1), rough=0.55, metal=0.45)
    mat_grip = make_mat("dg_grip", (0.08, 0.08, 0.09, 1), rough=0.9, metal=0.0)
    mat_skin = make_mat("fp_skin", (0.55, 0.40, 0.32, 1), rough=0.8, metal=0.0)
    mat_sleeve = make_mat("fp_sleeve", (0.15, 0.12, 0.10, 1), rough=0.9, metal=0.0)

    # Large slide
    slide = box("dg_slide", (0.038, 0.045, 0.22), loc=(0.0, 0.04, -0.06), mat=mat_slide)
    # Slide serrations (visual blocks)
    for i, z in enumerate((-0.02, 0.0, 0.02, 0.04)):
        box(f"dg_serr_{i}", (0.042, 0.012, 0.012), loc=(0.0, 0.06, z), mat=mat_frame)
    # Barrel protruding
    barrel = cyl(
        "dg_barrel",
        0.011,
        0.10,
        loc=(0.0, 0.04, -0.20),
        verts=10,
        mat=mat_slide,
    )
    # Muzzle crown
    muzzle = cyl(
        "dg_muzzle",
        0.014,
        0.02,
        loc=(0.0, 0.04, -0.26),
        verts=10,
        mat=mat_frame,
    )
    # Front sight
    fs = box("dg_fs", (0.008, 0.018, 0.015), loc=(0.0, 0.07, -0.15), mat=mat_frame)
    # Rear sight
    rs = box("dg_rs", (0.028, 0.016, 0.02), loc=(0.0, 0.07, 0.04), mat=mat_frame)

    # Frame / dust cover under slide
    frame = box("dg_frame", (0.036, 0.04, 0.16), loc=(0.0, 0.01, -0.02), mat=mat_frame)
    # Trigger guard
    tg = box("dg_tg", (0.028, 0.04, 0.055), loc=(0.0, -0.02, 0.02), mat=mat_frame)
    # Trigger
    trigger = box("dg_trigger", (0.012, 0.025, 0.02), loc=(0.0, -0.01, 0.02), mat=mat_grip)

    # Grip (thick Desert-Eagle-class)
    grip = box("dg_grip", (0.04, 0.12, 0.065), loc=(0.0, -0.07, 0.08), rot=(radians(5), 0, 0), mat=mat_grip)
    grip_panel_l = box("dg_gpl", (0.008, 0.10, 0.055), loc=(-0.022, -0.07, 0.08), mat=mat_frame)
    grip_panel_r = box("dg_gpr", (0.008, 0.10, 0.055), loc=(0.022, -0.07, 0.08), mat=mat_frame)
    # Mag base pad
    mag = box("dg_mag", (0.035, 0.03, 0.05), loc=(0.0, -0.14, 0.07), mat=mat_frame)
    # Beaver tail / rear
    beaver = box("dg_beaver", (0.032, 0.035, 0.04), loc=(0.0, 0.02, 0.08), mat=mat_frame)
    # Hammer stub
    hammer = box("dg_hammer", (0.012, 0.025, 0.02), loc=(0.0, 0.05, 0.06), mat=mat_slide)

    parts = [
        "dg_slide",
        "dg_barrel",
        "dg_muzzle",
        "dg_fs",
        "dg_rs",
        "dg_frame",
        "dg_tg",
        "dg_trigger",
        "dg_grip",
        "dg_gpl",
        "dg_gpr",
        "dg_mag",
        "dg_beaver",
        "dg_hammer",
    ] + [f"dg_serr_{i}" for i in range(4)]

    gun = join_named(parts, "deagle_gun")
    grip_pivot = (0.0, -0.02, 0.06)
    set_origin_world(gun, grip_pivot)
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

    root = bpy.data.objects.new("deagle_fp", None)
    bpy.context.collection.objects.link(root)
    root.empty_display_type = "ARROWS"
    root.empty_display_size = 0.06
    gun.parent = root
    hand.parent = root

    triangulate(gun)
    triangulate(hand)
    tris_g = count_tris(gun)
    tris_h = count_tris(hand)
    print(f"Deagle tris: gun={tris_g} hand={tris_h} total={tris_g + tris_h}")

    out = Path(__file__).resolve().parents[1] / "exports" / "deagle_fp_v0.glb"
    out.parent.mkdir(parents=True, exist_ok=True)
    export_glb(str(out), [root])
    print(f"Exported {out}")
    return tris_g, tris_h


if __name__ == "__main__":
    build()
