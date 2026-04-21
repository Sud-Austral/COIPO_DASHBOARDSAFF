import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GlobalFilters } from '../../shared/types';

interface FilterState {
  filters: GlobalFilters;
  setFilter: <K extends keyof GlobalFilters>(key: K, value: GlobalFilters[K]) => void;
  resetFilters: () => void;
}

export const useFilterStore = create<FilterState>()(
  persist(
    (set) => ({
      filters: {
        anio: 2025,
        region: 'all',
        marco: 'all',
        analista: 'all',
        abogado: 'all',
      },
      setFilter: (key, value) => set((state) => ({
        filters: { ...state.filters, [key]: value }
      })),
      resetFilters: () => set({
        filters: {
          anio: 2025,
          region: 'all',
          marco: 'all',
          analista: 'all',
          abogado: 'all',
        }
      }),
    }),
    { name: 'dashboard-filters' }
  )
);
