
const scoreElement = document.querySelector("#score");
const TOTAL_ROUNDS = 3;
const GAME_STATE_KEY = "4real-game-state";

const revealBtn = document.querySelector("#reveal-button");
const revealImg = document.querySelector("#reveal-image");
const zoomBtn = document.querySelector("#zoom-button");
const zoomImg = document.querySelector("#zoom-image");

const btnSubmit = document.getElementById("answer-btn");
const answer = document.getElementById("answer-box");
const result = document.getElementById("resultaat");
const hint = document.getElementById("hint");
let wrongAttempts = 0;

const info = document.getElementById("info");
const blokje = document.querySelector("#blokje");

const goedAntwoord = "cat";

let score = 0;
let revealPhase = 1;
let answeredCorrectly = false;


if (revealBtn && revealImg) {
    revealBtn.addEventListener("click", () => {
        revealImg.classList.add("is-revealed");
        revealPhase = 2;
        revealBtn.remove();
    });
}


if (zoomBtn && zoomImg) {
    zoomBtn.addEventListener("click", () => {
        zoomImg.classList.add("is-revealed");
        revealPhase = 3;
        zoomBtn.remove();
    });
}


btnSubmit.addEventListener("click", function () {
    const guess = answer.value.trim().toLowerCase();

    if (guess === "") {
        result.textContent = "Niks ingevuld";
        return;
    }

    if (guess === "cat") {
        result.textContent = "Correct!";
        wrongAttempts = 0;
        return;
    }

    wrongAttempts += 1;
    result.textContent = "Incorrect. Try again.";

    if (wrongAttempts >= 2 && hint) {
        hint.classList.remove("hidden");
    }
});
if (info && blokje) {
    info.addEventListener("click", () => {
        blokje.classList.toggle("hidden");
    });
}


if (btnSubmit && answer && result && scoreElement) {
    btnSubmit.addEventListener("click", () => {
        if (answer.value.trim() === "") {
            result.textContent = "Niks ingevuld";
        } else if (
            answer.value.trim().toLowerCase() ===
            goedAntwoord.toLowerCase()
        ) {
            if (!answeredCorrectly) {
                result.textContent = "Goed antwoord!";
                updateScore(getPoints());
                answeredCorrectly = true;
            } else {
                result.textContent =
                    "Je hebt deze afbeelding al goed geraden!";
            }
        } else {
            result.textContent = "Fout antwoord!";
        }
    });
}


function updateScore(points) {
    score += points;
    scoreElement.textContent = `Points: ${score}`;
}


function getPoints() {
    if (revealPhase === 1) {
        return 100;
    } else if (revealPhase === 2) {
        return 50;
    } else {
        return 25;
    }
}
const answerForm = document.querySelector("#answer-form");
const nextRoundBtn = document.getElementById("next-round-btn");
const roundStatus = document.getElementById("round-status");
const gameMode = document.body.dataset.gameMode;

function getGameState() {
    const savedState = sessionStorage.getItem(GAME_STATE_KEY);
    return savedState ? JSON.parse(savedState) : null;
}

function saveGameState(state) {
    sessionStorage.setItem(GAME_STATE_KEY, JSON.stringify(state));
}

function finishGame(state) {
    if (state.completed) {
        return;
    }

    state.completed = true;
    saveGameState(state);
    window.location.href = "endscreen.html";
}

if (gameMode && (revealImg || zoomImg)) {
    let gameState = getGameState();

    if (!gameState || gameState.mode !== gameMode || gameState.completed) {
        gameState = {
            mode: gameMode,
            currentRound: 1,
            score: 0,
            currentRoundAnswered: false,
            completed: false
        };
        saveGameState(gameState);
    }

    const updateRoundStatus = () => {
        roundStatus.textContent = `Ronde ${gameState.currentRound} van ${TOTAL_ROUNDS}`;
    };

    updateRoundStatus();

    window.setTimeout(() => {
        finishGame(gameState);
    }, 3 * 60 * 1000);

    if (revealBtn && revealImg) {
        revealBtn.addEventListener("click", () => {
            revealImg.classList.add("is-revealed");
            revealBtn.hidden = true;
        });
    }

    if (zoomBtn && zoomImg) {
        zoomBtn.addEventListener("click", () => {
            zoomImg.classList.add("is-revealed");
            zoomBtn.hidden = true;
        });
    }

    if (answerForm && answer && result && nextRoundBtn) {
        if (gameState.currentRoundAnswered) {
            answer.disabled = true;
            answerForm.querySelector("button").hidden = true;
            nextRoundBtn.hidden = false;
            result.textContent = gameState.lastAnswerCorrect
                ? "Goed geraden! Je krijgt een punt."
                : "Helaas, dat is niet goed. Het was een kat.";
        }

        answerForm.addEventListener("submit", event => {
            event.preventDefault();

            if (gameState.currentRoundAnswered) {
                return;
            }

            const submittedAnswer = answer.value.trim().toLocaleLowerCase();
            if (!submittedAnswer) {
                result.textContent = "Vul eerst een antwoord in.";
                return;
            }

            const isCorrect = ["kat", "cat"].includes(submittedAnswer);
            gameState.currentRoundAnswered = true;
            gameState.lastAnswerCorrect = isCorrect;
            if (isCorrect) {
                gameState.score += 1;
                result.textContent = "Goed geraden! Je krijgt een punt.";
            } else {
                result.textContent = "Helaas, dat is niet goed. Het was een kat.";
            }

            saveGameState(gameState);
            answer.disabled = true;
            answerForm.querySelector("button").hidden = true;
            nextRoundBtn.hidden = false;
        });

        nextRoundBtn.addEventListener("click", () => {
            if (gameState.currentRound === TOTAL_ROUNDS) {
                finishGame(gameState);
                return;
            }

            gameState.currentRound += 1;
            gameState.currentRoundAnswered = false;
            delete gameState.lastAnswerCorrect;
            saveGameState(gameState);
            updateRoundStatus();
            answer.value = "";
            answer.disabled = false;
            answerForm.querySelector("button").hidden = false;
            result.textContent = "";
            nextRoundBtn.hidden = true;

            if (revealImg) {
                revealImg.classList.remove("is-revealed");
                revealBtn.hidden = false;
            }

            if (zoomImg) {
                zoomImg.classList.remove("is-revealed");
                zoomBtn.hidden = false;
            }
        });
    }
}



const finalScore = document.getElementById("finalScore");
const resultSummary = document.getElementById("resultSummary");

if (finalScore) {
    const gameState = getGameState();
    finalScore.textContent = gameState ? gameState.score : "0";
    if (resultSummary) {
        resultSummary.textContent = `Je hebt ${gameState ? gameState.score : 0} van de ${TOTAL_ROUNDS} punten gehaald.`;
    }
}

const playAgainBtn = document.getElementById("playAgainBtn");
const homeBtn = document.getElementById("homeBtn");

if (playAgainBtn) {
    playAgainBtn.addEventListener("click", () => {
        const gameState = getGameState();
        const gamePage = gameState && ["blur", "zoom"].includes(gameState.mode)
            ? `${gameState.mode}.html`
            : "index.html";

        sessionStorage.removeItem(GAME_STATE_KEY);
        window.location.href = gamePage;
    });
}

if (homeBtn) {
    homeBtn.addEventListener("click", () => {
        sessionStorage.removeItem(GAME_STATE_KEY);
        window.location.href = "index.html";
    });
}
