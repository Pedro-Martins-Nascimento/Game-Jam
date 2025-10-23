"use strict";

export function showHUD(show) {
  const hud = document.getElementById('hud');
  const dash = document.getElementById('dash-cooldown');
  if (!hud || !dash) return;
  hud.style.display = show ? 'block' : 'none';
  dash.style.display = show ? 'block' : 'none';
}

export function updateHUD({ score = 0, shards = 0, health = 3, dashRatio = 1 }) {
  const scoreEl = document.getElementById('score');
  const shardsEl = document.getElementById('shards');
  const healthEl = document.getElementById('health');
  const dashIndicator = document.getElementById('dash-indicator');
  if (scoreEl) scoreEl.textContent = String(score);
  if (shardsEl) shardsEl.textContent = String(shards);
  if (healthEl) healthEl.textContent = String(health);
  if (dashIndicator) dashIndicator.style.width = `${Math.max(0, Math.min(1, dashRatio)) * 100}%`;
}
