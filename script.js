// Çavuş Game - Düzeltilmiş Script (Story Mode Fix)

const lanes = [
    document.getElementById("lane0"),
    document.getElementById("lane1"),
    document.getElementById("lane2"),
    document.getElementById("lane3")
];

const hitLineY = 500;

let gameRunning = false;
let mode = null;
let difficulty = 2;

let score = 0;
let combo = 0;
let maxCombo = 0;
let missCount = 0;
let health = 50;

let totalHitValue = 0;
let totalPossibleValue = 0;

let activeNotes = [];

let bpm = 120;
let beatDuration;
let scrollSpeed;
let hitWindow;

let gameStartTime = 0;

const difficulties = [
    { name: "Easy", level: 1, bpm: 90 },
    { name: "Normal", level: 2, bpm: 120 },
    { name: "Hard", level: 3, bpm: 150 },
    { name: "Insane", level: 4, bpm: 170 },
    { name: "Extreme", level: 5, bpm: 190 },
    { name: "Terrifying", level: 6, bpm: 210 }
];

const difficultyContainer = document.getElementById("difficulty-buttons");
const menu = document.getElementById("menu");
const difficultySelection = document.getElementById("difficulty-selection");
const hud = document.getElementById("hud");
const gameArea = document.getElementById("game");

const beatmaps = {

1: [
{time:0,lane:0},
{time:600,lane:1},
{time:1200,lane:2},
{time:1800,lane:3},
{time:2400,lane:0},
{time:3000,lane:1},
{time:3600,lane:2},
{time:4200,lane:3}
],

2: [
{time:0,lane:0},
{time:500,lane:1},
{time:1000,lane:2},
{time:1500,lane:3},
{time:2000,lane:1},
{time:2500,lane:2},
{time:3000,lane:0},
{time:3500,lane:3}
],

3: [
{time:0,lane:0},
{time:400,lane:1},
{time:800,lane:2},
{time:1200,lane:3},
{time:1600,lane:0},
{time:2000,lane:2},
{time:2400,lane:1},
{time:2800,lane:3}
]

};

// Menüde difficulty butonları oluştur
difficulties.forEach(diff => {

    const btn = document.createElement("button");
    btn.innerText = diff.name;

    btn.onclick = () => {
        setDifficulty(diff);
        startGame(mode);
    };

    difficultyContainer.appendChild(btn);

});

document.getElementById("storyBtn").onclick = () => {

    mode = "story";

    difficultySelection.style.display = "block";

    document.getElementById("storyBtn").style.display = "none";
    document.getElementById("endlessBtn").style.display = "none";

};

document.getElementById("endlessBtn").onclick = () => {

    mode = "endless";

    difficultySelection.style.display = "block";

    document.getElementById("storyBtn").style.display = "none";
    document.getElementById("endlessBtn").style.display = "none";

};

function setDifficulty(diff){

    difficulty = diff.level;

    bpm = diff.bpm;

    beatDuration = 60000 / bpm;

    scrollSpeed = 0.25 + difficulty * 0.05;

    hitWindow = 200 - difficulty * 20;

}

function startGame(selectedMode){

    mode = selectedMode;

    resetGame();

    if(mode==="story") generateStoryBeatmap();
    if(mode==="endless") generateEndlessInitialNotes();

    menu.style.display = "none";
    difficultySelection.style.display = "none";
    hud.style.display = "block";
    gameArea.style.display = "flex";

    gameStartTime = performance.now();

    gameRunning = true;

    requestAnimationFrame(gameLoop);

}

function resetGame(){

    score = 0;
    combo = 0;
    missCount = 0;
    health = 50;

    totalHitValue = 0;
    totalPossibleValue = 0;

    activeNotes = [];

    lanes.forEach(lane => lane.innerHTML = "");

    updateHUD();

}

// Story Mode Beatmap
function generateStoryBeatmap(){

    activeNotes = [];

    const map = beatmaps[difficulty] || [];

    map.forEach(note => {

        activeNotes.push({

            time: note.time,
            lane: note.lane,
            hit: false,
            element: null

        });

    });

    // Eğer map boşsa fallback
    if(activeNotes.length === 0){

        for(let i=0;i<20;i++){

            activeNotes.push({

                time: i * beatDuration,
                lane: Math.floor(Math.random()*4),
                hit:false,
                element:null

            });

        }

    }

}

