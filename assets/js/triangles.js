(function () {
  const doc = document;
  const gallery = doc.querySelector('[data-triangle-gallery]');
  const status = doc.querySelector('[data-triangle-status]');
  const questionText = doc.querySelector('[data-triangle-question]');
  const optionsContainer = doc.querySelector('[data-triangle-options]');
  const feedback = doc.querySelector('[data-triangle-feedback]');
  const nextButton = doc.querySelector('[data-triangle-next]');
  const attemptsLabel = doc.querySelector('[data-triangle-attempts]');
  const correctLabel = doc.querySelector('[data-triangle-correct]');
  const modeButtons = doc.querySelectorAll('[data-question-mode]');

  if (!status || !questionText) return;

  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const choice = (array) => array[rand(0, array.length - 1)];

  const shuffle = (array) => {
    const clone = [...array];
    for (let i = clone.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [clone[i], clone[j]] = [clone[j], clone[i]];
    }
    return clone;
  };

  const buildOptions = (correct, generator) => {
    const set = new Set([correct]);
    while (set.size < 4) {
      const candidate = generator();
      if (candidate !== correct) set.add(candidate);
    }
    return shuffle([...set]);
  };

  const state = {
    mode: null,
    currentQuestion: null,
    attempts: 0,
    correct: 0,
  };

  const updateStats = () => {
    attemptsLabel.textContent = state.attempts;
    correctLabel.textContent = state.correct;
  };

  const generators = {
    angles: () => {
      const type = choice(['scalene', 'isosceles']);
      if (type === 'scalene') {
        const a = rand(30, 80);
        const b = rand(20, 120 - a);
        const c = 180 - a - b;
        const options = buildOptions(`${c}°`, () => `${c + rand(-15, 15)}°`);
        return {
          question: `Triangle ABC has angles ${a}° and ${b}°. What is the third angle?`,
          options,
          answer: `${c}°`,
          explanation: `Angles in a triangle total 180°. 180 - (${a} + ${b}) = ${c}°.`,
        };
      }
      const baseAngle = rand(30, 70);
      const top = 180 - 2 * baseAngle;
      const options = buildOptions(`${baseAngle}°`, () => `${baseAngle + rand(-10, 10)}°`);
      return {
        question: `An isosceles triangle has vertex angle ${top}°. What is each base angle?`,
        options,
        answer: `${baseAngle}°`,
        explanation: `The two base angles are equal. (180 - ${top}) ÷ 2 = ${baseAngle}°.`,
      };
    },
    classification: () => {
      const patterns = [
        { sides: [7, 7, 7], type: 'equilateral' },
        { sides: [9, 9, 6], type: 'isosceles' },
        { sides: [5, 6, 8], type: 'scalene' },
        { sides: [3, 4, 5], type: 'right-angled' },
      ];
      const pattern = choice(patterns);
      const options = shuffle(['equilateral', 'isosceles', 'scalene', 'right-angled']);
      return {
        question: `A triangle has side lengths ${pattern.sides.join(' cm, ')} cm. What type of triangle is it?`,
        options,
        answer: pattern.type,
        explanation: `Check for equal sides or Pythagoras (${pattern.type}).`,
      };
    },
    area: () => {
      const base = rand(6, 20);
      const height = rand(5, 15);
      const area = Math.round((base * height) / 2);
      const options = buildOptions(`${area} cm²`, () => `${area + rand(-10, 10)} cm²`);
      return {
        question: `A triangle has base ${base} cm and perpendicular height ${height} cm. What is its area?`,
        options,
        answer: `${area} cm²`,
        explanation: `Area = ½ × base × height = ½ × ${base} × ${height} = ${area} cm².`,
      };
    },
  };

  const showQuestion = (payload) => {
    state.currentQuestion = payload;
    questionText.textContent = payload.question;
    optionsContainer.innerHTML = '';
    payload.options.forEach((option) => {
      const button = doc.createElement('button');
      button.type = 'button';
      button.className = 'triangle-option';
      button.textContent = option;
      button.dataset.value = option;
      optionsContainer.appendChild(button);
    });
    feedback.textContent = '';
    nextButton.disabled = true;
  };

  const requestQuestion = (mode) => {
    const generator = generators[mode];
    if (!generator) return;
    state.mode = mode;
    status.textContent = `Mode: ${mode === 'angles' ? 'Angle reasoning' : mode === 'classification' ? 'Triangle classification' : 'Area & perimeter'}`;
    showQuestion(generator());
  };

  const handleOption = (button) => {
    if (!state.currentQuestion) return;
    const { answer, explanation } = state.currentQuestion;
    const selected = button.dataset.value;
    const buttons = optionsContainer.querySelectorAll('button');
    buttons.forEach((btn) => {
      btn.disabled = true;
      if (btn.dataset.value === answer) btn.classList.add('triangle-option--correct');
      if (btn === button && selected !== answer) btn.classList.add('triangle-option--wrong');
    });

    state.attempts += 1;
    if (selected === answer) {
      state.correct += 1;
      feedback.textContent = explanation;
      feedback.style.color = '#15803d';
      window.PrepifyFX?.play('success');
      window.PrepifyFX?.sparkle?.();
    } else {
      feedback.textContent = `Not quite. ${explanation}`.trim();
      feedback.style.color = '#b91c1c';
      window.PrepifyFX?.play('error');
    }

    if (state.correct === state.attempts && state.attempts > 0) {
      window.PrepifyFX?.celebrate();
    }

    updateStats();
    nextButton.disabled = false;
  };

  const handleGalleryToggle = (target) => {
    gallery.querySelectorAll('.triangle-card').forEach((card) => {
      card.classList.remove('triangle-card--active');
    });
    target.classList.add('triangle-card--active');
  };

  gallery?.addEventListener('click', (event) => {
    const card = event.target.closest('.triangle-card');
    if (!card) return;
    handleGalleryToggle(card);
  });

  optionsContainer.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button || button.disabled) return;
    handleOption(button);
  });

  nextButton.addEventListener('click', () => {
    if (!state.mode) return;
    requestQuestion(state.mode);
  });

  modeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      modeButtons.forEach((btn) => btn.classList.remove('btn--active'));
      button.classList.add('btn--active');
      requestQuestion(button.dataset.questionMode);
    });
  });

  updateStats();
})();
