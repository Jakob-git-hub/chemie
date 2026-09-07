# Molekül-Baukasten (Build Mode) — Feature Specification

## 1. Overview & Vision

**Feature Name:** Molekül-Baukasten (Molecule Builder / Build Mode)

**Core Functionality:** Ein interaktives Tool, mit dem Lernende Atome zu Molekülen zusammensetzen können. Durch Klicken und Verbinden werden chemische Strukturen aufgebaut, Valenzregeln in Echtzeit geprüft und automatisch SMILES-Notation sowie molare Masse berechnet.

**Target Users:** Schüler (Mittelstufe bis Oberstufe), Studierende, Chemie-Enthusiasten

**Learning Goals:**
- Valenz und chemische Bindungen verstehen
- Summenformeln aus Struktur ableiten
- Grundlagen der organischen Chemie (Funktionelle Gruppen)
- SMILES-Notation kennenlernen

---

## 2. Data Model

### 2.1 BuildableAtom (User-generated atom on canvas)
```typescript
interface BuildableAtom {
  id: string;
  element: string;           // 'H', 'C', 'O', etc.
  position: { x: number; y: number };
  bonds: string[];           // IDs of connected atoms
  charge: number;             // Formal charge, default 0
}
```

### 2.2 BuildableBond
```typescript
interface BuildableBond {
  id: string;
  from: string;              // Atom ID
  to: string;                // Atom ID
  order: 1 | 2 | 3;        // Single, double, triple bond
}
```

### 2.3 BuildableMolecule (Composite)
```typescript
interface BuildableMolecule {
  atoms: BuildableAtom[];
  bonds: BuildableBond[];
  formula: string;           // Computed: 'H2O', 'C6H12O6'
  molarMass: number;        // Computed: 18.015
  smiles: string;            // Computed: '[H]O[H]'
  isValid: boolean;         // All valencies satisfied
  validationErrors: string[]; // List of issues
}
```

### 2.4 ElementValencyMap (Static data)
```typescript
const ELEMENT_VALENCIES: Record<string, { default: number; alternatives?: number[] }> = {
  H: { default: 1 },
  C: { default: 4 },
  N: { default: 3, alternatives: [5] }, // Can have 5 bonds (quaternary ammonium)
  O: { default: 2 },
  S: { default: 2, alternatives: [4, 6] },
  P: { default: 3, alternatives: [5] },
  // ... etc
};
```

---

## 3. State Management

### 3.1 Zustand Store (`useMoleculeBuilderStore.ts`)
```typescript
interface MoleculeBuilderState {
  // Canvas State
  atoms: BuildableAtom[];
  bonds: BuildableBond[];
  selectedAtomId: string | null;

  // Tool Mode
  mode: 'select' | 'addAtom' | 'addBond' | 'delete';

  // Selected Element for adding
  selectedElement: string;

  // Computed (derived state)
  formula: string;
  molarMass: number;
  smiles: string;
  isValid: boolean;
  validationErrors: string[];

  // Actions
  addAtom: (element: string, position: { x: number; y: number }) => void;
  removeAtom: (id: string) => void;
  addBond: (from: string, to: string, order?: 1 | 2 | 3) => void;
  removeBond: (id: string) => void;
  selectAtom: (id: string | null) => void;
  setMode: (mode: Mode) => void;
  setSelectedElement: (element: string) => void;
  clearCanvas: () => void;
  exportMolecule: () => BuildableMolecule;

  // Validation
  validate: () => ValidationResult;
}
```

---

## 4. Architecture Evaluation

### 4.1 Approach A: Pure Canvas 2D
| Pros | Cons |
|------|------|
| Schnellste Rendering-Performance | Keine 3D-Integration |
| Touch-freundlich | Müssen eigene Bond-Rendering-Logik schreiben |
| Kleinste Bundle-Size | Keine natürliche Skalierung zu 3D |

### 4.2 Approach B: React-Three-Fiber (wie bestehend)
| Pros | Cons |
|------|------|
| Nahtlose Integration mit MoleculeViewer | Overkill für 2D-Editor |
| 3D-Vorschau direkt möglich | Komplexeres Bond-Rendering |
| Beste visuelle Konsistenz | Performance bei vielen Atomen |

### 4.3 Approach C: SVG mit React (CHOSEN) ⭐
| Pros | Cons |
|------|------|
| Leichtgewichtig, aber visuell ansprechend | Keine native 3D |
| Exzellente Touch-Unterstützung | Muss 3D-Preview separat bauen |
| Perfekte Integration mit React |  |
| Animationsfreundlich |  |
| Barrierefrei (SVG accessibility) |  |

**Decision:** Approach C (SVG) + 3D-Preview via bestehender MoleculeViewer

