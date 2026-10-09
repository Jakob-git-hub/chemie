import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ChemistryState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  // Favorites & History
  favorites: string[];
  searchHistory: string[];
  addToFavorites: (formula: string) => void;
  removeFromFavorites: (formula: string) => void;
  isFavorite: (formula: string) => boolean;
  addToHistory: (query: string) => void;
  clearHistory: () => void;
}

export const useChemistryStore = create<ChemistryState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      toggleTheme: () => set((s) => ({ theme: s.theme === 'light' ? 'dark' : 'light' })),

      // Favorites & History
      favorites: [],
      searchHistory: [],
      addToFavorites: (formula) => {
        const { favorites } = get();
        if (!favorites.includes(formula)) {
          set({ favorites: [...favorites, formula] });
        }
      },
      removeFromFavorites: (formula) => {
        set((s) => ({ favorites: s.favorites.filter((f) => f !== formula) }));
      },
      isFavorite: (formula) => {
        return get().favorites.includes(formula);
      },
      addToHistory: (query) => {
        const trimmed = query.trim();
        if (!trimmed) return;
        const { searchHistory } = get();
        const filtered = searchHistory.filter((h) => h !== trimmed);
        set({ searchHistory: [trimmed, ...filtered].slice(0, 20) });
      },
      clearHistory: () => {
        set({ searchHistory: [] });
      },
    }),
    {
      name: 'chemistry-store',
      // Only persist user preferences and local saved work.
      partialize: (state) => ({
        theme: state.theme,
        favorites: state.favorites,
        searchHistory: state.searchHistory
      })
    }
  )
);
