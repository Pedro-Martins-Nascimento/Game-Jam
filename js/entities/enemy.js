"use strict";
/**
 * Enemy module
 *
 * Implements a simple non-physics enemy with a small state machine:
 * - wandering: picks random targets and drifts slowly
 * - chasing: moves toward the player when detected
 * - attacking: briefly pauses and fires a projectile toward the player
 *
 * Enemies are kinematic (manual position/velocity updates), rendered as a hexagon.
 * Shooting uses the kinematic projectile system from projectile.js.
 *
 * Public API:
 * - enemies: Enemy[] global list
 * - createEnemy(x, y): Enemy
 * - updateEnemies(player): void
 * - renderEnemy(ctx, enemy): void
 * - damageEnemy(enemy, dmg?): void
 *
 * Enemy shape:
 * {
 *   id: number,
 *   position: { x: number, y: number },
 *   velocity: { x: number, y: number },
 *   size: number,
 *   type: 'sentry',
 *   state: 'wandering' | 'chasing' | 'attacking',
 *   detectionRadius: number,
 *   attackRadius: number,
 *   chaseRadius: number,
 *   wanderSpeed: number,
 *   chaseSpeed: number,
 *   wanderTarget: { x: number, y: number } | null,
 *   stateTimer: number,
 *   shootCooldown: number,
 *   lastShot: number,
 *   hp: number,
 *   _dead?: boolean,
 * }
 */

import { config } from "../config.js";
import { shootEnemy } from "./projectile.js";

export const enemies = [];

/** Create and register a new enemy at world coordinates.
 * @param {number} x
 * @param {number} y
 * @returns {any} Enemy object
 */
export function createEnemy(x, y) {
  const enemy = {
    id: Math.random(),
    position: { x, y },
    velocity: { x: 0, y: 0 },
    size: 35,
    type: 'sentry',
    state: 'wandering', // 'wandering' | 'chasing' | 'attacking'
    detectionRadius: 500,
    attackRadius: 450,
    chaseRadius: 900,
    wanderSpeed: 1.5,
    chaseSpeed: 3.0,
    wanderTarget: null,
    stateTimer: 0,
    shootCooldown: 2000,
    lastShot: 0,
    hp: 2,
  };
  enemies.push(enemy);
  return enemy;
}

/** Update all enemies' AI and kinematics using the player's position.
 * @param {any} player - Player object with a Matter body at player.body.position
 */
export function updateEnemies(player) {
  const { Vector } = Matter;
  const now = performance.now();
  enemies.forEach(enemy => {
    if (!player) return;
    const playerPos = player.body.position;
    const enemyPos = enemy.position;
    const distanceToPlayer = Vector.magnitude(Vector.sub(playerPos, enemyPos));

    // state transitions
    if (enemy.state === 'attacking' && now - enemy.stateTimer > 500) {
      enemy.state = 'chasing';
    } else if (distanceToPlayer < enemy.attackRadius && now - enemy.lastShot > enemy.shootCooldown) {
      enemy.state = 'attacking';
      enemy.stateTimer = now;
      enemy.lastShot = now;
      shootEnemy(enemy.position, playerPos, 15);
    } else if (distanceToPlayer < enemy.detectionRadius && enemy.state === 'wandering') {
      enemy.state = 'chasing';
    } else if (distanceToPlayer > enemy.chaseRadius && enemy.state === 'chasing') {
      enemy.state = 'wandering';
    }

    // state behaviors
    switch (enemy.state) {
      case 'chasing': {
        const direction = Vector.normalise(Vector.sub(playerPos, enemyPos));
        enemy.velocity.x = direction.x * enemy.chaseSpeed;
        enemy.velocity.y = direction.y * enemy.chaseSpeed;
        break;
      }
      case 'wandering': {
        if (!enemy.wanderTarget || Vector.magnitude(Vector.sub(enemy.wanderTarget, enemyPos)) < 50) {
          const wanderRange = 400;
          enemy.wanderTarget = {
            x: Math.max(100, Math.min(config.world.width - 100, enemyPos.x + (Math.random() - 0.5) * wanderRange)),
            y: Math.max(100, Math.min(config.world.height - 200, enemyPos.y + (Math.random() - 0.5) * wanderRange)),
          };
        }
        const direction = Vector.normalise(Vector.sub(enemy.wanderTarget, enemyPos));
        enemy.velocity.x = direction.x * enemy.wanderSpeed;
        enemy.velocity.y = direction.y * enemy.wanderSpeed;
        break;
      }
      case 'attacking': {
        enemy.velocity.x *= 0.9;
        enemy.velocity.y *= 0.9;
        break;
      }
    }

    enemy.position.x += enemy.velocity.x;
    enemy.position.y += enemy.velocity.y;
  });
}

/** Render one enemy (hex) oriented by its velocity.
 * @param {CanvasRenderingContext2D} ctx
 * @param {any} enemy
 */
export function renderEnemy(ctx, enemy) {
  const pos = enemy.position;
  ctx.save();
  ctx.translate(pos.x, pos.y);
  const angle = Math.atan2(enemy.velocity.y, enemy.velocity.x);
  ctx.rotate(angle);
  let baseColor = '#ff3030';
  if (enemy.state === 'chasing') baseColor = '#ff5555';
  if (enemy.state === 'attacking') baseColor = '#ffffff';
  ctx.fillStyle = baseColor;
  ctx.strokeStyle = '#ff9999';
  ctx.shadowColor = '#ff3333';
  ctx.shadowBlur = 10;
  ctx.lineWidth = 2;
  const size = enemy.size / 2;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i;
    const x = size * Math.cos(a);
    const y = size * Math.sin(a);
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

/** Apply damage to an enemy; marks _dead when hp <= 0.
 * @param {any} enemy
 * @param {number} [dmg=1]
 */
export function damageEnemy(enemy, dmg = 1) {
  enemy.hp -= dmg;
  if (enemy.hp <= 0) enemy._dead = true;
}
