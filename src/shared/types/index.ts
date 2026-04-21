export type MarcoNormativo = 'DL 701' | 'Ley 20.283' | 'DS 490';

export interface Region {
  cod: string;
  nombre: string;
  lat?: number;
}

export interface Grupo {
  id: string;
  marco: MarcoNormativo;
  nombre: string;
  plazo: number | null;
  tipo: 'Corrido' | 'Hábil' | '—';
}

export interface Resolucion {
  id: number;
  anio: number;
  region: string;
  regionNombre: string;
  marco: MarcoNormativo;
  grupo: string;
  grupoNombre: string;
  analista: string;
  abogado: string;
  diasIT: number;
  diasIL: number;
  diasVisado: number;
  diasTotal: number;
  plazoDias: number | null;
  fueraPlazo: boolean;
  superficie: number;
  monto: number;
  estado: 'Aprobado' | 'Rechazado' | 'Con observaciones';
}

export interface KPIStats {
  total: number;
  porMarco: Record<MarcoNormativo, number>;
  bonos: number;
  montoBonos: number;
  superficie: number;
  fueraPlazo: number;
  conPlazo: number;
  pctIncumplimiento: number;
  pctCumplimiento: number;
  analistasCount: number;
  abogadosCount: number;
}

export interface GlobalFilters {
  anio: number | 'all';
  region: string | 'all';
  marco: MarcoNormativo | 'all';
  analista: string | 'all';
  abogado: string | 'all';
}
