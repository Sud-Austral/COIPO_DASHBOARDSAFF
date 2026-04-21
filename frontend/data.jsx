// Mock data generator — coherent, deterministic (seeded PRNG)
// Unidad de Fiscalización Forestal (SAF) — 2021-2025

const REGIONES = [
  { cod: 'III', nombre: 'Atacama', lat: -27.4 },
  { cod: 'IV', nombre: 'Coquimbo', lat: -29.9 },
  { cod: 'V', nombre: 'Valparaíso', lat: -33.0 },
  { cod: 'RM', nombre: 'Metropolitana', lat: -33.5 },
  { cod: 'VI', nombre: "O'Higgins", lat: -34.2 },
  { cod: 'VII', nombre: 'Maule', lat: -35.4 },
  { cod: 'XVI', nombre: 'Ñuble', lat: -36.6 },

  { cod: 'VIII', nombre: 'Biobío', lat: -37.0 },
  { cod: 'IX', nombre: 'Araucanía', lat: -38.7 },
  { cod: 'XIV', nombre: 'Los Ríos', lat: -39.8 },
  { cod: 'X', nombre: 'Los Lagos', lat: -41.5 },
  { cod: 'XI', nombre: 'Aysén', lat: -45.4 },
  { cod: 'XII', nombre: 'Magallanes', lat: -53.2 },
];

const GRUPOS = [
  { id: 'AVISO_701', marco: 'DL 701', nombre: 'Aviso ejecución faenas', plazo: null, tipo: '—' },
  { id: 'PM_NM_701', marco: 'DL 701', nombre: 'Planes y normas de manejo', plazo: 120, tipo: 'Corrido' },
  { id: 'OTROS_701', marco: 'DL 701', nombre: 'Otros (calificación, etc.)', plazo: 60, tipo: 'Corrido' },
  { id: 'AVISO_BN', marco: 'Ley 20.283', nombre: 'Avisos e informes BN', plazo: 60, tipo: 'Hábil' },
  { id: 'BONOS_BN', marco: 'Ley 20.283', nombre: 'Bonificaciones Art. 22', plazo: 90, tipo: 'Hábil' },
  { id: 'PM_NM_20283', marco: 'Ley 20.283', nombre: 'Planes y normas 20.283', plazo: 90, tipo: 'Hábil' },
  { id: 'OTROS_BN', marco: 'Ley 20.283', nombre: 'Otros bosque nativo', plazo: 60, tipo: 'Hábil' },
  { id: 'DS_490', marco: 'DS 490', nombre: 'Control productos forestales', plazo: null, tipo: '—' },
];

const ANIOS = [2021, 2022, 2023, 2024, 2025];

const ANALISTAS = [
  'P. Araya', 'M. Benítez', 'C. Cárdenas', 'L. Díaz', 'R. Espinoza',
  'T. Fuentes', 'G. González', 'S. Henríquez', 'N. Inostroza', 'V. Jara',
  'E. Köhler', 'D. Lagos', 'A. Morales', 'B. Navarro',
];
const ABOGADOS = [
  'Abg. Acosta', 'Abg. Bravo', 'Abg. Cortés', 'Abg. Donoso',
  'Abg. Errázuriz', 'Abg. Figueroa', 'Abg. Guzmán', 'Abg. Hurtado',
];

// Mulberry32 PRNG — reproducible mock data
function mulberry32(seed) {
  return function () {
    let t = seed += 0x6D2AE529;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function genDataset() {
  const rnd = mulberry32(42);
  const registros = [];
  let id = 100000;

  // Volumen base por año (tendencia creciente leve)
  const basePorAnio = { 2021: 8200, 2022: 8900, 2023: 9600, 2024: 10400, 2025: 7800 };

  for (const anio of ANIOS) {
    const total = basePorAnio[anio];
    for (let i = 0; i < total; i++) {
      // peso por región (centro-sur concentra)
      const regPesos = REGIONES.map((r, idx) => {
        if (['VII', 'XVI', 'VIII', 'IX', 'XIV', 'X'].includes(r.cod)) return 12;
        if (['VI', 'RM', 'XI'].includes(r.cod)) return 6;
        return 3;
      });
      const reg = pickWeighted(REGIONES, regPesos, rnd);
      // peso por grupo
      const grPesos = [15, 10, 8, 12, 6, 14, 9, 26]; // DS 490 ~26%
      const grupo = pickWeighted(GRUPOS, grPesos, rnd);

      const diasIT = Math.round(10 + rnd() * 40);
      const diasIL = Math.round(5 + rnd() * 25);
      const diasVisado = Math.round(2 + rnd() * 12);
      const diasTotal = diasIT + diasIL + diasVisado;

      let fueraPlazo = 0;
      if (grupo.plazo != null) {
        const efectivo = grupo.tipo === 'Hábil' ? diasTotal * (5 / 7) : diasTotal;
        if (efectivo > grupo.plazo) fueraPlazo = 1;
        // Some regions run late more often
        if (['XII', 'XI', 'III'].includes(reg.cod) && rnd() < 0.25) fueraPlazo = 1;
      }

      // Bonificaciones sólo en BONOS_BN
      const superficie = grupo.id === 'DS_490' ? 0 :
        Math.round((5 + rnd() * 180) * 100) / 100;
      const monto = grupo.id === 'BONOS_BN'
        ? Math.round((2_000_000 + rnd() * 18_000_000))
        : 0;

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
        estado: rnd() < 0.82 ? 'Aprobado' : (rnd() < 0.6 ? 'Rechazado' : 'Con observaciones'),
      });
    }
  }
  return registros;
}

