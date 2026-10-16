"use strict";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const menu = document.getElementById("menu");
const startButton = document.getElementById("startButton");

const truckImage = new Image();
truckImage.src = "Monstertruck.png";

let gameStarted = false;
let gameOver = false;
let lastTime = 0;
let worldOffset = 0;
let distance = 0;
let score = 0;
let lives = 3;
let checkpoint = 0;
let invulnerableTime = 0;
let message = "";
let messageTime = 0;
let speedLevel = 2;
let shotCooldown = 0;
const projectiles = [];
const destroyedEnemies = new Set();

const speedLevels = [
    { name: "RUSTIG", speed: 230 },
    { name: "NORMAAL", speed: 320 },
    { name: "SNEL", speed: 410 },
    { name: "TURBO", speed: 500 },
    { name: "SUPERSNEL", speed: 590 }
];

const levelLength = 7000;
const groundHeight = 108;

const truck = {
    x: 105,
    y: 0,
    width: 300,
    height: 185,
    velocityY: 0,
    speed: speedLevels[speedLevel - 1].speed,
    jumpPower: 690,
    gravity: 1850,
    onGround: true
};

const enemies = [
    { x: 1100, type: "crawler", width: 74, height: 58 },
    { x: 1900, type: "spikes", width: 78, height: 42 },
    { x: 2850, type: "crawler", width: 74, height: 58 },
    { x: 3650, type: "spikes", width: 92, height: 42 },
    { x: 4550, type: "crawler", width: 78, height: 62 },
    { x: 5400, type: "spikes", width: 100, height: 42 },
    { x: 6250, type: "crawler", width: 82, height: 66 }
];

const checkpoints = [0, 2400, 4800];

function getGroundY() {
    return window.innerHeight - groundHeight;
}

function resizeCanvas() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(window.innerWidth * ratio);
    canvas.height = Math.round(window.innerHeight * ratio);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    if (truck.onGround) {
        truck.y = getGroundY() - truck.height + 18;
    }
}

function resetRun(fullReset = false) {
    if (fullReset) {
        lives = 3;
        score = 0;
        checkpoint = 0;
        gameOver = false;
        speedLevel = 2;
        truck.speed = speedLevels[speedLevel - 1].speed;
        destroyedEnemies.clear();
    }

    distance = checkpoints[checkpoint];
    worldOffset = distance;
    truck.velocityY = 0;
    truck.onGround = true;
    truck.y = getGroundY() - truck.height + 18;
    invulnerableTime = 1.8;
    projectiles.length = 0;
}

function startGame() {
    gameStarted = true;
    menu.hidden = true;
    resetRun(true);
    showMessage("GAS EROP!", 1.1);
}

function jump() {
    if (!gameStarted || gameOver) return;
    if (truck.onGround) {
        truck.velocityY = -truck.jumpPower;
        truck.onGround = false;
    }
}

function changeSpeed(direction) {
    if (!gameStarted || gameOver) return;
    speedLevel = Math.max(1, Math.min(5, speedLevel + direction));
    truck.speed = speedLevels[speedLevel - 1].speed;
    showMessage(speedLevels[speedLevel - 1].name, 0.65);
}

function shoot() {
    if (!gameStarted || gameOver || shotCooldown > 0) return;

    projectiles.push({
        x: truck.x + truck.width - 22,
        y: truck.y + 67,
        width: 34,
        height: 13,
        speed: 760
    });
    shotCooldown = 0.28;
}

function showMessage(text, seconds) {
    message = text;
    messageTime = seconds;
}

function loseLife() {
    if (invulnerableTime > 0 || gameOver) return;

    lives -= 1;
    if (lives <= 0) {
        gameOver = true;
        showMessage("GAME OVER", 99);
        return;
    }

    showMessage("Botsing! Terug naar checkpoint", 1.5);
    resetRun(false);
}

function updateCheckpoint() {
    if (distance >= checkpoints[2] && checkpoint < 2) {
        checkpoint = 2;
        showMessage("Checkpoint 2!", 1.2);
    } else if (distance >= checkpoints[1] && checkpoint < 1) {
        checkpoint = 1;
        showMessage("Checkpoint 1!", 1.2);
    }
}

function rectsOverlap(a, b) {
    return a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y;
}

function getTruckHitbox() {
    return {
        x: truck.x + 28,
        y: truck.y + 30,
        width: truck.width - 56,
        height: truck.height - 42
    };
}

