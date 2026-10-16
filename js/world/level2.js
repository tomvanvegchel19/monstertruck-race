"use strict";

function drawRoundedHill(cx, baseY, rx, ry, color, dotsColor) {
  ctx.save();ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(cx,baseY,rx,ry,0,Math.PI,0);ctx.fill();ctx.clip();
  ctx.fillStyle=dotsColor;for(let i=0;i<10;i++){const px=cx-rx+30+(i*83)%(rx*2-60);const py=baseY-28-(i*47)%Math.max(35,ry-35);ctx.beginPath();ctx.arc(px,py,8+(i%3)*3,0,Math.PI*2);ctx.fill();}
  ctx.restore();
}

function drawColorfulCloud(x,y,scale=1){ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(0,20,28,0,Math.PI*2);ctx.arc(36,0,38,0,Math.PI*2);ctx.arc(78,20,29,0,Math.PI*2);ctx.rect(0,18,78,32);ctx.fill();ctx.fillStyle="#74bff0";ctx.fillRect(17,31,8,6);ctx.fillRect(55,31,8,6);ctx.restore();}

function drawColorfulPipe(x,groundY,scale=1,color="#38b54a"){
  ctx.save();ctx.translate(x,groundY);ctx.scale(scale,scale);ctx.fillStyle=color;ctx.fillRect(-28,-80,56,80);ctx.fillStyle="#56d765";ctx.fillRect(-18,-78,13,76);ctx.fillStyle=color;ctx.fillRect(-40,-95,80,24);ctx.fillStyle="rgba(255,255,255,.22)";ctx.fillRect(-28,-91,17,16);ctx.strokeStyle="#176928";ctx.lineWidth=4;ctx.strokeRect(-40,-95,80,24);ctx.restore();
}

function drawQuestionBlock(x,y,scale=1){ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);ctx.fillStyle="#f4b52c";ctx.fillRect(-24,-24,48,48);ctx.strokeStyle="#b86b17";ctx.lineWidth=4;ctx.strokeRect(-24,-24,48,48);ctx.fillStyle="#fff5c4";ctx.font="bold 34px Arial";ctx.textAlign="center";ctx.fillText("?",0,13);ctx.textAlign="start";ctx.restore();}

function drawBrickPlatform(x,y,blocks=4){for(let i=0;i<blocks;i++){ctx.fillStyle=i%2?"#c75c2e":"#df7040";ctx.fillRect(x+i*42,y,42,32);ctx.strokeStyle="#87371e";ctx.lineWidth=3;ctx.strokeRect(x+i*42,y,42,32);ctx.beginPath();ctx.moveTo(x+i*42+21,y);ctx.lineTo(x+i*42+21,y+16);ctx.stroke();}}

function drawPalm(x,groundY,scale=1){ctx.save();ctx.translate(x,groundY);ctx.scale(scale,scale);ctx.strokeStyle="#9a5a2e";ctx.lineWidth=18;ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(18,-70,2,-145);ctx.stroke();for(let i=0;i<6;i++){ctx.save();ctx.translate(2,-145);ctx.rotate((Math.PI*2/6)*i);ctx.fillStyle=i%2?"#41b84f":"#2e9f43";ctx.beginPath();ctx.ellipse(32,0,39,12,0,0,Math.PI*2);ctx.fill();ctx.restore();}ctx.fillStyle="#80502b";ctx.beginPath();ctx.arc(-8,-138,8,0,Math.PI*2);ctx.arc(9,-137,8,0,Math.PI*2);ctx.fill();ctx.restore();}

function drawColorfulArch(x,groundY,scale=1){ctx.save();ctx.translate(x,groundY);ctx.scale(scale,scale);ctx.strokeStyle="#e95d3d";ctx.lineWidth=34;ctx.beginPath();ctx.arc(0,-32,82,Math.PI,0);ctx.stroke();ctx.strokeStyle="#ffd54a";ctx.lineWidth=9;ctx.beginPath();ctx.arc(0,-32,82,Math.PI,0);ctx.stroke();ctx.restore();}

function drawPlatformFlowers(width){const shift=(game.distance*.68)%240;const colors=["#ff4d67","#ffd23f","#735bea"];
  for(let x=-240-shift,i=0;x<width+240;x+=240,i++){const y=terrainY(screenToWorldX(x+90));if(i%3===0)drawColorfulPipe(x+90,y,0.65,i%2?"#e44652":"#38b54a");else if(i%3===1){for(let f=0;f<4;f++){ctx.strokeStyle="#26863b";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x+70+f*16,y);ctx.lineTo(x+70+f*16,y-22);ctx.stroke();ctx.fillStyle=colors[f%3];ctx.beginPath();ctx.arc(x+70+f*16,y-25,6,0,Math.PI*2);ctx.fill();}}else drawQuestionBlock(x+100,y-34,.72);}
}

function drawDesertWorld() {
  const width=window.innerWidth,height=window.innerHeight,ground=baseGroundY();
  const sky=ctx.createLinearGradient(0,0,0,ground);sky.addColorStop(0,"#37b7f0");sky.addColorStop(.72,"#9ee8ff");sky.addColorStop(1,"#f8f2aa");ctx.fillStyle=sky;ctx.fillRect(0,0,width,height);
  ctx.fillStyle="#ffe05b";ctx.beginPath();ctx.arc(width-118,98,51,0,Math.PI*2);ctx.fill();
  drawColorfulCloud(165-(game.distance*.025)%(width+400),135,.9);drawColorfulCloud(770-(game.distance*.018)%(width+520),205,.7);

  const far=(game.distance*.055)%850;
  for(let x=-700-far;x<width+850;x+=850){drawRoundedHill(x+250,ground+16,300,175,"#72ce58","#4aa943");drawRoundedHill(x+655,ground+19,225,120,"#f3c64d","#e09b35");}

  const platforms=(game.distance*.13)%980;
  for(let x=-800-platforms;x<width+980;x+=980){drawBrickPlatform(x+420,ground-285,5);drawQuestionBlock(x+650,ground-316,.85);drawColorfulArch(x+810,ground-20,.8);}

  const palms=(game.distance*.29)%730;
  for(let x=-240-palms,g=0;x<width+730;x+=730,g++){drawPalm(x+145,ground-6,.82);drawPalm(x+390,ground-5,1.02);drawColorfulPipe(x+570,ground-4,.84,g%2?"#e94e57":"#37b94a");}

  drawTerrain("#c97732","#efbd4e");
  drawPlatformFlowers(width);
}
