import { useMemo } from 'react';
import { Resolucion, KPIStats, MarcoNormativo } from '../types';

export const useKpis = (rows: Resolucion[]): KPIStats => {
  return useMemo(() => {
    const total = rows.length;
    const porMarco: Record<MarcoNormativo, number> = { 'DL 701': 0, 'Ley 20.283': 0, 'DS 490': 0 };
    let bonos = 0;
    let montoBonos = 0;
    let superficie = 0;
    let fueraPlazo = 0;
    let conPlazo = 0;
    const analistas = new Set<string>();
    const abogados = new Set<string>();

    for (const r of rows) {
      porMarco[r.marco]++;
      if (r.grupo === 'BONOS_BN') {
        bonos++;
        montoBonos += r.monto;
      }
      superficie += r.superficie;
      if (r.plazoDias != null) {
        conPlazo++;
        if (r.fueraPlazo) fueraPlazo++;
      }
      analistas.add(r.analista);
      abogados.add(r.abogado);
    }

    const pctIncumplimiento = conPlazo ? (fueraPlazo / conPlazo * 100) : 0;
    const pctCumplimiento = conPlazo ? ((conPlazo - fueraPlazo) / conPlazo * 100) : 100;

    return {
      total,
      porMarco,
      bonos,
      montoBonos,
      superficie: Math.round(superficie),
      fueraPlazo,
      conPlazo,
      pctIncumplimiento,
      pctCumplimiento,
      analistasCount: analistas.size,
      abogadosCount: abogados.size,
    };
  }, [rows]);
};
