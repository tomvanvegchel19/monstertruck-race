"use strict";

function drawCloud(x, y, scale = 1, alpha = 0.9) {
  ctx.save(); ctx.globalAlpha = alpha; ctx.translate(x, y); ctx.scale(scale, scale);
  ctx.fillStyle = "#f8fdff";
  ctx.fillRect(-15, 10, 28, 28); ctx.fillRect(12, -4, 42, 42); ctx.fillRect(50, 10, 34, 28);
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
  const width=window.innerWidth,height=window.innerHeight,ground=baseGroundY();
  const sky=ctx.createLinearGradient(0,0,0,ground);sky.addColorStop(0,"#38b8eb");sky.addColorStop(1,"#d8f6ff");ctx.fillStyle=sky;ctx.fillRect(0,0,width,height);
  ctx.fillStyle="#ffd74a";ctx.fillRect(width-152,60,92,92);ctx.fillStyle="rgba(255,255,255,.18)";ctx.fillRect(width-143,69,24,24);
  drawCloud(130-(game.distance*.025)%(width+350),120,1,.9);drawCloud(720-(game.distance*.018)%(width+520),190,.78,.72);

  const far=(game.distance*.055)%720;
  for(let x=-620-far;x<width+720;x+=720){drawBlockHill(x+270,ground+12,500,250,1);drawBlockHill(x+660,ground+18,330,150,3);}

  const waterShift=(game.distance*.11)%1400;
  for(let x=-1050-waterShift;x<width+1400;x+=1400){
    ctx.fillStyle="#63c44b";ctx.fillRect(x+760,ground-345,180,28);ctx.fillStyle="#81502d";ctx.beginPath();ctx.moveTo(x+770,ground-317);ctx.lineTo(x+850,ground-235);ctx.lineTo(x+930,ground-317);ctx.fill();drawBlockWaterfall(x+833,ground-317,154,36);
  }

  const trees=(game.distance*.31)%720;
  for(let x=-260-trees,g=0;x<width+720;x+=720,g++){drawBlockTree(x+125,ground-8,1.08,g);drawBlockTree(x+380,ground-8,.78,g+1);drawBlockCave(x+590,ground-6,.78);drawOreBlock(x+675,ground-55,g%2?"#ffd23e":"#42e8f2");}

  drawTerrain("#81502e","#62c84c");
  drawBlockDetails(width);
}
