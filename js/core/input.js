"use strict";

export const keys = {};
export const mouse = { x: 0, y: 0, isDown: false };

let onJumpKeyDownCallback = null;
let onMouseClickCallback = null;
let _mainCanvas = null;

export function resetInputState() {
  for (const k of Object.keys(keys)) keys[k] = false;
  mouse.isDown = false;
}

function handleWindowBlur() { resetInputState(); }
function handleVisibilityChange() { if (document.hidden) resetInputState(); }

function handleKeyDown(e) {
  keys[e.code] = true;
  if (onJumpKeyDownCallback && typeof onJumpKeyDownCallback === 'function') onJumpKeyDownCallback(e);
}
function handleKeyUp(e) { keys[e.code] = false; }

function handleMouseMove(e) {
  const mainCanvas = _mainCanvas || document.getElementById('main-canvas');
  const rect = mainCanvas.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
}
function handleMouseDown(e) {
  // Only left button should trigger actions
  if (e && e.button !== 0) return;
  mouse.isDown = true;
  if (_mainCanvas) _mainCanvas.focus();
  if (onMouseClickCallback && typeof onMouseClickCallback === 'function') onMouseClickCallback();
}
function handleMouseUp(e) {
  if (e && e.button !== 0) return;
  mouse.isDown = false;
}

export function setupInputListeners(jumpCallback, clickCallback) {
  onJumpKeyDownCallback = jumpCallback;
  onMouseClickCallback = clickCallback;

  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('keyup', handleKeyUp);
  window.removeEventListener('blur', handleWindowBlur);
  document.removeEventListener('visibilitychange', handleVisibilityChange);

  const mainCanvas = document.getElementById('main-canvas');
  _mainCanvas = mainCanvas || _mainCanvas;
  if (mainCanvas) {
    mainCanvas.removeEventListener('mousemove', handleMouseMove);
    mainCanvas.removeEventListener('mousedown', handleMouseDown);
    mainCanvas.removeEventListener('mouseup', handleMouseUp);
    mainCanvas.removeEventListener('contextmenu', preventContextMenu);
  }

  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
  window.addEventListener('blur', handleWindowBlur);
  document.addEventListener('visibilitychange', handleVisibilityChange);

  if (mainCanvas) {
    if (!mainCanvas.hasAttribute('tabindex')) mainCanvas.setAttribute('tabindex', '0');
    mainCanvas.addEventListener('mousemove', handleMouseMove);
    mainCanvas.addEventListener('mousedown', handleMouseDown);
    mainCanvas.addEventListener('mouseup', handleMouseUp);
    mainCanvas.addEventListener('contextmenu', preventContextMenu);
  }
}

function preventContextMenu(e) { e.preventDefault(); }
