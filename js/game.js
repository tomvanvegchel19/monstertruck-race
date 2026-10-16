"use strict";

function resizeCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(window.innerWidth * ratio); canvas.height = Math.round(window.innerHeight * ratio);
  canvas.style.width = window.innerWidth + "px"; canvas.style.height = window.innerHeight + "px";
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  if (truck.onGround) truck.y = truckGroundY() - truck.height + 18;
}

function showMessage(text, seconds = 1) { game.message = text; game.messageTime = seconds; }
function resetLevelPosition() {
  game.speedIndex = currentLevel().startSpeed; game.distance = currentLevel().checkpoints[game.checkpoint] || 0;
  truck.velocityY = 0; truck.onGround = true; truck.y = truckGroundY() - truck.height + 18;
  game.invulnerable = 1.7; game.projectiles = []; game.dust = []; game.explosions = [];
}
function startCurrentLevel() {
  game.checkpoint = 0; game.levelComplete = false; game.gameOver = false; game.destroyedEnemies.clear(); game.collectedHearts.clear(); game.heartBursts = [];
  resetLevelPosition(); showMessage(`LEVEL ${game.levelIndex + 1}: ${currentLevel().name}`, 1.8);
}
function startGame() {
  game.started = true; menu.hidden = true; game.levelIndex = 0; game.score = 0; game.lives = STARTING_LIVES; game.gameComplete = false; startCurrentLevel();
}
function jump() {
  if (game.started && !game.gameOver && !game.levelComplete && !game.gameComplete && truck.onGround) {
    truck.velocityY = -truck.jumpPower; truck.onGround = false;
  }
}
function changeSpeed(direction) {
  if (!game.started || game.gameOver || game.levelComplete || game.gameComplete) return;
  game.speedIndex = Math.max(0, Math.min(4, game.speedIndex + direction)); showMessage(SPEED_NAMES[game.speedIndex], 0.55);
}
function shoot() {
  if (!game.started || game.gameOver || game.levelComplete || game.gameComplete || game.shotCooldown > 0) return;
  game.projectiles.push({ x: truck.x + truck.width - 20, y: truck.y + 72, w: 38, h: 15 }); game.shotCooldown = 0.27;
}
function loseLife() {
  if (game.invulnerable > 0 || game.gameOver) return;
  game.lives--;
  if (game.lives <= 0) { game.gameOver = true; showMessage("GAME OVER", 99); }
  else { showMessage("BOTSING! TERUG NAAR CHECKPOINT", 1.4); resetLevelPosition(); }
}
function continueGame() {
  if (game.levelComplete) { game.levelIndex++; game.lives = STARTING_LIVES; startCurrentLevel(); return; }
  if (game.gameOver || game.gameComplete) { game.levelIndex = 0; game.score = 0; game.lives = STARTING_LIVES; game.gameComplete = false; startCurrentLevel(); }
}

