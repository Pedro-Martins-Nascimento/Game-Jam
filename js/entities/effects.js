"use strict";

export const particles = [];

export function createParticle(x, y, color, size, speed, vx = null, vy = null, life = 40) {
  const angle = Math.random() * Math.PI * 2;
  particles.push({
    x, y, color, size,
    vx: vx !== null ? vx * speed : Math.cos(angle) * speed * Math.random(),
    vy: vy !== null ? vy * speed : Math.sin(angle) * speed * Math.random(),
    life: life + Math.random() * (life/2),
    maxLife: life + life/2,
  });
}

export function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life--;
    p.size *= 0.98;
    if (p.life <= 0 || p.size < 0.5) particles.splice(i, 1);
  }
}

export function renderParticle(ctx, p) {
  ctx.fillStyle = p.color;
  ctx.globalAlpha = p.life / p.maxLife;
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

export function hitStop(engine, duration) {
  const originalTimeScale = engine.timing.timeScale;
  engine.timing.timeScale = 0.0001;
  setTimeout(() => { engine.timing.timeScale = originalTimeScale; }, duration);
}

export function clearParticles() { particles.length = 0; }
