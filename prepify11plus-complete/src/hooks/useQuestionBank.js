import { useState, useEffect, useCallback } from 'react';

/**
 * Custom React Hook for managing question bank
 * Features:
 * - Lazy loading of question data
 * - Random question selection
 * - Filtering by difficulty and type
 * - Score tracking
 */

const CATEGORIES = {
  maths: '/data/questions/maths.json',
  english: '/data/questions/english.json',
  vr: '/data/questions/vr.json',
  nvr: '/data/questions/nvr.json'
};

export const useQuestionBank = (category = 'maths') => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [usedQuestionIds, setUsedQuestionIds] = useState(new Set());

  // Load questions for a specific category
  const loadQuestions = useCallback(async (cat) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(CATEGORIES[cat]);
      if (!response.ok) {
        throw new Error(`Failed to load questions: ${response.statusText}`);
      }
      
      const data = await response.json();
      setQuestions(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, []);

  // Get a random question with filters
  const getRandomQuestion = useCallback((filters = {}) => {
    if (questions.length === 0) return null;

    let filteredQuestions = [...questions];

    // Filter by difficulty
    if (filters.difficulty) {
      filteredQuestions = filteredQuestions.filter(
        q => q.difficulty === filters.difficulty
      );
    }

    // Filter by type
    if (filters.type) {
      filteredQuestions = filteredQuestions.filter(
        q => q.type === filters.type
      );
    }

    // Exclude already used questions if requested
    if (filters.excludeUsed) {
      filteredQuestions = filteredQuestions.filter(
        q => !usedQuestionIds.has(q.id)
      );
    }

    // If all questions have been used, reset
    if (filteredQuestions.length === 0 && filters.excludeUsed) {
      setUsedQuestionIds(new Set());
      filteredQuestions = [...questions];
    }

    // Get random question
    const randomIndex = Math.floor(Math.random() * filteredQuestions.length);
    const selectedQuestion = filteredQuestions[randomIndex];
    
    setCurrentQuestion(selectedQuestion);
    setUsedQuestionIds(prev => new Set([...prev, selectedQuestion.id]));
    
    return selectedQuestion;
  }, [questions, usedQuestionIds]);

  // Get next question
  const nextQuestion = useCallback((filters = {}) => {
    return getRandomQuestion({ ...filters, excludeUsed: true });
  }, [getRandomQuestion]);

  // Check answer
  const checkAnswer = useCallback((userAnswer) => {
    if (!currentQuestion) return false;
    
    const isCorrect = userAnswer === currentQuestion.correct_answer;
    
    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));
    
    return isCorrect;
  }, [currentQuestion]);

  // Reset score
  const resetScore = useCallback(() => {
    setScore({ correct: 0, total: 0 });
    setUsedQuestionIds(new Set());
  }, []);

  // Get questions by difficulty
  const getQuestionsByDifficulty = useCallback((difficulty) => {
    return questions.filter(q => q.difficulty === difficulty);
  }, [questions]);

  // Get available question types
  const getQuestionTypes = useCallback(() => {
    return [...new Set(questions.map(q => q.type))];
  }, [questions]);

  // Load questions on mount or when category changes
  useEffect(() => {
    loadQuestions(category);
  }, [category, loadQuestions]);

  return {
    questions,
    currentQuestion,
    loading,
    error,
    score,
    getRandomQuestion,
    nextQuestion,
    checkAnswer,
    resetScore,
    getQuestionsByDifficulty,
    getQuestionTypes,
    loadQuestions
  };
};

export default useQuestionBank;
