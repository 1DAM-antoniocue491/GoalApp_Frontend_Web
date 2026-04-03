import { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    variant?: "default" | "bordered" | "elevated";
    padding?: "none" | "sm" | "md" | "lg";
}

export default function Card({
    children,
    variant = "default",
    padding = "md",
    className = "",
    ...props
}: CardProps) {

    const baseStyles = "rounded-xl";

    const variants = {
        default: "bg-zinc-800",
        bordered: "bg-zinc-800 border border-zinc-700",
        elevated: "bg-zinc-800 shadow-lg shadow-zinc-900/50"
    };

    const paddings = {
        none: "",
        sm: "p-3",
        md: "p-5",
        lg: "p-7"
    };

    return (
        <div
            className={`${baseStyles} ${variants[variant]} ${paddings[padding]} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
}