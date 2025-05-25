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
  }, { threshold: 0.5 });

  blinkText.forEach(element => {
    let characters = element.textContent.split('');
    characters = characters.map((e, i) => `<span style="animation-delay: ${0.05 * i}s">${e}</span>`);
    element.innerHTML = characters.join('');
    observer.observe(element);
  });
  console.log('initBlinkText: Initialized');
}

export function animateBackground() {
  const body = document.querySelector('body');
  body.style.background = 'linear-gradient(270deg, #e0c3fc, #8ec5fc, #c3e0fc, #fc8ec5)';
  body.style.backgroundSize = '400% 400%';
  body.style.animation = 'gradientShift 10s ease infinite';
  console.log('animateBackground: Applied gradient animation');
}

export function sparkleMouseEffect() {
  const colors = ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#FF8E53'];
  const handler = (e) => {
    const sparkle = document.createElement('div');
    sparkle.classList.add('sparkle');
    sparkle.style.left = `${e.pageX}px`;
    sparkle.style.top = `${e.pageY}px`;
    const color = colors[Math.floor(Math.random() * colors.length)];
    sparkle.style.background = color;
    sparkle.style.boxShadow = `0 0 5px ${color}`;
    document.body.appendChild(sparkle);

    setTimeout(() => {
      sparkle.remove();
    }, 600);
  };

  document.addEventListener('mousemove', handler);
  console.log('sparkleMouseEffect: Initialized');
  return () => {
    document.removeEventListener('mousemove', handler);
    console.log('sparkleMouseEffect: Cleaned up');
  };
}

export function initGradientTextHover() {
  const blinkText = document.querySelectorAll('.blink-text');
  blinkText.forEach(element => {
    element.addEventListener('mouseenter', () => {
      element.classList.add('gradient-hover-animation');
    });
    element.addEventListener('mouseleave', () => {
      element.classList.remove('gradient-hover-animation');
    });
  });
  console.log('initGradientTextHover: Initialized');
}

export function initTypewriterPlaceholder() {
  const inputs = document.querySelectorAll('#content, .story-input');
  if (!inputs.length) {
    console.warn('initTypewriterPlaceholder: No inputs found');
    return;
  }
  inputs.forEach(input => {
    const placeholderText = input.getAttribute('data-placeholder') || input.placeholder;
    input.placeholder = '';

    input.addEventListener('focus', () => {
      let i = 0;
      input.placeholder = '';
      const interval = setInterval(() => {
        input.placeholder += placeholderText.charAt(i);
        i++;
        if (i > placeholderText.length) clearInterval(interval);
      }, 50);
    });

    input.addEventListener('blur', () => {
      input.placeholder = placeholderText;
    });
  });
  console.log('initTypewriterPlaceholder: Initialized');
}

export function initStoryParallax() {
  const storyItems = document.querySelectorAll('.story-item');
  if (!storyItems.length) {
    console.warn('initStoryParallax: No story items found');
    return;
  }
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    storyItems.forEach(el => {
      const speed = parseFloat(el.dataset.speed) || 0.2;
      el.style.transform = `translateY(${scrollY * speed}px)`;
    });
  });
  console.log('initStoryParallax: Initialized');
}

export function initBubbleEffect() {
  const textarea = document.querySelector('#content, .storys-input');
  if (!textarea) {
    console.warn('initBubbleEffect: No textarea found with #content or .storys-input');
    return;
  }
  console.log('initBubbleEffect: Textarea found, attaching listener');

  const icons = ['❤️', '⭐', '😊', '🌟', '💖'];
  const colors = ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#FF8E53'];
  let lastBubbleTime = 0;

  const handler = (e) => {
    const now = Date.now();
    if (now - lastBubbleTime < 100) return;
    lastBubbleTime = now;
    const rect = textarea.getBoundingClientRect();
    console.log(`initBubbleEffect: Input detected, creating bubble at (${rect.right - 20}, ${rect.bottom - 20})`);

    const bubble = document.createElement('div');
    bubble.classList.add('bubble');
    const icon = icons[Math.floor(Math.random() * icons.length)];
    const color = colors[Math.floor(Math.random() * colors.length)];
    bubble.innerHTML = icon;
    bubble.classList.add(`bubble-${color.toLowerCase().replace('#', '')}`);
    bubble.style.left = `${rect.right - 20}px`;
    bubble.style.top = `${rect.bottom - 20}px`;
    document.body.appendChild(bubble);

    setTimeout(() => {
      bubble.remove();
    }, 1500);
  };

  textarea.addEventListener('input', handler);
  console.log('initBubbleEffect: Listener attached');
  return () => {
    textarea.removeEventListener('input', handler);
    console.log('initBubbleEffect: Listener removed');
  };
}

