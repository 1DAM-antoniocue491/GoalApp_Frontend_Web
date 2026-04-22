import { useState } from 'react';
import { FaTimes, FaUserPlus, FaEnvelope } from 'react-icons/fa';
import Modal from '../../../components/ui/Modal';
import { inviteUser } from '../services/usersApi';

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  ligaId: number;
}

export default function InviteUserModal({ isOpen, onClose, onSuccess, ligaId }: InviteUserModalProps) {
  const [formData, setFormData] = useState({
    email: '',
    id_rol: 4, // Default: jugador
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await inviteUser({
        email: formData.email,
        liga_id: ligaId,
        id_rol: formData.id_rol,
      });
      onSuccess();
      setFormData({ email: '', id_rol: 4 });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar invitación');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({ email: '', id_rol: 4 });
    setError(null);
    onClose();
  };

  const roles: { value: number; label: string }[] = [
    { value: 1, label: 'Admin' },
    { value: 2, label: 'Entrenador' },
    { value: 3, label: 'Delegado' },
    { value: 4, label: 'Jugador' },
    { value: 5, label: 'Observador' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white text-xl font-semibold">Invitar usuario</h2>
        <button
          onClick={handleClose}
          disabled={isSubmitting}
          className="p-2 text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
        >
          <FaTimes />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label className="block text-zinc-300 text-sm font-medium mb-1">
            Email del usuario
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
          <p className="text-zinc-500 text-xs mt-1">
            El usuario recibirá un email con la invitación a la liga
          </p>
        </div>

        {/* Rol */}
        <div>
          <label className="block text-zinc-300 text-sm font-medium mb-1">
            Rol en la liga
          </label>
          <select
            value={formData.id_rol}
            onChange={(e) => setFormData({ ...formData, id_rol: Number(e.target.value) })}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-lime-400 transition-colors"
          >
            {roles.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
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
            <FaUserPlus />
            {isSubmitting ? 'Enviando...' : 'Enviar invitación'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
