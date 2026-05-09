import { FaRegClock } from "react-icons/fa";
import Badge from "../../../../components/ui/Badge";

interface UpcomingMatchCardProps {
    teams: string;
    league?: string;
    time: string;
}

export default function UpcomingMatchCard({ teams, time }: UpcomingMatchCardProps) {
    return (
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 bg-zinc-900 px-3 py-2 rounded-xl">
            <div className="flex flex-row gap-2 items-center">
                <FaRegClock className="text-zinc-500"/>
                <div>
                    <p className="text-zinc-300 text-[12px] font-semibold">{teams}</p>
                </div>
            </div>
            <Badge variant="info">{time}</Badge>
        </div>
    );
}