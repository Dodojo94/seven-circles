import * as THREE from 'three';

/**
 * Billboard sprite enemy placeholder.
 * Camera-facing colored plane (THREE.Sprite or quad); Mesh will replace art later.
 */
export function createBillboardEnemy(): THREE.Object3D {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#1a0000';
    ctx.fillRect(0, 0, 128, 128);
    ctx.fillStyle = '#cc2222';
    ctx.beginPath();
    ctx.ellipse(64, 72, 40, 48, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffee88';
    ctx.beginPath();
    ctx.arc(48, 56, 10, 0, Math.PI * 2);
    ctx.arc(80, 56, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#110000';
    ctx.beginPath();
    ctx.arc(48, 56, 4, 0, Math.PI * 2);
    ctx.arc(80, 56, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;

  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthWrite: true,
  });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(2.2, 2.2, 1);
  sprite.name = 'enemy-billboard-placeholder';
  return sprite;
}
