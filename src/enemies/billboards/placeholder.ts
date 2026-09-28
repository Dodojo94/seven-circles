import * as THREE from 'three';
import { FRAME_COUNT, IMP_SHEET_URL, QUAD_H, QUAD_W, headBandY } from './sheet';

const sheet = new THREE.TextureLoader().load(IMP_SHEET_URL);
sheet.magFilter = THREE.NearestFilter;
sheet.minFilter = THREE.NearestFilter;
sheet.generateMipmaps = false;
sheet.colorSpace = THREE.SRGBColorSpace;

/** Yaw-only imp quad. Feet sit at the bottom of the plane (center origin). */
export function createBillboardEnemy(): THREE.Mesh {
  const geometry = new THREE.PlaneGeometry(QUAD_W, QUAD_H);
  const material = new THREE.MeshBasicMaterial({
    map: sheet,
    transparent: true,
    alphaTest: 0.4,
    side: THREE.DoubleSide,
  });
  const quad = new THREE.Mesh(geometry, material);
  quad.name = 'imp-billboard';
  setImpFrame(quad, 0);
  return quad;
}

/** L→R frame on the shared sheet. Each mesh keeps its own UVs. */
export function setImpFrame(mesh: THREE.Mesh, frame: number): void {
  const index = Math.max(0, Math.min(FRAME_COUNT - 1, frame));
  const uv = mesh.geometry.getAttribute('uv');
  const u0 = index / FRAME_COUNT;
  const u1 = (index + 1) / FRAME_COUNT;
  uv.setXY(0, u0, 1);
  uv.setXY(1, u1, 1);
  uv.setXY(2, u0, 0);
  uv.setXY(3, u1, 0);
  uv.needsUpdate = true;
}

export function isHeadHeight(mesh: THREE.Object3D, pointY: number): boolean {
  return pointY >= headBandY(mesh.position.y, mesh.scale.y);
}

/** Yaw the quad so its face points at the camera. Stays upright (no pitch). */
export function faceBillboard(billboard: THREE.Object3D, camera: THREE.Camera): void {
  const dx = camera.position.x - billboard.position.x;
  const dz = camera.position.z - billboard.position.z;
  billboard.rotation.y = Math.atan2(dx, dz);
}
