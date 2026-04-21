import { useQuery } from '@tanstack/react-query';
import { genDataset } from '../../mocks/data';
import { Resolucion } from '../types';

// Simulamos una demora de red para que TanStack Query tenga sentido (Skeletons, etc.)
const fetchResoluciones = async (): Promise<Resolucion[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(genDataset());
    }, 400);
  });
};

export const useResoluciones = () => {
  return useQuery({
    queryKey: ['resoluciones'],
    queryFn: fetchResoluciones,
    staleTime: 1000 * 60 * 10, // 10 minutos
  });
};
