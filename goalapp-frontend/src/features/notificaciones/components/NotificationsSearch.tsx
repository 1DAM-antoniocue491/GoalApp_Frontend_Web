import { FaSearch, FaFilter, FaClock, FaUser, FaChartLine, FaTrophy } from 'react-icons/fa';

export type CategoryFilter = 'all' | 'live' | 'results' | 'teams' | 'players' | 'stats';

export default function NotificationsSearch({ 
  search, 
  onSearch, 
  category, 
  onCategoryChange 
}: { 
  search: string;
  onSearch: (value: string) => void;
  category: CategoryFilter;
  onCategoryChange: (value: CategoryFilter) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="relative">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
        <input
          type="text"
          placeholder="Buscar notificaciones..."
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-lime-500 focus:ring-1 focus:ring-lime-500 transition-colors"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <CategoryButton 
          label="Todas" 
          icon={FaFilter}
          active={category === 'all'} 
          onClick={() => onCategoryChange('all')} 
        />
        <CategoryButton 
          label="En vivo" 
          icon={FaClock}
          active={category === 'live'} 
          onClick={() => onCategoryChange('live')} 
        />
        <CategoryButton 
          label="Resultados" 
          icon={FaTrophy}
          active={category === 'results'} 
          onClick={() => onCategoryChange('results')} 
        />
        <CategoryButton 
          label="Equipos" 
          icon={FaUser}
          active={category === 'teams'} 
          onClick={() => onCategoryChange('teams')} 
        />
        <CategoryButton 
          label="Estadísticas" 
          icon={FaChartLine}
          active={category === 'stats'} 
          onClick={() => onCategoryChange('stats')} 
        />
      </div>
    </div>
  );
}

function CategoryButton({ 
  label, 
  icon: Icon, 
  active, 
  onClick 
}: { 
  label: string; 
  icon: React.ElementType; 
  active: boolean; 
  onClick: () => void; 
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
        active
          ? 'bg-lime-500 text-zinc-900'
          : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
      }`}
    >
      <Icon className="w-3 h-3" />
      {label}
    </button>
  );
}
