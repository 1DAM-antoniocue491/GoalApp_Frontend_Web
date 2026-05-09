import { useState, useEffect, useMemo } from 'react';
import { FaTimes, FaQrcode, FaCopy, FaCheck, FaShareAlt, FaTrash } from 'react-icons/fa';
import { GiSoccerBall, GiWhistle } from 'react-icons/gi';
import { FaUser, FaTshirt, FaStopwatch } from 'react-icons/fa';
import Modal from '../../../components/ui/Modal';
import { generateUnionCode, deleteUnionCode } from '../services/unionCodeApi';
import type { GenerateCodePayload, UnionCodeResponse } from '../services/unionCodeApi';
import { fetchTeamsByLeague } from '../services/usersApi';
import type { TeamResponse } from '../services/usersApi';
import { apiGet } from '../../../services/api';

interface GenerateUnionCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  ligaId: number;
  ligaNombre?: string;
  userRole?: 'admin' | 'entrenador' | 'delegado' | 'jugador' | 'observador';
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

const POSICIONES = [
  { value: '', label: 'Selecciona posición' },
  { value: 'portero', label: 'Portero' },
  { value: 'defensa', label: 'Defensa' },
  { value: 'centrocampista', label: 'Centrocampista' },
  { value: 'delantero', label: 'Delantero' },
];

