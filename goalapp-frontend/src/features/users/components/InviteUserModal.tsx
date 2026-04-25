import { useState, useEffect } from 'react';
import { FaTimes, FaUserPlus, FaEnvelope, FaUser, FaTshirt, FaStopwatch } from 'react-icons/fa';
import { GiSoccerBall, GiWhistle } from 'react-icons/gi';
import Modal from '../../../components/ui/Modal';
import { inviteUser, fetchTeamsByLeague } from '../services/usersApi';
import type { TeamResponse } from '../services/usersApi';

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
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
  admin: 1,
  entrenador: 2,
  delegado: 3,
  jugador: 4,
  observador: 5,
};

export default function InviteUserModal({ isOpen, onClose, onSuccess, ligaId }: InviteUserModalProps) {
  const [selectedRol, setSelectedRol] = useState<RolType | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    id_equipo: '',
    dorsal: '',
    posicion: '',
  });
  const [equipos, setEquipos] = useState<TeamResponse[]>([]);
  const [isLoadingEquipos, setIsLoadingEquipos] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar equipos cuando se selecciona un rol que lo requiere
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
    setIsSubmitting(true);
    setError(null);

    try {
      if (!selectedRol) {
        setError('Por favor, selecciona un rol');
        setIsSubmitting(false);
        return;
      }

      const payload: Record<string, unknown> = {
        email: formData.email,
        liga_id: ligaId,
        id_rol: rolIdMap[selectedRol],
        nombre: formData.nombre,
      };

      // Añadir campos según el rol
      if (selectedRol === 'entrenador' || selectedRol === 'delegado' || selectedRol === 'jugador') {
        if (formData.id_equipo) {
          payload.id_equipo = parseInt(formData.id_equipo, 10);
        }
      }

      if (selectedRol === 'jugador') {
        if (formData.dorsal) {
          payload.dorsal = parseInt(formData.dorsal, 10);
        }
        if (formData.posicion) {
          payload.posicion = formData.posicion;
        }
      }

      await inviteUser(payload);
      onSuccess();
      handleReset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar invitación');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      nombre: '',
      email: '',
      id_equipo: '',
      dorsal: '',
      posicion: '',
    });
    setSelectedRol(null);
    setError(null);
    onClose();
  };

  // Determinar qué campos mostrar según el rol
  const showEquipoField = selectedRol === 'entrenador' || selectedRol === 'delegado' || selectedRol === 'jugador';
  const showJugadorFields = selectedRol === 'jugador';

  return (
    <Modal isOpen={isOpen} onClose={handleReset} size="lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white text-xl font-semibold">Invitar usuario</h2>
        <button
          onClick={handleReset}
          disabled={isSubmitting}
          className="p-2 text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
        >
          <FaTimes />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Sección: Rol dentro de la liga */}
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

        {/* Campos condicionales según el rol */}
        {selectedRol && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Nombre completo - Admin, Entrenador, Delegado, Jugador, Observador */}
            <div>
              <label className="block text-zinc-300 text-sm font-medium mb-1">
                Nombre completo
              </label>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Nombre del usuario"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-lime-400 transition-colors"
                  required
                />
              </div>
            </div>

            {/* Email - Todos los roles */}
            <div>
              <label className="block text-zinc-300 text-sm font-medium mb-1">
                Correo electrónico
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="email"
                  placeholder="usuario@ejemplo.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-lime-400 transition-colors"
                  required
                />
              </div>
            </div>

            {/* Equipo - Entrenador, Delegado, Jugador */}
            {showEquipoField && (
              <div>
                <label className="block text-zinc-300 text-sm font-medium mb-1">
                  Equipo
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

            {/* Campos específicos de Jugador: Dorsal y Posición */}
            {showJugadorFields && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-300 text-sm font-medium mb-1">
                    Dorsal
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
                    Posición
                  </label>
                  <select
                    value={formData.posicion}
                    onChange={(e) => setFormData({ ...formData, posicion: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-lime-400 transition-colors"
                    required
                  >
                    <option value="">Selecciona posición</option>
                    <option value="portero">Portero</option>
                    <option value="defensa">Defensa</option>
                    <option value="centrocampista">Centrocampista</option>
                    <option value="delantero">Delantero</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500 rounded-lg px-4 py-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
          <button
            type="button"
            onClick={handleReset}
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
            <FaUserPlus />
            {isSubmitting ? 'Enviando...' : 'Enviar invitación'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
