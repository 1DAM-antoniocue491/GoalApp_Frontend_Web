import Badge from "../../../../components/ui/Badge";

interface LiveMatchCardProps {
    league: string;
    home: string;
    away: string;
    score: string;
    minute: string;
}

export default function LiveMatchCard({ league, home, away, score, minute }: LiveMatchCardProps) {
    return (
        <div className="flex flex-col gap-4 bg-zinc-900 p-3 rounded-xl border border-red-500/25">
            <div className="flex flex-row justify-between items-center">
                <p className="text-zinc-500 text-[12px]">{league}</p>
                <div className="flex flex-row items-center gap-1.5">
                    <div className="bg-red-500 w-2 h-2 rounded-full animate-pulse"></div>
                    <Badge variant="danger" size="sm">EN VIVO</Badge>
                    <Badge variant="danger" size="sm">{minute}</Badge>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-2 justify-between items-center">
                <p className="text-zinc-300 text-[12px] font-semibold">{home}</p>
                <p className="text-zinc-300 bg-zinc-800 px-3 rounded-lg font-semibold">{score}</p>
                <p className="text-zinc-300 text-[12px] font-semibold">{away}</p>
            </div>
        </div>
    );
}