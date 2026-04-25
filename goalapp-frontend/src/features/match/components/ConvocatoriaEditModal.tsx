import { useEffect, useState, useMemo } from 'react';
import { FaTimes, FaSearch, FaUsers, FaStar, FaBolt } from 'react-icons/fa';
import type { Jugador, EstadoConvocatoria, ConvocatoriaResumen } from '../types/convocatoria';
import { fetchConvocatoria, fetchJugadoresPorEquipo, createConvocatoria } from '../services/convocatoriaApi';

export interface ConvocatoriaEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  partidoId: number;
  equipoId: number;
  nombreEquipo: string;
  partidoFecha: string;
  competicion: string;
}

interface JugadorUI extends Jugador {
  estado: EstadoConvocatoria;
}

export default function ConvocatoriaEditModal({
  isOpen,
  onClose,
  onSuccess,
  partidoId,
  equipoId,
  nombreEquipo,
  partidoFecha,
  competicion,
}: ConvocatoriaEditModalProps) {
  const [jugadores, setJugadores] = useState<JugadorUI[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  // Cargar datos al abrir el modal
  useEffect(() => {
    if (isOpen) {
      cargarDatos();
    }
  }, [isOpen, partidoId, equipoId]);

  const cargarDatos = async () => {
    setIsLoading(true);
    try {
      const [jugadoresData, convocatoriaData] = await Promise.all([
        fetchJugadoresPorEquipo(equipoId),
        fetchConvocatoria(partidoId, equipoId).catch(() => null),
      ]);

      // Mapear jugadores con su estado de convocatoria
      const convocadosTitulares = new Set(convocatoriaData?.titulares.map(j => j.id_jugador) || []);
      const convocadosSuplentes = new Set(convocatoriaData?.suplentes.map(j => j.id_jugador) || []);

      const jugadoresConEstado: JugadorUI[] = jugadoresData.map(j => ({
        ...j,
        estado: convocadosTitulares.has(j.id_jugador)
          ? 'titular'
          : convocadosSuplentes.has(j.id_jugador)
          ? 'suplente'
          : 'no_convocado',
      }));

      setJugadores(jugadoresConEstado);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      alert('Error al cargar los datos del equipo');
    } finally {
      setIsLoading(false);
    }
  };

  // Agrupar jugadores por posición
  const jugadoresPorPosicion = useMemo(() => {
    const filtrados = jugadores.filter(j =>
      j.usuario.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      j.posicion.toLowerCase().includes(busqueda.toLowerCase())
    );

    return {
      porteros: filtrados.filter(j => j.posicion.toLowerCase().includes('portero')),
      defensas: filtrados.filter(j => j.posicion.toLowerCase().includes('defensa')),
      centrocampistas: filtrados.filter(j =>
        j.posicion.toLowerCase().includes('centrocampista') ||
        j.posicion.toLowerCase().includes('mediocentro')
      ),
      delanteros: filtrados.filter(j => j.posicion.toLowerCase().includes('delantero')),
      otros: filtrados.filter(j =>
        !j.posicion.toLowerCase().includes('portero') &&
        !j.posicion.toLowerCase().includes('defensa') &&
        !j.posicion.toLowerCase().includes('centrocampista') &&
        !j.posicion.toLowerCase().includes('delantero')
      ),
    };
  }, [jugadores, busqueda]);

  // Calcular resumen
  const resumen: ConvocatoriaResumen = useMemo(() => {
    const titulares = jugadores.filter(j => j.estado === 'titular').length;
    const suplentes = jugadores.filter(j => j.estado === 'suplente').length;
    return {
      totalConvocados: titulares + suplentes,
      totalTitulares: titulares,
      totalSuplentes: suplentes,
      maxConvocados: 23,
      maxTitulares: 11,
    };
  }, [jugadores]);

  const cambiarEstado = (idJugador: number, nuevoEstado: EstadoConvocatoria) => {
    setJugadores(prev =>
      prev.map(j => (j.id_jugador === idJugador ? { ...j, estado: nuevoEstado } : j))
    );
  };

  const handleGuardar = async () => {
    // Validaciones
    if (resumen.totalTitulares > 11) {
      alert('Solo puede haber 11 jugadores titulares');
      return;
    }

    if (resumen.totalConvocados < 7) {
      const confirmar = window.confirm(
        'Tienes menos de 7 jugadores convocados. ¿Estás seguro de guardar?'
      );
      if (!confirmar) return;
    }

    // Construir payload
    const payload = {
      id_partido: partidoId,
      jugadores: jugadores
        .filter(j => j.estado !== 'no_convocado')
        .map(j => ({
          id_jugador: j.id_jugador,
          es_titular: j.estado === 'titular',
        })),
    };

    setIsSaving(true);
    try {
      await createConvocatoria(payload);
      onSuccess();
      onClose();
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error al guardar la convocatoria';
      alert(mensaje);
    } finally {
      setIsSaving(false);
    }
  };

  const seleccionarTodos = () => {
    setJugadores(prev =>
      prev.map(j => ({ ...j, estado: j.estado === 'titular' ? 'titular' : 'suplente' }))
    );
  };

  const deseleccionarTodos = () => {
    setJugadores(prev =>
      prev.map(j => ({ ...j, estado: 'no_convocado' }))
    );
  };

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

  const renderJugadorCard = (jugador: JugadorUI) => (
    <div
      key={jugador.id_jugador}
      className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
        jugador.estado === 'titular'
          ? 'bg-lime-900/20 border-lime-500/30'
          : jugador.estado === 'suplente'
          ? 'bg-blue-900/20 border-blue-500/30'
          : 'bg-gray-900/50 border-gray-800'
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Número de dorsal */}
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
            jugador.estado === 'titular'
              ? 'bg-lime-500 text-black'
              : jugador.estado === 'suplente'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-700 text-gray-400'
          }`}
        >
          {jugador.dorsal}
        </div>

        {/* Información del jugador */}
        <div>
          <p className="text-white font-semibold">{jugador.usuario.nombre}</p>
          <p className="text-gray-500 text-xs">
            {jugador.posicion} • {jugador.activo ? 'Activo' : 'Inactivo'}
          </p>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex gap-2">
        <button
          onClick={() => cambiarEstado(jugador.id_jugador, 'titular')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            jugador.estado === 'titular'
              ? 'bg-lime-500 text-black'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          Titular
        </button>
        <button
          onClick={() => cambiarEstado(jugador.id_jugador, 'suplente')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            jugador.estado === 'suplente'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          Suplente
        </button>
      </div>
    </div>
  );

  const renderSeccion = (titulo: string, jugadores: JugadorUI[], maxRecomendado: number) => {
    const convocados = jugadores.filter(j => j.estado !== 'no_convocado').length;
    const titulares = jugadores.filter(j => j.estado === 'titular').length;

    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold">{titulo}</h3>
          <span className="text-gray-500 text-xs">
            {convocados}/{maxRecomendado}
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
              <h2 className="text-white text-2xl font-bold">Editar Convocatoria</h2>
              <p className="text-gray-400 text-sm mt-1">
                {nombreEquipo} • {fechaTexto}
              </p>
              <p className="text-gray-500 text-xs mt-1">{competicion}</p>
            </div>
            <button
              onClick={onClose}
              disabled={isLoading || isSaving}
              className="text-gray-500 hover:text-white transition-colors disabled:opacity-50"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>

          {/* Resumen */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="bg-gray-900/50 rounded-xl p-3 border border-gray-800">
              <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                <FaUsers />
                <span>Convocados</span>
              </div>
              <p className={`text-2xl font-bold ${
                resumen.totalConvocados > resumen.maxConvocados ? 'text-red-400' : 'text-white'
              }`}>
                {resumen.totalConvocados}/{resumen.maxConvocados}
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-xl p-3 border border-gray-800">
              <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                <FaBolt />
                <span>Titulares</span>
              </div>
              <p className={`text-2xl font-bold ${
                resumen.totalTitulares > resumen.maxTitulares ? 'text-red-400' : 'text-lime-400'
              }`}>
                {resumen.totalTitulares}/{resumen.maxTitulares}
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-xl p-3 border border-gray-800">
              <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                <FaStar />
                <span>Suplentes</span>
              </div>
              <p className="text-2xl font-bold text-blue-400">
                {resumen.totalSuplentes}
              </p>
            </div>
          </div>

          {/* Buscador */}
          <div className="mt-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Buscar jugador por nombre o posición..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full bg-gray-900/50 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-lime-500/50 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Lista de jugadores */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-400">Cargando jugadores...</p>
            </div>
          ) : (
            <>
              {renderSeccion('PORTEROS', jugadoresPorPosicion.porteros, 2)}
              {renderSeccion('DEFENSAS', jugadoresPorPosicion.defensas, 5)}
              {renderSeccion('CENTROCAMPISTAS', jugadoresPorPosicion.centrocampistas, 5)}
              {renderSeccion('DELANTEROS', jugadoresPorPosicion.delanteros, 5)}
              {jugadoresPorPosicion.otros.length > 0 &&
                renderSeccion('OTROS', jugadoresPorPosicion.otros, 3)}

              {jugadores.length === 0 && (
                <div className="text-center py-8 border border-dashed border-gray-800 rounded-xl">
                  <p className="text-gray-400 text-sm">No hay jugadores en este equipo</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Acciones rápidas */}
        <div className="px-6 py-4 border-t border-gray-800 bg-gray-900/30">
          <div className="flex gap-3">
            <button
              onClick={seleccionarTodos}
              className="flex-1 px-4 py-2 rounded-xl bg-gray-800 text-gray-300 text-sm font-semibold hover:bg-gray-700 transition-colors"
            >
              Seleccionar Todos
            </button>
            <button
              onClick={deseleccionarTodos}
              className="flex-1 px-4 py-2 rounded-xl bg-gray-800 text-gray-300 text-sm font-semibold hover:bg-gray-700 transition-colors"
            >
              Deseleccionar Todos
            </button>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-3 p-6 border-t border-gray-800">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="flex-1 px-6 py-3 rounded-xl bg-gray-700 text-white font-semibold hover:bg-gray-600 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={isSaving || resumen.totalTitulares > 11}
            className="flex-1 bg-lime-500 text-black font-bold py-3 rounded-xl hover:bg-lime-400 transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Guardando...' : 'Guardar Convocatoria'}
          </button>
        </div>
      </div>
    </div>
  );
}
