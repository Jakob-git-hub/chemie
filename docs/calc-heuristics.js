// Heuristische Berechnungsfunktionen aus app.js ausgelagert
// Diese können als Referenz oder für zukünftige Verwendung behalten werden

const atomicMass = {
  H: 1.008, He: 4.0026, Li: 6.94, Be: 9.0122, B: 10.81, C: 12.011, N: 14.007, O: 15.999,
  F: 18.998, Ne: 20.180, Na: 22.990, Mg: 24.305, Al: 26.982, Si: 28.085, P: 30.974, S: 32.06,
  Cl: 35.45, Ar: 39.948, K: 39.098, Ca: 40.0. Fe: 55.845, Cu: 63.546, Zn: 65.38
};

function parseFormula(formula) {
  // Sehr einfache Formel-Parser: erkennt Elemente und Zahlen, keine verschachtelten Klammern
  const re = /([A-Z][a-z]?)(\d*)/g;
  let m; let mass = 0; let composition = [];
  while ((m = re.exec(formula)) !== null) {
    const elem = m[1];
    const count = m[2] ? parseInt(m[2], 10) : 1;
    const am = atomicMass[elem];
    composition.push({elem, count, am: am ?? null});
    mass += (am ?? 0) * count;
  }
  return {mass: Number(mass.toFixed(4)), composition};
}

function findNumberAndFormula(text) {
  // Zahl mit Einheit g und eine mögliche Formel im Text suchen
  const numRe = /([0-9]+(?:[\.,][0-9]+)?)\s*(g|gramm|g\.)/i;
  const formulaRe = /\b([A-Z][a-z]?[A-Za-z0-9]*)\b/g;
  const numMatch = text.match(numRe);
  let number = null;
  if (numMatch) number = parseFloat(numMatch[1].replace(',', '.'));

  // Kandidaten für Formeln: element-symbol sequences like H2O, NaCl, C6H12O6
  const candidates = [];
  let m;
  while ((m = formulaRe.exec(text)) !== null) {
    const s = m[1];
    if (/[A-Z]/.test(s) && /[a-z\d]/i.test(s)) candidates.push(s);
  }
  const formula = candidates.length ? candidates[0] : null;
  return {number, formula};
}

function generateSolution(text) {
  const lower = text.toLowerCase();
  const {number, formula} = findNumberAndFormula(text);
  let steps = [];
  let answer = 'Kann nicht automatisch gelöst werden - siehe Schritte.';

  if (formula) {
    const parsed = parseFormula(formula);
    steps.push(`1) Identifikation: Gefundene Formel: ${formula}`);
    steps.push(`   Zusammensetzung:`);
    parsed.composition.forEach(c => {
      steps.push(`     - ${c.elem}: Anzahl ${c.count}${c.am?`, Atommasse ${c.am} g·mol⁻¹`:` (unbekannte Atommasse)`}`);
    });
    if (parsed.mass > 0) {
      steps.push(`2) Molarität/Molare Masse: M(Molmasse) von ${formula} = ${parsed.mass} g·mol⁻¹`);
      if (number != null) {
        steps.push(`3) Gegebene Masse: ${number} g`);
        const moles = number / parsed.mass;
        steps.push(`4) Umrechnung: n = m / M = ${number} g / ${parsed.mass} g·mol⁻¹ = ${moles.toFixed(6)} mol`);
        answer = `${moles.toFixed(6)} mol`;
      } else {
        steps.push('3) Es sind keine Massenangaben gefunden. Wenn Masse gegeben ist, kann die Molzahl wie oben berechnet werden.');
        answer = `Molmasse: ${parsed.mass} g·mol⁻¹`;
      }
    } else {
      steps.push('2) Konnte die Molmasse nicht bestimmen (fehlende Atomdaten).');
    }
  } else if (lower.includes('ph') || lower.includes('ph-wert')) {
    steps.push('1) Problem deutet auf pH-Berechnung hin. Benötigt sind: Konzentration ([H+]) oder Säure/Base-Informationen.' );
    steps.push('2) Schritte: a) Bestimme [H+] oder [OH-], b) pH = -log10([H+]) oder pOH = -log10([OH-]) und pH = 14 - pOH.' );
    answer = 'pH-Aufgaben werden unterstützt, wenn Konzentrationswerte angegeben werden.';
  } else {
    // Allgemeiner, strukturierter Lösungsweg-Vorschlag
    steps.push('1) Problem lesen und wichtige Angaben markieren (Gegeben / Gesucht).');
    steps.push('2) Relevante Formeln auswählen (z. B. n = m/M, c = n/V, pH = -log[H+], stöchiometrische Verhältnisse).');
    steps.push('3) Einsetzen: Werte in die Formel einsetzen und Einheiten prüfen.');
    steps.push('4) Ergebnis berechnen und mit angemessener Genauigkeit angeben.');
    steps.push('5) Antwort prüfen (Einheiten, Größenordnung, Rechenfehler).');
    answer = 'Genereller Lösungsplan erstellt. Für konkrete Rechnungen bitte Angabe von Formeln oder Zahlen (z. B. „18 g H2O“) hinzufügen.';
  }

  return {steps: steps.join('\n'), answer};
}

function normalizeAiResponse(raw) {
  if (!raw) return null;
  const trimmed = raw.trim();
  try {
    const parsed = JSON.parse(trimmed);
    if (parsed && typeof parsed === 'object') return parsed;
  } catch (_) {
    // JSON war nicht direkt parsebar
  }

  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start >= 0 && end > start) {
    const maybeJson = trimmed.slice(start, end + 1);
    try {
      return JSON.parse(maybeJson);
    } catch (_) {
      return null;
    }
  }
  return null;
}

function renderAiResponse(aiObj, fallbackText) {
  if (!aiObj) {
    return fallbackText;
  }

  const steps = Array.isArray(aiObj.solution_steps)
    ? aiObj.solution_steps
    : (typeof aiObj.solution_steps === 'string' ? aiObj.solution_steps.split('\n').filter(Boolean) : []);
  const answer = typeof aiObj.final_answer === 'string'
    ? aiObj.final_answer
    : (typeof aiObj.answer === 'string' ? aiObj.answer : '');
  const assumptions = Array.isArray(aiObj.assumptions) ? aiObj.assumptions : [];
  const missing = Array.isArray(aiObj.missing_info) ? aiObj.missing_info : [];

  const lines = [];
  if (aiObj.problem_type) lines.push(`Aufgabentyp: ${aiObj.problem_type}`);
  if (assumptions.length) {
    lines.push('Annahmen:');
    assumptions.forEach(item => lines.push(`- ${item}`));
  }
  if (steps.length) {
    lines.push('Lösungsweg:');
    steps.forEach((step, idx) => lines.push(`${idx + 1}. ${step}`));
  } else if (typeof aiObj.explanation === 'string') {
    lines.push(aiObj.explanation);
  }
  if (missing.length) {
    lines.push('Fehlende Angaben:');
    missing.forEach(item => lines.push(`- ${item}`));
  }
  if (answer) {
    lines.push('');
    lines.push(`Antwort: ${answer}`);
  }
  return lines.length ? lines.join('\n') : fallbackText;
}

// Export für mögliche spätere Verwendung
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    atomicMass,
    parseFormula,
    findNumberAndFormula,
    generateSolution,
    normalizeAiResponse,
    renderAiResponse
  };
}