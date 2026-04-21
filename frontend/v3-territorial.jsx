// V3 — Vista Territorial
// Tone: regional ranking como columna vertebral, small multiples y bullet charts.

const { fmt, REGIONES, ANIOS, GRUPOS } = window.FORESTAL_DATA;

function V3Territorial() {
  const data = React.useMemo(() => window.FORESTAL_DATA.genDataset(), []);
  const [anio, setAnio] = React.useState(2025);
  const [marco, setMarco] = React.useState('all');
  const [hoveredReg, setHoveredReg] = React.useState(null);
  const [selectedReg, setSelectedReg] = React.useState(null);

  const rowsAll = window.FORESTAL_DATA.aggregate(data, { anio, marco });
  const rowsPrev = window.FORESTAL_DATA.aggregate(data, { anio: anio - 1, marco });
  const kAll = window.FORESTAL_DATA.kpis(rowsAll);
  const kPrev = window.FORESTAL_DATA.kpis(rowsPrev);

  // Per-region aggregates + trends
  const porRegion = REGIONES.map(r => {
    const rows = rowsAll.filter(x => x.region === r.cod);
    const kk = window.FORESTAL_DATA.kpis(rows);
    const trend = ANIOS.map(y => data.filter(x => x.region === r.cod && x.anio === y && (marco === 'all' || x.marco === marco)).length);
    return { ...r, ...kk, trend };
  });

  const maxTotal = Math.max(...porRegion.map(r => r.total), 1);
  const maxSuperficie = Math.max(...porRegion.map(r => r.superficie), 1);
  const maxBonos = Math.max(...porRegion.map(r => r.bonos), 1);

  const regDetail = selectedReg
    ? porRegion.find(r => r.cod === selectedReg)
    : null;

  return (
    <div style={{
      fontFamily: "'Inter', system-ui, sans-serif",
      background: '#f7f5f0',
      color: '#1a1f1a',
      width: '100%', height: '100%',
      overflow: 'auto',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <header style={{ padding: '22px 40px 20px', background: '#1e2a22', color: '#f0eee7', borderBottom: '3px solid #2d4a34' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 32 }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: 1.6, textTransform: 'uppercase', color: '#a8b4a8', marginBottom: 10, fontWeight: 600 }}>
              Unidad de Fiscalización · Gestión Territorial
            </div>
            <h1 style={{ fontFamily: "'Inter', sans-serif", fontSize: 32, fontWeight: 700, lineHeight: 1.05, letterSpacing: -0.8, margin: 0 }}>
              Vista Territorial <span style={{ color: '#9fc6ab', fontWeight: 300 }}>— III → XII + RM</span>
            </h1>
            <p style={{ margin: '8px 0 0', fontSize: 12, color: '#a8b4a8', maxWidth: 600 }}>
              Ranking de {REGIONES.length} regiones: volumen, superficie, bonificaciones y cumplimiento. Sur-norte CONAF.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
            <FilterSelect label="Año" value={anio} onChange={v => setAnio(+v)}
              options={ANIOS.map(y => ({ value: y, label: String(y) }))} width={90} />
            <FilterSelect label="Marco" value={marco} onChange={setMarco}
              options={[{ value: 'all', label: 'Todos' }, { value: 'DL 701', label: 'DL 701' }, { value: 'Ley 20.283', label: 'Ley 20.283' }, { value: 'DS 490', label: 'DS 490' }]} width={140} />
            <button style={{ padding: '7px 14px', fontSize: 12, background: '#2d4a34', color: '#f0eee7', border: 'none', cursor: 'pointer', borderRadius: 2 }}>Exportar</button>
          </div>
        </div>
      </header>

      {/* KPI ribbon */}
      <div style={{ padding: '16px 40px', background: '#2d4a34', color: '#f0eee7', display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 0 }}>
        {[
          ['Regiones activas', REGIONES.length, ''],
          ['Total resoluciones', fmt.n(kAll.total), `${kAll.total > kPrev.total ? '+' : ''}${fmt.pct((kAll.total - kPrev.total) / (kPrev.total || 1) * 100, 1)} vs ${anio - 1}`],
          ['Superficie aprobada', fmt.n(kAll.superficie) + ' ha', ''],
          ['Bonos Art.22', fmt.n(kAll.bonos), fmt.clpShort(kAll.montoBonos)],
          ['Cumplimiento', fmt.pct(kAll.pctCumplimiento, 1), ''],
          ['Región líder', porRegion.sort((a,b)=>b.total-a.total)[0].cod, porRegion[0].nombre],
        ].map(([label, val, sub], i, arr) => (
          <div key={i} style={{ padding: '0 22px', borderRight: i < arr.length - 1 ? '1px solid rgba(240,238,231,.15)' : 'none' }}>
            <div style={{ fontSize: 9, letterSpacing: 1.2, textTransform: 'uppercase', color: '#9fc6ab', fontWeight: 600 }}>{label}</div>
            <div style={{ fontSize: 22, fontWeight: 600, marginTop: 4, letterSpacing: -0.5, fontFamily: typeof val === 'string' && val.length < 4 ? "'Inter', sans-serif" : "'JetBrains Mono', monospace" }}>{val}</div>
            {sub && <div style={{ fontSize: 10, color: '#a8b4a8', marginTop: 2 }}>{sub}</div>}
          </div>
        ))}
      </div>

      {/* Main body */}
      <section style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 360px', gap: 0, minHeight: 0 }}>
        {/* Regional ranking spine */}
        <div style={{ padding: '28px 40px 32px', borderRight: '1px solid rgba(26,31,26,.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 18 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: -0.3 }}>Ranking regional</div>
              <div style={{ fontSize: 11, color: 'rgba(0,0,0,.55)', marginTop: 2 }}>
                Click en una región para ver detalle · hover para comparar
              </div>
            </div>
            <div style={{ display: 'flex', gap: 14, fontSize: 10, color: 'rgba(0,0,0,.55)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 10, height: 4, background: '#2d4a34' }} /> Volumen
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 10, height: 4, background: '#b8a878' }} /> Superficie
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: 3, background: '#5fb87a' }} /> Cumplimiento
              </div>
            </div>
          </div>

          {/* Table header */}
          <div style={{ display: 'grid', gridTemplateColumns: '36px 60px 150px 1fr 88px 1fr 88px 104px 80px', gap: 12, alignItems: 'center', padding: '6px 4px', fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(0,0,0,.5)', fontWeight: 600, borderBottom: '1px solid rgba(0,0,0,.15)' }}>
            <div>#</div>
            <div>Cód.</div>
            <div>Región</div>
            <div>Resoluciones</div>
            <div style={{ textAlign: 'right' }}>Total</div>
            <div>Superficie</div>
            <div style={{ textAlign: 'right' }}>Hectáreas</div>
            <div>Tendencia</div>
            <div style={{ textAlign: 'right' }}>Cumpl.</div>
          </div>

          {porRegion
            .slice()
            .sort((a, b) => b.total - a.total)
            .map((r, i) => {
              const isHover = hoveredReg === r.cod;
              const isSel = selectedReg === r.cod;
              return (
                <div key={r.cod}
                  onClick={() => setSelectedReg(r.cod === selectedReg ? null : r.cod)}
                  onMouseEnter={() => setHoveredReg(r.cod)}
                  onMouseLeave={() => setHoveredReg(null)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '36px 60px 150px 1fr 88px 1fr 88px 104px 80px',
                    gap: 12, alignItems: 'center', padding: '12px 4px',
                    borderBottom: '1px solid rgba(0,0,0,.06)',
                    background: isSel ? 'rgba(45,74,52,.08)' : isHover ? 'rgba(45,74,52,.03)' : 'transparent',
                    cursor: 'pointer', transition: 'background .15s',
                    borderLeft: isSel ? '3px solid #2d4a34' : '3px solid transparent',
                    paddingLeft: isSel ? 1 : 4,
                  }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: i < 3 ? '#2d4a34' : 'rgba(0,0,0,.4)', fontWeight: i < 3 ? 700 : 400 }}>
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 600, color: '#2d4a34' }}>{r.cod}</div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{r.nombre}</div>
                  <div style={{ position: 'relative' }}>
                    <HBar value={r.total} max={maxTotal} color="#2d4a34" height={10} />
                  </div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, textAlign: 'right', fontWeight: 600 }}>
                    {fmt.n(r.total)}
                  </div>
                  <div style={{ position: 'relative' }}>
                    <HBar value={r.superficie} max={maxSuperficie} color="#b8a878" height={10} />
                  </div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, textAlign: 'right', color: 'rgba(0,0,0,.75)' }}>
                    {fmt.n(r.superficie)}
                  </div>
                  <div>
                    <Sparkline values={r.trend} width={96} height={22} stroke="#2d4a34" fill="rgba(45,74,52,.12)" strokeWidth={1.3} />
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{
                      display: 'inline-block',
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 11, padding: '2px 8px', borderRadius: 2,
                      background: r.pctIncumplimiento > 30 ? 'rgba(160,64,42,.15)' : r.pctIncumplimiento > 15 ? 'rgba(184,116,26,.15)' : 'rgba(90,122,74,.15)',
                      color: r.pctIncumplimiento > 30 ? '#a0402a' : r.pctIncumplimiento > 15 ? '#b8741a' : '#5a7a4a',
                      fontWeight: 600,
                    }}>
                      {fmt.pct(r.pctCumplimiento, 1)}
                    </span>
                  </div>
                </div>
              );
            })}

          {/* Footer summary */}
          <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, padding: '16px 0 0', borderTop: '2px solid #1a1f1a' }}>
            {[
              ['Media nacional (Resol.)', fmt.n(kAll.total / REGIONES.length)],
              ['Media nacional (Sup.)',  fmt.n(kAll.superficie / REGIONES.length) + ' ha'],
              ['Regiones sobre media',   porRegion.filter(r => r.total > kAll.total / REGIONES.length).length + ' / ' + REGIONES.length],
              ['Regiones en norma',       porRegion.filter(r => r.pctIncumplimiento < 15).length + ' / ' + REGIONES.length],
            ].map(([l, v], i) => (
              <div key={i}>
                <div style={{ fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(0,0,0,.5)', fontWeight: 600 }}>{l}</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, marginTop: 4, letterSpacing: -0.3 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Side detail panel */}
        <aside style={{ background: '#ede9df', padding: '28px 28px 32px', display: 'flex', flexDirection: 'column', gap: 22, overflow: 'auto' }}>
          {regDetail ? (
            <RegionDetail reg={regDetail} data={data} marco={marco} onClose={() => setSelectedReg(null)} />
          ) : (
            <NationalSummary porRegion={porRegion} data={data} marco={marco} />
          )}
        </aside>
      </section>

      {/* Bottom: small multiples — trend per region */}
      <section style={{ padding: '28px 40px 40px', borderTop: '1px solid rgba(26,31,26,.12)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: -0.3 }}>Tendencia quinquenal · small multiples</div>
            <div style={{ fontSize: 11, color: 'rgba(0,0,0,.55)', marginTop: 2 }}>Resoluciones {ANIOS[0]}–{ANIOS[ANIOS.length-1]} · eje Y común</div>
          </div>
          <div style={{ fontSize: 11, color: 'rgba(0,0,0,.55)', fontFamily: "'JetBrains Mono', monospace" }}>
            máx. regional: {fmt.n(Math.max(...porRegion.flatMap(r => r.trend)))}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(13, 1fr)', gap: 10 }}>
          {porRegion.map(r => {
            const maxTr = Math.max(...porRegion.flatMap(x => x.trend), 1);
            const latest = r.trend[r.trend.length - 1];
            const prev = r.trend[r.trend.length - 2];
            const delta = ((latest - prev) / (prev || 1)) * 100;
            return (
              <div key={r.cod}
                onClick={() => setSelectedReg(r.cod)}
                style={{ background: '#fff', padding: '10px 10px 8px', border: '1px solid rgba(0,0,0,.06)', cursor: 'pointer', transition: 'border-color .15s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#2d4a34'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(0,0,0,.06)'}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: '#2d4a34', fontSize: 12 }}>{r.cod}</div>
                  <div style={{ fontSize: 9.5, color: Math.abs(delta) < 1 ? 'rgba(0,0,0,.4)' : delta > 0 ? '#5a7a4a' : '#a0402a', fontFamily: "'JetBrains Mono', monospace" }}>
                    {delta > 0 ? '▲' : '▼'}{fmt.dec(Math.abs(delta), 0)}%
                  </div>
                </div>
                <div style={{ margin: '6px 0 2px' }}>
                  <Sparkline values={r.trend} width={100} height={34} stroke="#2d4a34" fill="rgba(45,74,52,.12)" strokeWidth={1.4} dots />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: 10 }}>
                  <span style={{ color: 'rgba(0,0,0,.5)' }}>{r.nombre.slice(0, 10)}</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{fmt.n(latest)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function RegionDetail({ reg, data, marco, onClose }) {
  // Distribution by marco for this region
  const rows = window.FORESTAL_DATA.aggregate(data, { anio: 'all', region: reg.cod, marco });
  const grupos = {};
  for (const r of rows) grupos[r.grupoNombre] = (grupos[r.grupoNombre] || 0) + 1;
  const gruposArr = Object.entries(grupos).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxG = gruposArr[0]?.[1] || 1;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing: 1.4, textTransform: 'uppercase', color: 'rgba(0,0,0,.55)', fontWeight: 600 }}>Detalle regional</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 36, fontWeight: 700, color: '#2d4a34', lineHeight: 1, marginTop: 4 }}>{reg.cod}</div>
          <div style={{ fontSize: 18, fontWeight: 500, marginTop: 2 }}>{reg.nombre}</div>
        </div>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'rgba(0,0,0,.4)', fontSize: 22, cursor: 'pointer', lineHeight: 1 }}>×</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <DetailStat label="Resoluciones" v={fmt.n(reg.total)} />
        <DetailStat label="Superficie" v={fmt.n(reg.superficie) + ' ha'} />
        <DetailStat label="Bonos Art.22" v={fmt.n(reg.bonos)} sub={fmt.clpShort(reg.montoBonos)} />
        <DetailStat label="Cumplimiento" v={fmt.pct(reg.pctCumplimiento, 1)} color={reg.pctIncumplimiento > 30 ? '#a0402a' : reg.pctIncumplimiento > 15 ? '#b8741a' : '#5a7a4a'} />
      </div>

      <div>
        <div style={{ fontSize: 9, letterSpacing: 1.4, textTransform: 'uppercase', color: 'rgba(0,0,0,.55)', fontWeight: 600, marginBottom: 10 }}>Composición por marco</div>
        <StackBar segments={[
          { label: 'DL 701', value: reg.porMarco['DL 701'], color: MARCO_COLORS['DL 701'] },
          { label: 'Ley 20.283', value: reg.porMarco['Ley 20.283'], color: MARCO_COLORS['Ley 20.283'] },
          { label: 'DS 490', value: reg.porMarco['DS 490'], color: MARCO_COLORS['DS 490'] },
        ]} height={12} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginTop: 6, fontFamily: "'JetBrains Mono', monospace" }}>
          <span style={{ color: MARCO_COLORS['DL 701'] }}>DL701 {fmt.n(reg.porMarco['DL 701'])}</span>
          <span style={{ color: MARCO_COLORS['Ley 20.283'] }}>20.283 {fmt.n(reg.porMarco['Ley 20.283'])}</span>
          <span style={{ color: MARCO_COLORS['DS 490'] }}>DS490 {fmt.n(reg.porMarco['DS 490'])}</span>
        </div>
      </div>

      <div>
        <div style={{ fontSize: 9, letterSpacing: 1.4, textTransform: 'uppercase', color: 'rgba(0,0,0,.55)', fontWeight: 600, marginBottom: 10 }}>Top grupos normativos</div>
        {gruposArr.map(([name, n]) => (
          <div key={name} style={{ display: 'grid', gridTemplateColumns: '1fr 44px', gap: 8, alignItems: 'center', padding: '4px 0', fontSize: 11 }}>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'rgba(0,0,0,.8)' }}>{name}</div>
              <HBar value={n} max={maxG} color="#2d4a34" bg="rgba(45,74,52,.1)" height={4} />
            </div>
            <div style={{ textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{fmt.n(n)}</div>
          </div>
        ))}
      </div>

      <div>
        <div style={{ fontSize: 9, letterSpacing: 1.4, textTransform: 'uppercase', color: 'rgba(0,0,0,.55)', fontWeight: 600, marginBottom: 6 }}>Tendencia {ANIOS[0]}–{ANIOS[ANIOS.length-1]}</div>
        <div style={{ background: '#fff', padding: '10px 10px 4px', border: '1px solid rgba(0,0,0,.08)' }}>
          <Sparkline values={reg.trend} width={300} height={48} stroke="#2d4a34" fill="rgba(45,74,52,.14)" strokeWidth={1.8} dots />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'rgba(0,0,0,.5)', fontFamily: "'JetBrains Mono', monospace", marginTop: 4 }}>
            {ANIOS.map(y => <span key={y}>{y}</span>)}
          </div>
        </div>
      </div>
    </>
  );
}

function NationalSummary({ porRegion, data, marco }) {
  const top3 = porRegion.slice().sort((a, b) => b.total - a.total).slice(0, 3);
  const bottom3 = porRegion.slice().sort((a, b) => b.pctIncumplimiento - a.pctIncumplimiento).slice(0, 3);

  return (
    <>
      <div>
        <div style={{ fontSize: 9, letterSpacing: 1.4, textTransform: 'uppercase', color: 'rgba(0,0,0,.55)', fontWeight: 600 }}>Panel nacional</div>
        <div style={{ fontSize: 20, fontWeight: 600, marginTop: 4, letterSpacing: -0.3, lineHeight: 1.2 }}>
          Chile continental, {REGIONES.length} regiones
        </div>
        <div style={{ fontSize: 12, color: 'rgba(0,0,0,.55)', marginTop: 6, lineHeight: 1.5 }}>
          Seleccione una región en el ranking para ver detalle regional, composición por marco y tendencia quinquenal.
        </div>
      </div>

      <div>
        <div style={{ fontSize: 9, letterSpacing: 1.4, textTransform: 'uppercase', color: 'rgba(0,0,0,.55)', fontWeight: 600, marginBottom: 10 }}>
          Top 3 · volumen resoluciones
        </div>
        {top3.map((r, i) => (
          <div key={r.cod} style={{ display: 'grid', gridTemplateColumns: '22px 60px 1fr 70px', gap: 8, alignItems: 'center', padding: '7px 0', borderBottom: '1px solid rgba(0,0,0,.08)' }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 16, fontWeight: 700, color: ['#2d4a34', '#5a7a4a', '#8a9f7a'][i] }}>0{i + 1}</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, color: '#2d4a34' }}>{r.cod}</div>
            <div style={{ fontSize: 12 }}>{r.nombre}</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", textAlign: 'right', fontSize: 12 }}>{fmt.n(r.total)}</div>
          </div>
        ))}
      </div>

      <div>
        <div style={{ fontSize: 9, letterSpacing: 1.4, textTransform: 'uppercase', color: '#a0402a', fontWeight: 600, marginBottom: 10 }}>
          Alertas · mayor incumplimiento
        </div>
        {bottom3.map((r, i) => (
          <div key={r.cod} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 70px', gap: 8, alignItems: 'center', padding: '7px 0', borderBottom: '1px solid rgba(0,0,0,.08)' }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, color: '#2d4a34' }}>{r.cod}</div>
            <div style={{ fontSize: 12 }}>{r.nombre}</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", textAlign: 'right', fontSize: 12, color: '#a0402a', fontWeight: 600 }}>{fmt.pct(r.pctIncumplimiento, 1)}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 'auto', padding: '14px 16px', background: '#2d4a34', color: '#f0eee7' }}>
        <div style={{ fontSize: 9, letterSpacing: 1.4, textTransform: 'uppercase', color: '#9fc6ab', fontWeight: 600, marginBottom: 6 }}>Nota metodológica</div>
        <div style={{ fontSize: 11, lineHeight: 1.55 }}>
          Orden regional sur-norte de CONAF. Plazos hábiles excluyen sáb/dom. Festivos pendientes (librería holidays).
        </div>
      </div>
    </>
  );
}

function DetailStat({ label, v, sub, color }) {
  return (
    <div style={{ background: '#fff', padding: '10px 12px', border: '1px solid rgba(0,0,0,.06)' }}>
      <div style={{ fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(0,0,0,.55)', fontWeight: 600 }}>{label}</div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 600, marginTop: 4, color: color || '#1a1f1a', letterSpacing: -0.3 }}>{v}</div>
      {sub && <div style={{ fontSize: 10, color: 'rgba(0,0,0,.55)', marginTop: 2, fontFamily: "'JetBrains Mono', monospace" }}>{sub}</div>}
    </div>
  );
}

window.V3Territorial = V3Territorial;
