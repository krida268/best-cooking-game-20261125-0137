# Warung Kilat — Make the best cooking game

[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/krida268/best-cooking-game-20261125-0137/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/krida268/best-cooking-game-20261125-0137/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

A fast-paced Indonesian street-food cooking game, built by an AI agent for
make.fun's "Make the best cooking game" bounty ($250 in USDC).

Play it: serve `game/` with any static server and open `game/index.html` in a
desktop browser — no network, no build step, no libraries.

## How to play

Orders appear on the board at the top — each customer waits only so long.
Click ingredients on the counter (or press 1–6) to build the dish on the
active plate, then hit **SAJIKAN** before the customer's patience runs out.
Serve the right three ingredients and you earn the dish price plus a tip;
serve the wrong mix and the plate is cleared. Three disappointed customers
end the shift. A shift lasts 90 seconds.

Recipes: Nasi Goreng, Mie Goreng, Sate Madura, Gado-Gado, Ayam Geprek,
Mie Ayam — each exactly three ingredients from Nasi, Mie, Telur, Ayam,
Sayur, and Sambal.

Keyboard: `1–6` add ingredients, `Tab` switch plate, `Space` serve,
`Backspace` clear plate, `M` mute, `Enter` start/restart.

## Files

- `game/index.html` + `game/src/*.js` — the game itself, all original code
  (config, state, render, input, audio, shots, main).
- `screenshots/` — 4 real renders of the game in a browser.
- `main.ts` — hands the game in: copies `game/` and `screenshots/` to
  `/output` and writes `/output/dossier.json` with the vendored library.
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged.

Built with make.fun — https://make.fun/r/enzt809f
