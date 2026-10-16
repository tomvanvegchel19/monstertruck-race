"use strict";

function drawCloud(x, y, scale = 1, alpha = 0.9) {
  ctx.save(); ctx.globalAlpha = alpha; ctx.translate(x, y); ctx.scale(scale, scale);
  ctx.fillStyle = "#f8fdff";
  ctx.fillRect(-15, 10, 28, 28); ctx.fillRect(12, -4, 42, 42); ctx.fillRect(50, 10, 34, 28);
  ctx.restore();
}

function drawEpicMountain(x, groundY, scale = 1, hasLava = false) {
  ctx.save();
  ctx.translate(x, groundY);
  ctx.scale(scale, scale);

  ctx.fillStyle = "#4f6265";
  ctx.beginPath();
  ctx.moveTo(-245, 0);
  ctx.lineTo(0, -390);
  ctx.lineTo(260, 0);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#687b7d";
  ctx.beginPath();
  ctx.moveTo(-245, 0);
  ctx.lineTo(0, -390);
  ctx.lineTo(-35, -170);
  ctx.lineTo(-105, -50);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#edfaff";
  ctx.beginPath();
  ctx.moveTo(0, -390);
  ctx.lineTo(72, -278);
  ctx.lineTo(24, -302);
  ctx.lineTo(-3, -264);
  ctx.lineTo(-48, -298);
  ctx.lineTo(-91, -270);
  ctx.closePath();
  ctx.fill();

  if (hasLava) {
    ctx.strokeStyle = "#ff4b1f";
    ctx.lineWidth = 14;
    ctx.shadowColor = "#ff9d21";
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.moveTo(5, -377);
    ctx.lineTo(32, -294);
    ctx.lineTo(12, -218);
    ctx.lineTo(49, -126);
    ctx.lineTo(58, -28);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  ctx.restore();
}

function drawFloatingBlockIsland(x, y, scale = 1, variant = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  ctx.fillStyle = "#68c84e";
  ctx.fillRect(-110, -15, 220, 30);
  ctx.strokeStyle = "#348936";
  ctx.lineWidth = 3;
  ctx.strokeRect(-110, -15, 220, 30);

  ctx.fillStyle = variant % 2 ? "#875330" : "#79502f";
  ctx.beginPath();
  ctx.moveTo(-100, 15);
  ctx.lineTo(0, 120);
  ctx.lineTo(100, 15);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "rgba(57,31,15,.32)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-52, 20);
  ctx.lineTo(0, 100);
  ctx.lineTo(52, 20);
  ctx.stroke();

  drawBlockTree(-20, -15, 0.58, variant);
  drawOreBlock(35, -1, variant % 2 ? "#ffd23e" : "#42e8f2");
  ctx.restore();
}

function drawBlockCastle(x, groundY, scale = 1) {
  ctx.save();
  ctx.translate(x, groundY);
  ctx.scale(scale, scale);

  ctx.fillStyle = "#77838a";
  ctx.fillRect(-65, -170, 130, 170);
  ctx.fillRect(-118, -230, 53, 230);
  ctx.fillRect(65, -230, 53, 230);

  ctx.fillStyle = "#919da3";
  for (const towerX of [-118, 65]) {
    ctx.fillRect(towerX, -252, 18, 25);
    ctx.fillRect(towerX + 35, -252, 18, 25);
  }
  ctx.fillRect(-65, -194, 25, 25);
  ctx.fillRect(-12, -194, 25, 25);
  ctx.fillRect(40, -194, 25, 25);

  ctx.fillStyle = "#26323a";
  ctx.fillRect(-20, -78, 40, 78);
  ctx.fillRect(-100, -176, 18, 35);
  ctx.fillRect(82, -176, 18, 35);

  ctx.fillStyle = "#42d8ef";
  ctx.fillRect(-95, -169, 8, 21);
  ctx.fillRect(87, -169, 8, 21);
  ctx.restore();
}

function drawBlockVillage(x, groundY, scale = 1) {
  ctx.save();
  ctx.translate(x, groundY);
  ctx.scale(scale, scale);

  for (let house = 0; house < 3; house++) {
    const hx = house * 105;
    ctx.fillStyle = house % 2 ? "#b78348" : "#9b6b3e";
    ctx.fillRect(hx, -70, 86, 70);
    ctx.fillStyle = "#6e3c24";
    ctx.beginPath();
    ctx.moveTo(hx - 10, -70);
    ctx.lineTo(hx + 43, -118);
    ctx.lineTo(hx + 96, -70);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#2c3b43";
    ctx.fillRect(hx + 34, -35, 19, 35);
    ctx.fillStyle = "#ffd45a";
    ctx.fillRect(hx + 9, -54, 17, 17);
    ctx.fillRect(hx + 60, -54, 17, 17);
  }
  ctx.restore();
}

function drawBlockSheep(x, groundY, scale = 1) {
  ctx.save();
  ctx.translate(x, groundY);
  ctx.scale(scale, scale);
  ctx.fillStyle = "#f5f5f1";
  ctx.fillRect(-25, -36, 52, 31);
  ctx.fillStyle = "#383838";
  ctx.fillRect(20, -31, 22, 22);
  ctx.fillRect(-18, -5, 7, 17);
  ctx.fillRect(13, -5, 7, 17);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(25, -27, 5, 5);
  ctx.fillStyle = "#111";
  ctx.fillRect(27, -26, 2, 2);
  ctx.restore();
}

function drawBlockBird(x, y, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = "#263b49";
  ctx.fillRect(-3, -3, 6, 6);
  ctx.fillRect(-21, -8, 18, 5);
  ctx.fillRect(3, -8, 18, 5);
  ctx.restore();
}

function drawBlockHill(cx, baseY, width, height, seed = 0) {
  const block = 32;
  for (let x = cx - width / 2; x < cx + width / 2; x += block) {
    const relative = Math.abs((x - cx) / (width / 2));
    const columnHeight = Math.max(0, Math.floor((1 - relative * relative) * height / block));
    for (let row = 0; row < columnHeight; row++) {
      const y = baseY - (row + 1) * block;
      ctx.fillStyle = row === columnHeight - 1 ? ((Math.floor(x / block) + seed) % 2 ? "#66c64c" : "#79d65a") : ((row + seed) % 2 ? "#80502e" : "#925d36");
      ctx.fillRect(x, y, block, block);
      ctx.strokeStyle = "rgba(45,28,15,.28)"; ctx.strokeRect(x, y, block, block);
      if (row === columnHeight - 1) { ctx.fillStyle = "rgba(255,255,255,.16)"; ctx.fillRect(x + 4, y + 4, block - 8, 6); }
    }
  }
}

function drawBlockTree(x, groundY, scale = 1, variant = 0) {
  ctx.save(); ctx.translate(x, groundY); ctx.scale(scale, scale);
  const trunk = variant % 2 ? "#7b4d27" : "#69401f";
  ctx.fillStyle = trunk; ctx.fillRect(-19, -126, 38, 126);
  ctx.fillStyle = "rgba(255,255,255,.14)"; ctx.fillRect(-13, -122, 9, 116);
  const dark = variant % 3 === 2 ? "#176f3b" : "#237f3d";
  const mid = variant % 3 === 1 ? "#3ca94e" : "#36a34b";
  [[-66,-210,132,50],[-53,-164,106,48],[-40,-120,80,35]].forEach(([a,b,w,h],i)=>{ctx.fillStyle=i===0?dark:mid;ctx.fillRect(a,b,w,h);ctx.strokeStyle="rgba(15,72,30,.28)";ctx.strokeRect(a,b,w,h);});
  if (variant % 4 === 3) { [[-30,-184],[20,-174],[2,-139]].forEach(([fx,fy])=>{ctx.fillStyle="#ef454d";ctx.fillRect(fx,fy,12,12);ctx.fillStyle="#ffdc51";ctx.fillRect(fx+4,fy-4,4,4);}); }
  ctx.restore();
}

function drawBlockCave(x, groundY, scale = 1) {
  ctx.save(); ctx.translate(x, groundY); ctx.scale(scale, scale);
  const block = 28;
  for (let row = 0; row < 4; row++) for (let col = -3; col <= 3; col++) {
    if (row > 1 && Math.abs(col) < 2) continue;
    ctx.fillStyle = (row + col) % 2 ? "#65727a" : "#77858c";
    ctx.fillRect(col * block, -block * (row + 1), block, block); ctx.strokeStyle="#434d52";ctx.strokeRect(col*block,-block*(row+1),block,block);
  }
  ctx.fillStyle="#17252d";ctx.fillRect(-block,-block*2,block*3,block*2);
  ctx.restore();
}

function drawOreBlock(x, y, color) {
  ctx.fillStyle="#5d666c";ctx.fillRect(x,y,44,44);ctx.strokeStyle="#394248";ctx.lineWidth=3;ctx.strokeRect(x,y,44,44);
  ctx.fillStyle=color;[[7,8,11,10],[26,6,9,13],[18,27,14,10],[5,31,8,7]].forEach(v=>ctx.fillRect(x+v[0],y+v[1],v[2],v[3]));
}

function drawBlockWaterfall(x, y, height, width = 44) {
  const shift=(performance.now()*.07)%24;
  ctx.fillStyle="#2f9ed0";ctx.fillRect(x,y,width,height);ctx.fillStyle="#72ddff";ctx.fillRect(x+9,y,width-18,height);
  ctx.strokeStyle="rgba(255,255,255,.7)";ctx.lineWidth=3;
  for(let line=8;line<width;line+=14){ctx.beginPath();ctx.moveTo(x+line,y-shift);ctx.lineTo(x+line,y+height);ctx.stroke();}
  ctx.fillStyle="#d9f9ff";for(let i=0;i<5;i++)ctx.fillRect(x+i*(width/5),y+height-5,10,10);
}

function drawBlockDetails(width) {
  const shift=(game.distance*.72)%280;
  for(let x=-280-shift,i=0;x<width+280;x+=280,i++){
    const y=terrainY(screenToWorldX(x+100));
    if(i%4===0){ctx.fillStyle="#7a4b27";ctx.fillRect(x+76,y-24,52,20);ctx.fillStyle="#9b6538";ctx.fillRect(x+70,y-29,64,8);}
    else if(i%4===1){drawOreBlock(x+75,y-48,"#40e4ef");}
    else if(i%4===2){ctx.fillStyle="#d94352";ctx.fillRect(x+84,y-26,28,18);ctx.fillStyle="#f4e5cf";ctx.fillRect(x+92,y-8,7,8);ctx.fillRect(x+105,y-8,7,8);}
    else {ctx.fillStyle="#6d7480";ctx.fillRect(x+78,y-24,46,24);ctx.fillStyle="#9da5ac";ctx.fillRect(x+84,y-30,29,10);}
  }
}

function drawGrasslandWorld() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const ground = baseGroundY();

  const sky = ctx.createLinearGradient(0, 0, 0, ground);
  sky.addColorStop(0, "#249fd8");
  sky.addColorStop(0.62, "#8cddf5");
  sky.addColorStop(1, "#d8f6ff");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "rgba(255,215,74,.28)";
  ctx.fillRect(width - 169, 43, 126, 126);
  ctx.fillStyle = "#ffd74a";
  ctx.fillRect(width - 152, 60, 92, 92);
  ctx.fillStyle = "rgba(255,255,255,.22)";
  ctx.fillRect(width - 143, 69, 24, 24);

  drawCloud(130 - (game.distance * 0.025) % (width + 350), 120, 1, 0.9);
  drawCloud(720 - (game.distance * 0.018) % (width + 520), 190, 0.78, 0.72);

  const mountainShift = (game.distance * 0.025) % 1250;
  for (let x = -1250 - mountainShift, index = 0; x < width + 1250; x += 1250, index++) {
    drawEpicMountain(x + 400, ground - 25, 1.12, index % 3 === 1);
    drawEpicMountain(x + 930, ground - 8, 0.72, false);
  }

  const villageShift = (game.distance * 0.045) % 1750;
  for (let x = -1500 - villageShift; x < width + 1750; x += 1750) {
    drawBlockVillage(x + 780, ground - 38, 0.56);
  }

  const islandShift = (game.distance * 0.06) % 1800;
  for (let x = -1800 - islandShift, index = 0; x < width + 1800; x += 1800, index++) {
    drawFloatingBlockIsland(x + 650, 200, 0.82, index);
    drawBlockWaterfall(x + 632, 213, 138, 34);
  }

  const hillShift = (game.distance * 0.055) % 720;
  for (let x = -620 - hillShift; x < width + 720; x += 720) {
    drawBlockHill(x + 270, ground + 12, 500, 250, 1);
    drawBlockHill(x + 660, ground + 18, 330, 150, 3);
  }

  const castleShift = (game.distance * 0.12) % 2200;
  for (let x = -1800 - castleShift; x < width + 2200; x += 2200) {
    drawBlockCastle(x + 1250, ground - 22, 0.78);
  }

  const trees = (game.distance * 0.31) % 720;
  for (let x = -260 - trees, group = 0; x < width + 720; x += 720, group++) {
    drawBlockTree(x + 125, ground - 8, 1.08, group);
    drawBlockTree(x + 380, ground - 8, 0.78, group + 1);
    drawBlockCave(x + 590, ground - 6, 0.78);
    drawOreBlock(x + 675, ground - 55, group % 2 ? "#ffd23e" : "#42e8f2");
  }

  drawTerrain("#81502e", "#62c84c");
  drawBlockDetails(width);

  const animalShift = (game.distance * 0.59) % 540;
  for (let x = -540 - animalShift, index = 0; x < width + 540; x += 540, index++) {
    const sheepY = terrainY(screenToWorldX(x + 180));
    if (index % 2 === 0) drawBlockSheep(x + 180, sheepY - 2, 0.75);
  }

  const birdTime = performance.now() * 0.035;
  for (let index = 0; index < 7; index++) {
    const birdX = width - ((game.distance * 0.1 + birdTime + index * 220) % (width + 300));
    drawBlockBird(birdX, 110 + (index % 3) * 52, 0.85 + (index % 2) * 0.3);
  }
}
