// Interaktives Chemie-Quiz – eigenständiges Modul
// Fragegeneratoren: Symbol→Name, Name→Symbol, molare Masse, pH-Skala.
// Zustandsverwaltung: Punktestand, Sperre nach Antwort, grün/rot Feedback, Endauswertung.

(function () {
  const ATOMIC = (window.StoffmengeCalculator && window.StoffmengeCalculator.ATOMIC_MASS) || {};
  const ELEMENTS = (window.ElementOverview && window.ElementOverview.PERIODIC) || [];

  // Einfache, gut erkennbare Formeln für die Massen-Fragen
  const SIMPLE_FORMULAS = ['H2O','CO2','NaCl','H2SO4','CaCO3','NH3','CH4','O2','HCl','NaOH','H2O2','Fe2O3','C2H5OH','MgO'];

  const rnd = arr => arr[Math.floor(Math.random() * arr.length)];
  function shuffle(a) {
    a = a.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function massOf(formula) {
    const r = window.StoffmengeCalculator.parseFormula(formula);
    return r.error ? null : r.mass;
  }

  // ---- Fragegeneratoren ----
  function genSymbolToName() {
    const pool = ELEMENTS.filter(e => e.n <= 36);
    const correct = rnd(pool);
    const others = shuffle(pool.filter(e => e.sym !== correct.sym)).slice(0, 3);
    const choices = shuffle([correct, ...others]);
    return {
      q: `Welches Element hat das Symbol <b>${correct.sym}</b>?`,
      choices: choices.map(c => ({ text: c.name, correct: c.sym === correct.sym }))
    };
  }

  function genNameToSymbol() {
    const pool = ELEMENTS.filter(e => e.n <= 36);
    const correct = rnd(pool);
    const others = shuffle(pool.filter(e => e.sym !== correct.sym)).slice(0, 3);
    const choices = shuffle([correct, ...others]);
    return {
      q: `Wie lautet das Elementsymbol für <b>${correct.name}</b>?`,
      choices: choices.map(c => ({ text: c.sym, correct: c.sym === correct.sym }))
    };
  }

  function genMolarMass() {
    const formula = rnd(SIMPLE_FORMULAS);
    const m = massOf(formula);
    if (m == null) return null;
    const rounded = Math.round(m * 10) / 10;
    const set = new Set([rounded]);
    let guard = 0;
    while (set.size < 4 && guard < 60) {
      const d = Math.round((rounded + (Math.random() * 8 - 4)) * 10) / 10;
      if (d > 0) set.add(Math.round(d * 10) / 10);
      guard++;
    }
    const choices = shuffle(Array.from(set).map(v => ({
      text: v + ' g·mol⁻¹',
      correct: Math.abs(v - rounded) < 1e-9
    })));
    return {
      q: `Wie groß ist die molare Masse von <b>${formula}</b> (gerundet)?`,
      choices
    };
  }

  function genPH() {
    if (Math.random() < 0.5) {
      const ph = rnd([1, 3, 7, 9, 11, 13]);
      const cls = ph < 7 ? 'sauer' : ph > 7 ? 'basisch' : 'neutral';
      const choices = shuffle([
        { text: 'sauer', correct: cls === 'sauer' },
        { text: 'neutral', correct: cls === 'neutral' },
        { text: 'basisch', correct: cls === 'basisch' }
      ]);
      return {
        q: `Eine Lösung mit pH = <b>${ph}</b> ist …`,
        choices
      };
    }
    const choices = shuffle([
      { text: 'pH = 2 ist saurer als pH = 6', correct: true },
      { text: 'pH = 6 ist saurer als pH = 2', correct: false },
      { text: 'Beide sind gleich sauer', correct: false }
    ]);
    return {
      q: `Welche Aussage zur Säurestärke trifft zu?`,
      choices
    };
  }

  const GENERATORS = [genSymbolToName, genNameToSymbol, genMolarMass, genPH];

  const state = { questions: [], idx: 0, score: 0, locked: false };

  const el = id => document.getElementById(id);

  function buildQuiz(n) {
    state.questions = [];
    for (let i = 0; i < n; i++) {
      let q = null, tries = 0;
      while (!q && tries < 6) { q = rnd(GENERATORS)(); tries++; }
      if (q) state.questions.push(q);
    }
    state.idx = 0; state.score = 0; state.locked = false;
  }

  function renderStart() {
    const wrap = el('quiz-container');
    if (!wrap) return;
    wrap.innerHTML = `
      <p class="quiz-intro">Teste dein Chemie-Wissen! 5 zufällige Fragen zu Symbolen, Namen, molaren Massen und dem pH-Wert.</p>
      <button class="quiz-btn primary" id="quiz-start">Quiz starten</button>
    `;
    el('quiz-start').onclick = () => { buildQuiz(5); renderQuestion(); };
  }

  function renderQuestion() {
    const wrap = el('quiz-container');
    if (!wrap) return;
    const q = state.questions[state.idx];
    if (!q) { renderSummary(); return; }
    wrap.innerHTML = `
      <div class="quiz-progress">Frage ${state.idx + 1} / ${state.questions.length} &nbsp;·&nbsp; Punkte: ${state.score}</div>
      <div class="quiz-question">${q.q}</div>
      <div class="quiz-choices"></div>
      <div class="quiz-feedback" id="quiz-feedback"></div>
    `;
    const cWrap = wrap.querySelector('.quiz-choices');
    q.choices.forEach((c, i) => {
      const b = document.createElement('button');
      b.className = 'quiz-choice';
      b.innerHTML = c.text;
      b.onclick = () => selectChoice(i);
      cWrap.appendChild(b);
    });
    state.locked = false;
  }

  function selectChoice(i) {
    if (state.locked) return;
    state.locked = true;
    const q = state.questions[state.idx];
    const buttons = document.querySelectorAll('#quiz-container .quiz-choice');
    const correctIdx = q.choices.findIndex(c => c.correct);
    buttons.forEach((b, idx) => {
      b.disabled = true;
      if (idx === correctIdx) b.classList.add('correct');
      else if (idx === i) b.classList.add('wrong');
    });
    const fb = el('quiz-feedback');
    if (q.choices[i].correct) {
      state.score++;
      fb.textContent = '✓ Richtig!';
      fb.className = 'quiz-feedback correct';
    } else {
      fb.textContent = '✗ Falsch. Richtig: ' + q.choices[correctIdx].text;
      fb.className = 'quiz-feedback wrong';
    }
    const next = document.createElement('button');
    next.className = 'quiz-btn primary';
    next.textContent = (state.idx + 1 < state.questions.length) ? 'Weiter →' : 'Ergebnis ansehen';
    next.onclick = () => {
      state.idx++;
      if (state.idx < state.questions.length) renderQuestion();
      else renderSummary();
    };
    fb.appendChild(next);
  }

  function renderSummary() {
    const wrap = el('quiz-container');
    if (!wrap) return;
    const total = state.questions.length;
    const pct = total ? Math.round(state.score / total * 100) : 0;
    const msg = pct === 100 ? 'Perfekt! 🏆' : pct >= 60 ? 'Gut gemacht! 🎉' : 'Weiter üben! 💡';
    wrap.innerHTML = `
      <div class="quiz-summary">
        <h3>Ergebnis</h3>
        <div class="quiz-score">${state.score} / ${total} richtig (${pct}%)</div>
        <p>${msg}</p>
        <button class="quiz-btn primary" id="quiz-restart">Nochmal spielen</button>
      </div>
    `;
    el('quiz-restart').onclick = renderStart;
  }

  window.Quiz = { init: renderStart };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', renderStart);
  else renderStart();
})();
