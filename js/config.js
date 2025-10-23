"use strict";

export const config = {
  player: {
    width: 30,
    height: 55,
    speed: 7,
    airControlFactor: 0.6,
    jumpForce: 13,
    dashSpeed: 20,
    dashDuration: 150,
    dashInvincibilityDuration: 300,
    dashCooldown: 1000,
    wallSlideSpeed: 1.5,
    wallJumpForce: { x: 8, y: 11 },
    // Slash attack
    slashCooldown: 700,
    slashRange: 90,
    slashArc: Math.PI,
    slashDuration: 200,
  },
  world: {
    gravity: 1.2,
    width: 4000,
    height: 2000,
  },
  camera: {
    lerp: 0.08,
    zoom: 1.0,
    targetZoom: 1.0,
    zoomSpeed: 0.01,
  }
};

export const playerState = {
  health: 3,
  maxHealth: 3,
  jumpsLeft: 0,
  dashCharges: 1,
  lastDashTime: 0,
  isDashing: false,
  isInvincible: false,
  isGrounded: false,
  isWallSliding: false,
  wallSlideDirection: 0,
  // Slash state
  isSlashing: false,
  lastSlashTime: 0,
  slashAngle: 0,
  // Upgrades
  maxJumps: 3,
  maxDashCharges: 1,
  lanceBounces: 0,
  volatileExplosionSize: 1.0,
  strongerWallJumps: 1.0,
  enemiesExplodeOnDeath: false,
};

export const allUpgrades = [
  { id: 'lanceBounce', text: 'Data Lance bounces off walls 3 times.', apply: () => playerState.lanceBounces = 3 },
  { id: 'doubleDash', text: 'Gain a second Dash charge.', apply: () => playerState.maxDashCharges = 2 },
  { id: 'bigBoom', text: 'Volatile Block explosions are 50% larger.', apply: () => playerState.volatileExplosionSize = 1.5 },
  { id: 'wallBoost', text: 'Wall-jumps are 30% stronger.', apply: () => playerState.strongerWallJumps = 1.3 },
  { id: 'enemyExplode', text: 'Enemies have a 25% chance to explode on death.', apply: () => playerState.enemiesExplodeOnDeath = true },
  { id: 'quadJump', text: 'Gain an extra mid-air jump.', apply: () => playerState.maxJumps = 4 }
];
