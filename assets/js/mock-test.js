(function () {
  const doc = document;
  const startButton = doc.querySelector('[data-start-mock]');
  const introCard = doc.querySelector('[data-mock-intro]');
  const mockCard = doc.querySelector('[data-mock-card]');
  const summaryCard = doc.querySelector('[data-mock-summary]');
  const progressBar = doc.querySelector('[data-progress]');
  const progressText = doc.querySelector('[data-progress-text]');
  const topicLabel = doc.querySelector('[data-question-topic]');
  const questionText = doc.querySelector('[data-question-text]');
  const optionsContainer = doc.querySelector('[data-options]');
  const form = doc.querySelector('[data-question-form]');
  const prevButton = doc.querySelector('[data-prev-question]');
  const nextButton = doc.querySelector('[data-next-question]');
  const restartButton = doc.querySelector('[data-restart-mock]');
  const summaryScore = doc.querySelector('[data-summary-score]');
  const summaryMessage = doc.querySelector('[data-summary-message]');

  if (!startButton || !mockCard || !form) return;

  const mathQuestions = [
    {
      id: 'math-division',
      topic: 'Maths',
      question: 'What is 84 ÷ 7?',
      options: ['9', '11', '12', '13'],
      answer: 2,
    },
    {
      id: 'math-fraction',
      topic: 'Maths',
      question: 'Which fraction is equivalent to 3/4?',
      options: ['6/8', '9/16', '12/20', '5/12'],
      answer: 0,
    },
    {
      id: 'math-sum',
      topic: 'Maths',
      question: 'Ben reads 45 pages on Monday and 38 on Tuesday. How many pages in total?',
      options: ['73', '81', '83', '88'],
      answer: 2,
    },
    {
      id: 'math-measure',
      topic: 'Maths',
      question: 'A recipe needs 1.5 litres of juice. How many millilitres is that?',
      options: ['150 ml', '1500 ml', '15 ml', '1050 ml'],
      answer: 1,
    },
    {
      id: 'math-perimeter',
      topic: 'Maths',
      question: 'The perimeter of a rectangle is 30 cm. If the length is 9 cm, what is the width?',
      options: ['3 cm', '6 cm', '12 cm', '15 cm'],
      answer: 1,
    },
    {
      id: 'math-sequence',
      topic: 'Maths',
      question: 'What is the next number in the sequence: 5, 9, 13, 17, ... ?',
      options: ['19', '20', '21', '22'],
      answer: 2,
    },
    {
      id: 'math-decimal',
      topic: 'Maths',
      question: 'Which decimal is the largest?',
      options: ['0.49', '0.509', '0.5', '0.498'],
      answer: 1,
    },
    {
      id: 'math-expression',
      topic: 'Maths',
      question: 'What is 8 × 6 − 9?',
      options: ['39', '48', '42', '33'],
      answer: 0,
    },
  ];

  const vocabQuestions = [
    {
      id: 'vocab-radiant',
      topic: 'Vocabulary',
      question: 'Which word is closest in meaning to "radiant"?',
      options: ['glowing', 'hidden', 'distant', 'silent'],
      answer: 0,
    },
    {
      id: 'vocab-brisk',
      topic: 'Vocabulary',
      question: 'Choose the best synonym for "brisk".',
      options: ['lively', 'slow', 'careless', 'silent'],
      answer: 0,
    },
    {
      id: 'vocab-scarce',
      topic: 'Vocabulary',
      question: 'Select the antonym of "scarce".',
      options: ['rare', 'plentiful', 'tiny', 'hidden'],
      answer: 1,
    },
    {
      id: 'vocab-explanation',
      topic: 'Vocabulary',
      question: 'Which word best completes the sentence: The teacher asked for a ___ explanation.',
      options: ['vague', 'brief', 'thorough', 'quiet'],
      answer: 2,
    },
    {
      id: 'vocab-commend',
      topic: 'Vocabulary',
      question: 'What does "commend" most nearly mean?',
      options: ['criticise', 'praise', 'ignore', 'question'],
      answer: 1,
    },
    {
      id: 'vocab-diligent',
      topic: 'Vocabulary',
      question: 'Pick the word that means the same as "diligent".',
      options: ['lazy', 'hardworking', 'noisy', 'forgetful'],
      answer: 1,
    },
    {
      id: 'vocab-tranquil',
      topic: 'Vocabulary',
      question: 'Choose the word that is closest in meaning to "tranquil".',
      options: ['peaceful', 'stormy', 'crowded', 'speedy'],
      answer: 0,
    },
    {
      id: 'vocab-breakthrough',
      topic: 'Vocabulary',
      question: 'Which word fits the sentence: The scientist made a remarkable ___ in medicine.',
      options: ['breakthrough', 'outline', 'vacancy', 'detour'],
      answer: 0,
    },
    {
      id: 'vocab-expand',
      topic: 'Vocabulary',
      question: 'Select the best antonym for "expand".',
      options: ['stretch', 'inflate', 'shrink', 'enlarge'],
      answer: 2,
    },
    {
      id: 'vocab-vivid',
      topic: 'Vocabulary',
      question: 'Which word is a synonym for "vivid"?',
      options: ['dull', 'clear', 'blurry', 'faint'],
      answer: 1,
    },
  ];

  const state = {
    questions: [],
    currentIndex: 0,
    answers: [],
  };

  const shuffle = (array) => {
    const cloned = [...array];
    for (let i = cloned.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
    }
    return cloned;
  };

  const buildSet = () => {
    const total = 10 + Math.floor(Math.random() * 3);
    const mathsCount = Math.min(Math.ceil(total / 2), mathQuestions.length);
    const vocabCount = Math.min(total - mathsCount, vocabQuestions.length);
    const mathsSelection = shuffle(mathQuestions).slice(0, mathsCount);
    const vocabSelection = shuffle(vocabQuestions).slice(0, vocabCount);
    const combined = [...mathsSelection, ...vocabSelection];
    if (combined.length < total) {
      const extras = shuffle([...mathQuestions, ...vocabQuestions]).slice(0, total - combined.length);
      combined.push(...extras);
    }
    return shuffle(combined.slice(0, total));
  };

  const updateProgress = () => {
    const total = state.questions.length;
    if (!total) {
      progressBar.style.width = '0%';
      progressText.textContent = 'Question 0 of 0';
      return;
    }
    const current = state.currentIndex + 1;
    const progress = Math.min((current / total) * 100, 100);
    progressBar.style.width = `${progress}%`;
    progressText.textContent = `Question ${current} of ${total}`;
  };

  const applyQuestion = (question) => {
    const currentAnswer = state.answers[state.currentIndex];
    const questionId = `${question.id}-${state.currentIndex}`;
    topicLabel.textContent = question.topic === 'Maths' ? 'Maths Challenge' : 'Vocabulary Builder';
    questionText.textContent = question.question;
    optionsContainer.innerHTML = '';
    nextButton.disabled = currentAnswer === undefined || currentAnswer === null;

    question.options.forEach((option, index) => {
      const optionId = `${questionId}-option-${index}`;
      const label = doc.createElement('label');
      const input = doc.createElement('input');
      input.type = 'radio';
      input.name = 'mock-answer';
      input.value = index;
      input.id = optionId;
      if (currentAnswer === index) {
        input.checked = true;
        nextButton.disabled = false;
      }
      const textSpan = doc.createElement('span');
      textSpan.textContent = option;
      label.setAttribute('for', optionId);
      label.append(input, textSpan);
      optionsContainer.appendChild(label);
    });

    prevButton.disabled = state.currentIndex === 0;
    nextButton.textContent = state.currentIndex === state.questions.length - 1 ? 'See results' : 'Next question';
    updateProgress();
  };

  const renderQuestion = (instant = false) => {
    const question = state.questions[state.currentIndex];
    if (!question) return;

    if (instant) {
      mockCard.classList.remove('is-transitioning');
      applyQuestion(question);
      return;
    }

    mockCard.classList.add('is-transitioning');
    setTimeout(() => {
      applyQuestion(question);
      requestAnimationFrame(() => {
        mockCard.classList.remove('is-transitioning');
      });
    }, 180);
  };

  const showSummary = () => {
    const total = state.questions.length;
    const correct = state.answers.reduce((score, answer, index) => {
      return answer === state.questions[index].answer ? score + 1 : score;
    }, 0);
    const percentage = total ? Math.round((correct / total) * 100) : 0;
    const encouragement = (() => {
      if (percentage >= 90) return 'Phenomenal focus! Keep stretching your skills.';
      if (percentage >= 70) return 'Great job! Keep practicing to build confidence!';
      if (percentage >= 50) return 'Solid effort. Revisit any tricky questions and try again soon.';
      return 'Every attempt counts. Keep practicing to build confidence!';
    })();

    summaryScore.textContent = `You scored ${correct}/${total}.`;
    summaryMessage.textContent = encouragement;
    progressBar.style.width = '100%';
    progressText.textContent = 'Set complete';

    mockCard.hidden = true;
    summaryCard.hidden = false;
  };

  const startSet = () => {
    state.questions = buildSet();
    state.currentIndex = 0;
    state.answers = new Array(state.questions.length).fill(null);
    introCard.hidden = true;
    summaryCard.hidden = true;
    mockCard.hidden = false;
    renderQuestion(true);
  };

  startButton.addEventListener('click', () => {
    startSet();
  });

  restartButton?.addEventListener('click', () => {
    startSet();
  });

  prevButton.addEventListener('click', (event) => {
    event.preventDefault();
    if (state.currentIndex === 0) return;
    state.currentIndex -= 1;
    renderQuestion();
  });

  form.addEventListener('change', (event) => {
    if (event.target.name !== 'mock-answer') return;
    state.answers[state.currentIndex] = Number(event.target.value);
    nextButton.disabled = false;
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const selected = form.querySelector('input[name="mock-answer"]:checked');
    if (!selected) return;
    state.answers[state.currentIndex] = Number(selected.value);
    if (state.currentIndex === state.questions.length - 1) {
      showSummary();
      return;
    }
    state.currentIndex += 1;
    renderQuestion();
  });
})();