function updateGame(delta) {
  if (!game.started || game.gameOver || game.levelComplete || game.gameComplete) return;
  game.distance += SPEEDS[game.speedIndex] * delta;
  game.score = Math.max(game.score, Math.floor(game.distance / 10) + game.levelIndex * 1000);
  truck.velocityY += truck.gravity * delta; truck.y += truck.velocityY * delta;
  const floor = truckGroundY() - truck.height + 18;
  if (truck.y >= floor) { truck.y = floor; truck.velocityY = 0; truck.onGround = true; }
  game.invulnerable = Math.max(0, game.invulnerable - delta); game.shotCooldown = Math.max(0, game.shotCooldown - delta); game.messageTime = Math.max(0, game.messageTime - delta);
  if (game.distance >= currentLevel().checkpoints[2] && game.checkpoint < 2) { game.checkpoint = 2; showMessage("CHECKPOINT 2!", 1); }
  else if (game.distance >= currentLevel().checkpoints[1] && game.checkpoint < 1) { game.checkpoint = 1; showMessage("CHECKPOINT 1!", 1); }

  game.projectiles.forEach(p => p.x += 760 * delta); game.projectiles = game.projectiles.filter(p => p.x < innerWidth + 100);
  if (truck.onGround && Math.random() < 0.34) game.dust.push({ x: truck.x + 30, y: truckGroundY() - 8, vx: -100 - Math.random() * 90, vy: -25 - Math.random() * 45, radius: 7 + Math.random() * 10, life: 0.6 });
  game.dust.forEach(p => { p.x += p.vx * delta; p.y += p.vy * delta; p.vy += 70 * delta; p.life -= delta; }); game.dust = game.dust.filter(p => p.life > 0);
  game.explosions.forEach(e => { e.radius += 120 * delta; e.life -= delta; }); game.explosions = game.explosions.filter(e => e.life > 0);
  game.heartBursts.forEach(burst => { burst.y -= 45 * delta; burst.life -= delta; }); game.heartBursts = game.heartBursts.filter(burst => burst.life > 0);

  const truckBox = { x: truck.x + 38, y: truck.y + 40, w: truck.width - 76, h: truck.height - 55 };
  (currentLevel().hearts || []).forEach((heart, index) => {
    if (game.collectedHearts.has(index)) return;
    const heartX = heart.x - game.distance + truck.x + 700;
    const heartY = terrainY(heart.x) - heart.height;
    const heartBox = { x: heartX - 26, y: heartY - 25, w: 52, h: 50 };
    if (rectanglesOverlap(truckBox, heartBox)) {
      game.collectedHearts.add(index);
      game.lives = Math.min(MAX_LIVES, game.lives + 1);
      game.score += 300;
      game.heartBursts.push({ x: heartX, y: heartY, life: 0.9 });
      showMessage(game.lives < MAX_LIVES ? "EXTRA LEVEN!" : `MAXIMAAL ${MAX_LIVES} LEVENS!`, 0.9);
    }
  });

  currentLevel().enemies.forEach((enemy, index) => {
    if (game.destroyedEnemies.has(index)) return;
    const x = enemy.x - game.distance + truck.x + 700;
    const width = enemy.type === "spikes" ? 84 : 76, height = enemy.type === "spikes" ? 42 : 60;
    const enemyBox = { x, y: terrainY(enemy.x) - height, w: width, h: height };
    if (rectanglesOverlap(truckBox, enemyBox)) loseLife();
    if (enemy.type === "crawler") for (let j = game.projectiles.length - 1; j >= 0; j--) {
      const p = game.projectiles[j], hitbox = { x: p.x - 18, y: p.y - 16, w: p.w + 36, h: p.h + 32 };
      if (rectanglesOverlap(hitbox, enemyBox)) { game.destroyedEnemies.add(index); game.projectiles.splice(j, 1); game.explosions.push({ x: x + width / 2, y: enemyBox.y + height / 2, radius: 12, life: 0.55 }); game.score += 250; showMessage("RAAK! +250", 0.5); break; }
    }
  });

  if (game.distance >= currentLevel().length) {
    game.score += 1000 * (game.levelIndex + 1);
    if (game.levelIndex < LEVELS.length - 1) { game.levelComplete = true; showMessage(`LEVEL ${game.levelIndex + 1} GEHAALD!`, 99); }
    else { game.gameComplete = true; showMessage("ALLE 3 LEVELS GEHAALD!", 99); }
  }
}

function drawCurrentWorld() {
  if (currentLevel().world === "desert") drawDesertWorld();
  else if (currentLevel().world === "ice") drawIceWorld();
  else drawGrasslandWorld();
}

function gameLoop(time) {
  const delta = Math.min((time - game.lastTime) / 1000 || 0, 0.05); game.lastTime = time;
  updateGame(delta); drawCurrentWorld(); drawCollectibleHearts(); drawMarkers(); drawFinish(); currentLevel().enemies.forEach(drawEnemy);
  drawEffects(); drawProjectiles(); drawTruck(); drawHud(); drawOverlay(); requestAnimationFrame(gameLoop);
}

startButton.addEventListener("click", startGame);
window.addEventListener("resize", resizeCanvas);
window.addEventListener("keydown", event => {
  if (event.code === "Space" || event.code === "ArrowUp") { event.preventDefault(); jump(); }
  else if (event.code === "ArrowRight") { event.preventDefault(); changeSpeed(1); }
  else if (event.code === "ArrowLeft") { event.preventDefault(); changeSpeed(-1); }
  else if (event.code === "KeyF") { event.preventDefault(); shoot(); }
  else if (event.code === "Enter") continueGame();
});
canvas.addEventListener("pointerdown", jump);
resizeCanvas();
requestAnimationFrame(gameLoop);
