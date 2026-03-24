(function () {
  const doc = document;
  const assetRoot = (() => {
    const rootAttr = doc.body?.dataset?.root || '.';
    if (rootAttr === '/' || rootAttr === '') {
      return '';
    }
    return rootAttr.endsWith('/') ? rootAttr.slice(0, -1) : rootAttr;
  })();

  const resolvePath = (path) => `${assetRoot}/${path.replace(/^\//, '')}`;

  const loadStatus = doc.getElementById('loadStatus');
  const categoryGrid = doc.getElementById('categoryGrid');
  const startBtn = doc.getElementById('startBtn');
  const qCountEl = doc.getElementById('questionCount');
  const timeEl = doc.getElementById('timeLimit');
  const landing = doc.getElementById('landing');

  const testHud = doc.getElementById('testHud');
  const qText = doc.getElementById('qText');
  const optionsEl = doc.getElementById('options');
  const feedback = doc.getElementById('feedback');
  const nextBtn = doc.getElementById('nextBtn');
  const endBtn = doc.getElementById('endBtn');
  const progressFill = doc.getElementById('progressFill');
  const scoreEl = doc.getElementById('score');
  const timerEl = doc.getElementById('timer');

  const resultsEl = doc.getElementById('results');
  const summaryEl = doc.getElementById('summary');
  const resultList = doc.getElementById('resultList');
  const restartBtn = doc.getElementById('restartBtn');

  if (!categoryGrid || !startBtn) return;

  const FILES = {
    maths: [
      resolvePath('data/arithmetic_questions.json'),
      resolvePath('data/fractions_questions.json'),
      resolvePath('data/geometry_questions.json'),
      resolvePath('data/measurement_questions.json'),
      resolvePath('data/triangle_logic_questions.json'),
    ],
    reasoning: [resolvePath('data/reasoning_questions.json')],
  };
  let bankAll = [];
  let bankMaths = [];
  let bankReason = [];
  let activeCategory = null;
  let questions = [];
  let idx = 0;
  let score = 0;
  let timer = null;
  let remaining = 0;
  let answers = [];

  const shuffle = (arr) => {
    for (let i = arr.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const setProgress = () => {
    const pct = questions.length ? Math.round((idx / questions.length) * 100) : 0;
    progressFill.style.width = `${pct}%`;
  };

  const dissolveSelection = (target) => {
    if (!target) return;
    target.classList.add('fade-out');
    window.setTimeout(() => {
      categoryGrid.querySelectorAll('.category-chip').forEach((chip) => {
        chip.disabled = true;
      });
      startBtn.disabled = false;
    }, 300);
  };

  const loadFiles = async (files) => {
    const output = [];
    for (const file of files) {
      try {
        const res = await fetch(file);
        const data = await res.json();
        data.forEach((q) => {
          output.push({
            question: q.question || q.q || '',
            options: q.options || q.opts || [],
            answer: q.answer ?? q.ans,
            explanation: q.explanation || q.exp || '',
          });
        });
      } catch (error) {
        console.error('Failed to load question bank', file, error);
      }
    }
    return output;
  };

  const preloadAll = async () => {
    if (loadStatus) loadStatus.textContent = 'Loading question banks…';
    const [mathsBank, reasoningBank] = await Promise.all([
      loadFiles(FILES.maths),
      loadFiles(FILES.reasoning),
    ]);
    bankMaths = mathsBank;
    bankReason = reasoningBank;
    bankAll = [...bankMaths, ...bankReason];
    if (loadStatus) {
      const total = bankAll.length;
      loadStatus.textContent = total
        ? `✅ Loaded ${total} total questions`
        : '⚠️ Could not load question banks. Check file paths.';
    }
  };

  const startMock = () => {
    const count = Math.max(5, Math.min(50, Number.parseInt(qCountEl.value, 10) || 10));
    const time = Math.max(5, Math.min(120, Number.parseInt(timeEl.value, 10) || 15));

    let bank;
    if (activeCategory === 'maths') bank = bankMaths;
    else if (activeCategory === 'reasoning') bank = bankReason;
    else bank = bankAll;

    if (!bank.length) {
      feedback.textContent = 'Unable to start – no questions available.';
      return;
    }

    questions = shuffle(bank.slice()).slice(0, count);
    idx = 0;
    score = 0;
    remaining = time * 60;
    answers = [];

    landing.hidden = true;
    resultsEl.hidden = true;
    testHud.hidden = false;
    feedback.textContent = '';
    scoreEl.textContent = '0';
    timerEl.textContent = formatTime(remaining);

    if (timer) window.clearInterval(timer);
    timer = window.setInterval(() => {
      remaining -= 1;
      timerEl.textContent = formatTime(Math.max(0, remaining));
      if (remaining <= 0) {
        window.clearInterval(timer);
        finish(true);
      }
    }, 1000);

    setProgress();
    renderQuestion();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderQuestion = () => {
    const question = questions[idx];
    qText.textContent = `${idx + 1}. ${question.question}`;
    optionsEl.innerHTML = '';
    feedback.textContent = '';
    feedback.className = 'feedback';
    nextBtn.disabled = true;

    shuffle((question.options || []).slice()).forEach((option) => {
      const button = doc.createElement('button');
      button.className = 'option-btn';
      button.type = 'button';
      button.textContent = option;
      button.addEventListener('click', () => grade(button, question.answer, question.explanation));
      optionsEl.appendChild(button);
    });

    setProgress();
  };

  const grade = (button, correctAnswer, explanation) => {
    optionsEl.querySelectorAll('.option-btn').forEach((opt) => {
      opt.disabled = true;
    });

    const isCorrect = button.textContent === String(correctAnswer);
    if (isCorrect) {
      button.classList.add('correct');
      feedback.textContent = `✅ Correct! ${explanation || ''}`.trim();
      feedback.className = 'feedback ok';
      score += 1;
      scoreEl.textContent = String(score);
    } else {
      button.classList.add('incorrect');
      feedback.textContent = `❌ Incorrect. Correct: ${correctAnswer}${explanation ? ` — ${explanation}` : ''}`;
      feedback.className = 'feedback no';
      optionsEl.querySelectorAll('.option-btn').forEach((opt) => {
        if (opt.textContent === String(correctAnswer)) {
          opt.classList.add('correct');
        }
      });
    }

    answers.push({
      index: idx + 1,
      selected: button.textContent,
      correct: String(correctAnswer),
    });

    nextBtn.disabled = false;
  };

  const next = () => {
    idx += 1;
    if (idx >= questions.length) {
      finish(false);
    } else {
      renderQuestion();
    }
  };

  const finish = (timedOut) => {
    if (timer) window.clearInterval(timer);
    testHud.hidden = true;
    resultsEl.hidden = false;

    const baseMessage = `You scored ${score}/${questions.length}.`;
    summaryEl.textContent = timedOut ? `⏰ Time's up! ${baseMessage}` : baseMessage;

    resultList.innerHTML = '';
    questions.forEach((question, index) => {
      const answer = answers[index];
      const li = doc.createElement('li');
      const correct = answer && answer.selected === answer.correct;
      li.innerHTML = `
        <div><strong>Q${index + 1}.</strong> ${question.question}</div>
        <div>Answer: <strong>${question.answer}</strong>${question.explanation ? ` — ${question.explanation}` : ''}</div>
        <div>Your choice: <span style="font-weight:600; ${correct ? 'color:#16a34a' : 'color:#ef4444'}">${answer ? answer.selected : '—'}</span></div>
      `;
      resultList.appendChild(li);
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetToLanding = () => {
    resultsEl.hidden = true;
    landing.hidden = false;
    startBtn.disabled = true;
    categoryGrid.querySelectorAll('.category-chip').forEach((chip) => {
      chip.classList.remove('fade-out');
      chip.disabled = false;
    });
    activeCategory = null;
  };

  categoryGrid.addEventListener('click', (event) => {
    const chip = event.target.closest('.category-chip');
    if (!chip) return;
    activeCategory = chip.dataset.category;
    dissolveSelection(chip);
  });

  startBtn.addEventListener('click', startMock);
  nextBtn.addEventListener('click', next);
  endBtn.addEventListener('click', () => finish(false));
  restartBtn.addEventListener('click', resetToLanding);

  preloadAll();
})();
