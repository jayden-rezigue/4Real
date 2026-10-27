const revealBtn = document.querySelector("#reveal-button");
const revealImg = document.querySelector("#reveal-image");
const btnSubmit = document.getElementById("answer-btn"); 
const answer = document.getElementById("answer-box"); 
const result = document.getElementById("resultaat");
const hint = document.getElementById("hint");
let wrongAttempts = 0;

if (revealBtn && revealImg) {
    revealBtn.addEventListener("click", () => {
        revealImg.classList.add("is-revealed");
        revealBtn.remove();
    });
}
const zoomBtn = document.querySelector("#zoom-button");
const zoomImg = document.querySelector("#zoom-image");

if (zoomBtn && zoomImg) {
    zoomBtn.addEventListener("click", () => {
        zoomImg.classList.add("is-revealed");
        zoomBtn.remove();
    });
}
const info = document.getElementById('info')
const blokje = document.querySelector('#blokje')

info.addEventListener('click', () => {
    console.log('hoi');
    blokje.classList.toggle('hidden');
});

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