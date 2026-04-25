import { useEffect, useState } from 'react';
import { FaFlag, FaTimes, FaTrophy, FaStar } from 'react-icons/fa';

interface FinishMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: FinishData) => Promise<void>;
  localTeam: { nombre: string; id: number };
  visitanteTeam: { nombre: string; id: number };
  jugadores: JugadorData[];
}

export interface FinishData {
  goles_local: number;
  goles_visitante: number;
  id_mvp: number;
  puntuacion_mvp: number;
  incidencias?: string;
}

interface JugadorData {
  id: number;
  nombre: string;
  id_equipo: number;
  dorsal?: number;
}

export default function FinishMatchModal({
  isOpen,
  onClose,
  onConfirm,
  localTeam,
  visitanteTeam,
  jugadores,
}: FinishMatchModalProps) {
  const [golesLocal, setGolesLocal] = useState(0);
  const [golesVisitante, setGolesVisitante] = useState(0);
  const [idEquipoMvp, setIdEquipoMvp] = useState<number | ''>('');
  const [idJugadorMvp, setIdJugadorMvp] = useState<number | ''>('');
  const [puntuacionMvp, setPuntuacionMvp] = useState(9.0);
  const [incidencias, setIncidencias] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Filtrar jugadores por equipo seleccionado
  const jugadoresDelEquipo = jugadores.filter(j => j.id_equipo === idEquipoMvp);

  // Resetear jugador MVP cuando cambia el equipo
  useEffect(() => {
    setIdJugadorMvp('');
  }, [idEquipoMvp]);

  // Resetear estado al cerrar
  useEffect(() => {
    if (!isOpen) {
      setGolesLocal(0);
      setGolesVisitante(0);
      setIdEquipoMvp('');
      setIdJugadorMvp('');
      setPuntuacionMvp(9.0);
      setIncidencias('');
      setIsLoading(false);
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    if (!idEquipoMvp || !idJugadorMvp) {
      alert('Debes seleccionar el equipo y el jugador MVP');
      return;
    }

    setIsLoading(true);
    try {
      await onConfirm({
        goles_local: golesLocal,
        goles_visitante: golesVisitante,
        id_mvp: idJugadorMvp,
        puntuacion_mvp: puntuacionMvp,
        incidencias: incidencias || undefined,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1e] border border-gray-800 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-800">
          <div>
            <h2 className="text-white text-2xl font-bold">Finalizar Partido</h2>
            <p className="text-gray-400 text-sm mt-1">Introduce el resultado final y selecciona al MVP</p>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-500 hover:text-white transition-colors disabled:opacity-50"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Formulario */}
        <div className="p-6 space-y-6">
          {/* Resultado Final */}
          <div>
            <h3 className="text-white font-semibold mb-3">Resultado Final</h3>
            <div className="grid grid-cols-2 gap-4">
              {/* Equipo local */}
              <div className="bg-yellow-900/10 border border-yellow-500/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FaTrophy className="text-yellow-500" />
                  <span className="text-yellow-400 font-semibold">{localTeam.nombre}</span>
                </div>
                <span className="text-gray-500 text-xs">Local</span>
                <input
                  type="number"
                  min="0"
                  value={golesLocal}
                  onChange={(e) => setGolesLocal(parseInt(e.target.value) || 0)}
                  className="w-full mt-2 bg-gray-900/50 border border-gray-800 rounded-xl px-4 py-3 text-white text-2xl font-bold text-center focus:outline-none focus:border-yellow-500/50 transition-colors"
                />
              </div>

              {/* Equipo visitante */}
              <div className="bg-blue-900/10 border border-blue-500/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FaTrophy className="text-blue-500" />
                  <span className="text-blue-400 font-semibold">{visitanteTeam.nombre}</span>
                </div>
                <span className="text-gray-500 text-xs">Visitante</span>
                <input
                  type="number"
                  min="0"
                  value={golesVisitante}
                  onChange={(e) => setGolesVisitante(parseInt(e.target.value) || 0)}
                  className="w-full mt-2 bg-gray-900/50 border border-gray-800 rounded-xl px-4 py-3 text-white text-2xl font-bold text-center focus:outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Selector de equipo del MVP */}
          <div>
            <h3 className="text-white font-semibold mb-3">Equipo del jugador MVP</h3>
            <select
              value={idEquipoMvp}
              onChange={(e) => setIdEquipoMvp(parseInt(e.target.value))}
              className="w-full bg-gray-900/50 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500/50 transition-colors"
            >
              <option value="">Selecciona el equipo del jugador MVP</option>
              <option value={localTeam.id}>{localTeam.nombre}</option>
              <option value={visitanteTeam.id}>{visitanteTeam.nombre}</option>
            </select>
          </div>

          {/* Selector de jugador MVP */}
          <div>
            <h3 className="text-white font-semibold mb-3">Jugador MVP del partido</h3>
            <select
              value={idJugadorMvp}
              onChange={(e) => setIdJugadorMvp(parseInt(e.target.value))}
              disabled={!idEquipoMvp}
              className="w-full bg-gray-900/50 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Selecciona jugador MVP</option>
              {jugadoresDelEquipo.map((jugador) => (
                <option key={jugador.id} value={jugador.id}>
                  {jugador.dorsal && `#${jugador.dorsador} `}{jugador.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Puntuación del MVP */}
          <div>
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <FaStar className="text-orange-500" />
              Puntuación del MVP
            </h3>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={puntuacionMvp}
                onChange={(e) => setPuntuacionMvp(parseFloat(e.target.value) || 0)}
                className="w-full bg-gray-900/50 border border-gray-800 rounded-xl px-4 py-3 text-white text-lg font-bold focus:outline-none focus:border-orange-500/50 transition-colors"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">/ 10</span>
            </div>
            {/* Slider para puntuación */}
            <input
              type="range"
              min="0"
              max="10"
              step="0.1"
              value={puntuacionMvp}
              onChange={(e) => setPuntuacionMvp(parseFloat(e.target.value))}
              className="w-full mt-2 accent-orange-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0</span>
              <span>5</span>
              <span>10</span>
            </div>
          </div>

          {/* Incidencias (opcional) */}
          <div>
            <h3 className="text-white font-semibold mb-3">Incidencias (Opcional)</h3>
            <textarea
              value={incidencias}
              onChange={(e) => setIncidencias(e.target.value)}
              placeholder="Añade notas sobre el partido..."
              rows={4}
              className="w-full bg-gray-900/50 border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition-colors resize-none"
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
            disabled={isLoading || !idEquipoMvp || !idJugadorMvp}
            className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-3 rounded-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100"
          >
            <FaFlag className="text-sm" />
            {isLoading ? 'Finalizando...' : 'Finalizar Partido'}
          </button>
        </div>
      </div>
    </div>
  );
}
