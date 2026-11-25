// Warung Kilat — drawing: every pixel of the kitchen is drawn in code.
// No image files, no fonts from the network, just canvas shapes and text.

import { CANVAS_W, CANVAS_H, INGREDIENTS, ingredientById, SHIFT_SECONDS } from './config.js';

const FACE_SKINS = ['#f2c89b', '#e8b07d', '#c98d5f', '#8d5a3b', '#f7d7b0'];
const FACE_SHIRTS = ['#3e7d44', '#d94f3d', '#2f6fb2', '#e8a13d', '#7a4a8f'];

// Geometry shared by drawing and by input hit-testing.
export function layout() {
  const bins = INGREDIENTS.map((g, i) => ({
    id: g.id,
    x: 16 + i * 156,
    y: 212,
    w: 144,
    h: 108,
  }));
  return {
    topBar: { x: 0, y: 0, w: CANVAS_W, h: 56 },
    tickets: [0, 1, 2].map((i) => ({ x: 16 + i * 312, y: 68, w: 296, h: 96 })),
    bins,
    plates: [0, 1].map((i) => ({ x: 16 + i * 472, y: 348, w: 456, h: 128 })),
    serveBtn: [0, 1].map((i) => ({ x: 16 + i * 472 + 330, y: 348 + 78, w: 112, h: 38 })),
    trashBtn: [0, 1].map((i) => ({ x: 16 + i * 472 + 330, y: 348 + 34, w: 112, h: 34 })),
    startBtn: { x: CANVAS_W / 2 - 130, y: 420, w: 260, h: 56 },
    restartBtn: { x: CANVAS_W / 2 - 130, y: 412, w: 260, h: 56 },
    muteBtn: { x: CANVAS_W - 52, y: 8, w: 40, h: 40 },
    messageBar: { x: 0, y: 500, w: CANVAS_W, h: 40 },
  };
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

function text(ctx, s, x, y, size, color, weight = 'bold', align = 'left') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px system-ui, "DejaVu Sans", sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(s, x, y);
}

