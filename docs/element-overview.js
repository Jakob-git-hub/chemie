// Periodensystem mit kleinen Fakten zu jedem Element

// row/col = Position im Raster (18 Spalten). f-Block in den Reihen 8/9.
const PERIODIC = [
  // Periode 1
  {n:1,  sym:'H',  name:'Wasserstoff', mass:1.008,  cat:'nonmetal',     row:1, col:1,  fact:'Leichtestes Element, Hauptbestandteil von Wasser und Sternen.'},
  {n:2,  sym:'He', name:'Helium',     mass:4.0026, cat:'noble',        row:1, col:18, fact:'Edelgas, für Ballons und Kühlung von Supraleitern.'},
  // Periode 2
  {n:3,  sym:'Li', name:'Lithium',    mass:6.94,   cat:'alkali',       row:2, col:1,  fact:'Leichtestes Metall, in Handy-Akkus.'},
  {n:4,  sym:'Be', name:'Beryllium',  mass:9.0122, cat:'alkaline',     row:2, col:2,  fact:'Leicht und steif, in Legierungen und Kernreaktoren.'},
  {n:5,  sym:'B',  name:'Bor',        mass:10.81,  cat:'metalloid',    row:2, col:13, fact:'Hart, in Borosilikatglas (Pyrex) und Halbleitern.'},
  {n:6,  sym:'C',  name:'Kohlenstoff',mass:12.011, cat:'nonmetal',     row:2, col:14, fact:'Basis alles Lebens, Diamant und Graphit.'},
  {n:7,  sym:'N',  name:'Stickstoff', mass:14.007, cat:'nonmetal',     row:2, col:15, fact:'78 % der Luft, in Proteinen und Dünger.'},
  {n:8,  sym:'O',  name:'Sauerstoff', mass:15.999, cat:'nonmetal',     row:2, col:16, fact:'Zum Atmen nötig, in Wasser und fast allen Mineralien.'},
  {n:9,  sym:'F',  name:'Fluor',      mass:18.998, cat:'halogen',      row:2, col:17, fact:'Reaktivstes Nichtmetall, in Zahnpasta (NaF).'},
  {n:10, sym:'Ne', name:'Neon',       mass:20.180, cat:'noble',        row:2, col:18, fact:'Edelgas, leuchtet rot-orange in Leuchtröhren.'},
  // Periode 3
  {n:11, sym:'Na', name:'Natrium',    mass:22.990, cat:'alkali',       row:3, col:1,  fact:'Salzbildner, in Kochsalz und Natronlauge.'},
  {n:12, sym:'Mg', name:'Magnesium',  mass:24.305, cat:'alkaline',     row:3, col:2,  fact:'Leichtmetall, in Chlorophyll und Legierungen.'},
  {n:13, sym:'Al', name:'Aluminium',  mass:26.982, cat:'post-transition',row:3, col:13, fact:'Häufigstes Metall der Erdkruste, Folien und Dosen.'},
  {n:14, sym:'Si', name:'Silicium',   mass:28.085, cat:'metalloid',    row:3, col:14, fact:'Basis von Glas, Sand und Computerchips.'},
  {n:15, sym:'P',  name:'Phosphor',   mass:30.974, cat:'nonmetal',     row:3, col:15, fact:'In DNA und Knochen, wichtig für Energie (ATP).'},
  {n:16, sym:'S',  name:'Schwefel',   mass:32.06,  cat:'nonmetal',     row:3, col:16, fact:'Gelber Feststoff, in Eiweißen und Vulkanisierung.'},
  {n:17, sym:'Cl', name:'Chlor',      mass:35.45,  cat:'halogen',      row:3, col:17, fact:'Grüngelbes Gas, in Kochsalz und Bleiche.'},
  {n:18, sym:'Ar', name:'Argon',      mass:39.948, cat:'noble',        row:3, col:18, fact:'Edelgas, Schutzgas beim Schweißen.'},
  // Periode 4
  {n:19, sym:'K',  name:'Kalium',     mass:39.098, cat:'alkali',       row:4, col:1,  fact:'Wichtig für Nerven und Muskeln, in Dünger.'},
  {n:20, sym:'Ca', name:'Calcium',    mass:40.078, cat:'alkaline',     row:4, col:2,  fact:'Knochen und Zähne, Kalk und Marmor.'},
  {n:21, sym:'Sc', name:'Scandium',   mass:44.956, cat:'transition',   row:4, col:3,  fact:'Selten, in Leuchtröhren und Leichtlegierungen.'},
  {n:22, sym:'Ti', name:'Titan',      mass:47.867, cat:'transition',   row:4, col:4,  fact:'Leicht und korrosionsfest, Implantate und Flugzeuge.'},
  {n:23, sym:'V',  name:'Vanadium',   mass:50.942, cat:'transition',   row:4, col:5,  fact:'Hart, in Stahllegierungen und Katalysatoren.'},
  {n:24, sym:'Cr', name:'Chrom',      mass:51.996, cat:'transition',   row:4, col:6,  fact:'Glänzend und hart, Chromstahl und Galvanik.'},
  {n:25, sym:'Mn', name:'Mangan',     mass:54.938, cat:'transition',   row:4, col:7,  fact:'Stahlhärtung und Batterien.'},
  {n:26, sym:'Fe', name:'Eisen',      mass:55.845, cat:'transition',   row:4, col:8,  fact:'Wichtigstes Nutzmetall, Stahl und Blut (Hämoglobin).'},
  {n:27, sym:'Co', name:'Cobalt',     mass:58.933, cat:'transition',   row:4, col:9,  fact:'Blau färbend, in Akkus und Turbinen.'},
  {n:28, sym:'Ni', name:'Nickel',     mass:58.693, cat:'transition',   row:4, col:10, fact:'Korrosionsfest, Edelstahl und Münzen.'},
  {n:29, sym:'Cu', name:'Kupfer',     mass:63.546, cat:'transition',   row:4, col:11, fact:'Hervorragender Leiter, Kabel und Rohre.'},
  {n:30, sym:'Zn', name:'Zink',       mass:65.38,  cat:'transition',   row:4, col:12, fact:'Korrosionsschutz (Verzinkung) und Akkus.'},
  {n:31, sym:'Ga', name:'Gallium',    mass:69.723, cat:'post-transition',row:4, col:13, fact:'Schmilzt in der Hand, in LEDs und Halbleitern.'},
  {n:32, sym:'Ge', name:'Germanium',  mass:72.630, cat:'metalloid',    row:4, col:14, fact:'Halbleiter, in Infrarotoptik und Fasern.'},
  {n:33, sym:'As', name:'Arsen',      mass:74.922, cat:'metalloid',    row:4, col:15, fact:'Giftiges Halbmetall, in Legierungen und Dünnschicht.'},
  {n:34, sym:'Se', name:'Selen',      mass:78.971, cat:'nonmetal',     row:4, col:16, fact:'Photoleiter, in Fotokopierern und Gläsern.'},
  {n:35, sym:'Br', name:'Brom',       mass:79.904, cat:'halogen',      row:4, col:17, fact:'Rote, ätzende Flüssigkeit, in Flammschutz und Agro.'},
  {n:36, sym:'Kr', name:'Krypton',    mass:83.798, cat:'noble',        row:4, col:18, fact:'Edelgas, in Hochleistungslampen.'},
  // Periode 5
  {n:37, sym:'Rb', name:'Rubidium',   mass:85.468, cat:'alkali',       row:5, col:1,  fact:'Weiches Alkalimetall, in Vakuumröhren.'},
  {n:38, sym:'Sr', name:'Strontium',  mass:87.62,  cat:'alkaline',     row:5, col:2,  fact:'Rotfärbung von Feuerwerk.'},
  {n:39, sym:'Y',  name:'Yttrium',    mass:88.906, cat:'transition',   row:5, col:3,  fact:'Seltene Erde, in Lasern und Keramik.'},
  {n:40, sym:'Zr', name:'Zirconium',  mass:91.224, cat:'transition',   row:5, col:4,  fact:'Hitzebeständig, in Reaktoren und Keramik.'},
  {n:41, sym:'Nb', name:'Niob',       mass:92.906, cat:'transition',   row:5, col:5,  fact:'Supraleitend, in Magneten und Legierungen.'},
  {n:42, sym:'Mo', name:'Molybdän',  mass:95.95,  cat:'transition',   row:5, col:6,  fact:'Hoher Schmelzpunkt, Stahl und Schmierstoffe.'},
  {n:43, sym:'Tc', name:'Technetium', mass:98,     cat:'transition',   row:5, col:7,  fact:'Erstes künstliches Element, in der Medizin (Diagnostik).'},
  {n:44, sym:'Ru', name:'Ruthenium', mass:101.07, cat:'transition',   row:5, col:8,  fact:'Edelmetall, in Katalysatoren und Elektronik.'},
  {n:45, sym:'Rh', name:'Rhodium',    mass:102.91, cat:'transition',   row:5, col:9,  fact:'Katalysator in Autoabgasen.'},
  {n:46, sym:'Pd', name:'Palladium',  mass:106.42, cat:'transition',   row:5, col:10, fact:'Speichert Wasserstoff, in Katalysatoren und Schmuck.'},
  {n:47, sym:'Ag', name:'Silber',     mass:107.87, cat:'transition',   row:5, col:11, fact:'Bestes Leitermetall, Schmuck und Kontakte.'},
  {n:48, sym:'Cd', name:'Cadmium',    mass:112.41, cat:'transition',   row:5, col:12, fact:'Giftig, in Akkus (veraltet) und Farben.'},
  {n:49, sym:'In', name:'Indium',     mass:114.82, cat:'post-transition',row:5, col:13, fact:'Weich, in Touchscreens und Lötverbindungen.'},
  {n:50, sym:'Sn', name:'Zinn',       mass:118.71, cat:'post-transition',row:5, col:14, fact:'Lötung und Bronze-Legierung.'},
  {n:51, sym:'Sb', name:'Antimon',    mass:121.76, cat:'metalloid',    row:5, col:15, fact:'Sprödes Halbmetall, Flammschutz und Legierungen.'},
  {n:52, sym:'Te', name:'Tellur',     mass:127.60, cat:'metalloid',    row:5, col:16, fact:'Halbmetall, in Solarzellen und Legierungen.'},
  {n:53, sym:'I',  name:'Iod',       mass:126.90, cat:'halogen',      row:5, col:17, fact:'Violetter Feststoff, Desinfektion und Schilddrüse.'},
  {n:54, sym:'Xe', name:'Xenon',      mass:131.29, cat:'noble',        row:5, col:18, fact:'Edelgas, in Scheinwerfern und Narkose.'},
  // Periode 6
  {n:55, sym:'Cs', name:'Caesium',    mass:132.91, cat:'alkali',       row:6, col:1,  fact:'Weiches, goldenes Alkalimetall, Atomuhren.'},
  {n:56, sym:'Ba', name:'Barium',     mass:137.33, cat:'alkaline',     row:6, col:2,  fact:'Röntgenkontrastmittel und Feuerwerk (grün).'},
  // f-Block-Marker
  {n:57, sym:'La', name:'Lanthan',    mass:138.91, cat:'lanthanide',   row:8, col:3,  fact:'Start der Lanthanide, in Optik und Katalysatoren.'},
  {n:58, sym:'Ce', name:'Cer',        mass:140.12, cat:'lanthanide',   row:8, col:4,  fact:'Häufigste Seltene Erde, Katalysatoren und Poliermittel.'},
  {n:59, sym:'Pr', name:'Praseodym', mass:140.91, cat:'lanthanide',   row:8, col:5,  fact:'Grüne Farbe in Keramik und Magneten.'},
  {n:60, sym:'Nd', name:'Neodym',    mass:144.24, cat:'lanthanide',   row:8, col:6,  fact:'Starke Magnete (Neodym) und Laser.'},
  {n:61, sym:'Pm', name:'Promethium', mass:144.91, cat:'lanthanide',   row:8, col:7,  fact:'Radioaktiv, in Leuchtfarben (historisch).'},
  {n:62, sym:'Sm', name:'Samarium',   mass:150.36, cat:'lanthanide',   row:8, col:8,  fact:'In Hochtemperatur-Magneten.'},
  {n:63, sym:'Eu', name:'Europium',  mass:151.96, cat:'lanthanide',   row:8, col:9,  fact:'Rote Phosphore in Bildschirmen.'},
  {n:64, sym:'Gd', name:'Gadolinium', mass:157.25, cat:'lanthanide',   row:8, col:10, fact:'In MRI-Kontrastmitteln.'},
  {n:65, sym:'Tb', name:'Terbium',    mass:158.93, cat:'lanthanide',   row:8, col:11, fact:'Grüne Phosphore und Feststofflaser.'},
  {n:66, sym:'Dy', name:'Dysprosium',mass:162.50, cat:'lanthanide',   row:8, col:12, fact:'In Permanentmagneten und Datenspeichern.'},
  {n:67, sym:'Ho', name:'Holmium',    mass:164.93, cat:'lanthanide',   row:8, col:13, fact:'In Hochleistungslasern.'},
  {n:68, sym:'Er', name:'Erbium',     mass:167.26, cat:'lanthanide',   row:8, col:14, fact:'Rosa Pigmente und Faserlaser.'},
  {n:69, sym:'Tm', name:'Thulium',    mass:168.93, cat:'lanthanide',   row:8, col:15, fact:'Selten, in Röntgenquellen.'},
  {n:70, sym:'Yb', name:'Ytterbium',  mass:173.05, cat:'lanthanide',   row:8, col:16, fact:'In Uhren und Lasern.'},
  {n:71, sym:'Lu', name:'Lutetium',   mass:174.97, cat:'lanthanide',   row:8, col:17, fact:'Schwerstes Lanthanid, in Katalysatoren.'},
  {n:72, sym:'Hf', name:'Hafnium',    mass:178.49, cat:'transition',   row:6, col:4,  fact:'Ähnlich Zirconium, in Kernreaktoren.'},
  {n:73, sym:'Ta', name:'Tantal',     mass:180.95, cat:'transition',   row:6, col:5,  fact:'Korrosionsfest, in Kondensatoren und Implantaten.'},
  {n:74, sym:'W',  name:'Wolfram',    mass:183.84, cat:'transition',   row:6, col:6,  fact:'Höchster Schmelzpunkt aller Metalle, Glühfäden.'},
  {n:75, sym:'Re', name:'Rhenium',    mass:186.21, cat:'transition',   row:6, col:7,  fact:'Selten und teuer, in Turbinenschaufeln und Katalysatoren.'},
  {n:76, sym:'Os', name:'Osmium',     mass:190.23, cat:'transition',   row:6, col:8,  fact:'Dichtestes Element, in Schreibspitzen und Katalysatoren.'},
  {n:77, sym:'Ir', name:'Iridium',    mass:192.22, cat:'transition',   row:6, col:9,  fact:'Sehr korrosionsfest, in Zündkerzen und Standardgewichten.'},
  {n:78, sym:'Pt', name:'Platin',     mass:195.08, cat:'transition',   row:6, col:10, fact:'Edelmetall, Katalysatoren und Schmuck.'},
  {n:79, sym:'Au', name:'Gold',       mass:196.97, cat:'transition',   row:6, col:11, fact:'Beständig gegen Korrosion, Schmuck und Elektronik.'},
  {n:80, sym:'Hg', name:'Quecksilber',mass:200.59, cat:'transition',   row:6, col:12, fact:'Einziges flüssiges Metall, Thermometer (historisch).'},
  {n:81, sym:'Tl', name:'Thallium',   mass:204.38, cat:'post-transition',row:6, col:13, fact:'Sehr giftig, in Elektronik (selten).'},
  {n:82, sym:'Pb', name:'Blei',       mass:207.2,  cat:'post-transition',row:6, col:14, fact:'Weich und giftig, Akkus und Abschirmung.'},
  {n:83, sym:'Bi', name:'Bismut',     mass:208.98, cat:'post-transition',row:6, col:15, fact:'In Magenmitteln und niedrigschmelzenden Legierungen.'},
  {n:84, sym:'Po', name:'Polonium',   mass:209,    cat:'post-transition',row:6, col:16, fact:'Stark radioaktiv, in Wärmequellen (historisch).'},
  {n:85, sym:'At', name:'Astat',      mass:210,    cat:'halogen',      row:6, col:17, fact:'Seltenstes natürliches Element, radioaktiv.'},
  {n:86, sym:'Rn', name:'Radon',      mass:222,    cat:'noble',        row:6, col:18, fact:'Radioaktives Edelgas, in der Strahlentherapie (historisch).'},
  // Periode 7
  {n:87, sym:'Fr', name:'Francium',   mass:223,    cat:'alkali',       row:7, col:1,  fact:'Reaktivstes Element, hoch radioaktiv.'},
  {n:88, sym:'Ra', name:'Radium',     mass:226,    cat:'alkaline',     row:7, col:2,  fact:'Radioaktiv, historisch in Leuchtfarben.'},
  {n:89, sym:'Ac', name:'Actinium',   mass:227,    cat:'actinide',     row:9, col:3,  fact:'Radioaktiv, Start der Actinide.'},
  {n:90, sym:'Th', name:'Thorium',    mass:232.04, cat:'actinide',     row:9, col:4,  fact:'Schwach radioaktiv, in Glühstrümpfen und Kernkraft.'},
  {n:91, sym:'Pa', name:'Protactinium',mass:231.04, cat:'actinide',     row:9, col:5,  fact:'Selten und radioaktiv.'},
  {n:92, sym:'U',  name:'Uran',       mass:238.03, cat:'actinide',     row:9, col:6,  fact:'Kernbrennstoff in Atomkraftwerken.'},
  {n:93, sym:'Np', name:'Neptunium',  mass:237,    cat:'actinide',     row:9, col:7,  fact:'Künstlich, in Neutronendetektoren.'},
  {n:94, sym:'Pu', name:'Plutonium',  mass:244,    cat:'actinide',     row:9, col:8,  fact:'Kernbrennstoff und Waffen, radioaktiv.'},
  {n:95, sym:'Am', name:'Americium',   mass:243,    cat:'actinide',     row:9, col:9,  fact:'In Rauchmeldern (ionisierend).'},
  {n:96, sym:'Cm', name:'Curium',     mass:247,    cat:'actinide',     row:9, col:10, fact:'In RTG-Wärmequellen (Raumsonden).'},
  {n:97, sym:'Bk', name:'Berkelium', mass:247,    cat:'actinide',     row:9, col:11, fact:'Künstlich, Forschung.'},
  {n:98, sym:'Cf', name:'Californium',mass:251,    cat:'actinide',     row:9, col:12, fact:'Neutronenquelle in der Forschung.'},
  {n:99, sym:'Es', name:'Einsteinium',mass:252,    cat:'actinide',     row:9, col:13, fact:'Künstlich, nur Spuren.'},
  {n:100,sym:'Fm', name:'Fermium',    mass:257,    cat:'actinide',     row:9, col:14, fact:'Künstlich, sehr kurzlebig.'},
  {n:101,sym:'Md', name:'Mendelevium',mass:258,    cat:'actinide',     row:9, col:15, fact:'Künstlich, Forschung.'},
  {n:102,sym:'No', name:'Nobelium',   mass:259,    cat:'actinide',     row:9, col:16, fact:'Künstlich, Forschung.'},
  {n:103,sym:'Lr', name:'Lawrencium', mass:266,    cat:'actinide',     row:9, col:17, fact:'Letztes Actinid, künstlich.'},
  {n:104,sym:'Rf', name:'Rutherfordium',mass:267, cat:'transition',   row:7, col:4,  fact:'Künstlich, superschwer.'},
  {n:105,sym:'Db', name:'Dubnium',    mass:268,    cat:'transition',   row:7, col:5,  fact:'Künstlich, superschwer.'},
  {n:106,sym:'Sg', name:'Seaborgium', mass:269,    cat:'transition',   row:7, col:6,  fact:'Künstlich, superschwer.'},
  {n:107,sym:'Bh', name:'Bohrium',    mass:270,    cat:'transition',   row:7, col:7,  fact:'Künstlich, nach Niels Bohr.'},
  {n:108,sym:'Hs', name:'Hassium',    mass:269,    cat:'transition',   row:7, col:8,  fact:'Künstlich, superschwer.'},
  {n:109,sym:'Mt', name:'Meitnerium', mass:278,    cat:'unknown',      row:7, col:9,  fact:'Nach Lise Meitner, künstlich.'},
  {n:110,sym:'Ds', name:'Darmstadtium',mass:281, cat:'unknown',      row:7, col:10, fact:'Nach Darmstadt benannt.'},
  {n:111,sym:'Rg', name:'Roentgenium',mass:282,cat:'unknown',       row:7, col:11, fact:'Nach Wilhelm Röntgen, künstlich.'},
  {n:112,sym:'Cn', name:'Copernicium',mass:285, cat:'transition',   row:7, col:12, fact:'Nach Kopernikus, künstlich.'},
  {n:113,sym:'Nh', name:'Nihonium',   mass:286,    cat:'unknown',      row:7, col:13, fact:'Nach Japan (Nihon), künstlich.'},
  {n:114,sym:'Fl', name:'Flerovium',  mass:289,    cat:'unknown',      row:7, col:14, fact:'Nach Flerov-Labor benannt.'},
  {n:115,sym:'Mc', name:'Moscovium',  mass:290,    cat:'unknown',      row:7, col:15, fact:'Nach Moskau benannt.'},
  {n:116,sym:'Lv', name:'Livermorium',mass:293,    cat:'unknown',      row:7, col:16, fact:'Nach Livermore benannt.'},
  {n:117,sym:'Ts', name:'Tennessin',  mass:294,    cat:'unknown',      row:7, col:17, fact:'Nach Tennessee benannt.'},
  {n:118,sym:'Og', name:'Oganesson',  mass:294,    cat:'noble',        row:7, col:18, fact:'Nach J. Oganessian, superschwer.'}
];

