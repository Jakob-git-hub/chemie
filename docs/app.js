// Haupt-Applikationsmodul - verbindet alle Komponenten

// AI Solver State
let useAICheck = null;
let apiKeyInput = null;
let modelSelect = null;

function initializeEventListeners() {
    useAICheck = document.getElementById('use-ai');
    apiKeyInput = document.getElementById('api-key');
    modelSelect = document.getElementById('model');
}

function solveWithAI(problemText) {
    const problem = typeof problemText === 'string' ? problemText : document.getElementById('ai-problem').value.trim();
    const answerEl = document.getElementById('ai-answer');

    if (!problem) {
        answerEl.textContent = 'Bitte eine Aufgabe eingeben.';
        return;
    }

    const key = apiKeyInput ? apiKeyInput.value.trim() : '';
    const model = modelSelect ? modelSelect.value || 'gpt-4o' : 'gpt-4o';

    if (!key) {
        answerEl.textContent = 'Bitte API-Key eingeben. (Falls kein Key vorhanden: Nutze die lokale Heuristik.)';
        return;
    }

    answerEl.textContent = 'Frage KI an... (kann einige Sekunden dauern)';

    window.AISolver.solve(problem, key, model)
        .then(response => {
            if (response) {
                const rendered = renderAiResponse(response);
                answerEl.textContent = rendered;
            } else {
                answerEl.textContent = 'KI-Antwort konnte nicht interpretiert werden.';
            }
        })
        .catch(err => {
            answerEl.textContent = `Fehler bei KI-Anfrage: ${err.message}. Lokale Heuristik nicht verfügbar.`;
        });
}

function solveStoffmengeWithAI() {
    const mass = document.getElementById('stoffmenge-mass').value;
    const molarMass = document.getElementById('stoffmenge-molar-mass').value;

    if (!mass || !molarMass) {
        document.getElementById('stoffmenge-result').textContent = 'Bitte Masse und Molare Masse eingeben.';
        return;
    }

    const prompt = `Wie viele Mol sind in ${mass} g eines Stoffes mit einer Molaren Masse von ${molarMass} g·mol⁻¹?
    Bitte Schritt für Schritt rechnen und die Einheiten prüfen.`;

    solveWithAI(prompt);
}

// Render KI-Antwort
function renderAiResponse(aiObj) {
    if (!aiObj) {
        return 'Keine gültige Antwort erhalten.';
    }

    const steps = Array.isArray(aiObj.solution_steps)
        ? aiObj.solution_steps.map((s, i) => `${i + 1}. ${s}`).join('\n')
        : (typeof aiObj.solution_steps === 'string' ? aiObj.solution_steps : '');

    const answer = typeof aiObj.final_answer === 'string'
        ? aiObj.final_answer
        : (typeof aiObj.answer === 'string' ? aiObj.answer : '');

    const assumptions = Array.isArray(aiObj.assumptions) ? aiObj.assumptions : [];
    const missing = Array.isArray(aiObj.missing_info) ? aiObj.missing_info : [];

    let output = '';
    if (aiObj.problem_type) output += `${aiObj.problem_type}\n\n`;
    if (assumptions.length) {
        output += 'Annahmen:\n' + assumptions.map(a => `- ${a}`).join('\n') + '\n\n';
    }
    if (steps) {
        output += 'Lösungsweg:\n' + steps + '\n\n';
    }
    if (missing.length) {
        output += 'Fehlende Angaben:\n' + missing.map(m => `- ${m}`).join('\n') + '\n\n';
    }
    if (answer) {
        output += `Antwort: ${answer}`;
    }

    return output || 'Keine formatierbare Antwort erhalten.';
}

// Export für andere Module
window.App = {
    solveWithAI,
    solveStoffmengeWithAI,
    initialize: initializeEventListeners
};

// Initialisierung
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    // Nach jedem Laden der Seite die Event-Listeners auf die KI-Buttons setzen
    const aiSolveBtn = document.getElementById('ai-solve-btn');
    if (aiSolveBtn) {
        aiSolveBtn.onclick = () => solveWithAI();
    }
});