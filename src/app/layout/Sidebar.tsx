import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FileText, 
  Settings, 
  Map as MapIcon, 
  BarChart3, 
  LayoutDashboard,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { cn } from '../../shared/components/ui/Button';

export const Sidebar: React.FC = () => {
  const menuItems = [
    { to: '/informe', icon: FileText, label: 'Informe Ejecutivo', description: 'Vista editorial' },
    { to: '/control', icon: LayoutDashboard, label: 'Centro de Control', description: 'Vista operativa' },
    { to: '/territorios', icon: MapIcon, label: 'Análisis Territorial', description: 'Mapa y ranking' },
  ];

  return (
    <aside className="w-64 bg-forest-900 text-cream-400 flex flex-col h-screen border-r border-forest-800 shrink-0 overflow-y-auto">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-forest-500 text-white rounded flex items-center justify-center font-black text-sm">UF</div>
        <div>
          <h1 className="text-white font-bold text-sm tracking-tight">SAF Forestal</h1>
          <p className="text-[10px] text-forest-300 uppercase tracking-widest font-semibold">Fiscalización</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        <div className="text-[10px] uppercase tracking-widest text-forest-500 font-bold mb-4 px-2">Principales</div>
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => cn(
              "flex flex-col p-3 rounded transition-all group relative",
              isActive 
                ? "bg-forest-500/10 text-white border-l-2 border-forest-500" 
                : "text-forest-300 hover:bg-forest-800 hover:text-white border-l-2 border-transparent"
            )}
          >
            <div className="flex items-center gap-3">
              <item.icon size={18} />
              <span className="font-semibold text-sm">{item.label}</span>
              {/* <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" /> */}
            </div>
            <span className="text-[10px] text-forest-500 ml-7 mt-0.5">{item.description}</span>
          </NavLink>
        ))}

        <div className="mt-8 pt-8 border-t border-forest-800/50 space-y-1">
          <div className="text-[10px] uppercase tracking-widest text-forest-500 font-bold mb-4 px-2">Gestión</div>
          <NavLink
            to="/configuracion"
            className={({ isActive }) => cn(
              "flex items-center gap-3 p-3 rounded transition-all",
              isActive ? "text-white" : "text-forest-300 hover:bg-forest-800 hover:text-white"
            )}
          >
            <Settings size={18} />
            <span className="font-semibold text-sm">Configuración</span>
          </NavLink>
        </div>
      </nav>

      <div className="p-4 mt-auto border-t border-forest-800/50">
        <div className="flex items-center gap-3 p-2">
          <div className="w-8 h-8 rounded-full bg-forest-700 flex items-center justify-center text-xs font-bold text-forest-300">LM</div>
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-bold text-white truncate">Luis Monsalve</p>
            <p className="text-[10px] text-forest-500 truncate">Jefe de Unidad</p>
          </div>
          <button className="text-forest-500 hover:text-white transition-colors">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};
