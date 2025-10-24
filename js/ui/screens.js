"use strict";

import { allUpgrades } from "../config.js";

export function showStartScreen(onStart, onShowCharacters, onShowShop) {
  const start = document.getElementById('start-screen');
  if (!start) return;
  start.style.display = 'flex';

  const playBtn = document.getElementById('play-button');
  const charBtn = document.getElementById('character-button');
  const shopBtn = document.getElementById('shop-button');

  const playHandler = () => {
    hideAllScreens();
    onShowCharacters();
    cleanup();
  };

  const charHandler = () => {
    hideAllScreens();
    onShowCharacters();
    cleanup();
  };

  const shopHandler = () => {
    hideAllScreens();
    onShowShop();
    cleanup();
  };

  const cleanup = () => {
    playBtn.removeEventListener('click', playHandler);
    charBtn.removeEventListener('click', charHandler);
    shopBtn.removeEventListener('click', shopHandler);
  };

  playBtn.addEventListener('click', playHandler);
  charBtn.addEventListener('click', charHandler);
  shopBtn.addEventListener('click', shopHandler);
}

export function showGameOverScreen(score, best, currency, onRestart) {
  hideAllScreens();
  const el = document.getElementById('game-over-screen');
  if (!el) return;
  
  el.style.display = 'flex';
  const fs = document.getElementById('final-score');
  const bs = document.getElementById('best-score');
  const pc = document.getElementById('permanent-currency');
  if (fs) fs.textContent = String(score);
  if (bs) bs.textContent = String(best);
  if (pc) pc.textContent = String(currency);

  // Adiciona um atraso para evitar que o clique que causou o game over feche a tela
  setTimeout(() => {
    const restartHandler = () => {
      el.removeEventListener('click', restartHandler);
      onRestart();
    };
    el.addEventListener('click', restartHandler, { once: true });
  }, 500); // Atraso de 500ms
}

export function hideAllScreens() {
  ['start-screen', 'upgrade-screen', 'game-over-screen', 'character-selection-screen', 'shop-screen'].forEach(id => {
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

export function showCharacterSelectionScreen(onStartGame, onBack, unlockedCharacters = ['kira']) {
    const screen = document.getElementById('character-selection-screen');
    if (!screen) return;
    screen.style.display = 'flex';

    const startBtn = document.getElementById('start-run-from-char-select');
    const backBtn = screen.querySelector('.back-button');
    const characterCards = screen.querySelectorAll('.character-card');

    let selectedCharacter = null;

    // Habilita/desabilita cards baseados nos personagens desbloqueados
    characterCards.forEach(card => {
        const charName = card.dataset.character;
        if (unlockedCharacters.includes(charName)) {
            card.classList.remove('locked');
            card.addEventListener('click', selectCharHandler);
        } else {
            card.classList.add('locked');
            card.removeEventListener('click', selectCharHandler);
        }
    });

    const startHandler = () => {
        if (selectedCharacter) {
            onStartGame(selectedCharacter);
            cleanup();
        } else {
            alert("Por favor, selecione um personagem desbloqueado.");
        }
    };

    const backHandler = () => {
        onBack();
        cleanup();
    };

    function selectCharHandler(e) {
        characterCards.forEach(card => card.style.borderColor = '#00ffff');
        const selectedCard = e.currentTarget;
        selectedCard.style.borderColor = '#ff00ff'; // Highlight
        selectedCharacter = selectedCard.dataset.character;
    };

    const cleanup = () => {
        startBtn.removeEventListener('click', startHandler);
        backBtn.removeEventListener('click', backHandler);
        characterCards.forEach(card => card.removeEventListener('click', selectCharHandler));
        screen.style.display = 'none';
    };

    startBtn.addEventListener('click', startHandler);
    backBtn.addEventListener('click', backHandler);
}

export function showShopScreen(onBack) {
    const screen = document.getElementById('shop-screen');
    if (!screen) return;
    screen.style.display = 'flex';

    const backBtn = screen.querySelector('.back-button');

    const backHandler = () => {
        onBack();
        cleanup();
    };
    
    const cleanup = () => {
        backBtn.removeEventListener('click', backHandler);
        screen.style.display = 'none';
    };

    backBtn.addEventListener('click', backHandler);
}
