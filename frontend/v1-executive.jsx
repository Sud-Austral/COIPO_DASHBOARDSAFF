// V1 — Informe Ejecutivo (editorial sobrio)
// Tone: impreso, jefatural, tipografía serif editorial en titulares.

const { fmt, REGIONES, ANIOS, GRUPOS } = window.FORESTAL_DATA;

function V1Executive() {
  const data = React.useMemo(() => window.FORESTAL_DATA.genDataset(), []);
  const [anio, setAnio] = React.useState(2025);
  const [region, setRegion] = React.useState('all');
  const [marco, setMarco] = React.useState('all');

  const rowsNow = window.FORESTAL_DATA.aggregate(data, { anio, region, marco });
  const rowsPrev = window.FORESTAL_DATA.aggregate(data, { anio: anio - 1, region, marco });
  const k = window.FORESTAL_DATA.kpis(rowsNow);
  const kPrev = window.FORESTAL_DATA.kpis(rowsPrev);

  const delta = (a, b) => (b ? ((a - b) / b * 100) : 0);

  // trends by year
  const trendMarco = ['DL 701', 'Ley 20.283', 'DS 490'].map(m => ({
    name: m,
    color: MARCO_COLORS[m],
    values: ANIOS.map(y => window.FORESTAL_DATA.aggregate(data, { anio: y, region, marco: m }).length),
  }));

  // regional table
  const regiones = REGIONES.map(r => {
    const rRows = window.FORESTAL_DATA.aggregate(rowsNow, { region: r.cod });
    const kk = window.FORESTAL_DATA.kpis(rRows);
    return { ...r, ...kk };
  });

  const printDate = '21 abril 2026';

  return (
    <div style={{
      fontFamily: "'Inter', system-ui, sans-serif",
      background: '#f7f5f0',
      color: '#1a1f1a',
      width: '100%',
      height: '100%',
      overflow: 'auto',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* header masthead */}
      <header style={{ padding: '28px 48px 24px', borderBottom: '1px solid rgba(26,31,26,.15)', background: '#f7f5f0' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 32 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 10, letterSpacing: 1.6, textTransform: 'uppercase', color: 'rgba(26,31,26,.55)', marginBottom: 14, fontWeight: 600 }}>
              <span style={{ display: 'inline-block', width: 22, height: 22, background: '#2d4a34', color: '#f7f5f0', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>UF</span>
              Unidad de Fiscalización Forestal · Subgerencia de Administración y Fiscalización
            </div>
            <h1 style={{
              fontFamily: "'Fraunces', 'Times New Roman', serif",
              fontSize: 44, fontWeight: 400, lineHeight: 1.05, letterSpacing: -1,
              margin: 0, fontOpticalSizing: 'auto', fontVariationSettings: "'SOFT' 50",
            }}>
              Informe de Gestión <span style={{ fontStyle: 'italic', color: '#2d4a34' }}>— Solicitudes Forestales</span>
            </h1>
            <p style={{ margin: '12px 0 0', fontSize: 14, color: 'rgba(26,31,26,.65)', maxWidth: 680, lineHeight: 1.55 }}>
              Consolidado de solicitudes resueltas bajo DL 701, Ley 20.283 y DS 490. Volúmenes, superficies aprobadas,
              bonificaciones del Artículo 22 y cumplimiento de plazos legales por región y año.
            </p>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase', color: 'rgba(26,31,26,.5)', fontWeight: 600 }}>Emisión</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, marginTop: 3 }}>{printDate}</div>
            <div style={{ display: 'flex', gap: 6, marginTop: 14, justifyContent: 'flex-end' }}>
              <button style={btnLight}>Exportar PDF</button>
              <button style={btnDark}>Excel · 8 hojas</button>
            </div>
          </div>
        </div>

        {/* filters row */}
        <div style={{ display: 'flex', gap: 24, marginTop: 26, paddingTop: 18, borderTop: '1px dashed rgba(26,31,26,.15)', alignItems: 'flex-end' }}>
          <FilterSelect label="Año" value={anio} onChange={v => setAnio(+v)}
            options={ANIOS.map(y => ({ value: y, label: String(y) }))} width={100} />
          <FilterSelect label="Región" value={region} onChange={setRegion}
            options={[{ value: 'all', label: 'Todas' }, ...REGIONES.map(r => ({ value: r.cod, label: `${r.cod} · ${r.nombre}` }))]} width={180} />
          <FilterSelect label="Marco normativo" value={marco} onChange={setMarco}
            options={[{ value: 'all', label: 'Todos los marcos' }, { value: 'DL 701', label: 'DL 701' }, { value: 'Ley 20.283', label: 'Ley 20.283' }, { value: 'DS 490', label: 'DS 490' }]} width={170} />
          <div style={{ marginLeft: 'auto', fontSize: 11, color: 'rgba(26,31,26,.55)', fontFamily: "'JetBrains Mono', monospace" }}>
            {fmt.n(k.total)} resoluciones en vista · base {fmt.n(data.length)}
          </div>
        </div>
      </header>

      {/* KPI strip */}
      <section style={{ padding: '36px 48px 8px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0 }}>
        <KpiCell label="Total solicitudes resueltas" value={fmt.n(k.total)} delta={delta(k.total, kPrev.total)} note={`vs ${anio - 1}`} big />
        <KpiCell label="Bonificaciones Art. 22" value={fmt.n(k.bonos)} sub={fmt.clpShort(k.montoBonos)} delta={delta(k.bonos, kPrev.bonos)} note={`vs ${anio - 1}`} big />
        <KpiCell label="Superficie aprobada" value={fmt.n(k.superficie) + ' ha'} delta={delta(k.superficie, kPrev.superficie)} note={`vs ${anio - 1}`} big />
        <KpiCell label="Incumplimiento de plazos" value={fmt.pct(k.pctIncumplimiento, 1)} delta={delta(k.pctIncumplimiento, kPrev.pctIncumplimiento)} invert note={`vs ${anio - 1}`} big />
      </section>

      {/* Two-column body */}
      <section style={{ display: 'grid', gridTemplateColumns: '1.15fr .85fr', gap: 48, padding: '8px 48px 36px', alignItems: 'flex-start' }}>
        {/* LEFT: narrative + chart */}
        <div>
          <BlockTitle num="01" title="Volumen por marco normativo" sub={`Evolución ${ANIOS[0]}–${ANIOS[ANIOS.length-1]}`} />
          <div style={{ background: '#fff', padding: '24px 28px 28px', border: '1px solid rgba(26,31,26,.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
              <div style={{ display: 'flex', gap: 18 }}>
                {trendMarco.map(s => (
                  <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12 }}>
                    <span style={{ width: 10, height: 10, background: s.color, borderRadius: 1 }} />
                    <span style={{ fontWeight: 500 }}>{s.name}</span>
                    <span style={{ color: 'rgba(0,0,0,.5)', fontFamily: "'JetBrains Mono', monospace" }}>
                      {fmt.n(s.values[ANIOS.indexOf(anio)])}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <LineMulti series={trendMarco} width={580} height={220} />
            <p style={{ marginTop: 20, fontSize: 13, color: 'rgba(26,31,26,.7)', lineHeight: 1.6, fontFamily: "'Fraunces', serif", fontStyle: 'italic' }}>
              El DS 490 (control de productos) continúa representando el mayor flujo de resoluciones. El volumen
              bajo DL 701 muestra estabilidad en el quinquenio; Ley 20.283 creció sostenidamente hasta 2024.
            </p>
          </div>

          <BlockTitle num="02" title="Distribución por marco" sub="Participación relativa" style={{ marginTop: 36 }} />
          <div style={{ background: '#fff', padding: '24px 28px', border: '1px solid rgba(26,31,26,.08)', display: 'flex', gap: 36, alignItems: 'center' }}>
            <Donut
              size={170} thickness={28}
              centerValue={fmt.n(k.total)}
              centerLabel="Resoluciones"
              segments={[
                { label: 'DL 701',     value: k.porMarco['DL 701'],     color: MARCO_COLORS['DL 701'] },
                { label: 'Ley 20.283', value: k.porMarco['Ley 20.283'], color: MARCO_COLORS['Ley 20.283'] },
                { label: 'DS 490',     value: k.porMarco['DS 490'],     color: MARCO_COLORS['DS 490'] },
              ]}
            />
            <div style={{ flex: 1 }}>
              {[['DL 701', 'Plantaciones forestales — planes de manejo, normas y avisos de ejecución'],
                ['Ley 20.283', 'Bosque nativo — avisos, planes, bonificaciones Art. 22'],
                ['DS 490', 'Control de productos — guías, declaraciones, marcaje']].map(([m, desc]) => {
                const v = k.porMarco[m];
                return (
                  <div key={m} style={{ paddingBottom: 12, marginBottom: 12, borderBottom: '1px solid rgba(0,0,0,.06)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: 13 }}>
                        <span style={{ width: 9, height: 9, background: MARCO_COLORS[m] }} />{m}
                      </div>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>
                        {fmt.n(v)} <span style={{ color: 'rgba(0,0,0,.5)', fontSize: 11 }}>· {fmt.pct(v / k.total * 100, 1)}</span>
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(0,0,0,.55)', lineHeight: 1.4 }}>{desc}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT: compliance pillar */}
        <div>
          <BlockTitle num="03" title="Cumplimiento de plazos" sub="Semáforo regional" />
          <div style={{ background: '#fff', border: '1px solid rgba(26,31,26,.08)', padding: '20px 0 0' }}>
            {/* big ring */}
            <div style={{ padding: '4px 28px 18px', display: 'flex', gap: 24, alignItems: 'center' }}>
              <ComplianceDial pct={k.pctCumplimiento} size={120} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase', color: 'rgba(0,0,0,.5)', fontWeight: 600 }}>Cumplimiento global</div>
                <div style={{ fontFamily: "'Fraunces', serif", fontSize: 42, fontWeight: 400, letterSpacing: -1, lineHeight: 1, marginTop: 4 }}>
                  {fmt.pct(k.pctCumplimiento, 1)}
                </div>
                <div style={{ fontSize: 12, color: 'rgba(0,0,0,.6)', marginTop: 8, lineHeight: 1.5 }}>
                  {fmt.n(k.conPlazo - k.fueraPlazo)} de {fmt.n(k.conPlazo)} resoluciones dentro del plazo legal.
                  {' '}{fmt.n(k.fueraPlazo)} fuera de plazo.
                </div>
              </div>
            </div>

            <div style={{ padding: '6px 20px 12px', borderTop: '1px solid rgba(0,0,0,.06)' }}>
              <div style={{ fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase', color: 'rgba(0,0,0,.5)', fontWeight: 600, padding: '12px 8px 8px' }}>Por región</div>
              {regiones.slice(0, 13).map(r => (
                <div key={r.cod} style={{ display: 'grid', gridTemplateColumns: '46px 1fr 80px 60px', gap: 10, alignItems: 'center', padding: '5px 8px', fontSize: 12 }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, color: '#2d4a34' }}>{r.cod}</div>
                  <div style={{ color: 'rgba(0,0,0,.8)' }}>{r.nombre}</div>
                  <div style={{ position: 'relative' }}>
                    <HBar value={r.pctIncumplimiento} max={40}
                      color={r.pctIncumplimiento > 30 ? '#a0402a' : r.pctIncumplimiento > 15 ? '#b8741a' : '#5a7a4a'} />
                  </div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, textAlign: 'right', color: r.pctIncumplimiento > 30 ? '#a0402a' : r.pctIncumplimiento > 15 ? '#b8741a' : '#5a7a4a' }}>
                    {fmt.pct(r.pctIncumplimiento, 1)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* pull quote */}
          <div style={{ marginTop: 30, padding: '22px 26px', background: '#2d4a34', color: '#f7f5f0' }}>
            <div style={{ fontSize: 10, letterSpacing: 1.6, textTransform: 'uppercase', color: 'rgba(247,245,240,.6)', fontWeight: 600 }}>Hallazgo</div>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 20, lineHeight: 1.35, marginTop: 8, fontStyle: 'italic' }}>
              {k.pctIncumplimiento < 15
                ? `Se alcanza un cumplimiento global superior al 85% en el periodo.`
                : `El incumplimiento global se mantiene en ${fmt.pct(k.pctIncumplimiento, 1)}. Se recomienda revisión en regiones sobre 20%.`}
            </div>
          </div>
        </div>
      </section>

      {/* section break */}
      <div style={{ padding: '0 48px', margin: '4px 0 32px' }}>
        <div style={{ height: 1, background: 'rgba(26,31,26,.15)' }} />
      </div>

      {/* Regional detail */}
      <section style={{ padding: '0 48px 56px' }}>
        <BlockTitle num="04" title="Detalle regional" sub={`Resoluciones · superficies · bonos — ${anio}`} />
        <div style={{ background: '#fff', border: '1px solid rgba(26,31,26,.08)' }}>
          <DataTable
            columns={[
              { key: 'cod', label: 'Región', mono: true, render: r => <span style={{ fontWeight: 600, color: '#2d4a34' }}>{r.cod}</span> },
              { key: 'nombre', label: 'Nombre' },
              { key: 'total', label: 'Resol.', align: 'right', mono: true, render: r => fmt.n(r.total) },
              { key: 'DL 701', label: 'DL 701', align: 'right', mono: true, render: r => fmt.n(r.porMarco['DL 701']) },
              { key: 'Ley 20.283', label: 'Ley 20.283', align: 'right', mono: true, render: r => fmt.n(r.porMarco['Ley 20.283']) },
              { key: 'DS 490', label: 'DS 490', align: 'right', mono: true, render: r => fmt.n(r.porMarco['DS 490']) },
              { key: 'superficie', label: 'Superficie', align: 'right', mono: true, render: r => fmt.n(r.superficie) + ' ha' },
              { key: 'bonos', label: 'Bonos Art.22', align: 'right', mono: true, render: r => fmt.n(r.bonos) },
              { key: 'montoBonos', label: 'Monto', align: 'right', mono: true, render: r => fmt.clpShort(r.montoBonos) },
              { key: 'cumpl', label: 'Cumplimiento', align: 'right', render: r => <StatusPill pct={r.pctIncumplimiento} size="sm" /> },
            ]}
            rows={regiones}
            maxRows={13}
            onRowClick={r => setRegion(r.cod)}
          />
        </div>
        <div style={{ marginTop: 10, fontSize: 11, color: 'rgba(26,31,26,.5)', fontStyle: 'italic', fontFamily: "'Fraunces', serif" }}>
          Click en una fila para filtrar el informe por esa región. Orden sur-norte de CONAF. Monto expresado en millones de pesos.
        </div>
      </section>

      <footer style={{ padding: '24px 48px', borderTop: '1px solid rgba(26,31,26,.15)', display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'rgba(26,31,26,.5)', fontFamily: "'JetBrains Mono', monospace", letterSpacing: 0.5, marginTop: 'auto' }}>
        <span>Informe generado por pipeline intento1.py · estandarizar → calcular_fuera_plazo → exportar_informe</span>
        <span>Plazos hábiles: excluyen sáb/dom · festivos pendientes</span>
        <span>Pág. 01 / 08</span>
      </footer>
    </div>
  );
}

// ─── sub-components ───────────────────────────────────────

function KpiCell({ label, value, sub, delta, note, invert = false, big = false }) {
  const up = delta > 0;
  const good = invert ? !up : up;
  const col = Math.abs(delta) < 0.5 ? 'rgba(0,0,0,.5)' : (good ? '#5a7a4a' : '#a0402a');
  return (
    <div style={{ borderRight: '1px solid rgba(26,31,26,.12)', padding: '4px 28px 4px 0', marginRight: 28 }}>
      <div style={{ fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase', color: 'rgba(0,0,0,.55)', fontWeight: 600 }}>{label}</div>
      <div style={{
        fontFamily: "'Fraunces', serif", fontWeight: 400,
        fontSize: big ? 38 : 28, letterSpacing: -1, lineHeight: 1.1, marginTop: 10,
      }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: 'rgba(0,0,0,.55)', fontFamily: "'JetBrains Mono', monospace", marginTop: 4 }}>{sub}</div>}
      {delta != null && (
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: col, fontWeight: 500 }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {up ? '▲' : '▼'} {fmt.dec(Math.abs(delta), 1)}%
          </span>
          <span style={{ color: 'rgba(0,0,0,.4)' }}>{note}</span>
        </div>
      )}
    </div>
  );
}

function BlockTitle({ num, title, sub, style = {} }) {
  return (
    <div style={{ marginBottom: 18, display: 'flex', alignItems: 'flex-end', gap: 16, ...style }}>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'rgba(0,0,0,.45)', letterSpacing: 1 }}>{num}</span>
      <div>
        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 400, letterSpacing: -0.4, lineHeight: 1.1 }}>{title}</div>
        {sub && <div style={{ fontSize: 12, color: 'rgba(0,0,0,.55)', marginTop: 2 }}>{sub}</div>}
      </div>
      <div style={{ flex: 1, height: 1, background: 'rgba(26,31,26,.12)', marginBottom: 6 }} />
    </div>
  );
}

function ComplianceDial({ pct, size = 120 }) {
  const r = size/2 - 10;
  const c = 2 * Math.PI * r;
  const len = (pct/100) * c;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#eceae4" strokeWidth={10} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#2d4a34" strokeWidth={10}
          strokeDasharray={`${len} ${c}`} strokeLinecap="butt" />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <div style={{ fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(0,0,0,.5)' }}>Cumple</div>
      </div>
    </div>
  );
}

const btnLight = {
  padding: '7px 14px', fontSize: 12, fontFamily: 'inherit',
  background: 'transparent', color: '#1a1f1a',
  border: '1px solid rgba(26,31,26,.3)', cursor: 'pointer', borderRadius: 2,
};
const btnDark = {
  padding: '7px 14px', fontSize: 12, fontFamily: 'inherit',
  background: '#2d4a34', color: '#f7f5f0',
  border: '1px solid #2d4a34', cursor: 'pointer', borderRadius: 2,
};

window.V1Executive = V1Executive;
