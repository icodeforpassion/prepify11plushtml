/* Main site interactions: theming, navigation, accordions, modals, analytics consent */
(function () {
  const doc = document;
  const body = doc.body;
  const root = doc.documentElement;
  const themeToggles = Array.from(doc.querySelectorAll('[data-theme-toggle]'));
  const mobileToggle = doc.querySelector('[data-mobile-toggle]');
  const mobileMenu = doc.querySelector('[data-mobile-menu]');
  const quickPracticeModal = doc.querySelector('#quick-practice-modal');
  const quickPracticeTrigger = doc.querySelector('[data-quick-practice]');
  const quickPracticeClose = quickPracticeModal?.querySelector('[data-close-modal]');
  const faqItems = doc.querySelectorAll('.faq-item');
  const consentBanner = doc.querySelector('[data-consent-banner]');
  const consentAccept = doc.querySelector('[data-consent-accept]');
  const consentDecline = doc.querySelector('[data-consent-decline]');

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Theming
  const themeStorageKey = 'elevenspark-theme';
  const safeStorage = {
    get() {
      try {
        return window.localStorage.getItem(themeStorageKey);
      } catch (error) {
        return null;
      }
    },
    set(value) {
      try {
        window.localStorage.setItem(themeStorageKey, value);
      } catch (error) {
        /* ignore storage errors */
      }
    },
  };

  const applyTheme = (theme) => {
    const resolvedTheme = theme === 'light' ? 'light' : 'dark';
    root.setAttribute('data-theme', resolvedTheme);
    themeToggles.forEach((toggle) => {
      toggle.dataset.mode = resolvedTheme;
      toggle.setAttribute('aria-pressed', String(resolvedTheme === 'dark'));
    });
  };

  const storedTheme = safeStorage.get();
  const initialTheme = storedTheme || root.getAttribute('data-theme') || 'dark';
  applyTheme(initialTheme);

  themeToggles.forEach((toggle) => {
    toggle.addEventListener('click', () => {
      const nextTheme = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(nextTheme);
      safeStorage.set(nextTheme);
    });
  });

  const trapFocus = (container) => {
    const focusable = container.querySelectorAll(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable.length) return () => {};
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    return (event) => {
      if (event.key !== 'Tab') return;
      if (event.shiftKey && doc.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && doc.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
  };

  const toggleMobileMenu = (open) => {
    if (!mobileMenu || !mobileToggle) return;
    const isOpen = open ?? mobileMenu.getAttribute('aria-hidden') === 'true';
    mobileMenu.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
    mobileToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    body.classList.toggle('no-scroll', isOpen);
    if (isOpen) {
      mobileMenu.querySelector('a, button')?.focus();
    } else {
      mobileToggle.focus();
    }
  };

  mobileToggle?.addEventListener('click', () => toggleMobileMenu());
  mobileMenu?.addEventListener('click', (event) => {
    if (event.target === mobileMenu) toggleMobileMenu(false);
  });
  doc.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && mobileMenu?.getAttribute('aria-hidden') === 'false') {
      toggleMobileMenu(false);
    }
  });

  // FAQ accordions
  faqItems.forEach((item) => {
    const button = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    const answerId = answer?.id || `faq-${Math.random().toString(36).slice(2, 8)}`;
    if (!button || !answer) return;
    answer.id = answerId;
    button.setAttribute('aria-controls', answerId);
    button.setAttribute('aria-expanded', 'false');
    item.setAttribute('aria-expanded', 'false');
    answer.setAttribute('role', 'region');

    button.addEventListener('click', () => {
      const expanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!expanded));
      item.setAttribute('aria-expanded', String(!expanded));
    });
  });

  // Quick practice modal
  let releaseFocus = () => {};
  const openModal = () => {
    if (!quickPracticeModal) return;
    quickPracticeModal.setAttribute('aria-hidden', 'false');
    releaseFocus = trapFocus(quickPracticeModal);
    doc.addEventListener('keydown', handleEscModal);
    doc.addEventListener('keydown', releaseFocus);
    quickPracticeModal.querySelector('button, a, input')?.focus();
  };

  const closeModal = () => {
    if (!quickPracticeModal) return;
    quickPracticeModal.setAttribute('aria-hidden', 'true');
    doc.removeEventListener('keydown', handleEscModal);
    doc.removeEventListener('keydown', releaseFocus);
    quickPracticeTrigger?.focus();
  };

  const handleEscModal = (event) => {
    if (event.key === 'Escape') closeModal();
  };

  quickPracticeTrigger?.addEventListener('click', (event) => {
    event.preventDefault();
    openModal();
  });

  quickPracticeClose?.addEventListener('click', () => closeModal());
  quickPracticeModal?.addEventListener('click', (event) => {
    if (event.target === quickPracticeModal) closeModal();
  });

  // Consent banner & optional analytics
  const analyticsId = doc.documentElement.dataset.gaId || '';
  const shouldShowConsent = Boolean(analyticsId);
  const loadAnalytics = () => {
    if (!analyticsId) return;
    const script = doc.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${analyticsId}`;
    script.async = true;
    doc.head.appendChild(script);
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    gtag('js', new Date());
    gtag('config', analyticsId, { anonymize_ip: true });
  };

  const storageKey = 'elevenspark-consent';
  const existingConsent = shouldShowConsent ? sessionStorage.getItem(storageKey) : 'declined';
  if (shouldShowConsent && !existingConsent) {
    consentBanner?.setAttribute('aria-hidden', 'false');
  } else if (existingConsent === 'accepted') {
    loadAnalytics();
  }

  consentAccept?.addEventListener('click', () => {
    sessionStorage.setItem(storageKey, 'accepted');
    consentBanner?.setAttribute('aria-hidden', 'true');
    loadAnalytics();
  });

  consentDecline?.addEventListener('click', () => {
    sessionStorage.setItem(storageKey, 'declined');
    consentBanner?.setAttribute('aria-hidden', 'true');
  });

  // Smooth scroll for anchor links
  doc.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
      const targetId = anchor.getAttribute('href').slice(1);
      const target = doc.getElementById(targetId);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      target.focus({ preventScroll: true });
    });
  });
})();
