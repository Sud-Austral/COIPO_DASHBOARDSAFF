// V2 — Centro de Control (denso cockpit)
// Tone: operativa al máximo; grilla modular; filtros laterales fijos.

const { fmt, REGIONES, ANIOS, GRUPOS, ANALISTAS, ABOGADOS } = window.FORESTAL_DATA;

function V2ControlCenter() {
  const data = React.useMemo(() => window.FORESTAL_DATA.genDataset(), []);
  const [anio, setAnio] = React.useState(2025);
  const [region, setRegion] = React.useState('all');
  const [marco, setMarco] = React.useState('all');
  const [analista, setAnalista] = React.useState('all');
  const [abogado, setAbogado] = React.useState('all');
  const [tab, setTab] = React.useState('3.1');
  const [search, setSearch] = React.useState('');

  const rows = window.FORESTAL_DATA.aggregate(data, { anio, region, marco, analista, abogado });
  const k = window.FORESTAL_DATA.kpis(rows);
  const kPrev = window.FORESTAL_DATA.kpis(window.FORESTAL_DATA.aggregate(data, { anio: anio - 1, region, marco, analista, abogado }));

  // For search panel
  const searchRows = search
    ? rows.filter(r => String(r.id).includes(search) || r.analista.toLowerCase().includes(search.toLowerCase()) || r.region.toLowerCase().includes(search.toLowerCase())).slice(0, 30)
    : [];

  // time series for sparklines
  const trendTotal = ANIOS.map(y => window.FORESTAL_DATA.aggregate(data, { anio: y, region, marco, analista, abogado }).length);

  // Group counts for chart
  const porGrupo = {};
  for (const r of rows) porGrupo[r.grupo] = (porGrupo[r.grupo] || 0) + 1;

  // Por analista — carga de trabajo
  const cargaAnalista = {};
  for (const r of rows) {
    if (!cargaAnalista[r.analista]) cargaAnalista[r.analista] = { total: 0, fueraPlazo: 0 };
    cargaAnalista[r.analista].total++;
    if (r.fueraPlazo) cargaAnalista[r.analista].fueraPlazo++;
  }
  const analistaArr = Object.entries(cargaAnalista)
    .map(([a, v]) => ({ analista: a, ...v, pctInc: v.total ? v.fueraPlazo / v.total * 100 : 0 }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  // Regional compliance matrix
  const regMarcoMatrix = REGIONES.map(r => {
    const cells = ['DL 701', 'Ley 20.283', 'DS 490'].map(m => {
      const rr = window.FORESTAL_DATA.aggregate(rows, { region: r.cod, marco: m });
      return rr.length;
    });
    return { cod: r.cod, nombre: r.nombre, cells, total: cells.reduce((a,b)=>a+b,0) };
  });
  const maxCell = Math.max(...regMarcoMatrix.flatMap(r => r.cells));

  // KPI strip numbers
  const kpiItems = [
    { label: 'Resoluciones', v: fmt.n(k.total), d: k.total - kPrev.total, trend: trendTotal },
    { label: 'DL 701',       v: fmt.n(k.porMarco['DL 701']),    d: k.porMarco['DL 701'] - kPrev.porMarco['DL 701'] },
    { label: 'Ley 20.283',   v: fmt.n(k.porMarco['Ley 20.283']),d: k.porMarco['Ley 20.283'] - kPrev.porMarco['Ley 20.283'] },
    { label: 'DS 490',       v: fmt.n(k.porMarco['DS 490']),    d: k.porMarco['DS 490'] - kPrev.porMarco['DS 490'] },
    { label: 'Bonos Art.22', v: fmt.n(k.bonos),                 d: k.bonos - kPrev.bonos, sub: fmt.clpShort(k.montoBonos) },
    { label: 'Superficie',   v: fmt.n(k.superficie) + ' ha',    d: k.superficie - kPrev.superficie },
    { label: 'Incumplim.',   v: fmt.pct(k.pctIncumplimiento, 1), d: (k.pctIncumplimiento - kPrev.pctIncumplimiento), invert: true },
    { label: 'Analistas',    v: k.analistasCount,               sub: `${k.abogadosCount} abogados` },
  ];

  return (
    <div style={{
      fontFamily: "'Inter', system-ui, sans-serif",
      background: '#16191a',
      color: '#e8e6df',
      width: '100%', height: '100%',
      display: 'grid',
      gridTemplateColumns: '220px 1fr',
      overflow: 'hidden',
      fontSize: 12,
    }}>
      {/* sidebar */}
      <aside style={{ background: '#0e1111', borderRight: '1px solid #272b2c', padding: '14px 14px', display: 'flex', flexDirection: 'column', gap: 14, overflow: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, background: '#3d6547', color: '#e8e6df', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 11, fontFamily: "'JetBrains Mono', monospace", borderRadius: 2 }}>UF</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 12, letterSpacing: 0.3 }}>SAF · Fiscalización</div>
            <div style={{ fontSize: 9.5, color: '#6a7073', letterSpacing: 0.8, textTransform: 'uppercase' }}>Centro de control</div>
          </div>
        </div>

        <div style={{ height: 1, background: '#272b2c', margin: '2px -14px' }} />

        <DarkFilter label="Año" value={anio} onChange={v => setAnio(+v)}
          options={ANIOS.map(y => ({ value: y, label: String(y) }))} />
        <DarkFilter label="Región" value={region} onChange={setRegion}
          options={[{ value: 'all', label: 'Todas' }, ...REGIONES.map(r => ({ value: r.cod, label: `${r.cod} · ${r.nombre}` }))]} />
        <DarkFilter label="Marco normativo" value={marco} onChange={setMarco}
          options={[{ value: 'all', label: 'Todos' }, { value: 'DL 701', label: 'DL 701' }, { value: 'Ley 20.283', label: 'Ley 20.283' }, { value: 'DS 490', label: 'DS 490' }]} />
        <DarkFilter label="Analista" value={analista} onChange={setAnalista}
          options={[{ value: 'all', label: 'Todos' }, ...ANALISTAS.map(a => ({ value: a, label: a }))]} />
        <DarkFilter label="Abogado" value={abogado} onChange={setAbogado}
          options={[{ value: 'all', label: 'Todos' }, ...ABOGADOS.map(a => ({ value: a, label: a }))]} />

        <div style={{ height: 1, background: '#272b2c', margin: '2px -14px' }} />

        {/* Search */}
        <div>
          <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, color: '#8a9094', marginBottom: 5, fontWeight: 600 }}>Buscar solicitud</div>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ID, analista, región…"
            style={{ width: '100%', padding: '6px 8px', fontSize: 11, background: '#1a1f20', color: '#e8e6df', border: '1px solid #272b2c', borderRadius: 2, fontFamily: 'inherit' }} />
          {searchRows.length > 0 && (
            <div style={{ marginTop: 6, maxHeight: 180, overflow: 'auto', border: '1px solid #272b2c', background: '#16191a' }}>
              {searchRows.map(r => (
                <div key={r.id} style={{ padding: '5px 7px', fontSize: 10.5, borderBottom: '1px solid #272b2c', display: 'grid', gridTemplateColumns: '58px 30px 1fr', gap: 6, fontFamily: "'JetBrains Mono', monospace" }}>
                  <span style={{ color: '#7aa68a' }}>#{r.id}</span>
                  <span>{r.region}</span>
                  <span style={{ color: '#c5c2b6', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.analista}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ flex: 1 }} />

        {/* Reset */}
        <button onClick={() => { setRegion('all'); setMarco('all'); setAnalista('all'); setAbogado('all'); setSearch(''); }}
          style={{ padding: '7px 10px', fontSize: 11, background: 'transparent', color: '#8a9094', border: '1px solid #272b2c', cursor: 'pointer', fontFamily: 'inherit', borderRadius: 2 }}>
          ↺ Reset filtros
        </button>

        <div style={{ fontSize: 9, color: '#5a6064', letterSpacing: 0.8, textAlign: 'center', fontFamily: "'JetBrains Mono', monospace" }}>
          {fmt.n(rows.length)} / {fmt.n(data.length)} registros
        </div>
      </aside>

      {/* main */}
      <main style={{ overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        {/* top bar */}
        <div style={{ borderBottom: '1px solid #272b2c', padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: 0.2 }}>Informe de Gestión — Resoluciones Forestales</div>
            <div style={{ fontSize: 10.5, color: '#7a8084', fontFamily: "'JetBrains Mono', monospace" }}>
              {anio} · {region === 'all' ? 'todas las regiones' : region} · {marco === 'all' ? 'todos los marcos' : marco}
              {analista !== 'all' ? ` · ${analista}` : ''} {abogado !== 'all' ? ` · ${abogado}` : ''}
            </div>
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 10px', background: '#1a1f20', border: '1px solid #272b2c', borderRadius: 2, fontSize: 10.5, color: '#8a9094', fontFamily: "'JetBrains Mono', monospace" }}>
            <span style={{ width: 6, height: 6, borderRadius: 3, background: '#5fb87a' }} />
            Pipeline: estandarizar → plazos → exportar · OK
          </div>
          <button style={btnDarkOutline}>Exportar PDF</button>
          <button style={btnDarkFill}>Excel · 8 hojas</button>
        </div>

        {/* KPI strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', borderBottom: '1px solid #272b2c' }}>
          {kpiItems.map((it, i) => (
            <div key={i} style={{ padding: '12px 14px', borderRight: i < 7 ? '1px solid #272b2c' : 'none' }}>
              <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, color: '#8a9094', fontWeight: 600 }}>{it.label}</div>
              <div style={{ fontSize: 22, fontFamily: "'JetBrains Mono', monospace", marginTop: 4, color: '#f0eee7', letterSpacing: -0.5, fontWeight: 500 }}>{it.v}</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6, minHeight: 18 }}>
                {it.d != null && (
                  <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: Math.abs(it.d) < 1 ? '#6a7073' : ((it.d > 0 ? !it.invert : it.invert) ? '#7aa68a' : '#c97a5a') }}>
                    {it.d > 0 ? '▲' : '▼'} {typeof it.d === 'number' && Math.abs(it.d) < 10 ? fmt.dec(Math.abs(it.d), 1) : fmt.n(Math.abs(it.d))}
                  </span>
                )}
                {it.sub && <span style={{ fontSize: 10, color: '#7a8084' }}>{it.sub}</span>}
                {it.trend && (
                  <Sparkline values={it.trend} width={58} height={18} stroke="#7aa68a" strokeWidth={1.4} />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', borderBottom: '1px solid #272b2c', padding: '0 12px', background: '#0e1111', gap: 2 }}>
          {[
            ['3.1', 'Resoluciones'],
            ['3.2', 'Bonos Art.22'],
            ['3.3', 'Superficie'],
            ['3.4', 'Cumplimiento'],
            ['3.5', 'Tiempos tram.'],
          ].map(([id, lbl]) => (
            <button key={id} onClick={() => setTab(id)}
              style={{
                padding: '9px 16px', fontSize: 11, background: 'transparent',
                border: 'none', borderBottom: tab === id ? '2px solid #7aa68a' : '2px solid transparent',
                color: tab === id ? '#f0eee7' : '#8a9094', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500,
              }}>
              <span style={{ color: '#5a6064', fontFamily: "'JetBrains Mono', monospace", marginRight: 6 }}>{id}</span>{lbl}
            </button>
          ))}
          <div style={{ flex: 1 }} />
        </div>

        {/* grid */}
        <div style={{ padding: 14, display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 10, flex: 1 }}>
          {/* Regional × Marco matrix */}
          <Card title="Matriz Región × Marco normativo" subtitle={`volumen de resoluciones · ${anio}`} span={7}>
            <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 80px 80px 80px 70px', gap: 1, fontSize: 11 }}>
              <div style={dkHead}>Región</div>
              <div style={dkHead}>Nombre</div>
              <div style={{ ...dkHead, textAlign: 'right' }}>DL 701</div>
              <div style={{ ...dkHead, textAlign: 'right' }}>20.283</div>
              <div style={{ ...dkHead, textAlign: 'right' }}>DS 490</div>
              <div style={{ ...dkHead, textAlign: 'right' }}>Total</div>
              {regMarcoMatrix.map(r => (
                <React.Fragment key={r.cod}>
                  <div style={{ ...dkCell, color: '#9fc6ab', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>{r.cod}</div>
                  <div style={dkCell}>{r.nombre}</div>
                  {r.cells.map((v, i) => (
                    <HeatCellDark key={i} value={v} max={maxCell} />
                  ))}
                  <div style={{ ...dkCell, textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{fmt.n(r.total)}</div>
                </React.Fragment>
              ))}
            </div>
          </Card>

          {/* Distribución por grupo */}
          <Card title="Distribución por grupo normativo" subtitle="8 grupos · ordenados por volumen" span={5}>
            {GRUPOS
              .map(g => ({ ...g, count: porGrupo[g.id] || 0 }))
              .sort((a, b) => b.count - a.count)
              .map(g => {
                const maxC = Math.max(...Object.values(porGrupo), 1);
                return (
                  <div key={g.id} style={{ display: 'grid', gridTemplateColumns: '130px 1fr 80px', gap: 8, alignItems: 'center', padding: '4px 2px', fontSize: 10.5 }}>
                    <span style={{ color: '#c5c2b6', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={g.nombre}>
                      <span style={{ color: MARCO_COLORS[g.marco] === '#2d4a34' ? '#7aa68a' : MARCO_COLORS[g.marco] === '#6b8c5a' ? '#a0c28a' : '#d4c090', fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5 }}>{g.marco.replace('Ley ','').replace('DL ','').replace('DS ','')}</span> {g.nombre}
                    </span>
                    <HBar value={g.count} max={maxC} color={MARCO_COLORS[g.marco] === '#2d4a34' ? '#3d6547' : MARCO_COLORS[g.marco] === '#6b8c5a' ? '#5a7a4a' : '#8a7848'} bg="#272b2c" height={10} />
                    <span style={{ textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", color: '#e8e6df' }}>{fmt.n(g.count)}</span>
                  </div>
                );
              })}
          </Card>

          {/* Tiempos */}
          <Card title="Tiempos de tramitación" subtitle="días promedio — IT · IL · Visado" span={4}>
            {['diasIT', 'diasIL', 'diasVisado', 'diasTotal'].map((key, i) => {
              const avg = rows.reduce((a, r) => a + r[key], 0) / (rows.length || 1);
              const label = ['Informe técnico (analista)', 'Informe legal (abogado)', 'Visado y firma', 'Trámite total'][i];
              const col = ['#7aa68a', '#a0c28a', '#d4c090', '#f0eee7'][i];
              return (
                <div key={key} style={{ paddingBottom: 8, marginBottom: 8, borderBottom: i < 3 ? '1px dashed #272b2c' : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 10.5, color: '#c5c2b6' }}>{label}</span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: col }}>{fmt.dec(avg, 1)} d</span>
                  </div>
                  <HBar value={avg} max={90} color={col} bg="#272b2c" height={5} />
                </div>
              );
            })}
          </Card>

          {/* Carga analistas */}
          <Card title="Carga de trabajo — Top 10 analistas" subtitle="resoluciones · % fuera de plazo" span={5}>
            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr 50px 52px', gap: 6, fontSize: 10.5 }}>
              {analistaArr.map(a => (
                <React.Fragment key={a.analista}>
                  <div style={{ color: '#c5c2b6', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.analista}</div>
                  <HBar value={a.total} max={analistaArr[0].total} color="#5a7a4a" bg="#272b2c" height={10} />
                  <div style={{ textAlign: 'right', fontFamily: "'JetBrains Mono', monospace" }}>{fmt.n(a.total)}</div>
                  <div style={{ textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: a.pctInc > 30 ? '#c97a5a' : a.pctInc > 15 ? '#d4c090' : '#7aa68a' }}>
                    {fmt.pct(a.pctInc, 0)}
                  </div>
                </React.Fragment>
              ))}
            </div>
          </Card>

          {/* Cumplimiento grande */}
          <Card title="Semáforo de cumplimiento" subtitle="% dentro de plazo legal" span={3}>
            <DarkDial pct={k.pctCumplimiento} />
            <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 10.5 }}>
              <div style={{ padding: '6px 8px', background: 'rgba(122,166,138,.12)', borderLeft: '2px solid #7aa68a' }}>
                <div style={{ color: '#8a9094', fontSize: 9, letterSpacing: 0.6, textTransform: 'uppercase' }}>En plazo</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", color: '#7aa68a', fontSize: 14, marginTop: 2 }}>{fmt.n(k.conPlazo - k.fueraPlazo)}</div>
              </div>
              <div style={{ padding: '6px 8px', background: 'rgba(201,122,90,.12)', borderLeft: '2px solid #c97a5a' }}>
                <div style={{ color: '#8a9094', fontSize: 9, letterSpacing: 0.6, textTransform: 'uppercase' }}>Fuera</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", color: '#c97a5a', fontSize: 14, marginTop: 2 }}>{fmt.n(k.fueraPlazo)}</div>
              </div>
            </div>
          </Card>

          {/* Tabla detallada */}
          <Card title="Últimas resoluciones" subtitle={`drill-down · primeras ${Math.min(12, rows.length)} de ${fmt.n(rows.length)}`} span={12}>
            <div style={{ maxHeight: 260, overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                <thead>
                  <tr>
                    {['ID', 'Año', 'Reg.', 'Marco', 'Grupo', 'Analista', 'Abogado', 'Días IT', 'Días IL', 'Visado', 'Total', 'Plazo', 'Estado'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '6px 8px', fontSize: 9, letterSpacing: 0.8, textTransform: 'uppercase', color: '#8a9094', background: '#0e1111', fontWeight: 600, borderBottom: '1px solid #272b2c', position: 'sticky', top: 0 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 40).map((r, i) => (
                    <tr key={r.id} style={{ background: i % 2 ? '#1a1f20' : 'transparent' }}>
                      <td style={tdMono}>#{r.id}</td>
                      <td style={tdMono}>{r.anio}</td>
                      <td style={{ ...tdMono, color: '#9fc6ab' }}>{r.region}</td>
                      <td style={td}><span style={{ color: r.marco === 'DL 701' ? '#7aa68a' : r.marco === 'Ley 20.283' ? '#a0c28a' : '#d4c090' }}>{r.marco}</span></td>
                      <td style={{ ...td, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.grupoNombre}</td>
                      <td style={td}>{r.analista}</td>
                      <td style={td}>{r.abogado}</td>
                      <td style={tdMono}>{r.diasIT}</td>
                      <td style={tdMono}>{r.diasIL}</td>
                      <td style={tdMono}>{r.diasVisado}</td>
                      <td style={{ ...tdMono, fontWeight: 600 }}>{r.diasTotal}</td>
                      <td style={{ ...tdMono, color: r.plazoDias ? '#c5c2b6' : '#5a6064' }}>{r.plazoDias ?? '—'}</td>
                      <td style={td}>
                        <span style={{
                          padding: '1px 7px', fontSize: 9.5, borderRadius: 2,
                          background: r.fueraPlazo ? 'rgba(201,122,90,.18)' : 'rgba(122,166,138,.18)',
                          color: r.fueraPlazo ? '#c97a5a' : '#7aa68a',
                        }}>
                          {r.fueraPlazo ? 'Fuera' : 'En plazo'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}

// ─── dark primitives ──────────────────────────────────────
function DarkFilter({ label, value, onChange, options }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, color: '#8a9094', fontWeight: 600 }}>{label}</span>
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{ padding: '5px 7px', fontSize: 11, background: '#1a1f20', color: '#e8e6df', border: '1px solid #272b2c', borderRadius: 2, fontFamily: 'inherit', cursor: 'pointer' }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}

function Card({ title, subtitle, span = 4, children }) {
  return (
    <div style={{ gridColumn: `span ${span}`, background: '#0e1111', border: '1px solid #272b2c', padding: '10px 12px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#e8e6df', letterSpacing: 0.2 }}>{title}</div>
        {subtitle && <div style={{ fontSize: 9.5, color: '#6a7073', letterSpacing: 0.4, marginTop: 1, fontFamily: "'JetBrains Mono', monospace" }}>{subtitle}</div>}
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>{children}</div>
    </div>
  );
}

function HeatCellDark({ value, max }) {
  const alpha = Math.min(0.95, (value / (max || 1)) * 0.85 + 0.08);
  return (
    <div style={{
      background: `rgba(122,166,138,${alpha})`,
      color: alpha > 0.5 ? '#0e1111' : '#c5c2b6',
      fontSize: 10.5, fontFamily: "'JetBrains Mono', monospace",
      textAlign: 'right', padding: '4px 7px',
    }}>{fmt.n(value)}</div>
  );
}

function DarkDial({ pct, size = 110 }) {
  const r = size/2 - 8;
  const c = 2 * Math.PI * r;
  const len = (pct/100) * c;
  const col = pct >= 85 ? '#7aa68a' : pct >= 70 ? '#d4c090' : '#c97a5a';
  return (
    <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#272b2c" strokeWidth={8} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={col} strokeWidth={8}
          strokeDasharray={`${len} ${c}`} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 22, color: col, letterSpacing: -0.5 }}>{fmt.pct(pct, 1)}</div>
        <div style={{ fontSize: 9, color: '#8a9094', letterSpacing: 0.8, textTransform: 'uppercase' }}>Cumplimiento</div>
      </div>
    </div>
  );
}

const dkHead = { fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.8, color: '#6a7073', padding: '4px 7px', fontWeight: 600, background: '#16191a' };
const dkCell = { padding: '4px 7px', color: '#c5c2b6', background: '#16191a' };
const td = { padding: '5px 8px', borderBottom: '1px solid #272b2c', color: '#c5c2b6' };
const tdMono = { ...td, fontFamily: "'JetBrains Mono', monospace" };

const btnDarkOutline = { padding: '6px 12px', fontSize: 11, background: 'transparent', color: '#c5c2b6', border: '1px solid #272b2c', cursor: 'pointer', fontFamily: 'inherit', borderRadius: 2 };
const btnDarkFill = { padding: '6px 12px', fontSize: 11, background: '#3d6547', color: '#f0eee7', border: '1px solid #3d6547', cursor: 'pointer', fontFamily: 'inherit', borderRadius: 2 };

window.V2ControlCenter = V2ControlCenter;
