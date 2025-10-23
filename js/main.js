"use strict";
/**
 * Main game orchestrator
 *
 * Wires input, physics, world generation, entities, UI screens and the loop.
 * Responsibilities:
 * - initialize physics/camera/canvases
 * - start/stop runs, stage progression via portal + upgrade screen
 * - per-frame update: player, enemies, projectiles, shards, unstable blocks
 * - per-frame render: world bodies, entities, particles, portal, HUD
 * - manual collisions for simple kinematic entities
 */

import { config, playerState } from "./config.js";
import { drawBody } from "./utils.js";
import { camera, updateCamera, drawBackground } from "./core/camera.js";
import { keys, mouse, setupInputListeners } from "./core/input.js";
import { engine, world, initPhysics, setupCollisionEvents } from "./world/physics.js";
import { generateBasicArena, renderPortal } from "./world/generation.js";
import { particles, updateParticles, renderParticle, clearParticles } from "./entities/effects.js";
import { player, createPlayer, handlePlayerInput, handlePlayerJump, updatePlayerState, renderPlayer, playerTakeDamage, tryStartSlash } from "./entities/player.js";
import { enemies, updateEnemies, renderEnemy, damageEnemy, createEnemy } from "./entities/enemy.js";
import { projectiles, shoot, updateProjectiles, renderProjectile, shootEnemy } from "./entities/projectile.js";
import { shardItems, spawnShard, updateShards as updateShardItems, tryCollectShards, renderShard } from "./entities/shard.js";
import { showHUD, updateHUD } from "./ui/hud.js";
import { showStartScreen, showGameOverScreen, hideAllScreens, showUpgradeScreen, showCharacterSelectionScreen, showShopScreen } from "./ui/screens.js";
import { unstableBlocks, createUnstableBlock, triggerUnstableBlock, updateUnstableBlocks, renderUnstableBlock } from "./world/unstable.js";

// Canvas setup
const bgCanvas = document.getElementById('background-canvas');
const bgCtx = bgCanvas.getContext('2d');
const canvas = document.getElementById('main-canvas');
const ctx = canvas.getContext('2d');

function resize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  canvas.width = w; canvas.height = h;
  bgCanvas.width = w; bgCanvas.height = h;
  drawBackground(bgCanvas, bgCtx);
}
window.addEventListener('resize', resize);
resize();

// Game state
let gameFrame = 0;
let running = false;
let score = 0;
let shards = 0; // player's collected shard count
let stage = 1;
let portal = null;
let inUpgrade = false;

function worldToScreen(x, y) {
  const sx = (x - camera.x) * camera.zoom + canvas.width / 2;
  const sy = (y - camera.y) * camera.zoom + canvas.height / 2;
  return { x: sx, y: sy };
}

function screenToWorld(mouseX, mouseY) {
  const wx = (mouseX - canvas.width / 2) / camera.zoom + camera.x;
  const wy = (mouseY - canvas.height / 2) / camera.zoom + camera.y;
  return { x: wx, y: wy };
}

function startRun() {
  hideAllScreens();
  clearParticles();
  playerState.health = playerState.maxHealth;
  score = 0; shards = 0;
  stage = 1;
  if (!engine) initPhysics();
    portal = generateBasicArena(stage);
  const p = createPlayer(200, config.world.height - 200, world);
  setupCollisionEvents(p);
  setupInputListeners((e) => {
    // Jump keys
    handlePlayerJump(e);
    // Slash key (E)
    if (e.code === 'KeyE' && player) {
      const worldMouse = screenToWorld(mouse.x, mouse.y);
      tryStartSlash(worldMouse);
    }
  }, () => {
    // Click to shoot towards mouse
    const worldMouse = screenToWorld(mouse.x, mouse.y);
    shoot(p.body.position, worldMouse, 22);
  });
  showHUD(true);
  // Spawn some initial enemies
  for (let i = 0; i < 8; i++) {
    const ex = 600 + Math.random() * (config.world.width - 800);
    const ey = config.world.height - 800 - Math.random() * 800;
    createEnemy(ex, ey);
  }
  // Clear any existing unstable blocks and place new ones
  for (let i = unstableBlocks.length - 1; i >= 0; i--) {
    try { Matter.World.remove(world, unstableBlocks[i].body); } catch (_) {}
    unstableBlocks.splice(i, 1);
  }
  for (let i = 0; i < 6; i++) {
    const bx = 500 + Math.random() * (config.world.width - 1000);
    const by = config.world.height - 350 - Math.random() * 900;
    const type = ['fragile', 'volatile', 'kinetic'][Math.floor(Math.random()*3)];
    createUnstableBlock(bx, by, 60, 40, type, world);
  }
  running = true;
}

