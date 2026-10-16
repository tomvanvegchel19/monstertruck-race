
"use strict";

function drawDune(cx, by, rx, ry, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(cx, by, rx, ry, 0, Math.PI, 0);
  ctx.fill();
}

function drawMesa(x, y, scale = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale);
  ctx.fillStyle = "#a84f2a";
  ctx.beginPath();
  ctx.moveTo(-105, 0); ctx.lineTo(-72, -115); ctx.lineTo(-35, -160);
  ctx.lineTo(58, -160); ctx.lineTo(86, -118); ctx.lineTo(112, 0);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#cf6e36"; ctx.fillRect(-35, -160, 93, 24);
  ctx.restore();
}

function drawPyramid(x, y, scale = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale);
  ctx.fillStyle = "#d9a344";
  ctx.beginPath(); ctx.moveTo(-105, 0); ctx.lineTo(0, -155); ctx.lineTo(105, 0); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#b87a2d";
  ctx.beginPath(); ctx.moveTo(0, -155); ctx.lineTo(105, 0); ctx.lineTo(22, 0); ctx.closePath(); ctx.fill();
  ctx.restore();
}

function drawCactus(x, y, scale = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale);
  ctx.fillStyle = "#187b43";
  ctx.fillRect(-13, -118, 30, 118); ctx.fillRect(-45, -82, 34, 23);
  ctx.fillRect(-45, -82, 18, 48); ctx.fillRect(15, -68, 39, 23); ctx.fillRect(36, -68, 18, 47);
  ctx.fillStyle = "#38ad61"; ctx.fillRect(-6, -112, 7, 102);
  ctx.restore();
}

function drawDesertRock(x, y, scale = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale);
  ctx.fillStyle = "#9d4d2d";
  ctx.beginPath(); ctx.moveTo(-50, 0); ctx.lineTo(-35, -42); ctx.lineTo(-4, -66);
  ctx.lineTo(39, -48); ctx.lineTo(55, 0); ctx.closePath(); ctx.fill();
  ctx.restore();
}

function drawDesertWorld() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const ground = baseGroundY();
  const sky = ctx.createLinearGradient(0, 0, 0, ground);
  sky.addColorStop(0, "#40b8e8"); sky.addColorStop(0.58, "#f4cf78"); sky.addColorStop(1, "#ffe3a0");
  ctx.fillStyle = sky; ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "#ffd04a"; ctx.beginPath(); ctx.arc(width - 120, 105, 52, 0, Math.PI * 2); ctx.fill();

  const mesaShift = (game.distance * 0.035) % 720;
  for (let x = -720 - mesaShift; x < width + 720; x += 720) {
    drawMesa(x + 190, ground - 95, 1.35); drawMesa(x + 520, ground - 70, 0.85);
  }
  const pyramidShift = (game.distance * 0.075) % 980;
  for (let x = -820 - pyramidShift; x < width + 980; x += 980) {
    drawPyramid(x + 470, ground - 24, 0.9); drawPyramid(x + 650, ground - 18, 0.57);
  }
  const duneShift = (game.distance * 0.14) % 790;
  for (let x = -450 - duneShift; x < width + 790; x += 790) {
    drawDune(x + 225, ground + 16, 320, 150, "#e8b34f");
    drawDune(x + 625, ground + 22, 220, 105, "#d99b3d");
  }
  const cactusShift = (game.distance * 0.31) % 720;
  for (let x = -220 - cactusShift; x < width + 720; x += 720) {
    drawCactus(x + 150, ground - 8, 0.8); drawCactus(x + 410, ground - 8, 1.05);
    drawDesertRock(x + 590, ground - 3, 0.75);
  }
  drawTerrain("#b66b2b", "#e4aa47");

  ctx.save(); ctx.globalAlpha = 0.16; ctx.strokeStyle = "#fff0bd"; ctx.lineWidth = 4;
  const haze = (performance.now() * 0.035) % 270;
  for (let y = 180; y < height - 120; y += 92) {
    const x = width - ((y * 3 + haze) % (width + 360));
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 165, y + 7); ctx.stroke();
  }
  ctx.restore();
}
