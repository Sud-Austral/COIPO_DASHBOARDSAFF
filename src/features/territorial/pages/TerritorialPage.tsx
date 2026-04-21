import React, { useMemo } from 'react';
import { useNavigate, Outlet, useParams } from 'react-router-dom';
import { 
  ArrowUpRight, 
  Map as MapIcon, 
  Activity, 
  BarChart, 
  Compass,
  ArrowRight
} from 'lucide-react';
import { useResoluciones } from '../../../shared/api/resoluciones';
import { useFilterStore } from '../../../app/store/useFilterStore';
import { useAggregates } from '../../../shared/hooks/useAggregates';
import { useKpis } from '../../../shared/hooks/useKpis';
import { fmt } from '../../../shared/utils/formatters';
import { Card } from '../../../shared/components/ui/Card';
import { Sparkline } from '../../../shared/components/Charts';
import { StatusPill, ProgressBar } from '../../../shared/components/StatusVisuals';
import { REGIONES, ANIOS, MARCO_COLORS } from '../../../mocks/constants';
import { cn } from '../../../shared/components/ui/Button';

const TerritorialPage: React.FC = () => {
  const navigate = useNavigate();
  const { codigo } = useParams();
  const { filters } = useFilterStore();
  const { data: allData, isLoading } = useResoluciones();
  
  const rowsAll = useAggregates(allData, filters);
  const kAll = useKpis(rowsAll);

  const regionalStats = useMemo(() => {
    return REGIONES.map((r) => {
      const regionRows = rowsAll.filter(x => x.region === r.cod);
      const k = useKpis(regionRows);
      
      // Calculate trends for sparkline
      const trend = ANIOS.map(y => {
          return (allData || []).filter(x => 
            x.region === r.cod && 
            x.anio === y && 
            (filters.marco === 'all' || x.marco === filters.marco)
          ).length;
      });

      return {
        ...r,
        ...k,
        trend,
        active: codigo === r.cod
      };
    }).sort((a, b) => b.total - a.total);
  }, [rowsAll, allData, filters.marco, codigo]);

  const maxTotal = Math.max(...regionalStats.map(r => r.total), 1);
  const maxSup = Math.max(...regionalStats.map(r => r.superficie), 1);

  if (isLoading) return <div className="p-8">Cargando datos georreferenciados...</div>;

  return (
    <div className="flex flex-col gap-8 animate-page-transition">
      <div className="bg-forest-900 -mx-6 sm:-mx-8 -mt-6 sm:-mt-8 p-8 sm:px-12 sm:pb-24 text-white">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-8">
             <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-forest-500/20 rounded-full text-forest-300 text-[10px] font-bold uppercase tracking-widest border border-forest-500/30">
                  <MapIcon size={12} />
                  Gestión Territorial
                </div>
                <h1 className="text-4xl font-black tracking-tight">Análisis Regional</h1>
                <p className="text-forest-400 max-w-xl text-sm leading-relaxed">
                  Distribución geográfica de las resoluciones forestales. Identificación de brechas de cumplimiento, 
                  volúmenes por región y tendencias históricas por marco normativo.
                </p>
             </div>
             
             <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 w-full md:w-auto">
                <BannerStat label="Regiones Activas" value={REGIONES.length} />
                <BannerStat label="Superficie Total" value={fmt.n(kAll.superficie)} suffix="ha" />
                <BannerStat label="Líder Regional" value={regionalStats[0]?.cod} sub={regionalStats[0]?.nombre} />
             </div>
          </div>
      </div>

      <div className="grid grid-cols-12 gap-8 -mt-12 sm:-mt-16">
        {/* Main Ranking Table Area */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <Card className="shadow-2xl overflow-hidden border-none p-0">
             <div className="p-6 bg-white border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-gray-900">Ranking Nacional de Gestión</h3>
                <div className="flex items-center gap-4 text-[10px] uppercase font-bold text-gray-400">
                  <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-forest-500" /> Resoluciones</div>
                  <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400" /> Superficie</div>
                </div>
             </div>
             
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <tr>
                      <th className="px-6 py-4">Región</th>
                      <th className="px-4 py-4">Volumen</th>
                      <th className="px-4 py-4">Superficie</th>
                      <th className="px-4 py-4">Tendencia</th>
                      <th className="px-4 py-4 text-right">Plazo</th>
                      <th className="px-4 py-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 bg-white">
                    {regionalStats.map((r, i) => (
                      <tr 
                        key={r.cod}
                        onClick={() => navigate(`/territorios/${r.cod}`)}
                        className={cn(
                          "group cursor-pointer transition-all",
                          r.active ? "bg-forest-50" : "hover:bg-gray-50/80"
                        )}
                      >
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-3">
                             <span className="font-mono text-lg font-black text-forest-200 group-hover:text-forest-400 transition-colors w-6">{String(i+1).padStart(2, '0')}</span>
                             <div>
                               <div className="font-bold text-forest-900">{r.cod}</div>
                               <div className="text-[10px] text-gray-400">{r.nombre}</div>
                             </div>
                           </div>
                        </td>
                        <td className="px-4 py-4 min-w-[140px]">
                           <div className="flex items-center gap-3">
                              <div className="flex-1">
                                <ProgressBar value={r.total} max={maxTotal} height={10} color="#2d4a34" />
                              </div>
                              <span className="font-mono font-bold text-xs w-10 text-right">{fmt.n(r.total)}</span>
                           </div>
                        </td>
                        <td className="px-4 py-4 min-w-[140px]">
                           <div className="flex items-center gap-3">
                              <div className="flex-1">
                                <ProgressBar value={r.superficie} max={maxSup} height={10} color="#b8a878" />
                              </div>
                              <span className="font-mono font-bold text-xs w-10 text-right">{fmt.n(r.superficie)}</span>
                           </div>
                        </td>
                        <td className="px-4 py-4">
                           <div className="w-24 h-12">
                             <Sparkline data={r.trend} color="#2d4a34" />
                           </div>
                        </td>
                        <td className="px-4 py-4 text-right whitespace-nowrap">
                           <StatusPill pct={r.pctIncumplimiento} size="sm" />
                        </td>
                        <td className="px-4 py-4">
                           <ArrowRight size={14} className={cn(
                             "transition-transform",
                             r.active ? "text-forest-500 translate-x-1" : "text-gray-300 opacity-0 group-hover:opacity-100"
                           )} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
             </div>
          </Card>
        </div>

        {/* Dynamic Detail Panel */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
           <Outlet />
           {!codigo && (
             <Card className="bg-[#ede9df] border-none shadow-xl border-t-4 border-t-forest-500 text-gray-700 py-10 px-8">
               <Compass className="text-forest-500 mb-6" size={48} strokeWidth={1.5} />
               <h4 className="text-xl font-bold tracking-tight mb-3">Selección Territorial</h4>
               <p className="text-sm text-gray-600 leading-relaxed">
                 Elija una región del ranking para ver el desglose técnico, composición por marco legal y comparativa quinquenal detallada.
               </p>
               <div className="mt-8 space-y-4">
                  <div className="flex items-center gap-3 text-xs">
                     <div className="w-1.5 h-1.5 rounded-full bg-forest-500" />
                     <span>Distribución por grupo operativo</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                     <div className="w-1.5 h-1.5 rounded-full bg-forest-500" />
                     <span>Evolución anual de trámites</span>
                  </div>
               </div>
             </Card>
           )}
        </div>
      </div>
    </div>
  );
};

function BannerStat({ label, value, suffix, sub }: any) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-bold uppercase tracking-widest text-forest-400">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-mono font-black">{value}</span>
        {suffix && <span className="text-xs font-bold text-forest-500">{suffix}</span>}
      </div>
      {sub && <p className="text-[11px] text-forest-300 truncate">{sub}</p>}
    </div>
  );
}

export default TerritorialPage;
