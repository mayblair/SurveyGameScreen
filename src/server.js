const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname));

// ----------------------------
// Game State
// ----------------------------

let gameState = {
    currentScreen: "join", // join | question | results
    timer: 20,
    currentQuestion: null,
    groupScores: {
        "Class 1": 0,
        "Class 2": 0,
        "Class 3": 0,
        "Class 4": 0
    }
};

let questions = [
    {
        question: "Which planet is the Red Planet?",
        answers: ["Earth", "Mars", "Jupiter", "Venus"],
        correct: "Mars"
    },
    {
        question: "What is H2O?",
        answers: ["Hydrogen", "Oxygen", "Water", "Helium"],
        correct: "Water"
    }
];

// ----------------------------
// Randomize Question + Answers
// ----------------------------

function getRandomQuestion() {
    const q = questions[Math.floor(Math.random() * questions.length)];

    let shuffledAnswers = [...q.answers].sort(() => Math.random() - 0.5);

    return {
        question: q.question,
        answers: shuffledAnswers,
        correct: q.correct
    };
}

// ----------------------------
// Socket Logic
// ----------------------------

io.on("connection", (socket) => {

    socket.emit("updateState", gameState);

    socket.on("startQuestion", () => {
        gameState.currentQuestion = getRandomQuestion();
        gameState.currentScreen = "question";
        gameState.timer = 20;

        io.emit("updateState", gameState);
    });

    socket.on("showResults", () => {
        gameState.currentScreen = "results";
        io.emit("updateState", gameState);
    });

    socket.on("submitAnswer", ({ group, answer }) => {
        if (answer === gameState.currentQuestion.correct) {
            gameState.groupScores[group] += 1;
        }
    });
});

// ----------------------------
// Routes
// ----------------------------

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/join.html");
});

app.get("/controller", (req, res) => {
    res.sendFile(__dirname + "/controller.html");
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});

