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

    if (state.currentScreen === "answer") {

        const supplementaryEl = document.getElementById("supplementaryText");

        if (state.currentQuestion.explanation) {
            supplementaryEl.style.display = "block";
            supplementaryEl.innerText = state.currentQuestion.explanation;
        } else {
            supplementaryEl.style.display = "none";
        }

        // highlight correct answer
        document.querySelectorAll(".answer-btn").forEach(btn => {
            if (btn.innerText === state.currentQuestion.correct) {
                btn.style.background = "green";
            }
        });
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
                if (state.timer <= 0) return;

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

    const container = document.getElementById("simpleResults");
    container.innerHTML = "";

    let rows = [];

    for (let group in state.totalScores) {
        rows.push({
            group,
            score: state.totalScores[group]
        });
    }

    rows.sort((a, b) => b.score - a.score);

    rows.forEach(r => {
        container.innerHTML += `
            <div style="font-size:24px; margin:15px;">
                ${r.group}: ${r.score} points
            </div>
        `;
    });
}

showScreen("join"); //show join screen on startup