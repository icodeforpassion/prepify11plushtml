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

  const setupMobileNavigation = () => {
    const menu = doc.querySelector('[data-mobile-menu]');
    const toggles = doc.querySelectorAll('[data-mobile-toggle]');
    if (!menu || !toggles.length) return;

    let isOpen = menu.getAttribute('aria-hidden') === 'false';
    const previousOverflow = doc.body.style.overflow;

    const syncToggleState = () => {
      toggles.forEach((toggle) => {
        toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });
      menu.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
      if (isOpen) {
        doc.body.classList.add('mobile-menu-open');
        doc.body.style.overflow = 'hidden';
      } else {
        doc.body.classList.remove('mobile-menu-open');
        doc.body.style.overflow = previousOverflow;
      }
    };

    const openMenu = () => {
      if (isOpen) return;
      isOpen = true;
      syncToggleState();
      const firstLink = menu.querySelector('a, button');
      if (firstLink) {
        firstLink.focus();
      }
    };

    const closeMenu = () => {
      if (!isOpen) return;
      isOpen = false;
      syncToggleState();
      const primaryToggle = toggles[0];
      primaryToggle?.focus?.();
    };

    const toggleMenu = (event) => {
      event.preventDefault();
      isOpen ? closeMenu() : openMenu();
    };

    toggles.forEach((toggle) => {
      toggle.addEventListener('click', toggleMenu);
    });

    menu.addEventListener('click', (event) => {
      if (event.target === menu) {
        closeMenu();
      }
    });

    menu.querySelectorAll('a[href], button').forEach((link) => {
      link.addEventListener('click', () => {
        if (link.dataset.mobileToggle !== undefined) return;
        closeMenu();
      });
    });

    doc.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeMenu();
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 960) {
        closeMenu();
      }
    });

    syncToggleState();
  };

  const setupFaqAccordions = () => {
    const items = doc.querySelectorAll('.faq-item');
    if (!items.length) return;

    items.forEach((item, index) => {
      const button = item.querySelector('.faq-question');
      const answer = item.querySelector('.faq-answer');
      if (!button || !answer) return;

      const answerId = answer.id || `faq-answer-${index + 1}`;
      answer.id = answerId;
      button.setAttribute('aria-controls', answerId);

      const expanded = item.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      answer.setAttribute('aria-hidden', expanded ? 'false' : 'true');

      button.addEventListener('click', () => {
        const isExpanded = item.getAttribute('aria-expanded') === 'true';
        const nextState = !isExpanded;
        item.setAttribute('aria-expanded', nextState ? 'true' : 'false');
        button.setAttribute('aria-expanded', nextState ? 'true' : 'false');
        answer.setAttribute('aria-hidden', nextState ? 'false' : 'true');
      });
    });
  };

  const loadAnalytics = () => {
    if (doc.documentElement.dataset.analyticsLoaded === 'true') return;
    doc.documentElement.dataset.analyticsLoaded = 'true';

    const placeholders = doc.querySelectorAll('[data-analytics], [data-analytics-src], [data-analytics-inline]');
    placeholders.forEach((node) => {
      const inlineAttr = node.getAttribute('data-analytics-inline');
      if (inlineAttr !== null) {
        const script = doc.createElement('script');
        script.textContent = inlineAttr || node.textContent || '';
        doc.head.appendChild(script);
        return;
      }

      const src =
        node.getAttribute('data-analytics-src') ||
        node.getAttribute('data-src') ||
        (node.tagName === 'SCRIPT' ? node.getAttribute('src') : null);
      if (src) {
        const script = doc.createElement('script');
        script.src = src;
        if (node.getAttribute('data-analytics-async') !== 'false') {
          script.async = true;
        }
        if (node.getAttribute('data-analytics-defer') === 'true') {
          script.defer = true;
        }
        doc.head.appendChild(script);
        return;
      }

      if (node.tagName === 'SCRIPT' && node.textContent.trim()) {
        const script = doc.createElement('script');
        script.textContent = node.textContent;
        doc.head.appendChild(script);
      }
    });

    if (typeof window.PrepifyAnalyticsLoader === 'function') {
      window.PrepifyAnalyticsLoader();
    }
  };

  const setupConsentBanner = () => {
    const banner = doc.querySelector('[data-consent-banner]');
    if (!banner) return;

    const accept = banner.querySelector('[data-consent-accept]');
    const decline = banner.querySelector('[data-consent-decline]');
    const storageKey = 'prepify11plus.consent';
    const stored = localStorage.getItem(storageKey);

    const hideBanner = () => {
      banner.setAttribute('aria-hidden', 'true');
    };

    const showBanner = () => {
      banner.setAttribute('aria-hidden', 'false');
    };

    if (stored === 'accepted') {
      hideBanner();
      loadAnalytics();
      return;
    }

    if (stored === 'declined') {
      hideBanner();
      return;
    }

    showBanner();

    accept?.addEventListener('click', () => {
      localStorage.setItem(storageKey, 'accepted');
      hideBanner();
      loadAnalytics();
    });

    decline?.addEventListener('click', () => {
      localStorage.setItem(storageKey, 'declined');
      hideBanner();
    });
  };

  const setupSmoothScroll = () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const anchors = doc.querySelectorAll('a[href^="#"]:not([href="#"])');
    if (!anchors.length) return;

    anchors.forEach((anchor) => {
      anchor.addEventListener('click', (event) => {
        const hash = anchor.getAttribute('href');
        if (!hash || hash.charAt(0) !== '#') return;

        const target = doc.querySelector(hash);
        if (!target) return;

        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (target.tabIndex === -1 && !target.hasAttribute('tabindex')) {
          target.setAttribute('tabindex', '-1');
        }
        if (typeof target.focus === 'function') {
          target.focus({ preventScroll: true });
        }
        if (history.pushState) {
          history.pushState(null, '', hash);
        }
      });
    });
  };

  const init = () => {
    setCurrentYear();
    setupQuotes();
    setupSound();
    setupMobileNavigation();
    setupFaqAccordions();
    setupConsentBanner();
    setupSmoothScroll();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
