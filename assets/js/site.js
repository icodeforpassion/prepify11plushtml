(() => {
  const doc = document;

  const assetRoot = (() => {
    const rootAttr = doc.body?.dataset?.root || '.';
    if (rootAttr === '/' || rootAttr === '') {
      return '';
    }
    return rootAttr.endsWith('/') ? rootAttr.slice(0, -1) : rootAttr;
  })();

  const resolvePath = (path) => {
    if (!path) return path;
    return `${assetRoot}/${path.replace(/^\//, '')}`;
  };

  const setCurrentYear = () => {
    const year = String(new Date().getFullYear());
    doc.querySelectorAll('#currentYear, [data-year]').forEach((node) => {
      node.textContent = year;
    });
  };

  const initQuoteStrip = () => {
    const quoteText = doc.querySelector('[data-quote-text]');
    if (!quoteText) return;

    const refreshButton = doc.querySelector('[data-quote-refresh]');
    let quotes = [];
    let lastIndex = -1;

    const showQuote = () => {
      if (!quotes.length) return;
      let index = 0;
      if (quotes.length > 1) {
        do {
          index = Math.floor(Math.random() * quotes.length);
        } while (index === lastIndex);
      }
      lastIndex = index;
      quoteText.textContent = quotes[index];
    };

    fetch(resolvePath('data/quotes.json'))
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data) && data.length) {
          quotes = data;
        } else {
          quotes = ['Practice little and often for the 11+ win.'];
        }
        showQuote();
      })
      .catch(() => {
        quotes = ['Practice little and often for the 11+ win.'];
        showQuote();
      });

    refreshButton?.addEventListener('click', () => {
      showQuote();
      refreshButton.disabled = true;
      window.setTimeout(() => {
        refreshButton.disabled = false;
      }, 400);
    });
  };

  const initNavigation = () => {
    const toggle = doc.querySelector('[data-nav-toggle]');
    const menu = doc.querySelector('[data-nav-menu]');
    if (!toggle || !menu) return;

    const closeMenu = () => {
      menu.setAttribute('data-open', 'false');
      toggle.setAttribute('aria-expanded', 'false');
    };

    toggle.addEventListener('click', () => {
      const isOpen = menu.getAttribute('data-open') === 'true';
      if (isOpen) {
        closeMenu();
      } else {
        menu.setAttribute('data-open', 'true');
        toggle.setAttribute('aria-expanded', 'true');
        const firstLink = menu.querySelector('a, button');
        firstLink?.focus();
      }
    });

    doc.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeMenu();
      }
    });

    menu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => closeMenu());
    });
  };


  const initFundingBars = () => {
    doc.querySelectorAll('[data-funding-progress]').forEach((node) => {
      const goal = Number(node.getAttribute('data-goal')) || 25;
      const current = Number(node.getAttribute('data-current')) || 0;
      const bar = node.querySelector('.funding-bar span');
      if (bar) {
        const pct = Math.max(0, Math.min(100, Math.round((current / goal) * 100)));
        bar.style.width = `${pct}%`;
      }
    });
  };

  const initExitIntentPopup = () => {
    const popup = doc.querySelector('[data-exit-popup]');
    if (!popup) return;
    const storageKey = 'prepify11plus.exit.popup';
    if (localStorage.getItem(storageKey) === 'seen') return;

    const close = () => {
      popup.hidden = true;
      try {
        localStorage.setItem(storageKey, 'seen');
      } catch (error) {
        // ignore storage issues
      }
    };

    popup.querySelector('[data-exit-close]')?.addEventListener('click', close);

    let shown = false;
    doc.addEventListener('mouseout', (event) => {
      if (shown) return;
      if (event.clientY <= 4) {
        popup.hidden = false;
        shown = true;
      }
    });

    window.setTimeout(() => {
      if (!shown && window.innerWidth < 860) {
        popup.hidden = false;
        shown = true;
      }
    }, 20000);
  };

  const initConsentBanner = () => {
    const banner = doc.querySelector('[data-consent-banner]');
    if (!banner) return;

    const acceptBtn = banner.querySelector('[data-consent-accept]');
    const declineBtn = banner.querySelector('[data-consent-decline]');
    const storageKey = 'prepify11plus.analytics';
    const stored = localStorage.getItem(storageKey);

    if (stored) {
      banner.hidden = true;
      return;
    }

    const handleChoice = (value) => {
      try {
        localStorage.setItem(storageKey, value);
      } catch (error) {
        // ignore storage issues
      }
      banner.hidden = true;
    };

    acceptBtn?.addEventListener('click', () => handleChoice('accepted'));
    declineBtn?.addEventListener('click', () => handleChoice('declined'));
  };

  doc.addEventListener('DOMContentLoaded', () => {
    setCurrentYear();
    initQuoteStrip();
    initNavigation();
    initFundingBars();
    initExitIntentPopup();
    initConsentBanner();
  });
})();
