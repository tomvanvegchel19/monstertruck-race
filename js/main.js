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
let speedLevel = 1;
let shotCooldown = 0;
const projectiles = [];
const destroyedEnemies = new Set();
const explosions = [];
const dustParticles = [];

const speedLevels = [
    { name: "RUSTIG", speed: 230 },
    { name: "NORMAAL", speed: 320 },
    { name: "SNEL", speed: 410 },
    { name: "TURBO", speed: 500 },
    { name: "SUPERSNEL", speed: 590 }
];

const levelLength = 7600;
const groundHeight = 108;

const truck = {
    x: 105,
    y: 0,
    width: 276,
    height: 170,
    velocityY: 0,
    speed: speedLevels[speedLevel - 1].speed,
    jumpPower: 930,
    gravity: 1700,
    onGround: true
};

const enemies = [
    { x: 1350, type: "crawler", width: 70, height: 55 },
    { x: 2450, type: "spikes", width: 72, height: 38 },
    { x: 3650, type: "crawler", width: 72, height: 57 },
    { x: 4850, type: "spikes", width: 80, height: 40 },
    { x: 6100, type: "crawler", width: 76, height: 60 }
];

const checkpoints = [0, 2700, 5200];

function getGroundY() {
    return window.innerHeight - groundHeight;
}

function getTerrainY(worldX) {
    const baseY = getGroundY();
    const broadHill = Math.sin(worldX / 520) * 48;
    const mediumHill = Math.sin(worldX / 235 + 1.1) * 23;
    const smallBump = Math.sin(worldX / 110 + 0.4) * 8;
    return baseY - broadHill - mediumHill - smallBump;
}

function screenToWorldX(screenX) {
    return worldOffset + screenX - truck.x - 700;
}

function getTruckTerrainY() {
    return getTerrainY(screenToWorldX(truck.x));
}

function getTerrainSlope(worldX) {
    const sample = 7;
    const left = getTerrainY(worldX - sample);
    const right = getTerrainY(worldX + sample);
    return Math.atan2(right - left, sample * 2);
}

function resizeCanvas() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(window.innerWidth * ratio);
    canvas.height = Math.round(window.innerHeight * ratio);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    if (truck.onGround) {
        truck.y = getTruckTerrainY() - truck.height + 18;
    }
}

