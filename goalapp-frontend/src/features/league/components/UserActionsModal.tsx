import { useState } from 'react';
import { FaTimes, FaUserShield, FaToggleOn, FaToggleOff, FaTrash } from 'react-icons/fa';
import type { UserActionsModalProps } from '../types/member';
import { updateUsuarioRol, updateUsuarioEstado, deleteUsuarioLiga } from '../services/memberApi';

export default function UserActionsModal({
  isOpen,
  onClose,
  onSuccess,
  usuario,
  ligaId,
  rolesDisponibles,
}: UserActionsModalProps) {
  const [selectedRol, setSelectedRol] = useState(usuario.id_rol);
  const [selectedEstado, setSelectedEstado] = useState(usuario.activo);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdateRol = async () => {
    if (selectedRol === usuario.id_rol) return;

    setIsLoading(true);
    try {
      await updateUsuarioRol(ligaId, usuario.id_usuario, { id_rol: selectedRol });
      alert('Rol actualizado correctamente');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error al actualizar rol:', error);
      alert('Error al actualizar el rol del usuario');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateEstado = async () => {
    if (selectedEstado === usuario.activo) return;

    setIsLoading(true);
    try {
      await updateUsuarioEstado(ligaId, usuario.id_usuario, { activo: selectedEstado });
      alert(`Usuario ${selectedEstado ? 'activado' : 'desactivado'} correctamente`);
      onSuccess();
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      alert('Error al actualizar el estado del usuario');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`¿Estás seguro de eliminar a "${usuario.nombre_usuario}" de la liga? Esta acción no se puede deshacer.`)) {
      return;
    }

    setIsLoading(true);
    try {
      await deleteUsuarioLiga(ligaId, usuario.id_usuario);
      alert('Usuario eliminado de la liga');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      const message = error instanceof Error ? error.message : 'Error al eliminar el usuario';
      alert(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1e] border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-white text-2xl font-bold">Gestionar Usuario</h2>
              <p className="text-gray-400 text-sm mt-1">{usuario.nombre_usuario}</p>
              <p className="text-gray-500 text-xs mt-1">{usuario.email}</p>
            </div>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="text-gray-500 hover:text-white transition-colors disabled:opacity-50"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Selector de Rol */}
          <div>
            <label className="block text-gray-400 text-sm font-semibold mb-2">
              Rol en la liga
            </label>
            <select
              value={selectedRol}
              onChange={(e) => setSelectedRol(Number(e.target.value))}
              disabled={isLoading}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-lime-500 disabled:opacity-50"
            >
              {rolesDisponibles.map((rol) => (
                <option key={rol.id_rol} value={rol.id_rol}>
                  {rol.nombre.charAt(0).toUpperCase() + rol.nombre.slice(1)}
                </option>
              ))}
            </select>
            {selectedRol !== usuario.id_rol && (
              <button
                onClick={handleUpdateRol}
                disabled={isLoading}
                className="mt-3 w-full bg-lime-500 hover:bg-lime-600 text-black font-semibold py-2 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <FaUserShield />
                Actualizar Rol
              </button>
            )}
          </div>

          {/* Toggle de Estado */}
          <div>
            <label className="block text-gray-400 text-sm font-semibold mb-2">
              Estado
            </label>
            <div className="flex items-center justify-between bg-gray-900 border border-gray-700 rounded-xl px-4 py-3">
              <span className="text-white">
                {selectedEstado ? 'Activo' : 'Pendiente'}
              </span>
              <button
                onClick={() => setSelectedEstado(!selectedEstado)}
                disabled={isLoading}
                className={`text-3xl transition-colors disabled:opacity-50 ${
                  selectedEstado ? 'text-lime-500' : 'text-gray-600'
                }`}
              >
                {selectedEstado ? <FaToggleOn /> : <FaToggleOff />}
              </button>
            </div>
            {selectedEstado !== usuario.activo && (
              <button
                onClick={handleUpdateEstado}
                disabled={isLoading}
                className="mt-3 w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {selectedEstado ? <FaToggleOn /> : <FaToggleOff />}
                {selectedEstado ? 'Activar Usuario' : 'Desactivar Usuario'}
              </button>
            )}
          </div>

          {/* Eliminar Usuario */}
          <div className="pt-4 border-t border-gray-800">
            <button
              onClick={handleDelete}
              disabled={isLoading}
              className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <FaTrash />
              Eliminar de la Liga
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
