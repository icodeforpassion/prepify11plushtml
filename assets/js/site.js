import { initFirebase, getAuthInstance } from '../../scripts/firebase.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js';
import { trackEvent, trackPageView } from '../../scripts/analytics.js';

(() => {
  const doc = document;
  initFirebase();

  const setCurrentYear = () => {
    const year = String(new Date().getFullYear());
    doc.querySelectorAll('#currentYear, [data-year]').forEach((node) => { node.textContent = year; });
  };

  const initNavigation = () => {
    const toggle = doc.querySelector('[data-nav-toggle]');
    const menu = doc.querySelector('[data-nav-menu]');
    if (!toggle || !menu) return;
    const closeMenu = () => { menu.setAttribute('data-open', 'false'); toggle.setAttribute('aria-expanded', 'false'); };
    toggle.addEventListener('click', () => {
      const isOpen = menu.getAttribute('data-open') === 'true';
      menu.setAttribute('data-open', String(!isOpen));
      toggle.setAttribute('aria-expanded', String(!isOpen));
    });
    menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  };

  const initials = (name) => name.split(' ').filter(Boolean).slice(0,2).map((n)=>n[0].toUpperCase()).join('') || 'P';
  const displayName = (user) => user?.displayName || user?.email?.split('@')[0] || 'Explorer';

  const renderAuthNav = (user) => {
    doc.querySelectorAll('[data-auth-nav]').forEach((slot) => {
      if (!user) {
        slot.innerHTML = '<a class="btn btn-outline auth-nav-btn" href="index.html#auth">Sign In</a>';
        return;
      }
      const name = displayName(user);
      const avatar = user.photoURL ? `<img src="${user.photoURL}" alt="${name}" class="auth-avatar-img">` : `<span class="auth-avatar-badge">${initials(name)}</span>`;
      slot.innerHTML = `<div class="auth-chip">${avatar}<span class="auth-name">${name}</span></div><button class="btn btn-outline auth-nav-btn" data-signout>Sign Out</button>`;
      slot.querySelector('[data-signout]')?.addEventListener('click', async () => { await signOut(getAuthInstance()); trackEvent('sign_out'); });
    });
  };

  const watchAuth = () => {
    const auth = getAuthInstance();
    if (!auth) {
      renderAuthNav(null);
      return;
    }
    onAuthStateChanged(auth, (user) => renderAuthNav(user));
  };


  const initShareButton = () => {
    const trigger = doc.querySelector('[data-share-open]');
    const modal = doc.querySelector('[data-share-modal]');
    const dismissBtn = doc.querySelector('[data-share-dismiss]');
    if (!trigger || !modal) return;
    const shareCard = doc.querySelector('[data-share-widget]');
    const SHARE_STATE_KEY = 'prepify_share_state_v1';
    const HIDE_AFTER_SHARE_MS = 1000 * 60 * 60 * 24 * 30;
    const closeBtn = modal.querySelector('[data-share-close]');
    const copyBtn = modal.querySelector('[data-share-copy]');
    const instaBtn = modal.querySelector('[data-share-instagram]');
    const options = modal.querySelectorAll('[data-share-platform]');
    const caption = "Help more students discover calm, joyful 11+ prep with Prepify11Plus. Thanks for supporting Prepify11Plus";

    const readShareState = () => {
      try {
        return JSON.parse(localStorage.getItem(SHARE_STATE_KEY) || '{}');
      } catch (_) {
        return {};
      }
    };

    const writeShareState = (patch) => {
      const next = { ...readShareState(), ...patch };
      localStorage.setItem(SHARE_STATE_KEY, JSON.stringify(next));
      return next;
    };

    const shouldHideShareWidget = () => {
      const state = readShareState();
      if (state.dismissed) return true;
      if (state.sharedAt && (Date.now() - state.sharedAt) < HIDE_AFTER_SHARE_MS) return true;
      return false;
    };

    const syncWidgetVisibility = () => {
      if (!shareCard) return;
      shareCard.hidden = shouldHideShareWidget();
    };

    const openModal = async () => {
      writeShareState({ openedAt: Date.now() });
      trackEvent('social_share_opened', { platform: 'sheet' });
      if (navigator.share) {
        try {
          await navigator.share({ title: 'Prepify11Plus', text: 'Help more students discover calm, joyful 11+ prep.', url: window.location.origin });
          trackEvent('social_share_clicked', { platform: 'native' });
          trackEvent('social_share_copied', { platform: 'native' });
          writeShareState({ sharedAt: Date.now() });
          syncWidgetVisibility();
          return;
        } catch (_) {}
      }
      modal.setAttribute('aria-hidden', 'false');
      modal.hidden = false;
      closeBtn?.focus();
    };

    const closeModal = () => {
      modal.hidden = true;
      modal.setAttribute('aria-hidden', 'true');
      trigger.focus();
    };

    trigger.addEventListener('click', openModal);
    closeBtn?.addEventListener('click', closeModal);
    modal.addEventListener('click', (event) => { if (event.target === modal) closeModal(); });
    dismissBtn?.addEventListener('click', () => {
      writeShareState({ dismissed: true, dismissedAt: Date.now() });
      trackEvent('social_share_dismissed', { placement: 'floating_widget' });
      syncWidgetVisibility();
    });
    doc.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !modal.hidden) {
        closeModal();
      }
    });

    options.forEach((btn) => btn.addEventListener('click', () => {
      const platform = btn.dataset.sharePlatform;
      trackEvent('social_share_clicked', { platform });
    }));

    copyBtn?.addEventListener('click', async () => {
      await navigator.clipboard.writeText(window.location.origin);
      copyBtn.textContent = 'Copied — thank you for helping more students!';
      trackEvent('social_share_copied', { platform: 'copy_link' });
      writeShareState({ sharedAt: Date.now() });
      syncWidgetVisibility();
    });

    instaBtn?.addEventListener('click', async () => {
      await navigator.clipboard.writeText(`${caption}\n${window.location.origin}`);
      instaBtn.textContent = 'Caption + link copied for Instagram';
      trackEvent('social_share_copied', { platform: 'instagram_copy' });
      writeShareState({ sharedAt: Date.now() });
      syncWidgetVisibility();
    });

    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    syncWidgetVisibility();
  };



  const initKidFirstModules = () => {
    const questKey = 'prepify_daily_quest_v1';
    const checkpoints = doc.querySelector('[data-quest-checkpoints]');
    const nextBtn = doc.querySelector('[data-quest-next]');
    const status = doc.querySelector('[data-quest-status]');
    const ring = doc.querySelector('[data-quest-ring]');
    const label = doc.querySelector('[data-quest-progress-label]');
    const tasks = [
      { label: '5 maths questions', href: 'maths.html' },
      { label: '5 vocabulary flashcards', href: 'flashcards.html' },
      { label: '3 non-verbal puzzles', href: 'non-verbal.html' },
      { label: '1 typing sprint', href: 'typing.html' },
    ];
    const today = new Date().toISOString().slice(0, 10);
    const readQuest = () => {
      try { return JSON.parse(localStorage.getItem(questKey) || '{}'); } catch (_) { return {}; }
    };
    const writeQuest = (payload) => localStorage.setItem(questKey, JSON.stringify(payload));

    if (checkpoints && nextBtn && status && ring && label) {
      const saved = readQuest();
      let completed = saved.date === today && Number.isInteger(saved.completed) ? Math.min(saved.completed, tasks.length) : 0;
      checkpoints.innerHTML = tasks.map((task, i) => `<li class="${i < completed ? 'done' : ''}"><a href="${task.href}">${task.label}</a></li>`).join('');
      const radius = 50;
      const circumference = 2 * Math.PI * radius;
      const update = () => {
        const pct = Math.round((completed / tasks.length) * 100);
        ring.style.strokeDashoffset = String(circumference - (pct / 100) * circumference);
        label.textContent = `${pct}%`;
        if (completed === tasks.length) {
          nextBtn.textContent = 'Quest complete';
          nextBtn.disabled = true;
          status.textContent = 'Amazing focus! Quest complete — chest unlocked.';
        } else {
          nextBtn.textContent = completed > 0 ? 'Continue quest' : 'Start today’s quest';
          status.textContent = completed > 0 ? 'You’re only 3 steps from keeping your streak!' : 'Complete today’s quest first?';
        }
      };
      update();
      nextBtn.addEventListener('click', () => {
        const nextTask = tasks[completed];
        writeQuest({ date: today, completed: Math.min(completed + 1, tasks.length) });
        if (nextTask) window.location.href = nextTask.href;
      });
    }

    const mascotLines = ['Great try! Let’s spot the trick together.', 'You’re close — check the pattern again.', 'Amazing focus! Ready for the next mission?', 'Mistakes are clues. Let’s use them.'];
    const mascotMessage = doc.querySelector('[data-mascot-message]');
    const mascotNext = doc.querySelector('[data-mascot-next]');
    if (mascotMessage && mascotNext) {
      let idx = 0;
      mascotNext.addEventListener('click', () => {
        idx = (idx + 1) % mascotLines.length;
        mascotMessage.textContent = mascotLines[idx];
      });
    }

    const profileForm = doc.querySelector('[data-target-profile]');
    const saveProfile = doc.querySelector('[data-target-profile-save]');
    const profileMessage = doc.querySelector('[data-target-profile-message]');
    const styleSelect = doc.getElementById('examStyle');
    const profileKey = 'prepify_exam_style_v1';
    if (profileForm && saveProfile && profileMessage && styleSelect) {
      const existing = localStorage.getItem(profileKey);
      if (existing) styleSelect.value = existing;
      saveProfile.addEventListener('click', () => {
        localStorage.setItem(profileKey, styleSelect.value);
        profileMessage.textContent = 'Your child’s practice path has been adjusted for this exam style.';
      });
    }
  };

  const initVisualDepthFx = () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const createConfetti = () => {
      if (prefersReducedMotion) return;
      const layer = doc.createElement('div');
      layer.className = 'celebration-confetti';
      const colors = ['#2563eb', '#7c3aed', '#f97316', '#16a34a', '#ec4899'];
      for (let i = 0; i < 28; i += 1) {
        const piece = doc.createElement('span');
        piece.style.left = `${Math.random() * 100}%`;
        piece.style.background = colors[i % colors.length];
        piece.style.setProperty('--x-drift', `${(Math.random() - 0.5) * 32}vw`);
        piece.style.animationDelay = `${Math.random() * 0.25}s`;
        layer.appendChild(piece);
      }
      doc.body.appendChild(layer);
      window.setTimeout(() => layer.remove(), 1700);
    };

    window.PrepifyFX = {
      ...(window.PrepifyFX || {}),
      play: () => {},
      sparkle: () => doc.querySelector('.sparkle')?.classList.add('sparkle-active'),
      celebrate: () => {
        doc.body.classList.remove('completion-glow');
        void doc.body.offsetWidth;
        doc.body.classList.add('completion-glow');
        createConfetti();
        window.setTimeout(() => doc.body.classList.remove('completion-glow'), 1000);
      },
    };

    doc.querySelectorAll('.progress-bar__fill').forEach((fill) => {
      const observer = new MutationObserver(() => {
        fill.classList.remove('is-updating');
        void fill.offsetWidth;
        fill.classList.add('is-updating');
        window.setTimeout(() => fill.classList.remove('is-updating'), 800);
      });
      observer.observe(fill, { attributes: true, attributeFilter: ['style'] });
    });
  };

  const initTracking = () => {
    trackPageView(window.location.pathname);
    trackEvent('route_changes', { route: window.location.pathname });
    if (window.location.pathname.includes('schedule-builder')) trackEvent('schedule_builder_view');
  };

  const initDailyBoost = async () => {
    const quoteTextEl = doc.querySelector('[data-quote-text]');
    const refreshBtn = doc.querySelector('[data-quote-refresh]');
    if (!quoteTextEl || !refreshBtn) return;

    try {
      const response = await fetch('data/quotes.json', { cache: 'no-store' });
      if (!response.ok) return;
      const payload = await response.json();
      const quotes = Array.isArray(payload) ? payload : payload?.quotes;
      if (!Array.isArray(quotes) || !quotes.length) return;

      let currentIndex = Math.floor(Math.random() * quotes.length);
      const getQuoteText = (value) => {
        if (typeof value === 'string') return value;
        if (value && typeof value.text === 'string') return value.text;
        return '';
      };

      const renderQuote = (index) => {
        const text = getQuoteText(quotes[index]) || 'Stay curious and keep practising.';
        quoteTextEl.textContent = text;
      };

      renderQuote(currentIndex);

      refreshBtn.addEventListener('click', () => {
        if (quotes.length === 1) {
          renderQuote(0);
          return;
        }
        let nextIndex = currentIndex;
        while (nextIndex === currentIndex) {
          nextIndex = Math.floor(Math.random() * quotes.length);
        }
        currentIndex = nextIndex;
        renderQuote(currentIndex);
      });
    } catch (_) {}
  };

  const initConsentBanner = () => {
    const banner = doc.querySelector('[data-consent-banner]');
    if (!banner) return;
    const acceptBtn = banner.querySelector('[data-consent-accept]');
    const declineBtn = banner.querySelector('[data-consent-decline]');
    const key = 'prepify_analytics_consent_v1';
    const saved = localStorage.getItem(key);

    if (saved === 'accepted' || saved === 'declined') {
      banner.hidden = true;
      return;
    }

    const close = (choice) => {
      localStorage.setItem(key, choice);
      banner.hidden = true;
      trackEvent('analytics_consent_choice', { choice });
    };

    acceptBtn?.addEventListener('click', () => close('accepted'));
    declineBtn?.addEventListener('click', () => close('declined'));
  };

  doc.addEventListener('DOMContentLoaded', () => {
    setCurrentYear();
    initNavigation();
    watchAuth();
    initTracking();
    initShareButton();
    initDailyBoost();
    initConsentBanner();
    initKidFirstModules();
    initVisualDepthFx();
  });
})();
