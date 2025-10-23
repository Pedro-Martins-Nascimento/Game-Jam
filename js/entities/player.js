"use strict";

import { config, playerState } from "../config.js";
import { createParticle } from "./effects.js";

export let player = null;

export function createPlayer(x, y, world) {
  const { Bodies, Body, World } = Matter;
  const pConfig = config.player;
  const core = Bodies.rectangle(x, y, pConfig.width, pConfig.height, { 
    label: 'player-core', 
    inertia: Infinity,
    friction: 0.05,
    restitution: 0.1 
  });
  const groundSensor = Bodies.rectangle(x, y + pConfig.height / 2, pConfig.width - 4, 10, { isSensor: true, label: 'player-ground-sensor' });
  const leftSensor = Bodies.rectangle(x - pConfig.width / 2, y, 10, pConfig.height - 8, { isSensor: true, label: 'player-left-sensor' });
  const rightSensor = Bodies.rectangle(x + pConfig.width / 2, y, 10, pConfig.height - 8, { isSensor: true, label: 'player-right-sensor' });

  player = {
    body: Body.create({ parts: [core, groundSensor, leftSensor, rightSensor], label: 'player' }),
    groundSensor,
    leftSensor,
    rightSensor,
    core,
    contactPoints: { ground: false, left: false, right: false },
  };
  World.add(world, player.body);
  return player;
}

export function handlePlayerInput(keys) {
  if (!player) return;
  const { Body } = Matter;
  let targetVelX = 0;
  if (keys['KeyD'] || keys['ArrowRight']) targetVelX = config.player.speed;
  if (keys['KeyA'] || keys['ArrowLeft']) targetVelX = -config.player.speed;

  const airControl = playerState.isGrounded ? 1 : config.player.airControlFactor;
  const newVelX = player.body.velocity.x + (targetVelX - player.body.velocity.x) * 0.2 * airControl;
  Body.setVelocity(player.body, { x: newVelX, y: player.body.velocity.y });

  if (keys['ShiftLeft'] && !playerState.isDashing) {
    const now = performance.now();
    if (now - playerState.lastDashTime > config.player.dashCooldown && playerState.dashCharges > 0) {
      playerState.isDashing = true;
      playerState.isInvincible = true;
      playerState.lastDashTime = now;
      playerState.dashCharges--;

      let dashDir = targetVelX !== 0 ? Math.sign(targetVelX) : (player.body.velocity.x >= 0 ? 1 : -1);
      if (dashDir === 0) dashDir = 1;

      Body.setVelocity(player.body, { x: config.player.dashSpeed * dashDir, y: 0 });
      for (let i = 0; i < 20; i++) createParticle(player.body.position.x, player.body.position.y, '#FFFFFF', 3, 2);

      setTimeout(() => {
        playerState.isDashing = false;
        if (player) Body.setVelocity(player.body, { x: player.body.velocity.x * 0.2, y: player.body.velocity.y });
      }, config.player.dashDuration);
      setTimeout(() => playerState.isInvincible = false, config.player.dashInvincibilityDuration);
    }
  }
}

export function handlePlayerJump(e) {
  if (!player) return;
  const { Body } = Matter;
  if (e.code === 'KeyE') {
    // Slash attack trigger
    playerState._requestSlash = true; // flag for main to handle with mouse/camera
    return;
  }
  if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') {
    if (playerState.isWallSliding) {
      const forceX = playerState.wallSlideDirection * config.player.wallJumpForce.x * playerState.strongerWallJumps;
      const forceY = -config.player.wallJumpForce.y * playerState.strongerWallJumps;
      Body.setVelocity(player.body, { x: forceX, y: forceY });
      playerState.jumpsLeft = playerState.maxJumps - 1;
      playerState.isWallSliding = false;
      for (let i = 0; i < 15; i++) createParticle(player.body.position.x, player.body.position.y, '#00ffff', 4, 3);
    } else if (playerState.jumpsLeft > 0) {
      Body.setVelocity(player.body, { x: player.body.velocity.x, y: -config.player.jumpForce });
      playerState.jumpsLeft--;
      for (let i = 0; i < 10; i++) createParticle(player.body.position.x, player.body.position.y, '#00ffff', 3, 2);
    }
  }
}

