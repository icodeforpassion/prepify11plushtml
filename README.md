# Prepify11Plus

Prepify11Plus is a superhero-themed practice hub for 11+ learners. The site ships with interactive maths drills, vocabulary flashcards that load from editable text files, and mock tests with timed modes. All pages share playful themes inspired by ten iconic heroes and a live visitor counter so young learners feel part of a bigger community.

## Features

- **Heroic themes**: Switch instantly between Superman, Spiderman, Captain America, Batman, Iron Man, Hulk, Thor, Black Panther, Wonder Woman, and Flash color palettes.
- **Vocabulary flashcards**: Powered by `/data/sample_vocabulary.txt`, with flip, typing, and multiple-choice practice plus mastery tracking stored in the browser.
- **Maths skill builders**: Category-based quizzes (arithmetic, fractions, geometry, triangle logic, reasoning, measurement) that pull from JSON files for easy editing.
- **Mock exams**: Timed English and Maths mock tests with scoring dashboards and review screens.
- **Visitor counter**: Connected to the public CountAPI service so the community total is always in sight.
- **GitHub Pages ready**: Drop-in `CNAME` for `www.prepify11plus.co.uk` and static assets optimised for Pages hosting.

## Local development

1. Serve the project root with any static file server. For example:

   ```bash
   npx serve .
   ```

2. Open `http://localhost:3000` (or the port reported by your server).

3. Edit the data files inside `/data` to add more vocabulary or maths questions. The site will pick them up automatically on refresh.

## Deployment

The project is designed for GitHub Pages. Push to the `main` branch and enable Pages for the repository root. GitHub will automatically provision HTTPS for the custom domain configured in `CNAME`.

## Firebase and analytics configuration (required)

This is a static HTML/JS project, so Firebase public config is loaded at runtime.

1. Copy `scripts/firebase-config.example.js` to `scripts/firebase-config.js`.
2. Fill the `NEXT_PUBLIC_FIREBASE_*` and optional `NEXT_PUBLIC_GA_ID` values.
3. Keep `scripts/firebase-config.js` private (it is ignored by git).
4. Ensure production injects or serves the same config file securely.

Environment placeholders are also documented in `.env.example` for platforms that can inject `window.NEXT_PUBLIC_*` values.

### Key rotation and restriction checklist

If a Firebase API key was exposed, rotate it in Google Cloud Console and restrict the replacement key:

- HTTP referrers:
  - `https://prepify11plus.co.uk/*`
  - `https://www.prepify11plus.co.uk/*`
  - `http://localhost/*` (development only, optional)
- API restrictions: allow only required Firebase/Google APIs used by this app.

Never store private service account credentials in client-side code.
