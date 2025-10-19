# ElevenSpark Static Demo

ElevenSpark is a fully static HTML/CSS/JS site designed for GitHub Pages. It showcases our approach to calm, confidence-building 11+ preparation with a seeded maths & vocabulary demo.

## Getting started locally

1. Clone or download the repository.
2. Open `index.html` in your browser. No build step is required.
3. For best results, serve the folder with a simple HTTP server (e.g. `python -m http.server`) to avoid CORS restrictions when loading fonts.

## Publishing to GitHub Pages

1. Push the repository to GitHub.
2. In your repo settings, go to **Pages** and choose the `main` branch (root) as the source.
3. Save. GitHub Pages will publish the site at `https://<username>.github.io/<repo>/`.

## Customising the demo

- **Word bank & templates:** Edit `assets/js/demo.js`. Maths question templates live near the top, vocabulary templates and the word bank below. Each generator returns an object with `stem`, `choices`, `answer`, and `explanation`.
- **Colours & fonts:** Update CSS variables in `assets/css/styles.css`. The default experience uses a neon-inspired dark palette with Poppins throughout; light mode overrides live under the `[data-theme='light']` selector.
- **Theme toggle:** `assets/js/main.js` controls the dark/light toggle. Adjust the storage key or disable persistence if you don't want to keep the last chosen mode.
- **Logo & images:** Replace `favicon.svg` and `assets/img/og-image.svg` with your own assets.

## Privacy & accessibility notes

- The demo stores quiz state in memory. LocalStorage is used solely to remember the visitor's theme preference. Optional analytics only load after explicit consent.
- Components follow WCAG 2.2 AA guidelines: semantic HTML, focus states, ARIA attributes, and reduced motion support.

## File overview

```
index.html                 # Home
pricing.html               # Plans & comparison
faq.html                   # Structured FAQ page
blog.html                  # Blog index
blog/*.html                # Article pages
demo.html                  # Interactive demo (maths, vocab, mini-mock)
assets/css/styles.css      # Global styles & utilities
assets/js/main.js          # Navigation, theming, modals, consent banner
assets/js/demo.js          # Seeded quiz & flashcard logic
sitemap.xml, robots.txt    # SEO helpers
manifest.webmanifest       # PWA metadata
favicon.svg, assets/img/*  # Icons & social image
```

Enjoy exploring the ElevenSpark experience!