export function updatePlayerState() {
  if (!player) return;
  const { Body, Vector } = Matter;
  const now = performance.now();
  if (now - playerState.lastDashTime > config.player.dashCooldown && playerState.dashCharges < playerState.maxDashCharges) {
    playerState.dashCharges++;
    playerState.lastDashTime = now;
  }
  playerState.isGrounded = player.contactPoints.ground;
  const onWall = (player.contactPoints.left || player.contactPoints.right);
  playerState.wallSlideDirection = player.contactPoints.left ? -1 : 1;
  if (playerState.isGrounded) {
    playerState.jumpsLeft = playerState.maxJumps;
    playerState.isWallSliding = false;
  }
  if (onWall && !playerState.isGrounded && player.body.velocity.y > 0 && !playerState.isDashing) {
    playerState.isWallSliding = true;
    if (player.body.velocity.y > config.player.wallSlideSpeed) {
      Body.setVelocity(player.body, { x: player.body.velocity.x, y: config.player.wallSlideSpeed });
    }
    createParticle(player.body.position.x + (playerState.wallSlideDirection * config.player.width/2), player.body.position.y, '#ccc', 1, 1, 0, 0, 10);
  } else {
    playerState.isWallSliding = false;
  }
}

export function playerTakeDamage(onGameOver, camera) {
  if (playerState.isInvincible) return;
  playerState.health--;
  camera.shakeDuration = 20;
  camera.shakeMagnitude = 15;
  if (playerState.health <= 0) {
    onGameOver();
  } else {
    playerState.isInvincible = true;
    setTimeout(() => { if (!playerState.isDashing) playerState.isInvincible = false; }, 1500);
  }
}

export function renderPlayer(ctx) {
  if (!player) return;
  const { Vector } = Matter;
  const pos = player.body.position;
  const w = config.player.width;
  const h = config.player.height;
  ctx.save();
  ctx.translate(pos.x, pos.y);
  if (playerState.isInvincible) ctx.globalAlpha = 0.5 + Math.sin(performance.now() * 0.05) * 0.2;
  ctx.fillStyle = '#00ffff';
  ctx.shadowColor = '#00ffff';
  ctx.shadowBlur = 15;
  ctx.fillRect(-w/2, -h/2, w, h);
  ctx.restore();
  if (Vector.magnitude(player.body.velocity) > 1) createParticle(pos.x, pos.y, '#00ffff', 2, 1, 0, 0, 20);

  // Render slash if active
  if (playerState.isSlashing) {
    const progress = Math.min((performance.now() - playerState.lastSlashTime) / config.player.slashDuration, 1);
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const startAngle = playerState.slashAngle - config.player.slashArc / 2;
    const currentAngle = startAngle + (config.player.slashArc * easeOut);
    const alpha = 1 - progress;

    ctx.save();
    ctx.translate(pos.x, pos.y);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, config.player.slashRange, startAngle, currentAngle);
    ctx.closePath();
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, config.player.slashRange);
    g.addColorStop(0, `rgba(255,255,255, ${alpha * 0.8})`);
    g.addColorStop(0.8, `rgba(0,255,255, ${alpha * 0.6})`);
    g.addColorStop(1, `rgba(0,255,255, 0)`);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.restore();
  }
}

export function tryStartSlash(mouseWorld) {
  if (!player) return false;
  const now = performance.now();
  if (now - playerState.lastSlashTime < config.player.slashCooldown) return false;
  playerState.lastSlashTime = now;
  playerState.isSlashing = true;
  const pos = player.body.position;
  playerState.slashAngle = Math.atan2(mouseWorld.y - pos.y, mouseWorld.x - pos.x);
  setTimeout(() => { playerState.isSlashing = false; }, config.player.slashDuration);
  return true;
}
