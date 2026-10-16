"use strict";

function drawIceMountain(x, groundY, scale = 1) {
  ctx.save();
  ctx.translate(x, groundY);
  ctx.scale(scale, scale);

  ctx.fillStyle = "#7ba7c9";
  ctx.beginPath();
  ctx.moveTo(-150, 0);
  ctx.lineTo(0, -250);
  ctx.lineTo(165, 0);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#dff6ff";
  ctx.beginPath();
  ctx.moveTo(0, -250);
  ctx.lineTo(48, -170);
  ctx.lineTo(22, -184);
  ctx.lineTo(0, -155);
  ctx.lineTo(-28, -188);
  ctx.lineTo(-55, -170);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,0.25)";
  ctx.beginPath();
  ctx.moveTo(-105, -18);
  ctx.lineTo(0, -250);
  ctx.lineTo(-18, -150);
  ctx.lineTo(-55, -70);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawSnowPine(x, groundY, scale = 1, variant = 0) {
  ctx.save();
  ctx.translate(x, groundY);
  ctx.scale(scale, scale);

  ctx.fillStyle = "#68452d";
  ctx.fillRect(-12, -112, 24, 112);

  const green = variant % 2 === 0 ? "#176c62" : "#1d7567";
  const snow = "#eefbff";

  for (let layer = 0; layer < 4; layer++) {
    const y = -94 - layer * 45;
    const halfWidth = 63 - layer * 9;

    ctx.fillStyle = green;
    ctx.beginPath();
    ctx.moveTo(0, y - 70);
    ctx.lineTo(-halfWidth, y + 22);
    ctx.lineTo(halfWidth, y + 22);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = snow;
    ctx.beginPath();
    ctx.moveTo(0, y - 63);
    ctx.lineTo(-halfWidth * 0.63, y - 2);
    ctx.lineTo(halfWidth * 0.63, y - 2);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}

function drawIceCrystal(x, groundY, scale = 1, color = "#6ee7ff") {
  ctx.save();
  ctx.translate(x, groundY);
  ctx.scale(scale, scale);
  ctx.shadowColor = color;
  ctx.shadowBlur = 12;

  const crystals = [
    { x: -22, h: 54, w: 18 },
    { x: 0, h: 82, w: 22 },
    { x: 25, h: 61, w: 19 }
  ];

  for (const crystal of crystals) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(crystal.x, 0);
    ctx.lineTo(crystal.x - crystal.w / 2, -crystal.h * 0.55);
    ctx.lineTo(crystal.x, -crystal.h);
    ctx.lineTo(crystal.x + crystal.w / 2, -crystal.h * 0.55);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.beginPath();
    ctx.moveTo(crystal.x, -crystal.h);
    ctx.lineTo(crystal.x, 0);
    ctx.lineTo(crystal.x - crystal.w / 2, -crystal.h * 0.55);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}

function drawFrozenWaterfall(x, y, height, width = 42) {
  const shimmer = (performance.now() * 0.045) % 30;
  const iceGradient = ctx.createLinearGradient(x, y, x + width, y);
  iceGradient.addColorStop(0, "#3fbfe8");
  iceGradient.addColorStop(0.5, "#c8f6ff");
  iceGradient.addColorStop(1, "#4daacf");

  ctx.fillStyle = iceGradient;
  ctx.fillRect(x, y, width, height);

  ctx.strokeStyle = "rgba(255,255,255,0.75)";
  ctx.lineWidth = 3;
  for (let line = 7; line < width; line += 12) {
    ctx.beginPath();
    ctx.moveTo(x + line, y - shimmer);
    ctx.lineTo(x + line, y + height);
    ctx.stroke();
  }

  ctx.fillStyle = "#dffaff";
  for (let i = 0; i < 4; i++) {
    const icicleX = x + 4 + i * (width / 4);
    ctx.beginPath();
    ctx.moveTo(icicleX, y + height);
    ctx.lineTo(icicleX + 6, y + height + 24 + i * 5);
    ctx.lineTo(icicleX + 12, y + height);
    ctx.closePath();
    ctx.fill();
  }
}

function drawIceCave(x, groundY, scale = 1) {
  ctx.save();
  ctx.translate(x, groundY);
  ctx.scale(scale, scale);

  ctx.fillStyle = "#8cc9e0";
  ctx.fillRect(-72, -92, 144, 92);

  ctx.fillStyle = "#255b76";
  ctx.beginPath();
  ctx.arc(0, -41, 46, Math.PI, 0);
  ctx.fillRect(-46, -41, 92, 41);
  ctx.fill();

  ctx.fillStyle = "#dffaff";
  for (let i = 0; i < 6; i++) {
    const px = -68 + i * 27;
    ctx.beginPath();
    ctx.moveTo(px, -92);
    ctx.lineTo(px + 10, -65 - (i % 2) * 12);
    ctx.lineTo(px + 20, -92);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawPenguin(x, groundY, scale = 1) {
  ctx.save();
  ctx.translate(x, groundY);
  ctx.scale(scale, scale);

  ctx.fillStyle = "#172938";
  ctx.beginPath();
  ctx.ellipse(0, -31, 25, 34, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#f5fbff";
  ctx.beginPath();
  ctx.ellipse(0, -25, 15, 24, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffb52f";
  ctx.beginPath();
  ctx.moveTo(0, -39);
  ctx.lineTo(14, -34);
  ctx.lineTo(0, -29);
  ctx.closePath();
  ctx.fill();

  ctx.fillRect(-22, -4, 16, 6);
  ctx.fillRect(6, -4, 16, 6);

  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(-8, -48, 5, 0, Math.PI * 2);
  ctx.arc(8, -48, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#111";
  ctx.beginPath();
  ctx.arc(-7, -48, 2, 0, Math.PI * 2);
  ctx.arc(9, -48, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawSnowflakes(width, height) {
  const time = performance.now() * 0.035;
  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.82)";

  for (let i = 0; i < 70; i++) {
    const x = (i * 127 + time * (0.35 + (i % 5) * 0.08)) % (width + 80) - 40;
    const y = (i * 83 + time * (0.8 + (i % 4) * 0.12)) % (height + 80) - 40;
    const radius = 1.6 + (i % 4) * 0.7;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawIceGround(width, height) {
  ctx.fillStyle = "#5d91aa";
  ctx.beginPath();
  ctx.moveTo(0, height);
  for (let x = 0; x <= width + 8; x += 8) {
    ctx.lineTo(x, terrainY(screenToWorldX(x)) + 12);
  }
  ctx.lineTo(width, height);
  ctx.closePath();
  ctx.fill();

  const iceEdge = ctx.createLinearGradient(0, baseGroundY() - 40, 0, baseGroundY() + 20);
  iceEdge.addColorStop(0, "#f6fdff");
  iceEdge.addColorStop(0.45, "#bceeff");
  iceEdge.addColorStop(1, "#55b8df");

  ctx.strokeStyle = iceEdge;
  ctx.lineWidth = 31;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.beginPath();
  for (let x = -8; x <= width + 8; x += 8) {
    const y = terrainY(screenToWorldX(x));
    if (x === -8) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  ctx.strokeStyle = "rgba(206,247,255,0.52)";
  ctx.lineWidth = 3;
  const shift = game.distance % 75;
  for (let x = -shift; x < width + 75; x += 75) {
    const top = terrainY(screenToWorldX(x)) + 12;
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.lineTo(x + 32, Math.min(height, top + 105));
    ctx.stroke();
  }
}

function drawIceWorld() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const ground = baseGroundY();

  const sky = ctx.createLinearGradient(0, 0, 0, ground);
  sky.addColorStop(0, "#4aa9df");
  sky.addColorStop(0.55, "#a8dff5");
  sky.addColorStop(1, "#edfaff");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "rgba(255,248,205,0.32)";
  ctx.beginPath();
  ctx.arc(width - 115, 100, 66, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff2b2";
  ctx.beginPath();
  ctx.arc(width - 115, 100, 44, 0, Math.PI * 2);
  ctx.fill();

  const mountainShift = (game.distance * 0.035) % 650;
  for (let x = -650 - mountainShift; x < width + 650; x += 650) {
    drawIceMountain(x + 185, ground - 75, 1.3);
    drawIceMountain(x + 510, ground - 57, 0.88);
  }

  drawCloud(180 - (game.distance * 0.019) % (width + 450), 140, 0.8, 0.72);
  drawCloud(820 - (game.distance * 0.015) % (width + 560), 210, 0.62, 0.56);

  const iceHillShift = (game.distance * 0.13) % 790;
  for (let x = -460 - iceHillShift; x < width + 790; x += 790) {
    ctx.fillStyle = "#c9eef8";
    ctx.beginPath();
    ctx.ellipse(x + 245, ground + 15, 325, 155, 0, Math.PI, 0);
    ctx.fill();

    ctx.fillStyle = "#9fd6e9";
    ctx.beginPath();
    ctx.ellipse(x + 630, ground + 20, 220, 108, 0, Math.PI, 0);
    ctx.fill();
  }

  const islandShift = (game.distance * 0.08) % 1300;
  for (let x = -1000 - islandShift; x < width + 1300; x += 1300) {
    ctx.fillStyle = "#dff8ff";
    ctx.fillRect(x + 690, ground - 365, 150, 25);
    ctx.fillStyle = "#72a9c4";
    ctx.beginPath();
    ctx.moveTo(x + 700, ground - 340);
    ctx.lineTo(x + 765, ground - 255);
    ctx.lineTo(x + 830, ground - 340);
    ctx.closePath();
    ctx.fill();
    drawFrozenWaterfall(x + 750, ground - 340, 145, 31);
  }

  const treeShift = (game.distance * 0.3) % 760;
  for (let x = -240 - treeShift, group = 0; x < width + 760; x += 760, group++) {
    drawSnowPine(x + 140, ground - 8, 0.86, group);
    drawSnowPine(x + 385, ground - 8, 1.08, group + 1);
    drawIceCave(x + 580, ground - 6, 0.78);
    drawIceCrystal(x + 690, ground - 7, 0.72, group % 2 ? "#8b8dff" : "#63e8ff");
  }

  drawIceGround(width, height);

  const foregroundShift = (game.distance * 0.76) % 390;
  for (let x = -390 - foregroundShift, index = 0; x < width + 390; x += 390, index++) {
    const y = terrainY(screenToWorldX(x + 105));
    if (index % 2 === 0) drawPenguin(x + 105, y + 2, 0.62);
    else drawIceCrystal(x + 110, y + 2, 0.42, "#76dcff");
  }

  drawSnowflakes(width, height);
}