const CATEGORY_LABELS = {
  'alkali':'Alkalimetall',
  'alkaline':'Erdalkalimetall',
  'transition':'Übergangsmetall',
  'post-transition':'Post-Übergangsmetall',
  'metalloid':'Metalloid',
  'nonmetal':'Nichtmetall',
  'halogen':'Halogen',
  'noble':'Edelgas',
  'lanthanide':'Lanthanid',
  'actinide':'Actinid',
  'unknown':'Unbekannt'
};

function renderPeriodicTable() {
  const container = document.getElementById('periodic-table');
  if (!container) return;

  container.innerHTML = '';

  // Platzhalter für den f-Block in den Hauptreihen 6/7
  container.appendChild(makePlaceholder(6, 3, '57–71'));
  container.appendChild(makePlaceholder(7, 3, '89–103'));

  PERIODIC.forEach(el => {
    const cell = document.createElement('button');
    cell.type = 'button';
    cell.className = `pt-cell cat-${el.cat}`;
    cell.style.gridRow = el.row;
    cell.style.gridColumn = el.col;
    cell.setAttribute('aria-label', `${el.name}, Ordnungszahl ${el.n}`);
    cell.innerHTML = `
      <span class="pt-num">${el.n}</span>
      <span class="pt-sym">${el.sym}</span>
      <span class="pt-mass">${el.mass}</span>
    `;
    cell.addEventListener('click', () => showElementFact(el));
    container.appendChild(cell);
  });
}

