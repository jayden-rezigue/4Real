const revealBtn = document.querySelector("#reveal-button");
const revealImg = document.querySelector("#reveal-image");

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
