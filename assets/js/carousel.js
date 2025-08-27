const track = document.querySelector('.carousel-track');
const slides = document.querySelectorAll('.carousel img');
const prev = document.querySelector('.prev');
const next = document.querySelector('.next');
let index = 0;

function updateSlidePosition() {
     track.style.transform = `translateX(-${index * 100}vw)`;
}

prev.addEventListener('click', () => {
     index = (index - 1 + slides.length) % slides.length;
     updateSlidePosition();
});

next.addEventListener('click', () => {
     index = (index + 1) % slides.length;
     updateSlidePosition();
});

// Optional autoplay
let interval = setInterval(() => next.click(), 3000);

// mouseover
track.closest(".carousel").onmouseover = function () {
     clearInterval(interval);
}

track.closest(".carousel").onmouseout = function () {
     interval = setInterval(() => next.click(), 3000);
}