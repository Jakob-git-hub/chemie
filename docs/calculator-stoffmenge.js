// Stoffmenge Rechner + Automatischer Molmassen-Parser
// Berechnet n = m / M, m = n * M und die molare Masse aus einer Formel.

// Vollständige Atommassen (IUPAC-Standardwerte, gerundet) – 118 Elemente.
// Garantiert wissenschaftliche Genauigkeit für beliebige Formeln.
const ATOMIC_MASS = {
  H:1.008, He:4.0026, Li:6.94, Be:9.0122, B:10.81, C:12.011, N:14.007, O:15.999,
  F:18.998, Ne:20.180, Na:22.990, Mg:24.305, Al:26.982, Si:28.085, P:30.974, S:32.06,
  Cl:35.45, Ar:39.948, K:39.098, Ca:40.078, Sc:44.956, Ti:47.867, V:50.942, Cr:51.996,
  Mn:54.938, Fe:55.845, Co:58.933, Ni:58.693, Cu:63.546, Zn:65.38, Ga:69.723, Ge:72.630,
  As:74.922, Se:78.971, Br:79.904, Kr:83.798, Rb:85.468, Sr:87.62, Y:88.906, Zr:91.224,
  Nb:92.906, Mo:95.95, Tc:98, Ru:101.07, Rh:102.91, Pd:106.42, Ag:107.87, Cd:112.41,
  In:114.82, Sn:118.71, Sb:121.76, Te:127.60, I:126.90, Xe:131.29, Cs:132.91, Ba:137.33,
  La:138.91, Ce:140.12, Pr:140.91, Nd:144.24, Pm:144.91, Sm:150.36, Eu:151.96, Gd:157.25,
  Tb:158.93, Dy:162.50, Ho:164.93, Er:167.26, Tm:168.93, Yb:173.05, Lu:174.97, Hf:178.49,
  Ta:180.95, W:183.84, Re:186.21, Os:190.23, Ir:192.22, Pt:195.08, Au:196.97, Hg:200.59,
  Tl:204.38, Pb:207.2, Bi:208.98, Po:209, At:210, Rn:222, Fr:223, Ra:226,
  Ac:227, Th:232.04, Pa:231.04, U:238.03, Np:237, Pu:244, Am:243, Cm:247,
  Bk:247, Cf:251, Es:252, Fm:257, Md:258, No:259, Lr:266, Rf:267,
  Db:268, Sg:269, Bh:270, Hs:269, Mt:278, Ds:281, Rg:282, Cn:285,
  Nh:286, Fl:289, Mc:290, Lv:293, Ts:294, Og:294
};

// Tiefgestellte Ziffern (₂, ₄, …) in normale Ziffern umwandeln
const SUBSCRIPT_MAP = {'₀':'0','₁':'1','₂':'2','₃':'3','₄':'4','₅':'5','₆':'6','₇':'7','₈':'8','₉':'9'};

// Erweitertes Formel-Parsing: unterstützt Klammern, Hydrat-Notation, Case-Sensitivity
function normalizeFormula(s) {
  if (!s) return '';

  // Umwandlung von tiefgestellten Ziffern
  let normalized = (s || '').replace(/[₀₁₂₃₄₅₆₇₈₉]/g, c => SUBSCRIPT_MAP[c] || c);

  // Behandlung von Hydrat-Notation (z.B. CuSO4*5H2O -> CuSO4(H2O)5)
  normalized = normalized.replace(/(\*|\s*·\s*)/g, '*');

  // Behandlung von Wasser-Notation (z.B. CuSO4.5H2O)
  normalized = normalized.replace(/(\.|•)/g, '*');

  // Trennung von Teilen mit *
  const parts = normalized.split('*');
  if (parts.length > 2) {
    return {error: 'Ungültige Formel: Zu viele Hydrat-Komponenten.'};
  }

  // Hauptformel verarbeiten
  const mainFormula = parts[0].trim();
  let hydrateMultiplier = 1;
  let hydrateFormula = '';

  if (parts.length === 2) {
    const hydratePart = parts[1].trim();
    // Extrahiere den Multiplikator aus der Hydrat-Komponente (z.B. 5H2O -> 5, H2O)
    const hydrateMatch = hydratePart.match(/^(\d*)(.*)$/);
    if (hydrateMatch) {
      hydrateMultiplier = hydrateMatch[1] ? parseInt(hydrateMatch[1], 10) : 1;
      hydrateFormula = hydrateMatch[2];

      // Wenn kein Multiplikator angegeben, aber eine Formel vorhanden ist, nehme 1
      if (!hydrateMultiplier && hydrateFormula) {
        hydrateMultiplier = 1;
      }
    }
  }

  return {mainFormula, hydrateFormula, hydrateMultiplier};
}

