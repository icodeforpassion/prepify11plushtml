(() => {
  const sequenceEl = document.querySelector("[data-nv-sequence]");
  const optionsEl = document.querySelector("[data-nv-options]");
  const messageEl = document.querySelector("[data-nv-message]");
  const nextBtn = document.querySelector("[data-nv-next]");
  if (!sequenceEl || !optionsEl || !nextBtn) return;

  const shapes = ["circle", "square", "triangle", "diamond"];
  const colors = ["#4f46e5", "#ec4899", "#0ea5e9", "#f97316", "#22c55e"];

  let answerKey = "";

  function randomInt(max) {
    return Math.floor(Math.random() * max);
  }

  function uniqueShuffle(items) {
    return [...items]
      .map((item) => ({ item, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ item }) => item);
  }

  function buildState(step) {
    const shapeIndex = (step.startShape + step.index * step.shapeJump) % shapes.length;
    const colorIndex = (step.startColor + step.index * step.colorJump) % colors.length;
    const rotation = (step.startRotation + step.index * step.rotationJump) % 360;
    const scale = 0.8 + (step.index % 3) * 0.2;

    return {
      shape: shapes[shapeIndex],
      color: colors[colorIndex],
      rotation,
      scale
    };
  }

  function shapeMarkup({ shape, color, rotation, scale }) {
    return `<div class="nv-shape nv-shape--${shape}" style="--shape-color:${color};--shape-rotation:${rotation}deg;--shape-scale:${scale};"></div>`;
  }

  function questionFactory() {
    const seed = {
      startShape: randomInt(shapes.length),
      startColor: randomInt(colors.length),
      startRotation: randomInt(4) * 45,
      shapeJump: randomInt(3) + 1,
      colorJump: randomInt(2) + 1,
      rotationJump: [45, 90, 135][randomInt(3)]
    };

    const sequence = Array.from({ length: 4 }, (_, index) => buildState({ ...seed, index }));
    const correctState = buildState({ ...seed, index: 4 });

    const wrongStates = [
      { ...correctState, color: colors[(colors.indexOf(correctState.color) + 1) % colors.length] },
      { ...correctState, shape: shapes[(shapes.indexOf(correctState.shape) + 1) % shapes.length] },
      { ...correctState, rotation: (correctState.rotation + 90) % 360 }
    ];

    const options = uniqueShuffle([
      { key: "correct", state: correctState },
      ...wrongStates.map((state, index) => ({ key: `wrong-${index}`, state }))
    ]);

    return { sequence, options };
  }

  function renderQuestion() {
    const question = questionFactory();
    sequenceEl.innerHTML = "";
    optionsEl.innerHTML = "";
    messageEl.textContent = "";

    question.sequence.forEach((state) => {
      const card = document.createElement("div");
      card.className = "nv-card";
      card.innerHTML = shapeMarkup(state);
      sequenceEl.appendChild(card);
    });

    question.options.forEach((option, idx) => {
      const button = document.createElement("button");
      button.className = "nv-option";
      button.type = "button";
      button.innerHTML = `<span class="nv-option__label">Option ${idx + 1}</span>${shapeMarkup(option.state)}`;
      button.dataset.key = option.key;
      optionsEl.appendChild(button);
    });

    answerKey = "correct";
  }

  optionsEl.addEventListener("click", (event) => {
    const button = event.target.closest("button.nv-option");
    if (!button) return;

    const isCorrect = button.dataset.key === answerKey;
    optionsEl.querySelectorAll(".nv-option").forEach((item) => {
      item.disabled = true;
      if (item.dataset.key === answerKey) item.classList.add("is-correct");
    });

    if (isCorrect) {
      button.classList.add("is-correct");
      messageEl.textContent = "Excellent! You spotted the pattern.";
      messageEl.classList.remove("is-error");
      messageEl.classList.add("is-success");
    } else {
      button.classList.add("is-wrong");
      messageEl.textContent = "Good try! Check colour, rotation, and shape changes.";
      messageEl.classList.remove("is-success");
      messageEl.classList.add("is-error");
    }
  });

  nextBtn.addEventListener("click", renderQuestion);
  renderQuestion();
})();
