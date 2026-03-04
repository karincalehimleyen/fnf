const lanes = [
    document.getElementById("lane0"),
    document.getElementById("lane1"),
    document.getElementById("lane2"),
    document.getElementById("lane3")
];

const hitLineY = 500;

let gameRunning = false;
let mode = null; // 'story' veya 'endless'
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
const menu = document.getElementById("menu");
const difficultySelection = document.getElementById("difficulty-selection");
const hud = document.getElementById("hud");
const gameArea = document.getElementById("game");

// Önceden tanımlı beatmapler (story mod zorluklarına göre)
const beatmaps = {
    1: [ /* Easy notes */ ],
    2: [ /* Normal notes */ ],
    3: [ /* Hard notes */ ],
    4: [ /* Insane notes */ ],
    5: [ /* Extreme notes */ ],
    6: [ /* Terrifying notes */ ]
};

// Menüde difficulty butonları oluşturuluyor
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

    menu.style.display = "none";
    difficultySelection.style.display = "none";
    hud.style.display = "block";
    gameArea.style.display = "flex";

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

    lanes.forEach(lane => lane.innerHTML = "");
    updateHUD();
}

function generateBeatmap() {
    activeNotes = [];

    if (mode === "story") {
        const map = beatmaps[difficulty];
        if (!map) {
            for (let i = 0; i < 50; i++) {
                const time = i * beatDuration;
                const lane = Math.floor(Math.random() * 4);
                activeNotes.push({ time, lane, hit: false, element: null });
            }
        } else {
            map.forEach(note => {
                activeNotes.push({ ...note, hit: false, element: null });
            });
        }
    } else {
        // Endless mod: rastgele nota üret, sürekli genişletilebilir
        let lastTime = 0;
        for (let i = 0; i < 50; i++) {
            lastTime += (300 + Math.random() * 700) / difficulty; // Zorluk arttıkça aralık azalır
            const lane = Math.floor(Math.random() * 4);
            activeNotes.push({ time: lastTime, lane, hit: false, element: null });
        }
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

    const currentTime = performance.now() - gameStartTime;

    // Endless modda yeni notalar ekle
    if (mode === "endless") {
        // Sürekli yeni nota eklemek için basit örnek
        const lastNote = activeNotes.length ? activeNotes[activeNotes.length - 1] : null;
        if (!lastNote || currentTime > lastNote.time - 2000) {
            const nextTime = lastNote ? lastNote.time + (300 + Math.random() * 700) / difficulty : 0;
            const lane = Math.floor(Math.random() * 4);
            activeNotes.push({ time: nextTime, lane, hit: false, element: null });
        }
    }

    activeNotes.forEach(note => {
        if (!note.element && currentTime >= note.time - 2000) {
            spawnNote(note);
        }

        if (note.element && !note.hit) {
            const y = hitLineY - (note.time - currentTime) * scrollSpeed;
            note.element.style.top = y + "px";

            if (y > hitLineY + 50) {
                registerMiss(note);
            }
        }
    });

    updateHUD();

    if (mode === "story" && activeNotes.every(n => n.hit)) {
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

    const lane = keyMap[e.key];
    const currentTime = performance.now() - gameStartTime;

    activeNotes.forEach(note => {
        if (note.lane === lane && !note.hit && note.element) {
            const diff = Math.abs(note.time - currentTime);

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
        failGame();
    }
}

function updateHUD() {
    document.getElementById("score").innerText = "Score: " + score;
    document.getElementById("combo").innerText = "Combo: " + combo;
    document.getElementById("miss").innerText = "Miss: " + missCount;

    const accuracy = totalPossibleValue === 0 ? 100 : (totalHitValue / totalPossibleValue) * 100;

    document.getElementById("accuracy").innerText = "Accuracy: " + accuracy.toFixed(2) + "%";

    document.getElementById("health-bar").style.width = health + "%";
}

function failGame() {
    gameRunning = false;
    alert("FAILED");
    resetToMenu();
}

function endGame() {
    gameRunning = false;
    alert("PASSED");
    resetToMenu();
}

function resetToMenu() {
    menu.style.display = "block";
    difficultySelection.style.display = "none";
    hud.style.display = "none";
    gameArea.style.display = "none";

    document.getElementById("storyBtn").style.display = "inline-block";
    document.getElementById("endlessBtn").style.display = "inline-block";
}
