interface ActivityItemProps {
    title: string;
    team: string;
    time: string;
}

export default function ActivityItem({ title, team, time }: ActivityItemProps) {
    return (
        <div className="flex flex-row gap-3">
            <div className="bg-green-500 w-2 h-2 rounded-full mt-1.5"></div>
            <div>
                <p className="text-white text-sm h-4">
                    {title}
                </p>
                <p className="text-lime-300 h-5">
                    {team}
                </p>
                <p className="text-zinc-500 text-[12px]">
                    {time}
                </p>
            </div>
        </div>
    );
}