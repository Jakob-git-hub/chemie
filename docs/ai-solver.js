// AI Solver Modul - Kapselt die OpenAI API-Anfrage
// Wird von allen anderen Modulen verwendet können

async function callOpenAI(problemText, apiKey, model = 'gpt-4o') {
  const systemPrompt = [
    'Du bist ein sehr starker Chemie-Tutor für Schule und Studium.',
    'Löse chemische Aufgaben auf Deutsch, präzise und Schritt für Schritt.',
    'Deine Aufgabe ist es, IMMER die bestmögliche vollständige Lösung zu liefern.',
    'Decke u. a. Stöchiometrie, Reaktionsgleichungen, pH/pOH, Konzentrationen, Molarität, Gasgesetze, Gleichgewichte, Redox, Thermochemie, Bindungen, Strukturformeln, Benennung und Einheitenumrechnung ab.',
    'Wenn Angaben fehlen, nenne exakt, was fehlt, und löse den Teil, der bereits möglich ist.',
    'Antworte ausschließlich als JSON mit den Schlüsseln: problem_type, solution_steps, final_answer, assumptions, missing_info.',
    'solution_steps muss ein Array mit kurzen, nummerierten Schritten sein.',
    'assumptions und missing_info müssen Arrays mit Strings sein.'
  ].join(' ');

  const userPrompt = `Aufgabe:\n${problemText}\n\nGib die bestmögliche vollständige chemische Lösung. Wenn es mehrere mögliche Interpretationen gibt, wähle die wahrscheinliche und erkläre deine Annahmen.`;

  const body = {
    model: model,
    messages: [
      {role: 'system', content: systemPrompt},
      {role: 'user', content: userPrompt}
    ],
    temperature: 0.2,
    max_tokens: 1600
  };

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    let errText = await res.text();
    // Versuche, JSON-Fehler zu extrahieren
    try {
      const errJson = JSON.parse(errText);
      errText = errJson.error?.message || errText;
    } catch (_) {}
    throw new Error(`OpenAI API Error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  return normalizeAiResponse(content);
}

// Export
window.AISolver = {
  solve: callOpenAI,
  normalizeAiResponse: function(raw) {
    if (!raw) return null;
    const trimmed = raw.trim();
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed && typeof parsed === 'object') return parsed;
    } catch (_) {}

    const start = trimmed.indexOf('{');
    const end = trimmed.lastIndexOf('}');
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(trimmed.slice(start, end + 1));
      } catch (_) {}
    }
    return null;
  }
};