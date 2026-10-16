"use strict";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const menu = document.getElementById("menu");
const startButton = document.getElementById("startButton");

const truckImage = new Image();
truckImage.src = "Monstertruck.png";

const truck = {
  x: 105,
  y: 0,
  width: 276,
  height: 170,
  velocityY: 0,
  jumpPower: 930,
  gravity: 1700,
  onGround: true
};

const game = {
  started: false,
  gameOver: false,
  levelComplete: false,
  gameComplete: false,
  levelIndex: 0,
  speedIndex: 0,
  distance: 0,
  score: 0,
  lives: STARTING_LIVES,
  checkpoint: 0,
  lastTime: 0,
  invulnerable: 0,
  shotCooldown: 0,
  message: "",
  messageTime: 0,
  projectiles: [],
  dust: [],
  explosions: [],
  destroyedEnemies: new Set(),
  collectedHearts: new Set(),
  heartBursts: []
};

function currentLevel() {
  return LEVELS[game.levelIndex];
}
