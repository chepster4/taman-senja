// The four screenshot scenes behind ?shot=cover|scene2|scene3|victory. Each one
// sets the real game state to a moment a player could actually reach — some
// differences already found, the counter and clock showing it — then the page
// renders that single frozen frame, so every screenshot is a real render of
// the game's own code, never a composite.
import { SCENES } from './scenes.js';
import { DIFFERENCES } from './differences.js';
import { startGame, startScene } from './state.js';

const FROZEN_NOW = 100000;

function setFound(game, indices) {
  game.found = new Set(indices);
}

function setMouse(game, x, y) {
  game.mouse.x = x;
  game.mouse.y = y;
  game.mouse.inside = true;
}

/** Stage `name` on a fresh game and return the frozen clock for the frame. */
export function stageShot(name, game) {
  if (name === 'scene2') {
    startGame(game, FROZEN_NOW);
    startScene(game, 1, FROZEN_NOW);
    setFound(game, [1, 5]);
    game.timeLeft = 48;
    game.score = 340;
    game.combo = 2;
    game.magnifier = true;
    // The lens sits over the koi on the right panel.
    setMouse(game, 640 + 300, 84 + 300);
    game.cursorVisible = false;
  } else if (name === 'scene3') {
    startGame(game, FROZEN_NOW);
    startScene(game, 2, FROZEN_NOW);
    setFound(game, [0, 1, 3, 4, 6]);
    game.timeLeft = 31;
    game.score = 1180;
    game.combo = 3;
    game.hintReveal = { index: 2, until: FROZEN_NOW + 4000 };
    game.toast = { text: 'Petunjuk: perhatikan Kunang-kunang berkelompok  −50', until: FROZEN_NOW + 2000 };
    setMouse(game, 40 + 430, 84 + 78);
    game.cursorVisible = false;
  } else if (name === 'victory') {
    startGame(game, FROZEN_NOW);
    startScene(game, 2, FROZEN_NOW);
    setFound(game, [0, 1, 2, 3, 4, 5, 6]);
    game.timeLeft = 12;
    game.score = 2450;
    game.totalFound = 21;
    game.bestCombo = 5;
    game.stars = 3;
    game.screen = 'victory';
  } else {
    // Cover: the first garden mid-hunt, three found, four still to find.
    startGame(game, FROZEN_NOW);
    startScene(game, 0, FROZEN_NOW);
    setFound(game, [0, 2, 4]);
    game.timeLeft = 62;
    game.score = 350;
    game.combo = 1;
    game.toast = { text: 'Ketemu! Burung di langit  +100', until: FROZEN_NOW + 1800 };
    setMouse(game, 640 + 300, 84 + 120);
    game.cursor.panel = 1;
    game.cursor.x = 300;
    game.cursor.y = 120;
    game.cursorVisible = true;
  }
  return FROZEN_NOW;
}

export { SCENES, DIFFERENCES };
