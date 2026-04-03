import { HTMLAttributes, ReactNode } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    children: ReactNode;
    variant?: "success" | "warning" | "danger" | "info" | "default";
    size?: "sm" | "md";
}

export default function Badge({
    children,
    variant = "default",
    size = "md",
    className = "",
    ...props
}: BadgeProps) {

    const baseStyles = "font-semibold rounded-full inline-flex items-center";

    const variants = {
        success: "bg-lime-300/25 text-lime-300",
        warning: "bg-yellow-500/25 text-yellow-500",
        danger: "bg-red-500/25 text-red-500",
        info: "bg-blue-400/25 text-blue-400",
        default: "bg-zinc-700 text-zinc-400"
    };

    const sizes = {
        sm: "px-2 py-0.5 text-[10px]",
        md: "px-2 py-1 text-xs"
    };

    return (
        <span
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {children}
        </span>
    );
}