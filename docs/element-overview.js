// Element Overview Modul - Periodensystem Elementkarten

const ELEMENTS = [
    {symbol: 'H', name: 'Wasserstoff', number: 1, mass: 1.008, category: 'alkali', electrons: '1s¹', commonCompounds: ['H₂O', 'HCl', 'NH₃']},
    {symbol: 'He', name: 'Helium', number: 2, mass: 4.0026, category: 'noble-gas', electrons: '1s²', commonCompounds: ['Inert']},
    {symbol: 'Li', name: 'Lithium', number: 3, mass: 6.94, category: 'alkali', electrons: '[He]2s¹', commonCompounds: ['Li₂O', 'LiCl']},
    {symbol: 'Be', name: 'Beryllium', number: 4, mass: 9.0122, category: 'alkaline-earth', electrons: '[He]2s²', commonCompounds: ['BeO', 'BeCl₂']},
    {symbol: 'B', name: 'Bor', number: 5, mass: 10.81, category: 'metalloid', electrons: '[He]2s²2p¹', commonCompounds: ['B₂O₃', 'H₃BO₃']},
    {symbol: 'C', name: 'Kohlenstoff', number: 6, mass: 12.011, category: 'nonmetal', electrons: '[He]2s²2p²', commonCompounds: ['CO₂', 'CH₄', 'C₆H₁₂O₆']},
    {symbol: 'N', name: 'Stickstoff', number: 7, mass: 14.007, category: 'nonmetal', electrons: '[He]2s²2p³', commonCompounds: ['NH₃', 'NO₂', 'N₂']},
    {symbol: 'O', name: 'Sauerstoff', number: 8, mass: 15.999, category: 'nonmetal', electrons: '[He]2s²2p⁴', commonCompounds: ['H₂O', 'CO₂', 'O₂']},
    {symbol: 'F', name: 'Fluor', number: 9, mass: 18.998, category: 'halogen', electrons: '[He]2s²2p⁵', commonCompounds: ['HF', 'NaF']},
    {symbol: 'Ne', name: 'Neon', number: 10, mass: 20.180, category: 'noble-gas', electrons: '[He]2s²2p⁶', commonCompounds: ['Inert']},
    {symbol: 'Na', name: 'Natrium', number: 11, mass: 22.990, category: 'alkali', electrons: '[Ne]3s¹', commonCompounds: ['NaCl', 'NaOH']},
    {symbol: 'Mg', name: 'Magnesium', number: 12, mass: 24.305, category: 'alkaline-earth', electrons: '[Ne]3s²', commonCompounds: ['MgO', 'MgCl₂']},
    {symbol: 'Al', name: 'Aluminium', number: 13, mass: 26.982, category: 'post-transition', electrons: '[Ne]3s²3p¹', commonCompounds: ['Al₂O₃', 'AlCl₃']},
    {symbol: 'Si', name: 'Silizium', number: 14, mass: 28.085, category: 'metalloid', electrons: '[Ne]3s²3p²', commonCompounds: ['SiO₂', 'SiH₄']},
    {symbol: 'P', name: 'Phosphor', number: 15, mass: 30.974, category: 'nonmetal', electrons: '[Ne]3s²3p³', commonCompounds: ['P₄O₁₀', 'H₃PO₄']},
    {symbol: 'S', name: 'Schwefel', number: 16, mass: 32.06, category: 'nonmetal', electrons: '[Ne]3s²3p⁴', commonCompounds: ['SO₂', 'H₂SO₄']},
    {symbol: 'Cl', name: 'Chlor', number: 17, mass: 35.45, category: 'halogen', electrons: '[Ne]3s²3p⁵', commonCompounds: ['HCl', 'NaCl']},
    {symbol: 'Ar', name: 'Argon', number: 18, mass: 39.948, category: 'noble-gas', electrons: '[Ne]3s²3p⁶', commonCompounds: ['Inert']},
    {symbol: 'K', name: 'Kalium', number: 19, mass: 39.098, category: 'alkali', electrons: '[Ar]4s¹', commonCompounds: ['KCl', 'KOH']},
    {symbol: 'Ca', name: 'Calcium', number: 20, mass: 40.078, category: 'alkaline-earth', electrons: '[Ar]4s²', commonCompounds: ['CaO', 'CaCO₃']},
    {symbol: 'Fe', name: 'Eisen', number: 26, mass: 55.845, category: 'transition', electrons: '[Ar]3d⁶4s²', commonCompounds: ['Fe₂O₃', 'FeCl₂']},
    {symbol: 'Cu', name: 'Kupfer', number: 29, mass: 63.546, category: 'transition', electrons: '[Ar]3d¹⁰4s¹', commonCompounds: ['CuO', 'CuSO₄']},
    {symbol: 'Zn', name: 'Zink', number: 30, mass: 65.38, category: 'transition', electrons: '[Ar]3d¹⁰4s²', commonCompounds: ['ZnO', 'ZnCl₂']},
    {symbol: 'Br', name: 'Brom', number: 35, mass: 79.904, category: 'halogen', electrons: '[Ar]3d¹⁰4s²4p⁵', commonCompounds: ['HBr', 'NaBr']},
    {symbol: 'I', name: 'Iod', number: 53, mass: 126.90, category: 'halogen', electrons: '[Kr]4d¹⁰5s²5p⁵', commonCompounds: ['HI', 'KI']}
];

