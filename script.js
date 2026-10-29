
const scoreElement = document.querySelector("#score");
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
