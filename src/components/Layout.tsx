import { useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useChemistryStore } from '@/store/useChemistryStore';
import { Button } from '@/components/ui/button';
import { Moon, Sun, FlaskConical, Home, Atom, Boxes, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV = [
  { to: '/', label: 'Start', icon: Home },
  { to: '/periodic-table', label: 'Periodensystem', icon: Atom },
  { to: '/molecules', label: 'Moleküle', icon: Boxes },
  { to: '/quiz', label: 'Quiz', icon: HelpCircle }
];

export default function Layout() {
  const theme = useChemistryStore((s) => s.theme);
  const toggleTheme = useChemistryStore((s) => s.toggleTheme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <div className="app-gradient flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between gap-4">
          <NavLink to="/" className="flex items-center gap-2 font-bold">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-sm">
              <FlaskConical className="h-5 w-5" />
            </span>
            <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-lg text-transparent">
              Chemie-Labor
            </span>
          </NavLink>

          <nav className="flex items-center gap-1">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-foreground/80 hover:bg-accent hover:text-accent-foreground'
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </NavLink>
            ))}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label="Theme wechseln"
              className="ml-1"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </nav>
        </div>
      </header>

      <main className="container flex-1 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-border/60 py-6 text-center text-sm text-muted-foreground">
        Interaktive Chemie-Lernplattform · lokal im Browser berechnet
      </footer>
    </div>
  );
}
