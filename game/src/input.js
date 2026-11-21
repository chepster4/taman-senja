// Mouse and keyboard for Taman Senja. Clicks land on a panel or on a footer
// button; the arrow keys drive a crosshair so the game is fully playable
// without a mouse, and H / M / S / R are the hint, magnifier, sound and retry.
import { PANEL_W, PANEL_H, PANEL_Y, PANEL_LEFT_X, PANEL_RIGHT_X, KEYBOARD_STEP } from './config.js';
import { BUTTON_RECTS } from './render.js';

const PANEL_X = [PANEL_LEFT_X, PANEL_RIGHT_X];

function toCanvas(canvas, clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((clientX - rect.left) / rect.width) * canvas.width,
    y: ((clientY - rect.top) / rect.height) * canvas.height,
  };
}

function panelAt(game, canvasX, canvasY) {
  for (let p = 0; p < 2; p += 1) {
    if (canvasX >= PANEL_X[p] && canvasX < PANEL_X[p] + PANEL_W && canvasY >= PANEL_Y && canvasY < PANEL_Y + PANEL_H) {
      return { panel: p, x: canvasX - PANEL_X[p], y: canvasY - PANEL_Y };
    }
  }
  return null;
}

function inRect(x, y, rect) {
  return x >= rect.x && x < rect.x + rect.w && y >= rect.y && y < rect.y + rect.h;
}

/**
 * Wire the canvas and the keyboard. `actions` is what the game does with each
 * gesture: start, markAt(panel, x, y), hint, toggleMagnifier, toggleSound,
 * advance, retry and restart.
 */
export function attachInput(canvas, game, actions) {
  canvas.addEventListener('mousemove', (event) => {
    const at = toCanvas(canvas, event.clientX, event.clientY);
    game.mouse.x = at.x;
    game.mouse.y = at.y;
    game.mouse.inside = true;
  });
  canvas.addEventListener('mouseleave', () => {
    game.mouse.inside = false;
  });
  canvas.addEventListener('mousedown', (event) => {
    const at = toCanvas(canvas, event.clientX, event.clientY);
    game.mouse.x = at.x;
    game.mouse.y = at.y;
    game.mouse.inside = true;
    if (game.screen === 'title') {
      actions.start();
      return;
    }
    if (game.screen === 'sceneClear') {
      actions.advance();
      return;
    }
    if (game.screen === 'timeUp') {
      actions.retry();
      return;
    }
    if (game.screen === 'victory') {
      actions.restart();
      return;
    }
    if (inRect(at.x, at.y, BUTTON_RECTS.hint)) {
      actions.hint();
      return;
    }
    if (inRect(at.x, at.y, BUTTON_RECTS.magnifier)) {
      actions.toggleMagnifier();
      return;
    }
    if (inRect(at.x, at.y, BUTTON_RECTS.sound)) {
      actions.toggleSound();
      return;
    }
    const hit = panelAt(game, at.x, at.y);
    if (hit) actions.markAt(hit.panel, hit.x, hit.y);
  });
  window.addEventListener('keydown', (event) => {
    const key = event.key;
    if (key === 'Enter' || key === ' ') {
      event.preventDefault();
      if (game.screen === 'title') actions.start();
      else if (game.screen === 'sceneClear') actions.advance();
      else if (game.screen === 'timeUp') actions.retry();
      else if (game.screen === 'victory') actions.restart();
      else if (game.screen === 'play') actions.markAt(game.cursor.panel, game.cursor.x, game.cursor.y);
      return;
    }
    if (game.screen !== 'play') {
      if (key === 'r' || key === 'R') {
        if (game.screen === 'victory') actions.restart();
        else if (game.screen === 'timeUp') actions.retry();
      }
      return;
    }
    if (key === 'ArrowLeft' || key === 'ArrowRight' || key === 'ArrowUp' || key === 'ArrowDown') {
      event.preventDefault();
      game.cursorVisible = true;
      if (key === 'ArrowLeft') game.cursor.x = Math.max(8, game.cursor.x - KEYBOARD_STEP);
      if (key === 'ArrowRight') game.cursor.x = Math.min(PANEL_W - 8, game.cursor.x + KEYBOARD_STEP);
      if (key === 'ArrowUp') game.cursor.y = Math.max(8, game.cursor.y - KEYBOARD_STEP);
      if (key === 'ArrowDown') game.cursor.y = Math.min(PANEL_H - 8, game.cursor.y + KEYBOARD_STEP);
      return;
    }
    if (key === 'Tab') {
      event.preventDefault();
      game.cursorVisible = true;
      game.cursor.panel = 1 - game.cursor.panel;
      return;
    }
    if (key === 'h' || key === 'H') actions.hint();
    if (key === 'm' || key === 'M') actions.toggleMagnifier();
    if (key === 's' || key === 'S') actions.toggleSound();
    if (key === 'r' || key === 'R') actions.retry();
  });
}
