import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// ---------------------------------------------------------------------------
// JSmol-Suchkomponente
// Erweitert die Seite um eine intelligente Suchmaske für beliebige konventionelle
// Moleküle. Nutzt (1) die PubChem-REST-API (3D-SDF, asynchron) und (2) als
// Fallback JSmols eingebauten Resolver `load "$[name]"`.
// Das bestehende react-three-fiber-Molekül-Viewer-Setup bleibt unangetastet.
// ---------------------------------------------------------------------------

// Minimaler Typ-Shim für das globale JSmol-Objekt (wird zur Laufzeit geladen).
interface JSmolApplet {
  _id: string;
  script?: (s: string) => void;
}
declare global {
  interface Window {
    Jmol?: any;
  }
}

// JSmol-Core + j2s-Übersetzungsbibliothek (offizieller JSmol-Demo-Server).
const JSMOL_SCRIPT_SRC = 'https://chemapps.stolaf.edu/jmol/jsmol/JSmol.min.nojq.js';
const JSMOL_J2S_PATH = 'https://chemapps.stolaf.edu/jmol/jsmol/j2s';

// Schanker clientseitiger Übersetzungs-Mapper: Deutsch -> Englisch.
// PubChem erwartet englische Namen; dieser Mapper vermeidet "No results"-Fehler.
const DE_EN: Record<string, string> = {
  wasser: 'water',
  wasserstoff: 'hydrogen',
  sauerstoff: 'oxygen',
  kohlenstoff: 'carbon',
  stickstoff: 'nitrogen',
  kohlendioxid: 'carbon dioxide',
  kohlenstoffdioxid: 'carbon dioxide',
  kohlenmonoxid: 'carbon monoxide',
  methan: 'methane',
  ethan: 'ethane',
  ethen: 'ethene',
  propan: 'propane',
  butan: 'butane',
  ammoniak: 'ammonia',
  ethinol: 'ethanol',
  ethanol: 'ethanol',
  methanol: 'methanol',
  benzol: 'benzene',
  toluol: 'toluene',
  phenol: 'phenol',
  koffein: 'caffeine',
  aspirin: 'aspirin',
  acetylsalicylsäure: 'aspirin',
  glukose: 'glucose',
  traubenzucker: 'glucose',
  zucker: 'sucrose',
  sackarose: 'sucrose',
  fructose: 'fructose',
  fructosestraube: 'fructose',
  essigsäure: 'acetic acid',
  ameisensäure: 'formic acid',
  zitronensäure: 'citric acid',
  harnstoff: 'urea',
  natriumchlorid: 'sodium chloride',
  kochsalz: 'sodium chloride',
  salzsäure: 'hydrogen chloride',
  schwefelsäure: 'sulfuric acid',
  salpetersäure: 'nitric acid',
  natronlauge: 'sodium hydroxide',
  salzsäuregase: 'hydrogen chloride',
  kaliumchlorid: 'potassium chloride',
  calciumcarbonat: 'calcium carbonate',
  chlorkalium: 'potassium chloride',
  magnesiumsulfat: 'magnesium sulfate',
  glycin: 'glycine',
  alanin: 'alanine',
  cholesterin: 'cholesterol',
  nikotin: 'nicotine',
  paracetamol: 'paracetamol',
  ibuprofen: 'ibuprofen',
  penicillin: 'penicillin',
  dna: 'deoxyribose',
  atp: 'adenosine triphosphate',
  adehyd: 'acetaldehyde'
};

const EXAMPLES = ['Koffein', 'Aspirin', 'Ethanol', 'Wasser', 'Kohlendioxid', 'Glukose'];

/** Lädt das JSmol-Skript genau einmal und löst mit dem globalen Jmol-Objekt auf. */
function ensureJSmol(): Promise<any> {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && window.Jmol) {
      resolve(window.Jmol);
      return;
    }
    const existing = document.getElementById('jsmol-core-script') as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => window.Jmol ? resolve(window.Jmol) : reject(new Error('JSmol load failed')));
      existing.addEventListener('error', () => reject(new Error('JSmol script error')));
      return;
    }
    const script = document.createElement('script');
    script.id = 'jsmol-core-script';
    script.src = JSMOL_SCRIPT_SRC;
    script.async = true;
    script.onload = () => (window.Jmol ? resolve(window.Jmol) : reject(new Error('JSmol not found after load')));
    script.onerror = () => reject(new Error('Konnte JSmol-Core nicht laden (Netzwerk?).'));
    document.head.appendChild(script);
  });
}

