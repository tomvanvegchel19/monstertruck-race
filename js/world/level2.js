
"use strict";

function drawMesa(x, groundY, scale = 1) {
  ctx.save();
  ctx.translate(x, groundY);
  ctx.scale(scale, scale);
  ctx.fillStyle = "#b85e2c";
  ctx.fillRect(-90, -180, 180, 180);
  ctx.fillStyle = "#d78343";
  ctx.fillRect(-70, -220, 140, 50);
  ctx.restore();
}

function drawPyramid(x, groundY, scale = 1) {
  ctx.save();
  ctx.translate(x, groundY);
  ctx.scale(scale, scale);
  ctx.fillStyle = "#e8c15c";
  ctx.beginPath();
  ctx.moveTo(-120, 0);
  ctx.lineTo(0, -170);
  ctx.lineTo(120, 0);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawOasis(x, y) {
  ctx.fillStyle = '#36c6e8';
  ctx.beginPath();
  ctx.ellipse(x, y, 80, 28, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawGiantCactus(x, groundY, scale=1) {
  ctx.save();
  ctx.translate(x, groundY);
  ctx.scale(scale, scale);
  ctx.fillStyle='#2fa34c';
  ctx.fillRect(-15,-120,30,120);
  ctx.fillRect(-45,-90,20,60);
  ctx.fillRect(25,-70,20,55);
  ctx.restore();
}

function drawSkull(x,y){
  ctx.fillStyle='#f3ead0';
  ctx.fillRect(x,y,24,18);
  ctx.fillRect(x+6,y+18,12,8);
}

function drawDesertWorld() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const ground = baseGroundY();

  const sky = ctx.createLinearGradient(0,0,0,ground);
  sky.addColorStop(0,'#2ea9ea');
  sky.addColorStop(0.7,'#9be2ff');
  sky.addColorStop(1,'#f5d37f');
  ctx.fillStyle = sky;
  ctx.fillRect(0,0,width,height);

  ctx.fillStyle='#ffd84d';
  ctx.beginPath();
  ctx.arc(width-120,90,55,0,Math.PI*2);
  ctx.fill();

  const mesaShift=(game.distance*0.04)%1400;
  for(let x=-1400-mesaShift;x<width+1400;x+=1400){
    drawMesa(x+300, ground-20, 1.4);
    drawMesa(x+900, ground, 0.8);
  }

  const pyramidShift=(game.distance*0.03)%2200;
  for(let x=-2200-pyramidShift;x<width+2200;x+=2200){
    drawPyramid(x+1200, ground-10, 1.2);
  }

  const oasisShift=(game.distance*0.08)%1800;
  for(let x=-1800-oasisShift;x<width+1800;x+=1800){
    drawOasis(x+700, ground-40);
  }

  drawTerrain('#b6682c','#efc15d');

  const detailShift=(game.distance*0.6)%400;
  for(let x=-400-detailShift, i=0;x<width+400;x+=400,i++){
    const y=terrainY(screenToWorldX(x+120));
    drawGiantCactus(x+120,y,0.8 + (i%3)*0.2);
    if(i%2===0) drawSkull(x+220,y-15);
  }
}
