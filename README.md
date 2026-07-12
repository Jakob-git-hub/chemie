# Chemie-Labor

Interaktive Chemie-Lernplattform — als moderne **Single-Page-App (React + Vite + Tailwind/shadcn/ui)** neu gestaltet.

## Features
- **3D-Molekül-Visualisierung** (Kernfeature): Moleküle drehen, zoomen und nach Element farbcodiert betrachten – lazy geladen via `@react-three/fiber`.
- **Molekül-Bibliothek** mit kuratierten Beispielstrukturen (Wasser, CO₂, Methan, Ammoniak, Ethanol).
- **Interaktives Quiz** mit Fortschrittstracking (Zustand-Store).
- **Chemie-Kernlogik**: Formel-Parser, molare Masse und Reaktions-Ausgleich (ganzzahlige Lineare Algebra) in `src/lib/chem.ts`.

## Tech-Stack
- React 18 + TypeScript
- Vite (Build nach `docs/`, relativer Base-Pfad für GitHub Pages)
- Tailwind CSS + shadcn/ui (Radix)
- Zustand für State-Management
- `@react-three/fiber` + `@react-three/drei` für die 3D-Darstellung
- Vitest für Unit-Tests

## Entwicklung
```bash
npm install      # Abhängigkeiten installieren
npm run dev      # Dev-Server (Vite)
npm run build    # Produktions-Build nach docs/
npm test         # Unit-Tests (Vitest)
npm run typecheck
```

## Deployment (GitHub Pages)
Der bestehende GitHub-Actions-Workflow (`.github/workflows/deploy.yml`) führt
`npm ci && npm run build` aus und lädt den `docs/`-Ordner als Pages-Artefakt hoch.
Beim Push auf `main` wird die Seite automatisch veröffentlicht.

## Datenquellen (nächster Schritt)
Die Molekül-Daten liegen aktuell lokal in `src/data/molecules.ts`. Für eine
umfangreiche Bibliothek kann `src/lib/api.ts` auf eine externe Quelle (z. B.
PubChem PUG-REST, NIH Cactus) umgestellt werden – dafür wird ein API-Key /
Endpoint benötigt.
