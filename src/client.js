const socket = io();

socket.on("updateState", (state) => {

    if (state.currentScreen === "question") {
        document.getElementById("question").innerText = state.currentQuestion.question;

        const container = document.getElementById("answers");
        container.innerHTML = "";

        state.currentQuestion.answers.forEach(ans => {
            const btn = document.createElement("button");
            btn.innerText = ans;
            btn.className = "answer-btn";

            btn.onclick = () => {
                const group = localStorage.getItem("group");
                socket.emit("submitAnswer", { group, answer: ans });

                if (ans === state.currentQuestion.correct) {
                    btn.style.background = "green";
                } else {
                    btn.style.background = "red";
                }
            };

            container.appendChild(btn);
        });
    }

    if (state.currentScreen === "results") {
        window.location.href = "results.html";
    }
});
