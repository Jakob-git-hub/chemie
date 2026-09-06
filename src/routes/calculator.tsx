import { useState, useMemo } from 'react';
import { Calculator as CalcIcon, FlaskConical, Atom, Beaker, Wind } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InfoCard } from '@/components/ui/info-card';
import { parseFormula } from '@/lib/chem';
import PageHeader from '@/components/PageHeader';

// ─── Molar Mass Calculator ─────────────────────────────────────────────────────
function MolarMassCalculator() {
  const [formula, setFormula] = useState('H2O');
  const [massInput, setMassInput] = useState('18.015');

  const result = useMemo(() => {
    const parsed = parseFormula(formula);
    if (!parsed.ok) return { error: parsed.error };
    const m = parseFloat(massInput);
    const moles = Number.isFinite(m) && parsed.mass > 0 ? m / parsed.mass : null;
    return { parsed, moles };
  }, [formula, massInput]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Atom className="h-5 w-5" aria-hidden="true" />
          Molare Masse & Stoffmenge
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="calc-formula">Summenformel</Label>
            <Input
              id="calc-formula"
              value={formula}
              onChange={(e) => setFormula(e.target.value)}
              placeholder="z.B. H2O, NaCl, C6H12O6"
              className="font-mono"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="calc-mass">Masse (g)</Label>
            <Input
              id="calc-mass"
              type="number"
              step="any"
              value={massInput}
              onChange={(e) => setMassInput(e.target.value)}
              placeholder="z.B. 18.015"
            />
          </div>
        </div>

        {'error' in result ? (
          <p className="text-sm text-red-600" role="alert">{result.error}</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3" role="region" aria-label="Berechnungsergebnisse">
            <InfoCard
              label="Molare Masse"
              value={result.parsed!.mass.toFixed(3)}
              unit="g/mol"
            />
            <InfoCard
              label="Stoffmenge n"
              value={result.moles !== null ? result.moles.toFixed(6) : '–'}
              unit="mol"
            />
            <InfoCard
              label="Teilchenanzahl"
              value={result.moles !== null ? (result.moles * 6.022e23).toExponential(3) : '–'}
              unit="N"
            />
          </div>
        )}

        {'parsed' in result && result.parsed && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Zusammensetzung</h3>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {Object.entries(result.parsed.composition).map(([sym, data]) => (
                <InfoCard
                  key={sym}
                  label={sym}
                  value={`${data.count} × ${ATOMIC_MASS[sym]?.toFixed(3) ?? '?'} g`}
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

const ATOMIC_MASS: Record<string, number> = {
  H: 1.008, He: 4.0026, Li: 6.94, Be: 9.0122, B: 10.81, C: 12.011, N: 14.007, O: 15.999,
  F: 18.998, Ne: 20.18, Na: 22.99, Mg: 24.305, Al: 26.982, Si: 28.085, P: 30.974, S: 32.06,
  Cl: 35.45, Ar: 39.948, K: 39.098, Ca: 40.078, Fe: 55.845, Cu: 63.546, Zn: 65.38,
  Br: 79.904, Ag: 107.87, I: 126.9, Au: 196.97, Pb: 207.2, Mn: 54.938
};

// ─── Gas Law Calculator ────────────────────────────────────────────────────────
type GasLaw = 'pv' | 'pnrt' | 'pt';

function GasLawCalculator() {
  const [law, setLaw] = useState<GasLaw>('pnrt');
  const [P, setP] = useState('101.325'); // kPa
  const [V, setV] = useState('24.47');    // L
  const [n, setN] = useState('1');        // mol
  const [T, setT] = useState('298.15');   // K
  const [R, setR] = useState('8.314');    // J/(mol·K)

  const results = useMemo(() => {
    const p = parseFloat(P);
    const v = parseFloat(V);
    const moles = parseFloat(n);
    const temp = parseFloat(T);
    const r = parseFloat(R);
    if (![p, v, moles, temp, r].every(Number.isFinite) || temp <= 0) return null;

    const pV = p * v;           // kPa·L = J
    const nRT = moles * r * temp; // J
    const PVnRT = pV / nRT;    // dimensionless ratio

    // Ideal gas: PV = nRT → find missing variable based on law type
    let missing: { label: string; value: number; unit: string } | null = null;

    if (law === 'pnrt') {
      // P * V = n * R * T → find P
      const calculatedP = (moles * r * temp) / v;
      missing = { label: 'Druck P', value: calculatedP, unit: 'kPa' };
    } else if (law === 'pv') {
      // Find n
      missing = { label: 'Stoffmenge n', value: (p * v) / (r * temp), unit: 'mol' };
    } else {
      // Find T
      missing = { label: 'Temperatur T', value: (p * v) / (moles * r), unit: 'K' };
    }

    return { pV, nRT, PVnRT, missing };
  }, [P, V, n, T, R, law]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wind className="h-5 w-5" aria-hidden="true" />
          Gasgesetz-Rechner
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={law === 'pnrt' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setLaw('pnrt')}
          >
            Finde Druck P
          </Button>
          <Button
            variant={law === 'pv' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setLaw('pv')}
          >
            Finde Stoffmenge n
          </Button>
          <Button
            variant={law === 'pt' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setLaw('pt')}
          >
            Finde Temperatur T
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="gas-p">P (Druck, kPa)</Label>
            <Input
              id="gas-p"
              type="number"
              step="any"
              value={P}
              onChange={(e) => setP(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="gas-v">V (Volumen, L)</Label>
            <Input
              id="gas-v"
              type="number"
              step="any"
              value={V}
              onChange={(e) => setV(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="gas-n">n (Stoffmenge, mol)</Label>
            <Input
              id="gas-n"
              type="number"
              step="any"
              value={n}
              onChange={(e) => setN(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="gas-t">T (Temperatur, K)</Label>
            <Input
              id="gas-t"
              type="number"
              step="any"
              value={T}
              onChange={(e) => setT(e.target.value)}
            />
          </div>
        </div>

        {results && (
          <div className="space-y-3" role="region" aria-label="Gasergebnisse">
            <div className="rounded-lg border-2 border-primary/30 bg-primary/5 p-4 text-center">
              <div className="font-mono text-xs text-muted-foreground">
                {law === 'pnrt' ? 'P·V = n·R·T' : law === 'pv' ? 'n = P·V / (R·T)' : 'T = P·V / (n·R)'}
              </div>
              <div className="mt-1 font-mono text-lg">
                P·V = {results.pV.toFixed(3)} J &nbsp;|&nbsp; n·R·T = {results.nRT.toFixed(3)} J
              </div>
              <div className="text-xs text-muted-foreground">
                Abweichung vom Idealgesetz: {(Math.abs(1 - results.PVnRT) * 100) < 0.01 ? '~0%' : `${(Math.abs(1 - results.PVnRT) * 100).toFixed(2)}%`}
              </div>
            </div>
            {results.missing && (
              <InfoCard
                label={results.missing.label}
                value={results.missing.value.toFixed(3)}
                unit={results.missing.unit}
                highlighted
              />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Concentration Calculator ───────────────────────────────────────────────────
function ConcentrationCalculator() {
  const [mode, setMode] = useState<'c' | 'dilution'>('c');
  const [c, setC] = useState('1.0');         // mol/L
  const [v, setV] = useState('1.0');           // L
  const [m, setM] = useState('58.44');         // g/mol
  const [mass, setMass] = useState('58.44');    // g
  // Dilution
  const [c1, setC1] = useState('1.0');       // M (konzentriert)
  const [v1, setV1] = useState('0.1');         // L (konzentriert)
  const [c2, setC2] = useState('0.1');         // M (verdünnt)
  const [v2, setV2] = useState('1.0');         // L (verdünnt)

  const result = useMemo(() => {
    if (mode === 'c') {
      const conc = parseFloat(c);
      const vol = parseFloat(v);
      const mm = parseFloat(m);
      const g = parseFloat(mass);
      if (![conc, vol, mm, g].every(Number.isFinite)) return null;
      const n = g / mm;
      const calcC = n / vol;
      const calcV = n / conc;
      return { n, calcC, calcV };
    } else {
      const conc1 = parseFloat(c1);
      const vol1 = parseFloat(v1);
      const conc2 = parseFloat(c2);
      const vol2 = parseFloat(v2);
      if (![conc1, vol1, conc2, vol2].every(Number.isFinite)) return null;
      if (conc1 <= 0 || conc2 <= 0) return null;
      // c1*V1 = c2*V2 → V1 = c2*V2/c1
      const calcV1 = (conc2 * vol2) / conc1;
      const water = vol2 - calcV1;
      return { conc1, vol1, conc2, vol2, calcV1, water };
    }
  }, [mode, c, v, m, mass, c1, v1, c2, v2]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Beaker className="h-5 w-5" aria-hidden="true" />
          Konzentrations-Rechner
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button variant={mode === 'c' ? 'default' : 'outline'} size="sm" onClick={() => setMode('c')}>
            c = n/V
          </Button>
          <Button variant={mode === 'dilution' ? 'default' : 'outline'} size="sm" onClick={() => setMode('dilution')}>
            Verdünnung (c₁V₁ = c₂V₂)
          </Button>
        </div>

        {mode === 'c' && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="conc-c">c (Konzentration, mol/L)</Label>
              <Input id="conc-c" type="number" step="any" value={c} onChange={(e) => setC(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="conc-v">V (Volumen, L)</Label>
              <Input id="conc-v" type="number" step="any" value={v} onChange={(e) => setV(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="conc-m">M (molare Masse, g/mol)</Label>
              <Input id="conc-m" type="number" step="any" value={m} onChange={(e) => setM(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="conc-mass">m (Masse, g)</Label>
              <Input id="conc-mass" type="number" step="any" value={mass} onChange={(e) => setMass(e.target.value)} />
            </div>
          </div>
        )}

        {mode === 'dilution' && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1 rounded-lg border p-3">
              <p className="text-sm font-medium">Ausgangslösung (konzentriert)</p>
              <div className="space-y-2">
                <div className="space-y-1">
                  <Label htmlFor="dil-c1">c₁ (M, mol/L)</Label>
                  <Input id="dil-c1" type="number" step="any" value={c1} onChange={(e) => setC1(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="dil-v1">V₁ (L, zu entnehmen)</Label>
                  <Input id="dil-v1" type="number" step="any" value={v1} onChange={(e) => setV1(e.target.value)} />
                </div>
              </div>
            </div>
            <div className="space-y-1 rounded-lg border p-3">
              <p className="text-sm font-medium">Zielösung (verdünnt)</p>
              <div className="space-y-2">
                <div className="space-y-1">
                  <Label htmlFor="dil-c2">c₂ (M, mol/L)</Label>
                  <Input id="dil-c2" type="number" step="any" value={c2} onChange={(e) => setC2(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="dil-v2">V₂ (L, Endvolumen)</Label>
                  <Input id="dil-v2" type="number" step="any" value={v2} onChange={(e) => setV2(e.target.value)} />
                </div>
              </div>
            </div>
          </div>
        )}

        {result && mode === 'c' && 'n' in result && result.n !== undefined && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3" role="region" aria-label="Konzentrationsergebnisse">
            <InfoCard label="Stoffmenge n" value={result.n.toFixed(4)} unit="mol" />
            <InfoCard label="Konzentration c" value={result.calcC!.toFixed(4)} unit="mol/L" />
            <InfoCard label="Volumen V" value={result.calcV!.toFixed(4)} unit="L" />
          </div>
        )}

        {result && mode === 'dilution' && 'calcV1' in result && result.calcV1 !== undefined && (
          <div className="space-y-2" role="region" aria-label="Verdünnungsergebnisse">
            <div className="rounded-lg border-2 border-primary/30 bg-primary/5 p-4 text-center font-mono">
              c₁·V₁ = c₂·V₂<br />
              {parseFloat(c1).toFixed(2)} × {parseFloat(v1).toFixed(3)} = {parseFloat(c2).toFixed(2)} × {parseFloat(v2).toFixed(3)}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <InfoCard
                label="Benötigtes Volumen V₁"
                value={result.calcV1.toFixed(4)}
                unit="L"
                highlighted
              />
              <InfoCard
                label="Wasser hinzufügen"
                value={result.water!.toFixed(4)}
                unit="L"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── pH Calculator ────────────────────────────────────────────────────────────
function PHCalculator() {
  const [mode, setMode] = useState<'ph' | 'pOH' | 'ka'>('ph');
  const [phValue, setPhValue] = useState('1.0');
  const [ka, setKa] = useState('1.8e-5');     // for acetic acid
  const [kaConc, setKaConc] = useState('0.1'); // acid concentration

  interface PHResult {
    ph: number;
    pOH: number;
    h3o: number;
    oh: number;
    strong: boolean;
    ka?: number;
  }

  const results = useMemo((): PHResult | null => {
    const p = parseFloat(phValue);
    const k = parseFloat(ka);
    const ck = parseFloat(kaConc);

    if (mode === 'ph') {
      if (!Number.isFinite(p)) return null;
      const h3o = Math.pow(10, -p);
      const oh = 1e-14 / h3o;
      const pOH = -Math.log10(oh);
      return { ph: p, pOH, h3o, oh, strong: true };
    } else if (mode === 'pOH') {
      if (!Number.isFinite(p)) return null;
      const oh = Math.pow(10, -p);
      const h3o = 1e-14 / oh;
      const pH = -Math.log10(h3o);
      return { ph: pH, pOH: p, h3o, oh, strong: true };
    } else {
      if (!Number.isFinite(k) || !Number.isFinite(ck) || ck <= 0) return null;
      const h3o = Math.sqrt(k * ck);
      const pH = -Math.log10(h3o);
      const oh = 1e-14 / h3o;
      const pOH = -Math.log10(oh);
      return { ph: pH, pOH, h3o, oh, strong: false, ka: k };
    }
  }, [mode, phValue, ka, kaConc]);

  const phColor = results ? (results.ph < 3 ? 'error' : results.ph > 11 ? 'error' : results.ph < 7 ? 'warning' : 'success') : 'default';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FlaskConical className="h-5 w-5" aria-hidden="true" />
          pH-Rechner
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button variant={mode === 'ph' ? 'default' : 'outline'} size="sm" onClick={() => setMode('ph')}>
            pH → [H₃O⁺]
          </Button>
          <Button variant={mode === 'pOH' ? 'default' : 'outline'} size="sm" onClick={() => setMode('pOH')}>
            pOH → [OH⁻]
          </Button>
          <Button variant={mode === 'ka' ? 'default' : 'outline'} size="sm" onClick={() => setMode('ka')}>
            Schwache Säure (Kₐ)
          </Button>
        </div>

        {mode === 'ph' && (
          <div className="space-y-2">
            <Label htmlFor="ph-input">pH-Wert</Label>
            <Input id="ph-input" type="number" step="any" value={phValue} onChange={(e) => setPhValue(e.target.value)} />
          </div>
        )}

        {mode === 'pOH' && (
          <div className="space-y-2">
            <Label htmlFor="poh-input">pOH-Wert</Label>
            <Input id="poh-input" type="number" step="any" value={phValue} onChange={(e) => setPhValue(e.target.value)} />
          </div>
        )}

        {mode === 'ka' && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="ka-input">Kₐ (Säurekonstante)</Label>
              <Input id="ka-input" type="number" step="any" value={ka} onChange={(e) => setKa(e.target.value)} placeholder="z.B. 1.8e-5" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="ka-c">c (Konzentration, mol/L)</Label>
              <Input id="ka-c" type="number" step="any" value={kaConc} onChange={(e) => setKaConc(e.target.value)} />
            </div>
          </div>
        )}

        {results && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4" role="region" aria-label="pH-Ergebnisse">
            <InfoCard label="pH" value={results.ph.toFixed(4)} variant={phColor as 'success' | 'warning' | 'error' | 'default'} />
            <InfoCard label="pOH" value={results.pOH.toFixed(4)} />
            <InfoCard label="[H₃O⁺]" value={results.h3o.toExponential(2)} unit="M" />
            <InfoCard label="[OH⁻]" value={results.oh.toExponential(2)} unit="M" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Calculator() {
  return (
    <>
      <PageHeader
        title="Chemie-Rechner"
        description="Molare Masse, Gasgesetze, Konzentrationen und pH – alles offline im Browser berechnet."
        icon={<CalcIcon className="h-5 w-5" />}
      />
      <div className="space-y-6">
        <Tabs defaultValue="mass" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="mass">Molmasse</TabsTrigger>
            <TabsTrigger value="gas">Gasgesetze</TabsTrigger>
            <TabsTrigger value="conc">Konzentration</TabsTrigger>
            <TabsTrigger value="ph">pH</TabsTrigger>
          </TabsList>
          <TabsContent value="mass"><MolarMassCalculator /></TabsContent>
          <TabsContent value="gas"><GasLawCalculator /></TabsContent>
          <TabsContent value="conc"><ConcentrationCalculator /></TabsContent>
          <TabsContent value="ph"><PHCalculator /></TabsContent>
        </Tabs>
      </div>
    </>
  );
}
