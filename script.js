const info = document.getElementById('info')
const blokje = document.querySelector('#blokje')

info.addEventListener('click', () => {
    console.log('hoi');
    blokje.classList.toggle('hidden');
});