**Rationale:**
- Die SVG-Arbeitsfläche ist intuitiver für Touch-Eingabe
- Der 3D-Preview kann das fertige Molekül im UnifiedMoleculeViewer zeigen
- Beste Balance zwischen Usability und technischer Machbarkeit

---

## 5. UI/UX Design

### 5.1 Layout Structure
```
┌─────────────────────────────────────────────────────────┐
│  🧪 Molekül-Baukasten                    [3D-Vorschau] │
├─────────────────────────────────────────────────────────┤
│  [Ausgewählt: H] [Werkzeuge: 🔵 Atom | 🔗 Bindung | 🗑]│
├────────────────────────────┬────────────────────────────┤
│                            │                            │
│   Element-Palette          │     SVG Canvas            │
│   ┌──────────────────┐    │     (Arbeitsfläche)       │
│   │ H  C  N  O  ... │    │                            │
│   │ Li Be B  F  ... │    │     [Atome und Bindungen   │
│   │ Na Mg Al Si ...  │    │      werden hier           │
│   └──────────────────┘    │      dargestellt]         │
│                            │                            │
├────────────────────────────┴────────────────────────────┤
│  📊 Analyse: H₂O | 18.015 g/mol | O-H | Valid: ✓     │
├─────────────────────────────────────────────────────────┤
│  [Löschen] [3D-Vorschau] [Export] [Molekül laden]     │
└─────────────────────────────────────────────────────────┘
```