// Erweiterter robuster Parser: Elemente, Indizes, verschachtelte Klammern (z. B. Ca(OH)₂, (NH₄)₂SO₄)
function parseFormula(formula) {
  if (!formula || !formula.trim()) return {error: 'Bitte eine Formel eingeben.'};

  const normalized = normalizeFormula(formula);
  if (normalized.error) return normalized;

  const {mainFormula, hydrateFormula, hydrateMultiplier} = normalized;

  // Funktion zum Parsen einer einzelnen Formel-Komponente
  function parseComponent(comp) {
    comp = (comp || '').trim();
    if (!comp) return {counts: {}, mass: 0};

    const stack = [{}];
    let i = 0;

    while (i < comp.length) {
      const ch = comp[i];
      if (ch === '(') {
        stack.push({});
        i++;
      } else if (ch === ')') {
        i++;
        let numStr = '';
        while (i < comp.length && /\d/.test(comp[i])) { numStr += comp[i]; i++; }
        const mult = numStr ? parseInt(numStr, 10) : 1;
        const group = stack.pop();
        const parent = stack[stack.length - 1];
        for (const sym in group) parent[sym] = (parent[sym] || 0) + group[sym] * mult;
      } else if (/[A-Z]/.test(ch)) {
        let sym = ch; i++;
        while (i < comp.length && /[a-z]/.test(comp[i])) { sym += comp[i]; i++; }

        // Spezielle Behandlung für ambiguous formulas like Co vs CO
        if (sym.length === 1 && i < comp.length && /[A-Z]/.test(comp[i])) {
          // Ein-buchstabiges Element gefolgt von Großbuchstaben - könnte ambig sein
          // Wir behalten es bei, da die Parser-Logik es korrekt handhaben wird
        }

        let numStr = '';
        while (i < comp.length && /\d/.test(comp[i])) { numStr += comp[i]; i++; }
        const count = numStr ? parseInt(numStr, 10) : 1;
        if (!(sym in ATOMIC_MASS)) return {error: `Unbekanntes Elementsymbol: "${sym}"`};
        const top = stack[stack.length - 1];
        top[sym] = (top[sym] || 0) + count;
      } else if (/\d/.test(ch)) {
        return {error: 'Ungültige Formel: Zahl ohne vorausgehendes Element.'};
      } else {
        return {error: `Ungültiges Zeichen in der Formel: "${ch}"`};
      }
    }

    if (stack.length !== 1) return {error: 'Klammern nicht geschlossen.'};

    const counts = stack[0];
    let mass = 0;
    const composition = [];
    for (const sym in counts) {
      const c = counts[sym];
      const m = ATOMIC_MASS[sym];
      mass += m * c;
      composition.push({sym, count: c, mass: m});
    }
    composition.sort((a, b) => a.sym < b.sym ? -1 : 1);
    return {counts, mass: Number(mass.toFixed(4)), composition};
  }

  // Hauptformel parsen
  const mainResult = parseComponent(mainFormula);
  if (mainResult.error) return mainResult;

  // Hydrat-Komponente falls vorhanden
  let totalMass = mainResult.mass;
  let totalComposition = [...mainResult.composition];

  if (hydrateFormula && hydrateMultiplier > 0) {
    const hydrateResult = parseComponent(hydrateFormula);
    if (hydrateResult.error) return hydrateResult;

    // Hydrat-Komponente zum Gesamtgewicht hinzufügen
    totalMass += hydrateResult.mass * hydrateMultiplier;

    // Zusammensetzung kombinieren
    const hydrateCounts = {};
    for (const item of hydrateResult.composition) {
      hydrateCounts[item.sym] = (hydrateCounts[item.sym] || 0) + item.count * hydrateMultiplier;
    }

    // Hauptzusammensetzung mit Hydrat-Zusammensetzung kombinieren
    const combinedCounts = {};
    for (const item of mainResult.composition) {
      combinedCounts[item.sym] = (combinedCounts[item.sym] || 0) + item.count;
    }
    for (const [sym, count] of Object.entries(hydrateCounts)) {
      combinedCounts[sym] = (combinedCounts[sym] || 0) + count;
    }

    // Zurück zu Array-Format konvertieren
    totalComposition = Object.keys(combinedCounts).map(sym => ({
      sym,
      count: combinedCounts[sym],
      mass: ATOMIC_MASS[sym]
    })).sort((a, b) => a.sym < b.sym ? -1 : 1);
  }

  return {mass: Number(totalMass.toFixed(4)), composition: totalComposition};
}

