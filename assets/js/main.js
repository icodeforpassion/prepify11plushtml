(function () {
  const doc = document;

  window.PrepifyFX = window.PrepifyFX || {
    play: () => {},
    celebrate: () => {},
    sparkle: () => {},
  };

  const setCurrentYear = () => {
    const target = doc.getElementById('currentYear');
    if (target) {
      target.textContent = new Date().getFullYear();
    }
  };

  const setupQuotes = () => {
    const quoteText = doc.querySelector('[data-quote-text]');
    const refreshButton = doc.querySelector('[data-quote-refresh]');
    if (!quoteText) return;

    let quotes = [];
    let lastIndex = -1;

    const pickQuote = () => {
      if (!quotes.length) return;
      let index;
      do {
        index = Math.floor(Math.random() * quotes.length);
      } while (quotes.length > 1 && index === lastIndex);
      lastIndex = index;
      quoteText.textContent = quotes[index];
    };

    fetch('data/quotes.json')
      .then((res) => res.json())
      .then((data) => {
        quotes = Array.isArray(data) ? data : [];
        if (quotes.length) pickQuote();
      })
      .catch(() => {
        quotes = ['Progress, not perfection.'];
        pickQuote();
      });

    refreshButton?.addEventListener('click', pickQuote);
  };

  const setupSound = () => {
    const toggle = doc.querySelector('[data-sound-toggle]');
    const noop = {
      play: () => {},
      celebrate: () => {},
      sparkle: () => {},
    };

    if (!window.PrepifyFX) {
      window.PrepifyFX = { ...noop };
    }

    if (!toggle) {
      Object.assign(window.PrepifyFX, noop);
      return;
    }

    const icon = toggle.querySelector('.sound-icon');
    const label = toggle.querySelector('.sound-label');
    const storageKey = 'prepify11plus.sound';
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const stored = localStorage.getItem(storageKey);
    let enabled = stored ? stored === 'on' : false;
    let audioContext;

    const ensureContext = () => {
      if (!enabled) return null;
      if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioContext.state === 'suspended') audioContext.resume();
      return audioContext;
    };

    const playTone = (frequency = 660, duration = 0.18) => {
      const context = ensureContext();
      if (!context) return;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.001, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.2, context.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + duration);
    };

    const spawnConfetti = () => {
      if (prefersReducedMotion) return;
      const container = doc.createElement('div');
      container.className = 'confetti';
      for (let i = 0; i < 20; i += 1) {
        const piece = doc.createElement('span');
        piece.className = 'confetti-piece';
        piece.style.setProperty('--x', `${Math.random() * 100}vw`);
        piece.style.setProperty('--delay', `${Math.random()}s`);
        piece.style.setProperty('--rotation', `${Math.random() * 360}deg`);
        container.appendChild(piece);
      }
      doc.body.appendChild(container);
      setTimeout(() => container.remove(), 1500);
    };

    const sparkle = () => {
      if (prefersReducedMotion) return;
      doc.body.classList.remove('sparkle-flash');
      void doc.body.offsetWidth;
      doc.body.classList.add('sparkle-flash');
      setTimeout(() => doc.body.classList.remove('sparkle-flash'), 400);
    };

    Object.assign(window.PrepifyFX, {
      play(type) {
        if (!enabled) return;
        const tones = {
          success: 760,
          error: 280,
          start: 520,
          bookmark: 620,
          reveal: 680,
        };
        playTone(tones[type] || 520);
      },
      celebrate: spawnConfetti,
      sparkle,
    });

    const updateToggle = () => {
      toggle.setAttribute('aria-pressed', enabled ? 'true' : 'false');
      if (icon) icon.textContent = enabled ? '🔊' : '🔇';
      if (label) label.textContent = enabled ? 'Sound FX on' : 'Sound FX off';
    };

    toggle.addEventListener('click', () => {
      enabled = !enabled;
      localStorage.setItem(storageKey, enabled ? 'on' : 'off');
      updateToggle();
      if (enabled) {
        playTone(540, 0.12);
      }
    });

    if (enabled) ensureContext();
    updateToggle();
  };

  const init = () => {
    setCurrentYear();
    setupQuotes();
    setupSound();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
