import React from 'react';
import { Search, Bell, Sun, Moon, Calendar } from 'lucide-react';
import { useFilterStore } from '../store/useFilterStore';
import { ANIOS } from '../../mocks/constants';
import { Select } from '../../shared/components/ui/Select';

export const Header: React.FC = () => {
  const { filters, setFilter } = useFilterStore();
  const [isDark, setIsDark] = React.useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 shrink-0 z-20">
      <div className="flex items-center gap-8">
        <div className="hidden md:flex items-center gap-4">
          <Select 
            label="Año de Gestión" 
            value={filters.anio} 
            onChange={(e) => setFilter('anio', parseInt(e.target.value) || 'all')}
            options={[
              { value: 'all', label: 'Todos los años' },
              ...ANIOS.map(y => ({ value: y, label: String(y) }))
            ]}
            className="w-32"
          />
        </div>
        
        <div className="h-8 w-[1px] bg-gray-100 hidden md:block" />

        <div className="relative group hidden lg:block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input 
            type="text" 
            placeholder="Buscar solicitud..." 
            className="pl-10 pr-4 py-2 bg-gray-50 border-transparent focus:bg-white focus:border-forest-500 border rounded text-xs w-64 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={toggleTheme}
          className="p-2 text-gray-400 hover:text-forest-500 hover:bg-forest-50 rounded-full transition-all"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button className="p-2 text-gray-400 hover:text-forest-500 hover:bg-forest-50 rounded-full transition-all relative">
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-institutional-red rounded-full border-2 border-white" />
        </button>
        <div className="h-8 w-[1px] bg-gray-100 mx-1" />
        <div className="flex items-center gap-3 pl-2">
          <img 
            src="https://www.conaf.cl/wp-content/themes/conaf/img/logo-conaf.png" 
            alt="CONAF" 
            className="h-8 opacity-80"
          />
        </div>
      </div>
    </header>
  );
};
