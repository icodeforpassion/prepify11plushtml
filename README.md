# ElevenSpark Static Demo

ElevenSpark is a fully static HTML/CSS/JavaScript experience that mirrors a neon, glassmorphism aesthetic inspired by modern airline retailing. It highlights a seeded 11+ practice demo with maths and vocabulary generators, responsive marketing pages, and accessible interactions.

## Getting started locally

1. Clone or download this repository.
2. Open `index.html` in your browser. No build tools are required.
3. For best results, serve the project with a lightweight HTTP server (for example `python -m http.server`) so fonts and the manifest load without cross-origin warnings.

## Publishing on GitHub Pages

1. Push the repository to GitHub.
2. In the repository settings, open **Pages** and choose the `main` branch (root) as the source.
3. Save. GitHub Pages will publish your site at `https://<username>.github.io/<repo>/`.

## Customising the experience

- **Colour themes:** Global tokens live in `assets/css/styles.css`. The default experience ships in dark mode with glass panels; `[data-theme='light']` contains light-mode overrides. The header toggle stores the last chosen mode in `localStorage`.
- **Logo & imagery:** Replace `favicon.svg` and `assets/img/og-image.svg` with your own artwork. Update Open Graph URLs in each HTML file if hosting under a custom domain.
- **Maths & vocab logic:** Open `assets/js/demo.js` to extend question templates or adjust the 120-word bank. Each template returns a `{ stem, choices, answer, explanation, difficulty }` object and uses a Mulberry32 seeded generator.
- **Quick practice modal:** `index.html` includes an inline trigger wired through `assets/js/main.js`. Duplicate the `data-quick-practice` attributes to surface the mini-quiz anywhere else.

## Privacy & accessibility notes

- Quiz and flashcard state lives entirely in memory. Only the theme preference uses `localStorage`; optional Google Analytics loads **only after** the visitor grants consent.
- The interface follows WCAG 2.2 AA guidance: semantic landmarks, skip link, keyboard-accessible tabs and accordions, visible focus, reduced motion support, and aria attributes for modals and menus.

## Repository structure

```
index.html                 # Marketing home with quick-practice modal
pricing.html               # Plans, comparison table, billing FAQs
faq.html                   # Structured FAQ with jump list
blog.html                  # Article index
blog/*.html                # Long-form articles with schema.org metadata
demo.html                  # Interactive maths/vocab/mini-mock demo
assets/css/styles.css      # Global styling & theming tokens
assets/js/main.js          # Navigation, theming, modal, consent banner
assets/js/demo.js          # Seeded quiz & flashcard logic
assets/img/og-image.svg    # Social preview artwork
favicon.svg                # App icon
manifest.webmanifest       # Metadata for install prompts
robots.txt, sitemap.xml    # SEO helpers
```

Questions? Reach out via `hello@elevenspark.example` – and remember: we build confidence & fundamentals — **no pass guarantees**.
