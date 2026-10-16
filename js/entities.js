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

function drawProjectiles() {
  for (const projectile of game.projectiles) {
    ctx.fillStyle = "#ff8b18"; ctx.shadowColor = "#ff5a00"; ctx.shadowBlur = 12;
    ctx.fillRect(projectile.x, projectile.y, projectile.w, projectile.h); ctx.shadowBlur = 0;
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