/** Holt ein 3D-MOL (SDF V2000/V3000) von der PubChem-REST-API – asynchron, blockiert nicht. */
async function fetchPubChem3D(query: string): Promise<string | null> {
  const enc = encodeURIComponent(query);
  const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${enc}/record/SDF/?record_type=3d`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return null;
    const text = await res.text();
    if (!/V2000|V3000/.test(text)) return null; // keine gültige MOL-Datei
    return text;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export default function JSmolSearch() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const appletRef = useRef<JSmolApplet | null>(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<{ kind: 'info' | 'error'; text: string } | null>(null);

  // JSmol ein初始化 (einmalig, asynchron, nicht blockierend).
  useEffect(() => {
    let cancelled = false;
    ensureJSmol()
      .then((Jmol) => {
        if (cancelled || !containerRef.current) return;
        const Info = {
          width: '100%',
          height: 420,
          use: 'HTML5',
          j2sPath: JSMOL_J2S_PATH,
          serverURL: 'https://chemapps.stolaf.edu/jmol/jsmol/php/jsmol.php',
          disableJ2SLoadMonitor: true,
          disableInitialConsole: true,
          addSelectionOptions: false,
          debug: false
        };
        const applet = Jmol.getApplet('jsmolApplet', Info);
        containerRef.current.innerHTML = Jmol.getAppletHtml(applet);
        appletRef.current = applet as unknown as JSmolApplet;
        setReady(true);
        setStatus({ kind: 'info', text: 'JSmol bereit. Geben Sie ein Molekül ein (z. B. „Koffein“).' });
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setStatus({ kind: 'error', text: err.message });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  /** Lädt ein Molekül: Primär PubChem (async), Fallback JSmol-Resolver. */
  const loadMolecule = async (raw: string) => {
    const q = raw.trim();
    if (!q) {
      setStatus({ kind: 'error', text: 'Bitte einen Molekülnamen eingeben.' });
      return;
    }
    const Jmol = window.Jmol;
    if (!Jmol || !appletRef.current) {
      setStatus({ kind: 'error', text: 'JSmol ist noch nicht bereit – bitte kurz warten.' });
      return;
    }
    setLoading(true);
    setStatus(null);
    try {
      // Lokalisierung: Deutsch -> Englisch (sonst unverändert durchreichen).
      const english = DE_EN[q.toLowerCase()] ?? q;
      const sdf = await fetchPubChem3D(english);
      if (sdf) {
        // Inline laden – kein Hauptthread-Blocking, da fetch bereits async war.
        Jmol.loadInline(appletRef.current, sdf);
        setStatus({
          kind: 'info',
          text: `„${q}“ → „${english}“ erfolgreich geladen (Quelle: PubChem 3D-SDF).`
        });
        return;
      }
      // Fallback: JSmols eingebauter Resolver (Name/SMILES/CAS).
      Jmol.script(appletRef.current, `load "$[${english}]"`);
      setStatus({
        kind: 'info',
        text: `„${q}“ via JSmol-Resolver („${english}“) angefordert.`
      });
    } catch (e) {
      setStatus({
        kind: 'error',
        text: `Molekül „${q}“ konnte weder über PubChem noch über den JSmol-Resolver gefunden werden.`
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void loadMolecule(query);
  };

  return (
    <div className="grid gap-6 md:grid-cols-[320px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Molekül-Suche</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <form onSubmit={onSubmit} className="flex flex-col gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Name, SMILES oder CAS (z. B. Koffein)"
              disabled={!ready}
              aria-label="Molekülname"
            />
            <Button type="submit" disabled={!ready || loading}>
              {loading ? 'Lade…' : 'Struktur laden'}
            </Button>
          </form>

          <div className="flex flex-wrap gap-1.5">
            {EXAMPLES.map((ex) => (
              <Button
                key={ex}
                type="button"
                variant="outline"
                size="sm"
                disabled={!ready || loading}
                onClick={() => {
                  setQuery(ex);
                  void loadMolecule(ex);
                }}
              >
                {ex}
              </Button>
            ))}
          </div>

          {status && (
            <p
              className={`text-sm ${
                status.kind === 'error' ? 'text-destructive' : 'text-muted-foreground'
              }`}
            >
              {status.text}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            JSmol 3D-Ansicht
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              (dynamisch aus PubChem / JSmol-Resolver)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            ref={containerRef}
            className="w-full overflow-hidden rounded-xl border bg-gradient-to-br from-slate-50 to-slate-200 dark:from-slate-900 dark:to-slate-800"
            style={{ minHeight: 420 }}
          />
          <p className="mt-3 text-sm text-muted-foreground">
            Ziehen zum Drehen, Scrollen zum Zoomen. Strukturen werden live aus externen Datenbanken
            nachgeladen – die Seite bleibt währenddessen bedienbar.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
