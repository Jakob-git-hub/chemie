import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react';
import { Boxes } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InfoCard, StatRow } from '@/components/ui/info-card';
import { useChemStore } from '@/store/useChemStore';
import { useChemistryStore } from '@/store/useChemistryStore';
import { useQuizStore } from '@/store/useQuizStore';
import { checkAtomBalance } from '@/lib/api';
import { parseSDF } from '@/lib/sdf';
import { EquationBalancer } from '@/components/BalanceSteps';
import { FavoritesAndHistory, FavoriteButton } from '@/components/FavoritesAndHistory';
import { QuizOverlay, QuizStartButton } from '@/components/QuizOverlay';
import PageHeader from '@/components/PageHeader';

// 3D-Modul (React-Three-Fiber) wird erst bei Bedarf geladen.
const UnifiedMoleculeViewer = lazy(() => import('@/components/UnifiedMoleculeViewer'));

// --- MathJax-Bootstrap (einmalig) für den Formelsatz ---
function useMathJax() {
  useEffect(() => {
    if (document.getElementById('mathjax-script')) return;
    const s = document.createElement('script');
    s.id = 'mathjax-script';
    s.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
    s.async = true;
    document.head.appendChild(s);
  }, []);
}

function Tex({ children }: { children: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const mj = (window as any).MathJax;
    if (mj?.typesetPromise && ref.current) {
      mj.typesetPromise([ref.current]).catch(() => {});
    }
  }, [children]);
  return <span ref={ref}>{children}</span>;
}

const EXAMPLES = ['Koffein', 'CCO', 'C6H12O6', 'Aspirin', 'Fe + O2 ->', 'CH4 + O2 ->'];

