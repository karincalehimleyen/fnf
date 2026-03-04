const lanes = [
    document.getElementById("lane0"),
    document.getElementById("lane1"),
    document.getElementById("lane2"),
    document.getElementById("lane3")
];

const hitLineY = 500;

let gameRunning = false;
let mode = "story";
let difficulty = 2; // Default Normal

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

const difficulties = [
    { name: "Easy", level: 1, bpm: 90 },
    { name: "Normal", level: 2, bpm: 120 },
    { name: "Hard", level: 3, bpm: 150 },
    { name: "Insane", level: 4, bpm: 170 },
    { name: "Extreme", level: 5, bpm: 190 },
    { name: "Terrifying", level: 6, bpm: 210 }
];

const difficultyContainer = document.getElementById("difficulty-buttons");

// Difficulty butonlarını oluştur
difficulties.forEach(diff => {
    const btn = document.createElement("button");
    btn.innerText = diff.name;
    btn.onclick = () => setDifficulty(diff);
    difficultyContainer.appendChild(btn);
});

// Default difficulty
setDifficulty(difficulties[1]); // Normal default

let gameStartTime = 0;

function setDifficulty(diff) {
    difficulty = diff.level;
    bpm = diff.bpm;
    beatDuration = 60000 / bpm;

    scrollSpeed = 0.25 + difficulty * 0.05;
    hitWindow = 200 - difficulty * 20;
}

function startGame(selectedMode) {
    mode = selectedMode;
    resetGame();
    generateBeatmap();

    gameStartTime = performance.now();
    gameRunning = true;
    requestAnimationFrame(gameLoop);
}

function resetGame() {
    score = 0;
    combo = 0;
    missCount = 0;
    health = 50;
    totalHitValue = 0;
    totalPossibleValue = 0;
    activeNotes = [];

    // Clear lane divs
    lanes.forEach(lane => {
        lane.innerHTML = "";
    });
}

function generateBeatmap() {
    activeNotes = [];
    for (let i = 0; i < 100; i++) {
        let beat = i;
        let time = beat * beatDuration;
        let lane = Math.floor(Math.random() * 4);

        activeNotes.push({
            time,
            lane,
            hit: false,
            element: null
        });
    }
}

function spawnNote(note) {
    const el = document.createElement("div");
    el.classList.add("note");
    lanes[note.lane].appendChild(el);
    note.element = el;
}

function gameLoop() {
    if (!gameRunning) return;

    let currentTime = performance.now() - gameStartTime; // müzik yok, kendi zamanı

    activeNotes.forEach(note => {
        if (!note.element && currentTime >= note.time - 2000) {
            spawnNote(note);
        }

        if (note.element && !note.hit) {
            let y = hitLineY - (note.time - currentTime) * scrollSpeed;
            note.element.style.top = y + "px";

            if (y > hitLineY + 50) {
                registerMiss(note);
            }
        }
    });

    updateHUD();

    if (activeNotes.every(n => n.hit) && mode === "story") {
        endGame();
    }

    requestAnimationFrame(gameLoop);
}

document.addEventListener("keydown", e => {
    if (!gameRunning) return;

    const keyMap = {
        ArrowLeft: 0,
        ArrowDown: 1,
        ArrowUp: 2,
        ArrowRight: 3
    };

    if (!(e.key in keyMap)) return;

    let lane = keyMap[e.key];
    let currentTime = performance.now() - gameStartTime;

    activeNotes.forEach(note => {
        if (note.lane === lane && !note.hit && note.element) {
            let diff = Math.abs(note.time - currentTime);

            if (diff < hitWindow) {
                registerHit(note, diff);
            }
        }
    });
});

function registerHit(note, diff) {
    note.hit = true;
    if (note.element) note.element.remove();

    let value = 350;

    if (diff > 150) value = 100;
    else if (diff > 100) value = 200;
    else if (diff > 50) value = 300;

    score += value;
    combo++;
    if (combo > maxCombo) maxCombo = combo;

    totalHitValue += value;
    totalPossibleValue += 350;

    health += 2;
    if (health > 100) health = 100;
}

function registerMiss(note) {
    note.hit = true;
    if (note.element) note.element.remove();

    combo = 0;
    missCount++;
    health -= 10;

    if (health <= 0) {
        if (mode === "story") {
            failGame();
        } else {
            health = 10; // Endless rock bottom
        }
    }
}

function updateHUD() {
    document.getElementById("score").innerText = "Score: " + score;
    document.getElementById("combo").innerText = "Combo: " + combo;
    document.getElementById("miss").innerText = "Miss: " + missCount;

    let accuracy = totalPossibleValue === 0 ? 100 :
        (totalHitValue / totalPossibleValue) * 100;

    document.getElementById("accuracy").innerText =
        "Accuracy: " + accuracy.toFixed(2) + "%";

    document.getElementById("health-bar").style.width = health + "%";
}

function failGame() {
    gameRunning = false;
    alert("FAILED");
}

function endGame() {
    gameRunning = false;
    alert("PASSED");
}
