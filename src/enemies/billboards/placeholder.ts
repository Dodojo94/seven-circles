import * as THREE from 'three';

/**
 * Camera-facing billboard placeholder (yaw-only quad).
 * Art is a canvas blob; Mesh replaces this later.
 */
export function createBillboardEnemy(): THREE.Mesh {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 192;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, 128, 192);
    ctx.fillStyle = '#cc2218';
    ctx.beginPath();
    ctx.ellipse(64, 108, 46, 70, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#7a100c';
    ctx.fillRect(28, 150, 24, 36);
    ctx.fillRect(76, 150, 24, 36);
    ctx.fillStyle = '#ffee88';
    ctx.beginPath();
    ctx.arc(46, 88, 12, 0, Math.PI * 2);
    ctx.arc(82, 88, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#110000';
    ctx.beginPath();
    ctx.arc(46, 90, 5, 0, Math.PI * 2);
    ctx.arc(82, 90, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#3a0000';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(64, 118, 16, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.colorSpace = THREE.SRGBColorSpace;

  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    alphaTest: 0.4,
    side: THREE.DoubleSide,
  });
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 2.55), material);
  quad.name = 'enemy-billboard-placeholder';
  return quad;
}

/** Yaw the quad so its face points at the camera. Stays upright (no pitch). */
export function faceBillboard(billboard: THREE.Object3D, camera: THREE.Camera): void {
  const dx = camera.position.x - billboard.position.x;
  const dz = camera.position.z - billboard.position.z;
  billboard.rotation.y = Math.atan2(dx, dz);
}
