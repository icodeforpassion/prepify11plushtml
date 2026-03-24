(function initVisitorCounter() {
  const FALLBACK = '40,000+';
  const STORAGE_KEY = 'prepify11plus.visits';
  const BASELINE = 40000;

  const updateElements = (value) => {
    document
      .querySelectorAll('[data-visitor-count], #countValue')
      .forEach((el) => {
        el.textContent = value;
      });
  };

  try {
    const stored = Number.parseInt(localStorage.getItem(STORAGE_KEY), 10);
    const visits = Number.isFinite(stored) ? stored : Math.floor(Math.random() * 250) + 1;
    const nextVisits = visits + 1;
    localStorage.setItem(STORAGE_KEY, String(nextVisits));
    const formatted = (BASELINE + nextVisits).toLocaleString();
    updateElements(formatted);
  } catch (error) {
    updateElements(FALLBACK);
  }
})();