function update(delta) {
    if (!gameStarted || gameOver) return;

    distance += truck.speed * delta;
    worldOffset = distance;
    score = Math.floor(distance / 10);

    truck.velocityY += truck.gravity * delta;
    truck.y += truck.velocityY * delta;

    const floorY = getGroundY() - truck.height + 18;
    if (truck.y >= floorY) {
        truck.y = floorY;
        truck.velocityY = 0;
        truck.onGround = true;
    }

    if (invulnerableTime > 0) invulnerableTime -= delta;
    if (messageTime > 0) messageTime -= delta;
    if (shotCooldown > 0) shotCooldown -= delta;

    for (const projectile of projectiles) {
        projectile.x += projectile.speed * delta;
    }

    for (let i = projectiles.length - 1; i >= 0; i--) {
        if (projectiles[i].x > window.innerWidth + 80) {
            projectiles.splice(i, 1);
        }
    }

    updateCheckpoint();

    const truckBox = getTruckHitbox();
    for (let enemyIndex = 0; enemyIndex < enemies.length; enemyIndex++) {
        if (destroyedEnemies.has(enemyIndex)) continue;

        const enemy = enemies[enemyIndex];
        const screenX = enemy.x - worldOffset + truck.x + 700;
        const enemyBox = {
            x: screenX,
            y: getGroundY() - enemy.height,
            width: enemy.width,
            height: enemy.height
        };

        if (rectsOverlap(truckBox, enemyBox)) loseLife();

        if (enemy.type === "crawler") {
            for (let projectileIndex = projectiles.length - 1; projectileIndex >= 0; projectileIndex--) {
                if (rectsOverlap(projectiles[projectileIndex], enemyBox)) {
                    destroyedEnemies.add(enemyIndex);
                    projectiles.splice(projectileIndex, 1);
                    score += 250;
                    showMessage("RAAK! +250", 0.55);
                    break;
                }
            }
        }
    }

    if (distance >= levelLength) {
        gameOver = true;
        score += 1000;
        showMessage("LEVEL 1 GEHAALD!", 99);
    }
}

function drawCloud(x, y, scale, alpha) {
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

function drawCheckerHill(cx, baseY, rx, ry) {
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, baseY, rx, ry, 0, Math.PI, 0);
    ctx.clip();
    const tile = 32;
    for (let y = baseY - ry; y < baseY; y += tile) {
        for (let x = cx - rx; x < cx + rx; x += tile) {
            const even = (Math.floor(x / tile) + Math.floor(y / tile)) % 2 === 0;
            ctx.fillStyle = even ? "#7ccf45" : "#53ad39";
            ctx.fillRect(x, y, tile, tile);
        }
    }
    ctx.restore();
}

function drawTree(x, groundY, scale) {
    ctx.save();
    ctx.translate(x, groundY);
    ctx.scale(scale, scale);
    ctx.fillStyle = "#7a4722";
    ctx.fillRect(38, -122, 35, 122);
    ctx.fillStyle = "#2f943c";
    ctx.fillRect(0, -195, 112, 77);
    ctx.fillStyle = "#48b956";
    ctx.fillRect(13, -181, 86, 49);
    ctx.restore();
}

function drawBackground() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const groundY = getGroundY();

    const sky = ctx.createLinearGradient(0, 0, 0, groundY);
    sky.addColorStop(0, "#3db7f1");
    sky.addColorStop(1, "#dff8ff");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = "#ffd84d";
    ctx.beginPath();
    ctx.arc(w - 105, 92, 46, 0, Math.PI * 2);
    ctx.fill();

    const mountainShift = (worldOffset * 0.05) % 530;
    for (let x = -530 - mountainShift; x < w + 530; x += 530) {
        ctx.fillStyle = "#4488b9";
        ctx.beginPath();
        ctx.moveTo(x, groundY - 40);
        ctx.lineTo(x + 210, groundY - 325);
        ctx.lineTo(x + 430, groundY - 40);
        ctx.fill();
    }

    drawCloud(120 - (worldOffset * 0.03) % (w + 300), 115, 1.05, 0.9);
    drawCloud(620 - (worldOffset * 0.025) % (w + 500), 180, 0.8, 0.8);
    drawCloud(980 - (worldOffset * 0.04) % (w + 500), 90, 1.1, 0.9);

    const hillShift = (worldOffset * 0.14) % 760;
    for (let x = -400 - hillShift; x < w + 760; x += 760) {
        drawCheckerHill(x + 240, groundY + 8, 270, 175);
        drawCheckerHill(x + 590, groundY + 8, 180, 125);
    }

    const treeShift = (worldOffset * 0.32) % 680;
    for (let x = -180 - treeShift; x < w + 680; x += 680) {
        drawTree(x + 200, groundY - 8, 0.8);
        drawTree(x + 470, groundY - 8, 0.65);
    }

    ctx.fillStyle = "#62bf48";
    ctx.fillRect(0, groundY - 22, w, 38);
    ctx.fillStyle = "#8b552d";
    ctx.fillRect(0, groundY + 16, w, h - groundY - 16);

    const block = 48;
    const blockShift = worldOffset % block;
    for (let row = 0, y = groundY + 16; y < h; row++, y += block) {
        for (let col = -1, x = -blockShift - block; x < w + block; col++, x += block) {
            ctx.fillStyle = (row + col) % 2 === 0 ? "#965d32" : "#75451f";
            ctx.fillRect(x, y, block, block);
            ctx.strokeStyle = "rgba(61,31,12,0.35)";
            ctx.strokeRect(x, y, block, block);
        }
    }
}

