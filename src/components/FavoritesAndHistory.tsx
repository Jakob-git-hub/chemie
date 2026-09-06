import { useState } from 'react';
import { Heart, History, Trash2, Search, Star, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useChemistryStore } from '@/store/useChemistryStore';
import { cn } from '@/lib/utils';

interface FavoritesAndHistoryProps {
  onSelectMolecule: (formula: string) => void;
  onSelectEquation: (equation: string) => void;
}

export function FavoritesAndHistory({ onSelectMolecule, onSelectEquation }: FavoritesAndHistoryProps) {
  const {
    favorites,
    searchHistory,
    removeFromFavorites,
    clearHistory,
    isFavorite,
    addToFavorites
  } = useChemistryStore();

  const [favoritesOpen, setFavoritesOpen] = useState(true);
  const [historyOpen, setHistoryOpen] = useState(true);

  const isEquation = (query: string) => query.includes('->') || query.includes('→') || query.includes('=');

  const handleSelect = (query: string) => {
    if (isEquation(query)) {
      onSelectEquation(query);
    } else {
      onSelectMolecule(query);
    }
  };

  return (
    <div className="space-y-3">
      {/* Favorites */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Star className="h-4 w-4 text-yellow-500" aria-hidden="true" />
              Favoriten
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFavoritesOpen(!favoritesOpen)}
              aria-expanded={favoritesOpen}
              aria-label={favoritesOpen ? 'Favoriten einklappen' : 'Favoriten ausklappen'}
            >
              {favoritesOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>
        {favoritesOpen && (
          <CardContent className="pt-0">
            {favorites.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Noch keine Favoriten. Suche nach Molekülen und klicke auf den Stern, um sie hier zu speichern.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {favorites.map((fav) => (
                  <div
                    key={fav}
                    className="group flex items-center gap-1 rounded-lg border border-yellow-200 bg-yellow-50 px-2 py-1 text-sm dark:border-yellow-900 dark:bg-yellow-950/30"
                  >
                    <Star
                      className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500"
                      aria-hidden="true"
                    />
                    <button
                      type="button"
                      onClick={() => handleSelect(fav)}
                      className="font-mono hover:underline"
                    >
                      {fav}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeFromFavorites(fav)}
                      className="ml-1 opacity-0 transition-opacity group-hover:opacity-100"
                      aria-label={`${fav} aus Favoriten entfernen`}
                    >
                      <X className="h-3.5 w-3.5 text-muted-foreground hover:text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Search History */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm">
              <History className="h-4 w-4 text-blue-500" aria-hidden="true" />
              Letzte Suchen
            </CardTitle>
            <div className="flex items-center gap-1">
              {searchHistory.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearHistory}
                  aria-label="Verlauf löschen"
                  className="text-xs"
                >
                  <Trash2 className="mr-1 h-3 w-3" />
                  Löschen
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setHistoryOpen(!historyOpen)}
                aria-expanded={historyOpen}
                aria-label={historyOpen ? 'Verlauf einklappen' : 'Verlauf ausklappen'}
              >
                {historyOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        {historyOpen && (
          <CardContent className="pt-0">
            {searchHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Noch kein Suchverlauf.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((item, index) => (
                  <button
                    key={`${item}-${index}`}
                    type="button"
                    onClick={() => handleSelect(item)}
                    className={cn(
                      'flex items-center gap-1 rounded-lg border px-2 py-1 text-sm transition-colors hover:bg-accent',
                      isEquation(item)
                        ? 'border-blue-200 dark:border-blue-900'
                        : 'border-muted'
                    )}
                  >
                    <Search className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                    <span className="font-mono">{item}</span>
                    {isEquation(item) && (
                      <span className="ml-1 text-[10px] text-blue-500">→</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}

// ─── Favorite Button for Molecules Page ──────────────────────────────────────────
export function FavoriteButton({ formula }: { formula: string }) {
  const { isFavorite, addToFavorites, removeFromFavorites } = useChemistryStore();
  const favorite = isFavorite(formula);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (favorite) {
      removeFromFavorites(formula);
    } else {
      addToFavorites(formula);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="rounded-lg p-1.5 transition-colors hover:bg-accent"
      aria-label={favorite ? ` ${formula} aus Favoriten entfernen` : `${formula} zu Favoriten hinzufügen`}
      title={favorite ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
    >
      <Heart
        className={cn(
          'h-5 w-5 transition-colors',
          favorite
            ? 'fill-red-500 text-red-500'
            : 'text-muted-foreground hover:text-red-500'
        )}
        aria-hidden="true"
      />
    </button>
  );
}
