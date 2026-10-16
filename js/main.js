"use strict";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const menu = document.getElementById("menu");
const startButton = document.getElementById("startButton");

const truckImage = new Image();
truckImage.src = "Monstertruck.png";

const SPEEDS = [230, 320, 410, 500, 590];
const SPEED_NAMES = ["RUSTIG", "NORMAAL", "SNEL", "TURBO", "SUPERSNEL"];
const LEVELS = [
  { name: "BLOKKENWEIDE", length: 7600, checkpoints: [0,2700,5200], startSpeed: 0,
    enemies: [{x:1350,t:"crawler"},{x:2450,t:"spikes"},{x:3650,t:"crawler"},{x:4850,t:"spikes"},{x:6100,t:"crawler"}] },
  { name: "WOESTIJNROUTE", length: 8200, checkpoints: [0,2900,5700], startSpeed: 1,
    enemies: [{x:1200,t:"crawler"},{x:2200,t:"spikes"},{x:3350,t:"crawler"},{x:4450,t:"spikes"},{x:5600,t:"crawler"},{x:6900,t:"spikes"}] },
  { name: "IJSBERGEN", length: 8800, checkpoints: [0,3100,6100], startSpeed: 1,
    enemies: [{x:1150,t:"crawler"},{x:2050,t:"spikes"},{x:3100,t:"crawler"},{x:4250,t:"spikes"},{x:5350,t:"crawler"},{x:6550,t:"spikes"},{x:7750,t:"crawler"}] }
];

const truck = { x:105, y:0, width:276, height:170, vy:0, jump:930, gravity:1700, onGround:true };
let started=false, gameOver=false, levelDone=false, gameDone=false;
let levelIndex=0, speedIndex=0, distance=0, score=0, lives=3, checkpoint=0;
let lastTime=0, invulnerable=0, shotCooldown=0, message="", messageTime=0;
let projectiles=[], dust=[], explosions=[];
let destroyed=new Set();

function level(){ return LEVELS[levelIndex]; }
function baseGround(){ return innerHeight-108; }
function terrainY(worldX){
  return baseGround()-Math.sin(worldX/520)*48-Math.sin(worldX/235+1.1)*23-Math.sin(worldX/110+.4)*8;
}
function screenWorldX(x){ return distance+x-truck.x-700; }
function truckGround(){ return terrainY(screenWorldX(truck.x)); }
function slope(worldX){ return Math.atan2(terrainY(worldX+7)-terrainY(worldX-7),14); }

function resizeCanvas(){
  const r=Math.min(devicePixelRatio||1,2);
  canvas.width=Math.round(innerWidth*r); canvas.height=Math.round(innerHeight*r);
  canvas.style.width=innerWidth+"px"; canvas.style.height=innerHeight+"px";
  ctx.setTransform(r,0,0,r,0,0);
  if(truck.onGround) truck.y=truckGround()-truck.height+18;
}
function show(text,time=1){ message=text; messageTime=time; }
function resetLevel(){
  speedIndex=level().startSpeed; distance=level().checkpoints[checkpoint]||0;
  truck.vy=0; truck.onGround=true; truck.y=truckGround()-truck.height+18;
  invulnerable=1.7; projectiles=[]; dust=[]; explosions=[];
}
function startLevel(){ checkpoint=0; levelDone=false; gameOver=false; destroyed.clear(); resetLevel(); show(`LEVEL ${levelIndex+1}: ${level().name}`,1.8); }
function startGame(){ started=true; menu.hidden=true; levelIndex=0; score=0; lives=3; gameDone=false; startLevel(); }
function jump(){ if(started&&!gameOver&&!levelDone&&!gameDone&&truck.onGround){truck.vy=-truck.jump;truck.onGround=false;} }
function changeSpeed(d){ if(!started||gameOver||levelDone||gameDone)return; speedIndex=Math.max(0,Math.min(4,speedIndex+d));show(SPEED_NAMES[speedIndex],.55); }
function shoot(){ if(!started||gameOver||levelDone||gameDone||shotCooldown>0)return; projectiles.push({x:truck.x+truck.width-20,y:truck.y+72,w:38,h:15});shotCooldown=.27; }
function overlap(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;}
function loseLife(){
  if(invulnerable>0||gameOver)return; lives--;
  if(lives<=0){gameOver=true;show("GAME OVER",99);} else {show("BOTSING! TERUG NAAR CHECKPOINT",1.4);resetLevel();}
}
function continueGame(){
  if(levelDone){levelIndex++;lives=3;startLevel();return;}
  if(gameOver||gameDone){levelIndex=0;score=0;lives=3;gameDone=false;startLevel();}
}

