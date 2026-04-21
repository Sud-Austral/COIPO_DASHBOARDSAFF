import { Region, Grupo, MarcoNormativo } from '../shared/types';

export const REGIONES: Region[] = [
  { cod: 'III',  nombre: 'Atacama',       lat: -27.4 },
  { cod: 'IV',   nombre: 'Coquimbo',      lat: -29.9 },
  { cod: 'V',    nombre: 'Valparaíso',    lat: -33.0 },
  { cod: 'RM',   nombre: 'Metropolitana', lat: -33.5 },
  { cod: 'VI',   nombre: "O'Higgins",     lat: -34.2 },
  { cod: 'VII',  nombre: 'Maule',         lat: -35.4 },
  { cod: 'XVI',  nombre: 'Ñuble',         lat: -36.6 },
  { cod: 'VIII', nombre: 'Biobío',        lat: -37.0 },
  { cod: 'IX',   nombre: 'Araucanía',     lat: -38.7 },
  { cod: 'XIV',  nombre: 'Los Ríos',      lat: -39.8 },
  { cod: 'X',    nombre: 'Los Lagos',     lat: -41.5 },
  { cod: 'XI',   nombre: 'Aysén',         lat: -45.4 },
  { cod: 'XII',  nombre: 'Magallanes',    lat: -53.2 },
];

export const GRUPOS: Grupo[] = [
  { id: 'AVISO_701',      marco: 'DL 701',      nombre: 'Aviso ejecución faenas',       plazo: null, tipo: '—'      },
  { id: 'PM_NM_701',      marco: 'DL 701',      nombre: 'Planes y normas de manejo',    plazo: 120,  tipo: 'Corrido' },
  { id: 'OTROS_701',      marco: 'DL 701',      nombre: 'Otros (calificación, etc.)',   plazo: 60,   tipo: 'Corrido' },
  { id: 'AVISO_BN',       marco: 'Ley 20.283',  nombre: 'Avisos e informes BN',         plazo: 60,   tipo: 'Hábil'   },
  { id: 'BONOS_BN',       marco: 'Ley 20.283',  nombre: 'Bonificaciones Art. 22',       plazo: 90,   tipo: 'Hábil'   },
  { id: 'PM_NM_20283',    marco: 'Ley 20.283',  nombre: 'Planes y normas 20.283',       plazo: 90,   tipo: 'Hábil'   },
  { id: 'OTROS_BN',       marco: 'Ley 20.283',  nombre: 'Otros bosque nativo',          plazo: 60,   tipo: 'Hábil'   },
  { id: 'DS_490',         marco: 'DS 490',      nombre: 'Control productos forestales', plazo: null, tipo: '—'      },
];

export const ANIOS = [2021, 2022, 2023, 2024, 2025];

export const ANALISTAS = [
  'P. Araya',   'M. Benítez', 'C. Cárdenas', 'L. Díaz',    'R. Espinoza',
  'T. Fuentes', 'G. González','S. Henríquez','N. Inostroza','V. Jara',
  'E. Köhler',  'D. Lagos',   'A. Morales',  'B. Navarro',
];

export const ABOGADOS = [
  'Abg. Acosta', 'Abg. Bravo',  'Abg. Cortés', 'Abg. Donoso',
  'Abg. Errázuriz','Abg. Figueroa','Abg. Guzmán','Abg. Hurtado',
];

export const MARCO_COLORS: Record<MarcoNormativo, string> = {
  'DL 701':     '#2d4a34',
  'Ley 20.283': '#6b8c5a',
  'DS 490':     '#b8a878',
};
