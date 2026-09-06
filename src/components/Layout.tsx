import { useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useChemistryStore } from '@/store/useChemistryStore';
import { Button } from '@/components/ui/button';
import { Moon, Sun, FlaskConical, Home, Atom, Boxes, HelpCircle, Calculator } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV = [
  { to: '/', label: 'Start', icon: Home },
  { to: '/periodic-table', label: 'Periodensystem', icon: Atom },
  { to: '/molecules', label: 'Moleküle', icon: Boxes },
  { to: '/calculator', label: 'Rechner', icon: Calculator },
  { to: '/quiz', label: 'Quiz', icon: HelpCircle }
];

export default function Layout() {
  const theme = useChemistryStore((s) => s.theme);
  const toggleTheme = useChemistryStore((s) => s.toggleTheme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const handleSkipToContent = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const main = document.getElementById('main-content');
    if (main) {
      main.setAttribute('tabindex', '-1');
      main.focus();
    }
  };

  return (
    <div className="app-gradient flex min-h-screen flex-col">
      <a
        href="#main-content"
        onClick={handleSkipToContent}
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Zum Hauptinhalt springen
      </a>

      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between gap-4">
          <NavLink to="/" className="flex items-center gap-2 font-bold" aria-label="Chemie-Labor Startseite">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-sm">
              <FlaskConical className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-lg text-transparent">
              Chemie-Labor
            </span>
          </NavLink>

          <nav className="flex items-center gap-1" aria-label="Hauptnavigation">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }: { isActive: boolean }) =>
                  cn(
                    'flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-foreground/80 hover:bg-accent hover:text-foreground'
                  )
                }
              >
                {({ isActive }: { isActive: boolean }) => (
                  <>
                    <item.icon className="h-4 w-4" aria-hidden="true" />
                    <span
                      className="hidden sm:inline"
                      aria-current={isActive ? 'page' : undefined}
                    >
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Zu hellem Modus wechseln' : 'Zu dunklem Modus wechseln'}
              className="ml-1"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Moon className="h-5 w-5" aria-hidden="true" />
              )}
            </Button>
          </nav>
        </div>
      </header>

      <main id="main-content" className="container flex-1 py-8" tabIndex={-1}>
        <Outlet />
      </main>

      <footer className="border-t border-border/60 py-6 text-center text-sm text-muted-foreground">
        Interaktive Chemie-Lernplattform · lokal im Browser berechnet
      </footer>
    </div>
  );
}