function update(dt){
  if(!started||gameOver||levelDone||gameDone)return;
  distance+=SPEEDS[speedIndex]*dt; score=Math.max(score,Math.floor(distance/10)+levelIndex*1000);
  truck.vy+=truck.gravity*dt; truck.y+=truck.vy*dt;
  const floor=truckGround()-truck.height+18;
  if(truck.y>=floor){truck.y=floor;truck.vy=0;truck.onGround=true;}
  invulnerable=Math.max(0,invulnerable-dt); shotCooldown=Math.max(0,shotCooldown-dt); messageTime=Math.max(0,messageTime-dt);
  if(distance>=level().checkpoints[2]&&checkpoint<2){checkpoint=2;show("CHECKPOINT 2!",1);}
  else if(distance>=level().checkpoints[1]&&checkpoint<1){checkpoint=1;show("CHECKPOINT 1!",1);}

  projectiles.forEach(p=>p.x+=760*dt); projectiles=projectiles.filter(p=>p.x<innerWidth+100);
  if(truck.onGround&&Math.random()<.34)dust.push({x:truck.x+30,y:truckGround()-8,vx:-100-Math.random()*90,vy:-25-Math.random()*45,r:7+Math.random()*10,life:.6});
  dust.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=70*dt;p.life-=dt;});dust=dust.filter(p=>p.life>0);
  explosions.forEach(e=>{e.r+=120*dt;e.life-=dt;});explosions=explosions.filter(e=>e.life>0);

  const tb={x:truck.x+38,y:truck.y+40,w:truck.width-76,h:truck.height-55};
  level().enemies.forEach((e,i)=>{
    if(destroyed.has(i))return;
    const ex=e.x-distance+truck.x+700, ew=e.t==="spikes"?84:76, eh=e.t==="spikes"?42:60;
    const eb={x:ex,y:terrainY(e.x)-eh,w:ew,h:eh}; if(overlap(tb,eb))loseLife();
    if(e.t==="crawler") for(let j=projectiles.length-1;j>=0;j--){const p=projectiles[j],ph={x:p.x-18,y:p.y-16,w:p.w+36,h:p.h+32};if(overlap(ph,eb)){destroyed.add(i);projectiles.splice(j,1);explosions.push({x:ex+ew/2,y:eb.y+eh/2,r:12,life:.55});score+=250;show("RAAK! +250",.5);break;}}
  });
  if(distance>=level().length){score+=1000*(levelIndex+1);if(levelIndex<2){levelDone=true;show(`LEVEL ${levelIndex+1} GEHAALD!`,99);}else{gameDone=true;show("ALLE 3 LEVELS GEHAALD!",99);}}
}

