(function () {
  const doc = document;
  const assetRoot = (() => {
    const rootAttr = doc.body?.dataset?.root || '.';
    if (rootAttr === '/' || rootAttr === '') {
      return '';
    }
    return rootAttr.endsWith('/') ? rootAttr.slice(0, -1) : rootAttr;
  })();

  const resolvePath = (path) => {
    if (!path) return path;
    return `${assetRoot}/${path.replace(/^\//, '')}`;
  };

  const flashcard = doc.querySelector('[data-flashcard]');
  if (!flashcard) return;

  const front = doc.querySelector('[data-flashcard-front]');
  const back = doc.querySelector('[data-flashcard-back]');
  const progress = doc.querySelector('[data-flashcard-progress]');
  const focusLabel = doc.querySelector('[data-flashcard-topic]');
  const statusMessage = doc.querySelector('[data-status-message]');
  const totalCount = doc.querySelector('[data-total-count]');
  const masteredCount = doc.querySelector('[data-mastered-count]');
  const bookmarkedCount = doc.querySelector('[data-bookmarked-count]');
  const flipButton = doc.querySelector('[data-flip-card]');
  const prevButton = doc.querySelector('[data-prev-card]');
  const nextButton = doc.querySelector('[data-next-card]');
  const randomButton = doc.querySelector('[data-random-card]');
  const shuffleButton = doc.querySelector('[data-shuffle-cards]');
  const markMasteredButton = doc.querySelector('[data-mark-mastered]');
  const bookmarkButton = doc.querySelector('[data-toggle-bookmark]');
  const resetButton = doc.querySelector('[data-reset-mastery]');
  const restoreButton = doc.querySelector('[data-restore-mastered]');
  const exportButton = doc.querySelector('[data-export-bookmarks]');
  const sparkle = flashcard.querySelector('.sparkle');

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const storage = window.localStorage;
  const storageKeys = {
    mastered: 'prepify11plus.flashcards.mastered',
    bookmarks: 'prepify11plus.flashcards.bookmarks',
  };

  const safeParse = (value) => {
    try {
      return Array.isArray(JSON.parse(value)) ? JSON.parse(value) : [];
    } catch (error) {
      return [];
    }
  };

  const initialMastered = new Set(safeParse(storage.getItem(storageKeys.mastered)));
  const initialBookmarks = new Set(safeParse(storage.getItem(storageKeys.bookmarks)));

  const state = {
    deck: [],
    activeOrder: [],
    index: 0,
    flipped: false,
    mastered: initialMastered,
    bookmarks: initialBookmarks,
  };

  const setStatus = (message) => {
    if (!statusMessage) return;
    statusMessage.textContent = message;
    if (!prefersReducedMotion) {
      statusMessage.classList.remove('status-pop');
      void statusMessage.offsetWidth;
      statusMessage.classList.add('status-pop');
    }
  };

  const persist = () => {
    storage.setItem(storageKeys.mastered, JSON.stringify([...state.mastered]));
    storage.setItem(storageKeys.bookmarks, JSON.stringify([...state.bookmarks]));
  };

  const shuffleArray = (array) => {
    const clone = [...array];
    for (let i = clone.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [clone[i], clone[j]] = [clone[j], clone[i]];
    }
    return clone;
  };

  const updateStats = () => {
    totalCount.textContent = state.deck.length;
    masteredCount.textContent = state.mastered.size;
    bookmarkedCount.textContent = state.bookmarks.size;
  };

  const getCardByIndex = (index) => state.deck[state.activeOrder[index]];

  const updateBookmarkButton = () => {
    const card = getCardByIndex(state.index);
    if (!card) return;
    const isBookmarked = state.bookmarks.has(card.word);
    bookmarkButton.textContent = isBookmarked ? 'Remove bookmark' : 'Bookmark word';
    bookmarkButton.setAttribute('aria-pressed', String(isBookmarked));
  };

  const updateMasteredButton = () => {
    const card = getCardByIndex(state.index);
    if (!card) return;
    const isMastered = state.mastered.has(card.word);
    markMasteredButton.textContent = isMastered ? 'Mastered ✔' : 'Mark as mastered';
    markMasteredButton.disabled = isMastered || !state.deck.length;
  };

  const updateCardFocus = () => {
    const card = getCardByIndex(state.index);
    if (!card) return;
    focusLabel.textContent = `Focus: ${card.word.length > 1 ? card.word.charAt(0).toUpperCase() : card.word}`;
  };

  const renderCard = () => {
    const card = getCardByIndex(state.index);
    if (!card) {
      front.textContent = 'All mastered!';
      back.innerHTML = '<p>Restore mastered cards to continue or reset stats to start over.</p>';
      progress.textContent = '0 cards available';
      focusLabel.textContent = 'Focus: complete';
      flashcard.classList.add('flashcard-complete');
      return;
    }

    flashcard.classList.remove('flashcard-complete');
    front.textContent = card.word;
    back.innerHTML = `
      <p><strong>Meaning:</strong> ${card.meaning}</p>
      <p class="flashcard-example">${card.example}</p>
    `;

    if (state.flipped) {
      flashcard.classList.add('is-flipped');
      back.hidden = false;
      if (!prefersReducedMotion) {
        sparkle?.classList.remove('sparkle-active');
        void sparkle?.offsetWidth;
        sparkle?.classList.add('sparkle-active');
      }
    } else {
      flashcard.classList.remove('is-flipped');
      back.hidden = true;
    }

    progress.textContent = `Card ${state.index + 1} of ${state.activeOrder.length}`;
    focusLabel.textContent = `Focus: ${card.word}`;
    updateBookmarkButton();
    updateMasteredButton();
  };

  const setIndex = (value, flipped = false) => {
    if (!state.activeOrder.length) {
      state.index = 0;
      state.flipped = false;
      renderCard();
      return;
    }
    const max = state.activeOrder.length;
    state.index = ((value % max) + max) % max;
    state.flipped = flipped ? state.flipped : false;
    renderCard();
  };

  const rebuildOrder = () => {
    state.activeOrder = state.deck
      .map((_, idx) => idx)
      .filter((idx) => !state.mastered.has(state.deck[idx].word));
    if (!state.activeOrder.length) {
      state.index = 0;
    } else if (state.index >= state.activeOrder.length) {
      state.index = 0;
    }
  };

  const next = () => {
    setIndex(state.index + 1);
  };

  const prev = () => {
    setIndex(state.index - 1);
  };

  const random = () => {
    if (!state.activeOrder.length) return;
    const nextIndex = Math.floor(Math.random() * state.activeOrder.length);
    state.index = nextIndex;
    state.flipped = false;
    renderCard();
  };

  const shuffle = () => {
    state.activeOrder = shuffleArray(state.activeOrder);
    state.index = 0;
    state.flipped = false;
    renderCard();
    setStatus('Deck shuffled');
  };

  const toggleFlip = () => {
    state.flipped = !state.flipped;
    renderCard();
    if (state.flipped) {
      window.PrepifyFX?.play('reveal');
    }
  };

  const markMastered = () => {
    const card = getCardByIndex(state.index);
    if (!card) return;
    if (state.mastered.has(card.word)) return;
    state.mastered.add(card.word);
    persist();
    rebuildOrder();
    updateStats();
    window.PrepifyFX?.play('success');
    setStatus(`${card.word} moved to mastered`);
    setIndex(state.index);
  };

  const restoreMastered = () => {
    if (!state.mastered.size) {
      setStatus('No mastered words to restore');
      return;
    }
    state.mastered.clear();
    persist();
    rebuildOrder();
    updateStats();
    state.index = 0;
    setStatus('Mastered words restored to the deck');
    renderCard();
  };

  const resetStats = () => {
    state.mastered.clear();
    state.bookmarks.clear();
    persist();
    rebuildOrder();
    updateStats();
    setStatus('Stats reset – the full deck is ready');
    renderCard();
  };

  const toggleBookmark = () => {
    const card = getCardByIndex(state.index);
    if (!card) return;
    if (state.bookmarks.has(card.word)) {
      state.bookmarks.delete(card.word);
      setStatus(`${card.word} removed from bookmarks`);
    } else {
      state.bookmarks.add(card.word);
      setStatus(`${card.word} bookmarked`);
      window.PrepifyFX?.play('bookmark');
    }
    persist();
    updateStats();
    updateBookmarkButton();
  };

  const exportBookmarks = () => {
    if (!state.bookmarks.size) {
      setStatus('Bookmark a few words before exporting');
      return;
    }
    const bookmarkedCards = state.deck.filter((card) => state.bookmarks.has(card.word));
    const blob = new Blob([JSON.stringify(bookmarkedCards, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = doc.createElement('a');
    anchor.href = url;
    anchor.download = `prepify-flashcards-bookmarks-${new Date().toISOString().slice(0, 10)}.json`;
    doc.body.appendChild(anchor);
    anchor.click();
    doc.body.removeChild(anchor);
    URL.revokeObjectURL(url);
    setStatus('Bookmarks exported');
  };

  const loadSampleList = async () => {
    try {
      const response = await fetch(resolvePath('data/sample_vocabulary.txt'));
      if (!response.ok) return [];
      const text = await response.text();
      return text
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => line.replace(/^\d+\.\s*/, ''))
        .map((line) => line.split('–').map((segment) => segment.trim()))
        .filter((parts) => parts.length >= 3)
        .map(([word, meaning, example]) => ({ word, meaning, example }));
    } catch (error) {
      return [];
    }
  };

  const uniqueByWord = (cards) => {
    const seen = new Set();
    const result = [];
    cards.forEach((card) => {
      const key = card.word.trim();
      if (!key || seen.has(key)) return;
      seen.add(key);
      result.push({
        word: key,
        meaning: card.meaning.trim(),
        example: card.example.trim(),
      });
    });
    return result;
  };

  const loadDeck = async () => {
    try {
      const [primary, sample] = await Promise.all([
        fetch(resolvePath('data/vocab/words500.json')).then((res) => res.json()),
        loadSampleList(),
      ]);
      const merged = uniqueByWord([...primary, ...sample]);
      state.deck = merged;
      state.activeOrder = state.deck.map((_, index) => index).filter((idx) => !state.mastered.has(state.deck[idx].word));
      if (!state.activeOrder.length) {
        state.activeOrder = state.deck.map((_, index) => index);
      }
      updateStats();
      renderCard();
    } catch (error) {
      front.textContent = 'Unable to load vocabulary.';
      back.textContent = 'Check that data/vocab/words500.json is available.';
      progress.textContent = '0 cards loaded';
      console.error('Flashcard data failed to load', error);
    }
  };

  const registerEvents = () => {
    flipButton?.addEventListener('click', toggleFlip);
    prevButton?.addEventListener('click', prev);
    nextButton?.addEventListener('click', next);
    randomButton?.addEventListener('click', random);
    shuffleButton?.addEventListener('click', shuffle);
    markMasteredButton?.addEventListener('click', markMastered);
    bookmarkButton?.addEventListener('click', toggleBookmark);
    resetButton?.addEventListener('click', resetStats);
    restoreButton?.addEventListener('click', restoreMastered);
    exportButton?.addEventListener('click', exportBookmarks);
    flashcard.addEventListener('click', (event) => {
      if (event.target === flipButton) return;
      toggleFlip();
    });
    flashcard.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggleFlip();
      }
    });
    doc.addEventListener('keydown', (event) => {
      if (event.target.closest('input, textarea, select, button, a')) return;
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        next();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        prev();
      } else if (event.key.toLowerCase() === 'f') {
        event.preventDefault();
        toggleFlip();
      }
    });
  };

  registerEvents();
  loadDeck();
  updateStats();
})();
