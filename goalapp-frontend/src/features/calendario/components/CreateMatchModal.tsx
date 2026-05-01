import { useState, useEffect, useCallback } from 'react';
import { FaCalendar, FaClock, FaTimes, FaUsers } from 'react-icons/fa';
import { fetchTeamsByLeague } from '../../team/services/teamApi';
import type { TeamResponse } from '../../team/services/teamApi';
import { createMatch, type MatchCreatePayload } from '../../match/services/matchApi';

interface CreateMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  ligaId: number;
  onSuccess: () => void;
}

export default function CreateMatchModal({ isOpen, onClose, ligaId, onSuccess }: CreateMatchModalProps) {
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('16:00');
  const [equipoLocalId, setEquipoLocalId] = useState<number>(0);
  const [equipoVisitanteId, setEquipoVisitanteId] = useState<number>(0);
  const [equipos, setEquipos] = useState<TeamResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const cargarEquipos = useCallback(async () => {
    try {
      const equiposData = await fetchTeamsByLeague(ligaId);
      setEquipos(equiposData);
      if (equiposData.length >= 2) {
        setEquipoLocalId(equiposData[0].id_equipo);
        setEquipoVisitanteId(equiposData[1].id_equipo);
      }
    } catch (error) {
      console.error('Error al cargar equipos:', error);
    }
  }, [ligaId]);

  useEffect(() => {
    if (isOpen && ligaId) {
      cargarEquipos();
    }
  }, [isOpen, ligaId, cargarEquipos]);

  const handleCreate = async () => {
    if (!fecha || !hora || !equipoLocalId || !equipoVisitanteId) {
      alert('Por favor, completa todos los campos obligatorios');
      return;
    }

    if (equipoLocalId === equipoVisitanteId) {
      alert('El equipo local y visitante deben ser diferentes');
      return;
    }

    setIsLoading(true);
    try {
      const payload: MatchCreatePayload = {
        id_liga: ligaId,
        id_equipo_local: equipoLocalId,
        id_equipo_visitante: equipoVisitanteId,
        fecha: `${fecha}T${hora}:00`,
      };
      await createMatch(payload);
      alert('Partido creado exitosamente');
      handleCancel();
      onSuccess();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al crear el partido';
      alert(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFecha('');
    setHora('16:00');
    setEquipoLocalId(0);
    setEquipoVisitanteId(0);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1e] border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-800">
          <div>
            <h2 className="text-white text-2xl font-bold">Crear Partido</h2>
            <p className="text-gray-400 text-sm mt-1">Programa un nuevo encuentro para la liga</p>
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
            <h3 className="text-white font-semibold mb-3">Fecha y hora del partido</h3>
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

          {/* Equipos */}
          <div>
            <h3 className="text-white font-semibold mb-3">Equipos</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Equipo Local</label>
                <div className="relative">
                  <select
                    value={equipoLocalId}
                    onChange={(e) => setEquipoLocalId(Number(e.target.value))}
                    className="w-full bg-gray-900/50 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-lime-500/50 transition-colors appearance-none"
                  >
                    <option value={0}>Selecciona un equipo</option>
                    {equipos.map((equipo) => (
                      <option key={equipo.id_equipo} value={equipo.id_equipo}>
                        {equipo.nombre}
                      </option>
                    ))}
                  </select>
                  <FaUsers className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Equipo Visitante</label>
                <div className="relative">
                  <select
                    value={equipoVisitanteId}
                    onChange={(e) => setEquipoVisitanteId(Number(e.target.value))}
                    className="w-full bg-gray-900/50 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-lime-500/50 transition-colors appearance-none"
                  >
                    <option value={0}>Selecciona un equipo</option>
                    {equipos.map((equipo) => (
                      <option key={equipo.id_equipo} value={equipo.id_equipo}>
                        {equipo.nombre}
                      </option>
                    ))}
                  </select>
                  <FaUsers className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-3 p-6 border-t border-gray-800">
          <button
            onClick={handleCancel}
            className="flex-1 px-6 py-3 rounded-xl border border-gray-800 text-white font-semibold hover:bg-gray-800/50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleCreate}
            disabled={isLoading}
            className="flex-1 bg-gradient-to-r from-[#c5f52a] via-[#c5f52a] to-[#2a5a55] text-black font-bold py-3 rounded-xl hover:scale-[1.02] transition-all disabled:opacity-50"
          >
            {isLoading ? 'Creando...' : 'Crear Partido'}
          </button>
        </div>
      </div>
    </div>
  );
}
