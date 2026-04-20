import { useState, useEffect } from 'react';
import { FaSpinner, FaExclamationCircle, FaChartBar, FaUser } from 'react-icons/fa';
import Nav from '../../../components/Nav';
import { useSelectedLeague } from '../../../context/SelectedLeagueContext';
import { apiGet } from '../../../services/api';

interface UsuarioConRol {
  id_usuario: number;
  nombre: string;
  email: string;
  id_rol: number;
  rol: string;
}

export default function StatisticPage() {
  const { selectedLeague } = useSelectedLeague();
  const leagueName = selectedLeague?.nombre;
  const userRole = selectedLeague?.rol;

  const [usuarios, setUsuarios] = useState<UsuarioConRol[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUsuarios = async () => {
    if (!selectedLeague) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await apiGet<UsuarioConRol[]>(`/usuarios/ligas/${selectedLeague.id}/usuarios`);
      setUsuarios(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar los usuarios';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsuarios();
  }, [selectedLeague]);

  // Sin liga seleccionada
  if (!selectedLeague) {
    return (
      <>
        <Nav />
        <div className="bg-zinc-950 min-h-[calc(100vh-48px)] flex items-center justify-center">
          <div className="text-center">
            <FaChartBar className="text-zinc-600 text-5xl mx-auto mb-4" />
            <p className="text-zinc-400 text-sm">Selecciona una liga primero</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Nav leagueName={leagueName} userRole={userRole} />
      <div className="bg-zinc-950 min-h-[calc(100vh-48px)] p-6">
        <h1 className="text-white text-xl font-semibold mb-6">Estadísticas</h1>

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <FaSpinner className="animate-spin text-lime-400 text-3xl mb-4" />
            <p className="text-zinc-400 text-sm">Cargando estadísticas...</p>
          </div>
        )}

        {/* Error */}
        {error && !isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <FaExclamationCircle className="text-red-400 text-4xl mb-4" />
            <p className="text-red-400 text-sm mb-4">{error}</p>
            <button
              onClick={loadStats}
              className="text-lime-300 text-sm font-semibold hover:text-lime-400 transition-colors"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Empty */}
        {!isLoading && !error && usuarios.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <FaUser className="text-zinc-600 text-5xl mb-4" />
            <p className="text-zinc-400 text-sm">No hay usuarios con rol en esta liga</p>
          </div>
        )}

        {/* Usuarios table */}
        {!isLoading && !error && usuarios.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-700">
                  <th className="text-left text-zinc-400 font-semibold py-3 px-2">#</th>
                  <th className="text-left text-zinc-400 font-semibold py-3 px-2">Usuario</th>
                  <th className="text-left text-zinc-400 font-semibold py-3 px-2">Email</th>
                  <th className="text-center text-zinc-400 font-semibold py-3 px-2">Rol</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((usuario, index) => (
                  <tr key={usuario.id_usuario} className="border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                    <td className="py-3 px-2 text-zinc-500">{index + 1}</td>
                    <td className="py-3 px-2 text-white font-medium">{usuario.nombre}</td>
                    <td className="py-3 px-2 text-zinc-400">{usuario.email}</td>
                    <td className="py-3 px-2 text-center text-lime-400 font-semibold">{usuario.rol}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}