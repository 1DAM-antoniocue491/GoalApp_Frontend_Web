interface StatsCardProps {
  number: number;
  texto: string;
  color?: string;
  icon?: React.ReactNode;
}

export default function StatsCard({ number, texto, color = 'text-white', icon }: StatsCardProps) {
  return (
    <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 w-1/5">
      <div className="flex items-center gap-2 mb-1">
        {icon && <span className="text-zinc-500">{icon}</span>}
        <span className={`text-2xl font-bold ${color}`}>{number}</span>
      </div>
      <p className="text-zinc-400 text-xs">{texto}</p>
    </div>
  );
}
