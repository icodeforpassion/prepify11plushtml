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

  const watchAuth = () => onAuthStateChanged(getAuthInstance(), (user) => renderAuthNav(user));

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
  });
})();
