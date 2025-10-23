"use strict";

export function drawBody(ctx, body) {
  const vertices = body.vertices;
  ctx.beginPath();
  ctx.moveTo(vertices[0].x, vertices[0].y);
  for (let j = 1; j < vertices.length; j++) {
    ctx.lineTo(vertices[j].x, vertices[j].y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}
