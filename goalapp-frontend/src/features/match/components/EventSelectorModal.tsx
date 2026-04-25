import { FaFutbol, FaExclamationTriangle, FaBan, FaExchangeAlt } from 'react-icons/fa';

interface EventSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEvent: (type: 'gol' | 'tarjeta_amarilla' | 'tarjeta_roja' | 'cambio') => void;
}

export default function EventSelectorModal({
  isOpen,
  onClose,
  onSelectEvent,
}: EventSelectorModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1e] border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900/80 to-black p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-lime-500 flex items-center justify-center">
                <FaFutbol className="text-black text-sm" />
              </div>
              <h2 className="text-white text-xl font-bold">Registrar Evento</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <span className="text-lg">×</span>
            </button>
          </div>
        </div>

        {/* Grid 2x2 de eventos */}
        <div className="p-6">
          <p className="text-gray-400 text-sm mb-4">Selecciona el tipo de evento a registrar</p>

          <div className="grid grid-cols-2 gap-4">
            {/* Gol */}
            <button
              onClick={() => onSelectEvent('gol')}
              className="group bg-gradient-to-br from-green-900/60 to-green-950/60 border border-green-700/50 hover:border-green-500 rounded-2xl p-6 transition-all hover:scale-105 hover:shadow-lg hover:shadow-green-900/30"
            >
              <div className="w-14 h-14 mx-auto mb-3 rounded-xl bg-green-800/40 flex items-center justify-center group-hover:bg-green-700/50 transition-colors">
                <FaFutbol className="text-green-400 text-2xl" />
              </div>
              <span className="text-green-400 font-semibold text-sm block text-center">Gol</span>
            </button>

            {/* Tarjeta Amarilla */}
            <button
              onClick={() => onSelectEvent('tarjeta_amarilla')}
              className="group bg-gradient-to-br from-yellow-900/60 to-yellow-950/60 border border-yellow-700/50 hover:border-yellow-500 rounded-2xl p-6 transition-all hover:scale-105 hover:shadow-lg hover:shadow-yellow-900/30"
            >
              <div className="w-14 h-14 mx-auto mb-3 rounded-xl bg-yellow-800/40 flex items-center justify-center group-hover:bg-yellow-700/50 transition-colors">
                <FaExclamationTriangle className="text-yellow-400 text-2xl" />
              </div>
              <span className="text-yellow-400 font-semibold text-sm block text-center">Amarilla</span>
            </button>

            {/* Tarjeta Roja */}
            <button
              onClick={() => onSelectEvent('tarjeta_roja')}
              className="group bg-gradient-to-br from-red-900/60 to-red-950/60 border border-red-700/50 hover:border-red-500 rounded-2xl p-6 transition-all hover:scale-105 hover:shadow-lg hover:shadow-red-900/30"
            >
              <div className="w-14 h-14 mx-auto mb-3 rounded-xl bg-red-800/40 flex items-center justify-center group-hover:bg-red-700/50 transition-colors">
                <FaBan className="text-red-400 text-2xl" />
              </div>
              <span className="text-red-400 font-semibold text-sm block text-center">Roja</span>
            </button>

            {/* Sustitución */}
            <button
              onClick={() => onSelectEvent('cambio')}
              className="group bg-gradient-to-br from-blue-900/60 to-blue-950/60 border border-blue-700/50 hover:border-blue-500 rounded-2xl p-6 transition-all hover:scale-105 hover:shadow-lg hover:shadow-blue-900/30"
            >
              <div className="w-14 h-14 mx-auto mb-3 rounded-xl bg-blue-800/40 flex items-center justify-center group-hover:bg-blue-700/50 transition-colors">
                <FaExchangeAlt className="text-blue-400 text-2xl" />
              </div>
              <span className="text-blue-400 font-semibold text-sm block text-center">Cambio</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
