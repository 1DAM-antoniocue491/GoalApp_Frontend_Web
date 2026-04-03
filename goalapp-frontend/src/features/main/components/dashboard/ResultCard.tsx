import Card from "../../../../components/ui/Card";

interface ResultCardProps {
    league: string;
    home: string;
    away: string;
    score: string;
    status: string;
}

export default function ResultCard({ league, home, away, score, status }: ResultCardProps) {
    return (
        <div>
            {/* DESKTOP */}
            <Card variant="default" padding="sm" className="hidden sm:flex flex-row justify-between items-end gap-4">
                <div className="flex flex-col gap-2">
                    <p className="text-zinc-500 text-[12px]">{league}</p>
                    <p className="text-zinc-300 text-[12px] font-semibold">{home}</p>
                </div>

                <div className="flex flex-col items-center">
                    <p className="text-zinc-300 bg-zinc-800 px-3 rounded-lg font-semibold">{score}</p>
                    <p className="text-zinc-600 text-[10px]">{status}</p>
                </div>

                <p className="text-zinc-300 text-[12px] font-semibold">{away}</p>
            </Card>

            {/* MOBILE */}
            <Card variant="default" padding="sm" className="flex flex-row justify-between items-center gap-4 px-7 sm:hidden">
                <div>
                    <p className="text-zinc-500 text-[12px]">{league}</p>
                    <p className="text-zinc-600 text-[10px]">{status}</p>
                </div>

                <div className="flex flex-col justify-center items-center gap-1">
                    <p className="text-zinc-300 text-[12px] font-semibold">{home}</p>
                    <p className="text-zinc-300 bg-zinc-800 px-3 rounded-lg font-semibold">{score}</p>
                    <p className="text-zinc-300 text-[12px] font-semibold">{away}</p>
                </div>
            </Card>
        </div>
    );
}