function gameOver() {
  running = false;
  showHUD(false);
  const best = Number(localStorage.getItem('bestScore') || '0');
  const newBest = Math.max(best, score);
  localStorage.setItem('bestScore', String(newBest));
  showGameOverScreen(score, newBest, 0, () => {
    // restart
    startRun();
  });
}

function update() {
  if (!running) return;
  // Physics step
  Matter.Engine.update(engine, 1000 / 60);

  // Inputs and player state
  if (!inUpgrade) {
    handlePlayerInput(keys);
    updatePlayerState();
  }

  // Enemies and projectiles
  if (!inUpgrade) {
    updateEnemies(player);
    updateProjectiles();
    updateShardItems(player);
    tryCollectShards(player, () => { shards++; score += 10; });
    updateUnstableBlocks(engine.world, {
      onPlayerHit: () => playerTakeDamage(() => gameOver(), camera),
      camera,
    });
  }

  // Camera & particles
  updateCamera(player, gameFrame, bgCanvas, bgCtx);
  updateParticles();

  // Score over time
  if (!inUpgrade && gameFrame % 30 === 0) score += 1;

  // Portal collision check
  if (!inUpgrade && portal && player) {
    const dx = player.body.position.x - portal.position.x;
    const dy = player.body.position.y - portal.position.y;
    if (Math.hypot(dx, dy) < portal.radius + 12) {
      // Enter upgrade selection
      inUpgrade = true;
      showUpgradeScreen(() => {
        stage++;
        portal = generateBasicArena(stage);
        Matter.Body.setPosition(player.body, { x: 200, y: config.world.height - 200 });
        Matter.Body.setVelocity(player.body, { x: 0, y: 0 });
        score += 250; // small reward
        playerState.dashCharges = playerState.maxDashCharges;
        inUpgrade = false;
        // spawn a few more enemies for next stage
        for (let i = 0; i < 4 + stage; i++) {
          const ex = 600 + Math.random() * (config.world.width - 800);
          const ey = config.world.height - 800 - Math.random() * 800;
          createEnemy(ex, ey);
        }
        // Refresh unstable blocks for new stage
        for (let i = unstableBlocks.length - 1; i >= 0; i--) {
          try { Matter.World.remove(world, unstableBlocks[i].body); } catch (_) {}
          unstableBlocks.splice(i, 1);
        }
        for (let i = 0; i < 3 + stage; i++) {
          const bx = 500 + Math.random() * (config.world.width - 1000);
          const by = config.world.height - 350 - Math.random() * 900;
          const type = ['fragile', 'volatile', 'kinetic'][Math.floor(Math.random()*3)];
          createUnstableBlock(bx, by, 60, 40, type, world);
        }
      });
    }
  }

  // HUD
  const now = performance.now();
  const dashReady = Math.min(1, (now - playerState.lastDashTime) / (config.player.dashCooldown || 1));
  updateHUD({ score, shards, health: playerState.health, dashRatio: dashReady });
}

function render() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Camera transform (with shake)
  const shakeX = camera.shakeDuration > 0 ? (Math.random() - 0.5) * camera.shakeMagnitude : 0;
  const shakeY = camera.shakeDuration > 0 ? (Math.random() - 0.5) * camera.shakeMagnitude : 0;
  if (camera.shakeDuration > 0) camera.shakeDuration--;

  ctx.translate(canvas.width / 2 + shakeX, canvas.height / 2 + shakeY);
  ctx.scale(camera.zoom, camera.zoom);
  ctx.translate(-camera.x, -camera.y);

  // Render Matter bodies (static world)
  ctx.fillStyle = '#1a1a2a';
  ctx.strokeStyle = '#0ff2';
  const bodies = Matter.Composite.allBodies(engine.world);
  for (const b of bodies) {
    if (b.isStatic && b.label !== 'unstable') {
      ctx.fillStyle = '#182030';
      ctx.strokeStyle = '#0ff1';
      drawBody(ctx, b);
    }
  }

  // Render enemies
  for (const e of enemies) renderEnemy(ctx, e);

  // Render projectiles
  for (const p of projectiles) renderProjectile(ctx, p);

  // Render player and particles (UI-ish elements in world space)
  renderPlayer(ctx);
  for (const part of particles) renderParticle(ctx, part);

  // Render portal last in world space
  if (portal) renderPortal(ctx, portal, gameFrame);
  // Unstable blocks custom render
  for (const ub of unstableBlocks) renderUnstableBlock(ctx, ub, gameFrame);
  // Shards
  for (const s of shardItems) renderShard(ctx, s, gameFrame);
}

