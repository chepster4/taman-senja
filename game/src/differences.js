// The 21 differences of Taman Senja: seven per scene. Each difference knows
// where it lives in panel space, how big a click it forgives, its name for the
// found-toast, and how to draw itself in each panel — variant 0 is the left
// panel, variant 1 the right one. A difference is fair when a player who looks
// closely can spot it, and hidden when it blends into the scene around it.
import { mulberry32, range } from './random.js';

function circle(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function ellipse(ctx, x, y, rx, ry, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
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

function drawSmallButterfly(ctx, x, y, scale, upper, lower) {
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

function drawSmallBird(ctx, x, y, scale, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.2 * scale;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 11 * scale, y);
  ctx.quadraticCurveTo(x - 4 * scale, y - 8 * scale, x, y);
  ctx.quadraticCurveTo(x + 4 * scale, y - 8 * scale, x + 11 * scale, y);
  ctx.stroke();
}

function drawSparkleStar(ctx, x, y, scale) {
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(x, y - 9 * scale);
  ctx.quadraticCurveTo(x + 2 * scale, y - 2 * scale, x + 9 * scale, y);
  ctx.quadraticCurveTo(x + 2 * scale, y + 2 * scale, x, y + 9 * scale);
  ctx.quadraticCurveTo(x - 2 * scale, y + 2 * scale, x - 9 * scale, y);
  ctx.quadraticCurveTo(x - 2 * scale, y - 2 * scale, x, y - 9 * scale);
  ctx.fill();
}

function drawFirefly(ctx, x, y) {
  const g = ctx.createRadialGradient(x, y, 1, x, y, 10);
  g.addColorStop(0, 'rgba(190, 255, 120, 0.95)');
  g.addColorStop(1, 'rgba(190, 255, 120, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(x - 10, y - 10, 20, 20);
  circle(ctx, x, y, 2.2, '#d8ff9e');
}

function drawKoiAt(ctx, x, y, scale, color, dir) {
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

const KEBUN = [
  {
    x: 470, y: 95, r: 30, name: 'Sinar matahari',
    draw(ctx, v) {
      if (v !== 0) return;
      ctx.strokeStyle = '#ffd678';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      for (let i = 0; i < 8; i += 1) {
        const a = (i / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(470 + Math.cos(a) * 44, 95 + Math.sin(a) * 44);
        ctx.lineTo(470 + Math.cos(a) * 58, 95 + Math.sin(a) * 58);
        ctx.stroke();
      }
    },
  },
  {
    x: 300, y: 120, r: 18, name: 'Kupu-kupu ekstra',
    draw(ctx, v) {
      if (v !== 1) return;
      drawSmallButterfly(ctx, 300, 120, 0.9, '#ff9ff3', '#f368e0');
    },
  },
  {
    x: 180, y: 360, r: 16, name: 'Warna tulip',
    draw(ctx, v) {
      ctx.strokeStyle = '#2c5c33';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(180, 372);
      ctx.lineTo(180, 356);
      ctx.stroke();
      petalFlower(ctx, 180, 352, 8, v === 0 ? '#ff5d8f' : '#ffd93b', '#fff3b0');
    },
  },
  {
    x: 504, y: 222, r: 22, name: 'Lentera menyala',
    draw(ctx, v) {
      if (v === 0) {
        const g = ctx.createRadialGradient(504, 222, 2, 504, 222, 34);
        g.addColorStop(0, 'rgba(255, 200, 90, 0.85)');
        g.addColorStop(1, 'rgba(255, 200, 90, 0)');
        ctx.fillStyle = g;
        ctx.fillRect(470, 188, 68, 68);
        ctx.fillStyle = '#ffd678';
        ctx.beginPath();
        ctx.ellipse(504, 222, 10, 13, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff3b0';
        ctx.beginPath();
        ctx.ellipse(504, 222, 5, 8, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = '#5a5a6e';
        ctx.beginPath();
        ctx.ellipse(504, 222, 10, 13, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#3d3d4d';
        ctx.beginPath();
        ctx.ellipse(504, 222, 5, 8, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#2c2115';
      ctx.fillRect(498, 207, 12, 4);
    },
  },
  {
    x: 250, y: 55, r: 16, name: 'Burung di langit',
    draw(ctx, v) {
      if (v !== 0) return;
      drawSmallBird(ctx, 250, 55, 1, '#3a2a4d');
    },
  },
  {
    x: 250, y: 306, r: 18, name: 'Papan pagar hilang',
    draw(ctx, v) {
      if (v !== 0) return;
      ctx.fillStyle = '#7d5a38';
      ctx.fillRect(244, 282, 12, 52);
      ctx.fillStyle = '#8f6b45';
      ctx.fillRect(244, 282, 12, 5);
    },
  },
  {
    x: 420, y: 400, r: 14, name: 'Batu di rumput',
    draw(ctx, v) {
      if (v !== 0) return;
      ellipse(ctx, 420, 400, 13, 7, '#9aa0a8');
      ellipse(ctx, 416, 397, 6, 3, '#b8bec6');
    },
  },
];

const TERATAI = [
  {
    x: 480, y: 80, r: 14, name: 'Kawah di bulan',
    draw(ctx, v) {
      if (v !== 0) return;
      circle(ctx, 490, 72, 5, '#c9d4ea');
      circle(ctx, 468, 88, 3.5, '#c9d4ea');
    },
  },
  {
    x: 300, y: 300, r: 24, name: 'Arah ikan koi',
    draw(ctx, v) {
      drawKoiAt(ctx, 300, 300, 1, '#ff8c42', v === 0 ? -1 : 1);
    },
  },
  {
    x: 430, y: 312, r: 18, name: 'Warna teratai',
    draw(ctx, v) {
      petalFlower(ctx, 430, 312, 15, v === 0 ? '#ff8fb3' : '#ffffff', '#ffd93b');
    },
  },
  {
    x: 140, y: 55, r: 12, name: 'Bintang yang hilang',
    draw(ctx, v) {
      if (v !== 0) return;
      drawSparkleStar(ctx, 140, 55, 1);
    },
  },
  {
    x: 520, y: 110, r: 12, name: 'Kunang-kunang ekstra',
    draw(ctx, v) {
      if (v !== 1) return;
      drawFirefly(ctx, 520, 110);
    },
  },
  {
    x: 70, y: 330, r: 16, name: 'Batang ilalang',
    draw(ctx, v) {
      if (v !== 0) return;
      ctx.strokeStyle = '#2e6b34';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(70, 372);
      ctx.quadraticCurveTo(64, 340, 74, 306);
      ctx.stroke();
      ellipse(ctx, 74, 300, 4, 10, '#7a5a2e');
    },
  },
  {
    x: 210, y: 350, r: 20, name: 'Riak di air',
    draw(ctx, v) {
      ctx.strokeStyle = 'rgba(160, 210, 235, 0.4)';
      ctx.lineWidth = 1.5;
      const rings = v === 0 ? 3 : 2;
      for (let i = 0; i < rings; i += 1) {
        ctx.beginPath();
        ctx.ellipse(210, 350, 12 + i * 10, 4 + i * 3, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    },
  },
];

const HUTAN = [
  {
    x: 430, y: 78, r: 20, name: 'Mata burung hantu',
    draw(ctx, v) {
      if (v === 0) {
        circle(ctx, 423, 76, 5.5, '#ffffff');
        circle(ctx, 437, 76, 5.5, '#ffffff');
        circle(ctx, 423, 76, 2.6, '#1c2733');
        circle(ctx, 437, 76, 2.6, '#1c2733');
      } else {
        ctx.strokeStyle = '#2d1b3d';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(423, 78, 5, Math.PI * 1.15, Math.PI * 1.85);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(437, 78, 5, Math.PI * 1.15, Math.PI * 1.85);
        ctx.stroke();
      }
    },
  },
  {
    x: 150, y: 348, r: 18, name: 'Warna topi jamur',
    draw(ctx, v) {
      const cap = v === 0 ? '#e74c3c' : '#4a90d9';
      ctx.fillStyle = cap;
      ctx.beginPath();
      ctx.arc(150, 347, 18.5, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      circle(ctx, 143, 338, 2.6, '#ffffff');
      circle(ctx, 156, 334, 2.2, '#ffffff');
    },
  },
  {
    x: 300, y: 160, r: 18, name: 'Kunang-kunang berkelompok',
    draw(ctx, v) {
      drawFirefly(ctx, 288, 152);
      drawFirefly(ctx, 312, 168);
      if (v === 0) drawFirefly(ctx, 302, 144);
    },
  },
  {
    x: 500, y: 330, r: 18, name: 'Daun pakis ekstra',
    draw(ctx, v) {
      if (v !== 1) return;
      ctx.strokeStyle = '#2e7d46';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(500, 372);
      ctx.quadraticCurveTo(492, 350, 500, 330);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(500, 352);
      ctx.lineTo(486, 344);
      ctx.moveTo(500, 352);
      ctx.lineTo(514, 342);
      ctx.stroke();
    },
  },
  {
    x: 230, y: 400, r: 14, name: 'Batu di tepi kali',
    draw(ctx, v) {
      if (v !== 0) return;
      ellipse(ctx, 230, 400, 14, 7, '#7a8b9a');
      ellipse(ctx, 226, 397, 6, 3, '#9aaab8');
    },
  },
  {
    x: 360, y: 40, r: 16, name: 'Akar gantung',
    draw(ctx, v) {
      if (v !== 0) return;
      ctx.strokeStyle = '#3d6b34';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(360, 0);
      ctx.quadraticCurveTo(354, 30, 360, 62);
      ctx.stroke();
      ellipse(ctx, 352, 34, 7, 4, '#2e7d46');
      ellipse(ctx, 368, 48, 7, 4, '#357a3c');
    },
  },
  {
    x: 95, y: 190, r: 14, name: 'Ngengat malam',
    draw(ctx, v) {
      if (v !== 0) return;
      ctx.fillStyle = '#c9b8a3';
      ctx.beginPath();
      ctx.ellipse(89, 186, 7, 10, -0.4, 0, Math.PI * 2);
      ctx.ellipse(101, 186, 7, 10, 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#8a7a68';
      ctx.beginPath();
      ctx.ellipse(95, 192, 3, 7, 0, 0, Math.PI * 2);
      ctx.fill();
    },
  },
];

/** The differences of one scene, by scene id, in a fixed order. */
export const DIFFERENCES = {
  'kebun-senja': KEBUN,
  'kolam-teratai': TERATAI,
  'hutan-kunang': HUTAN,
};

/** A seeded list of panel decorations that never change between panels. */
export function scatterSeed(sceneIndex) {
  return mulberry32(1000 + sceneIndex * 77);
}

export { range };
