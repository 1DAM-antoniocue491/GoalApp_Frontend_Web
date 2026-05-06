import { FaUsers, FaClipboardList } from 'react-icons/fa';

export interface TeamSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTeamSelected: (equipoId: number, nombreEquipo: string) => void;
  nombreEquipoLocal: string;
  idEquipoLocal: number;
  nombreEquipoVisitante: string;
  idEquipoVisitante: number;
  accion: 'convocatoria';
}

export default function TeamSelectorModal({
  isOpen,
  onClose,
  onTeamSelected,
  nombreEquipoLocal,
  idEquipoLocal,
  nombreEquipoVisitante,
  idEquipoVisitante,
  accion,
}: TeamSelectorModalProps) {
  if (!isOpen) return null;

  const titulo = 'Selecciona el equipo para gestionar la convocatoria';

  const handleSelectLocal = () => {
    onTeamSelected(idEquipoLocal, nombreEquipoLocal);
  };

  const handleSelectVisitante = () => {
    onTeamSelected(idEquipoVisitante, nombreEquipoVisitante);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1e] border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3 mb-2">
            <FaUsers className="text-lime-400 text-2xl" />
            <h2 className="text-white text-xl font-bold">{titulo}</h2>
          </div>
          <p className="text-gray-400 text-sm">
            Elige qué equipo quieres gestionar
          </p>
        </div>

        {/* Opciones de equipos */}
        <div className="p-6 space-y-3">
          {/* Equipo Local */}
          <button
            onClick={handleSelectLocal}
            className="w-full p-4 bg-gray-900/50 border border-gray-800 rounded-xl hover:border-lime-500/50 hover:bg-gray-900/70 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-lime-500/10 flex items-center justify-center group-hover:bg-lime-500/20 transition-colors">
                <span className="text-lime-400 text-sm font-bold">L</span>
              </div>
              <span className="text-white font-semibold">{nombreEquipoLocal}</span>
            </div>
            <span className="text-gray-500 text-xs group-hover:text-lime-400 transition-colors">
              Local
            </span>
          </button>

          {/* Equipo Visitante */}
          <button
            onClick={handleSelectVisitante}
            className="w-full p-4 bg-gray-900/50 border border-gray-800 rounded-xl hover:border-cyan-500/50 hover:bg-gray-900/70 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
                <span className="text-cyan-400 text-sm font-bold">V</span>
              </div>
              <span className="text-white font-semibold">{nombreEquipoVisitante}</span>
            </div>
            <span className="text-gray-500 text-xs group-hover:text-cyan-400 transition-colors">
              Visitante
            </span>
          </button>
        </div>

        {/* Botón Cancelar */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 rounded-xl bg-gray-800 text-gray-300 font-semibold hover:bg-gray-700 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
