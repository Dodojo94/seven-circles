"""Render 3/4 and side preview PNGs with readable FP silhouettes."""
import sys
from pathlib import Path
from math import radians

SCRIPTS = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPTS))

import bpy
from mathutils import Vector


def scene_bounds():
    mn = Vector((1e9, 1e9, 1e9))
    mx = Vector((-1e9, -1e9, -1e9))
    for o in bpy.data.objects:
        if o.type != "MESH":
            continue
        for c in o.bound_box:
            w = o.matrix_world @ Vector(c)
            mn = Vector((min(mn.x, w.x), min(mn.y, w.y), min(mn.z, w.z)))
            mx = Vector((max(mx.x, w.x), max(mx.y, w.y), max(mx.z, w.z)))
    return mn, mx


def setup_lights():
    for o in list(bpy.data.objects):
        if o.type in {"CAMERA", "LIGHT"}:
            bpy.data.objects.remove(o, do_unlink=True)
    sun = bpy.data.lights.new("sun", type="SUN")
    sun.energy = 2.5
    so = bpy.data.objects.new("sun", sun)
    bpy.context.collection.objects.link(so)
    so.rotation_euler = (radians(50), radians(15), radians(30))
    area = bpy.data.lights.new("fill", type="AREA")
    area.energy = 40
    area.size = 2
    ao = bpy.data.objects.new("fill", area)
    bpy.context.collection.objects.link(ao)
    ao.location = (-0.6, -0.4, 0.8)


def render_views(stem: str):
    out_dir = Path(__file__).resolve().parents[1] / "previews"
    out_dir.mkdir(parents=True, exist_ok=True)
    setup_lights()
    mn, mx = scene_bounds()
    center = (mn + mx) * 0.5
    size = mx - mn
    print(f"bounds center={tuple(round(v,3) for v in center)} size={tuple(round(v,3) for v in size)}")

    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.device = "CPU"
    scene.cycles.samples = 40
    scene.render.film_transparent = True
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"

    cam_data = bpy.data.cameras.new("preview_cam")
    cam = bpy.data.objects.new("preview_cam", cam_data)
    bpy.context.collection.objects.link(cam)
    scene.camera = cam

    # --- Side (true profile): from +X, length along Z appears horizontal ---
    cam_data.type = "ORTHO"
    span = max(size.z, size.y) * 1.25
    cam_data.ortho_scale = max(span, 0.4)
    cam.location = (center.x + 2.0, center.y, center.z)
    # Look along -X with world +Y up → weapon length (Z) runs horizontal
    _dir = center - cam.location
    cam.rotation_euler = _dir.to_track_quat("-Z", "Y").to_euler()
    scene.render.resolution_x = 900
    scene.render.resolution_y = 500
    scene.render.filepath = str(out_dir / f"{stem}_side.png")
    bpy.ops.render.render(write_still=True)

    # --- 3/4 perspective ---
    cam_data.type = "PERSP"
    cam_data.lens = 55
    dist = max(size.length * 0.9, 0.5)
    cam.location = center + Vector((dist * 0.7, -dist * 0.85, dist * 0.35))
    direction = center - cam.location
    cam.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
    scene.render.resolution_x = 800
    scene.render.resolution_y = 600
    scene.render.filepath = str(out_dir / f"{stem}_34.png")
    bpy.ops.render.render(write_still=True)
    print(f"Previews -> {out_dir}/{stem}_*.png")


def main():
    argv = sys.argv
    args = argv[argv.index("--") + 1 :] if "--" in argv else []
    which = args[0] if args else "ak47"
    mod = __import__({"ak47": "build_ak47", "deagle": "build_deagle", "knife": "build_knife"}[which])
    mod.build()
    render_views(which)


if __name__ == "__main__":
    main()
