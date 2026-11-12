
const scoreElement = document.querySelector("#score");
const streakElement = document.querySelector("#teller");
const revealBtn = document.querySelector("#reveal-button");
const revealImg = document.querySelector("#reveal-image");
const zoomBtn = document.querySelector("#zoom-button");
const zoomImg = document.querySelector("#zoom-image");

const btnSubmit = document.getElementById("answer-btn");
const answer = document.getElementById("answer-box");
const result = document.getElementById("resultaat");

const info = document.getElementById("info");
const blokje = document.querySelector("#blokje");

const goedAntwoord = "cat";

let score = 0;
let streak = 0;
let revealComplete = false;
let pendingRevealTransitions = new Set();
let answeredCorrectly = false;


if (revealBtn && revealImg) {
    revealImg.addEventListener("transitionend", event => {
        pendingRevealTransitions.delete(event.propertyName);
        if (pendingRevealTransitions.size === 0 && revealImg.classList.contains("is-revealed")) {
            revealComplete = true;
        }
    });
    revealBtn.addEventListener("click", () => {
        pendingRevealTransitions = new Set(["filter", "opacity"]);
        revealImg.classList.add("is-revealed");
        revealBtn.remove();
    });
}


if (zoomBtn && zoomImg) {
    zoomImg.addEventListener("transitionend", event => {
        pendingRevealTransitions.delete(event.propertyName);
        if (pendingRevealTransitions.size === 0 && zoomImg.classList.contains("is-revealed")) {
            revealComplete = true;
        }
    });
    zoomBtn.addEventListener("click", () => {
        pendingRevealTransitions = new Set(["transform"]);
        zoomImg.classList.add("is-revealed");
        zoomBtn.remove();
    });
}


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
                const points = getPoints();
                result.textContent = `Goed antwoord! +${points} punt${points === 1 ? "" : "en"}.`;
                updateScore(points);
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
    streak += 1;
    if (streakElement) {
        streakElement.textContent = `Streak: ${streak}`;
    }
}


function getPoints() {
    return revealComplete ? 1 : 2;
}
