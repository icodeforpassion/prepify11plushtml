(() => {
  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const STORAGE_KEY = 'prepify11plus.schedule.builder.v1';

  const DEFAULT_ACTIVITIES = [
    { name: '11+ Maths', category: '11+ Core', duration: 35, icon: '➗' },
    { name: '11+ English', category: '11+ Core', duration: 30, icon: '📚' },
    { name: '11+ Verbal Reasoning', category: '11+ Core', duration: 30, icon: '🧠' },
    { name: '11+ Non-Verbal Reasoning', category: '11+ Core', duration: 30, icon: '🧩' },
    { name: 'Reading', category: 'Literacy', duration: 25, icon: '📖' },
    { name: 'Vocabulary', category: 'Literacy', duration: 20, icon: '📝' },
    { name: 'Spelling', category: 'Literacy', duration: 20, icon: '✍️' },
    { name: 'Creative Writing', category: 'Literacy', duration: 30, icon: '🪄' },
    { name: 'Times Tables', category: 'Maths Fluency', duration: 15, icon: '🔢' },
    { name: 'Mock Test Practice', category: '11+ Core', duration: 45, icon: '⏱️' },
    { name: 'Corrections / Review', category: 'Reflection', duration: 20, icon: '🔍' },
    { name: 'Sport', category: 'Wellbeing', duration: 40, icon: '⚽' },
    { name: 'Music', category: 'Wellbeing', duration: 25, icon: '🎵' },
    { name: 'Art', category: 'Wellbeing', duration: 25, icon: '🎨' },
    { name: 'Break', category: 'Wellbeing', duration: 10, icon: '🍎' },
    { name: 'Family Time', category: 'Wellbeing', duration: 30, icon: '🏡' },
    { name: 'Free Play', category: 'Wellbeing', duration: 30, icon: '🪁' }
  ];

  const defaultState = () => ({
    childName: '',
    weekStart: '',
    settings: { studyTarget: 60, breakFrequency: 30, sportTarget: 40, readingTarget: 25 },
    weeklyGoals: '✅ Finish core 11+ practice blocks\n✅ Keep reading streak alive\n✅ End each day with a win',
    encouragement: 'We are proud of your effort and focus this week. Keep shining! ⭐',
    customActivities: [],
    schedule: DAYS.reduce((acc, day) => ({ ...acc, [day]: [] }), {})
  });

  let state = loadState();

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw);
      const base = defaultState();
      return {
        ...base,
        ...parsed,
        settings: { ...base.settings, ...(parsed.settings || {}) },
        schedule: DAYS.reduce((acc, day) => {
          acc[day] = Array.isArray(parsed.schedule?.[day]) ? parsed.schedule[day] : [];
          return acc;
        }, {})
      };
    } catch (error) {
      return defaultState();
    }
  }

  function saveState(showMessage = false) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      if (showMessage) setHelperMessage('Saved! Your weekly plan is safely stored on this device. 💾');
    } catch (error) {
      setHelperMessage('We could not save right now. You can still print your plan.');
    }
    renderPrintPreview();
  }

  const getLibrary = () => [...DEFAULT_ACTIVITIES, ...state.customActivities];

  function setHelperMessage(message) {
    const node = document.getElementById('helperMessage');
    if (node) node.textContent = message;
  }

  function renderLibrary() {
    const container = document.getElementById('activityLibrary');
    container.innerHTML = '';
    getLibrary().forEach((activity) => {
      const card = document.createElement('article');
      card.className = 'activity-card';
      card.dataset.template = JSON.stringify(activity);
      card.innerHTML = `<div><span class="emoji">${activity.icon || '⭐'}</span><strong>${activity.name}</strong><small>${activity.category}</small></div><span>${activity.duration} mins</span>`;
      container.appendChild(card);
    });

    if (window.Sortable) {
      window.Sortable.create(container, {
        group: { name: 'planner', pull: 'clone', put: false },
        sort: false,
        animation: 150,
        draggable: '.activity-card'
      });
    }
  }

  function scoreDay(minutes) {
    const target = Number(state.settings.studyTarget);
    if (minutes < target * 0.6) return { label: 'Could add one short block', className: 'balance-low' };
    if (minutes > target * 1.35) return { label: 'This day looks a little packed', className: 'balance-high' };
    return { label: 'Nice balance!', className: 'balance-good' };
  }

  function renderPlanner() {
    const root = document.getElementById('weeklyPlanner');
    root.innerHTML = '';

    DAYS.forEach((day) => {
      const col = document.createElement('section');
      col.className = 'day-column';
      col.dataset.day = day;

      const total = state.schedule[day].reduce((sum, block) => sum + Number(block.duration || 0), 0);
      const score = scoreDay(total);

      col.innerHTML = `
        <header>
          <h3>${day}</h3>
          <p>${total} mins</p>
          <span class="${score.className}">${score.label}</span>
        </header>
        <div class="day-dropzone" id="day-${day}"></div>
      `;

      const list = col.querySelector('.day-dropzone');
      state.schedule[day].forEach((block) => list.appendChild(buildBlock(block, day)));
      root.appendChild(col);

      if (window.Sortable) {
        window.Sortable.create(list, {
          group: { name: 'planner', pull: true, put: true },
          animation: 150,
          draggable: '.schedule-block',
          onAdd: (event) => {
            if (event.item.classList.contains('activity-card')) {
              const template = JSON.parse(event.item.dataset.template || '{}');
              const newBlock = makeBlock(template);
              event.item.replaceWith(buildBlock(newBlock, day));
              state.schedule[day].splice(event.newIndex, 0, newBlock);
              setHelperMessage('Great choice! Drag more activities to build a happy, balanced week.');
              saveState();
              renderPlanner();
            } else {
              syncStateFromDom();
            }
          },
          onUpdate: syncStateFromDom,
          onRemove: syncStateFromDom
        });
      }
    });
  }

  function makeBlock(activity) {
    return {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: activity.name || 'Activity',
      category: activity.category || 'General',
      duration: Number(activity.duration) || 20,
      notes: activity.notes || '',
      priority: activity.priority || 'must do',
      icon: activity.icon || '⭐'
    };
  }

  function buildBlock(block, day) {
    const item = document.createElement('article');
    item.className = 'schedule-block';
    item.dataset.blockId = block.id;
    item.dataset.day = day;
    item.innerHTML = `
      <div class="schedule-block__top">
        <strong>${block.icon} ${block.name}</strong>
        <span>${block.category}</span>
      </div>
      <div class="schedule-block__controls">
        <label>Minutes <input type="number" min="5" max="240" value="${block.duration}"></label>
        <label>Priority
          <select>
            <option ${block.priority === 'must do' ? 'selected' : ''}>must do</option>
            <option ${block.priority === 'nice to do' ? 'selected' : ''}>nice to do</option>
            <option ${block.priority === 'fun' ? 'selected' : ''}>fun</option>
          </select>
        </label>
      </div>
      <div class="schedule-block__actions">
        <button type="button" data-action="duplicate">Duplicate</button>
        <button type="button" data-action="remove">Remove</button>
      </div>
    `;

    item.querySelector('input').addEventListener('change', (event) => {
      const value = Math.max(5, Math.min(240, Number(event.target.value) || block.duration));
      block.duration = value;
      event.target.value = String(value);
      saveState();
      renderPlanner();
    });

    item.querySelector('select').addEventListener('change', (event) => {
      block.priority = event.target.value;
      saveState();
      renderPlanner();
    });

    item.querySelector('[data-action="duplicate"]').addEventListener('click', () => {
      const copy = { ...block, id: `${Date.now()}-${Math.random().toString(16).slice(2)}` };
      state.schedule[day].push(copy);
      saveState();
      renderPlanner();
      setHelperMessage('Duplicated! Helpful for routines that repeat.');
    });

    item.querySelector('[data-action="remove"]').addEventListener('click', () => {
      state.schedule[day] = state.schedule[day].filter((entry) => entry.id !== block.id);
      saveState();
      renderPlanner();
    });

    return item;
  }

  function syncStateFromDom() {
    DAYS.forEach((day) => {
      const list = document.getElementById(`day-${day}`);
      if (!list) return;
      const ids = Array.from(list.querySelectorAll('.schedule-block')).map((node) => node.dataset.blockId);
      const lookup = new Map(state.schedule[day].map((block) => [block.id, block]));
      state.schedule[day] = ids.map((id) => lookup.get(id)).filter(Boolean);
    });
    saveState();
    renderPlanner();
  }

  function generateBalancedWeek() {
    const studyTarget = Number(state.settings.studyTarget);
    const readingTarget = Number(state.settings.readingTarget);
    const sportTarget = Number(state.settings.sportTarget);
    const breakFrequency = Number(state.settings.breakFrequency);

    const core = getLibrary().filter((activity) => activity.category === '11+ Core');
    const literacy = getLibrary().filter((activity) => ['Literacy', 'Reflection', 'Maths Fluency'].includes(activity.category));
    const positives = getLibrary().filter((activity) => activity.category === 'Wellbeing');

    const next = DAYS.reduce((acc, day) => ({ ...acc, [day]: [] }), {});

    DAYS.forEach((day, index) => {
      const dayPlan = [];
      const add = (activity, durationOverride) => {
        dayPlan.push(makeBlock({ ...activity, duration: durationOverride || activity.duration }));
      };

      add(core[index % core.length]);
      add(literacy[index % literacy.length]);
      add({ name: 'Reading', category: 'Literacy', duration: readingTarget, icon: '📖' }, readingTarget);
      add({ name: 'Sport', category: 'Wellbeing', duration: sportTarget, icon: '⚽' }, sportTarget);
      add({ name: 'Break', category: 'Wellbeing', duration: Math.max(10, Math.round(breakFrequency / 3)), icon: '🍎', priority: 'fun' });
      if (index >= 5) {
        add({ name: 'Family Time', category: 'Wellbeing', duration: 45, icon: '🏡', priority: 'fun' });
      }

      let total = dayPlan.reduce((sum, block) => sum + block.duration, 0);
      while (total > studyTarget * 1.2 && dayPlan.length > 4) {
        const removable = dayPlan.find((block) => block.category !== '11+ Core');
        if (!removable) break;
        removable.duration = Math.max(10, removable.duration - 10);
        total = dayPlan.reduce((sum, block) => sum + block.duration, 0);
      }

      next[day] = dayPlan;
    });

    state.schedule = next;
    setHelperMessage('Balanced week generated! You can still drag, swap, and personalise anything. 🎉');
    saveState();
    renderPlanner();
  }

  function renderPrintPreview() {
    const node = document.getElementById('printPreview');
    const weekLabel = state.weekStart ? new Date(state.weekStart).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '________________';

    node.innerHTML = `
      <article class="print-sheet" id="printSheet">
        <header class="print-header">
          <h3>🌟 My Prepify11Plus Weekly Success Planner 🌟</h3>
          <p>Small steps each day build big confidence.</p>
          <div class="print-meta">
            <p><strong>Child:</strong> ${escapeHtml(state.childName || '________________')}</p>
            <p><strong>Week commencing:</strong> ${weekLabel}</p>
          </div>
        </header>
        <section class="print-goals">
          <h4>Weekly goals</h4>
          <pre>${escapeHtml(state.weeklyGoals)}</pre>
        </section>
        <section class="print-calendar">
          ${DAYS.map((day) => `
            <div class="print-day">
              <h5>${day}</h5>
              ${(state.schedule[day] || []).map((block) => `<p><span>${block.icon}</span> ${escapeHtml(block.name)} - ${block.duration} mins</p>`).join('') || '<p class="empty">Add activities to this day ✨</p>'}
            </div>
          `).join('')}
        </section>
        <section class="print-reward">
          <h4>Reward / sticker area</h4>
          <div class="stickers">🏆 ⭐ 🎉 🚀 🥇 📘 ✨</div>
          <p><strong>Parent encouragement note:</strong> ${escapeHtml(state.encouragement)}</p>
        </section>
      </article>
    `;

    updateDailyFeedback();
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;');
  }

  function updateDailyFeedback() {
    const totals = DAYS.map((day) => state.schedule[day].reduce((sum, block) => sum + Number(block.duration || 0), 0));
    const max = Math.max(...totals);
    const min = Math.min(...totals);
    if (max - min <= 30) {
      setHelperMessage('Nice balance! Your week looks steady and encouraging. 🌈');
    } else if (max - min > 75) {
      setHelperMessage('One or two days look extra busy. Try moving one block for a calmer rhythm.');
    }
  }

  function initInputs() {
    const childName = document.getElementById('childName');
    const weekStart = document.getElementById('weekStart');
    childName.value = state.childName;
    weekStart.value = state.weekStart;

    childName.addEventListener('input', (event) => {
      state.childName = event.target.value.trimStart();
      saveState();
    });

    weekStart.addEventListener('change', (event) => {
      state.weekStart = event.target.value;
      saveState();
    });

    ['studyTarget', 'breakFrequency', 'sportTarget', 'readingTarget'].forEach((key) => {
      const input = document.getElementById(key);
      const output = document.querySelector(`[data-slider-value="${key}"]`);
      input.value = String(state.settings[key]);
      output.textContent = String(state.settings[key]);
      input.addEventListener('input', (event) => {
        const value = Number(event.target.value);
        state.settings[key] = value;
        output.textContent = String(value);
        saveState();
      });
    });

    document.getElementById('generateWeek').addEventListener('click', generateBalancedWeek);
    document.getElementById('saveSchedule').addEventListener('click', () => saveState(true));
    document.getElementById('resetSchedule').addEventListener('click', () => {
      state = defaultState();
      saveState();
      hydrate();
      setHelperMessage('Fresh start ready! Let’s build a joyful week together.');
    });
    document.getElementById('printSchedule').addEventListener('click', () => window.print());

    document.getElementById('customActivityForm').addEventListener('submit', (event) => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      const name = String(data.get('name') || '').trim();
      const category = String(data.get('category') || '').trim();
      const duration = Math.max(5, Math.min(180, Number(data.get('duration') || 20)));
      const notes = String(data.get('notes') || '').trim();
      const days = data.getAll('days');

      if (!name || !category) {
        setHelperMessage('Please add both an activity name and category.');
        return;
      }

      const custom = {
        name,
        category,
        duration,
        notes,
        icon: '✨'
      };
      state.customActivities.push(custom);
      if (days.length) {
        days.forEach((day) => {
          if (DAYS.includes(day)) state.schedule[day].push(makeBlock(custom));
        });
      }
      event.currentTarget.reset();
      saveState();
      renderLibrary();
      renderPlanner();
      setHelperMessage('Custom activity added! Great tailoring for your child.');
    });
  }

  function hydrate() {
    initInputs();
    renderLibrary();
    renderPlanner();
    renderPrintPreview();
  }

  document.addEventListener('DOMContentLoaded', hydrate);
})();
