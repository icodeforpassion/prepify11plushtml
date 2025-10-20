(function () {
  const doc = document;
  const grid = doc.querySelector('[data-maths-grid]');
  const questionText = doc.querySelector('[data-question-text]');
  const optionList = doc.querySelector('[data-option-list]');
  const feedback = doc.querySelector('[data-feedback]');
  const nextButton = doc.querySelector('[data-next-question]');
  const activeCategoryLabel = doc.querySelector('[data-active-category]');
  const answeredCount = doc.querySelector('[data-answered-count]');
  const correctCount = doc.querySelector('[data-correct-count]');
  const accuracyLabel = doc.querySelector('[data-accuracy]');
  const progressFill = doc.querySelector('[data-progress-fill]');
  const resetButton = doc.querySelector('[data-reset-mission]');

  if (!grid || !questionText) return;

  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const choice = (array) => array[rand(0, array.length - 1)];

  const buildOptions = (correct, generator) => {
    const options = new Set([correct]);
    while (options.size < 4) {
      const value = generator();
      if (value !== correct) options.add(value);
    }
    return shuffleArray([...options]);
  };

  const shuffleArray = (array) => {
    const clone = [...array];
    for (let i = clone.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [clone[i], clone[j]] = [clone[j], clone[i]];
    }
    return clone;
  };

  const categories = [
    {
      id: 'arithmetic',
      title: 'Arithmetic Basics',
      description: 'Mixed addition, subtraction, multiplication, and division drills.',
      generator: () => {
        const operations = ['+', '-', '×', '÷'];
        const op = choice(operations);
        let a = rand(6, 60);
        let b = rand(3, 12);
        let answer;
        if (op === '+') {
          answer = a + b;
        } else if (op === '-') {
          if (b > a) [a, b] = [b, a];
          answer = a - b;
        } else if (op === '×') {
          answer = a * b;
        } else {
          answer = a;
          const divisor = rand(2, 10);
          a = answer * divisor;
          b = divisor;
        }
        const question = `Calculate ${a} ${op} ${b}`;
        const options = buildOptions(answer, () => answer + rand(-9, 9));
        return { question, options, answer: String(answer), explanation: `Use the ${op} operation carefully to reach ${answer}.` };
      },
    },
    {
      id: 'bodmas',
      title: 'Operations & BODMAS',
      description: 'Evaluate expressions using order of operations.',
      generator: () => {
        const a = rand(2, 9);
        const b = rand(2, 8);
        const c = rand(1, 9);
        const expression = `${a} × (${b} + ${c}) - ${c}`;
        const answer = a * (b + c) - c;
        const options = buildOptions(answer, () => answer + rand(-10, 10));
        return {
          question: `Work out ${expression}`,
          options,
          answer: String(answer),
          explanation: `Bracket first: ${b + c}. Multiply by ${a} to get ${a * (b + c)}, then subtract ${c}.`,
        };
      },
    },
    {
      id: 'fractions',
      title: 'Fractions',
      description: 'Add, subtract, and compare fractions.',
      generator: () => {
        const numerator1 = rand(1, 9);
        const denominator = rand(2, 9);
        const numerator2 = rand(1, 9);
        const sum = numerator1 + numerator2;
        const answer = `${sum}/${denominator}`;
        const options = buildOptions(answer, () => `${sum + rand(-2, 2)}/${denominator}`);
        return {
          question: `What is ${numerator1}/${denominator} + ${numerator2}/${denominator}? Simplify if needed.`,
          options,
          answer,
          explanation: `Add the numerators because denominators match: ${numerator1 + numerator2}/${denominator}.`,
        };
      },
    },
    {
      id: 'decimals',
      title: 'Decimals',
      description: 'Add, subtract, and compare decimals.',
      generator: () => {
        const a = (rand(10, 90) / 10).toFixed(1);
        const b = (rand(1, 40) / 10).toFixed(1);
        const answer = (parseFloat(a) + parseFloat(b)).toFixed(1);
        const options = buildOptions(answer, () => (parseFloat(answer) + rand(-4, 4) / 10).toFixed(1));
        return {
          question: `Calculate ${a} + ${b}`,
          options,
          answer,
          explanation: `Align decimal points: ${a} + ${b} = ${answer}.`,
        };
      },
    },
    {
      id: 'percentages',
      title: 'Percentages',
      description: 'Find percentages of numbers and simple increases.',
      generator: () => {
        const base = rand(20, 200);
        const percent = choice([10, 15, 20, 25, 30, 40, 50]);
        const answer = Math.round((base * percent) / 100);
        const options = buildOptions(answer, () => answer + rand(-12, 12));
        return {
          question: `What is ${percent}% of ${base}?`,
          options,
          answer: String(answer),
          explanation: `${percent}% means multiply by ${percent}/100. ${base} × ${percent}/100 = ${answer}.`,
        };
      },
    },
    {
      id: 'ratio',
      title: 'Ratio & Proportion',
      description: 'Simplify ratios and scale quantities.',
      generator: () => {
        const base = rand(2, 9);
        const ratioA = base * rand(2, 5);
        const ratioB = base * rand(2, 6);
        const gcd = (x, y) => (y === 0 ? x : gcd(y, x % y));
        const factor = gcd(ratioA, ratioB);
        const answer = `${ratioA / factor}:${ratioB / factor}`;
        const options = buildOptions(answer, () => `${(ratioA / factor) + rand(-2, 2)}:${(ratioB / factor) + rand(-2, 2)}`);
        return {
          question: `Simplify the ratio ${ratioA}:${ratioB}`,
          options,
          answer,
          explanation: `Divide both parts by ${factor} to get ${answer}.`,
        };
      },
    },
    {
      id: 'factors',
      title: 'Factors & Multiples',
      description: 'Find HCFs, LCMs, and common multiples.',
      generator: () => {
        const a = rand(6, 18);
        const b = rand(6, 18);
        const lcm = (x, y) => (x * y) / gcd(x, y);
        const gcd = (x, y) => (y === 0 ? x : gcd(y, x % y));
        const answer = lcm(a, b);
        const options = buildOptions(answer, () => answer + rand(-10, 10));
        return {
          question: `Find the lowest common multiple of ${a} and ${b}`,
          options,
          answer: String(answer),
          explanation: `LCM = (${a} × ${b}) ÷ HCF(${a}, ${b}).`,
        };
      },
    },
    {
      id: 'negative',
      title: 'Negative Numbers',
      description: 'Add, subtract, and multiply with negative numbers.',
      generator: () => {
        const a = rand(-12, 12);
        const b = rand(-9, 9);
        const operations = ['+', '-', '×'];
        const op = choice(operations);
        let answer;
        if (op === '+') answer = a + b;
        if (op === '-') answer = a - b;
        if (op === '×') answer = a * b;
        const options = buildOptions(answer, () => answer + rand(-6, 6));
        return {
          question: `Calculate ${a} ${op} ${b}`,
          options,
          answer: String(answer),
          explanation: `Follow negative number rules to reach ${answer}.`,
        };
      },
    },
    {
      id: 'algebra',
      title: 'Algebra Basics',
      description: 'Solve simple equations and evaluate expressions.',
      generator: () => {
        const x = rand(2, 12);
        const a = rand(2, 9);
        const b = rand(1, 10);
        const result = a * x + b;
        const answer = x;
        const options = buildOptions(answer, () => answer + rand(-4, 4));
        return {
          question: `Solve for x: ${a}x + ${b} = ${result}`,
          options: options.map(String),
          answer: String(answer),
          explanation: `Subtract ${b} then divide by ${a}: (${result} - ${b}) ÷ ${a} = ${answer}.`,
        };
      },
    },
    {
      id: 'sequences',
      title: 'Sequences & Patterns',
      description: 'Identify rules and find missing terms.',
      generator: () => {
        const start = rand(2, 20);
        const step = rand(2, 8);
        const position = rand(4, 7);
        const sequence = Array.from({ length: position }, (_, i) => start + step * i);
        const answer = sequence[position - 1] + step;
        const options = buildOptions(answer, () => answer + rand(-step, step));
        return {
          question: `Sequence: ${sequence.join(', ')} … What is the next number?`,
          options,
          answer: String(answer),
          explanation: `Add ${step} each time: last term ${sequence[position - 1]} + ${step} = ${answer}.`,
        };
      },
    },
    {
      id: 'word-problems',
      title: 'Word Problems',
      description: 'Apply arithmetic in everyday contexts.',
      generator: () => {
        const price = rand(2, 9);
        const items = rand(3, 8);
        const total = price * items;
        const answer = total;
        const options = buildOptions(answer, () => answer + rand(-6, 6));
        return {
          question: `${items} comic books cost £${price} each. How much do they cost altogether?`,
          options,
          answer: String(answer),
          explanation: `${items} × £${price} = £${answer}.`,
        };
      },
    },
    {
      id: 'time',
      title: 'Time & Timetables',
      description: 'Convert times and read schedules.',
      generator: () => {
        const hours = rand(1, 3);
        const minutes = rand(10, 50);
        const total = hours * 60 + minutes;
        const options = buildOptions(total, () => total + rand(-30, 30));
        return {
          question: `How many minutes are there in ${hours} hour(s) ${minutes} minutes?`,
          options,
          answer: String(total),
          explanation: `${hours} × 60 = ${hours * 60}; add ${minutes} to get ${total} minutes.`,
        };
      },
    },
    {
      id: 'measures',
      title: 'Measures & Units',
      description: 'Convert between units of length, mass, and capacity.',
      generator: () => {
        const centimetres = rand(150, 950);
        const metres = (centimetres / 100).toFixed(2);
        const options = buildOptions(metres, () => (centimetres / 100 + rand(-30, 30) / 100).toFixed(2));
        return {
          question: `Convert ${centimetres} cm into metres`,
          options,
          answer: metres,
          explanation: `Divide by 100 to convert cm to m: ${centimetres} ÷ 100 = ${metres} m.`,
        };
      },
    },
    {
      id: 'perimeter-area',
      title: 'Perimeter & Area',
      description: 'Find the perimeter and area of rectangles and compound shapes.',
      generator: () => {
        const length = rand(5, 20);
        const width = rand(3, 12);
        const area = length * width;
        const options = buildOptions(area, () => area + rand(-15, 15));
        return {
          question: `A rectangle is ${length} cm by ${width} cm. What is its area?`,
          options,
          answer: String(area),
          explanation: `Area = length × width = ${length} × ${width} = ${area} cm².`,
        };
      },
    },
    {
      id: 'triangles',
      title: 'Triangles',
      description: 'Classify triangles and use the angle sum rule.',
      generator: () => {
        const angleA = rand(30, 90);
        const angleB = rand(20, 100 - angleA);
        const angleC = 180 - angleA - angleB;
        const answer = String(angleC);
        const options = buildOptions(angleC, () => angleC + rand(-15, 15));
        return {
          question: `A triangle has angles ${angleA}° and ${angleB}°. What is the third angle?`,
          options,
          answer,
          explanation: `Angles in a triangle sum to 180°. ${180 - (angleA + angleB)}°.`,
        };
      },
    },
    {
      id: 'angles',
      title: 'Angles (Lines & Polygons)',
      description: 'Calculate angles on straight lines and within polygons.',
      generator: () => {
        const straight = choice([180, 360]);
        const known = rand(40, 140);
        const answer = straight - known;
        const options = buildOptions(answer, () => answer + rand(-20, 20));
        const context = straight === 180 ? 'straight line' : 'full turn';
        return {
          question: `On a ${context}, one angle is ${known}°. What is the remaining angle?`,
          options,
          answer: String(answer),
          explanation: `${context} totals ${straight}°. ${straight} - ${known} = ${answer}°.`,
        };
      },
    },
    {
      id: 'coordinates',
      title: 'Coordinates & Graphs',
      description: 'Plot coordinates and describe movements.',
      generator: () => {
        const x = rand(-5, 5);
        const y = rand(-5, 5);
        const moveX = rand(-3, 3);
        const moveY = rand(-3, 3);
        const newX = x + moveX;
        const newY = y + moveY;
        const answer = `(${newX}, ${newY})`;
        const options = buildOptions(answer, () => `(${newX + rand(-2, 2)}, ${newY + rand(-2, 2)})`);
        return {
          question: `Starting at (${x}, ${y}), move ${moveX >= 0 ? '+' : ''}${moveX} on x and ${moveY >= 0 ? '+' : ''}${moveY} on y. Where do you land?`,
          options,
          answer,
          explanation: `Add the movement to each coordinate: (${x} + ${moveX}, ${y} + ${moveY}) = ${answer}.`,
        };
      },
    },
    {
      id: 'data',
      title: 'Data Handling',
      description: 'Interpret charts, tables, and calculate averages.',
      generator: () => {
        const numbers = [rand(5, 15), rand(6, 18), rand(4, 14), rand(5, 16)];
        const sum = numbers.reduce((total, value) => total + value, 0);
        const mean = Math.round((sum / numbers.length) * 10) / 10;
        const options = buildOptions(mean, () => Math.round((mean + rand(-5, 5) / 10) * 10) / 10);
        return {
          question: `The scores ${numbers.join(', ')} were recorded. What is the mean score?`,
          options: options.map((value) => value.toString()),
          answer: mean.toString(),
          explanation: `Add them up (${sum}) and divide by ${numbers.length} to get ${mean}.`,
        };
      },
    },
    {
      id: 'symmetry',
      title: 'Symmetry & Transformations',
      description: 'Work with symmetry, reflections, and rotations.',
      generator: () => {
        const shapes = [
          { name: 'square', lines: 4 },
          { name: 'rectangle', lines: 2 },
          { name: 'equilateral triangle', lines: 3 },
          { name: 'regular hexagon', lines: 6 },
        ];
        const shape = choice(shapes);
        const answer = String(shape.lines);
        const options = buildOptions(answer, () => String(shape.lines + rand(-2, 2)));
        return {
          question: `How many lines of symmetry does a ${shape.name} have?`,
          options,
          answer,
          explanation: `A ${shape.name} has ${shape.lines} lines of symmetry.`,
        };
      },
    },
    {
      id: 'speed',
      title: 'Speed • Distance • Time',
      description: 'Use the speed-distance-time triangle to solve problems.',
      generator: () => {
        const speed = rand(20, 60);
        const time = rand(2, 6);
        const distance = speed * time;
        const answer = String(distance);
        const options = buildOptions(distance, () => distance + rand(-40, 40));
        return {
          question: `A train travels at ${speed} km/h for ${time} hours. How far does it go?`,
          options,
          answer,
          explanation: `Distance = speed × time = ${speed} × ${time} = ${distance} km.`,
        };
      },
    },
  ];

  const categoryMap = new Map(categories.map((cat) => [cat.id, cat]));

  const state = {
    category: null,
    currentQuestion: null,
    answered: 0,
    correct: 0,
    streak: 0,
  };

  const renderCategoryCards = () => {
    categories.forEach((category) => {
      const card = doc.createElement('article');
      card.className = 'category-card';
      card.innerHTML = `
        <h3>${category.title}</h3>
        <p>${category.description}</p>
        <footer>
          <button class="btn" type="button" data-category="${category.id}">Start mission</button>
        </footer>
      `;
      grid.appendChild(card);
    });
  };

  const updateScoreboard = () => {
    answeredCount.textContent = state.answered;
    correctCount.textContent = state.correct;
    const accuracy = state.answered ? Math.round((state.correct / state.answered) * 100) : 0;
    accuracyLabel.textContent = `${accuracy}%`;
    progressFill.style.width = `${accuracy}%`;
    progressFill.parentElement?.setAttribute('aria-valuenow', String(accuracy));
  };

  const showQuestion = (question) => {
    questionText.textContent = question.question;
    optionList.innerHTML = '';
    question.options.forEach((option) => {
      const button = doc.createElement('button');
      button.type = 'button';
      button.className = 'option-btn';
      button.textContent = option;
      button.dataset.optionValue = option;
      optionList.appendChild(button);
    });
    nextButton.disabled = true;
    feedback.textContent = '';
    feedback.className = 'maths-feedback';
  };

  const startMission = (categoryId) => {
    const category = categoryMap.get(categoryId);
    if (!category) return;
    state.category = category;
    state.answered = 0;
    state.correct = 0;
    state.streak = 0;
    activeCategoryLabel.textContent = `${category.title} mission`;
    window.PrepifyFX?.play('start');
    generateNewQuestion();
    updateScoreboard();
  };

  const generateNewQuestion = () => {
    if (!state.category) return;
    state.currentQuestion = state.category.generator();
    showQuestion(state.currentQuestion);
  };

  const handleAnswer = (selected) => {
    if (!state.currentQuestion) return;
    const buttons = optionList.querySelectorAll('button');
    buttons.forEach((button) => {
      button.disabled = true;
      if (button.dataset.optionValue === state.currentQuestion.answer) {
        button.classList.add('correct');
      }
    });

    state.answered += 1;
    if (selected === state.currentQuestion.answer) {
      state.correct += 1;
      state.streak += 1;
      feedback.textContent = state.currentQuestion.explanation || 'Correct!';
      feedback.className = 'maths-feedback ok';
      window.PrepifyFX?.play('success');
    } else {
      state.streak = 0;
      feedback.textContent = `Not quite. ${state.currentQuestion.explanation || ''}`.trim();
      feedback.className = 'maths-feedback no';
      window.PrepifyFX?.play('error');
      buttons.forEach((button) => {
        if (button.dataset.optionValue === selected) {
          button.classList.add('incorrect');
        }
      });
    }

    if (state.correct === state.answered && state.answered > 0) {
      window.PrepifyFX?.celebrate();
    }

    updateScoreboard();
    nextButton.disabled = false;
  };

  const handleOptionClick = (event) => {
    const button = event.target.closest('button');
    if (!button || button.disabled) return;
    handleAnswer(button.dataset.optionValue);
  };

  const resetMission = () => {
    state.category = null;
    state.currentQuestion = null;
    state.answered = 0;
    state.correct = 0;
    state.streak = 0;
    activeCategoryLabel.textContent = 'Pick a category to begin.';
    questionText.textContent = 'Choose a mission to generate your first question.';
    optionList.innerHTML = '';
    feedback.textContent = '';
    feedback.className = 'maths-feedback';
    nextButton.disabled = true;
    updateScoreboard();
  };

  renderCategoryCards();
  updateScoreboard();

  grid.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-category]');
    if (!button) return;
    startMission(button.dataset.category);
  });

  optionList.addEventListener('click', handleOptionClick);
  nextButton.addEventListener('click', generateNewQuestion);
  resetButton?.addEventListener('click', resetMission);
})();
