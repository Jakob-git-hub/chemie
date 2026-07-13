import { useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useChemistryStore } from '@/store/useChemistryStore';
import { Button } from '@/components/ui/button';
import { Moon, Sun, FlaskConical } from 'lucide-react';

const NAV = [
  { to: '/', label: 'Start' },
  { to: '/molecules', label: 'Moleküle' },
  { to: '/quiz', label: 'Quiz' },
  { to: '/thermo', label: 'Thermodynamik' },
  { to: '/jsmol', label: 'JSmol-Suche' }
];

export default function Layout() {
  const theme = useChemistryStore((s) => s.theme);
  const toggleTheme = useChemistryStore((s) => s.toggleTheme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <div className="app-gradient min-h-screen">
      <header className="border-b bg-background/70 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2 font-bold text-primary">
            <FlaskConical className="h-5 w-5" />
            Chemie-Labor
          </NavLink>
          <nav className="flex items-center gap-1">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-accent'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Theme wechseln">
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </nav>
        </div>
      </header>

      <main className="container py-8">
        <Outlet />
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        Interaktive Chemie-Lernplattform · lokal im Browser berechnet
      </footer>
    </div>
  );
}
