import Badge from "../../../../components/ui/Badge";

interface SectionHeaderProps {
    title: string;
    linkText?: string;
    linkHref?: string;
    onLinkClick?: () => void;
    badge?: number | string;
    badgeVariant?: "danger" | "info";
}

export default function SectionHeader({
    title,
    linkText,
    linkHref,
    onLinkClick,
    badge,
    badgeVariant = "danger"
}: SectionHeaderProps) {

    const badgeVariants = {
        danger: "danger" as const,
        info: "info" as const
    };

    return (
        <div className="flex flex-row items-end justify-between">
            <div className="flex flex-row items-center gap-2">
                <p className="text-white font-semibold text-md">{title}</p>
                {badge !== undefined && (
                    <Badge variant={badgeVariants[badgeVariant]} size="sm">
                        {badge}
                    </Badge>
                )}
            </div>

            {linkText && (
                linkHref ? (
                    <a href={linkHref} className="text-blue-400 text-sm hover:underline">
                        {linkText}
                    </a>
                ) : (
                    <button
                        onClick={onLinkClick}
                        className="text-blue-400 text-sm hover:underline"
                    >
                        {linkText}
                    </button>
                )
            )}
        </div>
    );
}