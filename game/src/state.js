// The game's state and rules: which screen is showing, what has been found,
// the clock, the score and the combo. Rendering never mutates this; input and
// the main loop call these functions and the state is the single source of truth.
import { SCENES } from './scenes.js';
import { DIFFERENCES } from './differences.js';
import {
  FIND_SCORE, COMBO_STEP, HINT_COOLDOWN_MS, HINT_REVEAL_MS, HINT_COST,
  MISS_PENALTY_SECONDS, SCENE_CLEAR_BONUS_PER_SECOND,
} from './config.js';

export function createGame() {
  return {
    screen: 'title',
    sceneIndex: 0,
    found: new Set(),
    timeLeft: SCENES[0].timeLimit,
    score: 0,
    totalFound: 0,
    combo: 0,
    bestCombo: 0,
    hintCooldownUntil: 0,
    hintReveal: null,
    particles: [],
    toast: null,
    shakeUntil: 0,
    magnifier: false,
    mouse: { x: 0, y: 0, inside: false },
    cursor: { x: 300, y: 225, panel: 1 },
    cursorVisible: false,
    clearBonus: 0,
    stars: 0,
    lastTickSecond: -1,
    startedAt: 0,
  };
}

export function currentScene(game) {
  return SCENES[game.sceneIndex];
}

export function currentDifferences(game) {
  return DIFFERENCES[currentScene(game).id];
}

export function remainingCount(game) {
  return currentDifferences(game).length - game.found.size;
}

export function startGame(game, now) {
  game.screen = 'play';
  game.sceneIndex = 0;
  game.score = 0;
  game.totalFound = 0;
  game.bestCombo = 0;
  game.startedAt = now;
  startScene(game, 0, now);
}

export function startScene(game, index, now) {
  game.sceneIndex = index;
  game.found = new Set();
  game.timeLeft = SCENES[index].timeLimit;
  game.combo = 0;
  game.hintCooldownUntil = 0;
  game.hintReveal = null;
  game.particles = [];
  game.toast = null;
  game.lastTickSecond = -1;
  game.screen = 'play';
}

export function spawnSparkles(game, panelX, panelY, x, y) {
  for (let i = 0; i < 16; i += 1) {
    const a = (i / 16) * Math.PI * 2 + Math.random() * 0.4;
    const speed = 30 + Math.random() * 70;
    game.particles.push({
      panelX, panelY, x, y,
      vx: Math.cos(a) * speed, vy: Math.sin(a) * speed,
      life: 0.7 + Math.random() * 0.3, age: 0,
      size: 2 + Math.random() * 3.5,
      color: Math.random() < 0.5 ? '#ffd93b' : '#fff3b0',
    });
  }
}

/** A click on a difference: mark it on both panels, score it, celebrate it. */
export function findDifference(game, index, now) {
  if (game.found.has(index)) return false;
  game.found.add(index);
  game.totalFound += 1;
  game.combo += 1;
  if (game.combo > game.bestCombo) game.bestCombo = game.combo;
  const gained = FIND_SCORE + (game.combo - 1) * COMBO_STEP;
  game.score += gained;
  const diff = currentDifferences(game)[index];
  spawnSparkles(game, 0, 0, diff.x, diff.y);
  spawnSparkles(game, 1, 0, diff.x, diff.y);
  game.toast = { text: `Ketemu! ${diff.name}  +${gained}`, until: now + 1800 };
  if (game.found.size === currentDifferences(game).length) {
    game.clearBonus = Math.round(game.timeLeft) * SCENE_CLEAR_BONUS_PER_SECOND;
    game.score += game.clearBonus;
    game.screen = 'sceneClear';
  }
  return true;
}

/** A click that finds nothing: the combo breaks and a little time is lost. */
export function missClick(game, now) {
  game.combo = 0;
  game.timeLeft = Math.max(0, game.timeLeft - MISS_PENALTY_SECONDS);
  game.shakeUntil = now + 180;
  game.toast = { text: 'Bukan di situ — coba lagi!', until: now + 1200 };
}

/** Reveal one unfound difference for a few seconds, on a cooldown, for points. */
export function useHint(game, now) {
  if (game.screen !== 'play') return null;
  if (now < game.hintCooldownUntil) return null;
  const rest = currentDifferences(game)
    .map((d, i) => i)
    .filter((i) => !game.found.has(i));
  if (rest.length === 0) return null;
  const pick = rest[Math.floor(Math.random() * rest.length)];
  game.hintReveal = { index: pick, until: now + HINT_REVEAL_MS };
  game.hintCooldownUntil = now + HINT_COOLDOWN_MS;
  game.score = Math.max(0, game.score - HINT_COST);
  game.toast = { text: `Petunjuk: perhatikan ${currentDifferences(game)[pick].name}  −${HINT_COST}`, until: now + 2000 };
  return pick;
}

/** Advance the clock and the particles; returns 'timeUp' once, when time runs out. */
export function tick(game, dt, now) {
  for (const p of game.particles) {
    p.age += dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 60 * dt;
  }
  game.particles = game.particles.filter((p) => p.age < p.life);
  if (game.screen !== 'play') return null;
  game.timeLeft -= dt;
  const whole = Math.ceil(game.timeLeft);
  if (whole <= 10 && whole !== game.lastTickSecond && whole > 0) game.lastTickSecond = whole;
  if (game.timeLeft <= 0) {
    game.timeLeft = 0;
    game.screen = 'timeUp';
    return 'timeUp';
  }
  return null;
}

export function nextScene(game, now) {
  if (game.sceneIndex + 1 >= SCENES.length) {
    game.screen = 'victory';
    game.stars = game.totalFound >= 21 ? 3 : game.totalFound >= 15 ? 2 : 1;
    return;
  }
  startScene(game, game.sceneIndex + 1, now);
}

export function retryScene(game, now) {
  startScene(game, game.sceneIndex, now);
}

export function formatTime(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${String(Math.floor(s / 60)).padStart(1, '0')}:${String(s % 60).padStart(2, '0')}`;
}
