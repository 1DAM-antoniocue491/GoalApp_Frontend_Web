/**
 * Tabs para filtrar ligas en el onboarding
 */

type TabFilter = 'todas' | 'activas' | 'finalizadas' | 'favoritas';

interface OnboardingTabsProps {
  activeTab: TabFilter;
  onTabChange: (tab: TabFilter) => void;
  counts: {
    todas: number;
    activas: number;
    finalizadas: number;
    favoritas: number;
  };
}

const tabs: { key: TabFilter; label: string }[] = [
  { key: 'todas', label: 'Todas' },
  { key: 'activas', label: 'Activas' },
  { key: 'finalizadas', label: 'Finalizadas' },
  { key: 'favoritas', label: 'Favoritas' },
];

export function OnboardingTabs({ activeTab, onTabChange, counts }: OnboardingTabsProps) {
  return (
    <div className="flex gap-1 p-1 bg-zinc-900 rounded-lg overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
            activeTab === tab.key
              ? 'bg-zinc-800 text-white'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
          }`}
        >
          {tab.label}
          <span className="ml-1.5 text-zinc-500">
            ({counts[tab.key]})
          </span>
        </button>
      ))}
    </div>
  );
}

export type { TabFilter };