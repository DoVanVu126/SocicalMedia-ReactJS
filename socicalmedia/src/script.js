// src/script.js
export function initBlinkText() {
  const blinkText = document.querySelectorAll('.blink-text');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('blink-text-animation');
      } else {
        e.target.classList.remove('blink-text-animation');
      }
    });
  }, {
    threshold: 0.5
  });

  blinkText.forEach(element => {
    let characters = element.textContent.split('');
    characters = characters.map((e, i) => `<span style="animation-delay: ${0.05 * i}s">${e}</span>`);
    element.innerHTML = characters.join('');
    observer.observe(element);
  });
}