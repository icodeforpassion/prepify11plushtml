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
