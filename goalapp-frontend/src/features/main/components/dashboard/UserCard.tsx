import { ReactNode } from "react";
import { TfiCup } from "react-icons/tfi";
import Badge from "../../../../components/ui/Badge";

interface UserCardProps {
    name: string;
    role: string;
    greeting?: string;
    children?: ReactNode;
}

export default function UserCard({ name, role, greeting = "Bienvenido de vuelta 👋", children }: UserCardProps) {
    return (
        <div className="flex flex-row justify-between items-center bg-linear-to-r from-zinc-800 to-zinc-700 rounded-lg p-3">
            <div className="flex flex-col gap-1 justify-center w-full sm:w-auto">
                <p className="text-zinc-500 text-sm">{greeting}</p>
                <h3 className="text-white text-lg font-semibold">{name}</h3>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <Badge variant="success">{role}</Badge>
                    {children}
                </div>
            </div>

            <div className="bg-linear-to-br from-lime-300 to-blue-500 border-lime-300 p-2 rounded-md hidden sm:block">
                <TfiCup className="w-7 h-7"/>
            </div>
        </div>
    );
}