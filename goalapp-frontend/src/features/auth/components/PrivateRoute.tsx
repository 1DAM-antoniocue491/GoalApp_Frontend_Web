import { Navigate } from "react-router";
import { getToken } from "../services/authApi";

interface PrivateRouteProps {
    children: React.ReactNode;
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
    const token = getToken();

    if (!token) {
        // No hay token, redirigir a login
        return <Navigate to="/login" replace />;
    }

    // Hay token, mostrar el contenido protegido
    return <>{children}</>;
}