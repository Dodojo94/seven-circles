import * as THREE from 'three';
import type { WeaponSlot } from './catalog';

const CELL_W = 320;
const CELL_H = 240;
/** How long the fire / slash cell stays up. Shorter than the AK's shot gap. */
const FLASH: Record<WeaponSlot, number> = {
  primary: 0.07,
  secondary: 0.08,
  melee: 0.14,
};

/**
 * Idle-cell tip (x from the left, y from the top). Bottom-center of the cell is the pivot.
 * Placing that tip on the view axis puts the muzzle / blade on the crosshair.
 */
const AIM: Record<WeaponSlot, { x: number; y: number }> = {
  primary: { x: 116, y: 14 },
  secondary: { x: 120, y: 18 },
  melee: { x: 112, y: 30 },
};

const SHEET: Record<WeaponSlot, string> = {
  primary: '/weapons/fp_sprites/ak47_fp_sheet_v0.png',
  secondary: '/weapons/fp_sprites/deagle_fp_sheet_v0.png',
  melee: '/weapons/fp_sprites/knife_fp_sheet_v0.png',
};

const QUAD_H = 0.56;
const QUAD_W = QUAD_H * (CELL_W / CELL_H);
const DIST = 0.8;

function loadSheet(url: string): THREE.Texture {
  const map = new THREE.TextureLoader().load(url);
  map.magFilter = THREE.NearestFilter;
  map.minFilter = THREE.NearestFilter;
  map.generateMipmaps = false;
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = THREE.ClampToEdgeWrapping;
  map.wrapT = THREE.ClampToEdgeWrapping;
  map.repeat.set(1 / 2, 1);
  map.offset.set(0, 0);
  return map;
}

function pivotFor(slot: WeaponSlot): THREE.Vector3 {
  const aim = AIM[slot];
  const ox = ((aim.x - CELL_W / 2) / CELL_W) * QUAD_W;
  const oy = ((CELL_H - aim.y) / CELL_H) * QUAD_H;
  return new THREE.Vector3(-ox, -oy, -DIST);
}

/**
 * Doom-style weapon quad parented to the camera. One cell at a time — never the full strip.
 * Guide PNGs are not loaded.
 */
export function createWeaponView(camera: THREE.Camera): {
  setSlot(slot: WeaponSlot): void;
  kick(): void;
  update(dt: number): void;
} {
  const maps: Record<WeaponSlot, THREE.Texture> = {
    primary: loadSheet(SHEET.primary),
    secondary: loadSheet(SHEET.secondary),
    melee: loadSheet(SHEET.melee),
  };
  const pivots: Record<WeaponSlot, THREE.Vector3> = {
    primary: pivotFor('primary'),
    secondary: pivotFor('secondary'),
    melee: pivotFor('melee'),
  };

  const geometry = new THREE.PlaneGeometry(QUAD_W, QUAD_H);
  geometry.translate(0, QUAD_H / 2, 0);
  const material = new THREE.MeshBasicMaterial({
    map: maps.primary,
    transparent: true,
    alphaTest: 0.35,
    depthTest: false,
    depthWrite: false,
    fog: false,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = 'fp-weapon-sprite';
  mesh.frustumCulled = false;
  mesh.renderOrder = 20;
  mesh.position.copy(pivots.primary);
  camera.add(mesh);

  let slot: WeaponSlot = 'primary';
  let flash = 0;

  function apply(): void {
    const map = maps[slot];
    map.offset.x = flash > 0 ? 0.5 : 0;
    material.map = map;
    mesh.position.copy(pivots[slot]);
  }

  return {
    setSlot(next: WeaponSlot): void {
      if (next === slot) return;
      slot = next;
      flash = 0;
      apply();
    },
    kick(): void {
      flash = FLASH[slot];
      apply();
    },
    update(dt: number): void {
      if (flash <= 0) return;
      flash -= dt;
      if (flash <= 0) {
        flash = 0;
        apply();
      }
    },
  };
}
