let audio = new Audio("music.mp3");
let score = 0;
let notes = [];
let activeNotes = [];

const lanes = document.querySelectorAll(".lane");
const hitLinePosition = 500; // pixels from top

// Simple beatmap (milliseconds + lane)
notes = [
    { time: 1000, lane: 0 },
    { time: 1500, lane: 1 },
    { time: 2000, lane: 2 },
    { time: 2500, lane: 3 },
    { time: 3000, lane: 0 },
    { time: 3500, lane: 1 },
    { time: 4000, lane: 2 },
    { time: 4500, lane: 3 }
];

function startGame() {
    audio.play();
    requestAnimationFrame(gameLoop);
}

function spawnNote(note) {
    const noteDiv = document.createElement("div");
    noteDiv.classList.add("note");
    lanes[note.lane].appendChild(noteDiv);

    activeNotes.push({
        element: noteDiv,
        lane: note.lane,
        time: note.time,
        hit: false
    });
}

function gameLoop() {
    let currentTime = audio.currentTime * 1000;

    // Spawn notes
    notes.forEach(note => {
        if (!note.spawned && currentTime >= note.time - 2000) {
            spawnNote(note);
            note.spawned = true;
        }
    });

    // Move notes
    activeNotes.forEach(note => {
        let timeDiff = note.time - currentTime;
        let position = hitLinePosition - (timeDiff / 2000) * hitLinePosition;
        note.element.style.top = position + "px";

        // Miss detection
        if (position > hitLinePosition + 50 && !note.hit) {
            note.hit = true;
            note.element.remove();
        }
    });

    requestAnimationFrame(gameLoop);
}

// Key input
document.addEventListener("keydown", (e) => {
    const keyMap = {
        "ArrowLeft": 0,
        "ArrowDown": 1,
        "ArrowUp": 2,
        "ArrowRight": 3
    };

    if (!(e.key in keyMap)) return;

    let lane = keyMap[e.key];
    let currentTime = audio.currentTime * 1000;

    activeNotes.forEach(note => {
        if (note.lane === lane && !note.hit) {
            let diff = Math.abs(note.time - currentTime);

            if (diff < 150) {
                score += 100;
                document.getElementById("score").innerText = "Score: " + score;
                note.hit = true;
                note.element.remove();
            }
        }
    });
});