// Endless Mode başlangıç notaları
function generateEndlessInitialNotes(){

    activeNotes = [];

    for(let i=0;i<30;i++){

        const time = i * (300 + Math.random()*700)/difficulty;

        const lane = Math.floor(Math.random()*4);

        activeNotes.push({

            time,
            lane,
            hit:false,
            element:null

        });

    }

}

function spawnNote(note){

    const el = document.createElement("div");

    el.classList.add("note");

    lanes[note.lane].appendChild(el);

    note.element = el;

}

function gameLoop(){

    if(!gameRunning) return;

    const currentTime = performance.now() - gameStartTime;

    // Endless mode sürekli nota üretir
    if(mode==="endless"){

        const lastNote = activeNotes[activeNotes.length-1];

        if(!lastNote || currentTime > lastNote.time - 2000){

            const nextTime = lastNote ? lastNote.time + (300 + Math.random()*700)/difficulty : 0;

            const lane = Math.floor(Math.random()*4);

            activeNotes.push({

                time:nextTime,
                lane,
                hit:false,
                element:null

            });

        }

    }

    activeNotes.forEach(note=>{

        if(!note.element && currentTime>=note.time-2500) spawnNote(note);

        if(note.element && !note.hit){

            const y = hitLineY - (note.time - currentTime)*scrollSpeed;

            note.element.style.top = y + "px";

            if(y > hitLineY + 50){

                registerMiss(note);

            }

        }

    });

    updateHUD();

    if(mode==="story" && activeNotes.length>0 && activeNotes.every(n=>n.hit)){

        endGame();

    }

    requestAnimationFrame(gameLoop);

}

document.addEventListener("keydown",e=>{

    if(!gameRunning) return;

    const keyMap = {

        ArrowLeft:0,
        ArrowDown:1,
        ArrowUp:2,
        ArrowRight:3

    };

    if(!(e.key in keyMap)) return;

    const lane = keyMap[e.key];

    const currentTime = performance.now() - gameStartTime;

    activeNotes.forEach(note=>{

        if(note.lane===lane && !note.hit && note.element){

            const diff = Math.abs(note.time-currentTime);

            if(diff<hitWindow){

                registerHit(note,diff);

            }

        }

    });

});

function registerHit(note,diff){

    note.hit=true;

    if(note.element) note.element.remove();

    let value=350;

    if(diff>150) value=100;
    else if(diff>100) value=200;
    else if(diff>50) value=300;

    score+=value;

    combo++;

    if(combo>maxCombo) maxCombo=combo;

    totalHitValue+=value;

    totalPossibleValue+=350;

    if(mode==="story") health=Math.min(health+2,100);
    else if(mode==="endless") health=Math.min(health+1,100);

}

function registerMiss(note){

    note.hit=true;

    if(note.element) note.element.remove();

    combo=0;

    missCount++;

    if(mode==="story"){

        health-=10;

        if(health<=0) failGame();

    }

    if(mode==="endless"){

        health=Math.max(health-5,0);

    }

}

function updateHUD(){

    document.getElementById("score").innerText="Score: "+score;

    document.getElementById("combo").innerText="Combo: "+combo;

    document.getElementById("miss").innerText="Miss: "+missCount;

    const accuracy = totalPossibleValue===0 ? 100 : (totalHitValue/totalPossibleValue)*100;

    document.getElementById("accuracy").innerText="Accuracy: "+accuracy.toFixed(2)+"%";

    document.getElementById("health-bar").style.width = health+"%";

}

function failGame(){

    gameRunning=false;

    alert("FAILED");

    resetToMenu();

}

function endGame(){

    gameRunning=false;

    alert("PASSED");

    resetToMenu();

}

function resetToMenu(){

    menu.style.display="block";

    difficultySelection.style.display="none";

    hud.style.display="none";

    gameArea.style.display="none";

    document.getElementById("storyBtn").style.display="inline-block";
    document.getElementById("endlessBtn").style.display="inline-block";

}
