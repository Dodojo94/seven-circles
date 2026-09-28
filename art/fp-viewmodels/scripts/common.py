"""Shared helpers for FP viewmodel graybox builds (Blender 4.2)."""
import bpy
import bmesh
from mathutils import Vector, Matrix
from math import radians


def reset_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for block in (bpy.data.meshes, bpy.data.materials, bpy.data.objects):
        for b in list(block):
            block.remove(b)


def make_mat(name, color=(0.45, 0.45, 0.48, 1.0), rough=0.75, metal=0.15):
    mat = bpy.data.materials.get(name)
    if mat is None:
        mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nt = mat.node_tree
    bsdf = nt.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = color
        bsdf.inputs["Roughness"].default_value = rough
        if "Metallic" in bsdf.inputs:
            bsdf.inputs["Metallic"].default_value = metal
    return mat


def assign_mat(obj, mat):
    if obj.data.materials:
        obj.data.materials[0] = mat
    else:
        obj.data.materials.append(mat)


def box(name, size, loc=(0, 0, 0), rot=(0, 0, 0), mat=None):
    """Create a box; size is full extents (sx, sy, sz). Loc = center."""
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rot)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = (size[0] * 0.5, size[1] * 0.5, size[2] * 0.5)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if mat:
        assign_mat(obj, mat)
    return obj


def cyl(name, radius, depth, loc=(0, 0, 0), rot=(0, 0, 0), verts=12, mat=None):
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=verts, radius=radius, depth=depth, location=loc, rotation=rot
    )
    obj = bpy.context.active_object
    obj.name = name
    if mat:
        assign_mat(obj, mat)
    return obj


def cone(name, radius1, depth, loc=(0, 0, 0), rot=(0, 0, 0), verts=10, mat=None):
    bpy.ops.mesh.primitive_cone_add(
        vertices=verts, radius1=radius1, radius2=0.0, depth=depth, location=loc, rotation=rot
    )
    obj = bpy.context.active_object
    obj.name = name
    if mat:
        assign_mat(obj, mat)
    return obj


def join_named(names, result_name):
    objs = [bpy.data.objects[n] for n in names if n in bpy.data.objects]
    if not objs:
        return None
    bpy.ops.object.select_all(action="DESELECT")
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    if len(objs) > 1:
        bpy.ops.object.join()
    joined = bpy.context.active_object
    joined.name = result_name
    return joined


def parent_keep(child, parent):
    child.parent = parent
    child.matrix_parent_inverse = parent.matrix_world.inverted()


def set_origin_world(obj, world_point):
    """Move object origin to world_point without moving mesh visually."""
    mw = obj.matrix_world
    local = mw.inverted() @ Vector(world_point)
    obj.data.transform(Matrix.Translation(-local))
    obj.matrix_world.translation = Vector(world_point)


def apply_all(obj):
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)


def triangulate(obj):
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.mesh.quads_convert_to_tris(quad_method="BEAUTY", ngon_method="BEAUTY")
    bpy.ops.object.mode_set(mode="OBJECT")


def count_tris(obj):
    mesh = obj.data
    mesh.calc_loop_triangles()
    return len(mesh.loop_triangles)


def export_glb(path, objects):
    bpy.ops.object.select_all(action="DESELECT")
    for o in objects:
        o.select_set(True)
        for c in o.children_recursive:
            c.select_set(True)
    bpy.context.view_layer.objects.active = objects[0]
    bpy.ops.export_scene.gltf(
        filepath=path,
        export_format="GLB",
        use_selection=True,
        export_apply=True,
        export_yup=True,
        export_materials="EXPORT",
        export_texcoords=True,
        export_normals=True,
    )


def make_right_hand_stub(mat_skin, mat_sleeve, grip_at=(0, 0, 0)):
    """Simple right-hand + forearm stub gripping near origin. +X = right of FOV."""
    # Palm block around grip
    palm = box(
        "hand_palm",
        (0.07, 0.04, 0.09),
        loc=(grip_at[0] + 0.02, grip_at[1] - 0.01, grip_at[2] + 0.01),
        mat=mat_skin,
    )
    # Fingers wrapping forward (-Z) over grip
    fingers = box(
        "hand_fingers",
        (0.055, 0.035, 0.06),
        loc=(grip_at[0] + 0.015, grip_at[1] + 0.02, grip_at[2] - 0.03),
        mat=mat_skin,
    )
    # Thumb
    thumb = box(
        "hand_thumb",
        (0.025, 0.03, 0.045),
        loc=(grip_at[0] - 0.025, grip_at[1] + 0.01, grip_at[2] - 0.01),
        mat=mat_skin,
    )
    # Wrist / forearm extending toward camera (+Z) and down/right
    forearm = cyl(
        "hand_forearm",
        0.028,
        0.22,
        loc=(grip_at[0] + 0.04, grip_at[1] - 0.03, grip_at[2] + 0.14),
        rot=(radians(18), radians(-12), radians(8)),
        verts=10,
        mat=mat_sleeve,
    )
    return join_named(
        ["hand_palm", "hand_fingers", "hand_thumb", "hand_forearm"], "fp_hand"
    )
