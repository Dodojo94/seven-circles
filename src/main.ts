import * as THREE from 'three';
import { castPellet, cleaveOverlap } from './combat/hitscan';
import { createCombatFx } from './combat/fx';
import { createSfx } from './combat/sfx';
import { createEnemyWorld } from './enemies/billboards/enemy';
import { createArena } from './floors/arena';
import { createFpsControls } from './player/fpsControls';
import { initHud } from './ui/hud';
import { initAimSettings } from './ui/settings';
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

const sfx = createSfx();
const controls = createFpsControls(camera, renderer.domElement, arena.colliders, {
  onDash: () => sfx.dash(),
});
initAimSettings(renderer.domElement, (scale) => controls.setLookScale(scale));
const weapons = new Loadout();
const weaponInput = bindWeaponInput(renderer.domElement);
const hud = initHud();
const fx = createCombatFx(scene, camera);
const aim = new THREE.Vector3();

renderer.domElement.addEventListener('pointerdown', () => sfx.unlock());
window.addEventListener('keydown', () => sfx.unlock(), { once: true });

const clock = new THREE.Clock();

function onResize(): void {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onResize);

function fire(arch: NonNullable<ReturnType<Loadout['pull']>>): void {
  sfx.fire(arch.slot);
  const melee = arch.fire === 'melee';
  if (melee) {
    const swing = cleaveOverlap(camera, arena.solids, enemies.alive(), arch.range, 0.62);
    for (const enemy of swing.enemies) enemy.applyDamage(arch.damage);
    camera.getWorldDirection(aim);
    const origin = camera.position.clone().addScaledVector(aim, 0.35);
    fx.shot({
      origin,
      dir: aim.clone(),
      impact: swing.enemies.length > 0 ? swing.point : null,
      melee: true,
      flesh: swing.enemies.length > 0,
    });
    return;
  }

  const targets = enemies.alive();
  const impacts = [];
  for (let pellet = 0; pellet < arch.pellets; pellet += 1) {
    impacts.push(castPellet(camera, arena.solids, targets, arch.range, arch.spread));
  }
  for (const hit of impacts) {
    hit.enemy?.applyDamage(arch.damage);
    aim.copy(hit.point).sub(camera.position);
    if (aim.lengthSq() < 1e-6) camera.getWorldDirection(aim);
    else aim.normalize();
    fx.shot({
      origin: camera.position.clone().addScaledVector(aim, 0.4),
      dir: aim.clone(),
      impact: hit.struck ? hit.point : null,
      melee: false,
      flesh: hit.enemy !== null,
    });
  }
}

function tick(): void {
  const dt = Math.min(clock.getDelta(), 0.05);
  controls.update(dt);
  scene.updateMatrixWorld(true);

  const locked = document.pointerLockElement === renderer.domElement;
  const input = weaponInput.read();
  if (input.slot) weapons.swap(input.slot);
  if (input.reload && weapons.requestReload()) sfx.reload();
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
