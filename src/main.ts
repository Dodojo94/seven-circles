import * as THREE from 'three';
import { castPellet, cleaveOverlap } from './combat/hitscan';
import { createCombatFx } from './combat/fx';
import { createSfx } from './combat/sfx';
import { createEnemyWorld, type LiveEnemy } from './enemies/billboards/enemy';
import { QUAD_H } from './enemies/billboards/sheet';
import { IMP_SPAWNS, PLAYER_SPAWN } from './floors/layout';
import { createArena } from './floors/arena';
import { createWeaponPerks } from './perks/run';
import { createFpsControls } from './player/fpsControls';
import { initHud } from './ui/hud';
import { initPerkHud } from './ui/perkHud';
import { initMinimap } from './ui/minimap';
import { initAimSettings } from './ui/settings';
import { bindWeaponInput } from './weapons/input';
import { createWeaponView } from './weapons/viewSprite';
import { Loadout } from './weapons/loadout';

const app = document.getElementById('app');
if (!app) throw new Error('#app missing');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0505);
scene.fog = new THREE.FogExp2(0x1a0808, 0.022);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(PLAYER_SPAWN.x, 1.6, PLAYER_SPAWN.z);

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

const north = new THREE.PointLight(0xff6622, 1.15, 34, 2);
north.position.set(0, 3.4, -30);
scene.add(north);
const west = new THREE.PointLight(0xff4400, 1, 32, 2);
west.position.set(-26, 3.2, 10);
scene.add(west);
const east = new THREE.PointLight(0xaa2218, 0.95, 32, 2);
east.position.set(26, 3.2, -4);
scene.add(east);

const arena = createArena(scene);
const enemies = createEnemyWorld(scene);
for (const [x, z] of IMP_SPAWNS) enemies.spawn(x, QUAD_H / 2, z);

const sfx = createSfx();
const controls = createFpsControls(camera, renderer.domElement, arena.colliders, {
  onDash: () => sfx.dash(),
});
initAimSettings(renderer.domElement, (scale) => controls.setLookScale(scale));
const weapons = new Loadout();
const weaponInput = bindWeaponInput(renderer.domElement);
const hud = initHud();
const perks = createWeaponPerks();
const perkHud = initPerkHud();
const minimap = initMinimap();
const fx = createCombatFx(scene, camera);
const view = createWeaponView(camera);
const aim = new THREE.Vector3();
const NEARBY_RANGE = 6;
/** Hidden. A head-band hit deals this times gun damage. */
const CRIT_MUL = 2;

function syncPerks(): void {
  perks.setEquipped(weapons.active, weapons.activePerks());
}

function perkContext(): { moving: boolean; nearby: number } {
  let nearby = 0;
  for (const enemy of enemies.alive()) {
    if (enemy.mesh.position.distanceTo(camera.position) <= NEARBY_RANGE) nearby += 1;
  }
  return { moving: controls.isMoving(), nearby };
}

renderer.domElement.addEventListener('pointerdown', () => sfx.unlock());
window.addEventListener('keydown', () => sfx.unlock(), { once: true });

const clock = new THREE.Clock();

function onResize(): void {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onResize);

function hurt(
  enemy: LiveEnemy,
  amount: number,
  melee: boolean,
  splash: boolean,
  crit: boolean,
): void {
  if (!enemy.applyDamage(amount)) {
    if (crit) perkHud.flash('CRIT');
    return;
  }
  const result = perks.onKill({ melee, splash });
  if (result.refund) weapons.refundRound();
  const label =
    crit && result.toast ? `CRIT · ${result.toast}` : crit ? 'CRIT' : result.toast;
  if (label) perkHud.flash(label);
  if (!result.splash) return;
  const origin = enemy.mesh.position.clone();
  for (const other of enemies.alive()) {
    if (other.mesh.position.distanceTo(origin) > 3.2) continue;
    hurt(other, perks.splashDamage(), false, true, false);
    fx.shot({
      origin,
      dir: aim.clone().set(0, 1, 0),
      impact: other.mesh.position.clone(),
      melee: false,
      flesh: true,
    });
  }
}

function fire(arch: NonNullable<ReturnType<Loadout['pull']>>): void {
  view.kick();
  const mods = perks.modifiers(perkContext());
  sfx.fire(arch.slot);
  const melee = arch.fire === 'melee';
  const amount = arch.damage * (melee ? mods.meleeDamage : mods.gunDamage);
  if (melee) {
    const swing = cleaveOverlap(camera, arena.solids, enemies.alive(), arch.range, 0.62);
    for (const enemy of swing.enemies) hurt(enemy, amount, true, false, false);
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
    impacts.push(
      castPellet(camera, arena.solids, targets, arch.range, arch.spread * mods.spread),
    );
  }
  for (const hit of impacts) {
    if (hit.enemy) {
      const wasAlive = hit.enemy.alive;
      const crit = wasAlive && hit.enemy.isHeadshot(hit.point);
      const hitAmount = amount * (crit ? CRIT_MUL : 1);
      hurt(hit.enemy, hitAmount, false, false, crit);
      if (wasAlive && perks.onGunHit() && weapons.refundRound() && !crit) {
        perkHud.flash('Fourth Time');
      }
    }
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
  perks.tick(dt);
  syncPerks();
  const ctx = perkContext();
  const mods = perks.modifiers(ctx);

  controls.setPerkMove(mods.walk, mods.dashCooldown);
  controls.update(dt);
  scene.updateMatrixWorld(true);

  const locked = document.pointerLockElement === renderer.domElement;
  const input = weaponInput.read();
  if (input.slot) weapons.swap(input.slot);
  syncPerks();
  view.setSlot(weapons.active);
  const equipped = perks.modifiers(perkContext());
  if (input.reload && weapons.requestReload(equipped.reload)) sfx.reload();
  if (weapons.tick(dt)) {
    const toast = perks.onReloadComplete();
    if (toast) perkHud.flash(toast);
  }
  const shot = weapons.pull(locked && input.held, locked && input.edge, equipped.interval);
  if (shot) fire(shot);
  view.update(dt);

  enemies.update(dt, camera);
  fx.update(dt);
  hud.sync(weapons.hud());
  syncPerks();
  perkHud.sync(perks.views(perkContext()));
  minimap.sync(
    { x: camera.position.x, z: camera.position.z, yaw: controls.yaw() },
    enemies.alive().map((enemy) => ({ x: enemy.mesh.position.x, z: enemy.mesh.position.z })),
  );
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
tick();