function drawEnemy(enemy, enemyIndex) {
    if (destroyedEnemies.has(enemyIndex)) return;
    const x = enemy.x - worldOffset + truck.x + 700;
    const groundY = getGroundY();
    if (x < -150 || x > window.innerWidth + 150) return;

    if (enemy.type === "spikes") {
        ctx.fillStyle = "#c8d2dc";
        const spikeCount = 4;
        const spikeWidth = enemy.width / spikeCount;
        for (let i = 0; i < spikeCount; i++) {
            ctx.beginPath();
            ctx.moveTo(x + i * spikeWidth, groundY);
            ctx.lineTo(x + i * spikeWidth + spikeWidth / 2, groundY - enemy.height);
            ctx.lineTo(x + (i + 1) * spikeWidth, groundY);
            ctx.fill();
        }
        return;
    }

    const y = groundY - enemy.height;
    ctx.fillStyle = "#9a3bc1";
    ctx.fillRect(x, y + 13, enemy.width, enemy.height - 13);
    ctx.fillStyle = "#d85cf1";
    ctx.fillRect(x + 10, y, enemy.width - 20, 25);
    ctx.fillStyle = "white";
    ctx.fillRect(x + 17, y + 10, 13, 13);
    ctx.fillRect(x + enemy.width - 30, y + 10, 13, 13);
    ctx.fillStyle = "#222";
    ctx.fillRect(x + 22, y + 13, 6, 7);
    ctx.fillRect(x + enemy.width - 28, y + 13, 6, 7);
    ctx.fillStyle = "#222";
    ctx.beginPath();
    ctx.arc(x + 17, groundY, 12, 0, Math.PI * 2);
    ctx.arc(x + enemy.width - 17, groundY, 12, 0, Math.PI * 2);
    ctx.fill();
}

function drawProjectiles() {
    for (const projectile of projectiles) {
        const gradient = ctx.createLinearGradient(
            projectile.x,
            projectile.y,
            projectile.x + projectile.width,
            projectile.y
        );
        gradient.addColorStop(0, "#fff36b");
        gradient.addColorStop(0.55, "#ff9f1a");
        gradient.addColorStop(1, "#ff3b1f");

        ctx.save();
        ctx.fillStyle = gradient;
        ctx.shadowColor = "#ff7b00";
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.roundRect(
            projectile.x,
            projectile.y,
            projectile.width,
            projectile.height,
            7
        );
        ctx.fill();
        ctx.restore();
    }
}

function drawCheckpointMarkers() {
    const groundY = getGroundY();
    checkpoints.slice(1).forEach((point, index) => {
        const x = point - worldOffset + truck.x + 700;
        if (x < -100 || x > window.innerWidth + 100) return;
        ctx.fillStyle = "#f6f6f6";
        ctx.fillRect(x, groundY - 150, 10, 150);
        ctx.fillStyle = index + 1 <= checkpoint ? "#48d05d" : "#ffca28";
        ctx.fillRect(x + 10, groundY - 145, 78, 45);
        ctx.fillStyle = "#173d5d";
        ctx.font = "bold 17px Arial";
        ctx.fillText(`CP ${index + 1}`, x + 23, groundY - 116);
    });
}

function drawFinish() {
    const x = levelLength - worldOffset + truck.x + 700;
    const groundY = getGroundY();
    if (x < -150 || x > window.innerWidth + 150) return;

    ctx.fillStyle = "white";
    ctx.fillRect(x, groundY - 190, 12, 190);
    const tile = 22;
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 5; col++) {
            ctx.fillStyle = (row + col) % 2 === 0 ? "#111" : "white";
            ctx.fillRect(x + 12 + col * tile, groundY - 185 + row * tile, tile, tile);
        }
    }
}

