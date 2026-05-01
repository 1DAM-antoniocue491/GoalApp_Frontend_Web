import { useEffect, useState } from 'react';
import { FaBan, FaTimes } from 'react-icons/fa';
import type { PlayerWithStatsResponse } from '../../team/services/teamApi';

interface Team {
  id: number;
  nombre: string;
  escudo?: string | null;
}

interface EventRedCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { id_jugador: number; minuto: number; motivo?: string }) => Promise<void>;
  localTeam: Team;
  visitanteTeam: Team;
  localPlayers: PlayerWithStatsResponse[];
  visitantePlayers: PlayerWithStatsResponse[];
  minuto: number;
}

export default function EventRedCardModal({
  isOpen,
  onClose,
  onConfirm,
  localTeam,
  visitanteTeam,
  localPlayers,
  visitantePlayers,
  minuto,
}: EventRedCardModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);
  const [minute, setMinute] = useState(minuto.toString());
  const [motivo, setMotivo] = useState('');

  // Resetear estado al cerrar
  useEffect(() => {
    if (!isOpen) {
      setIsLoading(false);
      setSelectedTeam(null);
      setSelectedPlayer(null);
      setMinute(minuto.toString());
      setMotivo('');
    }
  }, [isOpen, minuto]);

  // Actualizar minuto cuando cambia el minuto prop
  useEffect(() => {
    if (isOpen) {
      setMinute(minuto.toString());
    }
  }, [minuto, isOpen]);

  // Obtener jugadores del equipo seleccionado
  const availablePlayers = selectedTeam === localTeam.id ? localPlayers : visitantePlayers;

  const handleConfirm = async () => {
    if (!selectedPlayer) return;

    const minuteValue = parseInt(minute, 10);
    if (isNaN(minuteValue) || minuteValue < 0 || minuteValue > 120) {
      alert('El minuto debe estar entre 0 y 120');
      return;
    }

    const motivoValue = motivo || 'Sin especificar';

    setIsLoading(true);
    try {
      await onConfirm({
        id_jugador: selectedPlayer,
        minuto: minuteValue,
        motivo: motivoValue,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = selectedTeam && selectedPlayer && minute;

  // Generar iniciales para escudos
  const getIniciales = (nombre: string) => {
    return nombre.split(' ').slice(0, 3).map(word => word[0]).join('').toUpperCase().slice(0, 3);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1e] border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden">
        {/* Header con degradado rojo */}
        <div className="bg-gradient-to-r from-red-900/80 to-black p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center">
                <FaBan className="text-black text-sm" />
              </div>
              <div>
                <h2 className="text-white text-xl font-bold">Tarjeta Roja</h2>
                <p className="text-gray-400 text-xs">Registrar expulsión</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <FaTimes className="text-lg" />
            </button>
          </div>
        </div>

        {/* Campos del formulario */}
        <div className="p-6 space-y-5">
          {/* Selector de Equipo */}
          <div>
            <label className="text-gray-300 text-sm font-medium mb-2 block">
              Equipo <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Equipo Local */}
              <button
                onClick={() => {
                  setSelectedTeam(localTeam.id);
                  setSelectedPlayer(null);
                }}
                className={`px-4 py-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${
                  selectedTeam === localTeam.id
                    ? 'border-red-500 bg-red-900/30'
                    : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                }`}
              >
                {localTeam.escudo ? (
                  <img src={localTeam.escudo} alt={localTeam.nombre} className="w-5 h-5 object-contain" />
                ) : (
                  <span className="text-green-400 font-bold text-xs">{getIniciales(localTeam.nombre)}</span>
                )}
                <span className={`text-sm font-medium ${
                  selectedTeam === localTeam.id ? 'text-red-400' : 'text-gray-300'
                }`}>
                  {localTeam.nombre}
                </span>
              </button>

              {/* Equipo Visitante */}
              <button
                onClick={() => {
                  setSelectedTeam(visitanteTeam.id);
                  setSelectedPlayer(null);
                }}
                className={`px-4 py-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${
                  selectedTeam === visitanteTeam.id
                    ? 'border-red-500 bg-red-900/30'
                    : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                }`}
              >
                {visitanteTeam.escudo ? (
                  <img src={visitanteTeam.escudo} alt={visitanteTeam.nombre} className="w-5 h-5 object-contain" />
                ) : (
                  <span className="text-blue-400 font-bold text-xs">{getIniciales(visitanteTeam.nombre)}</span>
                )}
                <span className={`text-sm font-medium ${
                  selectedTeam === visitanteTeam.id ? 'text-red-400' : 'text-gray-300'
                }`}>
                  {visitanteTeam.nombre}
                </span>
              </button>
            </div>
          </div>

          {/* Selector de Jugador */}
          <div>
            <label className="text-gray-300 text-sm font-medium mb-2 block">
              Jugador <span className="text-red-400">*</span>
            </label>
            <select
              value={selectedPlayer || ''}
              onChange={(e) => setSelectedPlayer(Number(e.target.value))}
              disabled={!selectedTeam}
              className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-gray-300 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">
                {selectedTeam ? 'Selecciona un jugador...' : 'Selecciona equipo primero...'}
              </option>
              {availablePlayers.map((player) => (
                <option key={player.id_jugador} value={player.id_jugador}>
                  {player.nombre} (#{player.dorsal})
                </option>
              ))}
            </select>
          </div>

          {/* Minuto */}
          <div>
            <label className="text-gray-300 text-sm font-medium mb-2 block">
              Minuto <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              value={minute}
              onChange={(e) => setMinute(e.target.value)}
              min="1"
              max="120"
              className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-gray-300 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              placeholder="Minuto de la expulsión"
            />
          </div>

          {/* Motivo (Opcional) */}
          <div>
            <label className="text-gray-300 text-sm font-medium mb-2 block">
              Motivo <span className="text-gray-500">(Opcional)</span>
            </label>
            <select
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-gray-300 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            >
              <option value="">Sin especificar</option>
              <option value="Entrada violenta">Entrada violenta</option>
              <option value="Segunda amarilla">Segunda amarilla</option>
              <option value="Conducta violenta">Conducta violenta</option>
              <option value="Escupir">Escupir</option>
              <option value="Falta como último hombre">Falta como último hombre</option>
              <option value="Mano intencionada">Mano intencionada (evitar gol)</option>
              <option value="Protestar agresivamente">Protestar agresivamente</option>
              <option value="Otro">Otro</option>
            </select>
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
            disabled={!isFormValid || isLoading}
            className="flex-1 bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <FaBan className="text-sm" />
            {isLoading ? 'Registrando...' : 'Confirmar Tarjeta'}
          </button>
        </div>
      </div>
    </div>
  );
}
