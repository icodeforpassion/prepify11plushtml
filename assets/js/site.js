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

  const initSocialShare = () => {
    const pageUrl = encodeURIComponent(window.location.href);
    const rawUrl  = window.location.href;

    const ogTitle = doc.querySelector('meta[property="og:title"]');
    const metaDesc = doc.querySelector('meta[property="og:description"]') ||
                     doc.querySelector('meta[name="description"]');
    const shareTitle = encodeURIComponent(ogTitle ? ogTitle.content : doc.title);
    const shareDesc  = encodeURIComponent(metaDesc ? metaDesc.content : '');

    // SVG icons (inline, no external deps)
    const ICONS = {
      share:    `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>`,
      whatsapp: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`,
      facebook: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`,
      twitter:  `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
      linkedin: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`,
      instagram:`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>`,
      copy:     `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>`,
    };

    const PLATFORMS = [
      { id: 'whatsapp',  label: 'WhatsApp',  cls: 'share-whatsapp',  href: `https://wa.me/?text=${shareTitle}%20${pageUrl}`, blank: true },
      { id: 'facebook',  label: 'Facebook',  cls: 'share-facebook',  href: `https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`, blank: true },
      { id: 'twitter',   label: 'X',         cls: 'share-twitter',   href: `https://twitter.com/intent/tweet?url=${pageUrl}&text=${shareTitle}`, blank: true },
      { id: 'linkedin',  label: 'LinkedIn',  cls: 'share-linkedin',  href: `https://www.linkedin.com/sharing/share-offsite/?url=${pageUrl}`, blank: true },
      { id: 'instagram', label: 'Instagram', cls: 'share-instagram', href: null, blank: false },
      { id: 'copy',      label: 'Copy link', cls: 'share-copy',      href: null, blank: false },
    ];

    const makeBtn = (p, small) => {
      const cls = `share-btn ${p.cls}`;
      const svg = ICONS[p.id];
      const label = p.label;
      if (p.href) {
        return `<a class="${cls}" href="${p.href}" target="_blank" rel="noopener noreferrer" aria-label="Share on ${label}" data-share-id="${p.id}">${svg}<span>${label}</span></a>`;
      }
      const ariaLabel = p.id === 'instagram' ? 'Copy link for Instagram' : 'Copy link to clipboard';
      return `<button type="button" class="${cls}" aria-label="${ariaLabel}" data-share-id="${p.id}">${svg}<span>${label}</span></button>`;
    };

    // --- Floating bubble ---
    const panelHTML = PLATFORMS.map((p) => makeBtn(p, false)).join('');
    const bubble = doc.createElement('div');
    bubble.className = 'share-bubble';
    bubble.setAttribute('role', 'complementary');
    bubble.setAttribute('aria-label', 'Share this page');
    bubble.innerHTML = `
      <div class="share-bubble__panel" id="shareBubblePanel" aria-hidden="true">${panelHTML}</div>
      <button type="button" class="share-bubble__trigger" id="shareBubbleTrigger" aria-expanded="false" aria-controls="shareBubblePanel">
        ${ICONS.share}<span>Share</span>
      </button>
      <div class="share-toast" id="shareBubbleToast" role="status" aria-live="polite"></div>`;
    doc.body.appendChild(bubble);

    const triggerBtn = doc.getElementById('shareBubbleTrigger');
    const panel      = doc.getElementById('shareBubblePanel');
    const toast      = doc.getElementById('shareBubbleToast');
    let panelOpen    = false;
    let toastTimer   = null;

    const showToast = (msg) => {
      toast.textContent = msg;
      toast.classList.add('is-visible');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2800);
    };

    const openPanel = () => {
      panelOpen = true;
      triggerBtn.setAttribute('aria-expanded', 'true');
      panel.setAttribute('aria-hidden', 'false');
      panel.classList.add('is-open');
    };

    const closePanel = () => {
      panelOpen = false;
      triggerBtn.setAttribute('aria-expanded', 'false');
      panel.setAttribute('aria-hidden', 'true');
      panel.classList.remove('is-open');
    };

    triggerBtn.addEventListener('click', () => { if (panelOpen) closePanel(); else openPanel(); });

    doc.addEventListener('click', (e) => { if (panelOpen && !bubble.contains(e.target)) closePanel(); });
    doc.addEventListener('keydown', (e) => { if (e.key === 'Escape' && panelOpen) { closePanel(); triggerBtn.focus(); } });

    const copyUrl = (msg) => {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(rawUrl).then(() => showToast(msg)).catch(() => showToast('Link ready to share!'));
      } else {
        const ta = doc.createElement('textarea');
        ta.value = rawUrl;
        ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
        doc.body.appendChild(ta);
        ta.select();
        doc.execCommand('copy');
        doc.body.removeChild(ta);
        showToast(msg);
      }
    };

    panel.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-share-id]');
      if (!btn) return;
      const id = btn.dataset.shareId;
      if (id === 'instagram') { copyUrl('Link copied — paste it into your Instagram story or bio!'); closePanel(); }
      else if (id === 'copy') { copyUrl('Link copied to clipboard!'); closePanel(); }
      if (typeof gtag === 'function') gtag('event', 'share', { method: id, content_type: 'page', item_id: rawUrl });
    });

    // --- Inline bar on blog posts ---
    const postRelated = doc.querySelector('.post-related');
    if (postRelated) {
      const bar = doc.createElement('div');
      bar.className = 'post-share';
      bar.innerHTML = `<span class="post-share__label">Enjoyed this? Share it:</span>` +
        PLATFORMS.map((p) => makeBtn(p, true)).join('');
      postRelated.parentNode.insertBefore(bar, postRelated);

      bar.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-share-id]');
        if (!btn) return;
        const id = btn.dataset.shareId;
        if (id === 'instagram') copyUrl('Link copied — paste it into your Instagram story or bio!');
        else if (id === 'copy') copyUrl('Link copied to clipboard!');
        if (typeof gtag === 'function') gtag('event', 'share', { method: id, content_type: 'article', item_id: rawUrl });
      });
    }

    // Use native Web Share API on mobile if available (for trigger button long-press feel)
    if (navigator.share) {
      triggerBtn.addEventListener('dblclick', async () => {
        try {
          await navigator.share({ title: doc.title, url: rawUrl });
          if (typeof gtag === 'function') gtag('event', 'share', { method: 'native', content_type: 'page', item_id: rawUrl });
        } catch (_) { /* user cancelled */ }
      });
    }
  };

  doc.addEventListener('DOMContentLoaded', () => {
    setCurrentYear();
    initQuoteStrip();
    initNavigation();
    initConsentBanner();
    initSocialShare();
  });
})();
