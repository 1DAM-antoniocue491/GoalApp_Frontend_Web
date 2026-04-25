import { useState, useEffect } from 'react';
import { FaTimes, FaUserTie, FaToggleOn, FaToggleOff, FaTrash, FaUserPlus } from 'react-icons/fa';
import type { TeamMemberActionsModalProps } from '../types/member';
import {
  asignarDelegado,
  updateMiembroEstado,
  deleteMiembroEquipo,
  fetchMiembrosEquipo,
} from '../services/teamMembersApi';
import { fetchUsersByLeague } from '../../users/services/usersApi';

export default function TeamMemberActionsModal({
  isOpen,
  onClose,
  onSuccess,
  miembro,
  equipoId,
  usuariosDisponibles,
  esEntrenador = false,
}: TeamMemberActionsModalProps) {
  const [selectedDelegado, setSelectedDelegado] = useState<number | null>(null);
  const [selectedEstado, setSelectedEstado] = useState(miembro.activo);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Cargar delegado actual si es el entrenador
  useEffect(() => {
    if (isOpen && esEntrenador) {
      loadDelegadoActual();
    }
  }, [isOpen, equipoId]);

  const loadDelegadoActual = async () => {
    try {
      const miembros = await fetchMiembrosEquipo(equipoId);
      const delegado = miembros.find(m => m.tipo === 'delegado');
      if (delegado) {
        setSelectedDelegado(delegado.id_usuario);
      }
    } catch (error) {
      console.error('Error al cargar delegado:', error);
    }
  };

  const handleAsignarDelegado = async () => {
    if (!selectedDelegado) return;

    setIsLoading(true);
    try {
      await asignarDelegado(equipoId, selectedDelegado);
      alert('Delegado asignado correctamente');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error al asignar delegado:', error);
      const message = error instanceof Error ? error.message : 'Error al asignar delegado';
      alert(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateEstado = async () => {
    if (selectedEstado === miembro.activo) return;

    setIsLoading(true);
    try {
      await updateMiembroEstado(equipoId, miembro.id_usuario, selectedEstado);
      alert(`Jugador ${selectedEstado ? 'activado' : 'desactivado'} correctamente`);
      onSuccess();
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      alert('Error al actualizar el estado del jugador');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmMessage = miembro.tipo === 'delegado'
      ? `¿Estás seguro de eliminar al delegado del equipo?`
      : `¿Estás seguro de eliminar a "${miembro.nombre}" del equipo?`;

    if (!confirm(confirmMessage)) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteMiembroEquipo(equipoId, miembro.id_usuario);
      alert(miembro.tipo === 'delegado' ? 'Delegado eliminado del equipo' : 'Jugador eliminado del equipo');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error al eliminar miembro:', error);
      const message = error instanceof Error ? error.message : 'Error al eliminar el miembro';
      alert(message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  const esDelegado = miembro.tipo === 'delegado';
  const esJugador = miembro.tipo === 'jugador';

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1e] border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-white text-2xl font-bold">Gestionar Miembro</h2>
              <p className="text-gray-400 text-sm mt-1">{miembro.nombre}</p>
              <p className="text-gray-500 text-xs mt-1">{miembro.email}</p>
              {esJugador && (
                <span className="inline-block mt-2 px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded text-blue-400 text-xs font-semibold">
                  {miembro.posicion} • Dorsal {miembro.dorsal}
                </span>
              )}
              {esDelegado && (
                <span className="inline-block mt-2 px-2 py-1 bg-purple-500/10 border border-purple-500/20 rounded text-purple-400 text-xs font-semibold">
                  Delegado
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              disabled={isLoading || isDeleting}
              className="text-gray-500 hover:text-white transition-colors disabled:opacity-50"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Selector de Delegado - Solo si es entrenador y no está viendo su propio perfil */}
          {esEntrenador && (
            <div>
              <label className="block text-gray-400 text-sm font-semibold mb-2">
                <FaUserTie className="inline mr-2" />
                Delegado del Equipo
              </label>
              <select
                value={selectedDelegado || ''}
                onChange={(e) => setSelectedDelegado(Number(e.target.value))}
                disabled={isLoading || isDeleting}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-lime-500 disabled:opacity-50"
              >
                <option value="">Seleccionar delegado...</option>
                {usuariosDisponibles
                  .filter(u => u.id_usuario !== miembro.id_usuario)
                  .map((usuario) => (
                    <option key={usuario.id_usuario} value={usuario.id_usuario}>
                      {usuario.nombre} - {usuario.email}
                    </option>
                  ))}
              </select>
              {selectedDelegado && selectedDelegado !== miembro.id_usuario && (
                <button
                  onClick={handleAsignarDelegado}
                  disabled={isLoading || isDeleting}
                  className="mt-3 w-full bg-lime-500 hover:bg-lime-600 text-black font-semibold py-2 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <FaUserPlus />
                  Asignar Delegado
                </button>
              )}
            </div>
          )}

          {/* Toggle de Estado - Solo para jugadores */}
          {esJugador && (
            <div>
              <label className="block text-gray-400 text-sm font-semibold mb-2">
                Estado
              </label>
              <div className="flex items-center justify-between bg-gray-900 border border-gray-700 rounded-xl px-4 py-3">
                <span className="text-white">
                  {selectedEstado ? 'Activo' : 'Inactivo'}
                </span>
                <button
                  onClick={() => setSelectedEstado(!selectedEstado)}
                  disabled={isLoading || isDeleting}
                  className={`text-3xl transition-colors disabled:opacity-50 ${
                    selectedEstado ? 'text-lime-500' : 'text-gray-600'
                  }`}
                >
                  {selectedEstado ? <FaToggleOn /> : <FaToggleOff />}
                </button>
              </div>
              {selectedEstado !== miembro.activo && (
                <button
                  onClick={handleUpdateEstado}
                  disabled={isLoading || isDeleting}
                  className="mt-3 w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {selectedEstado ? <FaToggleOn /> : <FaToggleOff />}
                  {selectedEstado ? 'Activar Jugador' : 'Desactivar Jugador'}
                </button>
              )}
            </div>
          )}

          {/* Eliminar Miembro */}
          <div className="pt-4 border-t border-gray-800">
            <button
              onClick={handleDelete}
              disabled={isLoading || isDeleting}
              className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <FaTrash />
              {esDelegado ? 'Eliminar Delegado' : 'Eliminar Jugador del Equipo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
