// Shared UI primitives for the dashboards
// All inline-styled, no class collisions.

const { fmt, REGIONES, ANIOS, GRUPOS, ANALISTAS, ABOGADOS } = window.FORESTAL_DATA;

// ──────────────────────────────────────────────────────────
// Sparkline
// ──────────────────────────────────────────────────────────
function Sparkline({ values, width = 120, height = 32, stroke = '#2d4a34', fill = 'none', strokeWidth = 1.5, dots = false }) {
  if (!values || values.length === 0) return null;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const step = width / Math.max(values.length - 1, 1);
  const pts = values.map((v, i) => [i * step, height - ((v - min) / range) * height]);
  const d = pts.map(([x, y], i) => (i ? 'L' : 'M') + x.toFixed(1) + ',' + y.toFixed(1)).join(' ');
  const area = d + ` L${width},${height} L0,${height} Z`;
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      {fill !== 'none' && <path d={area} fill={fill} />}
      <path d={d} stroke={stroke} strokeWidth={strokeWidth} fill="none" strokeLinejoin="round" strokeLinecap="round" />
      {dots && pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={2} fill={stroke} />
      ))}
    </svg>
  );
}

// ──────────────────────────────────────────────────────────
// Bar chart (horizontal)
// ──────────────────────────────────────────────────────────
function HBar({ value, max, color = '#2d4a34', bg = 'rgba(45,74,52,.1)', height = 8, width = '100%' }) {
  const pct = Math.min(100, Math.max(0, (value / (max || 1)) * 100));
  return (
    <div style={{ width, height, background: bg, borderRadius: 1, overflow: 'hidden' }}>
      <div style={{ width: pct + '%', height: '100%', background: color, transition: 'width .3s' }} />
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// Stacked horizontal bar (for marcos distribution)
// ──────────────────────────────────────────────────────────
function StackBar({ segments, height = 10, total }) {
  const sum = total || segments.reduce((a, s) => a + s.value, 0);
  return (
    <div style={{ display: 'flex', height, width: '100%', borderRadius: 1, overflow: 'hidden', background: '#eceae4' }}>
      {segments.map((s, i) => (
        <div key={i} title={`${s.label}: ${fmt.n(s.value)}`}
          style={{ width: (s.value / sum * 100) + '%', background: s.color, transition: 'width .3s' }} />
      ))}
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// Column chart
// ──────────────────────────────────────────────────────────
function ColChart({ data, width = 380, height = 140, color = '#2d4a34', showValues = false, format = fmt.n }) {
  const max = Math.max(...data.map(d => d.value), 1);
  const pad = { l: 36, r: 8, t: 10, b: 22 };
  const w = width - pad.l - pad.r;
  const h = height - pad.t - pad.b;
  const bw = w / data.length * 0.72;
  const step = w / data.length;

  return (
    <svg width={width} height={height} style={{ display: 'block', fontFamily: 'inherit' }}>
      {/* axis ticks */}
      {[0, 0.5, 1].map((t, i) => {
        const y = pad.t + h - h * t;
        return (
          <g key={i}>
            <line x1={pad.l} x2={pad.l + w} y1={y} y2={y} stroke="rgba(0,0,0,.06)" strokeWidth={1} />
            <text x={pad.l - 6} y={y + 3} fontSize={9} textAnchor="end" fill="rgba(0,0,0,.5)" fontFamily="'JetBrains Mono', monospace">
              {format(max * t)}
            </text>
          </g>
        );
      })}
      {/* bars */}
      {data.map((d, i) => {
        const x = pad.l + i * step + (step - bw) / 2;
        const bh = (d.value / max) * h;
        const y = pad.t + h - bh;
        return (
          <g key={i}>
            <rect x={x} y={y} width={bw} height={bh} fill={d.color || color} />
            {showValues && bh > 18 && (
              <text x={x + bw / 2} y={y + 12} fontSize={9} textAnchor="middle" fill="#fff" fontFamily="'JetBrains Mono', monospace">
                {format(d.value)}
              </text>
            )}
            <text x={x + bw / 2} y={height - 6} fontSize={10} textAnchor="middle" fill="rgba(0,0,0,.7)">
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ──────────────────────────────────────────────────────────
// Donut
// ──────────────────────────────────────────────────────────
function Donut({ segments, size = 140, thickness = 22, centerLabel, centerValue }) {
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#eceae4" strokeWidth={thickness} />
        {segments.map((s, i) => {
          const len = (s.value / total) * c;
          const arr = `${len} ${c}`;
          const el = (
            <circle key={i} cx={size/2} cy={size/2} r={r} fill="none"
              stroke={s.color} strokeWidth={thickness}
              strokeDasharray={arr} strokeDashoffset={-offset} />
          );
          offset += len;
          return el;
        })}
      </svg>
      {centerValue != null && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", color: '#1a1f1a', letterSpacing: -0.5 }}>{centerValue}</div>
          {centerLabel && <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.8, color: 'rgba(0,0,0,.5)', marginTop: 2 }}>{centerLabel}</div>}
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// Stacked area / line over years
// ──────────────────────────────────────────────────────────
function LineMulti({ series, width = 560, height = 180, xLabels = ANIOS }) {
  const pad = { l: 44, r: 12, t: 12, b: 24 };
  const w = width - pad.l - pad.r;
  const h = height - pad.t - pad.b;
  const allVals = series.flatMap(s => s.values);
  const max = Math.max(...allVals, 1);
  const nx = xLabels.length;
  const step = w / (nx - 1);

  const pathFor = (vals) => vals.map((v, i) => {
    const x = pad.l + i * step;
    const y = pad.t + h - (v / max) * h;
    return (i ? 'L' : 'M') + x.toFixed(1) + ',' + y.toFixed(1);
  }).join(' ');

  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      {/* grid */}
      {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
        const y = pad.t + h - h * t;
        return (
          <g key={i}>
            <line x1={pad.l} x2={pad.l + w} y1={y} y2={y} stroke="rgba(0,0,0,.05)" />
            <text x={pad.l - 6} y={y + 3} fontSize={9} textAnchor="end" fill="rgba(0,0,0,.5)" fontFamily="'JetBrains Mono', monospace">
              {fmt.n(max * t)}
            </text>
          </g>
        );
      })}
      {xLabels.map((l, i) => (
        <text key={i} x={pad.l + i * step} y={height - 8} fontSize={10} textAnchor="middle" fill="rgba(0,0,0,.6)">{l}</text>
      ))}
      {series.map((s, i) => (
        <g key={i}>
          <path d={pathFor(s.values)} stroke={s.color} strokeWidth={1.8} fill="none" strokeLinejoin="round" />
          {s.values.map((v, j) => (
            <circle key={j} cx={pad.l + j * step} cy={pad.t + h - (v / max) * h} r={2.5} fill={s.color} />
          ))}
        </g>
      ))}
    </svg>
  );
}

// ──────────────────────────────────────────────────────────
// Heatmap cell
// ──────────────────────────────────────────────────────────
function HeatCell({ value, max, color = [45, 74, 52], style = {} }) {
  const alpha = Math.min(1, (value / (max || 1)) * 0.9 + 0.06);
  return (
    <div style={{
      background: `rgba(${color.join(',')},${alpha})`,
      color: alpha > 0.5 ? '#fff' : '#1a1f1a',
      fontSize: 11,
      fontFamily: "'JetBrains Mono', monospace",
      textAlign: 'right',
      padding: '4px 6px',
      ...style,
    }}>{fmt.n(value)}</div>
  );
}

// ──────────────────────────────────────────────────────────
// Semáforo cumplimiento
// ──────────────────────────────────────────────────────────
function StatusPill({ pct, size = 'md' }) {
  let color = '#5a7a4a', bg = 'rgba(90,122,74,.15)', label = 'En norma';
  if (pct > 15)  { color = '#b8741a'; bg = 'rgba(184,116,26,.15)'; label = 'Alerta'; }
  if (pct > 30)  { color = '#a0402a'; bg = 'rgba(160,64,42,.15)'; label = 'Crítico'; }
  const szPad = size === 'sm' ? '2px 6px' : '3px 8px';
  const szFont = size === 'sm' ? 10 : 11;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: szPad, background: bg, color, fontSize: szFont, fontWeight: 500, borderRadius: 2, letterSpacing: 0.2 }}>
      <span style={{ width: 6, height: 6, borderRadius: 3, background: color }} />
      {label} · {fmt.pct(pct, 1)}
    </span>
  );
}

// ──────────────────────────────────────────────────────────
// Data table (reusable)
// ──────────────────────────────────────────────────────────
function DataTable({ columns, rows, maxRows = 12, striped = true, onRowClick }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
      <thead>
        <tr>
          {columns.map((c, i) => (
            <th key={i} style={{
              textAlign: c.align || 'left',
              padding: '8px 10px',
              borderBottom: '1px solid rgba(0,0,0,.12)',
              fontSize: 10,
              textTransform: 'uppercase',
              letterSpacing: 0.6,
              fontWeight: 600,
              color: 'rgba(0,0,0,.55)',
              background: '#faf9f5',
              position: 'sticky',
              top: 0,
            }}>{c.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.slice(0, maxRows).map((r, i) => (
          <tr key={i}
            onClick={() => onRowClick && onRowClick(r)}
            style={{
              background: striped && i % 2 ? 'rgba(245,243,238,.6)' : 'transparent',
              cursor: onRowClick ? 'pointer' : 'default',
            }}
            onMouseEnter={e => onRowClick && (e.currentTarget.style.background = 'rgba(45,74,52,.06)')}
            onMouseLeave={e => onRowClick && (e.currentTarget.style.background = striped && i % 2 ? 'rgba(245,243,238,.6)' : 'transparent')}
          >
            {columns.map((c, j) => (
              <td key={j} style={{
                padding: '7px 10px',
                textAlign: c.align || 'left',
                borderBottom: '1px solid rgba(0,0,0,.04)',
                fontFamily: c.mono ? "'JetBrains Mono', monospace" : 'inherit',
                fontVariantNumeric: 'tabular-nums',
                color: c.muted ? 'rgba(0,0,0,.6)' : '#1a1f1a',
              }}>{c.render ? c.render(r) : r[c.key]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ──────────────────────────────────────────────────────────
// Toolbar filter chip
// ──────────────────────────────────────────────────────────
function FilterSelect({ label, value, options, onChange, width = 130 }) {
  return (
    <label style={{ display: 'inline-flex', flexDirection: 'column', gap: 3 }}>
      <span style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.8, color: 'rgba(0,0,0,.5)', fontWeight: 600 }}>{label}</span>
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{
          width, padding: '6px 8px', fontSize: 12,
          background: '#fff',
          border: '1px solid rgba(0,0,0,.14)',
          borderRadius: 2,
          fontFamily: 'inherit',
          color: '#1a1f1a',
          cursor: 'pointer',
        }}>
        {options.map(o => (
          <option key={typeof o === 'object' ? o.value : o} value={typeof o === 'object' ? o.value : o}>
            {typeof o === 'object' ? o.label : o}
          </option>
        ))}
      </select>
    </label>
  );
}

// colors for marcos
const MARCO_COLORS = {
  'DL 701':     '#2d4a34',   // verde bosque
  'Ley 20.283': '#6b8c5a',   // verde hoja
  'DS 490':     '#b8a878',   // tierra
};

Object.assign(window, {
  Sparkline, HBar, StackBar, ColChart, Donut, LineMulti, HeatCell, StatusPill,
  DataTable, FilterSelect, MARCO_COLORS,
});
