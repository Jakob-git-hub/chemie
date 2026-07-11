// Stoffmenge Rechner Modul
// Berechnet n = m / M und invers m = n * M

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
        <p>Ergebnis: n = ${amount.toFixed(6)} mol</p>
        <p>Formel: n = m / M = ${mass} g / ${molarMass} g·mol⁻¹</p>
    `;
}

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
        <p>Ergebnis: m = ${mass.toFixed(4)} g</p>
        <p>Formel: m = n × M = ${amount} mol × ${molarMass} g·mol⁻¹</p>
    `;
}

// Molare Masse aus Formel berechnen
function calculateMolarMassFromFormula(formula) {
    const atomicMass = {
        H: 1.008, He: 4.0026, Li: 6.94, Be: 9.0122, B: 10.81, C: 12.011, N: 14.007, O: 15.999,
        F: 18.998, Ne: 20.180, Na: 22.990, Mg: 24.305, Al: 26.982, Si: 28.085, P: 30.974, S: 32.06,
        Cl: 35.45, Ar: 39.948, K: 39.098, Ca: 40.078, Fe: 55.845, Cu: 63.546, Zn: 65.38
    };

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

document.getElementById('stoffmenge-invert').addEventListener('click', invertStoffmenge);

// Export
window.StoffmengeCalculator = {
    calculate: calculateStoffmenge,
    invert: invertStoffmenge,
    calculateMolarMassFromFormula
};