function resetRun(fullReset = false) {
    if (fullReset) {
        lives = 3;
        score = 0;
        checkpoint = 0;
        gameOver = false;
        speedLevel = 1;
        truck.speed = speedLevels[speedLevel - 1].speed;
        destroyedEnemies.clear();
        explosions.length = 0;
        dustParticles.length = 0;
    }

    distance = checkpoints[checkpoint];
    worldOffset = distance;
    truck.velocityY = 0;
    truck.onGround = true;
    truck.y = getTruckTerrainY() - truck.height + 18;
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

    const floorY = getTruckTerrainY() - truck.height + 18;
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

    if (truck.onGround && Math.random() < 0.38) {
        dustParticles.push({
            x: truck.x + 28,
            y: getTruckTerrainY() - 10,
            vx: -80 - Math.random() * 110,
            vy: -25 - Math.random() * 55,
            size: 7 + Math.random() * 13,
            life: 0.65
        });
    }

    for (let i = dustParticles.length - 1; i >= 0; i--) {
        const dust = dustParticles[i];
        dust.x += dust.vx * delta;
        dust.y += dust.vy * delta;
        dust.vy += 75 * delta;
        dust.life -= delta;
        if (dust.life <= 0) dustParticles.splice(i, 1);
    }

    for (let i = explosions.length - 1; i >= 0; i--) {
        const explosion = explosions[i];
        explosion.life -= delta;
        explosion.radius += 115 * delta;
        if (explosion.life <= 0) explosions.splice(i, 1);
    }

    updateCheckpoint();

    const truckBox = getTruckHitbox();
    for (let enemyIndex = 0; enemyIndex < enemies.length; enemyIndex++) {
        if (destroyedEnemies.has(enemyIndex)) continue;

        const enemy = enemies[enemyIndex];
        const screenX = enemy.x - worldOffset + truck.x + 700;
        const enemyBox = {
            x: screenX,
            y: getTerrainY(enemy.x) - enemy.height,
            width: enemy.width,
            height: enemy.height
        };

        if (rectsOverlap(truckBox, enemyBox)) loseLife();

        if (enemy.type === "crawler") {
            for (let projectileIndex = projectiles.length - 1; projectileIndex >= 0; projectileIndex--) {
                const projectileHitbox = {
                    x: projectiles[projectileIndex].x - 18,
                    y: projectiles[projectileIndex].y - 16,
                    width: projectiles[projectileIndex].width + 36,
                    height: projectiles[projectileIndex].height + 32
                };
                if (rectsOverlap(projectileHitbox, enemyBox)) {
                    destroyedEnemies.add(enemyIndex);
                    explosions.push({
                        x: enemyBox.x + enemyBox.width / 2,
                        y: enemyBox.y + enemyBox.height / 2,
                        radius: 12,
                        life: 0.55
                    });
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

function drawMistLayer(width, groundY) {
    const shift = (worldOffset * 0.09) % 420;
    ctx.save();
    ctx.globalAlpha = 0.20;
    ctx.fillStyle = "#ffffff";
    for (let x = -450 - shift; x < width + 450; x += 420) {
        ctx.beginPath();
        ctx.ellipse(x + 120, groundY - 210, 240, 44, 0, 0, Math.PI * 2);
        ctx.ellipse(x + 300, groundY - 188, 210, 36, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
}

function drawRainbow(x, y, scale = 1) {
    const colors = ["#ff4b4b", "#ff9d2e", "#ffe43b", "#52c95b", "#3da5ff", "#8755d7"];
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    colors.forEach((color, index) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.arc(0, 0, 94 - index * 10, Math.PI, 0);
        ctx.stroke();
    });
    ctx.restore();
}

function drawHotAirBalloon(x, y, scale = 1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.fillStyle = "#ff6b35";
    ctx.beginPath();
    ctx.ellipse(0, 0, 34, 46, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffd34e";
    ctx.beginPath();
    ctx.ellipse(0, 0, 13, 45, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#6f4424";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-15, 38); ctx.lineTo(-10, 62);
    ctx.moveTo(15, 38); ctx.lineTo(10, 62);
    ctx.stroke();
    ctx.fillStyle = "#8a542e";
    ctx.fillRect(-13, 60, 26, 18);
    ctx.restore();
}

function drawBird(x, y, scale = 1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.strokeStyle = "rgba(28,67,92,0.72)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(-11, 0, 12, Math.PI * 1.05, Math.PI * 1.9);
    ctx.arc(11, 0, 12, Math.PI * 1.1, Math.PI * 1.95);
    ctx.stroke();
    ctx.restore();
}

function drawFloatingIsland(x, y, scale = 1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.fillStyle = "#59bd48";
    ctx.fillRect(-72, -12, 144, 28);
    ctx.fillStyle = "#8b572d";
    ctx.beginPath();
    ctx.moveTo(-65, 16);
    ctx.lineTo(0, 92);
    ctx.lineTo(65, 16);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#6f421f";
    ctx.beginPath();
    ctx.moveTo(-34, 16); ctx.lineTo(0, 72); ctx.lineTo(34, 16); ctx.closePath();
    ctx.fill();
    ctx.restore();
}

function drawWaterfall(x, y, height, width = 38) {
    const flow = (performance.now() * 0.08) % 24;
    const water = ctx.createLinearGradient(x, y, x + width, y);
    water.addColorStop(0, "#238cca");
    water.addColorStop(0.5, "#81e5ff");
    water.addColorStop(1, "#2187c0");
    ctx.fillStyle = water;
    ctx.fillRect(x, y, width, height);
    ctx.strokeStyle = "rgba(255,255,255,0.65)";
    ctx.lineWidth = 3;
    for (let line = 7; line < width; line += 12) {
        ctx.beginPath();
        ctx.moveTo(x + line, y - flow);
        ctx.lineTo(x + line, y + height);
        ctx.stroke();
    }
    ctx.fillStyle = "rgba(225,250,255,0.9)";
    for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.arc(x + 5 + i * (width / 5), y + height, 8, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawCave(x, groundY, scale = 1) {
    ctx.save();
    ctx.translate(x, groundY);
    ctx.scale(scale, scale);
    ctx.fillStyle = "#52616b";
    ctx.fillRect(-65, -86, 130, 86);
    ctx.fillStyle = "#202b32";
    ctx.beginPath();
    ctx.arc(0, -38, 42, Math.PI, 0);
    ctx.fillRect(-42, -38, 84, 38);
    ctx.fill();
    ctx.fillStyle = "#707f87";
    for (let bx = -58; bx < 58; bx += 29) {
        ctx.fillRect(bx, -80, 24, 18);
    }
    ctx.restore();
}

function drawOreBlock(x, y, color) {
    ctx.fillStyle = "#59636a";
    ctx.fillRect(x, y, 42, 42);
    ctx.strokeStyle = "#394248";
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, 42, 42);
    ctx.fillStyle = color;
    ctx.fillRect(x + 7, y + 8, 10, 9);
    ctx.fillRect(x + 24, y + 6, 9, 12);
    ctx.fillRect(x + 18, y + 25, 13, 10);
    ctx.fillRect(x + 5, y + 29, 8, 7);
}

function drawForegroundBush(x, groundY, scale = 1) {
    ctx.save();
    ctx.translate(x, groundY);
    ctx.scale(scale, scale);
    ctx.fillStyle = "#187b36";
    ctx.beginPath();
    ctx.arc(0, 0, 33, Math.PI, 0);
    ctx.arc(43, -8, 40, Math.PI, 0);
    ctx.arc(92, 0, 34, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = "#2eaa49";
    ctx.beginPath();
    ctx.arc(39, -6, 22, Math.PI, 0);
    ctx.fill();
    ctx.restore();
}

function drawSpeedLines(width, height) {
    if (speedLevel < 4 || !gameStarted) return;
    ctx.save();
    ctx.globalAlpha = speedLevel === 5 ? 0.42 : 0.25;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = speedLevel === 5 ? 4 : 3;
    const timeShift = (performance.now() * 0.7) % 240;
    for (let y = 135; y < height - 150; y += 74) {
        const x = width - ((y * 5 + timeShift) % (width + 300));
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - 120 - speedLevel * 16, y);
        ctx.stroke();
    }
    ctx.restore();
}

function drawBackground() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const groundY = getGroundY();

    const sky = ctx.createLinearGradient(0, 0, 0, groundY);
    sky.addColorStop(0, "#31afea");
    sky.addColorStop(0.6, "#92ddfa");
    sky.addColorStop(1, "#dcf7ff");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = "rgba(255,215,70,0.28)";
    ctx.beginPath(); ctx.arc(w - 112, 98, 67, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#ffd84d";
    ctx.beginPath(); ctx.arc(w - 112, 98, 46, 0, Math.PI * 2); ctx.fill();

    const farShift = (worldOffset * 0.035) % 620;
    for (let x = -620 - farShift; x < w + 620; x += 620) {
        ctx.fillStyle = "#5b92bd";
        ctx.beginPath();
        ctx.moveTo(x, groundY - 65);
        ctx.lineTo(x + 220, groundY - 385);
        ctx.lineTo(x + 455, groundY - 65);
        ctx.fill();
        ctx.fillStyle = "#7db8d6";
        ctx.beginPath();
        ctx.moveTo(x + 220, groundY - 385);
        ctx.lineTo(x + 276, groundY - 304);
        ctx.lineTo(x + 235, groundY - 322);
        ctx.lineTo(x + 202, groundY - 292);
        ctx.lineTo(x + 164, groundY - 309);
        ctx.closePath();
        ctx.fill();
    }

    drawRainbow(420 - (worldOffset * 0.045) % (w + 700), groundY - 280, 1.05);
    drawHotAirBalloon(w - ((worldOffset * 0.025 + 250) % (w + 400)), 165, 0.9);

    for (let i = 0; i < 7; i++) {
        const birdX = w - ((worldOffset * 0.075 + i * 190) % (w + 300));
        drawBird(birdX, 120 + (i % 3) * 47, 0.7 + (i % 2) * 0.25);
    }

    drawCloud(120 - (worldOffset * 0.024) % (w + 320), 112, 1.05, 0.9);
    drawCloud(620 - (worldOffset * 0.019) % (w + 520), 190, 0.82, 0.78);
    drawCloud(1020 - (worldOffset * 0.032) % (w + 520), 92, 1.15, 0.9);

    drawMistLayer(w, groundY);

    const islandShift = (worldOffset * 0.09) % 1250;
    for (let x = -900 - islandShift; x < w + 1250; x += 1250) {
        drawFloatingIsland(x + 720, groundY - 350, 0.85);
        drawWaterfall(x + 703, groundY - 334, 145, 28);
    }

    const hillShift = (worldOffset * 0.14) % 760;
    for (let x = -400 - hillShift; x < w + 760; x += 760) {
        drawCheckerHill(x + 240, groundY + 8, 270, 175);
        drawCheckerHill(x + 590, groundY + 8, 180, 125);
    }

    const treeShift = (worldOffset * 0.31) % 760;
    for (let x = -240 - treeShift; x < w + 760; x += 760) {
        drawTree(x + 170, groundY - 8, 1.15);
        drawTree(x + 455, groundY - 8, 0.72);
        drawCave(x + 625, groundY - 6, 0.78);
        drawOreBlock(x + 330, groundY - 62, "#39e6ef");
        drawOreBlock(x + 382, groundY - 62, "#ffd43b");
    }

    const terrainStep = 8;

    ctx.fillStyle = "#8b552d";
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w + terrainStep; x += terrainStep) {
        ctx.lineTo(x, getTerrainY(screenToWorldX(x)) + 12);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "#61c94c";
    ctx.lineWidth = 28;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.beginPath();
    for (let x = -terrainStep; x <= w + terrainStep; x += terrainStep) {
        const y = getTerrainY(screenToWorldX(x));
        if (x === -terrainStep) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.strokeStyle = "rgba(83,45,21,0.42)";
    ctx.lineWidth = 2;
    const block = 48;
    const blockShift = worldOffset % block;
    for (let x = -blockShift; x < w + block; x += block) {
        const topY = getTerrainY(screenToWorldX(x)) + 14;
        ctx.beginPath();
        ctx.moveTo(x, topY);
        ctx.lineTo(x, h);
        ctx.stroke();
    }
    for (let y = getGroundY() + 20; y < h; y += block) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
    }

    const foregroundShift = (worldOffset * 0.95) % 330;
    for (let x = -330 - foregroundShift; x < w + 330; x += 330) {
        const bushY = getTerrainY(screenToWorldX(x + 35)) + 4;
        drawForegroundBush(x + 35, bushY, 0.7);
    }

    drawSpeedLines(w, h);
}

function drawEnemy(enemy, enemyIndex) {
    if (destroyedEnemies.has(enemyIndex)) return;
    const x = enemy.x - worldOffset + truck.x + 700;
    const groundY = getTerrainY(enemy.x);
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

function drawWarnings() {
    const groundY = getGroundY();

    enemies.forEach((enemy, enemyIndex) => {
        if (destroyedEnemies.has(enemyIndex)) return;
        const screenX = enemy.x - worldOffset + truck.x + 700;
        if (screenX > window.innerWidth && screenX < window.innerWidth + 650) {
            const pulse = 1 + Math.sin(performance.now() * 0.012) * 0.12;
            ctx.save();
            ctx.translate(window.innerWidth - 58, groundY - 88);
            ctx.scale(pulse, pulse);
            ctx.fillStyle = "#ffcf33";
            ctx.strokeStyle = "#a62918";
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(0, -30);
            ctx.lineTo(31, 28);
            ctx.lineTo(-31, 28);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = "#572012";
            ctx.font = "bold 34px Arial";
            ctx.textAlign = "center";
            ctx.fillText("!", 0, 18);
            ctx.restore();
        }
    });
    ctx.textAlign = "start";
}

function drawDust() {
    for (const dust of dustParticles) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, dust.life / 0.65) * 0.55;
        ctx.fillStyle = "#d8c295";
        ctx.beginPath();
        ctx.arc(dust.x, dust.y, dust.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

function drawExplosions() {
    for (const explosion of explosions) {
        const alpha = Math.max(0, explosion.life / 0.55);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = "#ff3b1f";
        ctx.beginPath();
        ctx.arc(explosion.x, explosion.y, explosion.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ffb000";
        ctx.beginPath();
        ctx.arc(explosion.x, explosion.y, explosion.radius * 0.68, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#fff36b";
        ctx.beginPath();
        ctx.arc(explosion.x, explosion.y, explosion.radius * 0.32, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
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
        const markerGroundY = getTerrainY(point);
        ctx.fillStyle = "#f6f6f6";
        ctx.fillRect(x, markerGroundY - 150, 10, 150);
        ctx.fillStyle = index + 1 <= checkpoint ? "#48d05d" : "#ffca28";
        ctx.fillRect(x + 10, markerGroundY - 145, 78, 45);
        ctx.fillStyle = "#173d5d";
        ctx.font = "bold 17px Arial";
        ctx.fillText(`CP ${index + 1}`, x + 23, markerGroundY - 116);
    });
}

function drawFinish() {
    const x = levelLength - worldOffset + truck.x + 700;
    const groundY = getTerrainY(levelLength);
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
    if (gameStarted && truck.onGround) {
        const centerX = truck.x + truck.width / 2;
        const centerY = truck.y + truck.height / 2;
        const slope = getTerrainSlope(screenToWorldX(truck.x));
        ctx.translate(centerX, centerY);
        ctx.rotate(slope * 0.72);
        ctx.translate(-centerX, -centerY);
        ctx.translate(0, Math.sin(worldOffset * 0.05) * 2);
    }

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
    drawWarnings();
    drawDust();
    drawProjectiles();
    drawExplosions();
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
