"use strict";

import { config } from "../config.js";

export const camera = { x: 0, y: 0, zoom: config.camera.zoom, targetZoom: 1.0, shakeDuration: 0, shakeMagnitude: 0 };

export function updateCamera(player, gameFrame, bgCanvas, bgCtx) {
  if (!player) return;
  const { Vector } = Matter;
  const targetX = player.body.position.x;
  const targetY = player.body.position.y;
  camera.x += (targetX - camera.x) * config.camera.lerp;
  camera.y += (targetY - camera.y) * config.camera.lerp;

  const speed = Vector.magnitude(player.body.velocity);
  camera.targetZoom = 1.0 - Math.min(speed / 60, 0.2);
  camera.zoom += (camera.targetZoom - camera.zoom) * config.camera.zoomSpeed;

  if (gameFrame % 2 === 0 && bgCanvas && bgCtx) drawBackground(bgCanvas, bgCtx);
}

export function drawBackground(bgCanvas, bgCtx) {
  bgCtx.fillStyle = '#0a0a1a';
  bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
  bgCtx.strokeStyle = 'rgba(0, 255, 255, 0.05)';

  const gridSize = 50;
  const parallaxX = (camera.x * 0.1) % gridSize;
  const parallaxY = (camera.y * 0.1) % gridSize;

  for (let x = -parallaxX; x < bgCanvas.width; x += gridSize) {
    bgCtx.beginPath();
    bgCtx.moveTo(x, 0);
    bgCtx.lineTo(x, bgCanvas.height);
    bgCtx.stroke();
  }
  for (let y = -parallaxY; y < bgCanvas.height; y += gridSize) {
    bgCtx.beginPath();
    bgCtx.moveTo(0, y);
    bgCtx.lineTo(bgCanvas.width, y);
    bgCtx.stroke();
  }
}
