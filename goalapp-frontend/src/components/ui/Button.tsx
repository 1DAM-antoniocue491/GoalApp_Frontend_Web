import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "danger" | "ghost";
    size?: "sm" | "md" | "lg";
    fullWidth?: boolean;
    children: ReactNode;
}

export default function Button({
    variant = "primary",
    size = "md",
    fullWidth = false,
    children,
    className = "",
    disabled,
    ...props
}: ButtonProps) {

    const baseStyles = "font-semibold rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2";

    const variants = {
        primary: "bg-lime-300 text-zinc-900 hover:bg-lime-400",
        secondary: "bg-zinc-700 text-white hover:bg-zinc-600",
        danger: "bg-red-500 text-white hover:bg-red-600",
        ghost: "bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-800"
    };

    const sizes = {
        sm: "px-3 py-1 text-xs",
        md: "px-4 py-2 text-sm",
        lg: "px-6 py-3 text-base"
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? "w-full" : ""} ${className}`}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
}