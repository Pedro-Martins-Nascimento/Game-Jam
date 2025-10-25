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
import { gameState, STATES } from "./core/gameState.js";
import { keys, mouse, setupInputListeners, consumeClick } from "./core/input.js";
import { engine, world, initPhysics, setupCollisionEvents, clearWorld } from "./world/physics.js";
import { generateBasicArena, renderPortal } from "./world/generation.js";
// ... (o resto das importações)
import { loadPlayerData, savePlayerData, updateBestScore, addPermanentCurrency } from "./data/playerData.js";

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
// let running = false; // 'running' será substituído pelo gameState
let score = 0;
let shards = 0; // player's collected shard count
let stage = 1;
let portal = null;
// let inUpgrade = false; // 'inUpgrade' será substituído pelo gameState
// Evita pular a tela de Game Over por clique residual
let gameOverInputLockUntil = 0;

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

let playerData = {};

function initGameFlow() {
  hideAllScreens();
  canvas.classList.remove('interactive');
  gameState.set(STATES.IN_MENU);
  showStartScreen(
    () => showCharacterSelectionScreen(startRun, initGameFlow, playerData.unlockedCharacters),
    () => showCharacterSelectionScreen(startRun, initGameFlow, playerData.unlockedCharacters),
    () => showShopScreen(initGameFlow)
  );
}

function startRun(character = 'kira') {
  hideAllScreens();
  canvas.classList.add('interactive');
  clearWorld(engine);
  clearParticles();
  
  playerState.health = playerState.maxHealth;
  score = 0;
  shards = 0;
  stage = 1;
  
  portal = generateBasicArena(stage);
  const p = createPlayer(200, config.world.height - 200, world, character);
  setupCollisionEvents(p);

  showHUD(true);
  
  for (let i = 0; i < 8; i++) {
    const ex = 600 + Math.random() * (config.world.width - 800);
    const ey = config.world.height - 800 - Math.random() * 800;
    createEnemy(ex, ey);
  }
  for (let i = 0; i < 6; i++) {
    const bx = 500 + Math.random() * (config.world.width - 1000);
    const by = config.world.height - 350 - Math.random() * 900;
    const type = ['fragile', 'volatile', 'kinetic'][Math.floor(Math.random()*3)];
    createUnstableBlock(bx, by, 60, 40, type, world);
  }

  gameState.set(STATES.IN_GAME);
}

function gameOver() {
  canvas.classList.remove('interactive');
  gameState.set(STATES.GAME_OVER);
  showHUD(false);

  updateBestScore(score);
  addPermanentCurrency(shards);
  playerData = loadPlayerData();

  // Limpa inputs para não pular a tela de estatística
  consumeClick();
  mouse.isDown = false;
  mouse.clicked = false;
  for (const k in keys) keys[k] = false;
  gameOverInputLockUntil = performance.now() + 400; // 0.4s de proteção

  showGameOverScreen(score, playerData.bestScore, playerData.permanentCurrency, initGameFlow);
}

function handleGameInputs() {
    // Movimentação e estado do jogador
    handlePlayerInput(keys);
    updatePlayerState();

    // Ações com input direto
    if (keys['KeyW'] || keys['Space']) {
        handlePlayerJump({ code: keys['KeyW'] ? 'KeyW' : 'Space' });
    }
    if (keys['KeyE']) {
        const worldMouse = screenToWorld(mouse.x, mouse.y);
        tryStartSlash(worldMouse);
    }
    if (mouse.isDown) { // Usar isDown para tiro contínuo
        const worldMouse = screenToWorld(mouse.x, mouse.y);
        shoot(player.body.position, worldMouse, 22);
    }
}

/**
 * Check collisions between friendly projectiles and enemies.
 * This is manual because projectiles are kinematic objects (not Matter bodies).
 */
