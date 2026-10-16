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

const truck = {
    x: 90,
    y: 0,
    width: 230,
    height: 145,
    speed: 240
};

function resizeCanvas() {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.round(window.innerWidth * pixelRatio);
    canvas.height = Math.round(window.innerHeight * pixelRatio);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    truck.y = window.innerHeight - 245;
}

function startGame() {
    gameStarted = true;
    menu.hidden = true;
}

function drawCloud(x, y, scale = 1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
    ctx.beginPath();
    ctx.arc(0, 18, 28, 0, Math.PI * 2);
    ctx.arc(38, 0, 38, 0, Math.PI * 2);
    ctx.arc(82, 18, 30, 0, Math.PI * 2);
    ctx.rect(0, 18, 82, 32);
    ctx.fill();
    ctx.restore();
}

function drawBlockTree(x, groundY) {
    ctx.fillStyle = "#8d5524";
    ctx.fillRect(x + 35, groundY - 115, 34, 115);

    ctx.fillStyle = "#2e9f45";
    ctx.fillRect(x, groundY - 172, 105, 66);
    ctx.fillStyle = "#45bd58";
    ctx.fillRect(x + 12, groundY - 160, 81, 42);
}

function drawBackground() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const groundY = height - 105;

    const sky = ctx.createLinearGradient(0, 0, 0, groundY);
    sky.addColorStop(0, "#59bdf3");
    sky.addColorStop(1, "#c8efff");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "#ffd34e";
    ctx.beginPath();
    ctx.arc(width - 100, 90, 48, 0, Math.PI * 2);
    ctx.fill();

    drawCloud(130 - (worldOffset * 0.08) % (width + 300), 115, 1);
    drawCloud(560 - (worldOffset * 0.05) % (width + 500), 175, 0.8);
    drawCloud(930 - (worldOffset * 0.07) % (width + 500), 90, 1.15);

    ctx.fillStyle = "#85c95c";
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(0, groundY - 80);
    ctx.quadraticCurveTo(width * 0.22, groundY - 180, width * 0.45, groundY - 65);
    ctx.quadraticCurveTo(width * 0.72, groundY - 180, width, groundY - 70);
    ctx.lineTo(width, groundY);
    ctx.closePath();
    ctx.fill();

    for (let x = -((worldOffset * 0.35) % 420); x < width + 420; x += 420) {
        drawBlockTree(x + 250, groundY);
    }

    ctx.fillStyle = "#58b947";
    ctx.fillRect(0, groundY - 22, width, 38);

    ctx.fillStyle = "#925b30";
    ctx.fillRect(0, groundY + 16, width, height - groundY - 16);

    const blockSize = 46;
    const groundShift = worldOffset % blockSize;
    ctx.strokeStyle = "rgba(82, 43, 17, 0.38)";
    ctx.lineWidth = 2;

    for (let x = -groundShift; x < width + blockSize; x += blockSize) {
        ctx.beginPath();
        ctx.moveTo(x, groundY + 16);
        ctx.lineTo(x, height);
        ctx.stroke();
    }

    for (let y = groundY + 16; y < height; y += blockSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
}

function drawFallbackTruck() {
    ctx.fillStyle = "#1976d2";
    ctx.fillRect(truck.x, truck.y + 38, truck.width, 64);
    ctx.fillStyle = "#ff8f00";
    ctx.fillRect(truck.x + 112, truck.y, 76, 55);
    ctx.fillStyle = "#1e1e1e";

    for (const wheelX of [truck.x + 52, truck.x + 178]) {
        ctx.beginPath();
        ctx.arc(wheelX, truck.y + 110, 30, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawTruck() {
    if (truckImage.complete && truckImage.naturalWidth > 0) {
        ctx.drawImage(truckImage, truck.x, truck.y, truck.width, truck.height);
    } else {
        drawFallbackTruck();
    }
}

function drawStatus() {
    ctx.fillStyle = "rgba(15, 51, 75, 0.82)";
    ctx.fillRect(window.innerWidth - 180, 20, 160, 48);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 19px Arial";
    ctx.textAlign = "center";
    ctx.fillText(gameStarted ? "Racen!" : "Klaar voor start", window.innerWidth - 100, 51);
    ctx.textAlign = "start";
}

function update(deltaSeconds) {
    if (gameStarted) {
        worldOffset += truck.speed * deltaSeconds;
    }
}

function gameLoop(time) {
    const deltaSeconds = Math.min((time - lastTime) / 1000 || 0, 0.05);
    lastTime = time;

    update(deltaSeconds);
    drawBackground();
    drawTruck();
    drawStatus();

    requestAnimationFrame(gameLoop);
}

startButton.addEventListener("click", startGame);
window.addEventListener("resize", resizeCanvas);

resizeCanvas();
requestAnimationFrame(gameLoop);