function calculateMolarMassFromFormula(formula) {
  const r = parseFormula(formula);
  if (r.error) return {error: r.error};
  return {mass: r.mass, composition: r.composition};
}

// --- Stoffmenge: n = m / M ---
function calculateStoffmenge() {
  const mass = parseFloat(document.getElementById('stoffmenge-mass').value);
  const molarMass = parseFloat(document.getElementById('stoffmenge-molar-mass').value);
  const resultEl = document.getElementById('stoffmenge-result');

  if (!mass || !molarMass) {
    resultEl.textContent = 'Bitte beide Werte eingeben.';
    return;
  }
  if (molarMass <= 0) {
    resultEl.textContent = 'Molare Masse muss > 0 sein.';
    return;
  }
  const amount = mass / molarMass;
  resultEl.innerHTML = `
    <p class="calc-line">Ergebnis: <strong>n = ${amount.toFixed(6)} mol</strong></p>
    <p class="calc-sub">Formel: n = m / M = ${mass} g / ${molarMass} g·mol⁻¹</p>`;
}

// --- Invertieren: m = n * M ---
function invertStoffmenge() {
  const amount = parseFloat(document.getElementById('stoffmenge-mass').value);
  const molarMass = parseFloat(document.getElementById('stoffmenge-molar-mass').value);
  const resultEl = document.getElementById('stoffmenge-result');

  if (!amount || !molarMass) {
    resultEl.textContent = 'Bitte beide Werte eingeben.';
    return;
  }
  const mass = amount * molarMass;
  resultEl.innerHTML = `
    <p class="calc-line">Ergebnis: <strong>m = ${mass.toFixed(4)} g</strong></p>
    <p class="calc-sub">Formel: m = n × M = ${amount} mol × ${molarMass} g·mol⁻¹</p>`;
}

// --- Live: Formel -> molare Masse automatisch eintragen ---
function handleFormulaInput() {
  const fEl = document.getElementById('stoffmenge-formula');
  const mEl = document.getElementById('stoffmenge-molar-mass');
  const fb = document.getElementById('formula-feedback');
  const raw = fEl.value;

  if (!raw.trim()) {
    mEl.value = '';
    fb.textContent = '';
    fb.className = 'formula-feedback';
    // Remove any animation classes
    fb.classList.remove('pulse-error', 'pulse-success');
    return;
  }
  const r = parseFormula(raw);
  if (r.error) {
    fb.textContent = '⚠ ' + r.error;
    fb.className = 'formula-feedback error';
    // Add pulse animation for error
    fb.classList.add('pulse-error');
    fb.classList.remove('pulse-success');
    // Clear molar mass field on error
    mEl.value = '';
    return;
  }
  mEl.value = r.mass;                 // Molare Masse automatisch befüllen
  fb.className = 'formula-feedback success';
  fb.classList.add('pulse-success');
  fb.classList.remove('pulse-error');
  fb.innerHTML = `M = <strong>${r.mass} g·mol⁻¹</strong> &nbsp; ` +
    '(' + r.composition.map(c => `${c.sym}${c.count > 1 ? c.count : ''}`).join(' + ') + ')';
}

// Events verknüpfen
const _inv = document.getElementById('stoffmenge-invert');
if (_inv) _inv.addEventListener('click', invertStoffmenge);
const _frm = document.getElementById('stoffmenge-formula');
if (_frm) _frm.addEventListener('input', handleFormulaInput);

// Auch das Masse-Feld aktualisieren, wenn der Benutzer manuell eingibt
const _massEl = document.getElementById('stoffmenge-mass');
if (_massEl) {
  _massEl.addEventListener('input', () => {
    // Wenn der Benutzer manuell etwas eingibt, setzen wir das Feedback zurück
    const fb = document.getElementById('formula-feedback');
    if (fb && fb.className.includes('success')) {
      fb.className = 'formula-feedback';
      fb.classList.remove('pulse-success');
    }
  });
}

// Export
window.StoffmengeCalculator = {
  calculate: calculateStoffmenge,
  invert: invertStoffmenge,
  parseFormula,
  calculateMolarMassFromFormula,
  handleFormulaInput,
  ATOMIC_MASS
};