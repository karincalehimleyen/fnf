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

// Simple beatmap — times in milliseconds relative to game start
const notes = [
    { time: 1000, lane: 0 },
    { time: 2000, lane: 1 },
    { time: 3000, lane: 2 },
    { time: 4000, lane: 3 },
    { time: 5000, lane: 0 },
    { time: 6000, lane: 1 },
    { time: 7000, lane: 2 },
    { time: 8000, lane: 3 }
];

startBtn.addEventListener("click", () => {
    if (gameRunning) return;
    gameRunning = true;
    startTime = performance.now();
    requestAnimationFrame(gameLoop);
});

function spawnNote(noteData) {
    const note = document.createElement("div");
    note.classList.add("note");
    lanes[noteData.lane].appendChild(note);

    activeNotes.push({
        element: note,
        lane: noteData.lane,
        time: noteData.time,
        hit: false
    });
}

function gameLoop() {
    if (!gameRunning) return;

    let elapsed = performance.now() - startTime;

    // Spawn notes
    notes.forEach(note => {
        if (!note.spawned && elapsed >= note.time - 2000) {
            spawnNote(note);
            note.spawned = true;
        }
    });

    // Move notes
    activeNotes.forEach(note => {
        if (note.hit) return;

        let diff = note.time - elapsed;
        let progress = 1 - (diff / 2000);

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

    let lane = keyMap[e.key];
    let elapsed = performance.now() - startTime;

    activeNotes.forEach(note => {
        if (note.lane === lane && !note.hit) {
            let diff = Math.abs(note.time - elapsed);

            if (diff < 200) {
                score += 100;
                document.getElementById("score").innerText = "Score: " + score;
                note.hit = true;
                note.element.remove();
            }
        }
    });
});
