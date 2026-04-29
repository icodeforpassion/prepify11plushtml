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
    if (!trigger || !modal) return;
    const closeBtn = modal.querySelector('[data-share-close]');
    const copyBtn = modal.querySelector('[data-share-copy]');
    const instaBtn = modal.querySelector('[data-share-instagram]');
    const options = modal.querySelectorAll('[data-share-platform]');
    const caption = "Help more students discover calm, joyful 11+ prep with Prepify11Plus. Thanks for supporting Prepify11Plus";

    const openModal = async () => {
      trackEvent('social_share_opened', { platform: 'sheet' });
      if (navigator.share) {
        try {
          await navigator.share({ title: 'Prepify11Plus', text: 'Help more students discover calm, joyful 11+ prep.', url: window.location.origin });
          trackEvent('social_share_clicked', { platform: 'native' });
          return;
        } catch (_) {}
      }
      modal.hidden = false;
    };

    const closeModal = () => { modal.hidden = true; };

    trigger.addEventListener('click', openModal);
    closeBtn?.addEventListener('click', closeModal);
    modal.addEventListener('click', (event) => { if (event.target === modal) closeModal(); });

    options.forEach((btn) => btn.addEventListener('click', () => {
      const platform = btn.dataset.sharePlatform;
      trackEvent('social_share_clicked', { platform });
    }));

    copyBtn?.addEventListener('click', async () => {
      await navigator.clipboard.writeText(window.location.origin);
      copyBtn.textContent = 'Copied — thank you for helping more students!';
      trackEvent('social_share_copied', { platform: 'copy_link' });
    });

    instaBtn?.addEventListener('click', async () => {
      await navigator.clipboard.writeText(`${caption}\n${window.location.origin}`);
      instaBtn.textContent = 'Caption + link copied for Instagram';
      trackEvent('social_share_copied', { platform: 'instagram_copy' });
    });
  };

  const initTracking = () => {
    trackPageView(window.location.pathname);
    trackEvent('route_changes', { route: window.location.pathname });
    if (window.location.pathname.includes('schedule-builder')) trackEvent('schedule_builder_view');
  };

  doc.addEventListener('DOMContentLoaded', () => {
    setCurrentYear();
    initNavigation();
    watchAuth();
    initTracking();
    initShareButton();
  });
})();
