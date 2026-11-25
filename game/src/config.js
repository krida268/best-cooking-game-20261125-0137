// Warung Kilat — configuration: ingredients, recipes, timings.
// Every value the game tunes lives here so balancing never touches logic.

export const CANVAS_W = 960;
export const CANVAS_H = 600;

// One shift lasts 90 seconds; three missed orders end the shift early.
export const SHIFT_SECONDS = 90;
export const MAX_HEARTS = 3;
export const MAX_ORDERS = 3;
export const MAX_PLATES = 2;

// Orders arrive every 10-14 seconds (faster after the rush starts) and
// each customer waits 30 seconds (25 once the rush is on).
export const SPAWN_MIN_S = 10;
export const SPAWN_MAX_S = 14;
export const RUSH_AFTER_S = 45;
export const ORDER_PATIENCE_S = 30;
export const RUSH_PATIENCE_S = 25;

// Scoring: a served dish pays its price plus a tip for patience left,
// plus a combo bonus for serving dishes back to back.
export const TIP_MAX = 50;
export const COMBO_BONUS = 10;
export const COMBO_WINDOW_S = 8;
export const WRONG_SERVE_PENALTY = 10;

export const INGREDIENTS = [
  { id: 'nasi',   name: 'Nasi',   key: '1', color: '#f7ecd0', dark: '#cbb98a' },
  { id: 'mie',    name: 'Mie',    key: '2', color: '#f2c14e', dark: '#b98a1d' },
  { id: 'telur',  name: 'Telur',  key: '3', color: '#fdf6e3', dark: '#d8c690' },
  { id: 'ayam',   name: 'Ayam',   key: '4', color: '#e08a5a', dark: '#a3542a' },
  { id: 'sayur',  name: 'Sayur',  key: '5', color: '#7bc47f', dark: '#3e7d44' },
  { id: 'sambal', name: 'Sambal', key: '6', color: '#d94f3d', dark: '#8f2318' },
];

export const ingredientById = (id) => INGREDIENTS.find((g) => g.id === id);

// Every recipe is exactly three ingredients. The order of the ingredients
// on a plate does not matter — only the set.
export const RECIPES = [
  { id: 'nasi-goreng',   name: 'Nasi Goreng',   needs: ['nasi', 'telur', 'ayam'],   price: 100 },
  { id: 'mie-goreng',    name: 'Mie Goreng',    needs: ['mie', 'telur', 'sayur'],   price: 100 },
  { id: 'sate-madura',   name: 'Sate Madura',   needs: ['ayam', 'sambal', 'sayur'], price: 120 },
  { id: 'gado-gado',     name: 'Gado-Gado',     needs: ['sayur', 'telur', 'sambal'],price: 110 },
  { id: 'ayam-geprek',   name: 'Ayam Geprek',   needs: ['nasi', 'ayam', 'sambal'],  price: 120 },
  { id: 'mie-ayam',      name: 'Mie Ayam',      needs: ['mie', 'ayam', 'sayur'],    price: 110 },
];

export const recipeById = (id) => RECIPES.find((r) => r.id === id);

// Small deterministic PRNG (mulberry32) so screenshot setups are repeatable.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
