// Warung Kilat — game state: orders, plates, scoring, timers.
// Pure logic, no drawing and no DOM, so it can be driven by tests.

import {
  SHIFT_SECONDS,
  MAX_HEARTS,
  MAX_ORDERS,
  MAX_PLATES,
  SPAWN_MIN_S,
  SPAWN_MAX_S,
  RUSH_AFTER_S,
  ORDER_PATIENCE_S,
  RUSH_PATIENCE_S,
  TIP_MAX,
  COMBO_BONUS,
  COMBO_WINDOW_S,
  WRONG_SERVE_PENALTY,
  RECIPES,
  mulberry32,
} from './config.js';

let orderSeq = 0;

export function createGame(seed = 20261125) {
  return {
    screen: 'title', // 'title' | 'playing' | 'over'
    seed,
    rng: mulberry32(seed),
    score: 0,
    served: 0,
    missed: 0,
    hearts: MAX_HEARTS,
    combo: 0,
    bestCombo: 0,
    comboTimer: 0,
    timeLeft: SHIFT_SECONDS,
    elapsed: 0,
    spawnTimer: 4,
    orders: [],
    plates: Array.from({ length: MAX_PLATES }, () => ({ items: [] })),
    activePlate: 0,
    message: 'Selamat datang di Warung Kilat!',
    messageT: 0,
    messageKind: 'info',
    overReason: '',
    muted: false,
    sfx: null, // set by main.js: a function (name) => void
  };
}

export function startGame(game) {
  const fresh = createGame((game.seed + 1) % 100000);
  Object.assign(game, fresh, { screen: 'playing', message: 'Shift dimulai! Layani pelanggan!', messageT: 3 });
}

function pickRecipe(game, avoidId = null) {
  const pool = RECIPES.filter((r) => r.id !== avoidId);
  return pool[Math.floor(game.rng() * pool.length)];
}

export function spawnOrder(game, recipeId = null) {
  if (game.orders.length >= MAX_ORDERS) return null;
  const patience = game.elapsed >= RUSH_AFTER_S ? RUSH_PATIENCE_S : ORDER_PATIENCE_S;
  const recipe = recipeId
    ? RECIPES.find((r) => r.id === recipeId)
    : pickRecipe(game, game.orders[game.orders.length - 1]?.recipe.id);
  const order = {
    id: ++orderSeq,
    recipe,
    patience,
    patienceLeft: patience,
    // A little face variety per customer, derived from the order id.
    face: (orderSeq * 7) % 5,
  };
  game.orders.push(order);
  return order;
}

export function addIngredient(game, ingredientId) {
  if (game.screen !== 'playing') return false;
  const plate = game.plates[game.activePlate];
  if (plate.items.length >= 4) return false;
  plate.items.push(ingredientId);
  game.sfx?.('pick');
  return true;
}

export function clearPlate(game) {
  if (game.screen !== 'playing') return;
  game.plates[game.activePlate].items = [];
  game.sfx?.('trash');
}

export function selectPlate(game, index) {
  if (game.screen !== 'playing') return;
  if (index < 0 || index >= game.plates.length) return;
  game.activePlate = index;
  game.sfx?.('pick');
}

// The plate's ingredient set matches a recipe when it holds exactly the
// recipe's three ingredients, in any order.
export function plateMatchesRecipe(items, recipe) {
  if (items.length !== recipe.needs.length) return false;
  const have = [...items].sort().join(',');
  const want = [...recipe.needs].sort().join(',');
  return have === want;
}

export function servePlate(game) {
  if (game.screen !== 'playing') return 'idle';
  const plate = game.plates[game.activePlate];
  if (plate.items.length === 0) return 'empty';
  const orderIndex = game.orders.findIndex((o) => plateMatchesRecipe(plate.items, o.recipe));
  if (orderIndex === -1) {
    plate.items = [];
    game.score = Math.max(0, game.score - WRONG_SERVE_PENALTY);
    game.combo = 0;
    game.message = 'Salah resep! Pelanggan menggeleng.';
    game.messageT = 2.5;
    game.messageKind = 'bad';
    game.sfx?.('error');
    return 'wrong';
  }
  const order = game.orders[orderIndex];
  game.orders.splice(orderIndex, 1);
  const tip = Math.round((order.patienceLeft / order.patience) * TIP_MAX);
  const comboBonus = game.combo > 0 ? COMBO_BONUS * game.combo : 0;
  const gained = order.recipe.price + tip + comboBonus;
  game.score += gained;
  game.served += 1;
  game.combo += 1;
  game.bestCombo = Math.max(game.bestCombo, game.combo);
  game.comboTimer = COMBO_WINDOW_S;
  plate.items = [];
  game.message = `Mantap! ${order.recipe.name} tersaji +${gained} (tip ${tip})`;
  game.messageT = 2.5;
  game.messageKind = 'good';
  game.sfx?.('serve');
  return 'served';
}

function endShift(game, reason) {
  game.screen = 'over';
  game.overReason = reason;
  game.sfx?.('over');
}

export function update(game, dt) {
  if (game.screen !== 'playing') return;
  game.elapsed += dt;
  game.timeLeft = Math.max(0, SHIFT_SECONDS - game.elapsed);
  if (game.messageT > 0) game.messageT -= dt;
  if (game.comboTimer > 0) {
    game.comboTimer -= dt;
    if (game.comboTimer <= 0) game.combo = 0;
  }

  // Orders lose patience; an expired order costs a heart.
  for (let i = game.orders.length - 1; i >= 0; i--) {
    const order = game.orders[i];
    order.patienceLeft -= dt;
    if (order.patienceLeft <= 0) {
      game.orders.splice(i, 1);
      game.missed += 1;
      game.hearts -= 1;
      game.combo = 0;
      game.message = `Pelanggan ${order.recipe.name} pergi kecewa!`;
      game.messageT = 2.5;
      game.messageKind = 'bad';
      game.sfx?.('miss');
      if (game.hearts <= 0) {
        endShift(game, 'Tiga pelanggan pergi kecewa.');
        return;
      }
    }
  }

  // New orders keep arriving while the shift runs.
  game.spawnTimer -= dt;
  if (game.spawnTimer <= 0 && game.orders.length < MAX_ORDERS) {
    spawnOrder(game);
    game.spawnTimer = SPAWN_MIN_S + game.rng() * (SPAWN_MAX_S - SPAWN_MIN_S);
    if (game.elapsed >= RUSH_AFTER_S) game.spawnTimer *= 0.8;
    game.sfx?.('ding');
  }

  if (game.timeLeft <= 0) {
    endShift(game, 'Shift selesai! Waktunya istirahat.');
  }
}
