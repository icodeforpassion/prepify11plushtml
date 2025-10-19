const themes = {
  superman: { bg: "#e8f0ff", accent: "#2b5eff", primary: "#1742c0", text: "#1f2937" },
  spiderman: { bg: "#fff0f0", accent: "#e11d48", primary: "#9f1239", text: "#1f2937" },
  captain: { bg: "#f0f7ff", accent: "#0ea5e9", primary: "#0369a1", text: "#1f2937" },
  batman: { bg: "#0f141b", accent: "#facc15", primary: "#ca8a04", text: "#f8fafc" },
  ironman: { bg: "#fff4f0", accent: "#d62828", primary: "#9a0000", text: "#1f2937" },
  hulk: { bg: "#e9ffe9", accent: "#16a34a", primary: "#065f46", text: "#1f2937" },
  thor: { bg: "#f0f4ff", accent: "#4f46e5", primary: "#312e81", text: "#1f2937" },
  blackpanther: { bg: "#101827", accent: "#9333ea", primary: "#581c87", text: "#f3f4f6" },
  wonderwoman: { bg: "#fff5f5", accent: "#db2777", primary: "#9d174d", text: "#1f2937" },
  flash: { bg: "#fff7e6", accent: "#facc15", primary: "#b45309", text: "#1f2937" }
};

const THEME_KEY = "prepify11plus-theme";

function applyTheme(themeName) {
  const theme = themes[themeName] || themes.superman;
  const root = document.documentElement;
  root.style.setProperty("--bg-color", theme.bg);
  root.style.setProperty("--accent-color", theme.accent);
  root.style.setProperty("--primary-color", theme.primary);
  root.style.setProperty("--text-color", theme.text);
  root.style.setProperty("--card-bg", themeName === "batman" || themeName === "blackpanther" ? "rgba(17, 24, 39, 0.75)" : "rgba(255, 255, 255, 0.92)");
  root.style.setProperty("--card-shadow", themeName === "batman" || themeName === "blackpanther"
    ? "0 18px 40px rgba(0, 0, 0, 0.45)"
    : "0 18px 40px rgba(15, 23, 42, 0.12)");
  root.style.setProperty("color-scheme", themeName === "batman" || themeName === "blackpanther" ? "dark" : "light");

  document.querySelectorAll("[data-theme-name]").forEach(card => {
    card.classList.toggle("active-theme", card.dataset.themeName === themeName);
  });

  document.querySelectorAll("[data-theme-select]").forEach(select => {
    if (select.value !== themeName) {
      select.value = themeName;
    }
  });

  localStorage.setItem(THEME_KEY, themeName);
}

function setupThemeControls() {
  const storedTheme = localStorage.getItem(THEME_KEY);
  const initialTheme = storedTheme && themes[storedTheme] ? storedTheme : "superman";
  applyTheme(initialTheme);

  document.querySelectorAll("[data-theme]").forEach(control => {
    control.addEventListener("click", () => {
      const themeName = control.dataset.theme;
      if (themes[themeName]) {
        applyTheme(themeName);
      }
    });
  });

  document.querySelectorAll("[data-theme-select]").forEach(select => {
    if (select.value !== initialTheme) {
      select.value = initialTheme;
    }
    select.addEventListener("change", (event) => {
      const selectedTheme = event.target.value;
      if (themes[selectedTheme]) {
        applyTheme(selectedTheme);
      }
    });
  });

  document.querySelectorAll("[data-theme-name]").forEach(card => {
    card.addEventListener("click", () => {
      const themeName = card.dataset.themeName;
      if (themes[themeName]) {
        applyTheme(themeName);
      }
    });
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setupThemeControls);
} else {
  setupThemeControls();
}
