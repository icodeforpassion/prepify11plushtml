(function () {
  const doc = document;
  const form = doc.querySelector('[data-mock-form]');
  const categoryContainer = doc.querySelector('[data-category-checkboxes]');
  const countRange = doc.querySelector('[data-question-count]');
  const countDisplay = doc.querySelector('[data-count-display]');
  const timeSuggestion = doc.querySelector('[data-time-suggestion]');
  const customTime = doc.querySelector('[data-custom-time]');
  const seedInput = doc.querySelector('[data-seed-input]');
  const builderStatus = doc.querySelector('[data-builder-status]');
  const saveButton = doc.querySelector('[data-save-config]');
  const savedPanel = doc.querySelector('[data-saved-config]');
  const savedSummary = doc.querySelector('[data-saved-summary]');
  const loadConfigButton = doc.querySelector('[data-load-config]');
  const clearConfigButton = doc.querySelector('[data-clear-config]');

  const questionContainer = doc.querySelector('[data-mock-question-container]');
  const questionText = doc.querySelector('[data-mock-question]');
  const optionsList = doc.querySelector('[data-mock-options]');
  const submitButton = doc.querySelector('[data-submit-answer]');
  const nextButton = doc.querySelector('[data-next-question]');
  const endButton = doc.querySelector('[data-end-mock]');
  const feedback = doc.querySelector('[data-mock-feedback]');
  const questionIndexLabel = doc.querySelector('[data-mock-question-index]');
  const scoreLabel = doc.querySelector('[data-mock-score]');
  const timerLabel = doc.querySelector('[data-mock-timer]');

  const resultsPanel = doc.querySelector('[data-results-panel]');
  const resultsSummary = doc.querySelector('[data-results-summary]');
  const resultsList = doc.querySelector('[data-results-list]');
  const reviewToggle = doc.querySelector('[data-review-toggle]');
  const regenerateButton = doc.querySelector('[data-regenerate]');

  if (!form || !questionContainer) return;

  const difficultyTimings = {
    easy: 45,
    medium: 60,
    hard: 75,
  };

  const storageKeys = {
    config: 'prepify11plus.mock.config',
  };

  const categoryPool = [
    { id: 'arithmetic', label: 'Arithmetic Basics' },
    { id: 'bodmas', label: 'Operations & BODMAS' },
    { id: 'fractions', label: 'Fractions' },
    { id: 'decimals', label: 'Decimals' },
    { id: 'percentages', label: 'Percentages' },
    { id: 'ratio', label: 'Ratio & Proportion' },
    { id: 'factors', label: 'Factors & Multiples' },
    { id: 'negative', label: 'Negative Numbers' },
    { id: 'algebra', label: 'Algebra Basics' },
    { id: 'sequences', label: 'Sequences & Patterns' },
    { id: 'word', label: 'Word Problems' },
    { id: 'time', label: 'Time & Timetables' },
    { id: 'measures', label: 'Measures & Units' },
    { id: 'perimeter', label: 'Perimeter & Area' },
    { id: 'triangles', label: 'Triangles' },
    { id: 'angles', label: 'Angles' },
    { id: 'coordinates', label: 'Coordinates & Graphs' },
    { id: 'data', label: 'Data Handling' },
    { id: 'symmetry', label: 'Symmetry & Transformations' },
    { id: 'speed', label: 'Speed / Distance / Time' },
  ];

  const state = {
    config: null,
    questions: [],
    index: 0,
    score: 0,
    timer: null,
    remainingSeconds: 0,
    selectedOption: null,
    answers: [],
    lastConfig: null,
  };

  const randomInt = (rng, min, max) => Math.floor(rng() * (max - min + 1)) + min;
  const choice = (rng, array) => array[randomInt(rng, 0, array.length - 1)];
  const shuffle = (rng, array) => {
    const clone = [...array];
    for (let i = clone.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rng() * (i + 1));
      [clone[i], clone[j]] = [clone[j], clone[i]];
    }
    return clone;
  };

  const createRng = (seedValue) => {
    let seed = seedValue;
    if (typeof seed !== 'number') {
      seed = 0;
      const str = String(seedValue);
      for (let i = 0; i < str.length; i += 1) {
        seed = (seed * 31 + str.charCodeAt(i)) >>> 0;
      }
    }
    if (seed === 0) seed = Date.now();
    return () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };
  };

  const buildOptions = (rng, answer, generator) => {
    const set = new Set([answer]);
    while (set.size < 4) {
      const candidate = generator();
      if (!set.has(candidate)) set.add(candidate);
    }
    return shuffle(rng, [...set]);
  };

  const questionGenerators = {
    arithmetic: (rng, difficulty) => {
      const range = difficulty === 'hard' ? [40, 200] : difficulty === 'medium' ? [15, 120] : [5, 60];
      const a = randomInt(rng, range[0], range[1]);
      const b = randomInt(rng, range[0] / 2, range[1] / 2);
      const ops = ['+', '-', '×', '÷'];
      const op = choice(rng, ops);
      let left = a;
      let right = b;
      let answer;
      if (op === '+') answer = left + right;
      if (op === '-') {
        if (right > left) [left, right] = [right, left];
        answer = left - right;
      }
      if (op === '×') answer = left * right;
      if (op === '÷') {
        const divisor = randomInt(rng, 2, difficulty === 'hard' ? 12 : 9);
        answer = randomInt(rng, 2, 12);
        left = answer * divisor;
        right = divisor;
        op = '÷';
      }
      const options = buildOptions(rng, String(answer), () => String(answer + randomInt(rng, -12, 12)));
      return {
        prompt: `Calculate ${left} ${op} ${right}`,
        options,
        answer: String(answer),
        explanation: `Use ${op} carefully to reach ${answer}.`,
      };
    },
    bodmas: (rng, difficulty) => {
      const a = randomInt(rng, 2, difficulty === 'hard' ? 12 : 8);
      const b = randomInt(rng, 2, difficulty === 'hard' ? 10 : 6);
      const c = randomInt(rng, 1, difficulty === 'hard' ? 9 : 6);
      const expression = `${a} × (${b} + ${c}) - ${c}`;
      const answer = a * (b + c) - c;
      const options = buildOptions(rng, String(answer), () => String(answer + randomInt(rng, -12, 12)));
      return {
        prompt: `Work out ${expression}`,
        options,
        answer: String(answer),
        explanation: `Add inside brackets first: ${b + c}. Multiply by ${a} then subtract ${c}.`,
      };
    },
    fractions: (rng, difficulty) => {
      const denominator = choice(rng, difficulty === 'hard' ? [6, 8, 9, 10, 12] : [4, 5, 6, 8]);
      const a = randomInt(rng, 1, denominator - 1);
      const b = randomInt(rng, 1, denominator - 1);
      const numerator = a + b;
      const answer = `${numerator}/${denominator}`;
      const options = buildOptions(rng, answer, () => `${numerator + randomInt(rng, -2, 2)}/${denominator}`);
      return {
        prompt: `What is ${a}/${denominator} + ${b}/${denominator}?`,
        options,
        answer,
        explanation: `Same denominator so add numerators: ${a + b}/${denominator}.`,
      };
    },
    decimals: (rng, difficulty) => {
      const precision = difficulty === 'hard' ? 2 : 1;
      const toDecimal = (value) => (value / 10 ** precision).toFixed(precision);
      const a = toDecimal(randomInt(rng, 20, 180));
      const b = toDecimal(randomInt(rng, 10, 90));
      const answer = (parseFloat(a) + parseFloat(b)).toFixed(precision);
      const options = buildOptions(rng, answer, () => (parseFloat(answer) + randomInt(rng, -6, 6) / 10).toFixed(precision));
      return {
        prompt: `Calculate ${a} + ${b}`,
        options,
        answer,
        explanation: `Line up the decimal points: ${a} + ${b} = ${answer}.`,
      };
    },
    percentages: (rng, difficulty) => {
      const percent = choice(rng, difficulty === 'hard' ? [12.5, 17.5, 22.5, 35] : [10, 15, 20, 25, 30]);
      const base = randomInt(rng, 40, difficulty === 'hard' ? 400 : 200);
      const answer = Math.round((base * percent) / 100 * 10) / 10;
      const options = buildOptions(rng, answer.toString(), () => (answer + randomInt(rng, -15, 15) / 10).toFixed(1));
      return {
        prompt: `What is ${percent}% of ${base}?`,
        options,
        answer: answer.toString(),
        explanation: `${percent}% = ${percent}/100. Multiply ${base} by ${percent}/100.`,
      };
    },
    ratio: (rng, difficulty) => {
      const base = randomInt(rng, 2, difficulty === 'hard' ? 12 : 8);
      const ratioA = base * randomInt(rng, 2, 6);
      const ratioB = base * randomInt(rng, 2, 7);
      const gcd = (x, y) => (y === 0 ? x : gcd(y, x % y));
      const factor = gcd(ratioA, ratioB);
      const answer = `${ratioA / factor}:${ratioB / factor}`;
      const options = buildOptions(rng, answer, () => `${ratioA / factor + randomInt(rng, -3, 3)}:${ratioB / factor + randomInt(rng, -3, 3)}`);
      return {
        prompt: `Simplify the ratio ${ratioA}:${ratioB}`,
        options,
        answer,
        explanation: `Divide both parts by ${factor}.`,
      };
    },
    factors: (rng) => {
      const a = randomInt(rng, 6, 20);
      const b = randomInt(rng, 6, 20);
      const gcd = (x, y) => (y === 0 ? x : gcd(y, x % y));
      const hcf = gcd(a, b);
      const options = buildOptions(rng, String(hcf), () => String(hcf + randomInt(rng, -6, 6)));
      return {
        prompt: `Find the highest common factor of ${a} and ${b}`,
        options,
        answer: String(hcf),
        explanation: `List factors or use Euclid's algorithm: HCF = ${hcf}.`,
      };
    },
    negative: (rng, difficulty) => {
      const range = difficulty === 'hard' ? 30 : 15;
      const a = randomInt(rng, -range, range);
      const b = randomInt(rng, -range, range);
      const operations = ['+', '-', '×'];
      let op = choice(rng, operations);
      let answer;
      if (op === '+') answer = a + b;
      if (op === '-') answer = a - b;
      if (op === '×') answer = a * b;
      const options = buildOptions(rng, String(answer), () => String(answer + randomInt(rng, -10, 10)));
      return {
        prompt: `Calculate ${a} ${op} ${b}`,
        options,
        answer: String(answer),
        explanation: `Apply negative number rules to reach ${answer}.`,
      };
    },
    algebra: (rng, difficulty) => {
      const multiplier = difficulty === 'hard' ? randomInt(rng, 3, 9) : randomInt(rng, 2, 5);
      const x = randomInt(rng, 2, 12);
      const constant = randomInt(rng, 1, 15);
      const result = multiplier * x + constant;
      const options = buildOptions(rng, String(x), () => String(x + randomInt(rng, -5, 5)));
      return {
        prompt: `Solve for x: ${multiplier}x + ${constant} = ${result}`,
        options,
        answer: String(x),
        explanation: `Subtract ${constant}, then divide by ${multiplier}.`,
      };
    },
    sequences: (rng, difficulty) => {
      const start = randomInt(rng, 2, 15);
      const step = randomInt(rng, difficulty === 'hard' ? 4 : 2, difficulty === 'hard' ? 9 : 6);
      const length = 4;
      const sequence = Array.from({ length }, (_, i) => start + step * i);
      const answer = sequence[length - 1] + step;
      const options = buildOptions(rng, String(answer), () => String(answer + randomInt(rng, -step, step)));
      return {
        prompt: `Sequence: ${sequence.join(', ')} … What is the next number?`,
        options,
        answer: String(answer),
        explanation: `Add ${step} each time.`,
      };
    },
    word: (rng, difficulty) => {
      const price = randomInt(rng, 2, difficulty === 'hard' ? 12 : 8);
      const items = randomInt(rng, 3, difficulty === 'hard' ? 12 : 6);
      const answer = price * items;
      const options = buildOptions(rng, `£${answer}`, () => `£${answer + randomInt(rng, -15, 15)}`);
      return {
        prompt: `${items} workbooks cost £${price} each. What is the total cost?`,
        options,
        answer: `£${answer}`,
        explanation: `Multiply price by quantity: ${items} × £${price} = £${answer}.`,
      };
    },
    time: (rng) => {
      const hours = randomInt(rng, 1, 4);
      const minutes = randomInt(rng, 5, 50);
      const total = hours * 60 + minutes;
      const options = buildOptions(rng, String(total), () => String(total + randomInt(rng, -40, 40)));
      return {
        prompt: `How many minutes are there in ${hours} hour(s) ${minutes} minutes?`,
        options,
        answer: String(total),
        explanation: `Multiply hours by 60, then add ${minutes}.`,
      };
    },
    measures: (rng, difficulty) => {
      const centimetres = randomInt(rng, difficulty === 'hard' ? 100 : 30, difficulty === 'hard' ? 1000 : 400);
      const metres = (centimetres / 100).toFixed(2);
      const options = buildOptions(rng, `${metres} m`, () => `${(centimetres / 100 + randomInt(rng, -40, 40) / 100).toFixed(2)} m`);
      return {
        prompt: `Convert ${centimetres} cm into metres`,
        options,
        answer: `${metres} m`,
        explanation: `Divide centimetres by 100.`,
      };
    },
    perimeter: (rng, difficulty) => {
      const length = randomInt(rng, 4, difficulty === 'hard' ? 20 : 12);
      const width = randomInt(rng, 3, difficulty === 'hard' ? 15 : 10);
      const area = length * width;
      const options = buildOptions(rng, `${area} cm²`, () => `${area + randomInt(rng, -15, 15)} cm²`);
      return {
        prompt: `A rectangle is ${length} cm by ${width} cm. What is the area?`,
        options,
        answer: `${area} cm²`,
        explanation: `Multiply length by width.`,
      };
    },
    triangles: (rng, difficulty) => {
      const angleA = randomInt(rng, 30, 90);
      const angleB = randomInt(rng, 20, 120 - angleA);
      const angleC = 180 - angleA - angleB;
      const options = buildOptions(rng, `${angleC}°`, () => `${angleC + randomInt(rng, -15, 15)}°`);
      return {
        prompt: `Triangle PQR has angles ${angleA}° and ${angleB}°. What is the third angle?`,
        options,
        answer: `${angleC}°`,
        explanation: `Angles in a triangle sum to 180°.`,
      };
    },
    angles: (rng, difficulty) => {
      const total = choice(rng, [180, 360]);
      const given = randomInt(rng, 30, total - 40);
      const answer = total - given;
      const options = buildOptions(rng, `${answer}°`, () => `${answer + randomInt(rng, -20, 20)}°`);
      const context = total === 180 ? 'straight line' : 'full turn';
      return {
        prompt: `On a ${context}, one angle is ${given}°. What is the remaining angle?`,
        options,
        answer: `${answer}°`,
        explanation: `${context} totals ${total}°. Subtract ${given}.`,
      };
    },
    coordinates: (rng) => {
      const x = randomInt(rng, -6, 6);
      const y = randomInt(rng, -6, 6);
      const moveX = randomInt(rng, -4, 4);
      const moveY = randomInt(rng, -4, 4);
      const newX = x + moveX;
      const newY = y + moveY;
      const answer = `(${newX}, ${newY})`;
      const options = buildOptions(rng, answer, () => `(${newX + randomInt(rng, -2, 2)}, ${newY + randomInt(rng, -2, 2)})`);
      return {
        prompt: `Start at (${x}, ${y}). Move ${moveX >= 0 ? '+' : ''}${moveX} on x and ${moveY >= 0 ? '+' : ''}${moveY} on y. Where do you finish?`,
        options,
        answer,
        explanation: `Add the movements to each coordinate.`,
      };
    },
    data: (rng, difficulty) => {
      const count = difficulty === 'hard' ? 5 : 4;
      const values = Array.from({ length: count }, () => randomInt(rng, 4, 16));
      const sum = values.reduce((total, value) => total + value, 0);
      const mean = Math.round((sum / values.length) * 10) / 10;
      const options = buildOptions(rng, mean.toString(), () => (mean + randomInt(rng, -6, 6) / 10).toFixed(1));
      return {
        prompt: `Scores recorded: ${values.join(', ')}. What is the mean score?`,
        options,
        answer: mean.toString(),
        explanation: `Add them to get ${sum}, divide by ${values.length}.`,
      };
    },
    symmetry: (rng) => {
      const shapes = [
        { name: 'square', lines: 4 },
        { name: 'rectangle', lines: 2 },
        { name: 'regular pentagon', lines: 5 },
        { name: 'regular hexagon', lines: 6 },
        { name: 'equilateral triangle', lines: 3 },
      ];
      const shape = choice(rng, shapes);
      const options = buildOptions(rng, String(shape.lines), () => String(shape.lines + randomInt(rng, -3, 3)));
      return {
        prompt: `How many lines of symmetry does a ${shape.name} have?`,
        options,
        answer: String(shape.lines),
        explanation: `A ${shape.name} has ${shape.lines} lines of symmetry.`,
      };
    },
    speed: (rng, difficulty) => {
      const speed = randomInt(rng, 20, difficulty === 'hard' ? 90 : 60);
      const time = randomInt(rng, 2, difficulty === 'hard' ? 8 : 5);
      const distance = speed * time;
      const options = buildOptions(rng, `${distance} km`, () => `${distance + randomInt(rng, -40, 40)} km`);
      return {
        prompt: `A coach travels at ${speed} km/h for ${time} hours. How far does it go?`,
        options,
        answer: `${distance} km`,
        explanation: `Distance = speed × time.`,
      };
    },
  };

  const populateCategories = () => {
    const fragment = doc.createDocumentFragment();
    categoryPool.forEach((category) => {
      const label = doc.createElement('label');
      const input = doc.createElement('input');
      input.type = 'checkbox';
      input.name = 'categories';
      input.value = category.id;
      label.appendChild(input);
      label.append(` ${category.label}`);
      fragment.appendChild(label);
    });
    categoryContainer.appendChild(fragment);
  };

  const formatMinutes = (seconds) => {
    if (!seconds) return '—';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const updateSuggestion = () => {
    const difficulty = form.elements.difficulty.value;
    const perQuestion = difficultyTimings[difficulty] || 60;
    const count = Number(countRange.value);
    const suggestedSeconds = Math.round((perQuestion * count) / 5) * 5;
    const suggestedMinutes = Math.max(5, Math.round(suggestedSeconds / 60));
    timeSuggestion.textContent = suggestedMinutes;
    if (!customTime.dataset.userChanged) {
      customTime.value = suggestedMinutes;
    }
  };

  const resetState = () => {
    clearInterval(state.timer);
    state.timer = null;
    state.questions = [];
    state.index = 0;
    state.score = 0;
    state.answers = [];
    state.selectedOption = null;
    state.remainingSeconds = 0;
    questionText.textContent = 'Configure your mock to begin.';
    optionsList.innerHTML = '';
    questionIndexLabel.textContent = '0';
    scoreLabel.textContent = '0';
    timerLabel.textContent = '—';
    feedback.textContent = '';
    submitButton.disabled = true;
    nextButton.disabled = true;
    endButton.disabled = true;
    resultsPanel.hidden = true;
  };

  const renderQuestion = () => {
    const question = state.questions[state.index];
    if (!question) return;
    questionText.textContent = question.prompt;
    optionsList.innerHTML = '';
    question.options.forEach((option, index) => {
      const li = doc.createElement('li');
      const button = doc.createElement('button');
      button.type = 'button';
      button.textContent = option;
      button.dataset.index = String(index);
      li.appendChild(button);
      optionsList.appendChild(li);
    });
    questionIndexLabel.textContent = `${state.index + 1} / ${state.questions.length}`;
    submitButton.disabled = true;
    nextButton.disabled = true;
    endButton.disabled = false;
    feedback.textContent = '';
    state.selectedOption = null;
  };

  const updateScore = () => {
    scoreLabel.textContent = `${state.score}`;
  };

  const finishMock = (message) => {
    clearInterval(state.timer);
    state.timer = null;
    submitButton.disabled = true;
    nextButton.disabled = true;
    endButton.disabled = true;
    feedback.textContent = message || 'Mock completed.';
    showResults();
  };

  const handleTimerTick = () => {
    state.remainingSeconds -= 1;
    if (state.remainingSeconds <= 0) {
      timerLabel.textContent = '0:00';
      finishMock('Time is up!');
    } else {
      timerLabel.textContent = formatMinutes(state.remainingSeconds);
    }
  };

  const startTimer = (seconds) => {
    clearInterval(state.timer);
    state.remainingSeconds = seconds;
    timerLabel.textContent = formatMinutes(state.remainingSeconds);
    state.timer = setInterval(handleTimerTick, 1000);
  };

  const handleOptionClick = (event) => {
    const button = event.target.closest('button');
    if (!button || button.disabled) return;
    optionsList.querySelectorAll('button').forEach((btn) => btn.classList.remove('selected'));
    button.classList.add('selected');
    state.selectedOption = Number(button.dataset.index);
    submitButton.disabled = false;
  };

  const handleSubmitAnswer = () => {
    if (state.selectedOption == null) return;
    const question = state.questions[state.index];
    const selectedText = question.options[state.selectedOption];
    const isCorrect = selectedText === question.answer;
    if (isCorrect) {
      state.score += 1;
      feedback.textContent = question.explanation || 'Correct!';
      feedback.style.color = '#15803d';
      window.PrepifyFX?.play('success');
    } else {
      feedback.textContent = `Not quite. ${question.explanation || ''}`.trim();
      feedback.style.color = '#b91c1c';
      window.PrepifyFX?.play('error');
    }

    optionsList.querySelectorAll('button').forEach((button, index) => {
      button.disabled = true;
      if (question.options[index] === question.answer) {
        button.classList.add('mock-option--correct');
      }
      if (index === state.selectedOption && !isCorrect) {
        button.classList.add('mock-option--wrong');
      }
    });

    state.answers[state.index] = {
      selected: selectedText,
      correct: isCorrect,
    };

    if (state.score === state.index + 1) {
      window.PrepifyFX?.celebrate();
    }

    updateScore();
    submitButton.disabled = true;
    if (state.index >= state.questions.length - 1) {
      finishMock('Mock complete!');
    } else {
      nextButton.disabled = false;
    }
  };

  const handleNextQuestion = () => {
    if (state.index >= state.questions.length - 1) {
      finishMock('Mock complete!');
      return;
    }
    state.index += 1;
    renderQuestion();
  };

  const showResults = () => {
    if (!state.questions.length) return;
    resultsPanel.hidden = false;
    const scorePercent = Math.round((state.score / state.questions.length) * 100);
    resultsSummary.textContent = `You scored ${state.score} out of ${state.questions.length} (${scorePercent}%). Seed: ${state.config.seed}`;
    resultsList.innerHTML = '';
    state.questions.forEach((question, index) => {
      const li = doc.createElement('li');
      const answer = state.answers[index];
      const correct = answer?.correct;
      li.classList.add(correct ? 'correct' : 'incorrect');
      li.innerHTML = `
        <h3>Q${index + 1}. ${question.prompt}</h3>
        <p><strong>Your answer:</strong> ${answer?.selected ?? '—'}</p>
        <p><strong>Correct answer:</strong> ${question.answer}</p>
        <p><em>${question.explanation || ''}</em></p>
      `;
      resultsList.appendChild(li);
    });
  };

  const buildQuestions = (config) => {
    const rng = createRng(config.seedNumber);
    const questions = [];
    for (let i = 0; i < config.count; i += 1) {
      const category = choice(rng, config.categories);
      const generator = questionGenerators[category];
      if (!generator) continue;
      const question = generator(rng, config.difficulty);
      question.category = category;
      questions.push(question);
    }
    return questions;
  };

  const startMock = (config) => {
    resetState();
    state.config = config;
    state.lastConfig = config;
    state.questions = buildQuestions(config);
    state.answers = new Array(state.questions.length);
    if (!state.questions.length) {
      builderStatus.textContent = 'Unable to generate questions. Try different categories.';
      return;
    }
    resultsPanel.hidden = true;
    builderStatus.textContent = `Mock generated with seed ${config.seed}. Good luck!`;
    renderQuestion();
    updateScore();
    startTimer(config.time * 60);
    window.PrepifyFX?.play('start');
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const selectedCategories = formData.getAll('categories');
    if (!selectedCategories.length) {
      builderStatus.textContent = 'Choose at least one category to begin.';
      return;
    }
    const difficulty = formData.get('difficulty') || 'easy';
    const count = Number(formData.get('count')) || 10;
    const time = Math.max(5, Number(formData.get('time')) || 15);
    const seedValue = seedInput.value.trim() || Math.random().toString(36).slice(2);
    const seedNumber = createRng(seedValue)() * 1e9;
    const config = {
      categories: selectedCategories,
      difficulty,
      count,
      time,
      seed: seedValue,
      seedNumber,
    };
    state.lastConfig = config;
    startMock(config);
  };

  const handleSaveConfig = () => {
    const formData = new FormData(form);
    const selectedCategories = formData.getAll('categories');
    if (!selectedCategories.length) {
      builderStatus.textContent = 'Select categories before saving.';
      return;
    }
    const difficulty = formData.get('difficulty') || 'easy';
    const count = Number(formData.get('count')) || 10;
    const time = Number(formData.get('time')) || 15;
    const seed = seedInput.value.trim();
    const config = { categories: selectedCategories, difficulty, count, time, seed };
    localStorage.setItem(storageKeys.config, JSON.stringify(config));
    showSavedConfig(config);
    builderStatus.textContent = 'Configuration saved.';
  };

  const showSavedConfig = (config) => {
    savedPanel.hidden = false;
    savedSummary.textContent = `${config.categories.length} categories • ${config.count} questions • ${config.difficulty} difficulty • ${config.time} minutes`;
  };

  const loadSavedConfig = () => {
    const raw = localStorage.getItem(storageKeys.config);
    if (!raw) return;
    try {
      const config = JSON.parse(raw);
      categoryContainer.querySelectorAll('input[type="checkbox"]').forEach((input) => {
        input.checked = config.categories.includes(input.value);
      });
      form.elements.difficulty.value = config.difficulty || 'easy';
      countRange.value = config.count || 10;
      countDisplay.textContent = config.count || 10;
      customTime.value = config.time || 15;
      customTime.dataset.userChanged = 'true';
      seedInput.value = config.seed || '';
      updateSuggestion();
      showSavedConfig(config);
      builderStatus.textContent = 'Configuration loaded.';
    } catch (error) {
      console.error('Failed to load config', error);
    }
  };

  const clearSavedConfig = () => {
    localStorage.removeItem(storageKeys.config);
    savedPanel.hidden = true;
    builderStatus.textContent = 'Saved configuration cleared.';
  };

  const handleReviewToggle = () => {
    resultsList.classList.toggle('review-active');
  };

  const handleRegenerate = () => {
    if (!state.lastConfig) {
      builderStatus.textContent = 'Generate a mock first.';
      return;
    }
    const newSeed = Math.random().toString(36).slice(2);
    const newConfig = { ...state.lastConfig, seed: newSeed, seedNumber: createRng(newSeed)() * 1e9 };
    state.lastConfig = newConfig;
    startMock(newConfig);
    resultsPanel.hidden = true;
  };

  categoryContainer.addEventListener('change', () => {
    builderStatus.textContent = '';
  });

  countRange.addEventListener('input', () => {
    countDisplay.textContent = countRange.value;
    updateSuggestion();
  });

  Array.from(form.elements.difficulty).forEach((radio) => {
    radio.addEventListener('change', updateSuggestion);
  });

  customTime.addEventListener('input', () => {
    customTime.dataset.userChanged = 'true';
  });

  optionsList.addEventListener('click', handleOptionClick);
  submitButton.addEventListener('click', handleSubmitAnswer);
  nextButton.addEventListener('click', handleNextQuestion);
  endButton.addEventListener('click', () => finishMock('Mock ended early.'));

  form.addEventListener('submit', handleFormSubmit);
  saveButton.addEventListener('click', handleSaveConfig);
  loadConfigButton?.addEventListener('click', loadSavedConfig);
  clearConfigButton?.addEventListener('click', clearSavedConfig);
  reviewToggle?.addEventListener('click', handleReviewToggle);
  regenerateButton?.addEventListener('click', handleRegenerate);

  populateCategories();
  updateSuggestion();
  countDisplay.textContent = countRange.value;
  const saved = localStorage.getItem(storageKeys.config);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      showSavedConfig(parsed);
    } catch (error) {
      console.error(error);
    }
  }
})();
