// Warung Kilat — screenshot setups: deterministic scenes for the entry's
// screenshots, built from the same state the real game plays with.
// ?shot=start  — title screen over the kitchen
// ?shot=play   — mid-shift: two orders, one dish mid-assembly
// ?shot=serve  — a finished dish on the plate, ready to serve
// ?shot=end    — shift complete, score on the board
// A shot freezes the game (no timers run) so the render is identical every
// time the same URL is opened.

import { createGame, spawnOrder } from './state.js';

function basePlaying(seed) {
  const game = createGame(seed);
  game.screen = 'playing';
  game.message = 'Shift berjalan! Layani pelanggan!';
  game.messageT = 99;
  return game;
}

export function applyShot(game, name) {
  if (name === 'start') {
    game.screen = 'title';
    game.score = 0;
    game.timeLeft = 90;
    game.hearts = 3;
    spawnOrder(game, 'nasi-goreng');
    game.orders[0].patienceLeft = 24;
    return true;
  }
  if (name === 'play') {
    const fresh = basePlaying(7);
    Object.assign(game, fresh);
    game.score = 340;
    game.combo = 2;
    game.comboTimer = 6;
    game.timeLeft = 62;
    game.elapsed = 28;
    game.hearts = 3;
    spawnOrder(game, 'nasi-goreng');
    game.orders[0].patienceLeft = 18;
    spawnOrder(game, 'mie-ayam');
    game.orders[1].patienceLeft = 26;
    game.plates[0].items = ['nasi', 'telur'];
    game.activePlate = 0;
    game.message = 'Nasi Goreng butuh Ayam lagi!';
    game.messageKind = 'info';
    return true;
  }
  if (name === 'serve') {
    const fresh = basePlaying(11);
    Object.assign(game, fresh);
    game.score = 560;
    game.combo = 3;
    game.comboTimer = 7;
    game.timeLeft = 41;
    game.elapsed = 49;
    game.hearts = 2;
    spawnOrder(game, 'sate-madura');
    game.orders[0].patienceLeft = 12;
    spawnOrder(game, 'gado-gado');
    game.orders[1].patienceLeft = 22;
    game.plates[0].items = ['ayam', 'sambal', 'sayur'];
    game.activePlate = 0;
    game.message = 'Sate Madura siap disajikan!';
    game.messageKind = 'good';
    return true;
  }
  if (name === 'end') {
    const fresh = basePlaying(21);
    Object.assign(game, fresh);
    game.screen = 'over';
    game.score = 870;
    game.served = 8;
    game.missed = 1;
    game.bestCombo = 4;
    game.hearts = 2;
    game.overReason = 'Shift selesai! Waktunya istirahat.';
    return true;
  }
  return false;
}
