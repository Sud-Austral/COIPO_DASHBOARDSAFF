import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  FilterX, 
  ArrowRight,
  Maximize2,
  FileJson,
  Calendar
} from 'lucide-react';
import { useResoluciones } from '../../../shared/api/resoluciones';
import { useFilterStore } from '../../../app/store/useFilterStore';
import { useAggregates } from '../../../shared/hooks/useAggregates';
import { useKpis } from '../../../shared/hooks/useKpis';
import { fmt } from '../../../shared/utils/formatters';
import { Button, cn } from '../../../shared/components/ui/Button';
import { Card } from '../../../shared/components/ui/Card';
import { Select } from '../../../shared/components/ui/Select';
import { DataTable } from '../../../shared/components/DataTable';
import { StatusPill, ProgressBar } from '../../../shared/components/StatusVisuals';
import { Sparkline } from '../../../shared/components/Charts';
import { ANALISTAS, ABOGADOS, REGIONES, MARCO_COLORS } from '../../../mocks/constants';

const ControlPage: React.FC = () => {
  const { filters, setFilter, resetFilters } = useFilterStore();
  const { data: allData, isLoading } = useResoluciones();
  const [searchTerm, setSearchTerm] = useState('');
  
  const rows = useAggregates(allData, filters);
  const k = useKpis(rows);

  const filteredBySearch = useMemo(() => {
    if (!searchTerm) return rows;
    const term = searchTerm.toLowerCase();
    return rows.filter(r => 
      String(r.id).includes(term) || 
      r.analista.toLowerCase().includes(term) || 
      r.regionNombre.toLowerCase().includes(term)
    );
  }, [rows, searchTerm]);

  // Analyst workload
  const analystMetrics = useMemo(() => {
    const map = new Map();
    rows.forEach(r => {
      if (!map.has(r.analista)) map.set(r.analista, { total: 0, late: 0 });
      const m = map.get(r.analista);
      m.total++;
      if (r.fueraPlazo) m.late++;
    });
    return Array.from(map.entries())
      .map(([name, stats]) => ({ name, ...stats, pct: (stats.late / stats.total) * 100 }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);
  }, [rows]);

  if (isLoading) return <div className="p-8 text-center text-forest-500 animate-pulse">Iniciando Centro de Control...</div>;

  return (
    <div className="grid grid-cols-12 gap-6 animate-page-transition">
      {/* Sidebar de filtros locales densos */}
      <Card variant="dark" className="col-span-12 lg:col-span-3 xl:col-span-2 h-fit space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-4 text-forest-300">
            <FilterX size={14} />
            <h3 className="text-xs font-bold uppercase tracking-widest">Filtros Operativos</h3>
          </div>
          <div className="space-y-4">
            <Select 
              variant="dark"
              label="Región" 
              value={filters.region} 
              onChange={(e) => setFilter('region', e.target.value)}
              options={[{ value: 'all', label: 'Nacional' }, ...REGIONES.map(r => ({ value: r.cod, label: r.nombre }))]}
            />
            <Select 
              variant="dark"
              label="Marco Legal" 
              value={filters.marco} 
              onChange={(e) => setFilter('marco', e.target.value as any)}
              options={[{ value: 'all', label: 'Todos' }, { value: 'DL 701', label: 'DL 701' }, { value: 'Ley 20.283', label: 'Ley 20.283' }, { value: 'DS 490', label: 'DS 490' }]}
            />
            <Select 
              variant="dark"
              label="Analista Técnico" 
              value={filters.analista} 
              onChange={(e) => setFilter('analista', e.target.value)}
              options={[{ value: 'all', label: 'Todos' }, ...ANALISTAS.map(a => ({ value: a, label: a }))]}
            />
            <Select 
              variant="dark"
              label="Abogado Visador" 
              value={filters.abogado} 
              onChange={(e) => setFilter('abogado', e.target.value)}
              options={[{ value: 'all', label: 'Todos' }, ...ABOGADOS.map(a => ({ value: a, label: a }))]}
            />
          </div>
        </div>

        <div className="pt-4 border-t border-forest-800">
          <div className="flex items-center gap-2 mb-2 text-forest-300">
            <Search size={14} />
            <h3 className="text-xs font-bold uppercase tracking-widest">Búsqueda Rápida</h3>
          </div>
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ID o Región..."
            className="w-full bg-[#1a1f20] border-[#272b2c] rounded p-2 text-xs text-white focus:border-forest-500 outline-none"
          />
        </div>

        <Button variant="ghost" className="w-full text-[10px] text-gray-500" onClick={resetFilters}>
          Restablecer parámetros
        </Button>
      </Card>

      {/* Grid Principal */}
      <div className="col-span-12 lg:col-span-9 xl:col-span-10 space-y-6">
        {/* KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <MiniKpi label="Resoluciones" value={fmt.n(k.total)} color="forest" />
          <MiniKpi label="Fuera de Plazo" value={fmt.n(k.fueraPlazo)} color="red" alert={k.pctIncumplimiento > 20} />
          <MiniKpi label="Bonos Art. 22" value={fmt.n(k.bonos)} sub={fmt.clpShort(k.montoBonos)} color="amber" />
          <MiniKpi label="Superficie" value={fmt.n(k.superficie)} suffix="ha" color="white" />
          <div className="col-span-1 hidden xl:block">
            <Card className="h-full flex items-center justify-center bg-forest-500 text-white border-none">
               <div className="text-center">
                 <p className="text-[10px] uppercase font-bold tracking-widest opacity-80">Cumplimiento</p>
                 <p className="text-2xl font-mono font-black">{fmt.pct(k.pctCumplimiento, 1)}</p>
               </div>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Carga de Trabajo Analistas */}
          <Card 
            title="Carga de Trabajo: Analistas Téc." 
            subtitle="Top 8 por volumen de solicitudes"
            className="col-span-12 xl:col-span-5"
          >
            <div className="space-y-4">
               {analystMetrics.map((a, i) => (
                 <div key={a.name} className="flex flex-col gap-1">
                   <div className="flex justify-between items-center text-[11px]">
                     <span className="font-bold text-gray-700">{a.name}</span>
                     <span className="font-mono text-gray-400">{a.total} solicitudes</span>
                   </div>
                   <div className="flex items-center gap-3">
                     <div className="flex-1">
                        <ProgressBar 
                          value={a.total} 
                          max={analystMetrics[0].total} 
                          color={a.pct > 30 ? '#a0402a' : (a.pct > 15 ? '#b8741a' : '#2d4a34')} 
                        />
                     </div>
                     <span className={cn(
                       "text-[10px] font-mono font-bold w-10 text-right",
                       a.pct > 15 ? "text-institutional-amber" : "text-gray-400"
                     )}>
                       {Math.round(a.pct)}%
                     </span>
                   </div>
                 </div>
               ))}
            </div>
          </Card>

          {/* Tramitación Temporal */}
          <Card 
            title="Tiempos de Tramitación (Días)" 
            subtitle="Promedio por fase técnica y legal"
            className="col-span-12 xl:col-span-7"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
               <TimeDonut label="Informe Técnico" value={Math.round(rows.reduce((s,r) => s+r.diasIT, 0) / (rows.length || 1))} color="#2d4a34" target={30} />
               <TimeDonut label="Informe Legal" value={Math.round(rows.reduce((s,r) => s+r.diasIL, 0) / (rows.length || 1))} color="#b8741a" target={20} />
               <TimeDonut label="Visado / Firma" value={Math.round(rows.reduce((s,r) => s+r.diasVisado, 0) / (rows.length || 1))} color="#6b8c5a" target={10} />
            </div>
          </Card>

          {/* Tabla de Drill-down */}
          <Card 
            title="Últimas Resoluciones Registradas" 
            subtitle={`${filteredBySearch.length} encontradas`}
            className="col-span-12"
            headerAction={<Button size="sm" variant="outline" className="text-[10px]">Ver Archivo Completo</Button>}
          >
            <DataTable 
              columns={[
                { key: 'id', label: 'Solicitud', mono: true, render: r => <span className="font-bold text-forest-600">#{r.id}</span> },
                { key: 'region', label: 'Reg', mono: true },
                { key: 'marco', label: 'Marco', render: r => <span className="text-[10px] px-1.5 py-0.5 rounded border border-gray-100 font-bold" style={{ color: MARCO_COLORS[r.marco] }}>{r.marco}</span> },
                { key: 'grupoNombre', label: 'Grupo/Trámite', render: r => <span className="truncate block max-w-[180px]" title={r.grupoNombre}>{r.grupoNombre}</span> },
                { key: 'analista', label: 'Analista' },
                { key: 'diasTotal', label: 'Total Días', align: 'right', mono: true },
                { key: 'plazo', label: 'Plazo', align: 'right', mono: true, render: r => r.plazoDias ?? '—' },
                { key: 'status', label: 'Estado', align: 'center', render: r => (
                  <span className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tighter",
                    r.estado === 'Aprobado' ? "bg-green-50 text-green-700" : (r.estado === 'Rechazado' ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700")
                  )}>
                    {r.estado}
                  </span>
                )},
                { key: 'compliance', label: 'Plazos', align: 'right', render: r => <span className={cn("text-[10px] font-bold", r.fueraPlazo ? "text-institutional-red" : "text-institutional-green")}>{r.fueraPlazo ? 'FUERA' : 'OK'}</span> },
              ]}
              rows={filteredBySearch}
              maxRows={15}
              onRowClick={(r) => console.log('Drill down:', r)}
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

function MiniKpi({ label, value, sub, suffix, color, alert }: any) {
  const colors: any = {
    forest: 'bg-forest-50 border-forest-100 text-forest-900',
    red: 'bg-red-50 border-red-100 text-red-900',
    amber: 'bg-amber-50 border-amber-100 text-amber-900',
    white: 'bg-white border-gray-100 text-gray-900',
  };
  return (
    <div className={cn("p-4 border rounded relative overflow-hidden", colors[color])}>
      {alert && <div className="absolute top-1 right-1"><AlertCircle size={12} className="text-institutional-red animate-pulse" /></div>}
      <p className="text-[9px] uppercase font-bold tracking-[0.15em] opacity-60 mb-1">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-mono font-bold tracking-tighter">{value}</span>
        {suffix && <span className="text-[10px] font-semibold opacity-60">{suffix}</span>}
      </div>
      {sub && <p className="text-[9px] font-mono mt-1 opacity-60 truncate">{sub}</p>}
    </div>
  );
}

function TimeDonut({ label, value, color, target }: any) {
  const pct = Math.min(100, (value / (target * 1.5)) * 100);
  return (
    <div className="flex flex-col items-center text-center gap-3">
       <div className="relative w-24 h-24">
          <svg className="w-full h-full" viewBox="0 0 36 36">
             <path className="text-gray-100 stroke-current" strokeWidth="2.5" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
             <path className="stroke-current transition-all duration-1000" strokeWidth="3" strokeDasharray={`${pct}, 100`} strokeLinecap="round" fill="none" style={{ color }} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
             <span className="text-lg font-mono font-black" style={{ color }}>{value}</span>
             <span className="text-[8px] font-bold text-gray-400 -mt-1">DÍAS</span>
          </div>
       </div>
       <div>
         <p className="text-xs font-bold text-gray-700">{label}</p>
         <p className="text-[10px] text-gray-400 italic">Meta: {target} d</p>
       </div>
    </div>
  );
}

export default ControlPage;
