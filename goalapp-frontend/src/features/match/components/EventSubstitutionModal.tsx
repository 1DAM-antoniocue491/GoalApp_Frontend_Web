import { useEffect, useState } from 'react';
import { FaExchangeAlt, FaTimes } from 'react-icons/fa';
import type { PlayerWithStatsResponse } from '../../team/services/teamApi';

interface Team {
  id: number;
  nombre: string;
  escudo?: string | null;
}

interface EventSubstitutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { id_jugador: number; id_jugador_sale: number; minuto: number }) => Promise<void>;
  localTeam: Team;
  visitanteTeam: Team;
  localPlayers: PlayerWithStatsResponse[];
  visitantePlayers: PlayerWithStatsResponse[];
  minuto: number;
}

export default function EventSubstitutionModal({
  isOpen,
  onClose,
  onConfirm,
  localTeam,
  visitanteTeam,
  localPlayers,
  visitantePlayers,
  minuto,
}: EventSubstitutionModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [playerIn, setPlayerIn] = useState<number | null>(null);
  const [playerOut, setPlayerOut] = useState<number | null>(null);
  const [minute, setMinute] = useState(minuto.toString());

  // Resetear estado al cerrar
  useEffect(() => {
    if (!isOpen) {
      setIsLoading(false);
      setSelectedTeam(null);
      setPlayerIn(null);
      setPlayerOut(null);
      setMinute(minuto.toString());
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
    if (!playerIn || !playerOut) return;

    const minuteValue = parseInt(minute, 10);
    if (isNaN(minuteValue) || minuteValue < 0 || minuteValue > 120) {
      alert('El minuto debe estar entre 0 y 120');
      return;
    }

    if (playerIn === playerOut) {
      alert('El jugador que entra no puede ser el mismo que sale');
      return;
    }

    setIsLoading(true);
    try {
      await onConfirm({
        id_jugador: playerIn,
        id_jugador_sale: playerOut,
        minuto: minuteValue,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = selectedTeam && playerIn && playerOut && playerIn !== playerOut && minute;

  // Generar iniciales para escudos
  const getIniciales = (nombre: string) => {
    return nombre.split(' ').slice(0, 3).map(word => word[0]).join('').toUpperCase().slice(0, 3);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1e] border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden">
        {/* Header con degradado azul */}
        <div className="bg-gradient-to-r from-blue-900/80 to-black p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                <FaExchangeAlt className="text-black text-sm" />
              </div>
              <div>
                <h2 className="text-white text-xl font-bold">Sustitución</h2>
                <p className="text-gray-400 text-xs">Registrar cambio de jugador</p>
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
              Equipo <span className="text-blue-400">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Equipo Local */}
              <button
                onClick={() => {
                  setSelectedTeam(localTeam.id);
                  setPlayerIn(null);
                  setPlayerOut(null);
                }}
                className={`px-4 py-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${
                  selectedTeam === localTeam.id
                    ? 'border-blue-500 bg-blue-900/30'
                    : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                }`}
              >
                {localTeam.escudo ? (
                  <img src={localTeam.escudo} alt={localTeam.nombre} className="w-5 h-5 object-contain" />
                ) : (
                  <span className="text-green-400 font-bold text-xs">{getIniciales(localTeam.nombre)}</span>
                )}
                <span className={`text-sm font-medium ${
                  selectedTeam === localTeam.id ? 'text-blue-400' : 'text-gray-300'
                }`}>
                  {localTeam.nombre}
                </span>
              </button>

              {/* Equipo Visitante */}
              <button
                onClick={() => {
                  setSelectedTeam(visitanteTeam.id);
                  setPlayerIn(null);
                  setPlayerOut(null);
                }}
                className={`px-4 py-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${
                  selectedTeam === visitanteTeam.id
                    ? 'border-blue-500 bg-blue-900/30'
                    : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                }`}
              >
                {visitanteTeam.escudo ? (
                  <img src={visitanteTeam.escudo} alt={visitanteTeam.nombre} className="w-5 h-5 object-contain" />
                ) : (
                  <span className="text-blue-400 font-bold text-xs">{getIniciales(visitanteTeam.nombre)}</span>
                )}
                <span className={`text-sm font-medium ${
                  selectedTeam === visitanteTeam.id ? 'text-blue-400' : 'text-gray-300'
                }`}>
                  {visitanteTeam.nombre}
                </span>
              </button>
            </div>
          </div>

          {/* Jugador que Sale */}
          <div>
            <label className="text-gray-300 text-sm font-medium mb-2 block">
              Jugador que Sale <span className="text-blue-400">*</span>
            </label>
            <select
              value={playerOut || ''}
              onChange={(e) => setPlayerOut(Number(e.target.value))}
              disabled={!selectedTeam}
              className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">
                {selectedTeam ? 'Selecciona jugador que sale...' : 'Selecciona equipo primero...'}
              </option>
              {availablePlayers.map((player) => (
                <option key={player.id_jugador} value={player.id_jugador}>
                  {player.nombre} (#{player.dorsal})
                </option>
              ))}
            </select>
          </div>

          {/* Jugador que Entra */}
          <div>
            <label className="text-gray-300 text-sm font-medium mb-2 block">
              Jugador que Entra <span className="text-blue-400">*</span>
            </label>
            <select
              value={playerIn || ''}
              onChange={(e) => setPlayerIn(Number(e.target.value))}
              disabled={!selectedTeam}
              className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">
                {selectedTeam ? 'Selecciona jugador que entra...' : 'Selecciona equipo primero...'}
              </option>
              {availablePlayers.map((player) => (
                <option
                  key={player.id_jugador}
                  value={player.id_jugador}
                  disabled={player.id_jugador === playerOut}
                >
                  {player.nombre} (#{player.dorsal})
                </option>
              ))}
            </select>
            {playerIn && playerOut && playerIn === playerOut && (
              <p className="text-red-400 text-xs mt-1">El jugador que entra no puede ser el mismo que sale</p>
            )}
          </div>

          {/* Minuto */}
          <div>
            <label className="text-gray-300 text-sm font-medium mb-2 block">
              Minuto <span className="text-blue-400">*</span>
            </label>
            <input
              type="number"
              value={minute}
              onChange={(e) => setMinute(e.target.value)}
              min="1"
              max="120"
              className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Minuto del cambio"
            />
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
            className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <FaExchangeAlt className="text-sm" />
            {isLoading ? 'Registrando...' : 'Confirmar Sustitución'}
          </button>
        </div>
      </div>
    </div>
  );
}
