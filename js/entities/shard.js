"use strict";

export const shardItems = [];

export function spawnShard(x, y) {
  shardItems.push({ x, y, vx: (Math.random()-0.5)*2, vy: -2, pulseId: Math.random() * 1000 });
}

export function updateShards(player) {
  if (!player) return;
  const { Vector } = Matter;
  for (let i = shardItems.length - 1; i >= 0; i--) {
    const s = shardItems[i];
    // simple gravity and damping
    s.vy += 0.1; s.vx *= 0.98; s.vy *= 0.98;
    s.x += s.vx; s.y += s.vy;
    const dir = Vector.sub(player.body.position, { x: s.x, y: s.y });
    const dist = Vector.magnitude(dir);
    if (dist < 220) {
      const n = Vector.normalise(dir);
      s.vx += n.x * 0.6 * (1 - dist/220);
      s.vy += n.y * 0.6 * (1 - dist/220);
    }
  }
}

export function tryCollectShards(player, onCollect) {
  if (!player) return;
  const { Vector } = Matter;
  for (let i = shardItems.length - 1; i >= 0; i--) {
    const s = shardItems[i];
    const dist = Vector.magnitude(Vector.sub(player.body.position, { x: s.x, y: s.y }));
    if (dist < 24) {
      shardItems.splice(i, 1);
      onCollect && onCollect();
    }
  }
}

export function renderShard(ctx, s, gameFrame) {
  ctx.save();
  ctx.translate(s.x, s.y);
  const pulse = Math.sin(gameFrame * 0.1 + s.pulseId) * 0.2 + 0.8;
  ctx.scale(pulse, pulse);
  ctx.fillStyle = '#00ffff';
  ctx.shadowColor = '#00ffff';
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.moveTo(0, -7);
  ctx.lineTo(6, 6);
  ctx.lineTo(-6, 6);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}