function makePlaceholder(row, col, text) {
  const ph = document.createElement('div');
  ph.className = 'pt-cell pt-placeholder';
  ph.style.gridRow = row;
  ph.style.gridColumn = col;
  ph.textContent = text;
  return ph;
}

function showElementFact(el) {
  const detail = document.getElementById('element-detail');
  if (!detail) return;

  // Add glassmorphism-enhanced popup
  detail.innerHTML = `
    <div class="pt-detail-glass cat-${el.cat}" data-element="${el.sym}">
      <button class="close-btn" onclick="this.closest('.pt-detail-glass')?.remove();">&times;</button>
      <h3>${el.name} (${el.sym})</h3>
      <p class="atomic-info">
        <strong>Ordnungszahl:</strong> ${el.n}
        <strong>· Atommasse:</strong> ${el.mass} u
      </p>
      <p class="category-tag cat-${el.cat}">${CATEGORY_LABELS[el.cat] || el.cat}</p>
      <p class="pt-fact">💡 ${el.fact}</p>
      <p class="tip">💡 Wasserstoff: Häufigstes Element im Universum, hochentzündlich</p>
      <button class="add-to-formula-btn" data-sym="${el.sym}">Zur Formel hinzufügen</button>
    </div>
  `;
  detail.scrollIntoView({behavior: 'smooth', block: 'nearest'});

  // Add event listener for "Add to Formula" button
  const addBtn = detail.querySelector('.add-to-formula-btn');
  if (addBtn) {
    addBtn.addEventListener('click', appendElementToFormula);
  }
}

