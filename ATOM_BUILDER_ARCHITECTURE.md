# Atombaukasten — Architecture & State Blueprint

**Date:** 2026-09-08  
**Version:** 1.0

---

## Architecture Comparison (3 Approaches)

### Approach A: Unidirectional State Machine
```
[Particle Palette] → [Dispatch Action] → [Zustand Store] → [Physics Engine] → [SVG Render]
```

| Pro | Con |
|-----|-----|
| Predictable state transitions | Store becomes a single massive object |
| Easy undo/redo via state snapshots | Re-renders entire SVG on every action |
| Clear separation of concerns | Complex middleware for derived state |

### Approach B: Reactive Observer Pattern ⭐ CHOSEN
```
[Particle Palette] → [Store.dispatch(action)] → [Zustand Store] → [Subscribers: PhysicsEngine, Renderer]
```

| Pro | Con |
|-----|-----|
| React + Zustand = native reactive pattern | Requires careful selector granularity |
| Zustand selectors re-render only subscribed components | Undo requires snapshot management |
| Physics engine is a pure function subscriber | Initial setup requires clear interface contracts |
| Best performance (granular subscriptions) | |

### Approach C: Pure Functional Immutable Physics-Engine
```
[Action] → [pure function: applyAction(state, action) → newState] → [View renders newState]
```

| Pro | Con |
|-----|-----|
| Zero side effects, trivially testable | React integration requires wrapping |
| Time-travel debugging built-in | Performance overhead of full immutability |
| No store framework needed | Undo is trivial (revert to previous state) |
| | Adds indirection between UI and physics |

### Decision: Approach B (Reactive Observer Pattern)
**Rationale:**
- React + Zustand is already established in the project
- Zustand selectors provide granular reactivity without manual subscription
- Physics engine as a pure function is a natural subscriber to state changes
- Undo/history naturally maps to Zustand's `persist` middleware + manual history stack
- Best balance of correctness, performance, and developer experience

---

## State Model (Reactive Atom Data Model)

### PhysicsState (Source of Truth)
```typescript
interface AtomPhysicsState {
  // Subatomic particle counts (the ONLY mutable state)
  protonCount: number;      // Z = atomic number (1..118)
  neutronCount: number;     // N (0..~150, practical limit)
  electronCount: number;    // e⁻ (0..protonCount + reasonable excess for ions)

  // Selected particle type for the palette
  selectedParticleType: 'proton' | 'neutron' | 'electron';

  // Tool mode
  toolMode: 'place' | 'remove' | 'select';

  // Canvas interaction state
  hoveredPosition: { x: number; y: number } | null;
}
```

### Physics-Derived State (Computed — NOT stored)
```typescript
interface AtomPhysicsResult {
  // Element identity
  elementSymbol: string;      // e.g., "Fe"
  elementName: string;        // e.g., "Eisen"
  atomicNumber: number;       // Z
  massNumber: number;         // A = Z + N

  // Charge
  charge: number;             // p⁺ − e⁻ (positive = cation)
  chargeLabel: string;        // "+3", "0", "-1"

  // Isotope notation
  isotopeNotation: string;    // "⁵⁶Fe", "¹H", "¹⁶O"

  // Electron configuration (subshell notation)
  electronConfiguration: string; // "1s² 2s² 2p⁶ 3s² 3p⁶ 3d⁶ 4s²"

  // Shell occupancy (for Bohr model visualization)
  shellOccupancy: number[];   // [2, 8, 8, 14, 2, ...] per shell n=1,2,3,...

  // Validation
  isValid: boolean;
  errors: string[];           // Pauli violations, shell overflow, etc.
}
```

---

## Separation of Concerns

### PhysicsEngine (Pure Function — `src/lib/atom-builder/physics.ts`)
- **Input:** `AtomPhysicsState`
- **Output:** `AtomPhysicsResult`
- **Zero side effects** — no DOM access, no store access, no network
- **Fully testable** with unit tests
- Functions:
  - `computeElementName(Z: number): string`
  - `computeMassNumber(Z: number, N: number): number`
  - `computeCharge(Z: number, e: number): number`
  - `computeElectronConfiguration(Z: number, e: number): string`
  - `computeShellOccupancy(Z: number, e: number): number[]`
  - `validateAtom(Z: number, N: number, e: number): ValidationResult`

