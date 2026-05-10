import { useState, useRef } from 'react';
import { FaTimes, FaPlus } from 'react-icons/fa';
import Modal from '../../../components/ui/Modal';
import { createTeam, type CreateTeamPayload } from '../services/teamApi';

/**
 * Genera las iniciales de un nombre para mostrar en el logo automático
 */
function getInitials(nombre: string): string {
  if (!nombre) return 'E';
  const parts = nombre.trim().split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return nombre.substring(0, 2).toUpperCase();
}

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  ligaId: number;
}

export default function CreateTeamModal({ isOpen, onClose, onSuccess, ligaId }: CreateTeamModalProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    ciudad: '',
    colores: '#D4FF59',
    estadio: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const createdTeamId = useRef<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const payload: CreateTeamPayload = {
        nombre: formData.nombre,
        colores: formData.colores,
        ciudad: formData.ciudad || undefined,
        estadio: formData.estadio || undefined,
        id_liga: ligaId,
      };

      await createTeam(payload);

      onSuccess();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el equipo');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({ nombre: '', ciudad: '', colores: '#D4FF59', estadio: '' });
    setError(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      {/* Logo automático con iniciales */}
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 bg-gradient-to-br from-lime-400 to-emerald-500 rounded-xl flex items-center justify-center">
          <span className="text-zinc-900 font-bold text-2xl">
            {formData.nombre ? getInitials(formData.nombre) : 'EQ'}
          </span>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nombre del equipo */}
        <div>
          <label className="block text-zinc-300 text-sm font-medium mb-1">
            Nombre del equipo
          </label>
          <input
            type="text"
            placeholder="Ingrese el nombre del equipo"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-lime-400 transition-colors"
            required
          />
        </div>

        {/* Ciudad y Colores en la misma fila */}
        <div className="grid grid-cols-2 gap-4">
          {/* Ciudad */}
          <div>
            <label className="block text-zinc-300 text-sm font-medium mb-1">
              Ciudad
            </label>
            <input
              type="text"
              placeholder="Ciudad del equipo"
              value={formData.ciudad}
              onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
              className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-lime-400 transition-colors"
            />
          </div>

          {/* Colores */}
          <div>
            <label className="block text-zinc-300 text-sm font-medium mb-1">
              Colores principales
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={formData.colores}
                onChange={(e) => setFormData({ ...formData, colores: e.target.value })}
                className="w-10 h-10 rounded cursor-pointer border-0 bg-transparent"
              />
              <span className="text-zinc-400 font-mono text-sm">{formData.colores}</span>
            </div>
          </div>
        </div>

        {/* Estadio */}
        <div>
          <label className="block text-zinc-300 text-sm font-medium mb-1">
            Estadio
          </label>
          <input
            type="text"
            placeholder="Nombre del estadio"
            value={formData.estadio}
            onChange={(e) => setFormData({ ...formData, estadio: e.target.value })}
            className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-lime-400 transition-colors"
          />
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500 rounded-lg px-4 py-2">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2.5 bg-lime-400 hover:bg-lime-300 text-zinc-950 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaPlus />
            {isSubmitting ? 'Creando...' : 'Crear Equipo'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