function pickWeighted(arr, pesos, rnd) {
  const sum = pesos.reduce((a, b) => a + b, 0);
  let r = rnd() * sum;
  for (let i = 0; i < arr.length; i++) {
    r -= pesos[i];
    if (r <= 0) return arr[i];
  }
  return arr[arr.length - 1];
}

// Aggregations
function aggregate(data, { anio, region, marco, analista, abogado } = {}) {
  let rows = data;
  if (anio && anio !== 'all') rows = rows.filter(r => r.anio === anio);
  if (region && region !== 'all') rows = rows.filter(r => r.region === region);
  if (marco && marco !== 'all') rows = rows.filter(r => r.marco === marco);
  if (analista && analista !== 'all') rows = rows.filter(r => r.analista === analista);
  if (abogado && abogado !== 'all') rows = rows.filter(r => r.abogado === abogado);
  return rows;
}

function kpis(rows) {
  const total = rows.length;
  const porMarco = { 'DL 701': 0, 'Ley 20.283': 0, 'DS 490': 0 };
  let bonos = 0, montoBonos = 0, superficie = 0, fueraPlazo = 0, conPlazo = 0;
  const analistas = new Set(), abogados = new Set();
  for (const r of rows) {
    porMarco[r.marco]++;
    if (r.grupo === 'BONOS_BN') { bonos++; montoBonos += r.monto; }
    superficie += r.superficie;
    if (r.plazoDias != null) {
      conPlazo++;
      if (r.fueraPlazo) fueraPlazo++;
    }
    analistas.add(r.analista);
    abogados.add(r.abogado);
  }
  return {
    total, porMarco, bonos, montoBonos,
    superficie: Math.round(superficie),
    fueraPlazo, conPlazo,
    pctIncumplimiento: conPlazo ? (fueraPlazo / conPlazo * 100) : 0,
    pctCumplimiento: conPlazo ? ((conPlazo - fueraPlazo) / conPlazo * 100) : 100,
    analistasCount: analistas.size,
    abogadosCount: abogados.size,
  };
}

function groupBy(rows, key) {
  const out = {};
  for (const r of rows) {
    const k = r[key];
    out[k] = (out[k] || 0) + 1;
  }
  return out;
}

function groupByMulti(rows, keys, agg = 'count') {
  const out = {};
  for (const r of rows) {
    const path = keys.map(k => r[k]).join('||');
    if (!out[path]) out[path] = { count: 0, superficie: 0, monto: 0, fueraPlazo: 0, conPlazo: 0 };
    out[path].count++;
    out[path].superficie += r.superficie;
    out[path].monto += r.monto;
    if (r.plazoDias != null) {
      out[path].conPlazo++;
      if (r.fueraPlazo) out[path].fueraPlazo++;
    }
  }
  return out;
}

// Number formatters — Chilean locale
const fmt = {
  n: (v) => new Intl.NumberFormat('es-CL').format(Math.round(v || 0)),
  dec: (v, d = 1) => new Intl.NumberFormat('es-CL', { minimumFractionDigits: d, maximumFractionDigits: d }).format(v || 0),
  clp: (v) => '$ ' + new Intl.NumberFormat('es-CL').format(Math.round(v || 0)),
  clpShort: (v) => {
    if (v >= 1e9) return '$ ' + (v / 1e9).toFixed(1) + ' MM MM';
    if (v >= 1e6) return '$ ' + (v / 1e6).toFixed(0) + ' MM';
    if (v >= 1e3) return '$ ' + (v / 1e3).toFixed(0) + ' M';
    return '$ ' + v;
  },
  ha: (v) => new Intl.NumberFormat('es-CL').format(Math.round(v || 0)) + ' ha',
  pct: (v, d = 1) => new Intl.NumberFormat('es-CL', { minimumFractionDigits: d, maximumFractionDigits: d }).format(v || 0) + '%',
};

window.FORESTAL_DATA = {
  REGIONES, GRUPOS, ANIOS, ANALISTAS, ABOGADOS,
  genDataset, aggregate, kpis, groupBy, groupByMulti, fmt,
};
