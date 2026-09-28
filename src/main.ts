import * as THREE from 'three';
import { createBillboardEnemy, faceBillboard } from './enemies/billboards/placeholder';
import { createArena } from './floors/arena';
import { createFpsControls } from './player/fpsControls';
import { initHud } from './ui/hud';

const app = document.getElementById('app');
if (!app) throw new Error('#app missing');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0505);
scene.fog = new THREE.FogExp2(0x1a0808, 0.045);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(0, 1.6, 8);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = false;
app.appendChild(renderer.domElement);

const ambient = new THREE.AmbientLight(0x3a1515, 0.55);
scene.add(ambient);
const key = new THREE.DirectionalLight(0xaa2222, 0.85);
key.position.set(4, 10, 2);
scene.add(key);
const fill = new THREE.PointLight(0xff4400, 1.4, 28, 2);
fill.position.set(0, 3.2, -2);
scene.add(fill);
const ember = new THREE.PointLight(0xff6622, 0.7, 10, 2);
ember.position.set(-2, 1.4, -1);
scene.add(ember);

const colliders = createArena(scene);
const enemy = createBillboardEnemy();
enemy.position.set(0, 1.25, -4);
scene.add(enemy);

const controls = createFpsControls(camera, renderer.domElement, colliders);
initHud();

const clock = new THREE.Clock();

function onResize(): void {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onResize);

function tick(): void {
  const dt = Math.min(clock.getDelta(), 0.05);
  controls.update(dt);
  faceBillboard(enemy, camera);
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
tick();
