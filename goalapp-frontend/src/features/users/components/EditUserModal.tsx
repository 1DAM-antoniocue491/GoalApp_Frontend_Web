import { useState, useEffect } from 'react';
import { FaTimes, FaUser, FaTshirt, FaStopwatch, FaUserEdit, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { GiSoccerBall, GiWhistle } from 'react-icons/gi';
import Modal from '../../../components/ui/Modal';
import { fetchTeamsByLeague, type TeamResponse, type UserWithRole } from '../services/usersApi';
import { apiPut, apiPatch } from '../../../services/api';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: UserWithRole | null;
  ligaId: number;
}

type RolType = 'admin' | 'entrenador' | 'delegado' | 'jugador' | 'observador';

interface RoleOption {
  id: RolType;
  label: string;
  icon: React.ReactNode;
  color: string;
  selectedColor: string;
}

const ROLES: RoleOption[] = [
  {
    id: 'admin',
    label: 'Administrador',
    icon: <FaUser className="w-5 h-5" />,
    color: 'border-purple-500/30 hover:border-purple-500/50 bg-purple-500/10',
    selectedColor: 'border-purple-400 bg-purple-500/20 text-purple-300'
  },
  {
    id: 'entrenador',
    label: 'Entrenador',
    icon: <GiWhistle className="w-5 h-5" />,
    color: 'border-blue-500/30 hover:border-blue-500/50 bg-blue-500/10',
    selectedColor: 'border-blue-400 bg-blue-500/20 text-blue-300'
  },
  {
    id: 'delegado',
    label: 'Delegado',
    icon: <FaTshirt className="w-5 h-5" />,
    color: 'border-orange-500/30 hover:border-orange-500/50 bg-orange-500/10',
    selectedColor: 'border-orange-400 bg-orange-500/20 text-orange-300'
  },
  {
    id: 'jugador',
    label: 'Jugador',
    icon: <GiSoccerBall className="w-5 h-5" />,
    color: 'border-green-500/30 hover:border-green-500/50 bg-green-500/10',
    selectedColor: 'border-green-400 bg-green-500/20 text-green-300'
  },
  {
    id: 'observador',
    label: 'Observador',
    icon: <FaStopwatch className="w-5 h-5" />,
    color: 'border-zinc-600/30 hover:border-zinc-500/50 bg-zinc-600/10',
    selectedColor: 'border-zinc-400 bg-zinc-500/20 text-zinc-300'
  },
];

const rolIdMap: Record<RolType, number> = {
  admin: 9,
  entrenador: 10,
  delegado: 11,
  jugador: 12,
  observador: 13,
};

const revRolIdMap: Record<number, RolType> = {
  9: 'admin',
  10: 'entrenador',
  11: 'delegado',
  12: 'jugador',
  13: 'observador',
};

const POSICIONES = [
  { value: '', label: 'Selecciona posición' },
  { value: 'portero', label: 'Portero' },
  { value: 'defensa', label: 'Defensa' },
  { value: 'centrocampista', label: 'Centrocampista' },
  { value: 'delantero', label: 'Delantero' },
];

