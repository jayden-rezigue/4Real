const TOTAL_ROUNDS = 3;
const MAX_WRONG_ATTEMPTS = 3;
const HINT_AFTER_ATTEMPTS = 2;
const GAME_STATE_KEY = "4real-game-state";

const revealBtn = document.querySelector("#reveal-button");
const revealImg = document.querySelector("#reveal-image");
const zoomBtn = document.querySelector("#zoom-button");
const zoomImg = document.querySelector("#zoom-image");
const info = document.getElementById("info");
const blokje = document.querySelector("#blokje");
const answerForm = document.querySelector("#answer-form");
const answer = document.getElementById("answer-box");
const result = document.getElementById("resultaat");
const hint = document.getElementById("hint");
const nextRoundBtn = document.getElementById("next-round-btn");
const roundStatus = document.getElementById("round-status");
const scoreElement = document.querySelector("#score");
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

if (info && blokje) {
    info.addEventListener("click", () => {
        blokje.classList.toggle("hidden");
    });
}

if (gameMode && (revealImg || zoomImg)) {
    let gameState = getGameState();

    if (!gameState || gameState.mode !== gameMode || gameState.completed) {
        gameState = {
            mode: gameMode,
            currentRound: 1,
            score: 0,
            wrongAttempts: 0,
            currentRoundAnswered: false,
            completed: false
        };
        saveGameState(gameState);
    } else if (typeof gameState.wrongAttempts !== "number") {
        gameState.wrongAttempts = 0;
    }

    const updateRoundStatus = () => {
        roundStatus.textContent = `Ronde ${gameState.currentRound} van ${TOTAL_ROUNDS}`;
        if (scoreElement) {
            scoreElement.textContent = `Points: ${gameState.score}`;
        }
    };

    const showRoundResult = () => {
        if (!gameState.currentRoundAnswered) {
            return;
        }

        answer.disabled = true;
        answerForm.querySelector('button[type="submit"]').hidden = true;
        nextRoundBtn.hidden = false;
        result.textContent = gameState.lastAnswerCorrect
            ? "Goed geraden! Je krijgt een punt."
            : `Helaas, drie keer fout. Het was een kat.`;
    };

    const startNextRound = () => {
        if (gameState.currentRound === TOTAL_ROUNDS) {
            finishGame(gameState);
            return;
        }

        gameState.currentRound += 1;
        gameState.wrongAttempts = 0;
        gameState.currentRoundAnswered = false;
        delete gameState.lastAnswerCorrect;
        saveGameState(gameState);
        updateRoundStatus();
        answer.value = "";
        answer.disabled = false;
        answerForm.querySelector('button[type="submit"]').hidden = false;
        result.textContent = "";
        hint.classList.add("hidden");
        nextRoundBtn.hidden = true;

        if (revealImg) {
            revealImg.classList.remove("is-revealed");
            revealBtn.hidden = false;
        }

        if (zoomImg) {
            zoomImg.classList.remove("is-revealed");
            zoomBtn.hidden = false;
        }
    };

    updateRoundStatus();

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

    if (answerForm && answer && result && hint && nextRoundBtn) {
        if (gameState.wrongAttempts >= HINT_AFTER_ATTEMPTS) {
            hint.classList.remove("hidden");
        }
        showRoundResult();

        answerForm.addEventListener("submit", event => {
            event.preventDefault();

            if (gameState.currentRoundAnswered) {
                return;
            }

            const submittedAnswer = answer.value.trim().toLowerCase();
            if (!submittedAnswer) {
                result.textContent = "Vul eerst een antwoord in.";
                return;
            }

            if (["kat", "cat"].includes(submittedAnswer)) {
                gameState.currentRoundAnswered = true;
                gameState.lastAnswerCorrect = true;
                gameState.score += 1;
                result.textContent = "Goed geraden! Je krijgt een punt.";
                saveGameState(gameState);
                updateRoundStatus();
                showRoundResult();
                return;
            }

            gameState.wrongAttempts += 1;
            if (gameState.wrongAttempts >= HINT_AFTER_ATTEMPTS) {
                hint.classList.remove("hidden");
            }

            if (gameState.wrongAttempts >= MAX_WRONG_ATTEMPTS) {
                gameState.currentRoundAnswered = true;
                gameState.lastAnswerCorrect = false;
                saveGameState(gameState);
                showRoundResult();
                return;
            }

            result.textContent = "Fout antwoord! Probeer het nog eens.";
            saveGameState(gameState);
        });

        nextRoundBtn.addEventListener("click", startNextRound);
    }

    window.setTimeout(() => {
        finishGame(gameState);
    }, 3 * 60 * 1000);
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
