import React, { useState } from 'react';
import StudyBuddy from './components/StudyBuddy';
import useQuestionBank from './hooks/useQuestionBank';
import './App.css';

/**
 * Main Prepify11Plus Application
 * Demonstrates integration of question bank and 3D Study Buddy
 */

function App() {
  const [currentCategory, setCurrentCategory] = useState('maths');
  const [currentView, setCurrentView] = useState('practice'); // 'practice' or 'buddy'
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);

  const {
    currentQuestion,
    loading,
    score,
    nextQuestion,
    checkAnswer,
    resetScore
  } = useQuestionBank(currentCategory);

  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answerResult, setAnswerResult] = useState(null);

  const categories = [
    { id: 'maths', name: 'Maths', icon: '🔢', color: '#4a90e2' },
    { id: 'english', name: 'English', icon: '📚', color: '#e74c3c' },
    { id: 'vr', name: 'Verbal Reasoning', icon: '💭', color: '#9b59b6' },
    { id: 'nvr', name: 'Non-Verbal Reasoning', icon: '🔶', color: '#f39c12' }
  ];

  const handleCategoryChange = (category) => {
    setCurrentCategory(category);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setAnswerResult(null);
  };

  const handleAnswerSelect = (answer) => {
    if (showExplanation) return; // Prevent changing after submission
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer || !currentQuestion) return;
    
    const isCorrect = checkAnswer(selectedAnswer);
    setAnswerResult(isCorrect);
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    nextQuestion({ difficulty: selectedDifficulty });
    setSelectedAnswer(null);
    setShowExplanation(false);
    setAnswerResult(null);
  };

  const handleStartPractice = () => {
    nextQuestion({ difficulty: selectedDifficulty });
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <h1 className="app-title">
          <span className="logo">🎓</span>
          Prepify11Plus
        </h1>
        <div className="score-display">
          <span className="score-label">Score:</span>
          <span className="score-value">
            {score.correct} / {score.total}
          </span>
          {score.total > 0 && (
            <span className="score-percentage">
              ({Math.round((score.correct / score.total) * 100)}%)
            </span>
          )}
        </div>
      </header>

      {/* Navigation */}
      <nav className="main-nav">
        <button
          className={`nav-button ${currentView === 'practice' ? 'active' : ''}`}
          onClick={() => setCurrentView('practice')}
        >
          📝 Practice Questions
        </button>
        <button
          className={`nav-button ${currentView === 'buddy' ? 'active' : ''}`}
          onClick={() => setCurrentView('buddy')}
        >
          🤖 Study Buddy
        </button>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        {currentView === 'practice' ? (
          <div className="practice-section">
            {/* Category Selection */}
            <div className="category-selector">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  className={`category-button ${currentCategory === cat.id ? 'active' : ''}`}
                  onClick={() => handleCategoryChange(cat.id)}
                  style={{
                    borderColor: currentCategory === cat.id ? cat.color : '#ddd',
                    backgroundColor: currentCategory === cat.id ? `${cat.color}15` : '#fff'
                  }}
                >
                  <span className="category-icon">{cat.icon}</span>
                  <span className="category-name">{cat.name}</span>
                </button>
              ))}
            </div>

            {/* Difficulty Selection */}
            <div className="difficulty-selector">
              <span className="difficulty-label">Difficulty:</span>
              <button
                className={`difficulty-button ${selectedDifficulty === 1 ? 'active' : ''}`}
                onClick={() => setSelectedDifficulty(1)}
              >
                ⭐ Easy
              </button>
              <button
                className={`difficulty-button ${selectedDifficulty === 2 ? 'active' : ''}`}
                onClick={() => setSelectedDifficulty(2)}
              >
                ⭐⭐ Medium
              </button>
              <button
                className={`difficulty-button ${selectedDifficulty === 3 ? 'active' : ''}`}
                onClick={() => setSelectedDifficulty(3)}
              >
                ⭐⭐⭐ Hard
              </button>
              <button
                className={`difficulty-button ${selectedDifficulty === null ? 'active' : ''}`}
                onClick={() => setSelectedDifficulty(null)}
              >
                🔀 Mixed
              </button>
            </div>

            {/* Question Display */}
            {loading ? (
              <div className="loading">Loading questions...</div>
            ) : currentQuestion ? (
              <div className="question-container">
                <div className="question-header">
                  <span className="question-type">{currentQuestion.type}</span>
                  <span className="question-difficulty">
                    {'⭐'.repeat(currentQuestion.difficulty)}
                  </span>
                </div>

                <div 
                  className="question-text"
                  dangerouslySetInnerHTML={{ __html: currentQuestion.question_text }}
                />

                <div className="options-container">
                  {currentQuestion.options.map((option, idx) => (
                    <button
                      key={idx}
                      className={`option-button ${
                        selectedAnswer === option ? 'selected' : ''
                      } ${
                        showExplanation && option === currentQuestion.correct_answer
                          ? 'correct'
                          : showExplanation && selectedAnswer === option
                          ? 'incorrect'
                          : ''
                      }`}
                      onClick={() => handleAnswerSelect(option)}
                      disabled={showExplanation}
                      dangerouslySetInnerHTML={{ __html: option }}
                    />
                  ))}
                </div>

                {showExplanation && (
                  <div className={`explanation ${answerResult ? 'correct' : 'incorrect'}`}>
                    <div className="explanation-header">
                      {answerResult ? '✅ Correct!' : '❌ Incorrect'}
                    </div>
                    <div className="explanation-text">
                      {currentQuestion.explanation}
                    </div>
                  </div>
                )}

                <div className="question-actions">
                  {!showExplanation ? (
                    <button
                      className="submit-button"
                      onClick={handleSubmitAnswer}
                      disabled={!selectedAnswer}
                    >
                      Submit Answer
                    </button>
                  ) : (
                    <button
                      className="next-button"
                      onClick={handleNextQuestion}
                    >
                      Next Question →
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="start-practice">
                <h2>Ready to practice {categories.find(c => c.id === currentCategory)?.name}?</h2>
                <p>Click the button below to start!</p>
                <button
                  className="start-button"
                  onClick={handleStartPractice}
                >
                  Start Practice
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="buddy-section">
            <div className="buddy-header">
              <h2>Meet Your Study Buddy! 🤖</h2>
              <p>Ask questions about any topic and get helpful explanations!</p>
            </div>
            <StudyBuddy category={currentCategory} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>Prepify11Plus - Your Complete 11+ Exam Preparation Platform</p>
        <p className="footer-stats">
          📊 Static Question Bank • 🤖 AI Study Buddy • 💯 Zero API Costs
        </p>
      </footer>
    </div>
  );
}

export default App;
