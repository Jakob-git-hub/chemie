// Rules Library - Chemische Regeln, Formeln und Gesetzmäßigkeiten

const CHEMICAL_RULES = [
    {
        id: 'stoichiometry',
        title: 'Stöchiometrie Grundlagen',
        description: 'Berechnung von Stoffmengen in chemischen Reaktionen',
        formulas: [
            {name: 'Stoffmenge aus Masse', formula: 'n = m / M', variables: 'n [mol], m [g], M [g·mol⁻¹]'},
            {name: 'Molare Masse', formula: 'M = m / n', variables: 'M [g·mol⁻¹], m [g], n [mol]'},
            {name: 'Masse aus Stoffmenge', formula: 'm = n × M', variables: 'm [g], n [mol], M [g·mol⁻¹]'},
            {name: 'Reaktionsgleichung', formula: 'aA + bB → cC + dD', variables: 'a,b,c,d = Stöchiometrische Koeffizienten'}
        ],
        rules: [
            'Koeffizienten in Reaktionsgleichungen geben das molare Verhältnis an',
            'Ausgangsstoff, der zuerst verbraucht ist, ist der limitierende Reaktionspartner',
            'Theoretischer Ertrag basiert auf dem limitierenden Reaktionspartner'
        ]
    },
    {
        id: 'concentration',
        title: 'Konzentrationen & Lösungen',
        description: 'Berechnung von Konzentrationen in Lösungen',
        formulas: [
            {name: 'Stoffmengenkonzentration', formula: 'c = n / V', variables: 'c [mol·L⁻¹], n [mol], V [L]'},
            {name: 'Massengehalt', formula: 'β = m / V', variables: 'β [g·L⁻¹], m [g], V [L]'},
            {name: 'Molchenbruch', formula: 'xᵢ = nᵢ / Σnⱼ', variables: 'Dimensionslos, Σxᵢ = 1'},
            {name: 'Verdünnung', formula: 'c₁V₁ = c₂V₂', variables: 'Ausgangs- und Endkonzentration/Volumen'}
        ],
        rules: [
            'Bei Verdünnung bleibt die Stoffmenge konstant (n₁ = n₂)',
            'Normallösungen: 1 N = 1 Äq/L (für Säure-Base: Äq = mol × n(H⁺/OH⁻))',
            'Aktivität ≠ Konzentration bei hohen Konzentrationen (Debye-Hückel)'
        ]
    },
    {
        id: 'ph',
        title: 'pH / pOH / Säure-Base',
        description: 'Berechnungen rund um Säuren, Basen und pH-Wert',
        formulas: [
            {name: 'pH-Wert', formula: 'pH = -log₁₀[H⁺]', variables: '[H⁺] in mol·L⁻¹'},
            {name: 'pOH-Wert', formula: 'pOH = -log₁₀[OH⁻]', variables: '[OH⁻] in mol·L⁻¹'},
            {name: 'pH + pOH', formula: 'pH + pOH = 14 (bei 25°C)', variables: 'K_w = 10⁻¹⁴'},
            {name: 'Säurekonstante', formula: 'Kₐ = [H⁺][A⁻] / [HA]', variables: 'Gleichgewichtskonstante'},
            {name: 'Basenkonstante', formula: 'K_b = [BH⁺][OH⁻] / [B]', variables: 'Gleichgewichtskonstante'},
            {name: 'pKₐ / pK_b', formula: 'pK = -log₁₀K', variables: 'pKₐ + pK_b = 14'}
        ],
        rules: [
            'Starke Säuren/Basen: vollständige Dissoziation, [H⁺] = c(Säure)',
            'Schwache Säuren: Gleichgewicht, Henderson-Hasselbalch: pH = pKₐ + log([A⁻]/[HA])',
            'Puffer: pH ≈ pKₐ bei [Säure] ≈ [Base]',
            'Neutraler Punkt: pH = 7 (bei 25°C, reines Wasser)'
        ]
    },
    {
        id: 'gas-laws',
        title: 'Gasgesetze',
        description: 'Verhalten idealer Gase',
        formulas: [
            {name: 'Ideales Gasgesetz', formula: 'pV = nRT', variables: 'p [bar], V [L], n [mol], R=0.08314 L·bar/(mol·K), T [K]'},
            {name: 'Boylesches Gesetz', formula: 'p₁V₁ = p₂V₂ (T, n const.)', variables: 'Druck-Volumen-Umgekehrt proportional'},
            {name: 'Gay-Lussac', formula: 'V₁/T₁ = V₂/T₂ (p, n const.)', variables: 'Volumen proportional zur absoluten Temperatur'},
            {name: 'Daltonsches Partialdruckgesetz', formula: 'p_ges = Σpᵢ', variables: 'Summe der Partialdrücke'}
        ],
        rules: [
            'STP: 0°C (273.15 K), 1 bar → 1 mol = 22.7 L',
            'Normbedingungen (alt): 0°C, 1 atm → 22.4 L/mol',
            'Reale Gase weichen ab (van der Waals: (p + a/V²)(V - b) = RT)'
        ]
    },
    {
        id: 'redox',
        title: 'Redoxreaktionen',
        description: 'Oxidation, Reduktion und Elektronenbilanz',
        formulas: [
            {name: 'Oxidationszahlen', formula: 'Summe = 0 (Element) / Ladung (Ion)', variables: 'Regeln: O=-2, H=+1, F=-1, ...'},
            {name: 'Halbreaktionen', formula: 'Ox: A → Aⁿ⁺ + ne⁻ / Red: B + me⁻ → Bᵐ⁻', variables: 'Elektronen bilanzieren'},
            {name: 'Nernst-Gleichung', formula: 'E = E⁰ - (RT/nF) ln Q', variables: 'E⁰ = Standardpotential, Q = Reaktionsquotient'}
        ],
        rules: [
            'Oxidation = Elektronenabgabe (OZ steigt), Reduktion = Elektronenaufnahme (OZ sinkt)',
            'Oxidationsmittel wird reduziert, Reduktionsmittel wird oxidiert',
            'In saurer Lösung: H⁺ & H₂O zum Ausgleich, in basischer: OH⁻ & H₂O',
            'Standardpotentiale: Je positiver E⁰, desto stärker das Oxidationsmittel'
        ]
    },
    {
        id: 'equilibrium',
        title: 'Chemisches Gleichgewicht',
        description: 'Gleichgewichtsberechnungen und Le Chatelier',
        formulas: [
            {name: 'Gleichgewichtskonstante Kc', formula: 'Kc = Π[c]ᵏ / Π[c]ˡ (Produkte/Ed.)', variables: 'Konzentrationen im Gleichgewicht'},
            {name: 'Gleichgewichtskonstante Kp', formula: 'Kp = Π(p)ᵏ / Π(p)ˡ', variables: 'Partialdrücke bei Gasen'},
            {name: 'Reaktionsquotient Q', formula: 'Q = Π[c]ᵏ / Π[c]ˡ (aktuelle Konzentrationen)', variables: 'Vergleich mit K gibt Reaktionsrichtung an'},
            {name: 'van\'t Hoff', formula: 'ln(K₂/K₁) = -ΔH⁰/R (1/T₂ - 1/T₁)', variables: 'Temperaturabhängigkeit von K'}
        ],
        rules: [
            'Q < K: Reaktion läuft vorwärts (→), Q > K: läuft rückwärts (←), Q = K: im Gleichgewicht',
            'Le Chatelier: Erhöhung T begünstigt endotherme Richtung, Erhöhung p (bei Gas) begünstigt seiten mit weniger Molchen',
            'Katalysator beschleunigt Vorwärts- und Rückreaktion gleich → Gleichgewicht unverändert'
        ]
    },
    {
        id: 'thermochem',
        title: 'Thermochemie',
        description: 'Energieumsetzungen bei chemischen Reaktionen',
        formulas: [
            {name: 'Reaktionsenthalpie', formula: 'ΔHᵣ = ΣΔH_f⁰(Prod.) - ΣΔH_f⁰(Ed.)', variables: 'Standardbildungsenthalpien'},
            {name: 'Hessches Gesetz', formula: 'ΔH_gesamt = ΣΔH_Einzelschritte', variables: 'Pfadunabhängigkeit der Enthalpie'},
            {name: 'Reaktionsentropie', formula: 'ΔSᵣ = ΣS⁰(Prod.) - ΣS⁰(Ed.)', variables: 'Standardentropien'},
            {name: 'Gibbs-Energie', formula: 'ΔG = ΔH - TΔS', variables: 'ΔG < 0 → spontan, ΔG = 0 → Gleichgewicht'}
        ],
        rules: [
            'Exotherm: ΔH < 0 (Wärmeabgabe), Endotherm: ΔH > 0 (Wärmeaufnahme)',
            'Standardbedingungen: 298 K, 1 bar, 1 mol/L',
            'Bildungsenthalpien von Elementen in Standardzustand = 0'
        ]
    }
];

function renderRulesLibrary() {
    const container = document.querySelector('.rules-library');
    if (!container) return;

    container.innerHTML = '';
    CHEMICAL_RULES.forEach(ruleSet => {
        const card = document.createElement('div');
        card.className = 'rule-card';
        card.innerHTML = `
            <h3>${ruleSet.title}</h3>
            <p>${ruleSet.description}</p>
            <div class="formulas">
                ${ruleSet.formulas.map(f => `
                    <div class="formula-item">
                        <strong>${f.name}:</strong>
                        <code>${f.formula}</code>
                        <small>${f.variables}</small>
                    </div>
                `).join('')}
            </div>
            <div class="rules-list">
                ${ruleSet.rules.map(r => `<li>${r}</li>`).join('')}
            </div>
        `;
        container.appendChild(card);
    });
}

// Export
window.RulesLibrary = {
    render: renderRulesLibrary,
    RULES: CHEMICAL_RULES
};

// Auto-render
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderRulesLibrary);
} else {
    renderRulesLibrary();
}