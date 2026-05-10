import { useState, useEffect } from 'react';
import { FaCalendar, FaClock, FaTimes, FaFutbol } from 'react-icons/fa';
import { updateMatch, type MatchUpdatePayload } from '../../match/services/matchApi';
import type { DashboardUpcomingMatch } from '../../../../main/services/dashboardApi';
import { useToast } from '../../../contexts/ToastContext';

interface EditMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  match: DashboardUpcomingMatch & {
    nombre_equipo_local: string;
    nombre_equipo_visitante: string;
  };
}

export default function EditMatchModal({ isOpen, onClose, onSuccess, match }: EditMatchModalProps) {
  const toast = useToast();
  // Estados del formulario
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [estado, setEstado] = useState<'programado' | 'en_juego' | 'finalizado' | 'cancelado' | 'suspendido'>('programado');
  const [isLoading, setIsLoading] = useState(false);

  // Inicializar formulario con datos del partido
  useEffect(() => {
    if (isOpen && match) {
      const dateObj = new Date(match.fecha_completa || `${match.date}T${match.time}:00`);
      const year = dateObj.getUTCFullYear();
      const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getUTCDate()).padStart(2, '0');
      const hours = String(dateObj.getUTCHours()).padStart(2, '0');
      const minutes = String(dateObj.getUTCMinutes()).padStart(2, '0');

      setFecha(`${year}-${month}-${day}`);
      setHora(`${hours}:${minutes}`);
      setEstado(match.estado || 'programado');
    }
  }, [isOpen, match]);

  const handleSave = async () => {
    if (!fecha || !hora) {
      toast.showError('La fecha y la hora son obligatorios');
      return;
    }

    setIsLoading(true);
    try {
      const payload: MatchUpdatePayload = {
        fecha: `${fecha}T${hora}:00Z`,
        estado,
      };

      await updateMatch(match.id_partido, payload);
      toast.showSuccess('Partido actualizado exitosamente');
      handleCancel();
      onSuccess();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al actualizar el partido';
      toast.showError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFecha('');
    setHora('');
    setEstado('programado');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1e] border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-800">
          <div>
            <h2 className="text-white text-2xl font-bold">Editar Partido</h2>
            <p className="text-gray-400 text-sm mt-1">Modifica los datos del encuentro</p>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-500 hover:text-white transition-colors"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Formulario */}
        <div className="p-6 space-y-6">
          {/* Fecha y Hora */}
          <div>
            <h3 className="text-white font-semibold mb-3">Fecha y hora</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <input
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="w-full bg-gray-900/50 border border-gray-800 rounded-xl px-4 py-3 text-white pr-12 focus:outline-none focus:border-lime-500/50 transition-colors"
                />
                <FaCalendar className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" />
              </div>
              <div className="relative">
                <input
                  type="time"
                  value={hora}
                  onChange={(e) => setHora(e.target.value)}
                  className="w-full bg-gray-900/50 border border-gray-800 rounded-xl px-4 py-3 text-white pr-12 focus:outline-none focus:border-lime-500/50 transition-colors"
                />
                <FaClock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" />
              </div>
            </div>
          </div>

          {/* Estado del partido */}
          <div>
            <h3 className="text-white font-semibold mb-3">Estado</h3>
            <div className="relative">
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value as typeof estado)}
                className="w-full bg-gray-900/50 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-lime-500/50 transition-colors appearance-none"
              >
                <option value="programado">Programado</option>
                <option value="en_juego">En Juego</option>
                <option value="finalizado">Finalizado</option>
                <option value="cancelado">Cancelado</option>
                <option value="suspendido">Suspendido</option>
              </select>
              <FaFutbol className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            </div>
          </div>


        </div>

        {/* Botones de acción */}
        <div className="flex gap-3 p-6 border-t border-gray-800">
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="flex-1 px-6 py-3 rounded-xl border border-gray-800 text-white font-semibold hover:bg-gray-800/50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="flex-1 bg-gradient-to-r from-[#c5f52a] via-[#c5f52a] to-[#2a5a55] text-black font-bold py-3 rounded-xl hover:scale-[1.02] transition-all disabled:opacity-50"
          >
            {isLoading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    </div>
  );
}