function handleProjectileCollisions() {
  if (!projectiles || !enemies) return;
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const p = projectiles[i];
    if (p.isEnemy) {
      // enemy projectile: check collision with player
      if (player && player.body) {
        const pdx = p.x - player.body.position.x;
        const pdy = p.y - player.body.position.y;
        const pdist = Math.hypot(pdx, pdy);
        const playerRadius = Math.max(config.player.width, config.player.height) / 2;
        if (pdist < p.radius + playerRadius) {
          // hit player
          projectiles.splice(i, 1);
          playerTakeDamage(() => gameOver(), camera);
          continue;
        }
      }
      continue;
    }

    // friendly projectile: check collision against enemies
    for (let j = enemies.length - 1; j >= 0; j--) {
      const e = enemies[j];
      const dx = p.x - e.position.x;
      const dy = p.y - e.position.y;
      const dist = Math.hypot(dx, dy);
      if (dist < (p.radius + e.size / 2)) {
        // apply damage and remove projectile
        damageEnemy(e, 1);
        projectiles.splice(i, 1); // Remove projectile on hit
        if (e._dead) {
          // remove enemy and spawn shard/reward
          enemies.splice(j, 1);
          spawnShard(e.position.x, e.position.y);
          score += 100;
        }
        break; // projectile is gone, stop checking this projectile
      }
    }
  }
}


function update() {
  // Lida com Game Over antes de qualquer outra lógica
  if (gameState.is(STATES.GAME_OVER)) {
    // Só aceita sair do Game Over após o lock e com novo clique
    if (mouse.clicked && performance.now() >= gameOverInputLockUntil) {
      initGameFlow();
      consumeClick();
    }
    // Atualizações leves (fundo/câmera/partículas) para manter a cena viva
    updateParticles();
    if (player) updateCamera(player, gameFrame, bgCanvas, bgCtx);
    else drawBackground(bgCanvas, bgCtx);
    return;
  }

  // A lógica de atualização do jogo só roda se o estado for IN_GAME
  if (!gameState.is(STATES.IN_GAME)) {
    // Atualiza coisas que devem rodar sempre, como partículas
    updateParticles();
    // Atualiza a câmera mesmo fora de jogo para efeitos de menu, se houver
    if (player) updateCamera(player, gameFrame, bgCanvas, bgCtx);
    else drawBackground(bgCanvas, bgCtx); // Se não houver jogador, apenas desenha o fundo
    return;
  }

  // --- Lógica que só roda durante o jogo ---
  Matter.Engine.update(engine, 1000 / 60);

  handleGameInputs();

  updateEnemies(player);
  updateProjectiles();
  // Handle friendly projectile collisions with enemies (manual kinematic collision)
  handleProjectileCollisions();
  updateShardItems(player);
  tryCollectShards(player, () => { shards++; score += 10; });
  updateUnstableBlocks(engine.world, {
    onPlayerHit: () => playerTakeDamage(() => gameOver(), camera),
    camera,
  });

  updateCamera(player, gameFrame, bgCanvas, bgCtx);
  updateParticles();

  if (gameFrame % 30 === 0) score += 1;

  if (portal && player) {
    const dx = player.body.position.x - portal.position.x;
    const dy = player.body.position.y - portal.position.y;
    if (Math.hypot(dx, dy) < portal.radius + 12) {
      gameState.set(STATES.UPGRADE_SCREEN);
      showUpgradeScreen(() => {
        stage++;
        portal = generateBasicArena(stage);
        Matter.Body.setPosition(player.body, { x: 200, y: config.world.height - 200 });
        Matter.Body.setVelocity(player.body, { x: 0, y: 0 });
        score += 250;
        playerState.dashCharges = playerState.maxDashCharges;
        
        for (let i = 0; i < 4 + stage; i++) {
          const ex = 600 + Math.random() * (config.world.width - 800);
          const ey = config.world.height - 800 - Math.random() * 800;
          createEnemy(ex, ey);
        }
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
        gameState.set(STATES.IN_GAME);
      });
    }
  }

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

function init() {
  playerData = loadPlayerData();
  initPhysics();
  setupInputListeners(); // Configura os listeners uma única vez
  
  initGameFlow();

  // Music needs user interaction to start
  document.body.addEventListener('click', playMusic, { once: true });
  document.body.addEventListener('keydown', playMusic, { once: true });

  loop();
}

init();

// A função checkCollisions não é mais necessária aqui, pois a lógica foi
// integrada ao motor de física do Matter.js através de eventos.
