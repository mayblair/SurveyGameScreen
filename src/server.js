const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let countdownInterval = null;
let question_index = 0;


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
        question: "What common kitchen appliance was invented by Josephine Cochrane in 1886?",
        answers: ["Dishwasher", "Electric Refrigerator", "Coffee Filter", "Toaster"],
        correct: "Dishwasher",
        explanation: "While Cochrane invented the dishwasher, all other appliances mentioned were invented by other women."
    },
    {
        question: "How long after Bobbi Gibbs became the first woman to complete the Boston Marathon in 1966, did it become legal for women to register in major marathons?",
        answers: ["7 months", "2 years", "6 years", "15 years"],
        correct: "6 years",
        explanation: "Women like Bobbi Gibbs and Kathrine Switzer, pictured running in the 1967 Boston marathon despite physical attempts to remove her, challenged the narrative that women were “too fragile for long distance running”"
    },
    {
        question: "Which of these famous actresses are Milton Academy alumni?",
        answers: ["Jenny Slate", "Zoe Saldana", "Kate Siegel", "Octavia Spencer"],
        correct: "Jenny Slate",
        explanation: "After graduating Class of ’00, Slate went on to co-create an Oscar-nominated short film and join the 35th season of SNL as a cast member. She has since been featured in many films, including her role as Allysa in “It Ends With Us.”"
    },
    {
        question: "How many weeks of paid maternity leave are the majority of people who give birth in America receiving?",
        answers: ["0", "5", "12", "15"],
        correct: "0",
        explanation: "Only 12-41% of birthing people, differing between the private and public sector, have any access to paid maternity leave. Even so, only 54% are eligible for the Family and Medical Leave Act, which guarantees 12 weeks of UNPAID job protection."
    },
    {
        question: "Women earned an average of ____ of what men earned in 2024?",
        answers: ["53%", "85%", "60%", "33%"],
        correct: "85%",
        explanation: ""
    },
    {
        question: "What percentage of the people in Milton CS classes were non-male identifying in 2024?",
        answers: ["53%", "41%", "60%", "33%"],
        correct: "41%",
        explanation: ""
    },
    {
        question: "What percentage of the people in Milton CS classes were non-male identifying in 2025?",
        answers: ["53%", "41%", "60%", "33%"],
        correct: "33%",
        explanation: ""
    },
    {
        question: "Which of Milton’s sports teams were ISL champions the last 3 years?",
        answers: ["Girls Varsity Squash", "Boys Varsity Squash", "Girls Varsity Swim", "Boys Varsity Swim"],
        correct: "Girls Varsity Swim",
        explanation: ""
    },
    {
        question: "How many female Milton students are committed to play their sport at a collegiate level?",
        answers: ["20", "12", "14", "18"],
        correct: "18",
        explanation: "Congrats to the 12 seniors, 6 juniors, and many more to come!!\n(C. DiAdamo, S. Crowly, K. Xue, L. Rubeiz, E. Trefethen, C. Khan, M. Quatrale, A. Scannell, C. Banbury, R. Vaughan, T. Schoettle, L. Bourell S. Callahan, B. Hunt, S. Salmon, L. Garrity, E. O’Rourke, M. Ruland)"
    },
];

// ----------------------------
// Randomize Question + Answers
// ----------------------------

function getRandomQuestion() {
//    const q = questions[Math.floor(Math.random() * questions.length)];
    const q = questions[question_index];
    question_index += 1;

    let shuffledAnswers = [...q.answers].sort(() => Math.random() - 0.5);

    return {
        id: Date.now(),   // unique ID each time
        question: q.question,
        answers: shuffledAnswers,
        correct: q.correct,
        explanation: q.explanation
    };
}

// ----------------------------
// Socket Logic
// ----------------------------

io.on("connection", (socket) => {

    socket.on("joinClass", ({ group }) => {
        socket.emit("updateState", gameState);
    });

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
                gameState.currentScreen = "answer";
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
        if (gameState.timer <= 0) return;

        if (!gameState.groupResponses[group]) {
            gameState.groupResponses[group] = 0;
        }

        gameState.groupResponses[group]++;

        if (answer === gameState.currentQuestion.correct) {
            gameState.groupScores[group] += gameState.timer;
        }
    });

    socket.on("showAnswer", () => {

        if (gameState.currentScreen !== "question") return;

        gameState.currentScreen = "answer";
        io.emit("updateState", gameState);
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