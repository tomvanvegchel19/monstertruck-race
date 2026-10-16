"use strict";

function drawMarkers() {
  for (let index = 1; index < 3; index++) {
    const point = currentLevel().checkpoints[index];
    const x = point - game.distance + truck.x + 700;
    const y = terrainY(point);
    if (x < -100 || x > window.innerWidth + 100) continue;
    ctx.fillStyle = "white"; ctx.fillRect(x, y - 150, 10, 150);
    ctx.fillStyle = index <= game.checkpoint ? "#48d05d" : "#ffca28"; ctx.fillRect(x + 10, y - 145, 78, 45);
    ctx.fillStyle = "#173d5d"; ctx.font = "bold 17px Arial"; ctx.fillText(`CP ${index}`, x + 23, y - 116);
  }
}

function drawFinish() {
  const x = currentLevel().length - game.distance + truck.x + 700;
  const y = terrainY(currentLevel().length);
  if (x < -150 || x > window.innerWidth + 150) return;
  ctx.fillStyle = "white"; ctx.fillRect(x, y - 190, 12, 190);
  for (let row = 0; row < 4; row++) for (let col = 0; col < 5; col++) {
    ctx.fillStyle = (row + col) % 2 ? "white" : "#111";
    ctx.fillRect(x + 12 + col * 22, y - 185 + row * 22, 22, 22);
  }
}

function drawHud() {
  const width = window.innerWidth;
  const progress = Math.min(game.distance / currentLevel().length, 1);
  ctx.fillStyle = "rgba(8,55,92,.9)"; ctx.fillRect(18, 18, 370, 105); ctx.fillRect(width - 250, 18, 232, 82);
  ctx.strokeStyle = "white"; ctx.lineWidth = 3; ctx.strokeRect(18, 18, 370, 105); ctx.strokeRect(width - 250, 18, 232, 82);
  ctx.fillStyle = "white"; ctx.font = "bold 19px Arial"; ctx.fillText(`LEVEL ${game.levelIndex + 1}: ${currentLevel().name}`, 34, 43);
  ctx.font = "bold 17px Arial"; ctx.fillText("LEVENS:", 34, 66);
  for (let index = 0; index < game.lives; index++) {
    drawHeartShape(122 + index * 30, 61, 22, "#ef2d4f", "#8f1730");
  }
  ctx.fillText(`SCORE: ${game.score}`, 34, 91);
  ctx.fillText(`SNELHEID ${game.speedIndex + 1}: ${SPEED_NAMES[game.speedIndex]}`, width - 232, 44);
  ctx.font = "14px Arial"; 
  ctx.fillText("← → snelheid", width - 232, 58);
  ctx.fillText("F = raket", width - 232, 78);
  ctx.fillStyle = "rgba(255,255,255,.25)"; ctx.fillRect(width - 232, 72, 195, 12);
  ctx.fillStyle = "#ffd23f"; ctx.fillRect(width - 232, 72, 195 * progress, 12);
}

function drawOverlay() {
  if (game.messageTime <= 0 && !game.gameOver && !game.levelComplete && !game.gameComplete) return;
  ctx.fillStyle = "rgba(5,35,58,.84)"; ctx.fillRect(innerWidth / 2 - 270, innerHeight / 2 - 75, 540, 150);
  ctx.strokeStyle = "white"; ctx.lineWidth = 4; ctx.strokeRect(innerWidth / 2 - 270, innerHeight / 2 - 75, 540, 150);
  ctx.fillStyle = "white"; ctx.textAlign = "center"; ctx.font = "bold 30px Arial"; ctx.fillText(game.message, innerWidth / 2, innerHeight / 2 - 4);
  ctx.font = "18px Arial";
  if (game.levelComplete) ctx.fillText("Druk op Enter voor het volgende level", innerWidth / 2, innerHeight / 2 + 38);
  else if (game.gameComplete) ctx.fillText("Druk op Enter om opnieuw te spelen", innerWidth / 2, innerHeight / 2 + 38);
if (game.gameOver) {

    // donkere achtergrond
    ctx.fillStyle = "rgba(0,0,0,0.75)";
    ctx.fillRect(0, 0, innerWidth, innerHeight);

    // rode gloed
    const pulse = Math.sin(performance.now() * 0.01) * 0.15 + 0.85;

    ctx.textAlign = "center";

    ctx.shadowColor = "#ff0000";
    ctx.shadowBlur = 40 * pulse;

    ctx.fillStyle = "#ff2d2d";
    ctx.font = "bold 80px Arial";
    ctx.fillText("GAME OVER", innerWidth / 2, innerHeight / 2 - 60);

    ctx.shadowBlur = 0;

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 28px Arial";
    ctx.fillText(
        `Score: ${game.score}`,
        innerWidth / 2,
        innerHeight / 2 + 5
    );

    ctx.fillStyle = "#ffd23f";
    ctx.font = "bold 24px Arial";
    ctx.fillText(
        "Druk op ENTER om opnieuw te spelen",
        innerWidth / 2,
        innerHeight / 2 + 65
    );

    return;
} ctx.fillText("Druk op Enter om opnieuw te beginnen", innerWidth / 2, innerHeight / 2 + 38);
  ctx.textAlign = "start";
}