export function drawIngredientIcon(ctx, id, cx, cy, r) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.lineWidth = 2;
  if (id === 'nasi') {
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(0, 2, r * 0.9, 0, Math.PI);
    ctx.fill();
    ctx.fillStyle = '#f7ecd0';
    ctx.beginPath();
    ctx.arc(-r * 0.3, -r * 0.2, r * 0.45, 0, Math.PI * 2);
    ctx.arc(r * 0.25, -r * 0.3, r * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#cbb98a';
    ctx.beginPath();
    ctx.arc(0, 2, r * 0.9, 0, Math.PI);
    ctx.stroke();
  } else if (id === 'mie') {
    ctx.strokeStyle = '#f2c14e';
    ctx.lineWidth = r * 0.22;
    ctx.lineCap = 'round';
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(-r * 0.7, i * r * 0.35);
      ctx.bezierCurveTo(-r * 0.3, i * r * 0.35 - r * 0.4, r * 0.3, i * r * 0.35 + r * 0.4, r * 0.7, i * r * 0.35);
      ctx.stroke();
    }
    ctx.strokeStyle = '#b98a1d';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, r * 0.55, r * 0.8, 0, Math.PI);
    ctx.stroke();
  } else if (id === 'telur') {
    ctx.fillStyle = '#fdf6e3';
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.95, r * 0.75, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f2a93b';
    ctx.beginPath();
    ctx.arc(r * 0.1, -r * 0.05, r * 0.42, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#d8c690';
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.95, r * 0.75, 0.3, 0, Math.PI * 2);
    ctx.stroke();
  } else if (id === 'ayam') {
    ctx.fillStyle = '#e08a5a';
    ctx.beginPath();
    ctx.arc(-r * 0.15, -r * 0.1, r * 0.62, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#f7ecd0';
    ctx.lineWidth = r * 0.22;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(r * 0.3, r * 0.3);
    ctx.lineTo(r * 0.75, r * 0.75);
    ctx.stroke();
    ctx.fillStyle = '#f7ecd0';
    ctx.beginPath();
    ctx.arc(r * 0.82, r * 0.82, r * 0.2, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'sayur') {
    ctx.fillStyle = '#7bc47f';
    for (const [dx, dy, rot] of [[-0.35, 0.1, -0.5], [0.3, 0.05, 0.5], [0, -0.35, 0]]) {
      ctx.save();
      ctx.translate(dx * r, dy * r);
      ctx.rotate(rot);
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 0.32, r * 0.62, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.strokeStyle = '#3e7d44';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, r * 0.3);
    ctx.lineTo(0, r * 0.8);
    ctx.stroke();
  } else if (id === 'sambal') {
    ctx.fillStyle = '#d94f3d';
    ctx.beginPath();
    ctx.moveTo(-r * 0.7, -r * 0.2);
    ctx.quadraticCurveTo(0, -r * 0.9, r * 0.7, -r * 0.35);
    ctx.quadraticCurveTo(r * 0.45, r * 0.45, -r * 0.1, r * 0.55);
    ctx.quadraticCurveTo(-r * 0.7, r * 0.4, -r * 0.7, -r * 0.2);
    ctx.fill();
    ctx.strokeStyle = '#3e7d44';
    ctx.lineWidth = r * 0.18;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(r * 0.55, -r * 0.35);
    ctx.quadraticCurveTo(r * 0.85, -r * 0.6, r * 0.7, -r * 0.85);
    ctx.stroke();
  }
  ctx.restore();
}

function drawFace(ctx, face, cx, cy, r) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = FACE_SKINS[face % FACE_SKINS.length];
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#26221f';
  ctx.beginPath();
  ctx.arc(-r * 0.35, -r * 0.1, r * 0.11, 0, Math.PI * 2);
  ctx.arc(r * 0.35, -r * 0.1, r * 0.11, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#26221f';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, r * 0.15, r * 0.4, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
  ctx.fillStyle = FACE_SHIRTS[face % FACE_SHIRTS.length];
  ctx.beginPath();
  ctx.moveTo(-r * 0.9, r * 1.5);
  ctx.quadraticCurveTo(0, r * 0.75, r * 0.9, r * 1.5);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawKitchen(ctx) {
  // Warm wall, window with evening sky, hanging lamp, tiled floor.
  ctx.fillStyle = '#f3dfae';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.fillStyle = '#e8c98f';
  ctx.fillRect(0, 470, CANVAS_W, 130);
  ctx.strokeStyle = '#c9a86a';
  ctx.lineWidth = 2;
  for (let x = 0; x < CANVAS_W; x += 60) {
    ctx.beginPath();
    ctx.moveTo(x, 470);
    ctx.lineTo(x - 30, 600);
    ctx.stroke();
  }
  ctx.fillStyle = '#bfe0ea';
  roundRect(ctx, 700, 18, 220, 120, 10);
  ctx.fill();
  ctx.fillStyle = '#f2a93b';
  ctx.beginPath();
  ctx.arc(880, 110, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#8d5a3b';
  ctx.fillRect(700, 128, 220, 10);
  ctx.fillStyle = '#3a3230';
  ctx.fillRect(120, 0, 6, 46);
  ctx.fillStyle = '#f6d47c';
  ctx.beginPath();
  ctx.moveTo(96, 46);
  ctx.lineTo(150, 46);
  ctx.lineTo(138, 78);
  ctx.lineTo(108, 78);
  ctx.closePath();
  ctx.fill();
}

function drawTopBar(ctx, game) {
  const L = layout();
  ctx.fillStyle = '#2f2118';
  ctx.fillRect(0, 0, CANVAS_W, 56);
  text(ctx, 'WARUNG KILAT', 16, 29, 24, '#f6d47c');
  text(ctx, 'Skor ' + game.score, 330, 22, 20, '#ffffff');
  if (game.combo > 1) text(ctx, `Combo x${game.combo}`, 330, 44, 14, '#7bc47f');
  const mm = Math.floor(game.timeLeft / 60);
  const ss = String(Math.floor(game.timeLeft % 60)).padStart(2, '0');
  text(ctx, `${mm}:${ss}`, 560, 22, 22, game.timeLeft <= 15 ? '#ff8a7a' : '#ffffff', 'bold', 'center');
  ctx.fillStyle = '#4a3a2c';
  roundRect(ctx, 500, 38, 120, 10, 5);
  ctx.fill();
  ctx.fillStyle = game.timeLeft <= 15 ? '#d94f3d' : '#7bc47f';
  roundRect(ctx, 500, 38, 120 * (game.timeLeft / SHIFT_SECONDS), 10, 5);
  ctx.fill();
  for (let i = 0; i < 3; i++) {
    const cx = 660 + i * 30;
    ctx.fillStyle = i < game.hearts ? '#ff5a6e' : '#5a4636';
    ctx.beginPath();
    ctx.moveTo(cx, 34);
    ctx.bezierCurveTo(cx - 12, 20, cx - 22, 30, cx, 44);
    ctx.bezierCurveTo(cx + 22, 30, cx + 12, 20, cx, 34);
    ctx.fill();
  }
  const mute = L.muteBtn;
  ctx.fillStyle = '#4a3a2c';
  roundRect(ctx, mute.x, mute.y, mute.w, mute.h, 8);
  ctx.fill();
  // A drawn speaker (emoji fonts differ per machine, shapes do not).
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.moveTo(mute.x + 10, mute.y + 16);
  ctx.lineTo(mute.x + 16, mute.y + 16);
  ctx.lineTo(mute.x + 22, mute.y + 10);
  ctx.lineTo(mute.x + 22, mute.y + 30);
  ctx.lineTo(mute.x + 16, mute.y + 24);
  ctx.lineTo(mute.x + 10, mute.y + 24);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  if (game.muted) {
    ctx.beginPath();
    ctx.moveTo(mute.x + 26, mute.y + 14);
    ctx.lineTo(mute.x + 34, mute.y + 26);
    ctx.moveTo(mute.x + 34, mute.y + 14);
    ctx.lineTo(mute.x + 26, mute.y + 26);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.arc(mute.x + 26, mute.y + 20, 4, -0.9, 0.9);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(mute.x + 26, mute.y + 20, 8, -0.9, 0.9);
    ctx.stroke();
  }
}

function drawOrders(ctx, game) {
  const L = layout();
  text(ctx, 'PESANAN', 16, 62, 13, '#7a5a34', 'bold');
  if (game.orders.length === 0 && game.screen === 'playing') {
    text(ctx, 'Belum ada pesanan — pelanggan segera datang…', 120, 116, 16, '#8a6d4b', 'normal');
  }
  game.orders.forEach((order, i) => {
    const t = L.tickets[i];
    if (!t) return;
    ctx.fillStyle = '#fffdf5';
    roundRect(ctx, t.x, t.y, t.w, t.h, 10);
    ctx.fill();
    ctx.strokeStyle = '#d8c690';
    ctx.lineWidth = 2;
    roundRect(ctx, t.x, t.y, t.w, t.h, 10);
    ctx.stroke();
    drawFace(ctx, order.face, t.x + 34, t.y + 34, 22);
    text(ctx, order.recipe.name, t.x + 64, t.y + 22, 17, '#2f2118');
    text(ctx, `Rp ${order.recipe.price}`, t.x + 64, t.y + 44, 13, '#8a6d4b', 'normal');
    order.recipe.needs.forEach((id, j) => {
      drawIngredientIcon(ctx, id, t.x + 82 + j * 34, t.y + 72, 13);
    });
    const frac = Math.max(0, order.patienceLeft / order.patience);
    ctx.fillStyle = '#e8dcc0';
    roundRect(ctx, t.x + 190, t.y + 64, 92, 12, 6);
    ctx.fill();
    ctx.fillStyle = frac > 0.5 ? '#7bc47f' : frac > 0.25 ? '#f2a93b' : '#d94f3d';
    roundRect(ctx, t.x + 190, t.y + 64, 92 * frac, 12, 6);
    ctx.fill();
    text(ctx, `${Math.ceil(order.patienceLeft)} dtk`, t.x + 236, t.y + 44, 12, '#8a6d4b', 'normal', 'center');
  });
}

function drawBins(ctx, game) {
  const L = layout();
  text(ctx, 'BAHAN DI COUNTER  —  klik atau tekan 1–6', 16, 196, 13, '#7a5a34', 'bold');
  L.bins.forEach((bin) => {
    const g = ingredientById(bin.id);
    ctx.fillStyle = '#fffdf5';
    roundRect(ctx, bin.x, bin.y, bin.w, bin.h, 10);
    ctx.fill();
    ctx.strokeStyle = '#d8c690';
    ctx.lineWidth = 2;
    roundRect(ctx, bin.x, bin.y, bin.w, bin.h, 10);
    ctx.stroke();
    drawIngredientIcon(ctx, g.id, bin.x + bin.w / 2, bin.y + 42, 26);
    text(ctx, g.name, bin.x + bin.w / 2, bin.y + 84, 15, '#2f2118', 'bold', 'center');
    ctx.fillStyle = '#2f2118';
    ctx.beginPath();
    ctx.arc(bin.x + 18, bin.y + 18, 11, 0, Math.PI * 2);
    ctx.fill();
    text(ctx, g.key, bin.x + 18, bin.y + 19, 13, '#fff', 'bold', 'center');
  });
}

function drawPlates(ctx, game) {
  const L = layout();
  text(ctx, 'PIRING  —  rakit hidangan, lalu SAJIKAN', 16, 340, 13, '#7a5a34', 'bold');
  game.plates.forEach((plate, i) => {
    const p = L.plates[i];
    const active = game.activePlate === i;
    ctx.fillStyle = active ? '#fff3d6' : '#f7ecd0';
    roundRect(ctx, p.x, p.y, p.w, p.h, 10);
    ctx.fill();
    ctx.strokeStyle = active ? '#e8a13d' : '#d8c690';
    ctx.lineWidth = active ? 3 : 2;
    roundRect(ctx, p.x, p.y, p.w, p.h, 10);
    ctx.stroke();
    text(ctx, `Piring ${i + 1}${active ? '  ● aktif' : ''}`, p.x + 16, p.y + 22, 15, '#2f2118');
    // The plate itself: a white ellipse with the ingredients on it.
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(p.x + 110, p.y + 78, 86, 34, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#d8c690';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(p.x + 110, p.y + 78, 86, 34, 0, 0, Math.PI * 2);
    ctx.stroke();
    if (plate.items.length === 0) {
      text(ctx, 'piring kosong', p.x + 110, p.y + 78, 13, '#b09a72', 'normal', 'center');
    } else {
      plate.items.forEach((id, j) => {
        drawIngredientIcon(ctx, id, p.x + 58 + j * 36, p.y + 78, 15);
      });
    }
    const ready = plate.items.length > 0 && game.orders.some((o) => {
      const have = [...plate.items].sort().join(',');
      const want = [...o.recipe.needs].sort().join(',');
      return have === want;
    });
    const serve = L.serveBtn[i];
    ctx.fillStyle = ready ? '#3e7d44' : '#8a9a8a';
    roundRect(ctx, serve.x, serve.y, serve.w, serve.h, 8);
    ctx.fill();
    text(ctx, ready ? 'SAJIKAN ✓' : 'SAJIKAN', serve.x + serve.w / 2, serve.y + 20, 14, '#fff', 'bold', 'center');
    const trash = L.trashBtn[i];
    ctx.fillStyle = '#fffdf5';
    roundRect(ctx, trash.x, trash.y, trash.w, trash.h, 8);
    ctx.fill();
    ctx.strokeStyle = '#d94f3d';
    ctx.lineWidth = 2;
    roundRect(ctx, trash.x, trash.y, trash.w, trash.h, 8);
    ctx.stroke();
    text(ctx, 'Buang ✕', trash.x + trash.w / 2, trash.y + 18, 13, '#d94f3d', 'bold', 'center');
  });
}

function drawMessage(ctx, game) {
  const colors = { info: '#7a5a34', good: '#3e7d44', bad: '#d94f3d' };
  ctx.fillStyle = '#2f2118';
  ctx.fillRect(0, 500, CANVAS_W, 40);
  text(ctx, game.message, 16, 521, 16, colors[game.messageKind] || '#fff');
  text(ctx, '1–6 bahan · Tab ganti piring · Spasi sajikan · M suara', CANVAS_W - 16, 521, 13, '#b09a72', 'normal', 'right');
}

function drawTitle(ctx, game) {
  ctx.fillStyle = 'rgba(47, 33, 24, 0.72)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.fillStyle = '#fffdf5';
  roundRect(ctx, 130, 84, 700, 400, 16);
  ctx.fill();
  text(ctx, 'WARUNG KILAT', CANVAS_W / 2, 140, 44, '#d94f3d', 'bold', 'center');
  text(ctx, 'Masak cepat, sajikan tepat — sebelum pelanggan pergi!', CANVAS_W / 2, 186, 18, '#7a5a34', 'normal', 'center');
  const lines = [
    '• Pesanan muncul di papan atas. Setiap pelanggan menunggu sebentar saja.',
    '• Klik bahan di counter (atau tekan 1–6) untuk merakit hidangan di piring.',
    '• Rakit tiga bahan yang tepat, lalu tekan SAJIKAN sebelum waktunya habis.',
    '• Tiga pelanggan kecewa = shift berakhir. Shift berlangsung 90 detik.',
  ];
  lines.forEach((line, i) => text(ctx, line, CANVAS_W / 2, 236 + i * 30, 16, '#2f2118', 'normal', 'center'));
  const btn = layout().startBtn;
  ctx.fillStyle = '#3e7d44';
  roundRect(ctx, btn.x, btn.y, btn.w, btn.h, 12);
  ctx.fill();
  text(ctx, 'MULAI SHIFT  ▶', btn.x + btn.w / 2, btn.y + 29, 20, '#fff', 'bold', 'center');
  text(ctx, 'atau tekan Enter', CANVAS_W / 2, 512, 13, '#8a6d4b', 'normal', 'center');
}

function drawOver(ctx, game) {
  ctx.fillStyle = 'rgba(47, 33, 24, 0.72)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.fillStyle = '#fffdf5';
  roundRect(ctx, 180, 96, 600, 380, 16);
  ctx.fill();
  text(ctx, game.overReason.includes('selesai') ? 'SHIFT SELESAI!' : 'SHIFT BERAKHIR', CANVAS_W / 2, 150, 36, '#d94f3d', 'bold', 'center');
  text(ctx, game.overReason, CANVAS_W / 2, 190, 16, '#7a5a34', 'normal', 'center');
  text(ctx, `Skor akhir: ${game.score}`, CANVAS_W / 2, 248, 30, '#2f2118', 'bold', 'center');
  text(ctx, `Hidangan tersaji: ${game.served}   ·   Pelanggan pergi: ${game.missed}`, CANVAS_W / 2, 292, 16, '#2f2118', 'normal', 'center');
  text(ctx, `Combo terbaik: x${game.bestCombo}`, CANVAS_W / 2, 322, 16, '#2f2118', 'normal', 'center');
  const verdict = game.score >= 600 ? 'Koki bintang lima! Warungmu ramai terus.' : game.score >= 300 ? 'Bagus! Sedikit lagi bintang lima.' : 'Terus berlatih — pelanggan menanti hidanganmu.';
  text(ctx, verdict, CANVAS_W / 2, 368, 16, '#3e7d44', 'normal', 'center');
  const btn = layout().restartBtn;
  ctx.fillStyle = '#3e7d44';
  roundRect(ctx, btn.x, btn.y, btn.w, btn.h, 12);
  ctx.fill();
  text(ctx, 'MAIN LAGI  ↻', btn.x + btn.w / 2, btn.y + 29, 20, '#fff', 'bold', 'center');
}

export function draw(ctx, game) {
  drawKitchen(ctx);
  drawTopBar(ctx, game);
  drawOrders(ctx, game);
  drawBins(ctx, game);
  drawPlates(ctx, game);
  drawMessage(ctx, game);
  if (game.screen === 'title') drawTitle(ctx, game);
  if (game.screen === 'over') drawOver(ctx, game);
}