export default function EditUserModal({ isOpen, onClose, onSuccess, user, ligaId }: EditUserModalProps) {
  const [selectedRol, setSelectedRol] = useState<RolType | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    id_equipo: '',
    dorsal: '',
    posicion: '',
    activo: true,
  });
  const [equipos, setEquipos] = useState<TeamResponse[]>([]);
  const [isLoadingEquipos, setIsLoadingEquipos] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && user) {
      setSelectedRol(revRolIdMap[user.id_rol] || 'observador');
      setFormData({
        nombre: user.nombre,
        id_equipo: user.id_equipo?.toString() || '',
        dorsal: '', // Not directly in UserWithRole, might need another fetch or handled as optional
        posicion: '',
        activo: user.activo,
      });

      if (revRolIdMap[user.id_rol] === 'entrenador' || revRolIdMap[user.id_rol] === 'delegado' || revRolIdMap[user.id_rol] === 'jugador') {
        setIsLoadingEquipos(true);
        fetchTeamsByLeague(ligaId)
          .then(setEquipos)
          .catch(console.error)
          .finally(() => setIsLoadingEquipos(false));
      }
    }
  }, [isOpen, user, ligaId]);

  useEffect(() => {
    if (isOpen && (selectedRol === 'entrenador' || selectedRol === 'delegado' || selectedRol === 'jugador')) {
      setIsLoadingEquipos(true);
      fetchTeamsByLeague(ligaId)
        .then(setEquipos)
        .catch(console.error)
        .finally(() => setIsLoadingEquipos(false));
    }
  }, [isOpen, selectedRol, ligaId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    setError(null);

    try {
      if (!selectedRol) {
        setError('Por favor, selecciona un rol');
        setIsSubmitting(false);
        return;
      }

      // Update Role
      await apiPut(`/usuarios/${user.id_usuario}/rol`, {
        id_rol: rolIdMap[selectedRol],
        id_equipo: (selectedRol === 'entrenador' || selectedRol === 'delegado' || selectedRol === 'jugador')
          ? parseInt(formData.id_equipo, 10)
          : undefined,
        dorsal: selectedRol === 'jugador' ? formData.dorsal : undefined,
        posicion: selectedRol === 'jugador' ? formData.posicion : undefined,
      });

      // Update Status
      await apiPatch(`/usuarios/${user.id_usuario}/estado`, {
        activo: formData.activo,
      });

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar el usuario');
    } finally {
      setIsSubmitting(false);
    }
  };

  const showEquipoField = selectedRol === 'entrenador' || selectedRol === 'delegado' || selectedRol === 'jugador';
  const showJugadorFields = selectedRol === 'jugador';

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white text-xl font-semibold flex items-center gap-2">
          <FaUserEdit className="text-lime-400" />
          Editar usuario
        </h2>
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="p-2 text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
        >
          <FaTimes />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h3 className="text-white text-sm font-medium mb-3">Rol dentro de la liga</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {ROLES.map((role) => {
              const isSelected = selectedRol === role.id;
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setSelectedRol(role.id)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                    isSelected
                      ? role.selectedColor
                      : role.color + ' text-zinc-400'
                  }`}
                >
                  {role.icon}
                  <span className="text-xs font-medium text-center">{role.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {selectedRol && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div>
              <label className="block text-zinc-300 text-sm font-medium mb-1">
                Nombre completo
              </label>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-lime-400 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-300 text-sm font-medium mb-1">
                Estado de la cuenta
              </label>
              <div className="flex items-center gap-3 p-3 bg-zinc-800 border border-zinc-700 rounded-lg">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, activo: true })}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-all ${
                    formData.activo
                      ? 'bg-lime-500 text-zinc-900 font-semibold'
                      : 'bg-zinc-700 text-zinc-400 hover:bg-zinc-600'
                  }`}
                >
                  <FaCheckCircle /> Activo
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, activo: false })}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-all ${
                    !formData.activo
                      ? 'bg-red-500 text-white font-semibold'
                      : 'bg-zinc-700 text-zinc-400 hover:bg-zinc-600'
                  }`}
                >
                  <FaTimesCircle /> Inactivo
                </button>
              </div>
            </div>

            {showEquipoField && (
              <div>
                <label className="block text-zinc-300 text-sm font-medium mb-1">
                  Equipo <span className="text-lime-400">*</span>
                </label>
                {isLoadingEquipos ? (
                  <div className="flex items-center gap-2 text-zinc-500 text-sm">
                    <div className="w-4 h-4 border-2 border-zinc-600 border-t-lime-400 rounded-full animate-spin" />
                    Cargando equipos...
                  </div>
                ) : (
                  <select
                    value={formData.id_equipo}
                    onChange={(e) => setFormData({ ...formData, id_equipo: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-lime-400 transition-colors"
                    required
                  >
                    <option value="">Selecciona un equipo</option>
                    {equipos.map((equipo) => (
                      <option key={equipo.id_equipo} value={equipo.id_equipo}>
                        {equipo.nombre}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {showJugadorFields && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-300 text-sm font-medium mb-1">
                    Dorsal <span className="text-lime-400">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="Ej: 10"
                    value={formData.dorsal}
                    onChange={(e) => setFormData({ ...formData, dorsal: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-lime-400 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 text-sm font-medium mb-1">
                    Posición <span className="text-lime-400">*</span>
                  </label>
                  <select
                    value={formData.posicion}
                    onChange={(e) => setFormData({ ...formData, posicion: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-lime-400 transition-colors"
                    required
                  >
                    {POSICIONES.map((pos) => (
                      <option key={pos.value} value={pos.value}>
                        {pos.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500 rounded-lg px-4 py-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !selectedRol}
            className="flex items-center gap-2 px-5 py-2.5 bg-lime-400 hover:bg-lime-300 text-zinc-950 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:grayscale"
          >
            {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
