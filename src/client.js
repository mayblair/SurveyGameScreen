const socket = io();


const joinScreen = document.getElementById("joinScreen");
const waitingScreen = document.getElementById("waitingScreen");
const questionScreen = document.getElementById("questionScreen");
const resultsScreen = document.getElementById("resultsScreen");

const timerEl = document.getElementById("timer");
const questionEl = document.getElementById("question");
const answersEl = document.getElementById("answers");
const resultsContainer = document.getElementById("resultsContainer");

let hasAnswered = false;
let currentQuestionId = null;

const totalStudents = {
    "Class 1": 187,
    "Class 2": 189,
    "Class 3": 173,
    "Class 4": 162
};


// ---------------- JOIN ----------------

document.querySelectorAll(".group-btn").forEach(btn => {
    btn.addEventListener("click", () => {

        localStorage.setItem("group", btn.innerText);

        btn.classList.add("selected");

        setTimeout(() => {
            showScreen("waiting");
        }, 500);

    });
});

// ---------------- STATE UPDATES ----------------

socket.on("updateState", (state) => {

    if (state.currentScreen === "join") {
        showScreen("join");
    }

    if (state.currentScreen === "question" && state.currentQuestion) {
        showScreen("question");
        renderQuestion(state);
    }

    if (state.currentScreen === "results") {
        showScreen("results");
        renderResults(state);
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


// ---------------- QUESTION ----------------

function renderQuestion(state) {

    timerEl.innerText = state.timer;

    // If this is a NEW question
    if (state.currentQuestion.id !== currentQuestionId) {

        currentQuestionId = state.currentQuestion.id;
        hasAnswered = false;

        questionEl.innerText = state.currentQuestion.question;
        answersEl.innerHTML = "";

        state.currentQuestion.answers.forEach(ans => {

            const btn = document.createElement("button");
            btn.innerText = ans;
            btn.className = "answer-btn";

            btn.onclick = () => {

                if (hasAnswered) return;

                hasAnswered = true;

                const group = localStorage.getItem("group");

                socket.emit("submitAnswer", { group, answer: ans });

                if (ans === state.currentQuestion.correct) {
                    btn.style.background = "green";
                } else {
                    btn.style.background = "red";
                }

                document.querySelectorAll(".answer-btn")
                    .forEach(b => b.disabled = true);
            };

            answersEl.appendChild(btn);
        });
    }
}



// ---------------- RESULTS ----------------

function renderResults(state) {

    const currentBody = document.getElementById("currentResults");
    const totalBody = document.getElementById("totalResults");

    currentBody.innerHTML = "";
    totalBody.innerHTML = "";

    let currentRows = [];
    let totalRows = [];

    for (let group in state.groupScores) {

        const classSize = totalStudents[group] || 1;

        // ---------- CURRENT QUESTION ----------
        const currentResponses = state.groupResponses[group];
        const currentScore = state.groupScores[group];

        const currentResponseRate = Math.round(
            (currentResponses / classSize) * 100
        );

        currentRows.push({
            group,
            responseRate: currentResponseRate,
            score: currentScore
        });

        // ---------- TOTAL GAME ----------
        const totalResponses = state.totalResponses[group];
        const totalScore = state.totalScores[group];

        const totalResponseRate = state.questionsPlayed > 0
            ? Math.round(
                (totalResponses / (classSize * state.questionsPlayed)) * 100
              )
            : 0;

        const averageScore = state.questionsPlayed > 0
            ? Math.round(totalScore / state.questionsPlayed)
            : 0;

        totalRows.push({
            group,
            responseRate: totalResponseRate,
            score: averageScore
        });
    }

    // TODO SORT BY SCORE DESCENDING

    currentRows.forEach(r => {
        currentBody.innerHTML += `
            <tr>
                <td>${r.group}</td>
                <td>${r.responseRate}%</td>
                <td class="score-cell" data-target="${r.score}">0</td>
            </tr>
        `;
    });

    totalRows.forEach(r => {
        totalBody.innerHTML += `
            <tr>
                <td>${r.group}</td>
                <td>${r.responseRate}%</td>
                <td class="score-cell" data-target="${r.score}">0</td>
            </tr>
        `;
    });

    // TODO animateScores();
}



showScreen("join"); //show join screen on startup