import { useEffect, useState, useMemo } from 'react';
import { FaTimes, FaUsers, FaBolt, FaStar, FaShieldAlt, FaClock } from 'react-icons/fa';
import type { ConvocatoriaResponse, JugadorConvocado } from '../types/convocatoria';
import { fetchConvocatoria } from '../services/convocatoriaApi';

export interface ConvocatoriaViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  partidoId: number;
  equipoId: number;
  nombreEquipo: string;
  partidoFecha: string;
  competicion: string;
  estadoPartido: string;
}

interface JugadorConEstado extends JugadorConvocado {
  tipo: 'titular' | 'suplente';
}

export default function ConvocatoriaViewModal({
  isOpen,
  onClose,
  partidoId,
  equipoId,
  nombreEquipo,
  partidoFecha,
  competicion,
  estadoPartido,
}: ConvocatoriaViewModalProps) {
  const [convocatoria, setConvocatoria] = useState<ConvocatoriaResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      cargarConvocatoria();
    }
  }, [isOpen, partidoId, equipoId]);

  const cargarConvocatoria = async () => {
    setIsLoading(true);
    try {
      const data = await fetchConvocatoria(partidoId, equipoId);
      setConvocatoria(data);
    } catch (error) {
      console.error('Error al cargar convocatoria:', error);
      setConvocatoria(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Combinar titulares y suplentes con su tipo
  const jugadoresConEstado = useMemo(() => {
    if (!convocatoria) return [];
    return [
      ...convocatoria.titulares.map(j => ({ ...j, tipo: 'titular' as const })),
      ...convocatoria.suplentes.map(j => ({ ...j, tipo: 'suplente' as const })),
    ];
  }, [convocatoria]);

  // Agrupar por posición
  const jugadoresPorPosicion = useMemo(() => {
    const porteros = jugadoresConEstado.filter(j => j.posicion.toLowerCase().includes('portero'));
    const defensas = jugadoresConEstado.filter(j => j.posicion.toLowerCase().includes('defensa'));
    const centrocampistas = jugadoresConEstado.filter(j =>
      j.posicion.toLowerCase().includes('centrocampista') ||
      j.posicion.toLowerCase().includes('mediocentro')
    );
    const delanteros = jugadoresConEstado.filter(j => j.posicion.toLowerCase().includes('delantero'));
    const otros = jugadoresConEstado.filter(j =>
      !j.posicion.toLowerCase().includes('portero') &&
      !j.posicion.toLowerCase().includes('defensa') &&
      !j.posicion.toLowerCase().includes('centrocampista') &&
      !j.posicion.toLowerCase().includes('delantero')
    );

    return { porteros, defensas, centrocampistas, delanteros, otros };
  }, [jugadoresConEstado]);

  if (!isOpen) return null;

  // Formatear fecha
  const fechaDate = new Date(partidoFecha);
  const fechaTexto = fechaDate.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });

  const totalConvocados = (convocatoria?.titulares.length || 0) + (convocatoria?.suplentes.length || 0);
  const totalTitulares = convocatoria?.titulares.length || 0;
  const totalSuplentes = convocatoria?.suplentes.length || 0;

  const renderJugadorCard = (jugador: JugadorConEstado) => (
    <div
      key={jugador.id_jugador}
      className={`flex items-center justify-between p-3 rounded-xl border ${
        jugador.tipo === 'titular'
          ? 'bg-lime-900/20 border-lime-500/30'
          : 'bg-blue-900/20 border-blue-500/30'
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Número de dorsal */}
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
            jugador.tipo === 'titular'
              ? 'bg-lime-500 text-black'
              : 'bg-blue-500 text-white'
          }`}
        >
          {jugador.dorsal}
        </div>

        {/* Información del jugador */}
        <div>
          <p className="text-white font-semibold">{jugador.nombre}</p>
          <p className="text-gray-500 text-xs">{jugador.posicion}</p>
        </div>
      </div>

      {/* Badge de estado */}
      <div
        className={`px-3 py-1 rounded-lg text-xs font-semibold ${
          jugador.tipo === 'titular'
            ? 'bg-lime-500/20 text-lime-400 border border-lime-500/30'
            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
        }`}
      >
        {jugador.tipo === 'titular' ? 'Titular' : 'Suplente'}
      </div>
    </div>
  );

  const renderSeccion = (titulo: string, jugadores: JugadorConEstado[]) => {
    if (jugadores.length === 0) return null;

    const titulares = jugadores.filter(j => j.tipo === 'titular').length;

    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold">{titulo}</h3>
          <span className="text-gray-500 text-xs">
            {jugadores.length} {titulares > 0 && `(Tit: ${titulares})`}
          </span>
        </div>
        <div className="space-y-2">{jugadores.map(renderJugadorCard)}</div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1e] border border-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-white text-2xl font-bold">Convocatoria</h2>
              <p className="text-gray-400 text-sm mt-1">
                {nombreEquipo} • {fechaTexto}
              </p>
              <p className="text-gray-500 text-xs mt-1">{competicion}</p>
            </div>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="text-gray-500 hover:text-white transition-colors disabled:opacity-50"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>

          {/* Estado del partido */}
          <div className={`mt-3 px-3 py-1.5 rounded-lg inline-flex items-center gap-2 text-xs font-semibold ${
            estadoPartido === 'En Juego'
              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
              : estadoPartido === 'Finalizado'
              ? 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
              : 'bg-lime-500/20 text-lime-400 border border-lime-500/30'
          }`}>
            <FaClock />
            {estadoPartido}
          </div>

          {/* Resumen */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="bg-gray-900/50 rounded-xl p-3 border border-gray-800">
              <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                <FaUsers />
                <span>Convocados</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {totalConvocados}
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-xl p-3 border border-gray-800">
              <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                <FaBolt />
                <span>Titulares</span>
              </div>
              <p className="text-2xl font-bold text-lime-400">
                {totalTitulares}
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-xl p-3 border border-gray-800">
              <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                <FaStar />
                <span>Suplentes</span>
              </div>
              <p className="text-2xl font-bold text-blue-400">
                {totalSuplentes}
              </p>
            </div>
          </div>
        </div>

        {/* Lista de jugadores */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-400">Cargando convocatoria...</p>
            </div>
          ) : !convocatoria || totalConvocados === 0 ? (
            <div className="text-center py-8 border border-dashed border-gray-800 rounded-xl">
              <FaShieldAlt className="text-4xl text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">
                No hay jugadores convocados para este partido
              </p>
              <p className="text-gray-500 text-xs mt-1">
                El entrenador aún no ha seleccionado la convocatoria
              </p>
            </div>
          ) : (
            <>
              {renderSeccion('PORTEROS', jugadoresPorPosicion.porteros)}
              {renderSeccion('DEFENSAS', jugadoresPorPosicion.defensas)}
              {renderSeccion('CENTROCAMPISTAS', jugadoresPorPosicion.centrocampistas)}
              {renderSeccion('DELANTEROS', jugadoresPorPosicion.delanteros)}
              {jugadoresPorPosicion.otros.length > 0 &&
                renderSeccion('OTROS', jugadoresPorPosicion.otros)}
            </>
          )}
        </div>

        {/* Footer informativo */}
        <div className="px-6 py-4 border-t border-gray-800 bg-gray-900/30">
          <p className="text-gray-500 text-xs text-center">
            {estadoPartido === 'Programado'
              ? 'La convocatoria puede modificarse hasta el inicio del partido'
              : 'Convocatoria cerrada - Partido iniciado'}
          </p>
        </div>
      </div>
    </div>
  );
}
