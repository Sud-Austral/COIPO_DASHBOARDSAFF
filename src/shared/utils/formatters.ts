export const fmt = {
  n: (v: number) => new Intl.NumberFormat('es-CL').format(Math.round(v || 0)),
  dec: (v: number, d = 1) => new Intl.NumberFormat('es-CL', { minimumFractionDigits: d, maximumFractionDigits: d }).format(v || 0),
  clp: (v: number) => '$ ' + new Intl.NumberFormat('es-CL').format(Math.round(v || 0)),
  clpShort: (v: number) => {
    if (v >= 1e9) return '$ ' + (v / 1e9).toFixed(1) + ' MM MM';
    if (v >= 1e6) return '$ ' + (v / 1e6).toFixed(0) + ' MM';
    if (v >= 1e3) return '$ ' + (v / 1e3).toFixed(0) + ' M';
    return '$ ' + v;
  },
  ha: (v: number) => new Intl.NumberFormat('es-CL').format(Math.round(v || 0)) + ' ha',
  pct: (v: number, d = 1) => new Intl.NumberFormat('es-CL', { minimumFractionDigits: d, maximumFractionDigits: d }).format(v || 0) + '%',
};
