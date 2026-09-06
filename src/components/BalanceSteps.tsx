import { useState, useMemo } from 'react';
import { ArrowRight, CheckCircle2, XCircle, AlertTriangle, Scale } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { parseFormula, balanceEquation } from '@/lib/chem';
import { cn } from '@/lib/utils';

interface Step {
  title: string;
  description: string;
  type: 'info' | 'success' | 'error' | 'step';
}

interface BalanceStepsProps {
  equation: string;
}

export function BalanceSteps({ equation }: BalanceStepsProps) {
  const steps = useMemo((): Step[] => {
    if (!equation.trim()) return [];

    const result: Step[] = [];

    // Step 1: Parse the equation
    result.push({
      title: 'Gleichung analysieren',
      description: `Eingabe: ${equation.trim()}`,
      type: 'info'
    });

    const sides = equation.split(/\s*(?:->|→|=>|=)\s*/);
    if (sides.length !== 2) {
      result.push({
        title: 'Fehler',
        description: 'Trenne Edukte und Produkte mit "->" (oder "=", "→").',
        type: 'error'
      });
      return result;
    }

    const [lhs, rhs] = sides.map((s) => s.trim());
    const splitSpecies = (s: string) => s.split(/\s*\+\s*/).map((x) => x.trim()).filter(Boolean);
    const reactants = splitSpecies(lhs);
    const products = splitSpecies(rhs);

    // Step 2: Parse each species
    result.push({
      title: 'Spezies identifizieren',
      description: `Edukte: ${reactants.join(' + ')} | Produkte: ${products.join(' + ')}`,
      type: 'info'
    });

    // Step 3: Count atoms for each element
    const species = [...reactants, ...products];
    const parsed = species.map((sp) => ({ species: sp, parsed: parseFormula(sp) }));

    const failedParse = parsed.find((p) => !p.parsed.ok);
    if (failedParse) {
      result.push({
        title: 'Fehler beim Parsen',
        description: `Ungültige Formel: ${failedParse.species} — ${failedParse.parsed.ok ? '' : (failedParse.parsed as { error: string }).error}`,
        type: 'error'
      });
      return result;
    }

    // Step 4: List elements
    const elements = [...new Set(
      parsed.flatMap((p) => (p.parsed.ok ? Object.keys((p.parsed as { counts: Record<string, number> }).counts) : []))
    )].sort();

    result.push({
      title: 'Atome identifizieren',
      description: `Elemente in der Gleichung: ${elements.join(', ')}`,
      type: 'info'
    });

    // Step 5: Show initial atom counts
    const showAtomCounts = () => {
      const lines: string[] = [];
      for (const el of elements) {
        const reactantCounts = reactants.map((r, i) => {
          const p = parsed[i];
          return (p.parsed.ok ? (p.parsed as { counts: Record<string, number> }).counts[el] || 0 : 0);
        });
        const productCounts = products.map((p, i) => {
          const idx = reactants.length + i;
          const pp = parsed[idx];
          return (pp.parsed.ok ? (pp.parsed as { counts: Record<string, number> }).counts[el] || 0 : 0);
        });

        const rTotal = reactantCounts.reduce((a, b) => a + b, 0);
        const pTotal = productCounts.reduce((a, b) => a + b, 0);
        const balanced = rTotal === pTotal ? '✓' : '✗';

        lines.push(`${el}: ${rTotal} ${reactants.map((r, i) => `${reactantCounts[i]}${r}`).join(' + ')} → ${productCounts.map((p, i) => `${productCounts[i]}${products[i]}`).join(' + ')} ${balanced}`);
      }
      return lines.join('\n');
    };

    result.push({
      title: 'Atombilanz (vor Ausgleich)',
      description: showAtomCounts(),
      type: 'info'
    });

    // Step 6: Try to balance
    const balanceResult = balanceEquation(equation);

    if (!balanceResult.ok) {
      result.push({
        title: 'Ausgleich fehlgeschlagen',
        description: balanceResult.error,
        type: 'error'
      });
      return result;
    }

    // Step 7: Show the solution process
    result.push({
      title: 'Koeffizienten gefunden',
      description: `Stöchiometrische Koeffizienten: ${balanceResult.coeffs.join(' : ')}`,
      type: 'info'
    });

    // Step 8: Final balanced equation
    result.push({
      title: 'Ausgeglichene Gleichung',
      description: balanceResult.balanced,
      type: 'success'
    });

    // Step 9: Verify balance
    const verifyResult = verifyBalance(parsed, balanceResult.coeffs, reactants.length);
    result.push({
      title: 'Verifizierung',
      description: verifyResult,
      type: 'success'
    });

    return result;
  }, [equation]);

  if (!equation.trim()) return null;

  return (
    <div className="space-y-2" role="list" aria-label="Schritte zum Ausgleich der Gleichung">
      {steps.map((step, index) => (
        <div
          key={index}
          role="listitem"
          className={cn(
            'flex gap-3 rounded-lg border p-3 text-sm',
            step.type === 'success' && 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30',
            step.type === 'error' && 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30',
            step.type === 'info' && 'border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30',
            step.type === 'step' && 'border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30'
          )}
        >
          <div className="mt-0.5">
            {step.type === 'success' && <CheckCircle2 className="h-4 w-4 text-green-600" aria-hidden="true" />}
            {step.type === 'error' && <XCircle className="h-4 w-4 text-red-600" aria-hidden="true" />}
            {step.type === 'info' && <AlertTriangle className="h-4 w-4 text-blue-600" aria-hidden="true" />}
            {step.type === 'step' && <Scale className="h-4 w-4 text-amber-600" aria-hidden="true" />}
          </div>
          <div className="flex-1">
            <div className="font-medium">{step.title}</div>
            <div
              className={cn(
                'mt-1 whitespace-pre-wrap font-mono text-xs',
                step.type === 'success' && 'text-green-700 dark:text-green-300',
                step.type === 'error' && 'text-red-700 dark:text-red-300',
                step.type === 'info' && 'text-blue-700 dark:text-blue-300',
                step.type === 'step' && 'text-amber-700 dark:text-amber-300'
              )}
            >
              {step.description}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function verifyBalance(
  parsed: { species: string; parsed: { ok: true; counts: Record<string, number> } | { ok: false } }[],
  coeffs: number[],
  reactantCount: number
): string {
  const elements = [...new Set(parsed.flatMap((p) => (p.parsed.ok ? Object.keys(p.parsed.counts) : [])))].sort();
  const checks: string[] = [];

  let allBalanced = true;
  for (const el of elements) {
    let left = 0;
    let right = 0;

    for (let i = 0; i < reactantCount; i++) {
      if (parsed[i].parsed.ok) {
        left += ((parsed[i].parsed as { ok: true; counts: Record<string, number> }).counts[el] || 0) * coeffs[i];
      }
    }
    for (let i = reactantCount; i < parsed.length; i++) {
      if (parsed[i].parsed.ok) {
        right += ((parsed[i].parsed as { ok: true; counts: Record<string, number> }).counts[el] || 0) * coeffs[i];
      }
    }

    const balanced = left === right;
    if (!balanced) allBalanced = false;
    checks.push(`${el}: ${left} = ${right} ${balanced ? '✓' : '✗'}`);
  }

  return allBalanced ? `Alle Atome ausgeglichen ✓\n${checks.join('\n')}` : `Nicht alle Atome ausgeglichen\n${checks.join('\n')}`;
}

// ─── Main Equation Balancer Component ─────────────────────────────────────────
interface EquationBalancerProps {
  onBalance?: (equation: string) => void;
}

export function EquationBalancer({ onBalance }: EquationBalancerProps) {
  const [equation, setEquation] = useState('');
  const [showSteps, setShowSteps] = useState(false);

  const result = useMemo(() => {
    if (!equation.trim()) return null;
    return balanceEquation(equation);
  }, [equation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSteps(true);
    onBalance?.(equation);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEquation(e.target.value);
    setShowSteps(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="h-5 w-5" aria-hidden="true" />
          Schritt-für-Schritt Reaktionsausgleich
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="balance-equation">Reaktionsgleichung</Label>
            <Input
              id="balance-equation"
              value={equation}
              onChange={handleInputChange}
              placeholder="z.B. H2 + O2 -> H2O"
              className="font-mono"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="submit">Gleichung ausgleichen</Button>
            {result?.ok && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowSteps(!showSteps)}
              >
                {showSteps ? 'Schritte ausblenden' : 'Schritte anzeigen'}
              </Button>
            )}
          </div>
        </form>

        {/* Quick examples */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Beispiele zum Ausprobieren:</p>
          <div className="flex flex-wrap gap-1.5">
            {EXAMPLES.map((ex) => (
              <Button
                key={ex}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setEquation(ex);
                  setShowSteps(true);
                }}
                className="font-mono text-xs"
              >
                {ex}
              </Button>
            ))}
          </div>
        </div>

        {/* Result display */}
        {result?.ok && (
          <div className="rounded-lg border-2 border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950/30">
            <div className="text-sm font-medium text-green-800 dark:text-green-200">
              Ausgeglichene Gleichung:
            </div>
            <div className="mt-1 font-mono text-xl font-bold text-green-700 dark:text-green-300">
              {result.balanced}
            </div>
          </div>
        )}

        {result && !result.ok && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30">
            <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
              <XCircle className="h-4 w-4" aria-hidden="true" />
              <span className="font-medium">Ausgleich fehlgeschlagen</span>
            </div>
            <p className="mt-1 text-sm text-red-700 dark:text-red-300">{result.error}</p>
          </div>
        )}

        {/* Step-by-step visualization */}
        {showSteps && equation.trim() && <BalanceSteps equation={equation} />}
      </CardContent>
    </Card>
  );
}

const EXAMPLES = [
  'H2 + O2 -> H2O',
  'Fe + O2 -> Fe2O3',
  'CH4 + O2 -> CO2 + H2O',
  'N2 + H2 -> NH3',
  'C3H8 + O2 -> CO2 + H2O'
];
