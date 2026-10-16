const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let gameStarted = false;

const truck = {
    x: 100,
    y: canvas.height - 220,
    speed: 4
};

document
    .getElementById("startButton")
    .addEventListener("click", startGame);

function startGame() {
    gameStarted = true;
    document.getElementById("menu").style.display = "none";
}

function drawBackground() {

    ctx.fillStyle = "#7fd3ff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#4CAF50";
    ctx.fillRect(
        0,
        canvas.height - 150,
        canvas.width,
        150
    );

    drawCloud(150, 100);
    drawCloud(500, 150);
    drawCloud(900, 120);
}

function drawCloud(x, y) {

    ctx.fillStyle = "white";

    ctx.beginPath();
    ctx.arc(x, y, 30, 0, Math.PI * 2);
    ctx.arc(x + 40, y, 40, 0, Math.PI * 2);
    ctx.arc(x + 80, y, 30, 0, Math.PI * 2);
    ctx.fill();
}

function drawTruck() {

    ctx.fillStyle = "#2196F3";
    ctx.fillRect(
        truck.x,
        truck.y,
        180,
        60
    );

    ctx.fillStyle = "#FF9800";
    ctx.fillRect(
        truck.x + 90,
        truck.y - 40,
        60,
        40
    );

    ctx.fillStyle = "#222";

    ctx.beginPath();
    ctx.arc(
        truck.x + 40,
        truck.y + 65,
        28,
        0,
        Math.PI * 2
    );
    ctx.fill();

    ctx.beginPath();
    ctx.arc(
        truck.x + 140,
        truck.y + 65,
        28,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

function update() {

    if (gameStarted) {

        truck.x += truck.speed;

        if (truck.x > canvas.width) {
            truck.x = -200;
        }
    }
}

function draw() {
    drawBackground();
    drawTruck();
}

function gameLoop() {

    update();
    draw();

    requestAnimationFrame(gameLoop);
}

gameLoop();