### State Store (Zustand — `src/store/useAtomBuilderStore.ts`)
- Holds `AtomPhysicsState`
- Actions: `addParticle(type)`, `removeParticle(type)`, `setSelectedParticle(type)`
- Persistence via `persist` middleware (localStorage)
- Undo via manual history stack (last 20 states)
- Selectors expose derived state via `useAtomBuilderStore(selector)`

### Render Engine (React Components — `src/components/atom-builder/`)
- **AtomBuilder.tsx** — Layout container
- **ParticlePalette.tsx** — Select proton/neutron/electron, click to activate
- **AtomBuilderCanvas.tsx** — SVG interactive canvas
  - Uses `getScreenCTM()` + `createSVGPoint()` for proper coordinate mapping
  - Registers both `mousedown`/`mousemove`/`mouseup` AND `touchstart`/`touchmove`/`touchend`
  - Renders nucleus (protons+neutrons), electron shells, electrons
  - Click to place particle, click existing particle to remove
- **PhysicsDisplay.tsx** — Shows element name, isotope, charge, electron config
- **ValidationBanner.tsx** — Shows Pauli principle violations

---

## Electron Configuration Algorithm

Subshell filling order (Aufbau principle):
```
1s → 2s → 2p → 3s → 3p → 4s → 3d → 4p → 5s → 4d → 5p → 6s → 4f → 5d → 6p → 7s → 5f → 6d → 7p
```

Each subshell capacity:
- s: 2 electrons
- p: 6 electrons
- d: 10 electrons
- f: 14 electrons

Shell n contains subshells:
- n=1: 1s (2)
- n=2: 2s (2), 2p (6) → total 8
- n=3: 3s (2), 3p (6), 3d (10) → total 18
- n=4: 4s (2), 4p (6), 4d (10), 4f (14) → total 32
- n=5: 5s (2), 5p (6), 5d (10), 5f (14) → total 32
- n=6: 6s (2), 6p (6), 6d (10) → total 18
- n=7: 7s (2), 7p (6) → total 8

Maximum electrons per shell (2n²):
- n=1: 2
- n=2: 8
- n=3: 18
- n=4: 32
- n=5: 32
- n=6: 18 (in practice, 32 for lanthanides/actinides but we cap at 18 for the first 6 shells)
- n=7: 8

### Pauli Exclusion Principle
Each orbital holds max 2 electrons (with opposite spins). The configuration algorithm must ensure:
- No subshell exceeds its capacity
- Total electrons = `electronCount`
- If electrons > 2n² for the outermost shell, show validation error

---

## Component Hierarchy

```
<AtomBuilder>                          # Route page
  ├── <ParticlePalette>                # Left sidebar: proton/neutron/electron buttons
  ├── <AtomBuilderWorkspace>           # Center: SVG canvas
  │   ├── <Nucleus>                    # Center circle with p⁺ and n⁰ dots
  │   ├── <ElectronShells>             # Concentric circles for each shell
  │   └── <Electrons>                  # Dots on shell orbits
  ├── <PhysicsDisplay>                 # Right panel: element info
  └── <ValidationBanner>               # Error messages for Pauli violations
```

---

## File Structure

```
src/
├── components/
│   └── atom-builder/
│       ├── AtomBuilder.tsx
│       ├── AtomBuilderCanvas.tsx
│       ├── ParticlePalette.tsx
│       ├── PhysicsDisplay.tsx
│       └── ValidationBanner.tsx
├── lib/
│   └── atom-builder/
│       ├── physics.ts              # Pure physics engine
│       └── physics.test.ts         # Unit tests
├── store/
│   └── useAtomBuilderStore.ts      # Zustand store
├── routes/
│   └── atom-builder.tsx            # Route page
└── App.tsx                         # Updated with /atom-builder route
```
