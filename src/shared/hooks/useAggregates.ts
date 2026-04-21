import { useMemo } from 'react';
import { Resolucion, GlobalFilters } from '../types';

export const useAggregates = (data: Resolucion[] | undefined, filters: GlobalFilters) => {
  return useMemo(() => {
    if (!data) return [];
    
    return data.filter((r) => {
      if (filters.anio !== 'all' && r.anio !== filters.anio) return false;
      if (filters.region !== 'all' && r.region !== filters.region) return false;
      if (filters.marco !== 'all' && r.marco !== filters.marco) return false;
      if (filters.analista !== 'all' && r.analista !== filters.analista) return false;
      if (filters.abogado !== 'all' && r.abogado !== filters.abogado) return false;
      return true;
    });
  }, [data, filters]);
};
