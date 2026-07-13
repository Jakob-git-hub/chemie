import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MOLECULES } from '@/data/molecules';
import thermoData from '@/data/thermo.json';
import { calculateDeltaHFromBonds } from '@/lib/chem';
import { useThermoStore } from '@/store/useThermoStore';

// Standardmolare Entropien S⁰ in J/(mol·K), indiziert nach Summenformel.
const S0 = (thermoData as { S0: Record<string, number> }).S0;

type Mode = 'A' | 'B';

export default function Thermo() {
  const { deltaH, deltaS, temperature, setDeltaH, setDeltaS, setTemperature } = useThermoStore();
  const [mode, setMode] = useState<Mode>('A');

  // --- Modus A: Auswahl von Edukten / Produkten aus der Molekül-Bibliothek ---
  const [reactants, setReactants] = useState<string[]>(['H2', 'O2']);
  const [products, setProducts] = useState<string[]>(['H2O']);

  // --- Modus B: Born-Haber-Schritte (Default-Beispiel NaCl) ---
  const [bhSub, setBhSub] = useState(108); // Sublimation Na(s)
  const [bhIon, setBhIon] = useState(496); // Ionisierung Na
  const [bhDis, setBhDis] = useState(121); // Dissoziation Cl2
  const [bhEa, setBhEa] = useState(-349); // Elektronenaffinität Cl
  const [bhLat, setBhLat] = useState(-788); // Gitterenergie NaCl

  const toggle = (list: string[], setList: (v: string[]) => void, id: string) =>
    setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

  // ΔH (Modus A) aus Bindungsenergien; ΔS aus S⁰-Differenz der Reaktion.
  const computeA = () => {
    const rMols = MOLECULES.filter((m) => reactants.includes(m.formula));
    const pMols = MOLECULES.filter((m) => products.includes(m.formula));
    if (rMols.length === 0 || pMols.length === 0) return;
    const dH = calculateDeltaHFromBonds(rMols, pMols); // kJ/mol
    const dS =
      pMols.reduce((s, m) => s + (S0[m.formula] ?? 0), 0) -
      rMols.reduce((s, m) => s + (S0[m.formula] ?? 0), 0); // J/(mol·K)
    setDeltaH(dH);
    setDeltaS(dS);
  };

  // ΔH (Modus B) aus Born-Haber-Schritten; ΔS aus S⁰ (Bildung aus Elementen).
  const computeB = () => {
    const dH = bhSub + bhIon + bhDis + bhEa + bhLat; // kJ/mol
    // Bildung: Na(s) + 1/2 Cl2(g) -> NaCl(s)
    const sNa = S0['Na'];
    const sCl2 = S0['Cl2'];
    const sNacl = S0['NaCl'];
    let dS: number | null = null;
    if (sNa !== undefined && sCl2 !== undefined && sNacl !== undefined) {
      dS = sNacl - (sNa + 0.5 * sCl2); // J/(mol·K)
    }
    setDeltaH(dH);
    setDeltaS(dS);
  };

  // Gibbs-Helmholtz: ΔG = ΔH - T·ΔS  (Einheiten: ΔH kJ/mol, ΔS J/mol·K -> /1000)
  const deltaG = useMemo(() => {
    if (deltaH === null || deltaS === null) return null;
    return deltaH - (temperature * deltaS) / 1000; // kJ/mol
  }, [deltaH, deltaS, temperature]);

  const spontaneous = deltaG !== null ? deltaG < 0 : null;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* ---------- Energiebilanz-Engine ---------- */}
      <Card>
        <CardHeader>
          <CardTitle>Energiebilanz-Engine</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button variant={mode === 'A' ? 'default' : 'outline'} onClick={() => setMode('A')}>
              Modus A: Bindungsenergien
            </Button>
            <Button variant={mode === 'B' ? 'default' : 'outline'} onClick={() => setMode('B')}>
              Modus B: Born-Haber
            </Button>
          </div>

          {mode === 'A' && (
            <div className="space-y-3">
              <div>
                <Label className="mb-1 block">Edukte</Label>
                <div className="flex flex-wrap gap-1.5">
                  {MOLECULES.map((m) => (
                    <Button
                      key={m.id}
                      size="sm"
                      variant={reactants.includes(m.formula) ? 'default' : 'outline'}
                      onClick={() => toggle(reactants, setReactants, m.formula)}
                    >
                      {m.formula}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="mb-1 block">Produkte</Label>
                <div className="flex flex-wrap gap-1.5">
                  {MOLECULES.map((m) => (
                    <Button
                      key={m.id}
                      size="sm"
                      variant={products.includes(m.formula) ? 'default' : 'outline'}
                      onClick={() => toggle(products, setProducts, m.formula)}
                    >
                      {m.formula}
                    </Button>
                  ))}
                </div>
              </div>
              <Button className="w-full" onClick={computeA}>
                ΔH berechnen
              </Button>
            </div>
          )}

          {mode === 'B' && (
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Sublimation Na', bhSub, setBhSub],
                ['Ionisierung Na', bhIon, setBhIon],
                ['Dissoziation Cl₂', bhDis, setBhDis],
                ['Elektronenaffinität Cl', bhEa, setBhEa],
                ['Gitterenergie', bhLat, setBhLat]
              ].map(([label, val, setter]) => (
                <div key={label as string}>
                  <Label className="mb-1 block">{label as string} (kJ/mol)</Label>
                  <Input
                    type="number"
                    value={val as number}
                    onChange={(e) => (setter as (v: number) => void)(Number(e.target.value))}
                  />
                </div>
              ))}
              <Button className="col-span-2" onClick={computeB}>
                ΔH (Born-Haber) berechnen
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ---------- Gibbs-Helmholtz-Simulator ---------- */}
      <Card>
        <CardHeader>
          <CardTitle>Gibbs-Helmholtz-Simulator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-lg border p-3">
              <div className="text-xs text-muted-foreground">ΔH</div>
              <div className="font-mono text-lg">
                {deltaH !== null ? `${deltaH.toFixed(1)}` : '–'}
              </div>
              <div className="text-[10px] text-muted-foreground">kJ/mol</div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-xs text-muted-foreground">ΔS</div>
              <div className="font-mono text-lg">
                {deltaS !== null ? `${deltaS.toFixed(1)}` : '–'}
              </div>
              <div className="text-[10px] text-muted-foreground">J/(mol·K)</div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-xs text-muted-foreground">T</div>
              <div className="font-mono text-lg">{temperature}</div>
              <div className="text-[10px] text-muted-foreground">K</div>
            </div>
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
            <div className="text-sm text-muted-foreground">Freie Enthalpie ΔG</div>
            <div className="font-mono text-3xl font-bold">
              {deltaG !== null ? `${deltaG.toFixed(1)} kJ/mol` : 'warte auf ΔH …'}
            </div>
            {spontaneous !== null && (
              <div className={`mt-1 text-sm font-medium ${spontaneous ? 'text-green-600' : 'text-red-600'}`}>
                {spontaneous ? 'reaktionsfähig (ΔG < 0)' : 'nicht spontan (ΔG > 0)'}
              </div>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            ΔG = ΔH − T·ΔS. Die ermittelte Reaktionsenthalpie aus der Energiebilanz-Engine wird
            automatisch und live in diesen Simulator eingespeist.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
