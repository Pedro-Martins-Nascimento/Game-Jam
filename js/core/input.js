"use strict";

export const keys = {};
export const mouse = { 
  x: 0, 
  y: 0, 
  isDown: false,
  clicked: false // Flag para registrar um clique único
};

let _mainCanvas = null;

// --- Funções de manipulação de estado de input ---

export function resetInputState() {
  for (const k of Object.keys(keys)) keys[k] = false;
  mouse.isDown = false;
  // Não resetar 'clicked' aqui, ele deve ser consumido pelo loop do jogo
}

export function consumeClick() {
    mouse.clicked = false;
}

// --- Handlers de eventos ---

function handleWindowBlur() { resetInputState(); }
function handleVisibilityChange() { if (document.hidden) resetInputState(); }

function handleKeyDown(e) {
  keys[e.code] = true;
}
function handleKeyUp(e) { keys[e.code] = false; }

function handleMouseMove(e) {
  const mainCanvas = _mainCanvas || document.getElementById('main-canvas');
  if (!mainCanvas) return;
  const rect = mainCanvas.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
}

function handleMouseDown(e) {
  if (e.button !== 0) return; // Apenas botão esquerdo
  mouse.isDown = true;
  mouse.clicked = true;

  // Apenas previne o comportamento padrão se estivermos no jogo,
  // para não interferir com os botões do menu.
  if (gameState.is(STATES.IN_GAME)) {
    e.preventDefault();
    if (_mainCanvas) _mainCanvas.focus();
  }
}

function handleMouseUp(e) {
  if (e && e.button !== 0) return;
  mouse.isDown = false;
}

function preventContextMenu(e) { e.preventDefault(); }

// --- Funções de setup e remoção de listeners ---

// Armazena referências aos handlers para poder removê-los corretamente
const listeners = {
  keydown: handleKeyDown,
  keyup: handleKeyUp,
  blur: handleWindowBlur,
  visibilitychange: handleVisibilityChange,
  mousemove: handleMouseMove,
  mousedown: handleMouseDown,
  mouseup: handleMouseUp,
  contextmenu: preventContextMenu,
};

export function setupInputListeners() {
  removeInputListeners(); // Garante que não haja duplicatas

  _mainCanvas = document.getElementById('main-canvas');

  window.addEventListener('keydown', listeners.keydown);
  window.addEventListener('keyup', listeners.keyup);
  window.addEventListener('blur', listeners.blur);
  document.addEventListener('visibilitychange', listeners.visibilitychange);

  if (_mainCanvas) {
    if (!_mainCanvas.hasAttribute('tabindex')) _mainCanvas.setAttribute('tabindex', '0');
    _mainCanvas.addEventListener('mousemove', listeners.mousemove);
    _mainCanvas.addEventListener('mousedown', listeners.mousedown);
    _mainCanvas.addEventListener('mouseup', listeners.mouseup);
    _mainCanvas.addEventListener('contextmenu', listeners.contextmenu);
  }
}

export function removeInputListeners() {
  window.removeEventListener('keydown', listeners.keydown);
  window.removeEventListener('keyup', listeners.keyup);
  window.removeEventListener('blur', listeners.blur);
  document.removeEventListener('visibilitychange', listeners.visibilitychange);

  if (_mainCanvas) {
    _mainCanvas.removeEventListener('mousemove', listeners.mousemove);
    _mainCanvas.removeEventListener('mousedown', listeners.mousedown);
    _mainCanvas.removeEventListener('mouseup', listeners.mouseup);
    _mainCanvas.removeEventListener('contextmenu', listeners.contextmenu);
  }
}
