"use strict";

function drawCloud(x, y, scale = 1, alpha = 0.9) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(0, 22, 29, 0, Math.PI * 2);
  ctx.arc(40, 0, 39, 0, Math.PI * 2);
  ctx.arc(84, 21, 31, 0, Math.PI * 2);
  ctx.rect(0, 20, 84, 34);
  ctx.fill();
  ctx.restore();
}

function drawTree(x, y, scale = 1, variant = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = "#6d3d1f";
  ctx.fillRect(42, -145, 34, 145);
  ctx.fillStyle = variant % 2 ? "#237b38" : "#2f943c";
  if (variant % 3 === 2) {
    for (let layer = 0; layer < 4; layer++) {
      ctx.beginPath();
      ctx.moveTo(59, -130 - layer * 42);
      ctx.lineTo(-5 + layer * 8, -45 - layer * 42);
      ctx.lineTo(123 - layer * 8, -45 - layer * 42);
      ctx.closePath();
      ctx.fill();
    }
  } else {
    ctx.fillRect(-4, -220, 124, 88);
    ctx.fillStyle = "#4db95b";
    ctx.fillRect(12, -204, 92, 55);
  }
  ctx.restore();
}

function drawCheckerHill(centerX, baseY, radiusX, radiusY) {
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(centerX, baseY, radiusX, radiusY, 0, Math.PI, 0);
  ctx.clip();
  for (let y = baseY - radiusY; y < baseY; y += 32) {
    for (let x = centerX - radiusX; x < centerX + radiusX; x += 32) {
      ctx.fillStyle = (Math.floor(x / 32) + Math.floor(y / 32)) % 2 ? "#53ad39" : "#7ccf45";
      ctx.fillRect(x, y, 32, 32);
    }
  }
  ctx.restore();
}

function drawGrasslandWorld() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const ground = baseGroundY();
  const sky = ctx.createLinearGradient(0, 0, 0, ground);
  sky.addColorStop(0, "#31afea");
  sky.addColorStop(1, "#dcf7ff");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "#ffd84d";
  ctx.beginPath();
  ctx.arc(width - 110, 95, 47, 0, Math.PI * 2);
  ctx.fill();

  drawCloud(130 - (game.distance * 0.025) % (width + 350), 115, 1, 0.9);
  drawCloud(700 - (game.distance * 0.018) % (width + 500), 185, 0.75, 0.75);

  const hillShift = (game.distance * 0.14) % 760;
  for (let x = -420 - hillShift; x < width + 760; x += 760) {
    drawCheckerHill(x + 240, ground + 8, 270, 175);
    drawCheckerHill(x + 590, ground + 8, 180, 125);
  }

  const treeShift = (game.distance * 0.31) % 650;
  for (let x = -220 - treeShift, i = 0; x < width + 650; x += 650, i++) {
    drawTree(x + 150, ground - 8, 1.05, i);
    drawTree(x + 430, ground - 8, 0.75, i + 1);
  }

  drawTerrain("#8b552d", "#61c94c");
}