function cloud(x,y,s=1,a=.9){ctx.save();ctx.globalAlpha=a;ctx.translate(x,y);ctx.scale(s,s);ctx.fillStyle="white";ctx.beginPath();ctx.arc(0,22,29,0,7);ctx.arc(40,0,39,0,7);ctx.arc(84,21,31,0,7);ctx.rect(0,20,84,34);ctx.fill();ctx.restore();}
function tree(x,y,s=1,v=0){ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.fillStyle="#6d3d1f";ctx.fillRect(42,-145,34,145);ctx.fillStyle=v%2?"#237b38":"#2f943c";if(v%3===2){for(let k=0;k<4;k++){ctx.beginPath();ctx.moveTo(59,-130-k*42);ctx.lineTo(-5+k*8,-45-k*42);ctx.lineTo(123-k*8,-45-k*42);ctx.fill();}}else{ctx.fillRect(-4,-220,124,88);ctx.fillStyle="#4db95b";ctx.fillRect(12,-204,92,55);}ctx.restore();}
function checkerHill(cx,by,rx,ry){ctx.save();ctx.beginPath();ctx.ellipse(cx,by,rx,ry,0,Math.PI,0);ctx.clip();for(let y=by-ry;y<by;y+=32)for(let x=cx-rx;x<cx+rx;x+=32){ctx.fillStyle=(Math.floor(x/32)+Math.floor(y/32))%2?"#53ad39":"#7ccf45";ctx.fillRect(x,y,32,32);}ctx.restore();}
function drawTerrain(fill,edge){const w=innerWidth,h=innerHeight;ctx.fillStyle=fill;ctx.beginPath();ctx.moveTo(0,h);for(let x=0;x<=w+8;x+=8)ctx.lineTo(x,terrainY(screenWorldX(x))+12);ctx.lineTo(w,h);ctx.fill();ctx.strokeStyle=edge;ctx.lineWidth=30;ctx.lineJoin="round";ctx.beginPath();for(let x=-8;x<=w+8;x+=8){const y=terrainY(screenWorldX(x));x===-8?ctx.moveTo(x,y):ctx.lineTo(x,y);}ctx.stroke();}
function grassBackground(){
  const w=innerWidth,h=innerHeight,g=baseGround();let sky=ctx.createLinearGradient(0,0,0,g);sky.addColorStop(0,"#31afea");sky.addColorStop(1,"#dcf7ff");ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);
  ctx.fillStyle="#ffd84d";ctx.beginPath();ctx.arc(w-110,95,47,0,7);ctx.fill();
  cloud(130-(distance*.025)%(w+350),115,1,.9);cloud(700-(distance*.018)%(w+500),185,.75,.75);
  const hs=(distance*.14)%760;for(let x=-420-hs;x<w+760;x+=760){checkerHill(x+240,g+8,270,175);checkerHill(x+590,g+8,180,125);}
  const ts=(distance*.31)%650;for(let x=-220-ts,i=0;x<w+650;x+=650,i++){tree(x+150,g-8,1.05,i);tree(x+430,g-8,.75,i+1);}
  drawTerrain("#8b552d","#61c94c");
}
function dune(cx,by,rx,ry,c){ctx.fillStyle=c;ctx.beginPath();ctx.ellipse(cx,by,rx,ry,0,Math.PI,0);ctx.fill();}
function mesa(x,y,s=1){ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.fillStyle="#a84f2a";ctx.beginPath();ctx.moveTo(-105,0);ctx.lineTo(-72,-115);ctx.lineTo(-35,-160);ctx.lineTo(58,-160);ctx.lineTo(86,-118);ctx.lineTo(112,0);ctx.fill();ctx.fillStyle="#cf6e36";ctx.fillRect(-35,-160,93,24);ctx.restore();}
function pyramid(x,y,s=1){ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.fillStyle="#d9a344";ctx.beginPath();ctx.moveTo(-105,0);ctx.lineTo(0,-155);ctx.lineTo(105,0);ctx.fill();ctx.fillStyle="#b87a2d";ctx.beginPath();ctx.moveTo(0,-155);ctx.lineTo(105,0);ctx.lineTo(22,0);ctx.fill();ctx.restore();}
function cactus(x,y,s=1){ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.fillStyle="#187b43";ctx.fillRect(-13,-118,30,118);ctx.fillRect(-45,-82,34,23);ctx.fillRect(-45,-82,18,48);ctx.fillRect(15,-68,39,23);ctx.fillRect(36,-68,18,47);ctx.fillStyle="#38ad61";ctx.fillRect(-6,-112,7,102);ctx.restore();}
function rock(x,y,s=1){ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.fillStyle="#9d4d2d";ctx.beginPath();ctx.moveTo(-50,0);ctx.lineTo(-35,-42);ctx.lineTo(-4,-66);ctx.lineTo(39,-48);ctx.lineTo(55,0);ctx.fill();ctx.restore();}
function desertBackground(){
  const w=innerWidth,h=innerHeight,g=baseGround();let sky=ctx.createLinearGradient(0,0,0,g);sky.addColorStop(0,"#40b8e8");sky.addColorStop(.58,"#f4cf78");sky.addColorStop(1,"#ffe3a0");ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);
  ctx.fillStyle="#ffd04a";ctx.beginPath();ctx.arc(w-120,105,52,0,7);ctx.fill();
  const ms=(distance*.035)%720;for(let x=-720-ms;x<w+720;x+=720){mesa(x+190,g-95,1.35);mesa(x+520,g-70,.85);}
  const ps=(distance*.075)%980;for(let x=-820-ps;x<w+980;x+=980){pyramid(x+470,g-24,.9);pyramid(x+650,g-18,.57);}
  const ds=(distance*.14)%790;for(let x=-450-ds;x<w+790;x+=790){dune(x+225,g+16,320,150,"#e8b34f");dune(x+625,g+22,220,105,"#d99b3d");}
  const cs=(distance*.31)%720;for(let x=-220-cs;x<w+720;x+=720){cactus(x+150,g-8,.8);cactus(x+410,g-8,1.05);rock(x+590,g-3,.75);}
  drawTerrain("#b66b2b","#e4aa47");
  ctx.save();ctx.globalAlpha=.16;ctx.strokeStyle="#fff0bd";ctx.lineWidth=4;const sh=(performance.now()*.035)%270;for(let y=180;y<h-120;y+=92){let x=w-((y*3+sh)%(w+360));ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-165,y+7);ctx.stroke();}ctx.restore();
}
function background(){levelIndex===1?desertBackground():grassBackground();}

