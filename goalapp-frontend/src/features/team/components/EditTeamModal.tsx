import { useState } from 'react';
import { FaTimes, FaShieldAlt } from 'react-icons/fa';
import Modal from '../../../components/ui/Modal';
import { updateTeam, type UpdateTeamPayload } from '../services/teamApi';

interface EditTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  ligaId: number;
  equipoId: number;
  initialData: {
    nombre: string;
    ciudad?: string;
    estadio?: string;
    escudo?: string | null;
    colores?: string;
  };
  onSave: () => void;
}

export default function EditTeamModal({ isOpen, onClose, ligaId, equipoId, initialData, onSave }: EditTeamModalProps) {
  const [formData, setFormData] = useState({
    nombre: initialData.nombre || '',
    ciudad: initialData.ciudad || '',
    estadio: initialData.estadio || '',
    escudo: initialData.escudo || '',
    colores: initialData.colores || '#D4FF59',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const payload: UpdateTeamPayload = {
        nombre: formData.nombre,
        colores: formData.colores,
      };

      if (formData.ciudad) payload.ciudad = formData.ciudad;
      if (formData.estadio) payload.estadio = formData.estadio;

      await updateTeam(equipoId, payload);
      onSave();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar el equipo');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      nombre: initialData.nombre || '',
      ciudad: initialData.ciudad || '',
      estadio: initialData.estadio || '',
      escudo: initialData.escudo || '',
      colores: initialData.colores || '#D4FF59',
    });
    setError(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <div className="flex flex-col items-center mb-6">
        <div
          className="w-20 h-20 bg-zinc-700 rounded-full flex items-center justify-center border-2 border-zinc-600 mb-3"
        >
          {formData.escudo ? (
            <img src={formData.escudo} alt="Escudo" className="w-full h-full object-cover" />
          ) : (
            <FaShieldAlt className="text-white text-3xl" />
          )}
        </div>
        <p className="text-zinc-400 text-sm">Escudo actual</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
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

        <div className="grid grid-cols-2 gap-4">
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
        </div>

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

        {error && (
          <div className="bg-red-500/10 border border-red-500 rounded-lg px-4 py-2">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

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
            Guardar cambios
          </button>
        </div>
      </form>
    </Modal>
  );
}
