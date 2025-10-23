"use strict";

import { allUpgrades } from "../config.js";

export function showStartScreen(onStart) {
  const start = document.getElementById('start-screen');
  if (!start) return;
  start.style.display = 'flex';
  const handler = () => {
    start.style.display = 'none';
    start.removeEventListener('click', handler);
    onStart && onStart();
  };
  start.addEventListener('click', handler);
}

export function showGameOverScreen(score, best, currency, onRestart) {
  const el = document.getElementById('game-over-screen');
  if (!el) return;
  el.style.display = 'flex';
  const fs = document.getElementById('final-score');
  const bs = document.getElementById('best-score');
  const pc = document.getElementById('permanent-currency');
  if (fs) fs.textContent = String(score);
  if (bs) bs.textContent = String(best);
  if (pc) pc.textContent = String(currency);
  const keyHandler = (e) => {
    if (e.code === 'KeyR') {
      window.removeEventListener('keydown', keyHandler);
      el.style.display = 'none';
      onRestart && onRestart();
    }
  };
  window.addEventListener('keydown', keyHandler);
}

export function hideAllScreens() {
  ['start-screen', 'upgrade-screen', 'game-over-screen'].forEach(id => {
    const n = document.getElementById(id);
    if (n) n.style.display = 'none';
  });
}

export function showUpgradeScreen(onSelectUpgrade) {
  const el = document.getElementById('upgrade-screen');
  const options = document.getElementById('upgrade-options');
  if (!el || !options) return;
  el.style.display = 'flex';
  options.innerHTML = '';

  const pool = [...allUpgrades];
  const picks = [];
  for (let i = 0; i < 3 && pool.length > 0; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    picks.push(pool.splice(idx, 1)[0]);
  }
  picks.forEach(up => {
    const div = document.createElement('div');
    div.className = 'upgrade-option';
    div.textContent = up.text;
    div.addEventListener('click', () => {
      el.style.display = 'none';
      up.apply();
      onSelectUpgrade && onSelectUpgrade(up);
    }, { once: true });
    options.appendChild(div);
  });
}
