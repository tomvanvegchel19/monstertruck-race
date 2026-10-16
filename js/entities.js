"use strict";

function rectanglesOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function drawEnemy(enemy, index) {
  if (game.destroyedEnemies.has(index)) return;
  const x = enemy.x - game.distance + truck.x + 700;
  const y = terrainY(enemy.x);
  const desert = currentLevel().world === "desert";
  if (x < -140 || x > window.innerWidth + 140) return;

  if (enemy.type === "spikes") {
    ctx.fillStyle = desert ? "#7f4a29" : "#c8d2dc";
    for (let i = 0; i < 4; i++) {
      ctx.beginPath(); ctx.moveTo(x + i * 21, y); ctx.lineTo(x + i * 21 + 10, y - 42);
      ctx.lineTo(x + (i + 1) * 21, y); ctx.closePath(); ctx.fill();
    }
    return;
  }

  ctx.fillStyle = desert ? "#8e3d22" : "#9a3bc1"; ctx.fillRect(x, y - 60, 76, 60);
  ctx.fillStyle = desert ? "#d66a2f" : "#d85cf1"; ctx.fillRect(x + 10, y - 60, 56, 24);
  ctx.fillStyle = "white"; ctx.fillRect(x + 16, y - 51, 13, 13); ctx.fillRect(x + 48, y - 51, 13, 13);
  ctx.fillStyle = "#222"; ctx.fillRect(x + 21, y - 48, 6, 7); ctx.fillRect(x + 50, y - 48, 6, 7);
}

function drawTruck() {
  if (game.invulnerable > 0 && Math.floor(game.invulnerable * 10) % 2 === 0) return;
  ctx.save();
  if (truck.onGround) {
    const cx = truck.x + truck.width / 2, cy = truck.y + truck.height / 2;
    ctx.translate(cx, cy); ctx.rotate(terrainSlope(screenToWorldX(truck.x)) * 0.72); ctx.translate(-cx, -cy);
  }
  if (truckImage.complete && truckImage.naturalWidth) ctx.drawImage(truckImage, truck.x, truck.y, truck.width, truck.height);
  else { ctx.fillStyle = "#167bd0"; ctx.fillRect(truck.x, truck.y + 48, truck.width, 75); }
  ctx.restore();
}

function drawRocketSmoke(projectile, time) {
  const trailLength = 6;

  for (let index = 0; index < trailLength; index++) {
    const wave = Math.sin(time * 0.012 + index * 1.35) * 5;
    const smokeX = projectile.x - 10 - index * 13;
    const smokeY = projectile.y + projectile.h / 2 + wave;
    const radius = 8 + index * 2.3;
    const alpha = Math.max(0.08, 0.52 - index * 0.07);

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = index % 2 === 0 ? "#f5f7fa" : "#cfd8df";
    ctx.beginPath();
    ctx.arc(smokeX, smokeY, radius, 0, Math.PI * 2);
    ctx.arc(smokeX - radius * 0.65, smokeY + 3, radius * 0.72, 0, Math.PI * 2);
    ctx.arc(smokeX + radius * 0.55, smokeY - 2, radius * 0.66, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function drawCartoonRocket(projectile, time) {
  const x = projectile.x;
  const y = projectile.y + projectile.h / 2;
  const bob = Math.sin(time * 0.016 + x * 0.02) * 1.8;
  const rocketLength = 46;
  const rocketHeight = 20;

  ctx.save();
  ctx.translate(x, y + bob);

  // Vlam achter de raket.
  const flamePulse = 7 + Math.sin(time * 0.035) * 3;
  ctx.fillStyle = "#ff3b1f";
  ctx.beginPath();
  ctx.moveTo(2, 0);
  ctx.lineTo(-17 - flamePulse, -8);
  ctx.lineTo(-11 - flamePulse * 0.45, 0);
  ctx.lineTo(-17 - flamePulse, 8);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#ffd33d";
  ctx.beginPath();
  ctx.moveTo(3, 0);
  ctx.lineTo(-11 - flamePulse * 0.55, -4);
  ctx.lineTo(-7 - flamePulse * 0.3, 0);
  ctx.lineTo(-11 - flamePulse * 0.55, 4);
  ctx.closePath();
  ctx.fill();

  // Rode staartvinnen.
  ctx.fillStyle = "#e3343f";
  ctx.strokeStyle = "#7e1c28";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(8, -7);
  ctx.lineTo(-2, -17);
  ctx.lineTo(19, -9);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(8, 7);
  ctx.lineTo(-2, 17);
  ctx.lineTo(19, 9);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Hoofdlichaam.
  const bodyGradient = ctx.createLinearGradient(0, -rocketHeight / 2, 0, rocketHeight / 2);
  bodyGradient.addColorStop(0, "#fff8e8");
  bodyGradient.addColorStop(0.52, "#e9eef2");
  bodyGradient.addColorStop(1, "#aebbc5");
  ctx.fillStyle = bodyGradient;
  ctx.strokeStyle = "#34495a";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(0, -rocketHeight / 2, rocketLength - 13, rocketHeight, 9);
  ctx.fill();
  ctx.stroke();

  // Punt van de raket.
  ctx.fillStyle = "#ef3948";
  ctx.beginPath();
  ctx.moveTo(rocketLength - 14, -rocketHeight / 2);
  ctx.quadraticCurveTo(rocketLength + 8, 0, rocketLength - 14, rocketHeight / 2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Cartoonraampje.
  ctx.fillStyle = "#46c8f0";
  ctx.strokeStyle = "#24556b";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(18, 0, 5.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,0.72)";
  ctx.beginPath();
  ctx.arc(16.5, -1.8, 1.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawProjectiles() {
  const time = performance.now();

  for (const projectile of game.projectiles) {
    drawRocketSmoke(projectile, time);
    drawCartoonRocket(projectile, time);
  }
}

function drawEffects() {
  for (const particle of game.dust) {
    ctx.globalAlpha = Math.max(0, particle.life / 0.6) * 0.5;
    ctx.fillStyle = currentLevel().world === "desert" ? "#e7bd6b" : "#d8c295";
    ctx.beginPath(); ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
  for (const explosion of game.explosions) {
    ctx.fillStyle = "#ff3b1f"; ctx.beginPath(); ctx.arc(explosion.x, explosion.y, explosion.radius, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#ffd21f"; ctx.beginPath(); ctx.arc(explosion.x, explosion.y, explosion.radius * 0.55, 0, Math.PI * 2); ctx.fill();
  }
}