export default function GenerateUnionCodeModal({
  isOpen,
  onClose,
  onSuccess,
  ligaId,
  ligaNombre,
  userRole = 'admin'
}: GenerateUnionCodeModalProps) {
  const [selectedRol, setSelectedRol] = useState<RolType | null>(null);
  const [equipos, setEquipos] = useState<TeamResponse[]>([]);
  const [isLoadingEquipos, setIsLoadingEquipos] = useState(false);
  const [formData, setFormData] = useState({
    id_equipo: '',
    dorsal: '',
    posicion: '',
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<UnionCodeResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estado para el equipo del usuario (entrenador/delegado)
  const [miEquipoId, setMiEquipoId] = useState<number | null>(null);
  const [isLoadingMiEquipo, setIsLoadingMiEquipo] = useState(false);

  // Filtrar roles disponibles según el rol del usuario actual
  const availableRoles = useMemo(() => {
    switch (userRole) {
      case 'admin':
        return ROLES; // Admin puede generar cualquier rol
      case 'entrenador':
        return ROLES.filter(r => r.id === 'delegado' || r.id === 'jugador');
      case 'delegado':
        return ROLES.filter(r => r.id === 'jugador');
      case 'jugador':
      case 'observador':
        return ROLES.filter(r => r.id === 'observador');
      default:
        return ROLES.filter(r => r.id === 'observador');
    }
  }, [userRole]);

  // Determinar si se requiere seleccionar equipo manualmente (solo admin)
  const requiereEquipoManual = useMemo(() => {
    return userRole === 'admin' && selectedRol && (selectedRol === 'entrenador' || selectedRol === 'delegado' || selectedRol === 'jugador');
  }, [userRole, selectedRol]);

  // Cargar equipos cuando se selecciona un rol que lo requiere (solo admin)
  useEffect(() => {
    if (isOpen && selectedRol && requiereEquipoManual) {
      setIsLoadingEquipos(true);
      fetchTeamsByLeague(ligaId)
        .then(setEquipos)
        .catch(console.error)
        .finally(() => setIsLoadingEquipos(false));
    }
  }, [isOpen, selectedRol, ligaId, requiereEquipoManual]);

  // Cargar el equipo del usuario cuando es entrenador o delegado
  useEffect(() => {
    if (isOpen && (userRole === 'entrenador' || userRole === 'delegado')) {
      setIsLoadingMiEquipo(true);
      apiGet<{ id_equipo: number }>('/equipos/usuario/mi-equipo', {
        liga_id: ligaId,
      })
        .then(data => setMiEquipoId(data.id_equipo))
        .catch(err => {
          console.error('Error al cargar mi equipo:', err);
          setError('No se pudo cargar tu equipo. Asegúrate de tener un equipo asignado.');
        })
        .finally(() => setIsLoadingMiEquipo(false));
    }
  }, [isOpen, userRole, ligaId]);

  const handleGenerate = async () => {
    if (!selectedRol) {
      setError('Por favor, selecciona un rol');
      return;
    }

    // Validación de equipo solo para admin
    if (userRole === 'admin' && (selectedRol === 'entrenador' || selectedRol === 'delegado' || selectedRol === 'jugador')) {
      if (!formData.id_equipo) {
        setError('Por favor, selecciona un equipo');
        return;
      }
    }

    // Validaciones específicas para jugador (dorsal y posición siempre requeridos)
    if (selectedRol === 'jugador') {
      if (!formData.dorsal) {
        setError('Por favor, introduce el dorsal');
        return;
      }
      if (!formData.posicion) {
        setError('Por favor, selecciona la posición');
        return;
      }
    }

    setIsGenerating(true);
    setError(null);

    try {
      const payload: GenerateCodePayload = {
        id_rol: rolIdMap[selectedRol],
      };

      // Enviar id_equipo según el rol del usuario actual
      // - Admin: lo selecciona manualmente del selector
      // - Entrenador/Delegado: se obtiene automáticamente de su equipo
      if (selectedRol === 'entrenador' || selectedRol === 'delegado' || selectedRol === 'jugador') {
        if (userRole === 'admin') {
          payload.id_equipo = parseInt(formData.id_equipo, 10);
        } else if (userRole === 'entrenador' || userRole === 'delegado') {
          if (miEquipoId) {
            payload.id_equipo = miEquipoId;
          } else {
            setError('No tienes un equipo asignado. Contacta con el administrador.');
            setIsGenerating(false);
            return;
          }
        }
      }

      if (selectedRol === 'jugador') {
        payload.dorsal = formData.dorsal;  // Enviar como string (backend espera VARCHAR)
        payload.posicion = formData.posicion;
      }

      const response = await generateUnionCode(ligaId, payload);
      setGeneratedCode(response);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al generar código');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyCode = async () => {
    if (generatedCode?.codigo) {
      await navigator.clipboard.writeText(generatedCode.codigo);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = () => {
    if (generatedCode?.codigo && navigator.share) {
      navigator.share({
        title: 'Invitación a liga',
        text: `Únete a la liga usando el código: ${generatedCode.codigo}`,
        url: window.location.origin + '/onboarding',
      }).catch(console.error);
    } else {
      handleCopyCode();
    }
  };

  const handleDeleteCode = async () => {
    if (!generatedCode?.codigo) return;

    setIsDeleting(true);
    setError(null);

    try {
      await deleteUnionCode(ligaId, generatedCode.codigo);
      // Limpiar estado después de eliminar
      setGeneratedCode(null);
      setCopied(false);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar el código');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReset = () => {
    setGeneratedCode(null);
    setSelectedRol(null);
    setEquipos([]);
    setFormData({
      id_equipo: '',
      dorsal: '',
      posicion: '',
    });
    setError(null);
    setCopied(false);
    onClose();
  };

  // Formatear fecha de expiración
  const formatExpiration = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={handleReset} size="lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white text-xl font-semibold">
          {generatedCode ? 'Código generado' : 'Generar código de unión'}
        </h2>
        <button
          onClick={handleReset}
          disabled={isGenerating}
          className="p-2 text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
        >
          <FaTimes />
        </button>
      </div>

      {!generatedCode ? (
        <div className="space-y-6">
          {/* Descripción */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
            <p className="text-zinc-300 text-sm">
              <strong className="text-white">Generar código</strong> crea un código único que puedes
              compartir por WhatsApp, SMS o cualquier medio. La persona que lo use recibirá el rol
              que selecciones aquí.
            </p>
          </div>

          {/* Sección: Rol dentro de la liga */}
          <div>
            <h3 className="text-white text-sm font-medium mb-3">
              Rol que recibirá el usuario
              {userRole !== 'admin' && (
                <span className="block text-zinc-500 text-xs font-normal mt-1">
                  ({availableRoles.length} roles disponibles para tu rol)
                </span>
              )}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {availableRoles.map((role) => {
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
              {/* Equipo - Solo admin debe seleccionarlo; entrenador/delegado se asigna automáticamente */}
              {(selectedRol === 'entrenador' || selectedRol === 'delegado' || selectedRol === 'jugador') && (
                <div>
                  {userRole === 'admin' ? (
                    <>
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
                    </>
                  ) : isLoadingMiEquipo ? (
                    <div className="flex items-center gap-2 text-zinc-500 text-sm">
                      <div className="w-4 h-4 border-2 border-zinc-600 border-t-lime-400 rounded-full animate-spin" />
                      Cargando tu equipo...
                    </div>
                  ) : miEquipoId ? (
                    <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                      <p className="text-zinc-300 text-sm">
                        {userRole === 'entrenador' && (
                          <>
                            <span className="text-lime-400 font-semibold">Entrenador:</span> El código se asignará automáticamente a tu equipo (ID: {miEquipoId}).
                          </>
                        )}
                        {userRole === 'delegado' && (
                          <>
                            <span className="text-lime-400 font-semibold">Delegado:</span> El código se asignará automáticamente a tu equipo (ID: {miEquipoId}).
                          </>
                        )}
                      </p>
                    </div>
                  ) : (
                    <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
                      <p className="text-red-300 text-sm">
                        No se pudo cargar tu equipo. Asegúrate de tener un equipo asignado en esta liga.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Campos específicos de Jugador: Dorsal y Posición */}
              {selectedRol === 'jugador' && (
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
              disabled={isGenerating}
              className="px-5 py-2.5 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating || !selectedRol}
              className="flex items-center gap-2 px-5 py-2.5 bg-lime-400 hover:bg-lime-300 text-zinc-950 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:grayscale"
            >
              <FaQrcode />
              {isGenerating ? 'Generando...' : 'Generar código'}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Código generado */}
          <div className="bg-gradient-to-br from-lime-400/10 to-lime-500/5 border border-lime-400/30 rounded-xl p-6 text-center">
            <p className="text-zinc-400 text-sm mb-2">Código de unión</p>
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="text-4xl font-mono font-bold text-lime-400 tracking-wider">
                {generatedCode.codigo}
              </span>
              <button
                onClick={handleCopyCode}
                className="p-2 text-lime-400 hover:bg-lime-400/10 rounded-lg transition-colors"
                title="Copiar código"
              >
                {copied ? <FaCheck /> : <FaCopy />}
              </button>
            </div>
            <p className="text-zinc-500 text-xs mb-4">
              Válido hasta: {formatExpiration(generatedCode.expiracion)}
            </p>

            {copied ? (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-3 mb-4">
                <p className="text-green-400 text-sm text-center">
                  <FaCheck className="inline mr-2" />
                  Código copiado. Ahora puedes eliminarlo o compartirlo.
                </p>
              </div>
            ) : null}

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <FaCopy /> {copied ? 'Copiado' : 'Copiar'}
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 bg-lime-400 hover:bg-lime-300 text-zinc-950 rounded-lg text-sm font-semibold transition-colors"
              >
                <FaShareAlt /> Compartir
              </button>
              <button
                onClick={handleDeleteCode}
                disabled={isDeleting}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                <FaTrash /> {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>

          {/* Información del rol */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
            <h4 className="text-white text-sm font-medium mb-2">Este código otorga:</h4>
            <ul className="space-y-2 text-zinc-400 text-sm">
              <li className="flex items-center gap-2">
                <FaCheck className="text-lime-400 text-xs" />
                Rol: <strong className="text-white">{generatedCode.rol}</strong>
              </li>
              {ligaNombre && (
                <li className="flex items-center gap-2">
                  <FaCheck className="text-lime-400 text-xs" />
                  Liga: <strong className="text-white">{ligaNombre}</strong>
                </li>
              )}
              {generatedCode.id_equipo && (
                <li className="flex items-center gap-2">
                  <FaCheck className="text-lime-400 text-xs" />
                  Equipo ID: <strong className="text-white">{generatedCode.id_equipo}</strong>
                </li>
              )}
            </ul>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500 rounded-lg px-4 py-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Instrucciones */}
          <div className="bg-zinc-800/30 border border-zinc-700/50 rounded-lg p-4">
            <p className="text-zinc-400 text-sm">
              <strong className="text-white">Cómo usar:</strong> Comparte este código con la persona
              que quieras invitar. Deberá ir a la pantalla de onboarding y seleccionar
              "Unirme a una liga con código".
            </p>
          </div>

          {/* Botón cerrar */}
          <div className="flex justify-end pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={handleReset}
              className="px-5 py-2.5 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg font-medium transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
