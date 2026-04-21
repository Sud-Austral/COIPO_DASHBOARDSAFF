import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Download, FileSpreadsheet, FileText, TrendingUp, TrendingDown, Users, Ruler, Clock } from 'lucide-react';
import { useResoluciones } from '../../../shared/api/resoluciones';
import { useFilterStore } from '../../../app/store/useFilterStore';
import { useAggregates } from '../../../shared/hooks/useAggregates';
import { useKpis } from '../../../shared/hooks/useKpis';
import { fmt } from '../../../shared/utils/formatters';
import { Button, cn } from '../../../shared/components/ui/Button';
import { Card } from '../../../shared/components/ui/Card';
import { MultiLineChart, DonutChart } from '../../../shared/components/Charts';
import { DataTable, Column } from '../../../shared/components/DataTable';
import { StatusPill } from '../../../shared/components/StatusVisuals';
import { ANIOS, MARCO_COLORS, REGIONES } from '../../../mocks/constants';
import { Resolucion } from '../../../shared/types';

const InformePage: React.FC = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  const { filters, setFilter } = useFilterStore();
  const { data: allData, isLoading } = useResoluciones();
  
  const rowsNow = useAggregates(allData, filters);
  const rowsPrev = useAggregates(allData, { ...filters, anio: filters.anio !== 'all' ? filters.anio - 1 : 'all' });
  
  const k = useKpis(rowsNow);
  const kPrev = useKpis(rowsPrev);

  const handlePrint = useReactToPrint({
    content: () => contentRef.current,
    documentTitle: `Informe_Gestion_Forestal_${filters.anio}`,
  });

  const delta = (a: number, b: number) => (b ? ((a - b) / b * 100) : 0);

  // chart data
  const trendData = ANIOS.map(y => {
    const d = allData || [];
    return {
      name: String(y),
      'DL 701': d.filter(r => r.anio === y && r.marco === 'DL 701' && (filters.region === 'all' || r.region === filters.region)).length,
      'Ley 20.283': d.filter(r => r.anio === y && r.marco === 'Ley 20.283' && (filters.region === 'all' || r.region === filters.region)).length,
      'DS 490': d.filter(r => r.anio === y && r.marco === 'DS 490' && (filters.region === 'all' || r.region === filters.region)).length,
    };
  });

  const donutData = [
    { name: 'DL 701', value: k.porMarco['DL 701'], color: MARCO_COLORS['DL 701'] },
    { name: 'Ley 20.283', value: k.porMarco['Ley 20.283'], color: MARCO_COLORS['Ley 20.283'] },
    { name: 'DS 490', value: k.porMarco['DS 490'], color: MARCO_COLORS['DS 490'] },
  ];

  const regionalTableData = REGIONES.map(r => {
    const rRows = rowsNow.filter(x => x.region === r.cod);
    const kk = useKpis(rRows);
    return { ...r, ...kk, id: r.cod };
  }).sort((a, b) => b.total - a.total);

  if (isLoading) return <LoadingPlaceholder />;

  return (
    <div className="space-y-8 pb-12 animate-page-transition">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-medium tracking-tight text-forest-900">Informe de Gestión</h1>
          <p className="text-sm text-gray-500 mt-1 max-w-2xl">
            Consolidado anual de solicitudes resueltas, cumplimiento de plazos y superficies bajo gestión forestal.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => {}} className="gap-2">
            <FileSpreadsheet size={16} />
            <span className="hidden sm:inline">Excel</span>
          </Button>
          <Button variant="primary" onClick={handlePrint} className="gap-2">
            <FileText size={16} />
            <span>Generar PDF</span>
          </Button>
        </div>
      </div>

      <div ref={contentRef} className="bg-white p-8 sm:p-12 shadow-xl border border-gray-100 min-h-[1056px] flex flex-col gap-12 print:shadow-none print:border-none print:p-0">
        {/* Masthead */}
        <div className="border-b-2 border-forest-500/20 pb-8 flex justify-between items-start">
          <div className="space-y-4">
             <div className="flex items-center gap-3">
               <div className="px-1 py-0.5 bg-forest-500 text-white font-black text-[10px]">UF</div>
               <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Unidad de Fiscalización · SAF / CONAF</span>
             </div>
             <h2 className="text-5xl font-serif leading-none text-forest-900">
               Estado de <span className="italic text-forest-600">Resoluciones</span>
             </h2>
             <div className="flex items-center gap-4 text-xs font-mono text-gray-500">
                <span>{filters.anio !== 'all' ? `Periodo ${filters.anio}` : 'Histórico Completo'}</span>
                <span>•</span>
                <span>Región: {filters.region === 'all' ? 'Multiregional' : filters.region}</span>
             </div>
          </div>
          <div className="text-right">
             <div className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Emisión</div>
             <div className="text-sm font-mono mt-1">{new Date().toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
          </div>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
          <KpiBox 
            label="Solicitudes Resueltas" 
            value={fmt.n(k.total)} 
            delta={delta(k.total, kPrev.total)} 
            suffix="docs"
            icon={<FileText className="text-forest-200" size={24} />}
          />
          <KpiBox 
            label="Bonificaciones Art. 22" 
            value={fmt.n(k.bonos)} 
            sub={fmt.clpShort(k.montoBonos)}
            delta={delta(k.bonos, kPrev.bonos)} 
            icon={<TrendingUp className="text-forest-200" size={24} />}
          />
          <KpiBox 
            label="Superficie Aprobada" 
            value={fmt.n(k.superficie)} 
            suffix="ha"
            delta={delta(k.superficie, kPrev.superficie)} 
            icon={<Ruler className="text-forest-200" size={24} />}
          />
          <KpiBox 
            label="Tasa Incumplimiento" 
            value={fmt.pct(k.pctIncumplimiento, 1)} 
            delta={delta(k.pctIncumplimiento, kPrev.pctIncumplimiento)} 
            invert
            icon={<Clock className="text-forest-200" size={24} />}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-4">
             <div className="flex items-center gap-4">
                <span className="text-xs font-mono text-forest-500 font-bold">01</span>
                <h3 className="text-xl font-serif">Volumen por Marco Normativo</h3>
                <div className="flex-1 h-px bg-gray-100" />
             </div>
             <div className="h-[280px]">
                <MultiLineChart 
                  data={trendData} 
                  series={[
                    { key: 'DL 701', name: 'DL 701', color: MARCO_COLORS['DL 701'] },
                    { key: 'Ley 20.283', name: 'Ley 20.283', color: MARCO_COLORS['Ley 20.283'] },
                    { key: 'DS 490', name: 'DS 490', color: MARCO_COLORS['DS 490'] },
                  ]}
                  categories={ANIOS.map(String)}
                />
             </div>
             <p className="text-xs text-gray-500 italic font-serif leading-relaxed">
               * Prevalencia de trámites bajo DS 490 en zonas extremas; estabilidad observada en plantaciones DL 701.
             </p>
          </div>

          <div className="space-y-4">
             <div className="flex items-center gap-4">
                <span className="text-xs font-mono text-forest-500 font-bold">02</span>
                <h3 className="text-xl font-serif">Distribución porcentual</h3>
                <div className="flex-1 h-px bg-gray-100" />
             </div>
             <div className="flex flex-col sm:flex-row items-center gap-8">
               <div className="w-48">
                 <DonutChart data={donutData} centerValue={fmt.n(k.total)} centerLabel="Total" />
               </div>
               <div className="flex-1 space-y-4 w-full">
                  {donutData.map(d => (
                    <div key={d.name} className="flex items-center justify-between border-b border-gray-50 pb-2">
                       <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                          <span className="text-xs font-bold">{d.name}</span>
                       </div>
                       <div className="text-xs font-mono">
                          {fmt.n(d.value)} <span className="text-gray-400 opacity-60 ml-2">{fmt.pct(d.value/k.total*100, 0)}</span>
                       </div>
                    </div>
                  ))}
               </div>
             </div>
          </div>
        </div>

        {/* Regional Detail */}
        <div className="space-y-4 mt-auto">
          <div className="flex items-center gap-4">
             <span className="text-xs font-mono text-forest-500 font-bold">03</span>
             <h3 className="text-xl font-serif">Resumen por Región Administrativa</h3>
             <div className="flex-1 h-px bg-gray-100" />
          </div>
          <DataTable 
            columns={[
              { key: 'cod', label: 'Cód', mono: true, render: r => <span className="font-bold text-forest-600">{r.cod}</span> },
              { key: 'nombre', label: 'Región' },
              { key: 'total', label: 'Resol.', align: 'right', mono: true },
              { key: 'superficie', label: 'Sup (ha)', align: 'right', mono: true, render: r => fmt.n(r.superficie) },
              { key: 'bonos', label: 'Bonos', align: 'right', mono: true, render: r => fmt.n(r.bonos) },
              { key: 'montoBonos', label: 'Monto', align: 'right', mono: true, render: r => fmt.clpShort(r.montoBonos) },
              { key: 'compliance', label: 'Cumplimiento', align: 'right', render: r => <StatusPill pct={r.pctIncumplimiento} size="sm" /> },
            ]}
            rows={regionalTableData}
            maxRows={15}
          />
        </div>

        {/* Footer */}
        <footer className="mt- auto pt-8 border-t border-gray-100 flex justify-between text-[9px] font-mono text-gray-400 uppercase tracking-widest">
           <span>Dashboard v1.0.0 · Generado vía SAF Core</span>
           <span>Pág 1/1</span>
           <span>CONAF - Todos los derechos reservados</span>
        </footer>
      </div>
    </div>
  );
};