function enemyDraw(e,i){
  if(destroyed.has(i))return;const x=e.x-distance+truck.x+700,y=terrainY(e.x),desert=levelIndex===1;if(x<-140||x>innerWidth+140)return;
  if(e.t==="spikes"){ctx.fillStyle=desert?"#7f4a29":"#c8d2dc";for(let k=0;k<4;k++){ctx.beginPath();ctx.moveTo(x+k*21,y);ctx.lineTo(x+k*21+10,y-42);ctx.lineTo(x+(k+1)*21,y);ctx.fill();}return;}
  ctx.fillStyle=desert?"#8e3d22":"#9a3bc1";ctx.fillRect(x,y-60,76,60);ctx.fillStyle=desert?"#d66a2f":"#d85cf1";ctx.fillRect(x+10,y-60,56,24);ctx.fillStyle="white";ctx.fillRect(x+16,y-51,13,13);ctx.fillRect(x+48,y-51,13,13);ctx.fillStyle="#222";ctx.fillRect(x+21,y-48,6,7);ctx.fillRect(x+50,y-48,6,7);
}
function projectileDraw(){for(const p of projectiles){ctx.fillStyle="#ff8b18";ctx.shadowColor="#ff5a00";ctx.shadowBlur=12;ctx.fillRect(p.x,p.y,p.w,p.h);ctx.shadowBlur=0;}}
function effectsDraw(){for(const p of dust){ctx.globalAlpha=Math.max(0,p.life/.6)*.5;ctx.fillStyle=levelIndex===1?"#e7bd6b":"#d8c295";ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,7);ctx.fill();}ctx.globalAlpha=1;for(const e of explosions){ctx.fillStyle="#ff3b1f";ctx.beginPath();ctx.arc(e.x,e.y,e.r,0,7);ctx.fill();ctx.fillStyle="#ffd21f";ctx.beginPath();ctx.arc(e.x,e.y,e.r*.55,0,7);ctx.fill();}}
function truckDraw(){if(invulnerable>0&&Math.floor(invulnerable*10)%2===0)return;ctx.save();if(truck.onGround){let cx=truck.x+truck.width/2,cy=truck.y+truck.height/2;ctx.translate(cx,cy);ctx.rotate(slope(screenWorldX(truck.x))*.72);ctx.translate(-cx,-cy);}if(truckImage.complete&&truckImage.naturalWidth)ctx.drawImage(truckImage,truck.x,truck.y,truck.width,truck.height);else{ctx.fillStyle="#167bd0";ctx.fillRect(truck.x,truck.y+48,truck.width,75);}ctx.restore();}
function markers(){for(let k=1;k<3;k++){const p=level().checkpoints[k],x=p-distance+truck.x+700,y=terrainY(p);if(x<-100||x>innerWidth+100)continue;ctx.fillStyle="white";ctx.fillRect(x,y-150,10,150);ctx.fillStyle=k<=checkpoint?"#48d05d":"#ffca28";ctx.fillRect(x+10,y-145,78,45);ctx.fillStyle="#173d5d";ctx.font="bold 17px Arial";ctx.fillText(`CP ${k}`,x+23,y-116);}}
function finish(){const x=level().length-distance+truck.x+700,y=terrainY(level().length);if(x<-150||x>innerWidth+150)return;ctx.fillStyle="white";ctx.fillRect(x,y-190,12,190);for(let r=0;r<4;r++)for(let c=0;c<5;c++){ctx.fillStyle=(r+c)%2?"white":"#111";ctx.fillRect(x+12+c*22,y-185+r*22,22,22);}}
function hud(){const w=innerWidth,progress=Math.min(distance/level().length,1);ctx.fillStyle="rgba(8,55,92,.9)";ctx.fillRect(18,18,370,105);ctx.fillRect(w-250,18,232,82);ctx.strokeStyle="white";ctx.lineWidth=3;ctx.strokeRect(18,18,370,105);ctx.strokeRect(w-250,18,232,82);ctx.fillStyle="white";ctx.font="bold 19px Arial";ctx.fillText(`LEVEL ${levelIndex+1}: ${level().name}`,34,43);ctx.font="bold 17px Arial";ctx.fillText(`LEVENS: ${"❤".repeat(lives)}`,34,66);ctx.fillText(`SCORE: ${score}`,34,91);ctx.fillText(`SNELHEID ${speedIndex+1}: ${SPEED_NAMES[speedIndex]}`,w-232,44);ctx.font="14px Arial";ctx.fillText("← langzamer  → sneller  F schieten",w-232,62);ctx.fillStyle="rgba(255,255,255,.25)";ctx.fillRect(w-232,72,195,12);ctx.fillStyle="#ffd23f";ctx.fillRect(w-232,72,195*progress,12);}
function overlay(){if(messageTime<=0&&!gameOver&&!levelDone&&!gameDone)return;ctx.fillStyle="rgba(5,35,58,.84)";ctx.fillRect(innerWidth/2-270,innerHeight/2-75,540,150);ctx.strokeStyle="white";ctx.lineWidth=4;ctx.strokeRect(innerWidth/2-270,innerHeight/2-75,540,150);ctx.fillStyle="white";ctx.textAlign="center";ctx.font="bold 30px Arial";ctx.fillText(message,innerWidth/2,innerHeight/2-4);ctx.font="18px Arial";if(levelDone)ctx.fillText("Druk op Enter voor het volgende level",innerWidth/2,innerHeight/2+38);else if(gameDone)ctx.fillText("Druk op Enter om opnieuw te spelen",innerWidth/2,innerHeight/2+38);else if(gameOver)ctx.fillText("Druk op Enter om opnieuw te beginnen",innerWidth/2,innerHeight/2+38);ctx.textAlign="start";}
function loop(t){const dt=Math.min((t-lastTime)/1000||0,.05);lastTime=t;update(dt);background();markers();finish();level().enemies.forEach(enemyDraw);effectsDraw();projectileDraw();truckDraw();hud();overlay();requestAnimationFrame(loop);}

startButton.addEventListener("click",startGame);
addEventListener("resize",resizeCanvas);
addEventListener("keydown",e=>{if(e.code==="Space"||e.code==="ArrowUp"){e.preventDefault();jump();}else if(e.code==="ArrowRight"){e.preventDefault();changeSpeed(1);}else if(e.code==="ArrowLeft"){e.preventDefault();changeSpeed(-1);}else if(e.code==="KeyF"){e.preventDefault();shoot();}else if(e.code==="Enter")continueGame();});
canvas.addEventListener("pointerdown",jump);
resizeCanvas();
requestAnimationFrame(loop);
