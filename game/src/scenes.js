// The three gardens of Taman Senja. Each scene paints its base picture once from
// a seed — the same seed for both panels, so the panels agree everywhere except
// the seven differences in differences.js. Nothing here loads an asset: every
// flower, fish and firefly is drawn by code.
import { mulberry32, range, pick, integer } from './random.js';

const TULIP_COLORS = ['#ff5d8f', '#ff9f43', '#a55eea', '#f7f7f7', '#ff6b6b'];
const DAISY_COLORS = ['#fff3b0', '#ffd6e8', '#ffffff', '#ffb8d1'];

function skyGradient(ctx, w, h, stops) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  for (const [at, color] of stops) g.addColorStop(at, color);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

function ellipse(ctx, x, y, rx, ry, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function circle(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function petalFlower(ctx, x, y, r, petal, centre) {
  ctx.fillStyle = petal;
  for (let i = 0; i < 5; i += 1) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    ellipse(ctx, x + Math.cos(a) * r * 0.62, y + Math.sin(a) * r * 0.62, r * 0.55, r * 0.55, petal);
  }
  circle(ctx, x, y, r * 0.42, centre);
}

function drawCloud(ctx, x, y, scale, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, 42 * scale, 15 * scale, 0, 0, Math.PI * 2);
  ctx.ellipse(x - 26 * scale, y + 5 * scale, 26 * scale, 11 * scale, 0, 0, Math.PI * 2);
  ctx.ellipse(x + 28 * scale, y + 5 * scale, 28 * scale, 12 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawButterfly(ctx, x, y, scale, upper, lower) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = upper;
  ctx.beginPath();
  ctx.ellipse(-5, -4, 6, 8, -0.5, 0, Math.PI * 2);
  ctx.ellipse(5, -4, 6, 8, 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = lower;
  ctx.beginPath();
  ctx.ellipse(-4, 5, 4.5, 6, -0.3, 0, Math.PI * 2);
  ctx.ellipse(4, 5, 4.5, 6, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#2d1b3d';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(0, -6);
  ctx.lineTo(0, 8);
  ctx.stroke();
  ctx.restore();
}

function drawBird(ctx, x, y, scale, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.2 * scale;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 11 * scale, y);
  ctx.quadraticCurveTo(x - 4 * scale, y - 8 * scale, x, y);
  ctx.quadraticCurveTo(x + 4 * scale, y - 8 * scale, x + 11 * scale, y);
  ctx.stroke();
}

/** Scene 1: a dusk flower garden — warm, bright, the gentle opening hunt. */
function drawKebun(ctx, w, h) {
  const rng = mulberry32(11);
  skyGradient(ctx, w, h, [[0, '#2b1e4f'], [0.45, '#7b4b8a'], [0.72, '#e8734a'], [1, '#f7b267']]);
  // Low sun with a warm halo.
  const glow = ctx.createRadialGradient(470, 95, 8, 470, 95, 90);
  glow.addColorStop(0, 'rgba(255, 214, 120, 0.9)');
  glow.addColorStop(1, 'rgba(255, 214, 120, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(360, 0, 220, 200);
  circle(ctx, 470, 95, 36, '#ffd678');
  circle(ctx, 470, 95, 28, '#ffe9a8');
  drawCloud(ctx, 120, 70, 1, 'rgba(255, 214, 190, 0.75)');
  drawCloud(ctx, 330, 45, 0.7, 'rgba(255, 214, 190, 0.55)');
  drawCloud(ctx, 540, 130, 0.55, 'rgba(255, 190, 170, 0.5)');
  // Distant hills.
  ctx.fillStyle = '#5b3a6e';
  ctx.beginPath();
  ctx.moveTo(0, 250);
  ctx.quadraticCurveTo(150, 190, 320, 245);
  ctx.quadraticCurveTo(470, 285, 600, 240);
  ctx.lineTo(600, 450);
  ctx.lineTo(0, 450);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#472a5c';
  ctx.beginPath();
  ctx.moveTo(0, 280);
  ctx.quadraticCurveTo(200, 235, 420, 275);
  ctx.quadraticCurveTo(520, 295, 600, 270);
  ctx.lineTo(600, 450);
  ctx.lineTo(0, 450);
  ctx.closePath();
  ctx.fill();
  // Garden ground and the winding path.
  const ground = ctx.createLinearGradient(0, 260, 0, 450);
  ground.addColorStop(0, '#3f7d44');
  ground.addColorStop(1, '#2c5c33');
  ctx.fillStyle = ground;
  ctx.fillRect(0, 260, w, 190);
  ctx.fillStyle = '#d9b380';
  ctx.beginPath();
  ctx.moveTo(255, 450);
  ctx.quadraticCurveTo(285, 360, 265, 285);
  ctx.quadraticCurveTo(258, 258, 250, 250);
  ctx.lineTo(330, 250);
  ctx.quadraticCurveTo(345, 290, 330, 360);
  ctx.quadraticCurveTo(318, 420, 345, 450);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#c9a06e';
  for (let i = 0; i < 7; i += 1) ellipse(ctx, 285 + range(rng, -14, 14), 300 + i * 22, 16, 5, '#c9a06e');
  // Wooden fence across the middle.
  ctx.fillStyle = '#6b4a2f';
  ctx.fillRect(0, 296, w, 7);
  ctx.fillRect(0, 318, w, 7);
  for (let x = 18; x < w; x += 52) {
    ctx.fillStyle = '#7d5a38';
    ctx.fillRect(x, 282, 12, 52);
    ctx.fillStyle = '#8f6b45';
    ctx.fillRect(x, 282, 12, 5);
  }
  // The old tree on the left.
  ctx.fillStyle = '#4a3220';
  ctx.fillRect(58, 190, 16, 110);
  ctx.beginPath();
  ctx.moveTo(66, 200);
  ctx.lineTo(38, 165);
  ctx.lineTo(52, 168);
  ctx.lineTo(66, 150);
  ctx.lineTo(82, 170);
  ctx.lineTo(96, 162);
  ctx.lineTo(74, 205);
  ctx.closePath();
  ctx.fill();
  circle(ctx, 66, 140, 52, '#2f6b35');
  circle(ctx, 30, 160, 34, '#357a3c');
  circle(ctx, 104, 158, 36, '#2a5f30');
  circle(ctx, 66, 112, 30, '#3d8343');
  // Flower beds left and right of the path.
  for (let i = 0; i < 26; i += 1) {
    const x = i < 13 ? range(rng, 12, 235) : range(rng, 355, 588);
    const y = range(rng, 335, 435);
    const s = range(rng, 0.8, 1.3);
    ctx.strokeStyle = '#2c5c33';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(x, y + 12 * s);
    ctx.lineTo(x, y - 2 * s);
    ctx.stroke();
    if (rng() < 0.55) petalFlower(ctx, x, y - 4 * s, 7 * s, pick(rng, TULIP_COLORS), '#ffd93b');
    else {
      ctx.fillStyle = pick(rng, DAISY_COLORS);
      for (let p = 0; p < 6; p += 1) {
        const a = (p / 6) * Math.PI * 2;
        ellipse(ctx, x + Math.cos(a) * 6 * s, y - 4 * s + Math.sin(a) * 6 * s, 4 * s, 4 * s, pick(rng, DAISY_COLORS));
      }
      circle(ctx, x, y - 4 * s, 3.4 * s, '#ff9f43');
    }
  }
  // Grass tufts and pebbles.
  ctx.strokeStyle = '#4c8a4f';
  ctx.lineWidth = 2;
  for (let i = 0; i < 30; i += 1) {
    const x = range(rng, 8, 592);
    const y = range(rng, 270, 445);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - 3, y - 8);
    ctx.moveTo(x + 3, y);
    ctx.lineTo(x + 5, y - 9);
    ctx.stroke();
  }
  // Lantern posts: one each side of the path.
  for (const lx of [96, 504]) {
    ctx.fillStyle = '#3a2a1c';
    ctx.fillRect(lx - 3, 216, 6, 66);
    ctx.fillStyle = '#2c2115';
    ctx.fillRect(lx - 14, 204, 28, 6);
  }
  // Butterflies drifting over the beds.
  drawButterfly(ctx, 210, 150, 1, '#ff9ff3', '#f368e0');
  drawButterfly(ctx, 380, 210, 0.85, '#48dbfb', '#0abde3');
  drawButterfly(ctx, 520, 320, 0.8, '#feca57', '#ff9f43');
}

/** Scene 2: a lotus pond at night — cooler, calmer, harder to scan. */
function drawTeratai(ctx, w, h) {
  const rng = mulberry32(23);
  skyGradient(ctx, w, h, [[0, '#070d24'], [0.5, '#14224e'], [1, '#1d3a6e']]);
  // Stars.
  for (let i = 0; i < 46; i += 1) {
    const x = range(rng, 6, 594);
    const y = range(rng, 8, 150);
    const r = range(rng, 0.8, 2.1);
    ctx.globalAlpha = range(rng, 0.4, 1);
    circle(ctx, x, y, r, '#e8f1ff');
  }
  ctx.globalAlpha = 1;
  // Moon and its shimmer on the water.
  const glow = ctx.createRadialGradient(480, 80, 6, 480, 80, 80);
  glow.addColorStop(0, 'rgba(240, 244, 255, 0.85)');
  glow.addColorStop(1, 'rgba(240, 244, 255, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(390, 0, 180, 170);
  circle(ctx, 480, 80, 32, '#f4f7ff');
  circle(ctx, 472, 72, 26, '#e6ecfb');
  ctx.fillStyle = 'rgba(230, 238, 255, 0.35)';
  for (let i = 0; i < 6; i += 1) ellipse(ctx, 480 + range(rng, -16, 16), 190 + i * 26, 34 - i * 3, 3, 'rgba(230, 238, 255, 0.28)');
  // The pond takes the lower two thirds.
  const water = ctx.createLinearGradient(0, 150, 0, 450);
  water.addColorStop(0, '#123a4d');
  water.addColorStop(1, '#0a2436');
  ctx.fillStyle = water;
  ctx.fillRect(0, 150, w, 300);
  ctx.strokeStyle = 'rgba(160, 210, 235, 0.25)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 12; i += 1) {
    ctx.beginPath();
    ctx.ellipse(range(rng, 20, 580), range(rng, 170, 430), range(rng, 18, 46), 4, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  // Reeds along the banks.
  for (const bx of [0, 560]) {
    for (let i = 0; i < 7; i += 1) {
      const x = bx + range(rng, 4, 46);
      const y = range(rng, 300, 440);
      const tall = range(rng, 40, 90);
      ctx.strokeStyle = '#2e6b34';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + range(rng, -8, 8), y - tall * 0.6, x + range(rng, -12, 12), y - tall);
      ctx.stroke();
      ellipse(ctx, x + range(rng, -10, 10), y - tall - 4, 4, 10, '#7a5a2e');
    }
  }
  // Lotus leaves with a notch, and lotus flowers.
  const leaves = [[90, 260, 46], [200, 330, 56], [330, 250, 42], [430, 320, 52], [520, 240, 40], [150, 400, 48], [380, 400, 50], [260, 200, 38]];
  for (const [x, y, r] of leaves) {
    ctx.fillStyle = '#2e7d46';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.arc(x, y, r, 0.35, Math.PI * 2 - 0.35);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#1f5c31';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + r * 0.7, y - r * 0.7);
    ctx.moveTo(x, y);
    ctx.lineTo(x - r * 0.7, y - r * 0.6);
    ctx.stroke();
  }
  for (const [x, y, s, col] of [[200, 330, 1, '#ff8fb3'], [430, 320, 0.9, '#ffffff'], [330, 250, 0.8, '#ff8fb3'], [150, 400, 0.85, '#ffb3c8']]) {
    petalFlower(ctx, x, y - 8, 15 * s, col, '#ffd93b');
  }
  // Koi gliding under the surface. (A third koi at (300, 300) is a difference,
  // so differences.js draws it, not the base picture.)
  drawKoi(ctx, 130, 380, 0.8, '#f7f7f7', -1);
  drawKoi(ctx, 470, 380, 0.9, '#ff6b6b', -1);
  // A stone lantern on the far bank.
  ctx.fillStyle = '#5a6b7a';
  ctx.fillRect(536, 168, 34, 10);
  ctx.fillRect(544, 178, 18, 26);
  ctx.fillStyle = '#7a8b9a';
  ctx.fillRect(540, 204, 26, 8);
  ctx.fillStyle = '#46565f';
  ctx.fillRect(548, 212, 10, 18);
  // Fireflies.
  for (let i = 0; i < 12; i += 1) {
    const x = range(rng, 20, 580);
    const y = range(rng, 20, 200);
    const g = ctx.createRadialGradient(x, y, 1, x, y, 10);
    g.addColorStop(0, 'rgba(190, 255, 120, 0.95)');
    g.addColorStop(1, 'rgba(190, 255, 120, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - 10, y - 10, 20, 20);
    circle(ctx, x, y, 2.2, '#d8ff9e');
  }
}

function drawKoi(ctx, x, y, scale, color, dir) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(dir * scale, scale);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(0, 0, 26, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-22, 0);
  ctx.lineTo(-36, -9);
  ctx.lineTo(-36, 9);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.beginPath();
  ctx.ellipse(8, -3, 9, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  circle(ctx, 16, -2, 2.4, '#1c2733');
  ctx.restore();
}

/** Scene 3: a firefly forest — dark, dense, the hardest hunt. */
function drawHutan(ctx, w, h) {
  const rng = mulberry32(37);
  skyGradient(ctx, w, h, [[0, '#06180f'], [0.55, '#0d2b1c'], [1, '#123524']]);
  // Moonlight shafts falling between the trees.
  ctx.fillStyle = 'rgba(220, 240, 200, 0.07)';
  for (const [x, top, wide] of [[180, 0, 60], [360, 0, 44], [500, 0, 70]]) {
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.lineTo(x + wide, top);
    ctx.lineTo(x + wide + 40, 450);
    ctx.lineTo(x + 30, 450);
    ctx.closePath();
    ctx.fill();
  }
  // Tall trunks and canopy.
  const trunks = [[60, 46], [180, 60], [330, 52], [470, 66], [560, 44]];
  for (const [x, tw] of trunks) {
    ctx.fillStyle = '#1d3325';
    ctx.fillRect(x - tw / 2, 0, tw, 450);
    ctx.fillStyle = '#16281d';
    ctx.fillRect(x - tw / 2, 0, tw * 0.35, 450);
  }
  circle(ctx, 120, 60, 90, '#1e4a2e');
  circle(ctx, 300, 40, 100, '#224f31');
  circle(ctx, 480, 70, 95, '#1c452b');
  circle(ctx, 210, 110, 70, '#265636');
  circle(ctx, 400, 120, 66, '#265636');
  // Forest floor.
  const floor = ctx.createLinearGradient(0, 330, 0, 450);
  floor.addColorStop(0, '#14301f');
  floor.addColorStop(1, '#0a1f12');
  ctx.fillStyle = floor;
  ctx.fillRect(0, 330, w, 120);
  // Ferns.
  for (let i = 0; i < 14; i += 1) {
    const x = range(rng, 14, 586);
    const y = range(rng, 360, 440);
    drawFern(ctx, x, y, range(rng, 0.7, 1.2), '#2e7d46');
  }
  // Mushroom cluster.
  drawMushroom(ctx, 150, 360, 1.1, '#e74c3c');
  drawMushroom(ctx, 178, 372, 0.8, '#e74c3c');
  drawMushroom(ctx, 128, 376, 0.65, '#e74c3c');
  drawMushroom(ctx, 520, 400, 0.9, '#e74c3c');
  // The stream, bottom right, with stones.
  ctx.fillStyle = '#2a6b8a';
  ctx.beginPath();
  ctx.moveTo(330, 450);
  ctx.quadraticCurveTo(380, 400, 470, 395);
  ctx.quadraticCurveTo(540, 392, 600, 410);
  ctx.lineTo(600, 450);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(200, 235, 255, 0.4)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(360, 430);
  ctx.quadraticCurveTo(430, 412, 520, 420);
  ctx.stroke();
  ellipse(ctx, 420, 428, 16, 8, '#7a8b9a');
  ellipse(ctx, 500, 432, 12, 6, '#8a9aa8');
  // The owl on its branch.
  ctx.strokeStyle = '#2a1f14';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(380, 128);
  ctx.quadraticCurveTo(430, 118, 480, 126);
  ctx.stroke();
  drawOwl(ctx, 430, 96, 1);
  // Fireflies everywhere.
  for (let i = 0; i < 18; i += 1) {
    const x = range(rng, 16, 584);
    const y = range(rng, 30, 330);
    const g = ctx.createRadialGradient(x, y, 1, x, y, 11);
    g.addColorStop(0, 'rgba(200, 255, 130, 0.9)');
    g.addColorStop(1, 'rgba(200, 255, 130, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - 11, y - 11, 22, 22);
    circle(ctx, x, y, 2.4, '#e2ffb0');
  }
}

function drawFern(ctx, x, y, scale, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2 * scale;
  ctx.lineCap = 'round';
  for (let a = -0.7; a <= 0.7; a += 0.35) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + Math.sin(a) * 26 * scale, y - 22 * scale, x + Math.sin(a) * 40 * scale, y - 44 * scale);
    ctx.stroke();
  }
}

function drawMushroom(ctx, x, y, scale, capColor) {
  ctx.fillStyle = '#f5eeda';
  ctx.fillRect(x - 4 * scale, y - 14 * scale, 8 * scale, 14 * scale);
  ctx.fillStyle = capColor;
  ctx.beginPath();
  ctx.arc(x, y - 12 * scale, 16 * scale, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  circle(ctx, x - 6 * scale, y - 20 * scale, 2.4 * scale, '#ffffff');
  circle(ctx, x + 5 * scale, y - 24 * scale, 2 * scale, '#ffffff');
}

function drawOwl(ctx, x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = '#8a6b4a';
  ctx.beginPath();
  ctx.ellipse(0, 0, 20, 26, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#a8875f';
  ctx.beginPath();
  ctx.ellipse(0, -18, 16, 13, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#6b4f33';
  ctx.beginPath();
  ctx.moveTo(-14, -28);
  ctx.lineTo(-8, -38);
  ctx.lineTo(-2, -28);
  ctx.moveTo(14, -28);
  ctx.lineTo(8, -38);
  ctx.lineTo(2, -28);
  ctx.fill();
  ctx.fillStyle = '#f7c948';
  ctx.beginPath();
  ctx.moveTo(0, -14);
  ctx.lineTo(-4, -8);
  ctx.lineTo(4, -8);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export const SCENES = [
  {
    id: 'kebun-senja',
    title: 'Kebun Bunga Senja',
    hint: 'Senja di kebun — tujuh perbedaan tersembunyi di antara bunga.',
    timeLimit: 90,
    drawBase: drawKebun,
  },
  {
    id: 'kolam-teratai',
    title: 'Kolam Teratai Malam',
    hint: 'Malam di kolam teratai — perhatikan bulan, ikan, dan kunang-kunang.',
    timeLimit: 75,
    drawBase: drawTeratai,
  },
  {
    id: 'hutan-kunang',
    title: 'Hutan Kunang-Kunang',
    hint: 'Gelap di hutan — burung hantu dan jamur menyimpan rahasia.',
    timeLimit: 60,
    drawBase: drawHutan,
  },
];
