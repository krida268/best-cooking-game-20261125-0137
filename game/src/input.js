// Warung Kilat — input: mouse clicks and keyboard, mapped onto the game.
// Hit-testing reuses the geometry render.js draws, so a click lands where
// the player sees the button.

import { layout } from './render.js';
import { INGREDIENTS } from './config.js';
import { addIngredient, clearPlate, selectPlate, servePlate, startGame } from './state.js';

function inside(rect, x, y) {
  return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
}

function canvasPoint(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * canvas.width,
    y: ((event.clientY - rect.top) / rect.height) * canvas.height,
  };
}

function handleClick(canvas, game, event) {
  const { x, y } = canvasPoint(canvas, event);
  const L = layout();
  if (inside(L.muteBtn, x, y)) {
    game.muted = !game.muted;
    return;
  }
  if (game.screen === 'title') {
    if (inside(L.startBtn, x, y)) startGame(game);
    return;
  }
  if (game.screen === 'over') {
    if (inside(L.restartBtn, x, y)) startGame(game);
    return;
  }
  for (let i = 0; i < L.bins.length; i++) {
    if (inside(L.bins[i], x, y)) {
      addIngredient(game, L.bins[i].id);
      return;
    }
  }
  for (let i = 0; i < L.plates.length; i++) {
    if (inside(L.serveBtn[i], x, y)) {
      selectPlate(game, i);
      servePlate(game);
      return;
    }
    if (inside(L.trashBtn[i], x, y)) {
      selectPlate(game, i);
      clearPlate(game);
      return;
    }
    if (inside(L.plates[i], x, y)) {
      selectPlate(game, i);
      return;
    }
  }
}

function handleKey(game, event) {
  const key = event.key.toLowerCase();
  if (key === 'm') {
    game.muted = !game.muted;
    return;
  }
  if (game.screen === 'title' || game.screen === 'over') {
    if (key === 'enter' || key === ' ') startGame(game);
    return;
  }
  if (key === 'tab' || key === 'q') {
    event.preventDefault();
    selectPlate(game, (game.activePlate + 1) % game.plates.length);
    return;
  }
  if (key === ' ') {
    event.preventDefault();
    servePlate(game);
    return;
  }
  if (key === 'backspace' || key === 'delete') {
    clearPlate(game);
    return;
  }
  const ingredient = INGREDIENTS.find((g) => g.key === key);
  if (ingredient) addIngredient(game, ingredient.id);
}

export function attachInput(canvas, game) {
  canvas.addEventListener('click', (event) => handleClick(canvas, game, event));
  window.addEventListener('keydown', (event) => handleKey(game, event));
}
