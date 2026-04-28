(() => {
  const sequenceEl = document.querySelector('[data-nv-sequence]');
  const optionsEl = document.querySelector('[data-nv-options]');
  const messageEl = document.querySelector('[data-nv-message]');
  const nextBtn = document.querySelector('[data-nv-next]');
  const promptEl = document.querySelector('[data-nv-prompt]');
  const typeEl = document.querySelector('[data-nv-type]');
  if (!sequenceEl || !optionsEl || !nextBtn || !promptEl || !typeEl) return;

  const SYMBOLS = ['●', '■', '▲', '◆', '★', '✚', '⬢', '⬣'];
  const ARROWS = ['↑', '→', '↓', '←'];

  let answerKey = '';

  const randomInt = (max) => Math.floor(Math.random() * max);

  const uniqueShuffle = (items) => [...items]
    .map((item) => ({ item, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item);

  const makeOptionButton = (option, idx) => {
    const button = document.createElement('button');
    button.className = 'nv-option';
    button.type = 'button';
    button.dataset.key = option.key;
    button.innerHTML = `
      <span class="nv-option__label">Option ${idx + 1}</span>
      <span class="nv-card__value">${option.label}</span>
    `;
    return button;
  };

  const makeSequenceCard = (value) => {
    const card = document.createElement('div');
    card.className = 'nv-card';
    card.innerHTML = `<span class="nv-card__value">${value}</span>`;
    return card;
  };

  const sequencePuzzle = () => {
    const startIndex = randomInt(SYMBOLS.length);
    const step = randomInt(3) + 1;
    const sequence = Array.from({ length: 4 }, (_, i) => SYMBOLS[(startIndex + (i * step)) % SYMBOLS.length]);
    const correct = SYMBOLS[(startIndex + (4 * step)) % SYMBOLS.length];
    const wrong = uniqueShuffle(SYMBOLS.filter((symbol) => symbol !== correct)).slice(0, 3);

    const options = uniqueShuffle([{ key: 'correct', label: correct }, ...wrong.map((label, index) => ({ key: `wrong-${index}`, label }))]);
    return {
      type: 'Pattern sequence',
      prompt: 'Which symbol comes next in the sequence?',
      sequence,
      options,
      explanation: `Move forward by ${step} symbol${step > 1 ? 's' : ''} each step.`
    };
  };

  const oddOneOutPuzzle = () => {
    const symbol = SYMBOLS[randomInt(SYMBOLS.length)];
    const direction = ARROWS[randomInt(ARROWS.length)];
    const oddDirection = ARROWS[(ARROWS.indexOf(direction) + 2) % ARROWS.length];

    const options = uniqueShuffle([
      { key: 'correct', label: `${symbol}${oddDirection}` },
      { key: 'wrong-1', label: `${symbol}${direction}` },
      { key: 'wrong-2', label: `${symbol}${direction}` },
      { key: 'wrong-3', label: `${symbol}${direction}` }
    ]);

    return {
      type: 'Odd one out',
      prompt: 'Three options follow the same rule. Which one breaks it?',
      sequence: [`Rule hint: ${symbol} should point ${direction}`, `${symbol}${direction}`, `${symbol}${direction}`, `${symbol}${direction}`],
      options,
      explanation: `The outlier flips the arrow direction from ${direction} to ${oddDirection}.`
    };
  };

  const analogyPuzzle = () => {
    const source = SYMBOLS[randomInt(SYMBOLS.length)];
    const target = SYMBOLS[(SYMBOLS.indexOf(source) + 2) % SYMBOLS.length];
    const cSource = SYMBOLS[(SYMBOLS.indexOf(source) + 3) % SYMBOLS.length];
    const correct = SYMBOLS[(SYMBOLS.indexOf(cSource) + 2) % SYMBOLS.length];

    const wrong = uniqueShuffle(SYMBOLS.filter((symbol) => symbol !== correct)).slice(0, 3);
    const options = uniqueShuffle([{ key: 'correct', label: correct }, ...wrong.map((label, index) => ({ key: `wrong-${index}`, label }))]);

    return {
      type: 'Figure analogy',
      prompt: `${source} changes to ${target}. ${cSource} changes to…`,
      sequence: [`${source} → ${target}`, `${cSource} → ?`],
      options,
      explanation: 'Use the same jump in symbol position for the second pair.'
    };
  };

  const rotationPuzzle = () => {
    const start = randomInt(ARROWS.length);
    const step = randomInt(2) + 1;
    const sequence = Array.from({ length: 4 }, (_, i) => ARROWS[(start + (i * step)) % ARROWS.length]);
    const correct = ARROWS[(start + (4 * step)) % ARROWS.length];
    const wrong = uniqueShuffle(ARROWS.filter((arrow) => arrow !== correct));
    const options = uniqueShuffle([{ key: 'correct', label: correct }, ...wrong.map((label, index) => ({ key: `wrong-${index}`, label }))]);

    return {
      type: 'Rotation logic',
      prompt: 'Track the turn direction. Which arrow completes the pattern?',
      sequence,
      options,
      explanation: `Each step rotates ${step === 1 ? '90°' : '180°'}.`
    };
  };

  const puzzleFactories = [sequencePuzzle, oddOneOutPuzzle, analogyPuzzle, rotationPuzzle];

  function renderQuestion() {
    const question = puzzleFactories[randomInt(puzzleFactories.length)]();
    sequenceEl.innerHTML = '';
    optionsEl.innerHTML = '';
    messageEl.textContent = '';
    messageEl.className = 'form-message';
    promptEl.textContent = question.prompt;
    typeEl.textContent = question.type;

    question.sequence.forEach((value) => {
      sequenceEl.appendChild(makeSequenceCard(value));
    });

    question.options.forEach((option, idx) => {
      optionsEl.appendChild(makeOptionButton(option, idx));
    });

    answerKey = 'correct';
    nextBtn.dataset.explanation = question.explanation;
  }

  optionsEl.addEventListener('click', (event) => {
    const button = event.target.closest('button.nv-option');
    if (!button) return;

    const isCorrect = button.dataset.key === answerKey;
    optionsEl.querySelectorAll('.nv-option').forEach((item) => {
      item.disabled = true;
      if (item.dataset.key === answerKey) item.classList.add('is-correct');
    });

    if (isCorrect) {
      button.classList.add('is-correct');
      messageEl.textContent = `Excellent! ${nextBtn.dataset.explanation}`;
      messageEl.classList.add('is-success');
    } else {
      button.classList.add('is-wrong');
      messageEl.textContent = `Good try! ${nextBtn.dataset.explanation}`;
      messageEl.classList.add('is-error');
    }
  });

  nextBtn.addEventListener('click', renderQuestion);
  renderQuestion();
})();