### 5.2 Color Scheme (Theme-Compatible)
- Atom-Füllfarben: CPK-Konvention (C: #333, O: #FF3333, N: #0066FF, etc.)
- Bindungen: `hsl(var(--foreground))` mit 50% Opacity
- Validierungs-Farben:
  - ✅ Valid: `hsl(var(--success))`
  - ⚠️ Warning: `hsl(var(--warning))`
  - ❌ Error: `hsl(var(--destructive))`

### 5.3 Interaction Flow
1. **Atom hinzufügen:**
   - Element aus Palette wählen → Element wird "selected"
   - Auf Canvas klicken → Atom erscheint an Position

2. **Bindung erstellen:**
   - Werkzeug "Bindung" wählen
   - Erstes Atom klicken (wird hervorgehoben)
   - Zweites Atom klicken → Bindung wird erstellt
   - Bond-Order durch wiederholtes Klicken ändern (1 → 2 → 3 → 1)

3. **Validierung:**
   - Echtzeit-Validierung bei jeder Änderung
   - Atom mit überschrittenem Valenzwert wird rot markiert
   - Tooltip zeigt erwartete vs. aktuelle Bindungen

### 5.4 Mobile Responsiveness
- Palette: Horizontal scrollbare Liste oder ausklappbares Dropdown
- Canvas: Vollbild, touch-zoom mit pinch
- Tooltips: Werden zu modal bottom sheets auf Mobile
- Buttons: Mindestens 44x44px Touch-Target

---

## 6. Component Architecture

### 6.1 Component Hierarchy
```
<MoleculeBuilder>
  ├── <BuilderHeader>
  │   ├── <ModeSelector>
  │   └── <SelectedElementDisplay>
  ├── <BuilderWorkspace>
  │   ├── <ElementPalette>
  │   ├── <BuilderCanvas> (SVG)
  │   │   ├── <AtomNode> (SVG circle + label)
  │   │   └── <BondEdge> (SVG line/path)
  │   └── <CanvasControls> (zoom, clear)
  ├── <AnalysisPanel>
  │   ├── <FormulaDisplay>
  │   ├── <MolarMassDisplay>
  │   └── <ValidationStatus>
  └── <ActionBar>
      ├── <PreviewButton>
      ├── <ExportButton>
      └── <LoadButton>
```

### 6.2 Key Components

#### ElementPalette
- Grid mit häufigsten Elementen (H, C, N, O, S, P, Halogene)
- Erweiterte Palette über "Mehr" Button
- Aktives Element visuell hervorgehoben
- Kategorien: Organisch, Anorganisch, Halogene

#### BuilderCanvas (SVG)
- ViewBox: 0 0 800 600 (responsive)
- Atome: `<circle>` mit Symbol-Text
- Bindungen: `<line>` oder `<path>` für Doppel/Tripelbindung
- Drag-to-pan, pinch-to-zoom
- Grid-Hintergrund für Ausrichtungshilfe

#### ValidationEngine
- Valenz-Regeln pro Element
- Warnung bei unvollständiger Oktett-Regel (Ausnahme: H)
- Hinweis bei zu vielen Bindungen

---

## 7. Algorithms

### 7.1 SMILES Generation
```
1. Finde Startatom (meist C oder heteroatom)
2. DFS/Tiefensuche durch Molekülgraph
3. Für jedes Atom:
   - Öffne Klammern bei Verzweigungen
   - Füge Bindungssymbole hinzu (bei Doppelbindungen: =, Dreifach: #)
   - Schließe Klammern
4. Wasserstoffe implizit (außer bei Ladungen)
```

### 7.2 Formula Computation
- Zähle Atome pro Elementsymbol
- Sortiere nach Hill-System (C zuerst, dann H, dann alphabetisch)
- Indizes als Subscripts: H₂O, C₆H₁₂O₆

### 7.3 Validity Check
```typescript
function validateAtom(atom: BuildableAtom): ValidationResult {
  const valency = getValency(atom.element);
  const usedBonds = atom.bonds.reduce((sum, bond) => sum + bond.order, 0);
  const hydrogens = 0; // Implicit H to fill valency

  if (usedBonds > valency.default) {
    return { valid: false, error: 'Valenz überschritten' };
  }
  if (usedBonds < valency.default && atom.element !== 'C') {
    return { valid: false, error: 'Valenz nicht erfüllt' };
  }
  return { valid: true };
}
```

---

## 8. Integration Points

### 8.1 Navigation Integration
- Neue Route: `/molecule-builder`
- Button in Navigation hinzufügen (neben Moleküle)

### 8.2 Export Integration
- Export als JSON (BuildableMolecule)
- Export als Bild (SVG → PNG)
- "Im 3D-Viewer öffnen" → Lädt ins UnifiedMoleculeViewer

### 8.3 Persistence
- Speichert letzte Arbeit in localStorage
- Auto-save alle 30 Sekunden
- Manual save/load von Dateien

---

## 9. Accessibility (WCAG 2.1 AA)

- **Tastatur-Navigation:** Tab durch Elemente, Enter zum Platzieren
- **Screen Reader:** ARIA-Labels für alle Interaktionen
- **Farbkontraste:** Alle Texte ≥ 4.5:1
- **Fokus-Indikatoren:** Deutlich sichtbar
- **Motion:** Respects `prefers-reduced-motion`

---

## 10. Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Initial Load | < 200ms | Lighthouse |
| Atom Placement | < 16ms | 60fps |
| Validation | < 50ms | Profiling |
| Bundle Impact | < 15kB | Vite build |
| Touch Response | < 100ms | User testing |

---

## 11. File Structure

```
src/
├── components/
│   └── molecule-builder/
│       ├── MoleculeBuilder.tsx      # Main container
│       ├── ElementPalette.tsx       # Element selection
│       ├── BuilderCanvas.tsx        # SVG canvas
│       ├── AtomNode.tsx            # Single atom rendering
│       ├── BondEdge.tsx            # Bond rendering
│       ├── AnalysisPanel.tsx       # Formula/mass display
│       ├── ActionBar.tsx           # Buttons
│       └── ValidationTooltip.tsx   # Error display
├── store/
│   └── useMoleculeBuilderStore.ts   # Zustand store
├── lib/
│   ├── molecule-builder/
│   │   ├── valency.ts              # Valency rules
│   │   ├── smiles.ts               # SMILES generation
│   │   ├── formula.ts              # Formula computation
│   │   └── validation.ts           # Validation logic
│   └── types.ts                    # Shared types
├── routes/
│   └── molecule-builder.tsx         # Route page
└── App.tsx                         # Updated routing
```

---

## 12. Testing Strategy

### Unit Tests
- Valenz-Berechnung
- SMILES-Generierung
- Formel-Komposition
- Validation Logic

### Integration Tests
- Atom hinzufügen + Bond erstellen
- Export-Workflow
- localStorage Persistence

### E2E Tests (Playwright)
- Vollständiger Build-Workflow
- Mobile Touch-Interaktionen
- Theme-Kompatibilität

---

## 13. Dependencies

**New Dependencies:** None (using existing stack)

**Existing Dependencies Used:**
- `zustand` — State management
- `react` — UI
- `lucide-react` — Icons
- `@react-three/fiber` — 3D preview (via existing UnifiedMoleculeViewer)

---

## 14. Success Criteria

1. ✅ Lernende können ein Wasser-Molekül (H₂O) in unter 30 Sekunden bauen
2. ✅ Alle Themes (Light/Dark/Claude Calm) funktionieren ohne visuelle Regression
3. ✅ Touch-Interaktion auf iOS/Android funktioniert
4. ✅ Valenz-Fehler werden klar angezeigt
5. ✅ Export als JSON funktioniert
6. ✅ 3D-Vorschau zeigt gebautes Molekül
7. ✅ 0 TypeScript-Fehler nach Integration
8. ✅ Alle existierenden Tests bestehen
