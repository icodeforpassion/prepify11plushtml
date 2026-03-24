# Prepify11Plus - Complete 11+ Exam Preparation Platform

A modern, interactive educational platform featuring a **scalable static question bank** and an **AI-powered 3D Study Buddy** - all with **zero ongoing costs** (no database, no API fees).

![Prepify11Plus](https://img.shields.io/badge/Status-Production%20Ready-brightgreen) ![Cost](https://img.shields.io/badge/Monthly%20Cost-$0-success) ![Questions](https://img.shields.io/badge/Questions-4000+-blue)

## 🎯 Key Features

### 📚 Static Question Bank System
- **1,000+ questions per category** (Maths, English, Verbal Reasoning, Non-Verbal Reasoning)
- Procedurally generated for uniqueness and variety
- Organized by difficulty level (1-3 stars)
- Lazy-loaded for optimal performance
- Filterable and randomizable
- Score tracking and progress monitoring

### 🤖 3D Interactive Study Buddy
- **Low-poly 3D robot character** built with Three.js
- **Static Conversational AI** using Fuse.js fuzzy matching
- 24+ pre-written topic responses covering all subjects
- Character animations (nod, wave, jump)
- Natural conversation flow
- Suggested questions for easy navigation

### 💰 Zero Cost Architecture
- No database required - all data in JSON files
- No API calls - completely static
- Hostable on free CDN (Vercel, Netlify, GitHub Pages)
- Fast loading with CDN distribution

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Basic knowledge of React
- (Optional) Python 3.8+ for generating additional questions

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/prepify11plus.git
cd prepify11plus

# Install dependencies
npm install

# Start development server
npm start
```

The app will open at `http://localhost:3000`

## 📁 Project Structure

```
prepify11plus/
├── data/
│   ├── questions/          # Question bank JSON files
│   │   ├── maths.json      # 1,000 maths questions
│   │   ├── english.json    # 1,000 English questions
│   │   ├── vr.json         # 1,000 Verbal Reasoning questions
│   │   └── nvr.json        # 1,000 Non-Verbal Reasoning questions
│   └── conversation_library.json  # Study Buddy responses
│
├── scripts/                # Python scripts for question generation
│   ├── generate_maths_questions.py
│   ├── generate_english_questions.py
│   ├── generate_vr_questions.py
│   └── generate_nvr_questions.py
│
├── src/
│   ├── components/
│   │   └── StudyBuddy.jsx      # Three.js 3D character component
│   │
│   ├── hooks/
│   │   └── useQuestionBank.js  # Custom React hook for questions
│   │
│   ├── utils/
│   │   └── studyBuddyAI.js     # Fuzzy matching AI logic
│   │
│   ├── App.jsx                  # Main application component
│   └── App.css                  # Styling
│
└── public/
    └── models/                  # (Optional) 3D model assets
```

## 🎓 Question Bank System

### Question Schema

Each question follows this standardized schema:

```json
{
  "id": "uuid-v4",
  "type": "Multiple Choice",
  "difficulty": 1,
  "question_text": "What is 25% of 80?",
  "options": ["20", "15", "25", "30"],
  "correct_answer": "20",
  "explanation": "25% of 80 = (25/100) × 80 = 20"
}
```

### Using the Question Hook

```jsx
import useQuestionBank from './hooks/useQuestionBank';

function MyComponent() {
  const {
    currentQuestion,
    loading,
    score,
    nextQuestion,
    checkAnswer,
    resetScore
  } = useQuestionBank('maths');

  // Get a random question
  const handleNext = () => {
    nextQuestion({ difficulty: 2 }); // Optional filters
  };

  // Check user's answer
  const handleSubmit = (answer) => {
    const isCorrect = checkAnswer(answer);
    console.log(isCorrect ? 'Correct!' : 'Try again');
  };

  return (
    <div>
      <h2>{currentQuestion?.question_text}</h2>
      {/* Render options, etc. */}
    </div>
  );
}
```

### Generating More Questions

The project includes Python scripts to generate unlimited questions:

```bash
cd scripts

# Generate 1,000 maths questions
python3 generate_maths_questions.py

# Generate 1,000 English questions
python3 generate_english_questions.py

# Generate 1,000 Verbal Reasoning questions
python3 generate_vr_questions.py

# Generate 1,000 Non-Verbal Reasoning questions
python3 generate_nvr_questions.py
```

Each script uses procedural generation to create unique, valid questions with varying difficulty levels.

## 🤖 Study Buddy AI System

### How It Works

The Study Buddy uses **Fuse.js** for fuzzy string matching to match student questions to pre-written responses:

1. Student types a question: "How do I do fractions?"
2. Fuzzy matcher searches keywords: `["fraction", "fractions", "divide"]`
3. Best match is returned with confidence score
4. Response is displayed with character animation

### Conversation Library Schema

```json
{
  "id": "help-fractions-1",
  "keywords": ["fraction", "fractions", "divide"],
  "category": "maths",
  "question": "How do I work with fractions?",
  "answer": "Great question! A fraction has two parts...",
  "animation": "nod"
}
```

### Using the Study Buddy AI

```jsx
import { loadConversationLibrary } from './utils/studyBuddyAI';

// Load the AI
const ai = await loadConversationLibrary();

// Find response to user query
const response = ai.findResponse("How do I calculate percentages?", "maths");

console.log(response.answer);        // The response text
console.log(response.confidence);    // 0-1 confidence score
console.log(response.animation);     // Animation to trigger
```

### Adding New Topics

To add new conversation topics, edit `data/conversation_library.json`:

```json
{
  "id": "help-your-topic-1",
  "keywords": ["keyword1", "keyword2", "phrase"],
  "category": "maths",
  "question": "Sample question?",
  "answer": "Your detailed answer here...",
  "animation": "wave"
}
```

## 🎨 Three.js Character

### Character Features
- **Low-poly robot design** - kid-friendly and performant
- **Idle animation** - gentle bobbing and rotation
- **Triggered animations**:
  - `nod` - Nodding up and down
  - `wave` - Waving arm
  - `jump` - Jumping motion

### Customizing the Character

The robot is created programmatically in `StudyBuddy.jsx`. To customize:

```javascript
// Change colors
const bodyMaterial = new THREE.MeshStandardMaterial({ 
  color: 0x4a90e2  // Change this hex color
});

// Change size
const headGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.8); // Adjust dimensions

// Add new parts
const newPart = new THREE.Mesh(geometry, material);
robot.add(newPart);
```

### Performance Optimization

The current implementation is optimized for web:
- **Low polygon count** (~200 triangles)
- **Simple materials** (no complex shaders)
- **Efficient animations** (simple transforms)

For even better performance with `.glb` models:

```bash
# Install glTF pipeline
npm install -g gltf-pipeline

# Compress your model with Draco
gltf-pipeline -i model.glb -o model-compressed.glb -d
```

Then load it:

```javascript
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/');

const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);

loader.load('/models/robot.glb', (gltf) => {
  scene.add(gltf.scene);
});
```

## 📊 Performance Optimizations

### Question Bank
- **Lazy loading**: Questions loaded only when category is selected
- **Chunking**: Can split into multiple smaller files (250 questions each)
- **Caching**: Browser caches JSON files after first load

### Three.js Scene
- **RequestAnimationFrame**: Smooth 60fps animations
- **Shadow optimization**: Limited to main character only
- **Material reuse**: Same materials shared across geometry

### Build Optimization

```bash
# Production build with optimizations
npm run build

# Analyze bundle size
npm install --save-dev webpack-bundle-analyzer
npm run build -- --stats
npx webpack-bundle-analyzer build/bundle-stats.json
```

## 🚀 Deployment

### Deploying to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

### Deploying to Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=build
```

### Deploying to GitHub Pages

```bash
# Install gh-pages
npm install --save-dev gh-pages

# Add to package.json
"homepage": "https://yourusername.github.io/prepify11plus",
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d build"
}

