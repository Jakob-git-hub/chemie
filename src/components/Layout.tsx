import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useChemistryStore } from '@/store/useChemistryStore';
import { Button } from '@/components/ui/button';
import { Moon, Sun, FlaskConical, Home, Atom, Boxes, HelpCircle, Calculator, Menu, X, Command } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SettingsPanel, SettingsButton } from '@/components/SettingsPanel';

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
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileNavOpen(false);
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [mobileNavOpen]);

  const handleSkipToContent = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const main = document.getElementById('main-content');
    if (main) {
      main.setAttribute('tabindex', '-1');
      main.focus();
    }
  };

  return (
    <div className="app-gradient relative flex min-h-screen flex-col">
      <div className="app-shell absolute inset-0" aria-hidden="true" />
      <a
        href="#main-content"
        onClick={handleSkipToContent}
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Zum Hauptinhalt springen
      </a>

      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/75 backdrop-blur-xl">
        <div className="container flex min-h-[4.75rem] items-center justify-between gap-4">
          <NavLink to="/" className="flex items-center gap-2 font-bold" aria-label="Chemie-Labor Startseite">
            <span className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-foreground text-background shadow-lg">
              <FlaskConical className="h-5 w-5" aria-hidden="true" />
              <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-accent ring-2 ring-background" />
            </span>
            <span>
              <span className="block text-[0.95rem] font-bold tracking-tight">Chemie-Labor</span>
              <span className="hidden text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground sm:block">
                Entdecken statt auswendig lernen
              </span>
            </span>
          </NavLink>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Hauptnavigation">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }: { isActive: boolean }) =>
                  cn(
                    'flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground/75 hover:bg-muted hover:text-foreground'
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
            <div className="hidden items-center gap-1 rounded-lg border border-border bg-muted/40 px-2 py-1.5 text-[11px] text-muted-foreground lg:flex">
              <Command className="h-3 w-3" />
              <span>Lokales Labor</span>
            </div>
            <SettingsButton
              onClick={() => {
                setMobileNavOpen(false);
                setSettingsOpen(true);
              }}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Zu hellem Modus wechseln' : 'Zu dunklem Modus wechseln'}
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Moon className="h-5 w-5" aria-hidden="true" />
              )}
            </Button>
          </nav>
          <div className="flex items-center gap-1 md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileNavOpen((open) => !open)}
              aria-label={mobileNavOpen ? 'Navigation schließen' : 'Navigation öffnen'}
              aria-expanded={mobileNavOpen}
              aria-controls="mobile-navigation"
            >
              {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Zu hellem Modus wechseln' : 'Zu dunklem Modus wechseln'}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
        </div>
        {mobileNavOpen && (
          <nav
            id="mobile-navigation"
            className="border-t border-border/60 px-4 pb-3 pt-2 md:hidden"
            aria-label="Mobile Hauptnavigation"
          >
            <div className="grid gap-1">
              {NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  onClick={() => setMobileNavOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-foreground/80 hover:bg-muted hover:text-foreground'
                    )
                  }
                >
                  <item.icon className="h-4 w-4" aria-hidden="true" />
                  {item.label}
                </NavLink>
              ))}
              <SettingsButton onClick={() => setSettingsOpen(true)} />
            </div>
          </nav>
        )}
      </header>

      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />

      <main id="main-content" className="container relative z-10 flex-1 py-8 sm:py-10" tabIndex={-1}>
        <Outlet />
      </main>

      <footer className="relative z-10 border-t border-border/60 bg-background/40 py-6 text-center text-xs text-muted-foreground">
        Interaktive Chemie-Lernplattform <span className="mx-1 text-primary">•</span> lokal im Browser berechnet
      </footer>
    </div>
  );
}
