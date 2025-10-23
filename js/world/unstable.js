"use strict";
/**
 * Unstable blocks module
 *
 * Types:
 * - fragile: becomes dynamic and falls when triggered
 * - volatile: starts a short fuse then explodes with radial force and hit-stop
 * - kinetic: emits an immediate force pulse around itself
 *
 * Exported API:
 * - unstableBlocks: Block[] registry
 * - createUnstableBlock(x,y,w,h,type,world): Block
 * - triggerUnstableBlock(block, world): void
 * - updateUnstableBlocks(world, { onPlayerHit, camera }): void
 * - renderUnstableBlock(ctx, block, frame?): void
 * - createExplosion(world, pos, radius, force, onPlayerHit, camera): void
 */

import { config } from "../config.js";
import { hitStop, createParticle } from "../entities/effects.js";
import { engine } from "./physics.js";

/** @type {Array<any>} */
export const unstableBlocks = [];

/** Create and add an unstable block body to the Matter world.
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @param {'fragile'|'volatile'|'kinetic'} type
 * @param {Matter.World} world
 */
export function createUnstableBlock(x, y, w, h, type, world) {
  const { Bodies, World } = Matter;
  const body = Bodies.rectangle(x, y, w, h, { isStatic: true, label: 'unstable', friction: 0.5 });
  const block = { type, width: w, height: h, body, isTriggered: false, triggerTime: 0 };
  body.parentObject = block;
  unstableBlocks.push(block);
  World.add(world, body);
  return block;
}

/** Trigger a block's behavior once (idempotent while active).
 * @param {any} block
 * @param {Matter.World} world
 */
export function triggerUnstableBlock(block, world) {
  if (!block || block.isTriggered) return;
  const { Body, Composite, Vector } = Matter;
  switch (block.type) {
    case 'fragile':
      block.isTriggered = true;
      Body.setStatic(block.body, false);
      break;
    case 'volatile':
      block.isTriggered = true;
      block.triggerTime = performance.now();
      break;
    case 'kinetic': {
      block.isTriggered = true;
      const pulseRadius = 250;
      const pulseForce = 0.5;
      const bodies = Composite.allBodies(world);
      bodies.forEach(b => {
        if (b === block.body || b.isStatic) return;
        const distance = Matter.Vector.magnitude(Matter.Vector.sub(b.position, block.body.position));
        if (distance < pulseRadius) {
          const direction = Vector.normalise(Vector.sub(b.position, block.body.position));
          const force = Vector.mult(direction, pulseForce * (1 - distance / pulseRadius) * (b.mass / 10));
          Matter.Body.applyForce(b, b.position, force);
        }
      });
      // particles ring
      for (let i = 0; i < 360; i += 12) {
        const a = i * Math.PI / 180;
        createParticle(block.body.position.x, block.body.position.y, '#f0f', 4, 8, Math.cos(a), Math.sin(a), 30);
      }
      setTimeout(() => block.isTriggered = false, 500);
      break;
    }
  }
}

/** Advance block timers and clean up off-screen or exploded blocks.
 * @param {Matter.World} world
 * @param {{ onPlayerHit?: () => void, camera?: any }} opts
 */
export function updateUnstableBlocks(world, opts = {}) {
  const { World, Composite, Vector, Body } = Matter;
  const { onPlayerHit, camera } = opts;
  for (let i = unstableBlocks.length - 1; i >= 0; i--) {
    const block = unstableBlocks[i];
    if (block.type === 'volatile' && block.isTriggered) {
      if (performance.now() - block.triggerTime > 1500) {
        createExplosion(world, block.body.position, 150, 0.2, onPlayerHit, camera);
        if (block.body) World.remove(world, block.body);
        unstableBlocks.splice(i, 1);
        continue;
      }
    }
    if (block.body && !block.body.isStatic && block.body.position.y > config.world.height + 100) {
      World.remove(world, block.body);
      unstableBlocks.splice(i, 1);
    }
  }
}

/** Custom canvas render for a block (overrides static body draw).
 * @param {CanvasRenderingContext2D} ctx
 * @param {any} block
 * @param {number} [gameFrame=0]
 */
export function renderUnstableBlock(ctx, block, gameFrame = 0) {
  const pos = block.body.position;
  const w = block.width;
  const h = block.height;
  ctx.save();
  ctx.translate(pos.x, pos.y);
  ctx.rotate(block.body.angle);
  ctx.lineWidth = 2;
  switch (block.type) {
    case 'fragile':
      ctx.fillStyle = '#888';
      ctx.strokeStyle = '#AAA';
      ctx.fillRect(-w/2, -h/2, w, h);
      ctx.beginPath();
      ctx.moveTo(-w/4, -h/2); ctx.lineTo(w/4, h/2);
      ctx.moveTo(w/3, -h/3); ctx.lineTo(-w/3, h/4);
      ctx.strokeStyle = '#444';
      ctx.stroke();
      break;
    case 'volatile': {
      const pulse = Math.sin(gameFrame * 0.05) * 5 + 5;
      ctx.fillStyle = block.isTriggered ? '#ff5500' : '#ffae42';
      ctx.strokeStyle = '#ffae42';
      ctx.shadowColor = '#ffae42';
      ctx.shadowBlur = pulse;
      ctx.fillRect(-w/2, -h/2, w, h);
      if (block.isTriggered) {
        const flashAlpha = Math.abs(Math.sin(gameFrame * 0.5));
        ctx.fillStyle = `rgba(255,255,255,${flashAlpha})`;
        ctx.fillRect(-w/2, -h/2, w, h);
      }
      break;
    }
    case 'kinetic':
      ctx.fillStyle = '#8a2be2';
      ctx.strokeStyle = '#c07cfc';
      ctx.fillRect(-w/2, -h/2, w, h);
      ctx.strokeStyle = '#f0f';
      ctx.lineWidth = 4;
      for (let i = -1; i <= 1; i += 2) {
        ctx.beginPath();
        ctx.moveTo(-w/4, i * h/4);
        ctx.lineTo(0, 0);
        ctx.lineTo(w/4, i * h/4);
        ctx.stroke();
      }
      break;
  }
  ctx.restore();
}

/** Radial explosion: particles, camera shake, hit-stop, and forces.
 * @param {Matter.World} world
 * @param {{x:number,y:number}} position
 * @param {number} radius
 * @param {number} force
 * @param {() => void} onPlayerHit
 * @param {any} camera
 */
export function createExplosion(world, position, radius, force, onPlayerHit, camera) {
  const { Composite, Vector, Body } = Matter;
  if (camera) { camera.shakeDuration = 15; camera.shakeMagnitude = 10; }
  if (engine) hitStop(engine, 100); // brief slowdown using live engine instance
  for (let i = 0; i < 50; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 10 + 2;
    createParticle(position.x, position.y, '#ff8c00', Math.random()*4+1, 0, Math.cos(angle) * speed, Math.sin(angle) * speed, 60);
  }
  const bodies = Composite.allBodies(world);
  bodies.forEach(b => {
    if (b.isStatic) return;
    const distance = Vector.magnitude(Vector.sub(b.position, position));
    if (distance < radius) {
      const direction = Vector.normalise(Vector.sub(b.position, position));
      const appliedForce = Vector.mult(direction, force * (1.5 - distance/radius) * (b.mass / 5));
      Body.applyForce(b, b.position, appliedForce);
      if (b.label === 'player-core' && typeof onPlayerHit === 'function') onPlayerHit();
    }
  });
}
