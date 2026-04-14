import Card from "../../../../components/ui/Card";

interface SummaryCardProps {
    label: string;
    value: number | string;
    color?: "lime" | "blue" | "purple" | "orange";
}

export default function SummaryCard({ label, value, color = "lime" }: SummaryCardProps) {
    const colors = {
        lime: "text-lime-300",
        blue: "text-blue-400",
        purple: "text-purple-400",
        orange: "text-orange-400"
    };

    return (
        <Card variant="default" padding="sm">
            <p className="text-zinc-500 text-sm">{label}</p>
            <p className={`${colors[color]} font-bold text-3xl`}>{value}</p>
        </Card>
    );
}