export default function Molecules() {
  useMathJax();
  const [selectedAtomId, setSelectedAtomId] = useState<string | null>(null);

  const {
    query,
    isomer,
    sdf,
    searchStatus,
    equation,
    balance,
    note,
    deltaH,
    deltaS,
    temperature,
    deltaG,
    missingThermo,
    overrides,
    thermoCache,
    setQuery,
    setEquation,
    setTemperature,
    loadMolecule,
    analyze,
    setOverride,
  } = useChemStore();

  const { addToHistory } = useChemistryStore();
  const { gameMode, currentQuestion } = useQuizStore();

  // PubChem-SDF (3D) -> Molecule für den React-Three-Fiber-Viewer.
  // Völlig ohne externes JSmol/CDN – daher im Browser zuverlässig.
  const molecule = useMemo(() => {
    if (!sdf) return null;
    const parsed = parseSDF(sdf);
    if (!parsed) return null;
    return {
      id: 'search',
      name: isomer?.name ?? 'Struktur',
      formula: isomer?.formula ?? '',
      atoms: parsed.atoms,
      bonds: parsed.bonds
    };
  }, [sdf, isomer]);

  const selectedAtom = selectedAtomId
    ? molecule?.atoms.find((a) => a.id === selectedAtomId) ?? null
    : null;

  const check = useMemo(() => (balance?.species ? checkAtomBalance(balance.species) : null), [balance]);
  const spontaneous = deltaG !== null ? deltaG < 0 : null;

  const onOverride = (formula: string, key: 'dHf' | 'S', value: string) => {
    const num = Number(value);
    if (Number.isNaN(num)) return; // kein NaN
    setOverride(formula, key, num);
    if (equation) analyze(equation); // sofort neu verrechnen (manuelle Korrektur)
  };

  return (
    <>
      <PageHeader
        title="Moleküle & Reaktionen"
        description="Lade 3D-Strukturen aus PubChem, gleiche Reaktionsgleichungen aus und simuliere Thermodynamik – alles lokal im Browser."
        icon={<Boxes className="h-5 w-5" />}
      />
      <div className="space-y-6">
      {/* ---------- Quiz Overlay (wird angezeigt wenn Quiz aktiv) ---------- */}
      <QuizOverlay />

      {/* ---------- 1. Universelle 3D-Struktur-Suche ---------- */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Universelle 3D-Struktur-Suche</CardTitle>
            <QuizStartButton />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addToHistory(query);
              void loadMolecule(query);
            }}
            className="flex flex-col gap-2"
          >
            <Label>Formel</Label>
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Name, SMILES oder Summenformel (z. B. Koffein, CCO, C6H12O6)"
            />
            <Button type="submit">
              Struktur laden &amp; berechnen
            </Button>
          </form>
          <div className="flex flex-wrap gap-1.5">
            {EXAMPLES.map((ex) => (
              <Button
                key={ex}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setQuery(ex);
                  if (/->/.test(ex)) analyze(ex);
                  else void loadMolecule(ex);
                }}
              >
                {ex}
              </Button>
            ))}
          </div>
          {searchStatus && <p className="text-sm text-muted-foreground">{searchStatus}</p>}
          {isomer && (
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">Hauptisomer:</span>
              <span className="font-mono">{isomer.name}</span>
              <FavoriteButton formula={isomer.formula} />
              <span className="text-muted-foreground">
                (CID {isomer.cid}
                {isomer.smiles ? ` · ${isomer.smiles}` : ''})
              </span>
            </div>
          )}

          {/* 3D-Viewer (React-Three-Fiber) – keine externe CDN-Abhängigkeit */}
          {molecule ? (
            <>
              <Suspense fallback={<div className="h-[440px] animate-pulse rounded-xl bg-muted" />}>
                <UnifiedMoleculeViewer
                  molecule={gameMode !== 'idle' && currentQuestion ? currentQuestion.molecule : molecule}
                  height={440}
                  onSelectAtom={setSelectedAtomId}
                  quizMode={gameMode !== 'idle'}
                  targetAtoms={[]}
                  isAnswered={false}
                  isCorrect={null}
                />
              </Suspense>
              {selectedAtom ? (
                <div className="flex items-center justify-between gap-3 rounded-lg border border-primary/40 bg-primary/5 p-3 text-sm">
                  <div>
                    <span className="font-medium">Ausgewähltes Atom: </span>
                    <span className="font-mono">
                      {selectedAtom.element} ({selectedAtom.id})
                    </span>
                    <span className="ml-2 font-mono text-muted-foreground">
                      [{selectedAtom.position.map((n) => n.toFixed(2)).join(', ')}]
                    </span>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setSelectedAtomId(null)}>
                    Zurücksetzen
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Tippe auf ein Atom im 3D-Modell, um es auszuwählen.
                </p>
              )}
            </>
          ) : (
            <div className="flex h-[440px] items-center justify-center rounded-xl border text-muted-foreground">
              Noch keine Struktur geladen – suche oben nach einem Molekül.
            </div>
          )}
        </CardContent>
      </Card>

      {/* ---------- 2. Stöchiometrie- & Atombilanz-Prüfer ---------- */}
      <Card>
        <CardHeader>
          <CardTitle>Stöchiometrie- &amp; Atombilanz-Prüfer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              analyze(equation);
            }}
            className="flex flex-col gap-2"
          >
            <Label>Reaktionsgleichung (Beispiel: "Fe + O2 -&gt;" oder "CH4 + O2 -&gt; CO2 + H2O")</Label>
            <Input
              value={equation}
              onChange={(e) => setEquation(e.target.value)}
              placeholder="Edukt + Edukt -> Produkt"
            />
            <Button type="submit">Gleichung ausgleichen &amp; prüfen</Button>
          </form>

          {balance && !balance.ok && <p className="text-sm text-destructive">{balance.error}</p>}
          {note && <p className="text-sm text-muted-foreground">{note}</p>}

          {balance?.ok && balance.balanced && (
            <div className="space-y-3">
              <p className="font-mono text-lg" aria-label="Ausgeglichene Gleichung">
                {balance.balanced}
              </p>
              {check && (
                <div className="text-sm">
                  <span className="font-medium">Atombilanz: </span>
                  {check.balanced ? (
                    <span className="text-green-600" role="status">ausgeglichen ✓</span>
                  ) : (
                    <span className="text-red-600" role="status">nicht ausgeglichen ✗</span>
                  )}
                  <div className="mt-1 grid grid-cols-3 gap-2">
                    {check.rows.map((r) => (
                      <StatRow
                        key={r.element}
                        label={r.element}
                        value={`${r.left} = ${r.right}`}
                        ok={r.ok}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ---------- 2b. Schritt-für-Schritt Reaktionsausgleich ---------- */}
      <EquationBalancer onBalance={analyze} />

      {/* ---------- 3. Live-gekoppelte Thermo-Engine (Gibbs-Helmholtz) ---------- */}
      <Card>
        <CardHeader>
          <CardTitle>Thermo-Engine &amp; Gibbs-Helmholtz-Simulator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3" role="status" aria-live="polite">
            <InfoCard
              label="ΔH_R"
              value={deltaH !== null ? deltaH.toFixed(1) : '–'}
              unit="kJ/mol"
            />
            <InfoCard
              label="ΔS_R"
              value={deltaS !== null ? deltaS.toFixed(1) : '–'}
              unit="J/(mol·K)"
            />
            <InfoCard
              label="T"
              value={temperature}
              unit="K"
            />
          </div>

          <div>
            <Label className="mb-1 block">Temperatur T: {temperature} K</Label>
            <input
              type="range"
              min={200}
              max={1000}
              step={1}
              value={temperature}
              onChange={(e) => setTemperature(Number(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded bg-gray-200"
            />
          </div>

          <div className="rounded-lg border-2 border-primary/40 bg-primary/5 p-4 text-center">
            <Tex>{String.raw`\Delta G = \Delta H - T \cdot \Delta S`}</Tex>
            <div className="font-mono text-3xl font-bold">
              {deltaG !== null ? `${deltaG.toFixed(1)} kJ/mol` : 'warte auf ΔH_R …'}
            </div>
            {spontaneous !== null && (
              <div className={`mt-1 text-sm font-medium ${spontaneous ? 'text-green-600' : 'text-red-600'}`}>
                {spontaneous ? 'spontan (ΔG < 0)' : 'nicht spontan (ΔG > 0)'}
              </div>
            )}
          </div>

          {/* Manuelle Korrektur, falls API/DB keine Thermodaten liefert (kein NaN) */}
          {missingThermo.length > 0 && (
            <div className="rounded-lg border border-amber-400 bg-amber-50 p-3 text-sm dark:bg-amber-950/30">
              <p className="mb-2 font-medium text-amber-700 dark:text-amber-300">
                Fehlende Thermodaten – bitte manuell ergänzen:
              </p>
              {missingThermo.map((f) => {
                const t = thermoCache[f];
                return (
                  <div key={f} className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="font-mono">{f}:</span>
                    {t?.source && (
                      <span className="rounded bg-slate-200 px-1 text-[10px] dark:bg-slate-700">
                        Quelle: {t.source}
                      </span>
                    )}
                    <Input
                      type="number"
                      placeholder="H_f° kJ/mol"
                      className="h-8 w-36"
                      value={overrides[f]?.dHf ?? ''}
                      onChange={(e) => onOverride(f, 'dHf', e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="S° J/(mol·K)"
                      className="h-8 w-36"
                      value={overrides[f]?.S ?? ''}
                      onChange={(e) => onOverride(f, 'S', e.target.value)}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ---------- 4. Favoriten & Verlauf ---------- */}
      <FavoritesAndHistory
        onSelectMolecule={(formula) => {
          setQuery(formula);
          addToHistory(formula);
          void loadMolecule(formula);
        }}
        onSelectEquation={(eq) => {
          setEquation(eq);
          analyze(eq);
        }}
      />
      </div>
    </>
  );
}
