import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, className = "", ...props }, ref) => {

        return (
            <div className="flex flex-col gap-1">
                {label && (
                    <label className="text-sm text-zinc-400 font-semibold">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    className={`
                        focus:outline-none focus:border-lime-300
                        w-full bg-zinc-700 p-2 text-sm rounded-sm
                        placeholder:text-zinc-500 text-zinc-300
                        border border-transparent
                        ${error ? "border-red-500" : ""}
                        ${props.disabled ? "opacity-50 cursor-not-allowed" : ""}
                        ${className}
                    `}
                    {...props}
                />
                {error && (
                    <p className="text-red-500 text-xs">{error}</p>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";

export default Input;