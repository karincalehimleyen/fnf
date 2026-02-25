const startBtn = document.getElementById("startBtn");
const lanes = [
    document.getElementById("lane0"),
    document.getElementById("lane1"),
    document.getElementById("lane2"),
    document.getElementById("lane3")
];

let score = 0;
let activeNotes = [];
let gameRunning = false;

const hitLineY = 500;
let startTime = 0;

// Game settings
let spawnInterval = 700;      // Initial ms between notes
let noteTravelTime = 2000;    // Initial ms for note to reach hit line
const minSpawnInterval = 250;
const minTravelTime = 800;
const difficultyRamp = 0.98;

// Define note types: color, points, size multiplier, speed multiplier
const noteTypes = [
    { color: "cyan", points: 100, size: 1, speed: 1 },         // Normal note
    { color: "yellow", points: 200, size: 1, speed: 1 },       // Medium note
    { color: "magenta", points: 300, size: 0.8, speed: 1.2 }  // Rare fast small note
];

startBtn.addEventListener("click", () => {
    if (gameRunning) return;
    gameRunning = true;
    startTime = performance.now();
    requestAnimationFrame(gameLoop);
    spawnNoteLoop();
    rampDifficulty();
});

function spawnRandomNote() {
    const lane = Math.floor(Math.random() * lanes.length);

    // Weighted random for rare high-point notes
    let rand = Math.random();
    let type;
    if (rand < 0.6) type = noteTypes[0];       // Cyan 60%
    else if (rand < 0.9) type = noteTypes[1];  // Yellow 30%
    else type = noteTypes[2];                  // Magenta 10%

    const note = document.createElement("div");
    note.classList.add("note");
    note.style.background = type.color;
    note.style.width = `${30 * type.size}px`;
    note.style.height = `${30 * type.size}px`;
    lanes[lane].appendChild(note);

    activeNotes.push({
        element: note,
        lane: lane,
        spawnTime: performance.now(),
        hit: false,
        points: type.points,
        speed: type.speed
    });
}

function spawnNoteLoop() {
    if (!gameRunning) return;
    spawnRandomNote();
    setTimeout(spawnNoteLoop, spawnInterval);
}

function rampDifficulty() {
    if (!gameRunning) return;

    spawnInterval = Math.max(spawnInterval * difficultyRamp, minSpawnInterval);
    noteTravelTime = Math.max(noteTravelTime * difficultyRamp, minTravelTime);

    setTimeout(rampDifficulty, 5000);
}

function gameLoop() {
    if (!gameRunning) return;

    const now = performance.now();

    activeNotes.forEach(note => {
        if (note.hit) return;

        let progress = (now - note.spawnTime) / (noteTravelTime / note.speed);
        let y = progress * hitLineY;
        note.element.style.top = y + "px";

        if (y > hitLineY + 50) {
            note.hit = true;
            note.element.remove();
        }
    });

    requestAnimationFrame(gameLoop);
}

// Key detection
document.addEventListener("keydown", (e) => {
    if (!gameRunning) return;

    const keyMap = {
        "ArrowLeft": 0,
        "ArrowDown": 1,
        "ArrowUp": 2,
        "ArrowRight": 3
    };

    if (!(e.key in keyMap)) return;

    const lane = keyMap[e.key];
    const now = performance.now();

    activeNotes.forEach(note => {
        if (note.lane === lane && !note.hit) {
            const diff = Math.abs((note.spawnTime + noteTravelTime / note.speed) - now);
            if (diff < 200) {
                score += note.points;
                document.getElementById("score").innerText = "Score: " + score;
                note.hit = true;
                note.element.remove();
            }
        }
    });
});
