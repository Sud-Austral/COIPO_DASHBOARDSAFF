import { Resolucion } from '../shared/types';
import { ANIOS, REGIONES, GRUPOS, ANALISTAS, ABOGADOS } from './constants';

function mulberry32(seed: number) {
  return function() {
    let t = seed += 0x6D2AE529;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function pickWeighted<T>(arr: T[], pesos: number[], rnd: () => number): T {
  const sum = pesos.reduce((a, b) => a + b, 0);
  let r = rnd() * sum;
  for (let i = 0; i < arr.length; i++) {
    r -= pesos[i];
    if (r <= 0) return arr[i];
  }
  return arr[arr.length - 1];
}

export function genDataset(): Resolucion[] {
  const rnd = mulberry32(42);
  const registros: Resolucion[] = [];
  let id = 100000;

  const basePorAnio: Record<number, number> = { 2021: 8200, 2022: 8900, 2023: 9600, 2024: 10400, 2025: 7800 };

  for (const anio of ANIOS) {
    const total = basePorAnio[anio];
    for (let i = 0; i < total; i++) {
      const regPesos = REGIONES.map((r) => {
        if (['VII','XVI','VIII','IX','XIV','X'].includes(r.cod)) return 12;
        if (['VI','RM','XI'].includes(r.cod)) return 6;
        return 3;
      });
      const reg = pickWeighted(REGIONES, regPesos, rnd);
      const grPesos = [15, 10, 8, 12, 6, 14, 9, 26];
      const grupo = pickWeighted(GRUPOS, grPesos, rnd);

      const diasIT = Math.round(10 + rnd() * 40);
      const diasIL = Math.round(5 + rnd() * 25);
      const diasVisado = Math.round(2 + rnd() * 12);
      const diasTotal = diasIT + diasIL + diasVisado;

      let fueraPlazo = false;
      if (grupo.plazo != null) {
        const efectivo = grupo.tipo === 'Hábil' ? diasTotal * (5/7) : diasTotal;
        if (efectivo > grupo.plazo) fueraPlazo = true;
        if (['XII','XI','III'].includes(reg.cod) && rnd() < 0.25) fueraPlazo = true;
      }

      const superficie = grupo.id === 'DS_490' ? 0 :
        Math.round((5 + rnd() * 180) * 100) / 100;
      const monto = grupo.id === 'BONOS_BN'
        ? Math.round((2_000_000 + rnd() * 18_000_000))
        : 0;

      const estadoRnd = rnd();
      const estado: Resolucion['estado'] = estadoRnd < 0.82 ? 'Aprobado' : (estadoRnd < 0.91 ? 'Rechazado' : 'Con observaciones');

      registros.push({
        id: id++,
        anio,
        region: reg.cod,
        regionNombre: reg.nombre,
        marco: grupo.marco,
        grupo: grupo.id,
        grupoNombre: grupo.nombre,
        analista: ANALISTAS[Math.floor(rnd() * ANALISTAS.length)],
        abogado: ABOGADOS[Math.floor(rnd() * ABOGADOS.length)],
        diasIT, diasIL, diasVisado, diasTotal,
        plazoDias: grupo.plazo,
        fueraPlazo,
        superficie,
        monto,
        estado,
      });
    }
  }
  return registros;
}
