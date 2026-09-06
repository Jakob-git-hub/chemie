# Chemie-Labor (Chemie-Lernplattform) - Codebase Summary

## Project Overview
An interactive chemistry learning platform built as a modern Single-Page Application (React + Vite + Tailwind/shadcn/ui). The platform features 3D molecule visualization, a curated molecule library, interactive quizzes with progress tracking, and core chemistry logic including formula parsing, molar mass calculation, and reaction balancing.

## Technology Stack
- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite (configured for GitHub Pages deployment)
- **Styling**: Tailwind CSS + shadcn/ui components (Radix UI primitives)
- **State Management**: Zustand
- **3D Visualization**: @react-three/fiber + @react-three/drei + Three.js
- **Testing**: Vitest (unit tests)
- **Type Checking**: TypeScript with tsc
- **Deployment**: GitHub Actions workflow deploying to GitHub Pages

## Architecture & Structure

### Main Directories
```
src/
├── components/              # UI components
├── data/                    # Raw data files
├── lib/                     # Core library logic
├── routes/                  # React Router routes
├── store/                   # Zustand stores
├── vite-env.d.ts            # Vite type definitions
└── index.css               # Global styles

public/                     # Static assets
.github/                    # GitHub workflows
docs/                      # Build output (for GitHub Pages)
```

### Key Features
1. **3D Molecule Visualization**: Interactive molecule viewer with rotation, zoom, and element-based coloring
2. **Molecule Library**: Curated examples (water, CO₂, methane, ammonia, ethanol)
3. **Interactive Quiz**: With progress tracking and chemistry challenges
4. **Chemistry Core**: Formula parsing, molar mass calculation, reaction balancing

## Important Files & Their Purposes

### Core Application Files
- **`src/main.tsx`**: React entry point (renders <App />)
- **`src/App.tsx`**: Main application component with routing
- **`src/index.html`**: Template (in root) - served by Vite
- **`src/index.css`**: Global styles (Tailwind base)
- **`src/main.tsx`**: React DOM rendering entry

### Components Directory (`src/components/`)
- **`BohrModel.tsx`**: Electron shell visualization
- **`ElementDetail.tsx`**: Detailed element information display
- **`ElementTile.tsx`**: Individual element cards in periodic table
- **`ErrorBoundary.tsx`/`ErrorCard.tsx`**: Error handling components
- **`Layout.tsx`**: Page layout with navigation
- **`MoleculeViewer.tsx`**: 3D molecule viewer (using react-three-fiber)
- **`PageHeader.tsx`**: Consistent header across pages
- **`ui/`**: shadcn/ui component variants (button, card, input, label, tabs)

### Data Directory (`src/data/`)
- **`molecules.ts`**: Curated molecule structures (current data source)
- **`elements.ts`**: Element properties and periodic table data
- **`lattice.json`/`thermo.json`**: Additional chemistry data

### Library Directory (`src/lib/`)
- **`chem.ts`**: Core chemistry logic (formula parsing, molar mass, reaction balancing)
- **`api.ts`**: API integration layer (can connect to PubChem PUG-REST, NIH Cactus)
- **`elements.ts`**: Element utilities and data
- **`jsmol.ts`**: JSmol integration (fallback for molecular visualization)
- **`sdf.ts`**: SDF file parsing
- **`types.ts`**: TypeScript type definitions
- **`utils.ts`**: General utility functions

### Routes Directory (`src/routes/`)
- **`index.tsx`**: Home page
- **`molecules.tsx`**: Molecule library and viewer
- **`periodic-table.tsx`**: Interactive periodic table
- **`quiz.tsx`**: Chemistry quiz interface

### Store Directory (`src/store/`)
- **`useAppStore.ts`**: General application state (quiz progress, UI preferences)
- **`useChemStore.ts`**: Chemistry-specific state (current calculations, selected elements)
- **`useChemistryStore.ts`**: Combined chemistry app state

## Development Setup

### Prerequisites
- Node.js (v20+)
- Git

### Installation
```bash
npm install      # Install all dependencies
```

### Development Commands
```bash
npm run dev      # Start development server (Vite)
npm run build    # Build for production (output to docs/)
npm preview     # Preview built app
npm run typecheck # TypeScript type checking
npm test        # Run unit tests (Vitest)
```

### Project Structure Notes
- Uses ES modules (`"type": "module"`)
- Configured for GitHub Pages with relative base path
- Components follow functional React pattern with TypeScript
- shadcn/ui components are customizable Tailwind components

## Build & Deployment

### Build Process
1. `npm run build` creates optimized production bundle
2. Output is placed in `docs/` directory (for GitHub Pages)
3. Vite automatically configures relative base path for GitHub Pages

### GitHub Pages Deployment
The existing workflow `.github/workflows/deploy.yml`:
1. Runs on pushes to `main` branch
2. Executes `npm ci && npm run build`
3. Uploads `docs/` folder as GitHub Pages artifact
4. Automatically publishes the page

### Current Data Strategy
- **Molecule Data**: Stored in `src/data/molecules.ts` (curated examples)
- **Future Enhancement**: Can be switched to external API (PubChem PUG-REST, NIH Cactus) via `src/lib/api.ts` with API key/endpoint

## Testing
- **Unit Tests**: Vitest framework
- **Test Files**: Located in `src/lib/` (`chem.test.ts`, `api.test.ts`, `repair.verification.test.ts`)
- **Chemistry Tests**: Focus on formula parsing, molar mass calculation, and reaction balancing logic

## Key Chemistry Features (in `src/lib/chem.ts`)
1. **Formula Parser**: Parses chemical formulas (e.g., "H2O", "C6H12O6")
2. **Molar Mass Calculator**: Calculates molecular weight from formulas
3. **Reaction Balancer**: Uses integer linear algebra to balance chemical equations
4. **Element Data**: Access to atomic properties, electron shells, etc.

## Integration Points
1. **Molecule Visualization**: Combines 3D viewer (`MoleculeViewer`) with chemistry data (`chem.ts`) and molecule library (`molecules.ts`)
2. **Quiz System**: Uses `useAppStore` for progress tracking and chemistry core (`chem.ts`) for validation
3. **Periodic Table**: Interactive display (`ElementTile`, `ElementDetail`) connected to element data (`elements.ts`) and chemistry logic (`chem.ts`)

## Future Enhancement Areas
1. **Data Source**: Switch from local `molecules.ts` to external API (PubChem, NIH Cactus)
2. **Advanced Features**: More complex molecule structures, reaction prediction
3. **Performance**: Optimize 3D rendering for larger molecules
4. **Accessibility**: Enhanced screen reader support for chemistry content

## Project Files Summary
- **Root**: `README.md`, `package.json`, `vite.config.ts`, `tailwind.config.js`
- **Build Artifacts**: `chemie_jsmol_tmp.js` (generated), `docs/` (production output)
- **Configuration**: `.gitignore`, `tsconfig.json`, `postcss.config.js`, `components.json`
- **CI/CD**: `.github/workflows/deploy.yml`

## Getting Started for New Developers
1. Clone the repository
2. Run `npm install` to install dependencies
3. Run `npm run dev` to start the development server
4. Visit `http://localhost:5173` to view the app
5. Explore `src/components/` for UI patterns
6. Look at `src/lib/chem.ts` for core chemistry implementation
7. Check `src/data/molecules.ts` for current molecule data
8. Run `npm test` to run existing unit tests
9. Run `npm run typecheck` to verify TypeScript types

The codebase follows modern React/TypeScript best practices with a clear separation of concerns and is designed for maintainability and scalability.