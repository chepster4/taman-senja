// Everything the player sees: the header with its counter and clock, the two
// panels with their found-markers, the magnifier lens, the footer buttons and
// the title / clear / time-up / victory overlays. It only reads state.
import {
  CANVAS_W, CANVAS_H, PANEL_W, PANEL_H, PANEL_Y, PANEL_LEFT_X, PANEL_RIGHT_X,
  HEADER_H, FOOTER_Y, FOOTER_H, MAGNIFIER_RADIUS, MAGNIFIER_ZOOM,
  HINT_COOLDOWN_MS,
} from './config.js';
import { SCENES } from './scenes.js';
import { DIFFERENCES } from './differences.js';
import { formatTime, remainingCount } from './state.js';

export const BUTTON_RECTS = {
  hint: { x: 40, y: 560, w: 150, h: 48 },
  magnifier: { x: 206, y: 560, w: 200, h: 48 },
  sound: { x: 422, y: 560, w: 128, h: 48 },
};

const PANEL_X = [PANEL_LEFT_X, PANEL_RIGHT_X];

/** Paint both panels of a scene once, from the same base and its differences. */
export function buildPanels(scene) {
  const diffs = DIFFERENCES[scene.id];
  const out = [];
  for (let variant = 0; variant < 2; variant += 1) {
    const canvas = document.createElement('canvas');
    canvas.width = PANEL_W;
    canvas.height = PANEL_H;
    const ctx = canvas.getContext('2d');
    scene.drawBase(ctx, PANEL_W, PANEL_H);
    for (const d of diffs) d.draw(ctx, variant);
    out.push(canvas);
  }
  return { left: out[0], right: out[1] };
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function panelAt(game, panelIndex, x, y) {
  return {
    x: PANEL_X[panelIndex] + x,
    y: PANEL_Y + y,
  };
}

function drawFoundRing(ctx, game, panels, now) {
  const diffs = DIFFERENCES[SCENES[game.sceneIndex].id];
  for (const index of game.found) {
    const d = diffs[index];
    for (let p = 0; p < 2; p += 1) {
      const at = panelAt(game, p, d.x, d.y);
      const pulse = 1 + 0.06 * Math.sin(now / 240 + index);
      ctx.strokeStyle = '#ffd93b';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(at.x, at.y, (d.r + 7) * pulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255, 243, 176, 0.85)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(at.x, at.y, (d.r + 12) * pulse, 0, Math.PI * 2);
      ctx.stroke();
      // A small check in the ring's corner.
      ctx.strokeStyle = '#ffd93b';
      ctx.lineWidth = 3.4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(at.x + d.r - 2, at.y - d.r - 2);
      ctx.lineTo(at.x + d.r + 4, at.y - d.r + 4);
      ctx.lineTo(at.x + d.r + 12, at.y - d.r - 6);
      ctx.stroke();
    }
  }
}

function drawHintRing(ctx, game, now) {
  if (!game.hintReveal || now > game.hintReveal.until) return;
  const d = DIFFERENCES[SCENES[game.sceneIndex].id][game.hintReveal.index];
  const breathe = 1 + 0.18 * Math.sin(now / 130);
  for (let p = 0; p < 2; p += 1) {
    const at = panelAt(game, p, d.x, d.y);
    ctx.strokeStyle = '#48dbfb';
    ctx.lineWidth = 3.5;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.arc(at.x, at.y, (d.r + 10) * breathe, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

function drawParticles(ctx, game) {
  for (const p of game.particles) {
    const at = panelAt(game, p.panelX, p.x, p.y);
    ctx.globalAlpha = Math.max(0, 1 - p.age / p.life);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(at.x, at.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawMagnifier(ctx, game, panels) {
  if (!game.magnifier || !game.mouse.inside) return;
  const { x, y } = game.mouse;
  let panel = -1;
  for (let p = 0; p < 2; p += 1) {
    if (x >= PANEL_X[p] && x < PANEL_X[p] + PANEL_W && y >= PANEL_Y && y < PANEL_Y + PANEL_H) panel = p;
  }
  if (panel < 0) return;
  const src = panel === 0 ? panels.left : panels.right;
  const px = x - PANEL_X[panel];
  const py = y - PANEL_Y;
  const r = MAGNIFIER_RADIUS;
  const z = MAGNIFIER_ZOOM;
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(src, px - r / z, py - r / z, (2 * r) / z, (2 * r) / z, x - r, y - r, 2 * r, 2 * r);
  ctx.restore();
  ctx.strokeStyle = '#ffd93b';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255, 217, 59, 0.7)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x - 10, y);
  ctx.lineTo(x + 10, y);
  ctx.moveTo(x, y - 10);
  ctx.lineTo(x, y + 10);
  ctx.stroke();
}

function drawKeyboardCursor(ctx, game) {
  if (!game.cursorVisible || game.screen !== 'play') return;
  const at = panelAt(game, game.cursor.panel, game.cursor.x, game.cursor.y);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.arc(at.x, at.y, 16, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(at.x - 22, at.y);
  ctx.lineTo(at.x - 10, at.y);
  ctx.moveTo(at.x + 10, at.y);
  ctx.lineTo(at.x + 22, at.y);
  ctx.moveTo(at.x, at.y - 22);
  ctx.lineTo(at.x, at.y - 10);
  ctx.moveTo(at.x, at.y + 10);
  ctx.lineTo(at.x, at.y + 22);
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(at.x, at.y, 3, 0, Math.PI * 2);
  ctx.fill();
}

function drawHeader(ctx, game, now) {
  ctx.fillStyle = '#1d1533';
  ctx.fillRect(0, 0, CANVAS_W, HEADER_H);
  ctx.fillStyle = '#ffd93b';
  ctx.fillRect(0, HEADER_H - 3, CANVAS_W, 3);
  ctx.fillStyle = '#ffe9a8';
  ctx.font = '700 30px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('TAMAN SENJA', 40, 30);
  ctx.fillStyle = '#b8a8d8';
  ctx.font = '15px Georgia, serif';
  ctx.fillText('Cari Perbedaannya', 40, 56);
  // Scene name and progress dots, centred.
  const scene = SCENES[game.sceneIndex];
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 19px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(scene.title, 640, 26);
  for (let i = 0; i < SCENES.length; i += 1) {
    ctx.fillStyle = i < game.sceneIndex ? '#ffd93b' : i === game.sceneIndex ? '#ffffff' : '#5a4a7a';
    ctx.beginPath();
    ctx.arc(604 + i * 36, 54, i === game.sceneIndex ? 7 : 5.5, 0, Math.PI * 2);
    ctx.fill();
  }
  // Remaining counter, clock and score, right aligned.
  const remain = remainingCount(game);
  ctx.textAlign = 'right';
  ctx.fillStyle = '#ffd93b';
  ctx.font = '700 26px Georgia, serif';
  ctx.fillText(`SISA ${remain}`, 1000, 30);
  const low = game.timeLeft <= 10 && game.screen === 'play';
  ctx.fillStyle = low && Math.floor(now / 300) % 2 === 0 ? '#ff6b6b' : '#ffffff';
  ctx.font = '700 26px Georgia, serif';
  ctx.fillText(formatTime(game.timeLeft), 1120, 30);
  ctx.fillStyle = '#b8a8d8';
  ctx.font = '15px Georgia, serif';
  ctx.fillText(`SKOR ${game.score}`, 1120, 56);
  // Found dots under the counter.
  const diffs = DIFFERENCES[scene.id];
  for (let i = 0; i < diffs.length; i += 1) {
    ctx.fillStyle = game.found.has(i) ? '#ffd93b' : '#4a3a6e';
    ctx.beginPath();
    ctx.arc(920 + i * 16, 56, 5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPanels(ctx, game, panels, now) {
  const shake = now < game.shakeUntil ? 4 : 0;
  const dx = shake ? (Math.random() - 0.5) * shake : 0;
  const dy = shake ? (Math.random() - 0.5) * shake : 0;
  for (let p = 0; p < 2; p += 1) {
    const img = p === 0 ? panels.left : panels.right;
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 6;
    ctx.drawImage(img, PANEL_X[p] + dx, PANEL_Y + dy, PANEL_W, PANEL_H);
    ctx.restore();
    ctx.strokeStyle = '#3a2a5e';
    ctx.lineWidth = 3;
    ctx.strokeRect(PANEL_X[p] + dx, PANEL_Y + dy, PANEL_W, PANEL_H);
    // Panel chip.
    ctx.fillStyle = 'rgba(20, 12, 40, 0.75)';
    roundRect(ctx, PANEL_X[p] + 12, PANEL_Y + 12, 64, 26, 13);
    ctx.fill();
    ctx.fillStyle = '#ffe9a8';
    ctx.font = '700 14px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(p === 0 ? 'KIRI' : 'KANAN', PANEL_X[p] + 44, PANEL_Y + 26);
  }
  drawFoundRing(ctx, game, panels, now);
  drawHintRing(ctx, game, now);
  drawParticles(ctx, game);
  drawKeyboardCursor(ctx, game);
  drawMagnifier(ctx, game, panels);
}

function drawFooter(ctx, game, now) {
  ctx.fillStyle = '#1d1533';
  ctx.fillRect(0, FOOTER_Y, CANVAS_W, FOOTER_H);
  ctx.fillStyle = '#ffd93b';
  ctx.fillRect(0, FOOTER_Y, CANVAS_W, 2);
  const cooling = game.hintCooldownUntil > now;
  const hintReady = !cooling && game.screen === 'play';
  const hintWait = Math.max(0, Math.ceil((game.hintCooldownUntil - now) / 1000));
  drawButton(ctx, BUTTON_RECTS.hint, hintReady ? '#ffd93b' : '#4a3a6e', hintReady ? '#2d1b3d' : '#8a7ab0',
    hintReady ? 'Petunjuk (H) −50' : cooling ? `Petunjuk ${hintWait} dtk` : 'Petunjuk (H)');
  drawButton(ctx, BUTTON_RECTS.magnifier, game.magnifier ? '#ffd93b' : '#2e2148', game.magnifier ? '#2d1b3d' : '#e8ddff',
    game.magnifier ? 'Kaca Pembesar: NYALA' : 'Kaca Pembesar (M)');
  drawButton(ctx, BUTTON_RECTS.sound, '#2e2148', '#e8ddff', game.muted ? 'Suara: MATI (S)' : 'Suara: NYALA (S)');
  ctx.fillStyle = '#b8a8d8';
  ctx.font = '14px Georgia, serif';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.fillText('Klik perbedaan di gambar • Panah + Spasi juga bisa • R ulangi taman', 1240, 584);
  ctx.fillStyle = '#7a6a9e';
  ctx.font = '12px Georgia, serif';
  ctx.fillText('Semua gambar digambar prosedural — tanpa aset dari internet.', 1240, 606);
}

function drawButton(ctx, rect, bg, fg, label) {
  ctx.fillStyle = bg;
  roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 10);
  ctx.fill();
  ctx.fillStyle = fg;
  ctx.font = '700 15px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, rect.x + rect.w / 2, rect.y + rect.h / 2 + 1);
}

function drawToast(ctx, game, now) {
  if (!game.toast || now > game.toast.until) return;
  const fade = Math.min(1, (game.toast.until - now) / 400);
  ctx.globalAlpha = fade;
  ctx.font = '700 18px Georgia, serif';
  const w = ctx.measureText(game.toast.text).width + 36;
  ctx.fillStyle = 'rgba(20, 12, 40, 0.88)';
  roundRect(ctx, 640 - w / 2, FOOTER_Y - 46, w, 34, 17);
  ctx.fill();
  ctx.fillStyle = '#ffe9a8';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(game.toast.text, 640, FOOTER_Y - 28);
  ctx.globalAlpha = 1;
}

function dim(ctx) {
  ctx.fillStyle = 'rgba(12, 7, 26, 0.72)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
}

function card(ctx, x, y, w, h) {
  ctx.fillStyle = '#241a3e';
  ctx.strokeStyle = '#ffd93b';
  ctx.lineWidth = 2;
  roundRect(ctx, x, y, w, h, 18);
  ctx.fill();
  ctx.stroke();
}

function drawTitle(ctx, game) {
  dim(ctx);
  card(ctx, 290, 126, 700, 454);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd93b';
  ctx.font = '700 54px Georgia, serif';
  ctx.fillText('TAMAN SENJA', 640, 190);
  ctx.fillStyle = '#ffffff';
  ctx.font = '26px Georgia, serif';
  ctx.fillText('Cari Perbedaannya', 640, 232);
  ctx.fillStyle = '#d8ccf0';
  ctx.font = '17px Georgia, serif';
  ctx.fillText('Dua gambar di setiap taman tampak sama — tapi tujuh', 640, 292);
  ctx.fillText('perbedaan tersembunyi di antaranya. Temukan semuanya', 640, 318);
  ctx.fillText('sebelum waktu habis.', 640, 344);
  ctx.fillStyle = '#ffe9a8';
  ctx.font = '16px Georgia, serif';
  ctx.fillText('1  Kebun Bunga Senja      2  Kolam Teratai Malam      3  Hutan Kunang-Kunang', 640, 396);
  ctx.fillStyle = '#b8a8d8';
  ctx.font = '15px Georgia, serif';
  ctx.fillText('Klik dengan mouse, atau gerakkan kursor dengan panah lalu tekan Spasi.', 640, 440);
  ctx.fillText('H untuk petunjuk, M untuk kaca pembesar, S untuk suara.', 640, 464);
  ctx.fillStyle = '#ffd93b';
  ctx.font = '700 20px Georgia, serif';
  ctx.fillText('Klik atau tekan Enter untuk mulai', 640, 528);
}

function drawSceneClear(ctx, game) {
  dim(ctx);
  card(ctx, 390, 200, 500, 280);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd93b';
  ctx.font = '700 38px Georgia, serif';
  ctx.fillText('Taman Selesai!', 640, 268);
  ctx.fillStyle = '#ffffff';
  ctx.font = '20px Georgia, serif';
  ctx.fillText(`${SCENES[game.sceneIndex].title} — 7 dari 7 ditemukan`, 640, 316);
  ctx.fillStyle = '#d8ccf0';
  ctx.font = '17px Georgia, serif';
  ctx.fillText(`Bonus waktu: +${game.clearBonus}`, 640, 352);
  ctx.fillText(`Skor: ${game.score}`, 640, 380);
  ctx.fillStyle = '#ffd93b';
  ctx.font = '700 18px Georgia, serif';
  ctx.fillText(game.sceneIndex + 1 >= SCENES.length ? 'Enter / klik untuk melihat hasil' : 'Enter / klik untuk taman berikutnya', 640, 436);
}

function drawTimeUp(ctx, game) {
  dim(ctx);
  card(ctx, 390, 220, 500, 240);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ff8f8f';
  ctx.font = '700 38px Georgia, serif';
  ctx.fillText('Waktu Habis!', 640, 288);
  ctx.fillStyle = '#ffffff';
  ctx.font = '20px Georgia, serif';
  ctx.fillText(`Kamu menemukan ${game.found.size} dari 7 perbedaan.`, 640, 336);
  ctx.fillStyle = '#ffd93b';
  ctx.font = '700 18px Georgia, serif';
  ctx.fillText('Tekan R atau klik untuk mencoba lagi', 640, 408);
}

function drawVictory(ctx, game) {
  dim(ctx);
  card(ctx, 340, 130, 600, 440);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd93b';
  ctx.font = '700 40px Georgia, serif';
  ctx.fillText('Semua Taman Selesai!', 640, 208);
  ctx.font = '44px Georgia, serif';
  const stars = '★'.repeat(game.stars) + '☆'.repeat(3 - game.stars);
  ctx.fillText(stars, 640, 268);
  ctx.fillStyle = '#ffffff';
  ctx.font = '22px Georgia, serif';
  ctx.fillText(`21 perbedaan ditemukan di tiga taman`, 640, 322);
  ctx.fillStyle = '#d8ccf0';
  ctx.font = '18px Georgia, serif';
  ctx.fillText(`Skor akhir: ${game.score}`, 640, 356);
  ctx.fillText(`Kombo terbaik: ${game.bestCombo} beruntun`, 640, 384);
  ctx.fillStyle = '#ffd93b';
  ctx.font = '700 18px Georgia, serif';
  ctx.fillText('Tekan R atau klik untuk main lagi', 640, 452);
  ctx.fillStyle = '#b8a8d8';
  ctx.font = '14px Georgia, serif';
  ctx.fillText('Terima kasih sudah bermain di Taman Senja.', 640, 520);
}

/** Draw one frame of the game. `now` is milliseconds, frozen in shot mode. */
export function drawGame(ctx, game, panels, now) {
  ctx.fillStyle = '#171226';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  drawHeader(ctx, game, now);
  drawPanels(ctx, game, panels, now);
  drawFooter(ctx, game, now);
  drawToast(ctx, game, now);
  if (game.screen === 'title') drawTitle(ctx, game);
  else if (game.screen === 'sceneClear') drawSceneClear(ctx, game);
  else if (game.screen === 'timeUp') drawTimeUp(ctx, game);
  else if (game.screen === 'victory') drawVictory(ctx, game);
  const status = document.getElementById('status');
  if (status) {
    status.textContent = game.screen === 'play'
      ? `${SCENES[game.sceneIndex].title}: ${remainingCount(game)} perbedaan tersisa, waktu ${formatTime(game.timeLeft)}, skor ${game.score}`
      : `Taman Senja, layar ${game.screen}`;
  }
}
