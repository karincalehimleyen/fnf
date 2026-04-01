const lanes = [
    document.getElementById("lane0"),
    document.getElementById("lane1"),
    document.getElementById("lane2"),
    document.getElementById("lane3")
];

const music = document.getElementById("game-music");

let mode = null;
let gameRunning = false;

let score, combo, miss, health;
let totalHit, totalPossible;

let notes = [];

const hitLineY = 500;
const hitWindow = 150;
const scrollSpeed = 0.35;

let startTime = 0;

// ================= MENU =================

function showMusicMenu(){
    document.getElementById("musicMenu").style.display = "block";
}

function selectSong(){
    alert("Eye of the Tiger selected");
}

// ================= START =================

function startMode(selectedMode){

    mode = selectedMode;

    resetGame();

    if(mode === "story") generateStory();
    if(mode === "endless") generateEndless();
    if(mode === "music") startMusic();

    document.getElementById("menu").style.display = "none";
    document.getElementById("hud").style.display = "block";
    document.getElementById("game").style.display = "flex";

    startTime = performance.now();
    gameRunning = true;

    requestAnimationFrame(gameLoop);
}

// ================= RESET =================

function resetGame(){
    score = 0;
    combo = 0;
    miss = 0;
    health = 50;

    totalHit = 0;
    totalPossible = 0;

    notes = [];

    lanes.forEach(l => l.innerHTML = "");
}

// ================= STORY =================

function generateStory(){
    for(let i=0;i<20;i++){
        notes.push({
            time: i * 800,
            lane: i % 4,
            hit:false,
            el:null
        });
    }
}

// ================= ENDLESS =================

function generateEndless(){
    for(let i=0;i<30;i++){
        notes.push({
            time: i * (300 + Math.random()*500),
            lane: Math.floor(Math.random()*4),
            hit:false,
            el:null
        });
    }
}

// ================= MUSIC =================

function startMusic(){
    music.currentTime = 0;
    music.play();

    for(let i=0;i<50;i++){
        notes.push({
            time: i * 500,
            lane: Math.floor(Math.random()*4),
            hit:false,
            el:null
        });
    }
}

// ================= LOOP =================

function gameLoop(){

    if(!gameRunning) return;

    const current = performance.now() - startTime;

    // endless extend
    if(mode==="endless"){
        const last = notes[notes.length-1];
        if(current > last.time - 2000){
            notes.push({
                time: last.time + (300 + Math.random()*500),
                lane: Math.floor(Math.random()*4),
                hit:false,
                el:null
            });
        }
    }

    notes.forEach(n=>{

        if(!n.el && current >= n.time - 2000){
            const el = document.createElement("div");
            el.className = "note";
            lanes[n.lane].appendChild(el);
            n.el = el;
        }

        if(n.el && !n.hit){

            const y = hitLineY - (n.time - current)*scrollSpeed;
            n.el.style.top = y+"px";

            if(y > hitLineY + 50){
                registerMiss(n);
            }
        }
    });

    updateHUD();

    if(mode==="story" && notes.every(n=>n.hit)){
        endGame();
    }

    requestAnimationFrame(gameLoop);
}

// ================= INPUT =================

document.addEventListener("keydown", e=>{

    const map = {
        ArrowLeft:0,
        ArrowDown:1,
        ArrowUp:2,
        ArrowRight:3
    };

    if(!(e.key in map)) return;

    const lane = map[e.key];
    const current = performance.now() - startTime;

    for(let n of notes){
        if(n.lane===lane && !n.hit && n.el){

            const diff = Math.abs(n.time - current);

            if(diff < hitWindow){
                registerHit(n,diff);
                break;
            }
        }
    }
});

// ================= HIT =================

function registerHit(n,diff){

    n.hit = true;
    n.el.remove();

    let val = diff < 50 ? 300 : diff < 100 ? 200 : 100;

    score += val;
    combo++;

    totalHit += val;
    totalPossible += 300;

    health = Math.min(health+2,100);
}

// ================= MISS =================

function registerMiss(n){

    n.hit = true;
    n.el.remove();

    combo = 0;
    miss++;

    health -= 10;

    if(health <= 0 && mode!=="endless"){
        failGame();
    }
}

// ================= HUD =================

function updateHUD(){

    document.getElementById("score").innerText = "Score: " + score;
    document.getElementById("combo").innerText = "Combo: " + combo;
    document.getElementById("miss").innerText = "Miss: " + miss;

    const acc = totalPossible===0 ? 100 : (totalHit/totalPossible)*100;
    document.getElementById("accuracy").innerText = "Accuracy: " + acc.toFixed(2)+"%";

    document.getElementById("health-bar").style.width = health+"%";
}

// ================= END =================

function failGame(){
    gameRunning = false;
    alert("FAILED");
    location.reload();
}

function endGame(){
    gameRunning = false;
    alert("PASSED");
    location.reload();
}