function drawTruck() {
    const flashing = invulnerableTime > 0 && Math.floor(invulnerableTime * 10) % 2 === 0;
    if (flashing) return;

    ctx.save();
    if (gameStarted && truck.onGround) ctx.translate(0, Math.sin(worldOffset * 0.05) * 2);

    if (truckImage.complete && truckImage.naturalWidth > 0) {
        ctx.drawImage(truckImage, truck.x, truck.y, truck.width, truck.height);
    } else {
        ctx.fillStyle = "#167bd0";
        ctx.fillRect(truck.x, truck.y + 42, truck.width, 68);
        ctx.fillStyle = "#222";
        ctx.beginPath();
        ctx.arc(truck.x + 55, truck.y + 118, 33, 0, Math.PI * 2);
        ctx.arc(truck.x + 180, truck.y + 118, 33, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
}

function drawHud() {
    const w = window.innerWidth;
    const progress = Math.min(distance / levelLength, 1);

    ctx.fillStyle = "rgba(8,55,92,0.9)";
    ctx.fillRect(18, 18, 290, 82);
    ctx.fillRect(w - 250, 18, 232, 82);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 3;
    ctx.strokeRect(18, 18, 290, 82);
    ctx.strokeRect(w - 250, 18, 232, 82);

    ctx.fillStyle = "white";
    ctx.font = "bold 19px Arial";
    ctx.fillText(`LEVENS: ${"❤".repeat(lives)}`, 34, 49);
    ctx.fillText(`SCORE: ${score}`, 34, 80);
    ctx.fillText(`SNELHEID ${speedLevel}: ${speedLevels[speedLevel - 1].name}`, w - 232, 44);
    ctx.font = "15px Arial";
    ctx.fillText("← langzamer   → sneller   F schieten", w - 232, 62);

    ctx.fillStyle = "rgba(255,255,255,0.25)";
    ctx.fillRect(w - 232, 72, 195, 12);
    ctx.fillStyle = "#ffd23f";
    ctx.fillRect(w - 232, 72, 195 * progress, 12);
}

function drawOverlay() {
    if (messageTime > 0 || gameOver) {
        ctx.fillStyle = "rgba(5,35,58,0.82)";
        ctx.fillRect(window.innerWidth / 2 - 250, window.innerHeight / 2 - 70, 500, 140);
        ctx.strokeStyle = "white";
        ctx.lineWidth = 4;
        ctx.strokeRect(window.innerWidth / 2 - 250, window.innerHeight / 2 - 70, 500, 140);
        ctx.fillStyle = "white";
        ctx.font = "bold 31px Arial";
        ctx.textAlign = "center";
        ctx.fillText(message, window.innerWidth / 2, window.innerHeight / 2 - 3);
        if (gameOver) {
            ctx.font = "18px Arial";
            ctx.fillText("Druk op Enter om opnieuw te beginnen", window.innerWidth / 2, window.innerHeight / 2 + 38);
        }
        ctx.textAlign = "start";
    }
}

function restartIfNeeded() {
    if (!gameOver) return;
    resetRun(true);
    gameStarted = true;
    showMessage("NIEUWE RACE!", 1.1);
}

function gameLoop(time) {
    const delta = Math.min((time - lastTime) / 1000 || 0, 0.05);
    lastTime = time;

    update(delta);
    drawBackground();
    drawCheckpointMarkers();
    drawFinish();
    enemies.forEach(drawEnemy);
    drawProjectiles();
    drawTruck();
    drawHud();
    drawOverlay();

    requestAnimationFrame(gameLoop);
}

startButton.addEventListener("click", startGame);
window.addEventListener("resize", resizeCanvas);
window.addEventListener("keydown", event => {
    if (["Space", "ArrowUp"].includes(event.code)) {
        event.preventDefault();
        jump();
    }
    if (event.code === "ArrowRight") {
        event.preventDefault();
        changeSpeed(1);
    }
    if (event.code === "ArrowLeft") {
        event.preventDefault();
        changeSpeed(-1);
    }
    if (event.code === "KeyF") {
        event.preventDefault();
        shoot();
    }
    if (event.code === "Enter") restartIfNeeded();
});
canvas.addEventListener("pointerdown", jump);

resizeCanvas();
requestAnimationFrame(gameLoop);
