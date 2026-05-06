import { useEffect, useState } from 'react';
import { FaPlay, FaTimes, FaCalendar, FaUsers, FaMapMarkerAlt, FaTrophy } from 'react-icons/fa';
import { getInitials } from '../../../utils/getInitials';

interface InitMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  localTeam: { nombre: string };
  visitanteTeam: { nombre: string };
  fecha: string;
  competicion: string;
  campo: string;
}

export default function InitMatchModal({
  isOpen,
  onClose,
  onConfirm,
  localTeam,
  visitanteTeam,
  fecha,
  competicion,
  campo,
}: InitMatchModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Resetear estado al cerrar
  useEffect(() => {
    if (!isOpen) {
      setIsLoading(false);
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  // Formatear fecha
  const fechaDate = new Date(fecha);
  const hoy = new Date();
  const esHoy = fechaDate.toDateString() === hoy.toDateString();
  const fechaTexto = esHoy ? 'Hoy' : fechaDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  const horaTexto = fechaDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1e] border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden">
        {/* Header con degradado */}
        <div className="bg-gradient-to-r from-green-900/80 to-black p-6">
          <div className="flex items-center gap-3">
            {/* Icono de reproducción */}
            <div className="w-12 h-12 rounded-full bg-lime-500 flex items-center justify-center">
              <FaPlay className="text-black text-lg ml-0.5" />
            </div>
            <h2 className="text-white text-2xl font-bold">Iniciar Partido</h2>
          </div>
          <p className="text-gray-400 text-sm mt-2 ml-14">¿Confirmas el inicio del partido?</p>
        </div>

        {/* Información del partido */}
        <div className="p-6">
          {/* Equipos */}
          <div className="flex items-center justify-center gap-4 mb-6">
            {/* Equipo local */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-lime-400 to-emerald-500 flex items-center justify-center">
                <span className="text-zinc-900 font-bold text-xl">{getInitials(localTeam.nombre, 3)}</span>
              </div>
              <span className="text-white font-semibold text-sm text-center">{localTeam.nombre}</span>
              <span className="text-gray-500 text-xs">Local</span>
            </div>

            {/* VS */}
            <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center">
              <span className="text-gray-400 font-bold text-sm">VS</span>
            </div>

            {/* Equipo visitante */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center">
                <span className="text-zinc-900 font-bold text-xl">{getInitials(visitanteTeam.nombre, 3)}</span>
              </div>
              <span className="text-white font-semibold text-sm text-center">{visitanteTeam.nombre}</span>
              <span className="text-gray-500 text-xs">Visitante</span>
            </div>
          </div>

          {/* Detalles del partido */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 text-gray-300">
              <FaCalendar className="text-yellow-500" />
              <span>{fechaTexto}, {horaTexto}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <FaUsers className="text-blue-500" />
              <span>{competicion}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <FaMapMarkerAlt className="text-yellow-500" />
              <span>{campo}</span>
            </div>
          </div>

          {/* Advertencia */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6">
            <p className="text-amber-400 text-sm font-medium">
              <strong>Importante:</strong> Al iniciar el partido, la convocatoria quedará bloqueada.
            </p>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-3 p-6 border-t border-gray-800">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-6 py-3 rounded-xl bg-gray-700 text-white font-semibold hover:bg-gray-600 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1 bg-lime-500 text-black font-bold py-3 rounded-xl hover:bg-lime-400 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <FaPlay className="text-sm" />
            {isLoading ? 'Iniciando...' : 'Iniciar Partido'}
          </button>
        </div>
      </div>
    </div>
  );
}