# Deploy
npm run deploy
```

## 📈 Scalability

### Question Bank Expansion
- **Current**: 4,000 questions (1,000 per category)
- **Target**: 10,000+ questions
- **Strategy**: Run generation scripts with different seed values

### Adding New Categories
1. Create new JSON file in `data/questions/`
2. Create generation script in `scripts/`
3. Add category to `CATEGORIES` object in `useQuestionBank.js`
4. Update UI in `App.jsx`

### Multi-language Support
```javascript
// Create language-specific files
data/
  questions/
    en/
      maths.json
    es/
      maths.json
    fr/
      maths.json
```

## 🧪 Testing

### Running Tests

```bash
# Unit tests
npm test

# E2E tests with Cypress
npm run cypress:open
```

### Test Coverage

Recommended test areas:
- Question randomization logic
- Answer checking accuracy
- Score tracking
- AI response matching
- Three.js scene rendering

## 🤝 Contributing

We welcome contributions! Areas for improvement:

1. **More Questions**: Add subject-specific question types
2. **Better AI**: Expand conversation library
3. **New Animations**: Add more character animations
4. **Accessibility**: Improve screen reader support
5. **Mobile**: Enhance mobile experience

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

- **Three.js** - 3D graphics library
- **Fuse.js** - Fuzzy matching library
- **React** - UI framework
- **11+ Exam Board** - Question format guidelines

## 💡 Why This Architecture?

### Cost Comparison

| Solution | Monthly Cost | Setup |
|----------|-------------|-------|
| **Prepify11Plus** | $0 | Static JSON |
| Database (Firebase) | $25-100 | Setup + maintenance |
| OpenAI API | $50-200+ | Per request |
| Custom Backend | $50-500 | Server + database |

### Performance Comparison

| Metric | Static JSON | Database |
|--------|-------------|----------|
| Load Time | <100ms | 300-1000ms |
| Scalability | CDN unlimited | Server limited |
| Availability | 99.99% (CDN) | Depends on server |

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/prepify11plus/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/prepify11plus/discussions)
- **Email**: support@prepify11plus.com

---

**Built with ❤️ for students preparing for the 11+ exam**
