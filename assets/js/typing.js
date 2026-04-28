(() => {
  const words = [
    "analyse", "fraction", "sequence", "grammar", "estimate", "parallel", "compare", "reasoning",
    "formula", "triangle", "vocabulary", "pattern", "rotate", "accuracy", "mission", "revision"
  ];

  const ui = {
    timer: document.querySelector("[data-typing-timer]"),
    wpm: document.querySelector("[data-typing-wpm]"),
    accuracy: document.querySelector("[data-typing-accuracy]"),
    word: document.querySelector("[data-typing-word]"),
    input: document.querySelector("[data-typing-input]"),
    start: document.querySelector("[data-typing-start]"),
    reset: document.querySelector("[data-typing-reset]"),
    message: document.querySelector("[data-typing-message]")
  };

  if (!ui.input) return;

  let roundSeconds = 60;
  let remaining = roundSeconds;
  let correct = 0;
  let attempts = 0;
  let activeWord = "";
  let timerId;
  let running = false;

  function pickWord() {
    activeWord = words[Math.floor(Math.random() * words.length)];
    ui.word.textContent = activeWord;
  }

  function renderStats() {
    ui.timer.textContent = String(remaining);
    ui.wpm.textContent = String(correct);
    const score = attempts ? Math.round((correct / attempts) * 100) : 100;
    ui.accuracy.textContent = String(score);
  }

  function stopRound(message = "Great focus! Tap start for another sprint.") {
    running = false;
    window.clearInterval(timerId);
    ui.input.disabled = true;
    ui.message.textContent = message;
    renderStats();
  }

  function startRound() {
    remaining = roundSeconds;
    correct = 0;
    attempts = 0;
    running = true;
    ui.message.textContent = "Go! Press space after each word.";
    ui.input.value = "";
    ui.input.disabled = false;
    ui.input.focus();
    pickWord();
    renderStats();

    window.clearInterval(timerId);
    timerId = window.setInterval(() => {
      remaining -= 1;
      renderStats();
      if (remaining <= 0) {
        stopRound(`Time! Final score: ${correct} correct words.`);
      }
    }, 1000);
  }

  function resetRound() {
    stopRound("Challenge reset. Press start when ready.");
    remaining = roundSeconds;
    correct = 0;
    attempts = 0;
    ui.input.value = "";
    ui.word.textContent = "press start";
    renderStats();
  }

  ui.input.addEventListener("keydown", (event) => {
    if (!running) return;
    if (event.key !== " ") return;
    event.preventDefault();

    const typed = ui.input.value.trim().toLowerCase();
    if (!typed) return;

    attempts += 1;
    if (typed === activeWord) correct += 1;

    ui.input.value = "";
    pickWord();
    renderStats();
  });

  ui.start.addEventListener("click", startRound);
  ui.reset.addEventListener("click", resetRound);
  resetRound();
})();
