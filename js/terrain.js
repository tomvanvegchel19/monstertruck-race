"use strict";

function baseGroundY() {
  return window.innerHeight - 108;
}

function terrainY(worldX) {
  return baseGroundY()
    - Math.sin(worldX / 520) * 48
    - Math.sin(worldX / 235 + 1.1) * 23
    - Math.sin(worldX / 110 + 0.4) * 8;
}

function screenToWorldX(screenX) {
  return game.distance + screenX - truck.x - 700;
}

function truckGroundY() {
  return terrainY(screenToWorldX(truck.x));
}

function terrainSlope(worldX) {
  return Math.atan2(terrainY(worldX + 7) - terrainY(worldX - 7), 14);
}

function drawTerrain(fillColor, edgeColor) {
  const width = window.innerWidth;
  const height = window.innerHeight;

  ctx.fillStyle = fillColor;
  ctx.beginPath();
  ctx.moveTo(0, height);
  for (let x = 0; x <= width + 8; x += 8) {
    ctx.lineTo(x, terrainY(screenToWorldX(x)) + 12);
  }
  ctx.lineTo(width, height);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = edgeColor;
  ctx.lineWidth = 30;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.beginPath();
  for (let x = -8; x <= width + 8; x += 8) {
    const y = terrainY(screenToWorldX(x));
    if (x === -8) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
}
