"use strict";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const menu = document.getElementById("menu");
const startButton = document.getElementById("startButton");

const truckImage = new Image();
truckImage.src = "Monstertruck.png";

let gameStarted = false;
let lastTime = 0;
let worldOffset = 0;
let ringPulse = 0;

const truck = {
    x: 95,
    y: 0,
    width: 250,
    height: 155,
    speed: 255
};

function resizeCanvas() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;

    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    truck.y = height - 247;
}

function startGame() {
    gameStarted = true;
    menu.hidden = true;
}

function drawSun(width) {
    const x = width - 110;
    const y = 95;

    ctx.save();
    ctx.strokeStyle = "rgba(255, 220, 70, 0.42)";
    ctx.lineWidth = 18;
    ctx.beginPath();
    ctx.arc(x, y, 60, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "#ffd84d";
    ctx.beginPath();
    ctx.arc(x, y, 45, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function drawCloud(x, y, scale = 1, alpha = 1) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(0, 22, 29, 0, Math.PI * 2);
    ctx.arc(40, 0, 39, 0, Math.PI * 2);
    ctx.arc(84, 21, 31, 0, Math.PI * 2);
    ctx.rect(0, 20, 84, 34);
    ctx.fill();
    ctx.restore();
}

function drawMountains(width, groundY) {
    const shift = (worldOffset * 0.06) % 520;

    for (let x = -520 - shift; x < width + 520; x += 520) {
        ctx.fillStyle = "#3d80b7";
        ctx.beginPath();
        ctx.moveTo(x, groundY - 55);
        ctx.lineTo(x + 205, groundY - 330);
        ctx.lineTo(x + 420, groundY - 55);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "#72b6d7";
        ctx.beginPath();
        ctx.moveTo(x + 205, groundY - 330);
        ctx.lineTo(x + 275, groundY - 236);
        ctx.lineTo(x + 235, groundY - 253);
        ctx.lineTo(x + 205, groundY - 220);
        ctx.lineTo(x + 172, groundY - 255);
        ctx.lineTo(x + 137, groundY - 235);
        ctx.closePath();
        ctx.fill();
    }
}

function drawCheckerHill(centerX, baseY, radiusX, radiusY) {
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(centerX, baseY, radiusX, radiusY, 0, Math.PI, 0);
    ctx.clip();

    const tile = 32;
    const left = centerX - radiusX;
    const top = baseY - radiusY;

    for (let y = top; y < baseY; y += tile) {
        for (let x = left; x < centerX + radiusX; x += tile) {
            const col = Math.floor((x - left) / tile);
            const row = Math.floor((y - top) / tile);
            ctx.fillStyle = (col + row) % 2 === 0 ? "#7ccf45" : "#53ad39";
            ctx.fillRect(x, y, tile, tile);
        }
    }

    ctx.restore();
}

function drawDistantHills(width, groundY) {
    const shift = (worldOffset * 0.16) % 760;

    for (let x = -420 - shift; x < width + 760; x += 760) {
        drawCheckerHill(x + 230, groundY + 5, 270, 175);
        drawCheckerHill(x + 590, groundY + 5, 185, 125);
    }
}

function drawBlockTree(x, groundY, scale = 1) {
    ctx.save();
    ctx.translate(x, groundY);
    ctx.scale(scale, scale);

    ctx.fillStyle = "#7a4722";
    ctx.fillRect(38, -122, 35, 122);

    ctx.fillStyle = "#2f943c";
    ctx.fillRect(0, -195, 112, 77);
    ctx.fillStyle = "#48b956";
    ctx.fillRect(13, -181, 86, 49);
    ctx.fillStyle = "rgba(255,255,255,0.13)";
    ctx.fillRect(13, -181, 86, 10);

    ctx.restore();
}

function drawFlower(x, groundY, color) {
    ctx.strokeStyle = "#287b31";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x, groundY);
    ctx.lineTo(x, groundY - 24);
    ctx.stroke();

    ctx.fillStyle = color;
    for (const angle of [0, Math.PI / 2, Math.PI, Math.PI * 1.5]) {
        ctx.beginPath();
        ctx.arc(
            x + Math.cos(angle) * 7,
            groundY - 29 + Math.sin(angle) * 7,
            6,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }

    ctx.fillStyle = "#ffd834";
    ctx.beginPath();
    ctx.arc(x, groundY - 29, 5, 0, Math.PI * 2);
    ctx.fill();
}

function drawGoldenRing(x, y, radius) {
    const pulse = Math.sin(ringPulse + x * 0.01) * 2;

    ctx.save();
    ctx.strokeStyle = "#f5b800";
    ctx.lineWidth = 8;
    ctx.shadowColor = "rgba(255, 225, 70, 0.75)";
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.ellipse(x, y, radius * 0.55 + pulse, radius, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
}

function drawLoop(x, groundY) {
    ctx.save();
    ctx.strokeStyle = "#4ea93c";
    ctx.lineWidth = 36;
    ctx.beginPath();
    ctx.arc(x, groundY - 95, 88, Math.PI * 0.15, Math.PI * 1.85);
    ctx.stroke();

    ctx.strokeStyle = "#8bdd50";
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.arc(x, groundY - 95, 88, Math.PI * 0.15, Math.PI * 1.85);
    ctx.stroke();
    ctx.restore();
}

function drawGround(width, height, groundY) {
    ctx.fillStyle = "#62bf48";
    ctx.fillRect(0, groundY - 22, width, 38);

    ctx.fillStyle = "#8b552d";
    ctx.fillRect(0, groundY + 16, width, height - groundY - 16);

    const block = 48;
    const shift = worldOffset % block;

    for (let row = 0, y = groundY + 16; y < height; row += 1, y += block) {
        for (let col = -1, x = -shift - block; x < width + block; col += 1, x += block) {
            ctx.fillStyle = (row + col) % 2 === 0 ? "#965d32" : "#75451f";
            ctx.fillRect(x, y, block, block);
            ctx.strokeStyle = "rgba(61, 31, 12, 0.35)";
            ctx.strokeRect(x, y, block, block);
        }
    }

    ctx.fillStyle = "#3a913b";
    for (let x = -shift; x < width + 28; x += 28) {
        ctx.beginPath();
        ctx.moveTo(x, groundY - 22);
        ctx.lineTo(x + 8, groundY - 34);
        ctx.lineTo(x + 15, groundY - 22);
        ctx.fill();
    }
}

function drawBackground() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const groundY = height - 108;

    const sky = ctx.createLinearGradient(0, 0, 0, groundY);
    sky.addColorStop(0, "#3db7f1");
    sky.addColorStop(0.7, "#a8e7ff");
    sky.addColorStop(1, "#e1f8ff");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, height);

    drawSun(width);
    drawMountains(width, groundY);

    drawCloud(110 - (worldOffset * 0.035) % (width + 300), 115, 1.05, 0.9);
    drawCloud(570 - (worldOffset * 0.025) % (width + 500), 190, 0.75, 0.78);
    drawCloud(980 - (worldOffset * 0.045) % (width + 500), 95, 1.15, 0.92);

    drawDistantHills(width, groundY);

    const sceneryShift = (worldOffset * 0.33) % 900;
    for (let x = -sceneryShift - 200; x < width + 900; x += 900) {
        drawLoop(x + 680, groundY);
        drawBlockTree(x + 220, groundY - 6, 0.9);
        drawBlockTree(x + 445, groundY - 6, 0.7);
        drawGoldenRing(x + 570, groundY - 135, 25);
        drawGoldenRing(x + 630, groundY - 175, 25);
        drawGoldenRing(x + 690, groundY - 135, 25);
    }

    drawGround(width, height, groundY);

    const detailShift = (worldOffset * 0.8) % 220;
    for (let x = -detailShift; x < width + 220; x += 220) {
        drawFlower(x + 80, groundY - 20, "#ff5b62");
        drawFlower(x + 128, groundY - 20, "#8f62ff");
    }
}

function drawFallbackTruck() {
    ctx.fillStyle = "#167bd0";
    ctx.fillRect(truck.x, truck.y + 42, truck.width, 68);
    ctx.fillStyle = "#ff9000";
    ctx.fillRect(truck.x + 120, truck.y + 2, 77, 58);
    ctx.fillStyle = "#1e1e1e";

    for (const wheelX of [truck.x + 57, truck.x + 190]) {
        ctx.beginPath();
        ctx.arc(wheelX, truck.y + 118, 33, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawTruck() {
    ctx.save();

    if (gameStarted) {
        ctx.translate(0, Math.sin(worldOffset * 0.035) * 2.5);
    }

    if (truckImage.complete && truckImage.naturalWidth > 0) {
        ctx.drawImage(truckImage, truck.x, truck.y, truck.width, truck.height);
    } else {
        drawFallbackTruck();
    }

    ctx.restore();
}

function drawHud() {
    const width = window.innerWidth;

    ctx.fillStyle = "rgba(8, 55, 92, 0.86)";
    ctx.fillRect(width - 235, 18, 215, 54);
    ctx.strokeStyle = "rgba(255,255,255,0.9)";
    ctx.lineWidth = 3;
    ctx.strokeRect(width - 235, 18, 215, 54);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 18px Arial";
    ctx.textAlign = "center";
    ctx.fillText(gameStarted ? "LEVEL 1  •  RACEN!" : "LEVEL 1  •  KLAAR", width - 127, 51);
    ctx.textAlign = "start";
}

function update(deltaSeconds) {
    if (gameStarted) {
        worldOffset += truck.speed * deltaSeconds;
        ringPulse += deltaSeconds * 4;
    }
}

function gameLoop(time) {
    const deltaSeconds = Math.min((time - lastTime) / 1000 || 0, 0.05);
    lastTime = time;

    update(deltaSeconds);
    drawBackground();
    drawTruck();
    drawHud();

    requestAnimationFrame(gameLoop);
}

startButton.addEventListener("click", startGame);
window.addEventListener("resize", resizeCanvas);

resizeCanvas();
requestAnimationFrame(gameLoop);
