const ROUNDS_PER_GAME = 5;
const MAX_POKEMON_ID = 1025;
const MAX_WRONG_ATTEMPTS = 3;
const HINT_AFTER_ATTEMPTS = 2;
const GAME_STATE_KEY = "4real-game-state";
const LEADERBOARD_KEY = "4real-leaderboard";
const GAME_VERSION = 3;

function getGameState() {
    const savedState = sessionStorage.getItem(GAME_STATE_KEY);
    return savedState ? JSON.parse(savedState) : null;
}

function saveGameState(state) {
    sessionStorage.setItem(GAME_STATE_KEY, JSON.stringify(state));
}

function getLeaderboardEntries() {
    const savedEntries = localStorage.getItem(LEADERBOARD_KEY);
    if (!savedEntries) {
        return [];
    }

    const entries = JSON.parse(savedEntries);
    if (!Array.isArray(entries)) {
        throw new Error("Saved leaderboard data must be a list.");
    }

    return entries.filter(entry =>
        entry &&
        typeof entry.name === "string" &&
        Number.isInteger(entry.score) &&
        Number.isFinite(entry.savedAt)
    );
}

function showLeaderboard() {
    const tableBody = document.querySelector("#leaderboard-entries");
    if (!tableBody) {
        return;
    }

    const entries = getLeaderboardEntries();
    tableBody.replaceChildren();

    if (entries.length === 0) {
        const row = tableBody.insertRow();
        const cell = row.insertCell();
        cell.colSpan = 3;
        cell.textContent = "No scores yet. Play a game to get on the board!";
        return;
    }

    entries.forEach((entry, index) => {
        const row = tableBody.insertRow();
        row.insertCell().textContent = index + 1;
        row.insertCell().textContent = entry.name;
        row.insertCell().textContent = entry.score;
    });
}

function saveLeaderboardEntry(name, score) {
    const entries = getLeaderboardEntries();
    const newEntry = { name, score, savedAt: Date.now() };

    entries.push(newEntry);
    entries.sort((first, second) =>
        second.score - first.score || first.savedAt - second.savedAt
    );

    const topEntries = entries.slice(0, 10);
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(topEntries));
    return topEntries.indexOf(newEntry) + 1;
}

function isValidRounds(rounds) {
    return Array.isArray(rounds) &&
        rounds.length === ROUNDS_PER_GAME &&
        rounds.every(round =>
            typeof round.image === "string" &&
            typeof round.name === "string" &&
            typeof round.hint === "string"
        );
}

