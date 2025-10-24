"use strict";

import { config } from "../config.js";

export let engine = null;
export let world = null;

export function initPhysics() {
  const { Engine, World } = Matter;
  engine = Engine.create();
  engine.gravity.y = config.world.gravity;
  world = engine.world;
  return { engine, world };
}

export function addStaticBody(x, y, w, h, label = 'static') {
  const { Bodies, World } = Matter;
  const body = Bodies.rectangle(x, y, w, h, { isStatic: true, label });
  World.add(world, body);
  return body;
}

export function setupCollisionEvents(playerRef, callbacks = {}) {
  const { Events } = Matter;
  if (!engine) return;
  Events.on(engine, 'collisionStart', (e) => {
    e.pairs.forEach(p => {
      const labels = [p.bodyA.label, p.bodyB.label];
      if (!playerRef || !playerRef.groundSensor) return;
      if (labels.includes('player-ground-sensor')) { playerRef.contactPoints.ground = true; callbacks.onGround && callbacks.onGround(true); }
      if (labels.includes('player-left-sensor')) { playerRef.contactPoints.left = true; }
      if (labels.includes('player-right-sensor')) { playerRef.contactPoints.right = true; }
    });
  });
  Events.on(engine, 'collisionEnd', (e) => {
    e.pairs.forEach(p => {
      const labels = [p.bodyA.label, p.bodyB.label];
      if (!playerRef || !playerRef.groundSensor) return;
      if (labels.includes('player-ground-sensor')) { playerRef.contactPoints.ground = false; callbacks.onGround && callbacks.onGround(false); }
      if (labels.includes('player-left-sensor')) { playerRef.contactPoints.left = false; }
      if (labels.includes('player-right-sensor')) { playerRef.contactPoints.right = false; }
    });
  });
}

export function clearWorld(engine) {
  if (!engine || !engine.world) return;
  const { World, Composite } = Matter;
  
  // Remove todos os corpos, compostos e restrições, exceto os estáticos
  Composite.allBodies(engine.world).forEach(body => {
    if (!body.isStatic) {
      World.remove(engine.world, body);
    }
  });
  Composite.allComposites(engine.world).forEach(composite => {
    World.remove(engine.world, composite);
  });
  Composite.allConstraints(engine.world).forEach(constraint => {
    World.remove(engine.world, constraint);
  });
}
