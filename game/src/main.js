// Taman Senja — the entry point. It owns the loop, the sounds and the wiring
// between input, state and rendering; the rules live in state.js and the
// pictures live in render.js and scenes.js.
import { PANEL_W, PANEL_H, HIT_SLOP } from './config.js';
import { SCENES } from './scenes.js';
import { DIFFERENCES } from './differences.js';
import { SoundBank } from './audio.js';
import { createGame, currentDifferences, startGame, startScene, findDifference, missClick, useHint, tick, nextScene, retryScene } from './state.js';
import { buildPanels, drawGame } from './render.js';
import { attachInput } from './input.js';
import { stageShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const sounds = new SoundBank();
const game = createGame();
game.muted = false;

let panels = buildPanels(SCENES[0]);
let lastSceneIndex = 0;
let lastScreen = game.screen;
let lastTickSecond = -1;

// Exposed for local play-testing: a test driver reads the live state.
window.__game = game;
window.__shotReady = false;

function rebuildPanels() {
  panels = buildPanels(SCENES[game.sceneIndex]);
  lastSceneIndex = game.sceneIndex;
}

/** The click at panel coordinates: a found difference, or a miss. */
function markAt(panel, x, y) {
  if (game.screen !== 'play') return;
  sounds.unlock();
  const diffs = currentDifferences(game);
  for (let i = 0; i < diffs.length; i += 1) {
    if (game.found.has(i)) continue;
    const d = diffs[i];
    const dx = x - d.x;
    const dy = y - d.y;
    if (dx * dx + dy * dy <= (d.r + HIT_SLOP) * (d.r + HIT_SLOP)) {
      const wasLast = game.found.size === diffs.length - 1;
      findDifference(game, i, performance.now());
      sounds.playFind(game.combo);
      if (wasLast) sounds.playSceneClear();
      return;
    }
  }
  missClick(game, performance.now());
  sounds.playMiss();
}

const actions = {
  start() {
    sounds.unlock();
    sounds.playClick();
    startGame(game, performance.now());
    rebuildPanels();
  },
  markAt,
  hint() {
    sounds.unlock();
    const picked = useHint(game, performance.now());
    if (picked !== null) sounds.playHint();
  },
  toggleMagnifier() {
    sounds.unlock();
    game.magnifier = !game.magnifier;
    sounds.playClick();
  },
  toggleSound() {
    sounds.unlock();
    game.muted = sounds.toggleMute();
  },
  advance() {
    sounds.unlock();
    sounds.playClick();
    nextScene(game, performance.now());
    rebuildPanels();
  },
  retry() {
    sounds.unlock();
    sounds.playClick();
    retryScene(game, performance.now());
    rebuildPanels();
  },
  restart() {
    sounds.unlock();
    sounds.playClick();
    startGame(game, performance.now());
    rebuildPanels();
  },
};

attachInput(canvas, game, actions);

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
if (shot) {
  // Screenshot mode: stage one frozen frame and render it once.
  const frozenNow = stageShot(shot, game);
  rebuildPanels();
  drawGame(ctx, game, panels, frozenNow);
  window.__shotReady = true;
} else {
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    if (game.sceneIndex !== lastSceneIndex) rebuildPanels();
    const result = tick(game, dt, now);
    if (result === 'timeUp') sounds.playMiss();
    const whole = Math.ceil(game.timeLeft);
    if (game.screen === 'play' && whole <= 10 && whole > 0 && whole !== lastTickSecond) {
      lastTickSecond = whole;
      sounds.playTick();
    }
    if (game.screen === 'victory' && lastScreen !== 'victory') sounds.playVictory();
    lastScreen = game.screen;
    drawGame(ctx, game, panels, now);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
