import * as THREE from 'three';
import { castPellet, cleaveOverlap } from './combat/hitscan';
import { createCombatFx } from './combat/fx';
import { createEnemyWorld } from './enemies/billboards/enemy';
import { createArena } from './floors/arena';
import { createFpsControls } from './player/fpsControls';
import { initHud } from './ui/hud';
import { bindWeaponInput } from './weapons/input';
import { Loadout } from './weapons/loadout';

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

const arena = createArena(scene);
const enemies = createEnemyWorld(scene);
const spawns: Array<[number, number]> = [
  [0, -4],
  [-5, -8],
  [5.5, -8],
  [-8, 11],
];
for (const [x, z] of spawns) enemies.spawn(x, 1.28, z);

const controls = createFpsControls(camera, renderer.domElement, arena.colliders);
const weapons = new Loadout();
const weaponInput = bindWeaponInput(renderer.domElement);
const hud = initHud();
const fx = createCombatFx(scene, camera);
const muzzle = new THREE.Vector3();

const clock = new THREE.Clock();

function onResize(): void {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onResize);

function fire(arch: NonNullable<ReturnType<Loadout['pull']>>): void {
  const melee = arch.fire === 'melee';
  if (melee) {
    const swing = cleaveOverlap(camera, arena.solids, enemies.alive(), arch.range, 0.62);
    for (const enemy of swing.enemies) enemy.applyDamage(arch.damage);
    camera.getWorldDirection(muzzle);
    const from = camera.position.clone().addScaledVector(muzzle, 0.4);
    fx.shot(from, swing.point, true);
    return;
  }

  const targets = enemies.alive();
  camera.getWorldDirection(muzzle);
  const from = camera.position.clone().addScaledVector(muzzle, 0.45);
  const impacts = [];
  for (let pellet = 0; pellet < arch.pellets; pellet += 1) {
    impacts.push(castPellet(camera, arena.solids, targets, arch.range, arch.spread));
  }
  for (const hit of impacts) {
    hit.enemy?.applyDamage(arch.damage);
    fx.shot(from, hit.point, false);
  }
}

function tick(): void {
  const dt = Math.min(clock.getDelta(), 0.05);
  controls.update(dt);
  scene.updateMatrixWorld(true);

  const locked = document.pointerLockElement === renderer.domElement;
  const input = weaponInput.read();
  if (input.slot) weapons.swap(input.slot);
  if (input.reload) weapons.requestReload();
  weapons.tick(dt);
  const shot = weapons.pull(locked && input.held, locked && input.edge);
  if (shot) fire(shot);

  enemies.update(dt, camera);
  fx.update(dt);
  hud.sync(weapons.hud());
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
tick();