let displayedCount = 2;

function createElementCard(element) {
    const card = document.createElement('div');
    card.className = 'element-card';
    card.innerHTML = `
        <h3>${element.name} (${element.symbol})</h3>
        <div class="data">
            <p><strong>Symbol:</strong> ${element.symbol}</p>
            <p><strong>Atomzahl:</strong> ${element.number}</p>
            <p><strong>Atommasse:</strong> ${element.mass} g·mol⁻¹</p>
            <p><strong>Elektronenkonfiguration:</strong> ${element.electrons}</p>
            <p><em>Häufige Verbindungen:</em> ${element.commonCompounds.join(', ')}</p>
        </div>
    `;
    card.addEventListener('click', () => showElementDetail(element));
    return card;
}

function loadInitialElements() {
    const deck = document.getElementById('element-deck');
    deck.innerHTML = '';
    ELEMENTS.slice(0, displayedCount).forEach(el => {
        deck.appendChild(createElementCard(el));
    });
}

function loadMoreElements() {
    displayedCount = Math.min(displayedCount + 10, ELEMENTS.length);
    loadInitialElements();
    if (displayedCount >= ELEMENTS.length) {
        document.querySelector('#element button').style.display = 'none';
    }
}

function showElementDetail(element) {
    const detail = document.getElementById('element-detail');
    detail.innerHTML = `
        <h3>${element.name} (${element.symbol}) - Detailansicht</h3>
        <div class="element-detail">
            <p><strong>Atomzahl:</strong> ${element.number}</p>
            <p><strong>Atommasse:</strong> ${element.mass} g·mol⁻¹</p>
            <p><strong>Kategorie:</strong> ${element.category}</p>
            <p><strong>Elektronenkonfiguration:</strong> ${element.electrons}</p>
            <p><strong>Valenzelektronen:</strong> ${element.number <= 2 ? element.number : (element.number <= 10 ? element.number - 2 : element.number - 10)}</p>
            <p><strong>Häufige Verbindungen:</strong> ${element.commonCompounds.join(', ')}</p>
            <button onclick="document.getElementById('element-detail').innerHTML=''">Schließen</button>
        </div>
    `;
    detail.scrollIntoView({behavior: 'smooth'});
}

// Export
window.ElementOverview = {
    loadInitial: loadInitialElements,
    loadMore: loadMoreElements,
    ELEMENTS
};

// Auto-initialize when DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadInitialElements);
} else {
    loadInitialElements();
}