# Atombaukasten — Root-Cause Diagnosis

**Date:** 2026-09-08  
**Component:** Atombaukasten (Atom Builder — interactive subatomic particle builder)  
**App URL:** https://jakob-git-hub.github.io/chemie/

---

## 1. Finding: No Interactive Atom Builder Exists

The reported "Atombaukasten" (interactive builder for protons, neutrons, and electrons) is **not implemented** in the codebase. The only atomic-model component is `BohrModel.tsx`, which is a **purely static SVG renderer** with no interactivity, no state management, and no event handlers.

### Evidence

| What users expect | What actually exists |
|---|---|
| Click to add protons, neutrons, electrons | `BohrModel.tsx` renders a static SVG with no click/drag/touch handlers |
| Real-time element name / isotope / charge / config | `BohrModel.tsx` receives `shells`, `symbol`, `atomicNumber` as props — no derivation |
| Electron shells follow Pauli / 2n² | `shells` data comes from static `data/elements.ts` (pre-computed) |
| Touch support for mobile | No touch event listeners anywhere in `BohrModel.tsx` |
| Navigation to an "atom builder" | No `/atom-builder` route; no link in `Layout.tsx` |

### File Inventory (`src/`)

```
src/
├── components/
│   ├── BohrModel.tsx              ← STATIC SVG only — no interactivity
│   ├── ElementDetail.tsx          ← uses BohrModel as a read-only preview
│   ├── molecule-builder/          ← Molecule Builder (molecules, NOT atoms)
│   └── ...
├── lib/
│   ├── elements.ts                ← Element metadata (no subatomic physics)
│   └── ...
├── routes/
│   ├── index.tsx                  ← Home page (no atom-builder link)
│   └── ...
└── store/
    └── ...                        ← No atom-builder Zustand store
```

---

## 2. Root-Cause Summary

| # | Root Cause | Severity |
|---|---|---|
| **RC-1** | **Feature never built** — The `BohrModel.tsx` component was generated as a static display-only SVG. There is no event pipeline (click/touch/drag), no state machine, and no physics layer for subatomic particles. | Critical |
| **RC-2** | **Coordinate-space disconnect** — Even if click handlers were added to `BohrModel.tsx`, the SVG uses hardcoded `viewBox="0 0 240 240"` with no scaling logic to map viewport coordinates to SVG coordinates — meaning clicks on the rendered element would not map to particle placement positions. | High |
| **RC-3** | **No touch-event support** — `BohrModel.tsx` has zero `touchstart`/`touchmove`/`touchend` listeners, making mobile interaction impossible. | High |
| **RC-4** | **Missing state layer** — No Zustand store exists to manage the mutable physics state (proton count, neutron count, electron count, selected particle type). | Critical |
| **RC-5** | **No physics derivation** — The component receives pre-computed `shells` and `symbol` props; there is no algorithm that derives element name, isotope notation, charge, or electron configuration from subatomic particle counts. | Critical |
| **RC-6** | **No navigation** — The Home page and Layout have no link to an atom-builder route; the feature is invisible to users. | Medium |
| **RC-7** | **Fachliche Desynchronisation risk** — Even if implemented naively, placing more electrons than 2n² per shell would violate the Pauli exclusion principle with no visual/didactic feedback. | Medium |

---

## 3. Root-Cause Tree

```
Atombaukasten non-functional
├── RC-1: Feature never built
│   ├── BohrModel.tsx is a pure render component
│   ├── No event handlers registered (onClick, onTouchStart, etc.)
│   └── No Zustand store for atom builder state
├── RC-2: Coordinate space mismatch
│   ├── SVG viewBox hardcoded to 240×240
│   ├── No mapping from mouse/touch client coords → SVG coords
│   └── No responsive scaling logic
├── RC-3: Touch events missing
│   ├── Only mouse events considered (none exist anyway)
│   └── No touchstart/touchmove/touchend handlers
├── RC-4: State layer missing
│   ├── No atom-builder store (addAtom/removeAtom/selectParticleType)
│   └── No persistence (localStorage)
├── RC-5: Physics derivation missing
│   ├── No element lookup from Z (proton count)
│   ├── No isotope notation (A = Z + N)
│   ├── No charge calculation (p⁺ − e⁻)
│   └── No electron configuration algorithm (subshell filling order)
└── RC-6: Navigation missing
    ├── No /atom-builder route
    └── No link in Layout or Home page
```

---

## 4. Compliance Check (from task rules)

| Rule | Status |
|---|---|
| Coordinate Space & Touch Mismatch | ❌ Violated — no coordinate mapping, no touch events |
| Fachliche Desynchronisation | ❌ Violated — no Pauli principle enforcement, no visual feedback |
| Strict Physics/Render separation | ❌ Not applicable — no architecture exists yet |
| Compare ≥2 architecture approaches | 🔜 To be done in Architecture phase |
| Write corrected code directly | 🔜 To be done in Implementation phase |

---

## 5. Recommended Fix Strategy

1. **Create a pure physics engine** (`src/lib/atom-builder/physics.ts`) that computes element metadata from subatomic particle counts — zero side effects, fully testable.
2. **Create a Zustand store** (`src/store/useAtomBuilderStore.ts`) with undo/history and localStorage persistence.
3. **Build an interactive SVG canvas** (`AtomBuilderCanvas.tsx`) with proper coordinate-space mapping (`getScreenCTM` + `svg.createSVGPoint`) and both mouse + touch event handlers.
4. **Build a particle palette** (`ParticlePalette.tsx`) for selecting which subatomic particle to place.
5. **Build a physics display panel** (`PhysicsDisplay.tsx`) showing element name, isotope, charge, electron config in real time.
6. **Add route** `/atom-builder` and navigation link.
7. **Validate** Pauli principle and 2n² shell capacity with visual error feedback.
