// Warung Kilat — entry point: the loop, the wiring, the screenshot hook.
// The game runs at 960x600 on one canvas; the loop ticks state and draws
// every animation frame. With ?shot=<name> in the URL the game renders one
// frozen scene instead, for the entry's screenshots.

import { CANVAS_W, CANVAS_H } from './config.js';
import { createGame, update } from './state.js';
import { draw } from './render.js';
import { attachInput } from './input.js';
import { createSfx } from './audio.js';
import { applyShot } from './shots.js';

const canvas = document.getElementById('game');
canvas.width = CANVAS_W;
canvas.height = CANVAS_H;
const ctx = canvas.getContext('2d');

const game = createGame();
game.sfx = createSfx(game);
attachInput(canvas, game);

// Test hook: the page exposes the live game so a headless run can drive it
// (start the shift, click a bin, read the score) without a mouse.
window.__game = game;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
if (shot && applyShot(game, shot)) {
  // Frozen scene: draw once, run no timers, so the shot is identical
  // every time it is opened.
  draw(ctx, game);
} else {
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    update(game, dt);
    draw(ctx, game);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
