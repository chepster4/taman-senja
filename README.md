# Taman Senja — Cari Perbedaannya

[![make.fun](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/c/best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/chepster4/taman-senja/rank.svg)](https://make.fun/c/best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/chepster4/taman-senja/reward.svg)](https://make.fun/c/best-spot-the-difference-game-20261121-0451)

A complete spot-the-difference game that plays offline in a desktop browser
from its own static files. Two near-identical pictures side by side, seven
fair-but-hidden differences in each of three original gardens, a clock that
presses, a hint that behaves, and a magnifier for the hard ones.

## The gardens

1. **Kebun Bunga Senja** — a dusk flower garden (90 seconds, the gentle hunt)
2. **Kolam Teratai Malam** — a lotus pond at night (75 seconds)
3. **Hutan Kunang-Kunang** — a firefly forest (60 seconds, the hardest hunt)

Every picture is drawn procedurally in code — canvas gradients, seeded
scenery, no image, font or sound file, no network request at all.

## How to play

- **Mouse:** click a difference on either picture to mark it on both.
- **Keyboard:** arrow keys move the crosshair, **Space** marks, **Tab**
  switches picture, **H** asks for a hint, **M** toggles the magnifier,
  **S** toggles sound, **R** retries the garden.
- A find scores 100 points plus a combo bonus; a miss breaks the combo and
  costs 3 seconds. A hint reveals one difference for 4 seconds, costs 50
  points, and cools down for 20 seconds. Clearing a garden pays a time bonus.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Screenshots in `screenshots/` are real renders of the game's own code
(`?shot=cover|scene2|scene3|victory` stages each frozen frame).

## Layout

- `game/index.html` — the page, one canvas
- `game/src/main.js` — the loop and the wiring
- `game/src/state.js` — screens, clock, score, combo, hints
- `game/src/scenes.js` — the three gardens, painted from seeds
- `game/src/differences.js` — the 21 differences, one draw per panel
- `game/src/render.js` — header, panels, markers, magnifier, overlays
- `game/src/input.js` — mouse and keyboard
- `game/src/audio.js` — WebAudio sounds, synthesised, no files
- `game/src/random.js` — the deterministic random source
- `game/src/shots.js` — the four screenshot scenes
- `main.ts` — copies `game/` and `screenshots/` to `/output`, writes the dossier
- `vendor/makefun-game.ts` — the kit's library, unchanged

License: MIT. See `LICENSE`.