function loop() {
  gameFrame++;
  update();
  checkCollisions();
  render();
  requestAnimationFrame(loop);
}

function playMusic() {
    const music = document.getElementById('bg-music');
    if (music && music.paused) {
        music.play().catch(e => console.error("Erro ao tocar música:", e));
        // Remove listener to only trigger once
        document.body.removeEventListener('click', playMusic);
        document.body.removeEventListener('keydown', playMusic);
    }
}

// Start flow: show start screen and set listeners
function init() {
  initPhysics();
  setupInputListeners((e) => {
    handlePlayerJump(e);
    if (e.code === 'KeyE' && player) {
      const worldMouse = screenToWorld(mouse.x, mouse.y);
      tryStartSlash(worldMouse);
    }
  }, null);
  
  const goBackToStart = () => {
      hideAllScreens();
      showStartScreen(
          startRun, 
          showCharacterSelect,
          showShop
      );
  };

  const showCharacterSelect = () => {
      showCharacterSelectionScreen(
          (character) => {
              console.log("Personagem selecionado:", character);
              startRun(character);
          },
          goBackToStart
      );
  };

  const showShop = () => {
      showShopScreen(goBackToStart);
  };

  showStartScreen(
      startRun,
      showCharacterSelect,
      showShop
  );

  // Music needs user interaction to start
  document.body.addEventListener('click', playMusic, { once: true });
  document.body.addEventListener('keydown', playMusic, { once: true });

  loop();
}

init();

// Manual collisions between simple entities
function checkCollisions() {
  if (!player) return;
  const { Vector } = Matter;
  const pPos = player.body.position;
  // Player vs enemy
  for (const e of enemies) {
    const dist = Vector.magnitude(Vector.sub(pPos, e.position));
    if (dist < (e.size/2 + config.player.width/2)) {
      playerTakeDamage(() => gameOver(), camera);
    }
  }
  // Projectiles
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const proj = projectiles[i];
    if (proj.isEnemy) {
      // enemy projectile hits player
      const dist = Vector.magnitude(Vector.sub(pPos, { x: proj.x, y: proj.y }));
      if (dist < (proj.radius + Math.max(config.player.width, config.player.height)/3)) {
        projectiles.splice(i,1);
        playerTakeDamage(() => gameOver(), camera);
        continue;
      }
    } else {
      // friendly projectile hits enemy
      let hit = false;
      for (let j = enemies.length - 1; j >= 0; j--) {
        const e = enemies[j];
        const dist = Vector.magnitude(Vector.sub({ x: proj.x, y: proj.y }, e.position));
        if (dist < (proj.radius + e.size/2)) {
          hit = true;
          e.hp -= 1;
          if (e.hp <= 0) {
            // enemy dies
            enemies.splice(j,1);
            spawnShard(e.position.x, e.position.y);
            score += 100;
          }
          break;
        }
      }
      // friendly projectile hits unstable blocks (AABB)
      if (!hit) {
        for (let k = 0; k < unstableBlocks.length; k++) {
          const ub = unstableBlocks[k];
          const bx = ub.body.position.x, by = ub.body.position.y;
          const hw = ub.width / 2, hh = ub.height / 2;
          if (Math.abs(proj.x - bx) <= hw + proj.radius && Math.abs(proj.y - by) <= hh + proj.radius) {
            triggerUnstableBlock(ub, engine.world);
            hit = true;
            break;
          }
        }
      }
      if (hit) projectiles.splice(i,1);
    }
  }
}
 