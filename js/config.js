"use strict";

const SPEEDS = [230, 320, 410, 500, 590];
const SPEED_NAMES = ["RUSTIG", "NORMAAL", "SNEL", "TURBO", "SUPERSNEL"];
const STARTING_LIVES = 5;
const MAX_LIVES = 7;

const LEVELS = [
  {
    name: "BLOKKENWEIDE",
    length: 7600,
    checkpoints: [0, 2700, 5200],
    startSpeed: 0,
    world: "grassland",
    hearts: [{ x: 1850, height: 165 }, { x: 4350, height: 195 }, { x: 6650, height: 175 }],
    enemies: [
      { x: 1350, type: "crawler" },
      { x: 2450, type: "spikes" },
      { x: 3650, type: "crawler" },
      { x: 4850, type: "spikes" },
      { x: 6100, type: "crawler" }
    ]
  },
  {
    name: "WOESTIJNROUTE",
    length: 8200,
    checkpoints: [0, 2900, 5700],
    startSpeed: 1,
    world: "desert",
    hearts: [{ x: 1650, height: 175 }, { x: 3900, height: 205 }, { x: 7100, height: 185 }],
    enemies: [
      { x: 1200, type: "crawler" },
      { x: 2200, type: "spikes" },
      { x: 3350, type: "crawler" },
      { x: 4450, type: "spikes" },
      { x: 5600, type: "crawler" },
      { x: 6900, type: "spikes" }
    ]
  },
  {
    name: "IJSBERGEN",
    length: 8800,
    checkpoints: [0, 3100, 6100],
    startSpeed: 1,
    world: "ice",
    hearts: [{ x: 1500, height: 180 }, { x: 4700, height: 215 }, { x: 7350, height: 190 }],
    enemies: [
      { x: 1150, type: "crawler" },
      { x: 2050, type: "spikes" },
      { x: 3100, type: "crawler" },
      { x: 4250, type: "spikes" },
      { x: 5350, type: "crawler" },
      { x: 6550, type: "spikes" },
      { x: 7750, type: "crawler" }
    ]
  }
];