async function getPokemonRound(id) {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}/`);
    if (!response.ok) {
        throw new Error(`Could not load Pokémon ${id} from PokéAPI (${response.status}).`);
    }

    const pokemon = await response.json();
    const image = pokemon.sprites.other?.["official-artwork"]?.front_default ||
        pokemon.sprites.front_default;

    if (typeof pokemon.name !== "string" || typeof image !== "string") {
        throw new Error(`PokéAPI returned incomplete data for Pokémon ${id}.`);
    }

    const name = pokemon.name.replace(/(^|-)([a-z])/g, (_, separator, letter) =>
        `${separator}${letter.toUpperCase()}`
    );
    const types = pokemon.types.map(type => type.type.name).join(" / ");

    return {
        image,
        name,
        hint: types ? `Type: ${types}.` : "Guess the Pokémon!"
    };
}

async function getRandomRounds() {
    const pokemonIds = new Set();
    while (pokemonIds.size < ROUNDS_PER_GAME) {
        const id = Math.floor(Math.random() * MAX_POKEMON_ID) + 1;
        pokemonIds.add(id);
    }

    return Promise.all([...pokemonIds].map(getPokemonRound));
}

function createGameState(mode, rounds) {
    return {
        version: GAME_VERSION,
        mode,
        currentRound: 1,
        score: 0,
        streak: 0,
        wrongAttempts: 0,
        currentRoundAnswered: false,
        completed: false,
        rounds
    };
}

function finishGame(state) {
    if (state.completed) {
        return;
    }

    state.completed = true;
    saveGameState(state);
    window.location.href = "endscreen.html";
}

async function showRoundImage(round, image, hint, resetReveal = false) {
    if (resetReveal) {
        image.classList.add("is-resetting");
        image.classList.remove("is-revealed");
    }

    image.alt = round.name;
    hint.textContent = round.hint;
    await new Promise((resolve, reject) => {
        image.addEventListener("load", resolve, { once: true });
        image.addEventListener("error", () => {
            reject(new Error(`Could not load image ${round.image}.`));
        }, { once: true });
        image.src = round.image;
    });

    if (resetReveal) {
        requestAnimationFrame(() => image.classList.remove("is-resetting"));
    }
}

function setupGame(state) {
    const rounds = state.rounds;
    const image = document.querySelector("#reveal-image, #zoom-image");
    const revealButton = document.querySelector("#reveal-button, #zoom-button");
    const answerForm = document.querySelector("#answer-form");
    const answerInput = document.querySelector("#answer-box");
    const submitButton = answerForm.querySelector('button[type="submit"]');
    const result = document.querySelector("#resultaat");
    const hint = document.querySelector("#hint");
    const nextRoundButton = document.querySelector("#next-round-btn");
    const roundStatus = document.querySelector("#round-status");
    const scoreElement = document.querySelector("#score");
    const streakElement = document.querySelector("#teller");
    let imageFullyRevealed = false;

    if (!Number.isInteger(state.streak) || state.streak < 0) {
        state.streak = 0;
        saveGameState(state);
    }

    function updateStatus() {
        roundStatus.textContent = `Ronde ${state.currentRound} van ${rounds.length}`;
        scoreElement.textContent = `Points: ${state.score}`;
        streakElement.textContent = `Streak: ${state.streak}`;
    }

    function showResult() {
        if (!state.currentRoundAnswered) {
            return;
        }

        answerInput.disabled = true;
        submitButton.hidden = true;
        nextRoundButton.hidden = false;

        if (state.lastAnswerCorrect) {
            const points = state.lastAnswerPoints || 1;
            result.textContent = `Goed geraden! Je krijgt ${points} ${points === 1 ? "punt" : "punten"}.`;
        } else {
            const answer = rounds[state.currentRound - 1].name;
            result.textContent = `Helaas, drie keer fout. Het was ${answer}.`;
        }
    }

    async function startNextRound() {
        if (state.currentRound === rounds.length) {
            finishGame(state);
            return;
        }

        const nextRoundNumber = state.currentRound + 1;
        const nextRound = rounds[nextRoundNumber - 1];
        nextRoundButton.disabled = true;

        try {
            await showRoundImage(nextRound, image, hint, true);
        } catch (error) {
            console.error("Could not load the next round image:", error);
            result.textContent = "Could not load the next image. Please try again.";
            nextRoundButton.disabled = false;
            return;
        }

        state.currentRound = nextRoundNumber;
        state.wrongAttempts = 0;
        state.currentRoundAnswered = false;
        delete state.lastAnswerCorrect;
        delete state.lastAnswerPoints;
        imageFullyRevealed = false;
        saveGameState(state);
        updateStatus();

        answerInput.value = "";
        answerInput.disabled = false;
        submitButton.hidden = false;
        result.textContent = "";
        hint.classList.add("hidden");
        nextRoundButton.hidden = true;
        nextRoundButton.disabled = false;
        revealButton.hidden = false;
    }

    image.addEventListener("error", () => {
        result.textContent = "Could not load the Pokémon image. Please try again.";
    });

    image.addEventListener("transitionend", event => {
        const revealProperty = image.id === "reveal-image" ? "filter" : "transform";
        if (event.target === image &&
            event.propertyName === revealProperty &&
            image.classList.contains("is-revealed")) {
            imageFullyRevealed = true;
        }
    });

    revealButton.addEventListener("click", () => {
        image.classList.add("is-revealed");
        revealButton.hidden = true;
    });

    answerForm.addEventListener("submit", event => {
        event.preventDefault();

        if (state.currentRoundAnswered) {
            return;
        }

        const submittedAnswer = answerInput.value.trim().toLowerCase();
        if (!submittedAnswer) {
            result.textContent = "Vul eerst een antwoord in.";
            return;
        }

        const correctAnswer = rounds[state.currentRound - 1].name
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "");
        const normalizedAnswer = submittedAnswer.replace(/[^a-z0-9]/g, "");

        if (normalizedAnswer === correctAnswer) {
            state.currentRoundAnswered = true;
            state.lastAnswerCorrect = true;
            state.lastAnswerPoints = imageFullyRevealed ? 1 : 2;
            state.score += state.lastAnswerPoints;
            state.streak += 1;
            saveGameState(state);
            updateStatus();
            showResult();
            return;
        }

        state.wrongAttempts += 1;
        if (state.wrongAttempts >= HINT_AFTER_ATTEMPTS) {
            hint.classList.remove("hidden");
        }

        if (state.wrongAttempts >= MAX_WRONG_ATTEMPTS) {
            state.currentRoundAnswered = true;
            state.lastAnswerCorrect = false;
            saveGameState(state);
            showResult();
            return;
        }

        result.textContent = "Fout antwoord! Probeer het nog eens.";
        saveGameState(state);
    });

    nextRoundButton.addEventListener("click", startNextRound);

    return showRoundImage(
        rounds[state.currentRound - 1],
        image,
        hint
    ).then(() => {
        updateStatus();

        if (state.wrongAttempts >= HINT_AFTER_ATTEMPTS) {
            hint.classList.remove("hidden");
        }

        showResult();
        window.setTimeout(() => finishGame(state), 3 * 60 * 1000);
    });
}

function setupResults(state) {
    const score = state ? state.score : 0;
    const roundCount = state && isValidRounds(state.rounds) ? state.rounds.length : 0;

    document.querySelector("#finalScore").textContent = score;
    document.querySelector("#resultSummary").textContent =
        `Je hebt ${score} van de ${roundCount * 2} punten gehaald.`;
}

function setupLeaderboard(state) {
    const form = document.querySelector("#leaderboard-form");
    const message = document.querySelector("#leaderboard-message");
    if (!form || !message) {
        return;
    }

    if (!state || state.leaderboardSubmitted) {
        form.hidden = true;
        if (state && state.leaderboardSubmitted) {
            message.textContent = "Je score is al opgeslagen.";
        }
        return;
    }

    form.addEventListener("submit", event => {
        event.preventDefault();

        const name = document.querySelector("#leaderboard-name").value.trim();
        if (!name) {
            message.textContent = "Vul eerst je naam in.";
            return;
        }

        const rank = saveLeaderboardEntry(name, state.score);
        state.leaderboardSubmitted = true;
        saveGameState(state);
        form.hidden = true;
        message.textContent = rank
            ? `Score opgeslagen! Je staat op plek ${rank}.`
            : "Score opgeslagen, maar helaas niet in de Top 10.";
        showLeaderboard();
    });
}

function setupInfoButton() {
    const infoButton = document.querySelector("#info");
    const infoBox = document.querySelector("#blokje");

    if (infoButton && infoBox) {
        infoButton.addEventListener("click", () => {
            infoBox.classList.toggle("hidden");
        });
    }
}

function setupEndScreen() {
    const playAgainButton = document.querySelector("#playAgainBtn");
    const homeButton = document.querySelector("#homeBtn");

    if (playAgainButton) {
        playAgainButton.addEventListener("click", () => {
            const state = getGameState();
            const gamePage = state && ["blur", "zoom"].includes(state.mode)
                ? `${state.mode}.html`
                : "index.html";

            sessionStorage.removeItem(GAME_STATE_KEY);
            window.location.href = gamePage;
        });
    }

    if (homeButton) {
        homeButton.addEventListener("click", () => {
            sessionStorage.removeItem(GAME_STATE_KEY);
            window.location.href = "index.html";
        });
    }
}

async function initializeGame() {
    setupInfoButton();
    showLeaderboard();

    const gameMode = document.body.dataset.gameMode;
    const isResultsPage = Boolean(document.querySelector("#finalScore"));
    if (!gameMode && !isResultsPage) {
        setupEndScreen();
        return;
    }

    let gameState = getGameState();
    if (gameMode) {
        const needsNewGame = !gameState ||
            gameState.mode !== gameMode ||
            gameState.completed ||
            gameState.version !== GAME_VERSION ||
            !isValidRounds(gameState.rounds) ||
            !Number.isInteger(gameState.currentRound) ||
            gameState.currentRound < 1 ||
            gameState.currentRound > gameState.rounds.length;

        if (needsNewGame) {
            const roundStatus = document.querySelector("#round-status");
            roundStatus.textContent = "Loading random Pokémon...";
            gameState = createGameState(gameMode, await getRandomRounds());
            saveGameState(gameState);
        } else if (typeof gameState.wrongAttempts !== "number") {
            gameState.wrongAttempts = 0;
        }

        await setupGame(gameState);
    }

    if (isResultsPage) {
        setupResults(gameState);
        setupLeaderboard(gameState);
        setupEndScreen();
    }
}

initializeGame().catch(error => {
    console.error("Could not initialize the game:", error);

    const message = "Could not load random Pokémon. Check your internet connection and try again.";
    const roundStatus = document.querySelector("#round-status");
    const resultSummary = document.querySelector("#resultSummary");

    if (roundStatus) {
        roundStatus.textContent = message;
    }
    if (resultSummary) {
        resultSummary.textContent = message;
    }
});
