const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let countdownInterval = null;


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
    },
    groupResponses: {
        "Class 1": 0,
        "Class 2": 0,
        "Class 3": 0,
        "Class 4": 0
    },
    totalScores: {
        "Class 1": 0,
        "Class 2": 0,
        "Class 3": 0,
        "Class 4": 0
    },
    totalResponses: {
        "Class 1": 0,
        "Class 2": 0,
        "Class 3": 0,
        "Class 4": 0
    },
    questionsPlayed: 0
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
    },
    {
        question: "What is What?",
        answers: ["what", "What", "whaa", "watt"],
        correct: "What"
    },
    {
        question: "Who is Ms. Blair?",
        answers: ["Student", "Teacher", "Water", "Helium"],
        correct: "Teacher"
    }
];

// ----------------------------
// Randomize Question + Answers
// ----------------------------

function getRandomQuestion() {
    const q = questions[Math.floor(Math.random() * questions.length)];

    let shuffledAnswers = [...q.answers].sort(() => Math.random() - 0.5);

    return {
        id: Date.now(),   // unique ID each time
        question: q.question,
        answers: shuffledAnswers,
        correct: q.correct
    };
}

// ----------------------------
// Socket Logic
// ----------------------------

io.on("connection", (socket) => {


    socket.on("startQuestion", () => {
        // do not generate new question if not on results screen
       if (gameState.currentScreen !== "join" && gameState.currentScreen !== "results")
        {   return;   }
        gameState.currentQuestion = getRandomQuestion();
        gameState.currentScreen = "question";
        gameState.timer = 20;

        // reset responses each round
        for (let group in gameState.groupResponses) {
            gameState.groupResponses[group] = 0;
        }

        io.emit("updateState", gameState);

        // clear previous timer
        if (countdownInterval) clearInterval(countdownInterval);

        countdownInterval = setInterval(() => {
            gameState.timer--;

            io.emit("updateState", gameState);

            if (gameState.timer <= 0) {
                clearInterval(countdownInterval);
                gameState.currentScreen = "results";
                io.emit("updateState", gameState);
            }

        }, 1000);
    });


    socket.on("showResults", () => {
        //add to total participation rate and score info
        for (let group in gameState.groupScores) {
            gameState.totalScores[group] += gameState.groupScores[group];
            gameState.totalResponses[group] += gameState.groupResponses[group];
        }

        gameState.questionsPlayed++;

        gameState.currentScreen = "results";
        io.emit("updateState", gameState);
    });


    
    socket.on("submitAnswer", ({ group, answer }) => {
        if (!gameState.groupResponses[group]) {
            gameState.groupResponses[group] = 0;
        }

        gameState.groupResponses[group]++;

        if (answer === gameState.currentQuestion.correct) {
            gameState.groupScores[group] += gameState.timer;
        }
    });

});

// ----------------------------
// Routes
// ----------------------------

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/game.html");
});


app.get("/controller", (req, res) => {
    const password = req.query.key;

    if (password !== "girlsrock") {
        return res.send("Unauthorized");
    }

    res.sendFile(__dirname + "/controller.html");
});

// static files
app.use(express.static(__dirname));


const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});