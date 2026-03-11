// Çavuş Game - Music Mode

const lanes = [
document.getElementById("lane0"),
document.getElementById("lane1"),
document.getElementById("lane2"),
document.getElementById("lane3")
];

const music = document.getElementById("game-music");

const hitLineY = 500;

let gameRunning=false;
let mode=null;

let score=0;
let combo=0;
let missCount=0;
let health=50;

let totalHitValue=0;
let totalPossibleValue=0;

let activeNotes=[];

let scrollSpeed=0.35;
let hitWindow=180;

let gameStartTime=0;

// MUSIC MODE BEATMAP
// time = milisaniye
// lane = 0 sol,1 aşağı,2 yukarı,3 sağ

const musicChart = [

{time:1000,lane:0},
{time:1500,lane:1},
{time:2000,lane:2},
{time:2500,lane:3},

{time:3000,lane:0},
{time:3500,lane:1},
{time:4000,lane:2},
{time:4500,lane:3},

{time:5000,lane:1},
{time:5500,lane:2},
{time:6000,lane:0},
{time:6500,lane:3}

];

const menu=document.getElementById("menu");
const hud=document.getElementById("hud");
const gameArea=document.getElementById("game");

// oyun başlat
function startMusicMode(){

resetGame();

activeNotes=[];

musicChart.forEach(n=>{

activeNotes.push({

time:n.time,
lane:n.lane,
hit:false,
element:null

});

});

menu.style.display="none";
hud.style.display="block";
gameArea.style.display="flex";

music.currentTime=0;
music.play();

gameStartTime=performance.now();

gameRunning=true;

requestAnimationFrame(gameLoop);

}

function resetGame(){

score=0;
combo=0;
missCount=0;
health=50;

totalHitValue=0;
totalPossibleValue=0;

lanes.forEach(l=>l.innerHTML="");

updateHUD();

}

function spawnNote(note){

const el=document.createElement("div");

el.classList.add("note");

lanes[note.lane].appendChild(el);

note.element=el;

}

function gameLoop(){

if(!gameRunning)return;

const currentTime=music.currentTime*1000;

activeNotes.forEach(note=>{

if(!note.element && currentTime>=note.time-2000){

spawnNote(note);

}

if(note.element && !note.hit){

const y=hitLineY-(note.time-currentTime)*scrollSpeed;

note.element.style.top=y+"px";

if(y>hitLineY+50){

registerMiss(note);

}

}

});

updateHUD();

if(activeNotes.length>0 && activeNotes.every(n=>n.hit)){

endGame();

}

requestAnimationFrame(gameLoop);

}

document.addEventListener("keydown",e=>{

if(!gameRunning)return;

const keyMap={

ArrowLeft:0,
ArrowDown:1,
ArrowUp:2,
ArrowRight:3

};

if(!(e.key in keyMap))return;

const lane=keyMap[e.key];

const currentTime=music.currentTime*1000;

activeNotes.forEach(note=>{

if(note.lane===lane && !note.hit && note.element){

const diff=Math.abs(note.time-currentTime);

if(diff<hitWindow){

registerHit(note,diff);

}

}

});

});

function registerHit(note,diff){

note.hit=true;

if(note.element)note.element.remove();

let value=350;

if(diff>150)value=100;
else if(diff>100)value=200;
else if(diff>50)value=300;

score+=value;

combo++;

totalHitValue+=value;

totalPossibleValue+=350;

health=Math.min(health+2,100);

}

function registerMiss(note){

note.hit=true;

if(note.element)note.element.remove();

combo=0;

missCount++;

health-=10;

if(health<=0){

failGame();

}

}

function updateHUD(){

document.getElementById("score").innerText="Score: "+score;

document.getElementById("combo").innerText="Combo: "+combo;

document.getElementById("miss").innerText="Miss: "+missCount;

const acc=totalPossibleValue===0?100:(totalHitValue/totalPossibleValue)*100;

document.getElementById("accuracy").innerText="Accuracy: "+acc.toFixed(2)+"%";

document.getElementById("health-bar").style.width=health+"%";

}

function failGame(){

gameRunning=false;

music.pause();

alert("FAILED");

location.reload();

}

function endGame(){

gameRunning=false;

music.pause();

alert("SONG COMPLETE");

location.reload();

}