export function initRainbowSmokeEffect() {
  const textarea = document.querySelector('#content, .story-input');
  if (!textarea) {
    console.warn('initRainbowSmokeEffect: No textarea found with #content or .story-input');
    return;
  }
  console.log('initRainbowSmokeEffect: Textarea found, attaching listener');

  const colors = ['#FF0000', '#FFA500', '#FFFF00', '#008000', '#0000FF', '#4B0082', '#EE82EE'];
  let lastSmokeTime = 0;

  const handler = (e) => {
    const now = Date.now();
    if (now - lastSmokeTime < 100) return;
    lastSmokeTime = now;
    const rect = textarea.getBoundingClientRect();
    console.log(`initRainbowSmokeEffect: Input detected, creating smoke at (${rect.right - 20}, ${rect.bottom - 20})`);

    const smoke = document.createElement('div');
    smoke.classList.add('rainbow-smoke');
    const color = colors[Math.floor(Math.random() * colors.length)];
    smoke.classList.add(`smoke-${color.toLowerCase().replace('#', '')}`);
    smoke.style.left = `${rect.right - 20}px`;
    smoke.style.top = `${rect.bottom - 20}px`;
    document.body.appendChild(smoke);

    setTimeout(() => {
      smoke.remove();
    }, 1000);
  };

  textarea.addEventListener('input', handler);
  console.log('initRainbowSmokeEffect: Listener attached');
  return () => {
    textarea.removeEventListener('input', handler);
    console.log('initRainbowSmokeEffect: Listener removed');
  };
}

export function initButtonRipple() {
  const buttons = document.querySelectorAll('.submit-button');
  if (!buttons.length) {
    console.warn('initButtonRipple: No buttons found with .submit-button');
    return;
  }
  buttons.forEach(button => {
    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.addEventListener('click', e => {
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      const ripple = document.createElement('span');
      ripple.classList.add('ripple-modern');
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      button.appendChild(ripple);
      console.log('initButtonRipple: Ripple created');
      setTimeout(() => ripple.remove(), 600);
    });
  });
  console.log('initButtonRipple: Initialized');
}

export function initHeaderPulse() {
  const headers = document.querySelectorAll('.add-story-header');
  if (!headers.length) {
    console.warn('initHeaderPulse: No headers found with .add-story-header');
    return;
  }
  headers.forEach(header => {
    header.classList.add('header-pulse');
  });
  console.log('initHeaderPulse: Initialized');
}


//Ripple Effect
export function initRippleEffect() {
  const rippleButtons = document.querySelectorAll('.ripple-button');
  if (!rippleButtons.length) {
    console.warn('initRippleEffect: No elements with class .ripple-button found');
    return;
  }

  rippleButtons.forEach(button => {
    button.style.position = 'relative';
    button.style.overflow = 'hidden';

    button.addEventListener('click', function (e) {
      const circle = document.createElement("span");
      circle.classList.add("ripple");
      
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      circle.style.width = circle.style.height = `${size}px`;
      circle.style.left = `${e.clientX - rect.left - size / 2}px`;
      circle.style.top = `${e.clientY - rect.top - size / 2}px`;

      this.appendChild(circle);
      setTimeout(() => circle.remove(), 600);
    });
  });

  console.log('initRippleEffect: Initialized');
}


// Magnetic Button Hover
export function initMagnetEffect() {
  const magnets = document.querySelectorAll('.magnet');

  magnets.forEach(magnet => {
    magnet.addEventListener('mousemove', (e) => {
      const rect = magnet.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      magnet.style.transform = `translate(${x * 0.6}px, ${y * 0.6}px)`;
    });

    magnet.addEventListener('mouseleave', () => {
      magnet.style.transform = 'translate(0, 0)';
    });
  });

  console.log('initMagnetEffect: Initialized');
}
