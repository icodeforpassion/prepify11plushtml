(function () {
  const doc = document;
  const flashcard = doc.querySelector('[data-flashcard]');
  if (!flashcard) return;

  const front = doc.querySelector('[data-flashcard-front]');
  const back = doc.querySelector('[data-flashcard-back]');
  const progress = doc.querySelector('[data-flashcard-progress]');
  const topic = doc.querySelector('[data-flashcard-topic]');
  const prevButton = doc.querySelector('[data-prev-card]');
  const nextButton = doc.querySelector('[data-next-card]');
  const flipButton = doc.querySelector('[data-flip-card]');
  const randomButton = doc.querySelector('[data-random-card]');
  const shuffleButton = doc.querySelector('[data-shuffle-cards]');

  const deck = [
    {
      word: 'Illuminate',
      meaning: 'to light up or explain clearly',
      example: 'The teacher used a story to illuminate the new maths method.',
      category: 'Synonyms',
    },
    {
      word: 'Resilient',
      meaning: 'able to recover quickly from difficulty',
      example: 'After a tricky question, Maya stayed resilient and tried again.',
      category: 'Character traits',
    },
    {
      word: 'Abundant',
      meaning: 'existing in large amounts',
      example: 'The garden was abundant with colourful flowers in spring.',
      category: 'Antonyms',
    },
    {
      word: 'Perplexed',
      meaning: 'confused and puzzled',
      example: 'I was perplexed by the riddle until my friend explained it.',
      category: 'Feelings',
    },
    {
      word: 'Emerge',
      meaning: 'to come out into view',
      example: 'The sun will emerge from behind the clouds soon.',
      category: 'Verbs',
    },
    {
      word: 'Tranquil',
      meaning: 'calm and peaceful',
      example: 'We read our book beside the tranquil lake.',
      category: 'Synonyms',
    },
    {
      word: 'Venture',
      meaning: 'to take a risk and do something new or daring',
      example: 'Let’s venture down the forest path and see where it leads.',
      category: 'Verbs',
    },
    {
      word: 'Meticulous',
      meaning: 'showing great attention to detail',
      example: 'Sami kept meticulous notes for every science experiment.',
      category: 'Character traits',
    },
    {
      word: 'Optimistic',
      meaning: 'hopeful and confident about the future',
      example: 'Even after a mistake, Ella stayed optimistic about her score.',
      category: 'Feelings',
    },
    {
      word: 'Convey',
      meaning: 'to communicate or make known',
      example: 'Choose precise words to convey your idea clearly.',
      category: 'Verbs',
    },
    {
      word: 'Precise',
      meaning: 'exact and accurate',
      example: 'Use precise measurements when baking cupcakes.',
      category: 'Synonyms',
    },
    {
      word: 'Reluctant',
      meaning: 'unwilling or hesitant',
      example: 'He felt reluctant to share his answer at first.',
      category: 'Feelings',
    },
    {
      word: 'Inquisitive',
      meaning: 'curious and eager to learn',
      example: 'An inquisitive mind loves to ask thoughtful questions.',
      category: 'Character traits',
    },
    {
      word: 'Adapt',
      meaning: 'to change to suit new conditions',
      example: 'We adapt our plan when a question seems unfamiliar.',
      category: 'Verbs',
    },
    {
      word: 'Exuberant',
      meaning: 'full of energy and excitement',
      example: 'The exuberant audience cheered for the performers.',
      category: 'Synonyms',
    },
    {
      word: 'Foster',
      meaning: 'to encourage the development of something',
      example: 'These cards foster a love of language and learning.',
      category: 'Verbs',
    },
    {
      word: 'Deter',
      meaning: 'to discourage someone from doing something',
      example: 'A difficult puzzle will not deter a determined learner.',
      category: 'Antonyms',
    },
    {
      word: 'Commence',
      meaning: 'to begin',
      example: 'The mock test will commence after the instructions.',
      category: 'Synonyms',
    },
    {
      word: 'Insightful',
      meaning: 'showing deep understanding',
      example: 'Her insightful answer impressed the whole class.',
      category: 'Character traits',
    },
    {
      word: 'Brief',
      meaning: 'short in time or length',
      example: 'Write a brief summary of the chapter.',
      category: 'Antonyms',
    },
  ];

  const state = {
    order: deck.map((_, index) => index),
    index: 0,
    flipped: false,
  };

  const shuffleArray = (array) => {
    const cloned = [...array];
    for (let i = cloned.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
    }
    return cloned;
  };

  const renderCard = (animate = true) => {
    const card = deck[state.order[state.index]];
    if (!card) return;

    if (animate) {
      flashcard.classList.add('flashcard-transition');
      setTimeout(() => {
        flashcard.classList.remove('flashcard-transition');
      }, 200);
    }

    if (state.flipped) {
      flashcard.classList.add('flipped');
    } else {
      flashcard.classList.remove('flipped');
    }

    front.textContent = card.word;
    back.innerHTML = `<p><strong>Meaning:</strong> ${card.meaning}</p><p class="flashcard-example">${card.example}</p>`;
    progress.textContent = `Card ${state.index + 1} of ${state.order.length}`;
    topic.textContent = `Focus: ${card.category}`;
  };

  const setIndex = (newIndex, animate = true) => {
    const total = state.order.length;
    state.index = ((newIndex % total) + total) % total;
    state.flipped = false;
    renderCard(animate);
  };

  const shuffleDeck = (animate = true) => {
    state.order = shuffleArray(state.order);
    state.index = 0;
    state.flipped = false;
    renderCard(animate);
  };

  prevButton?.addEventListener('click', () => {
    setIndex(state.index - 1);
  });

  nextButton?.addEventListener('click', () => {
    setIndex(state.index + 1);
  });

  flipButton?.addEventListener('click', () => {
    state.flipped = !state.flipped;
    flashcard.classList.toggle('flipped', state.flipped);
  });

  randomButton?.addEventListener('click', () => {
    if (state.order.length <= 1) return;
    let randomIndex = state.index;
    while (randomIndex === state.index) {
      randomIndex = Math.floor(Math.random() * state.order.length);
    }
    setIndex(randomIndex);
  });

  shuffleButton?.addEventListener('click', () => {
    shuffleDeck();
  });

  shuffleDeck(false);
})();