function KpiBox({ label, value, sub, delta, suffix, invert, icon }: any) {
  const isUp = delta > 0;
  const isGood = invert ? !isUp : isUp;
  const color = Math.abs(delta) < 0.1 ? 'text-gray-400' : (isGood ? 'text-institutional-green' : 'text-institutional-red');

  return (
    <div className="relative">
      <div className="absolute -top-1 -right-1 opacity-10">{icon}</div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">{label}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-serif text-gray-900">{value}</span>
        {suffix && <span className="text-xs text-gray-400 font-mono">{suffix}</span>}
      </div>
      {sub && <p className="text-[10px] font-mono text-gray-500 mt-1">{sub}</p>}
      <div className={cn("flex items-center gap-1 text-[10px] font-bold mt-4", color)}>
        {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        <span>{fmt.dec(Math.abs(delta), 1)}%</span>
        <span className="text-gray-300 font-normal ml-1 whitespace-nowrap">vs periodo anterior</span>
      </div>
    </div>
  );
}

function LoadingPlaceholder() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-12 w-64 bg-gray-200 rounded" />
      <div className="grid grid-cols-4 gap-8">
        {[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-200 rounded" />)}
      </div>
      <div className="h-[400px] bg-gray-200 rounded" />
    </div>
  );
}

export default InformePage;