/**
 * Appends an element symbol to the chemical formula input field
 * This connects the Periodic Table with the Stoffmenge Calculator
 * @param {Event} e - Click event
 */
function appendElementToFormula(e) {
  const sym = e.target.dataset.sym;
  const formulaInput = document.getElementById('stoffmenge-formula');
  if (!formulaInput) return;

  const current = formulaInput.value.trim();

  // If input is empty, start fresh
  // If there's existing content, append the new element
  const newValue = current ? `${current}${sym}` : sym;

  formulaInput.value = newValue;
  formulaInput.focus();

  // Trigger the live parsing
  if (window.StoffmengeCalculator && typeof window.StoffmengeCalculator.handleFormulaInput === 'function') {
    window.StoffmengeCalculator.handleFormulaInput();
  }

  // Close the element detail after a brief delay
  const detail = document.getElementById('element-detail');
  if (detail) {
    setTimeout(() => {
      detail.innerHTML = '';
    }, 1500);
  }
}

// Erweiterte Karten-Übersicht: erste drei Perioden (H–Ar, Elemente 1–18)
function renderExpandedElements() {
  const container = document.getElementById('expanded-elements');
  if (!container) return;

  container.innerHTML = '';
  PERIODIC
    .filter(e => e.n <= 18)
    .forEach(e => {
      const card = document.createElement('div');
      card.className = `element-card cat-${e.cat}`;
      card.innerHTML = `
        <div class="ec-top">
          <span class="ec-num">${e.n}</span>
          <span class="ec-sym">${e.sym}</span>
        </div>
        <div class="ec-name">${e.name}</div>
        <div class="ec-mass">${e.mass} u</div>
      `;
      card.addEventListener('click', () => showElementFact(e));
      container.appendChild(card);
    });
}

// Export
window.ElementOverview = {
  render: renderPeriodicTable,
  renderExpanded: renderExpandedElements,
  PERIODIC
};

// Auto-render
function renderAllElements() {
  renderPeriodicTable();
  renderExpandedElements();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderAllElements);
} else {
  renderAllElements();
}