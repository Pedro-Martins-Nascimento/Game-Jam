"use strict";

import { config } from "../config.js";
import { addStaticBody, world as physicsWorld } from "./physics.js";

export const worldBodies = [];
let portal = null;

export function clearGeneratedWorld() {
  const { World } = Matter;
  const w = physicsWorld || Matter.world;
  for (const b of worldBodies) {
    try { World.remove(w, b); } catch (_) {}
  }
  worldBodies.length = 0;
  portal = null;
}

export function generateBasicArena(stage = 1) {
  clearGeneratedWorld();

  // Ground
  const ground = addStaticBody(config.world.width / 2, config.world.height - 30, config.world.width, 60, 'ground');
  worldBodies.push(ground);
  // Side walls
  worldBodies.push(addStaticBody(10, config.world.height / 2, 20, config.world.height, 'wall-left'));
  worldBodies.push(addStaticBody(config.world.width - 10, config.world.height / 2, 20, config.world.height, 'wall-right'));

  // Platform pattern influenced by stage
  const segments = Math.min(10 + stage * 2, 24);
  const widthMin = 220;
  const widthMax = 480;
  const gapX = config.world.width / segments;
  const baseY = config.world.height - 250;
  for (let i = 1; i < segments; i++) {
    const w = Math.floor(Math.random() * (widthMax - widthMin) + widthMin);
    const x = i * gapX + (Math.random() * 100 - 50);
    const y = baseY - i * (20 + Math.random() * 25) - stage * 10 + (Math.random() * 40 - 20);
    worldBodies.push(addStaticBody(x, y, w, 18, 'platform'));
  }

  // A few elevated ledges
  for (let j = 0; j < 3 + Math.min(stage, 3); j++) {
    const x = 500 + j * 600 + Math.random() * 200;
    const y = config.world.height - (500 + j * 120 + Math.random() * 80);
    const w = 260 + Math.random() * 160;
    worldBodies.push(addStaticBody(x, y, w, 16, 'platform'));    
  }

  // Place a portal near the far right
  const px = config.world.width - 200;
  const py = config.world.height - 650 - Math.min(stage * 40, 400);
  portal = { position: { x: px, y: py }, radius: 28 };
  return portal;
}

export function getPortal() { return portal; }

export function renderPortal(ctx, portalObj, gameFrame = 0) {
  if (!portalObj) return;
  const { x, y } = portalObj.position;
  const r = portalObj.radius;

  ctx.save();
  const pulse = 0.6 + 0.4 * Math.sin(gameFrame * 0.15);
  ctx.fillStyle = `rgba(160, 60, 255, ${0.7 + 0.3 * pulse})`;
  ctx.shadowColor = '#a03cff';
  ctx.shadowBlur = 25;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();

  // Outer ring
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#d0a6ff';
  ctx.beginPath();
  ctx.arc(x, y, r + 8 * pulse, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}
