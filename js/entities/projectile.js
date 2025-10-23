"use strict";

import { config } from "../config.js";

export const projectiles = [];

export function shoot(origin, target, speed = 22, opts = {}) {
  const dx = target.x - origin.x;
  const dy = target.y - origin.y;
  const len = Math.hypot(dx, dy) || 1;
  const vx = (dx / len) * speed;
  const vy = (dy / len) * speed;
  projectiles.push({
    x: origin.x,
    y: origin.y,
    vx,
    vy,
    radius: opts.radius ?? 5,
    life: opts.life ?? 90,
    color: opts.color ?? '#00ffff',
    isEnemy: !!opts.isEnemy,
  });
}

export function updateProjectiles() {
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const p = projectiles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life--;
    // Cull off-screen/world
    if (
      p.life <= 0 ||
      p.x < -200 || p.x > config.world.width + 200 ||
      p.y < -200 || p.y > config.world.height + 200
    ) {
      projectiles.splice(i, 1);
    }
  }
}

export function renderProjectile(ctx, p) {
  ctx.save();
  ctx.fillStyle = p.isEnemy ? '#ff8000' : p.color;
  ctx.shadowColor = p.color;
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function shootEnemy(origin, target, speed = 15) {
  return shoot(origin, target, speed, { isEnemy: true, radius: 6, life: 120, color: '#ff8000' });
}
