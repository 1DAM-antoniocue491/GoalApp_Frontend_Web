import Card from "../../../../components/ui/Card";

interface QuickActionButtonProps {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    onClick?: () => void;
}

export default function QuickActionButton({ icon: Icon, label, onClick }: QuickActionButtonProps) {
    return (
        <Card
            variant="default"
            padding="md"
            className="flex flex-col justify-center items-center gap-2 w-full md:w-1/3 cursor-pointer hover:bg-zinc-700 transition-colors"
            onClick={onClick}
        >
            <div className="bg-lime-300/25 border-lime-300 p-2 rounded-md">
                <Icon className="text-lime-300"/>
            </div>
            <p className="text-white font-semibold text-md text-center">
                {label}
            </p>
        </Card>
    );
}