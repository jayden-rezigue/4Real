const revealBtn = document.querySelector("#reveal-button");
const revealImg = document.querySelector("#reveal-image");
const btnSubmit = document.getElementById("answer-btn"); 
const answer = document.getElementById("answer-box"); 
const result = document.getElementById("resultaat");

if (revealBtn && revealImg) {
    revealBtn.addEventListener("click", () => {
        revealImg.classList.add("is-revealed");
        revealBtn.remove();
    });
}
const zoomBtn = document.querySelector("#zoom-button");
const zoomImg = document.querySelector("#zoom-image");

if (revealImg || zoomImg) {
    window.setTimeout(() => {
        window.location.href = "endscreen.html";
    }, 3 * 60 * 1000);
}

if (zoomBtn && zoomImg) {
    zoomBtn.addEventListener("click", () => {
        zoomImg.classList.add("is-revealed");
        zoomBtn.remove();
    });
}
const info = document.getElementById('info');
const blokje = document.querySelector('#blokje');

if (info && blokje) {
    info.addEventListener('click', () => {
        blokje.classList.toggle('hidden');
    });
}

if (btnSubmit && answer && result) {
    btnSubmit.addEventListener("click", function () {
        if (answer.value.trim() === "") {
            result.textContent = "Niks ingevuld";
        } else {
            result.textContent = answer.value + " is het goede antwoord";
        }
    });
}

const playAgainBtn = document.getElementById("playAgainBtn");
const homeBtn = document.getElementById("homeBtn");

if (playAgainBtn) {
    playAgainBtn.addEventListener("click", () => {
        const previousPage = new URL(document.referrer, window.location.href);
        const gamePages = ["blur.html", "zoom.html"];
        const gamePage = gamePages.find(page => previousPage.pathname.endsWith(`/${page}`));

        window.location.href = gamePage || "index.html";
    });
}

if (homeBtn) {
    homeBtn.addEventListener("click", () => {
        window.location.href = "index.html";
    });
}
