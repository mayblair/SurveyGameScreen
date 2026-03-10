const socket = io();

// ---------------- DOM ELEMENTS ----------------

const joinScreen = document.getElementById("joinScreen");
const waitingScreen = document.getElementById("waitingScreen");
const questionScreen = document.getElementById("questionScreen");
const resultsScreen = document.getElementById("resultsScreen");

const timerEl = document.getElementById("timer");
const questionEl = document.getElementById("question");
const answersEl = document.getElementById("answers");
const supplementaryEl = document.getElementById("supplementaryText");
const resultsContainer = document.getElementById("simpleResults");

// ---------------- STATE ----------------

let hasAnswered = false;
let currentQuestionId = null;
let hasJoined = false;

const totalStudents = {
    "Class 1": 187,
    "Class 2": 189,
    "Class 3": 173,
    "Class 4": 162
};

// ---------------- JOIN ----------------

document.querySelectorAll(".group-btn").forEach(btn => {
    btn.addEventListener("click", () => {

        const group = btn.innerText;
        localStorage.setItem("group", group);
        btn.classList.add("selected");

        hasJoined = true;

        socket.emit("joinClass", { group });

        showScreen("waiting");
    });
});

// ---------------- SOCKET STATE UPDATES ----------------

socket.on("updateState", (state) => {

    if (!hasJoined) {
        showScreen("join");
        return;
    }

    // QUESTION
    if (state.currentScreen === "question" && state.currentQuestion) {
        showScreen("question");
        renderQuestion(state);
        return;
    }

    // ANSWER
    if (state.currentScreen === "answer" && state.currentQuestion) {
        showScreen("question");
        renderQuestion(state);
        revealAnswer(state);
        return;
    }

    // RESULTS
    if (state.currentScreen === "results") {
        showScreen("results");
        renderResults(state);
        return;
    }
});

// ---------------- SCREEN CONTROL ----------------

function showScreen(screen) {

    joinScreen.style.display = "none";
    waitingScreen.style.display = "none";
    questionScreen.style.display = "none";
    resultsScreen.style.display = "none";

    document.body.classList.remove("blue-bg", "orange-bg");

    if (screen === "join") {
        joinScreen.style.display = "block";
        document.body.classList.add("blue-bg");
    }

    if (screen === "waiting") {
        waitingScreen.style.display = "block";
        document.body.classList.add("orange-bg");
    }

    if (screen === "question") {
        questionScreen.style.display = "block";
        document.body.classList.add("orange-bg");
    }

    if (screen === "results") {
        resultsScreen.style.display = "block";
        document.body.classList.add("blue-bg");
    }
}

// ---------------- QUESTION RENDER ----------------

function renderQuestion(state) {

    timerEl.innerText = state.timer;

    // If new question
    if (state.currentQuestion.id !== currentQuestionId) {

        currentQuestionId = state.currentQuestion.id;
        hasAnswered = false;

        questionEl.innerText = state.currentQuestion.question;
        answersEl.innerHTML = "";
        supplementaryEl.style.display = "none";

        state.currentQuestion.answers.forEach(ans => {

            const btn = document.createElement("button");
            btn.innerText = ans;
            btn.className = "answer-btn";

            btn.onclick = () => {

                if (hasAnswered) return;
                if (state.timer <= 0) return;

                hasAnswered = true;

                const group = localStorage.getItem("group");

                socket.emit("submitAnswer", {
                    group,
                    answer: ans,
                    questionId: state.currentQuestion.id
                });

                btn.style.backgroundColor = "#cccccc";  // neutral gray
                btn.style.color = "#001146";
                btn.style.border = "2px solid #001146";

                // Disable ALL buttons
                document.querySelectorAll(".answer-btn")
                    .forEach(b => b.disabled = true);
            };

            answersEl.appendChild(btn);
        });
    }
}

// ---------------- ANSWER REVEAL ----------------

function revealAnswer(state) {

    // Disable answering
    document.querySelectorAll(".answer-btn")
        .forEach(b => b.disabled = true);

    // Highlight correct answer
    document.querySelectorAll(".answer-btn").forEach(btn => {
        if (btn.innerText === state.currentQuestion.correct) {
            btn.style.backgroundColor = "#2ecc71";
            btn.style.color = "white";
        }
    });

    // Show explanation only if exists
    if (state.currentQuestion.explanation) {
        supplementaryEl.style.display = "block";
        supplementaryEl.innerText = state.currentQuestion.explanation;
    } else {
        supplementaryEl.style.display = "none";
    }
}

// ---------------- RESULTS ----------------

function renderResults(state) {

    resultsContainer.innerHTML = "";

    let rows = [];

    for (let group in state.totalScores) {
        rows.push({
            group,
            score: state.totalScores[group]
        });
    }

    // Sort descending
    rows.sort((a, b) => b.score - a.score);

    rows.forEach(r => {
        resultsContainer.innerHTML += `
            <div style="font-size:35px; margin:15px;">
                ${r.group}: ${r.score} points
            </div>
        `;
    });
}

// ---------------- INITIAL LOAD ----------------

showScreen("join");