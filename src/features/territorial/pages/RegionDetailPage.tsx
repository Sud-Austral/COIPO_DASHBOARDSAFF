import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X, TrendingUp, TrendingDown, Layers, FileText } from 'lucide-react';
import { useResoluciones } from '../../../shared/api/resoluciones';
import { useFilterStore } from '../../../app/store/useFilterStore';
import { useAggregates } from '../../../shared/hooks/useAggregates';
import { useKpis } from '../../../shared/hooks/useKpis';
import { fmt } from '../../../shared/utils/formatters';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { DonutChart } from '../../../shared/components/Charts';
import { ProgressBar } from '../../../shared/components/StatusVisuals';
import { MARCO_COLORS, GRUPOS } from '../../../mocks/constants';

const RegionDetailPage: React.FC = () => {
  const { codigo } = useParams();
  const navigate = useNavigate();
  const { filters } = useFilterStore();
  const { data: allData } = useResoluciones();
  
  const regionData = useMemo(() => {
    if (!allData || !codigo) return [];
    return allData.filter(r => r.region === codigo && (filters.anio === 'all' || r.anio === filters.anio));
  }, [allData, codigo, filters.anio]);

  const k = useKpis(regionData);

  const marcoDistribution = [
    { name: 'DL 701', value: k.porMarco['DL 701'], color: MARCO_COLORS['DL 701'] },
    { name: 'Ley 20.283', value: k.porMarco['Ley 20.283'], color: MARCO_COLORS['Ley 20.283'] },
    { name: 'DS 490', value: k.porMarco['DS 490'], color: MARCO_COLORS['DS 490'] },
  ];

  const groupDistribution = useMemo(() => {
    const counts = new Map();
    regionData.forEach(r => {
      counts.set(r.grupoNombre, (counts.get(r.grupoNombre) || 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a,b) => b.count - a.count)
      .slice(0, 5);
  }, [regionData]);

  if (!codigo) return null;

  return (
    <Card className="bg-white shadow-2xl border-none p-6 space-y-8 animate-page-transition h-fit sticky top-24">
      <div className="flex justify-between items-start">
         <div className="space-y-1">
            <h4 className="text-4xl font-black text-forest-900 tracking-tighter">{codigo}</h4>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{regionData[0]?.regionNombre}</p>
         </div>
         <button 
           onClick={() => navigate('/territorios')}
           className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
         >
           <X size={20} />
         </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
         <DetailStat label="Solicitudes" value={fmt.n(k.total)} icon={<FileText size={14} className="opacity-40" />} />
         <DetailStat label="Superficie" value={fmt.n(k.superficie)} suffix="ha" icon={<Layers size={14} className="opacity-40" />} />
      </div>

      <div className="space-y-4">
         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Cumplimiento Legal</p>
         <div className="flex items-center justify-between">
            <span className={cn(
              "text-3xl font-black font-mono tracking-tighter",
              k.pctIncumplimiento > 15 ? "text-institutional-amber" : "text-institutional-green"
            )}>
              {fmt.pct(k.pctCumplimiento, 1)}
            </span>
            <div className="text-right">
               <p className="text-[10px] font-bold text-gray-700">{fmt.n(k.conPlazo - k.fueraPlazo)} a tiempo</p>
               <p className="text-[10px] text-gray-400">{fmt.n(k.fueraPlazo)} retrasados</p>
            </div>
         </div>
         <ProgressBar value={k.pctCumplimiento} max={100} color={k.pctIncumplimiento > 15 ? '#b8741a' : '#2d4a34'} />
      </div>

      <div className="space-y-4">
         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Composición Normativa</p>
         <div className="h-40">
            <DonutChart data={marcoDistribution} centerLabel="Marco" />
         </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-gray-100">
         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Principales Trámites</p>
         <div className="space-y-3">
            {groupDistribution.map(g => (
              <div key={g.name} className="space-y-1">
                 <div className="flex justify-between text-[11px]">
                   <span className="font-bold text-gray-700 truncate max-w-[200px]">{g.name}</span>
                   <span className="font-mono text-gray-400">{(g.count)}</span>
                 </div>
                 <ProgressBar value={g.count} max={groupDistribution[0].count} height={4} color="#2d4a34" />
              </div>
            ))}
         </div>
      </div>

      <Button variant="primary" className="w-full gap-2">
         Ver Detalle de Analistas
         <TrendingUp size={14} />
      </Button>
    </Card>
  );
};

function DetailStat({ label, value, suffix, icon }: any) {
  return (
    <div className="bg-gray-50/50 p-3 rounded space-y-1 border border-gray-100">
       <div className="flex justify-between items-center">
         <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
         {icon}
       </div>
       <div className="flex items-baseline gap-1">
         <span className="text-xl font-mono font-bold tracking-tighter text-forest-900">{value}</span>
         {suffix && <span className="text-[10px] font-bold text-gray-300">{suffix}</span>}
       </div>
    </div>
  );
}

export default RegionDetailPage;
