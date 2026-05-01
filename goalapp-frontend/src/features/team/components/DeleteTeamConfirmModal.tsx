import { useState } from 'react';
import { FaShieldAlt } from 'react-icons/fa';
import Modal from '../../../components/ui/Modal';
import { deleteTeam } from '../services/teamApi';
import { useNavigate } from "react-router-dom";

interface DeleteTeamConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipoNombre: string;
  ligaId: number;
  equipoId: number;
  onConfirm: () => void;
}

export default function DeleteTeamConfirmModal({ isOpen, onClose, equipoNombre, ligaId, equipoId, onConfirm }: DeleteTeamConfirmModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      await deleteTeam(equipoId);
      onConfirm();
      handleClose();
      navigate("/teams");
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar el equipo');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <div className="flex flex-col items-center mb-6">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
          <FaShieldAlt className="text-red-500 text-2xl" />
        </div>
        <h3 className="text-white text-lg font-semibold text-center">
         ¿Eliminar equipo?
        </h3>
        <p className="text-zinc-400 text-sm text-center mt-2">
          Estás a punto de eliminar: <span className="text-white font-medium">"{equipoNombre}"</span>
        </p>
        <p className="text-red-400 text-xs text-center mt-2">
          Esta acción no se puede deshacer
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500 rounded-lg px-4 py-2 mb-4">
          <p className="text-red-400 text-sm text-center">{error}</p>
        </div>
      )}

      <div className="flex justify-center gap-3">
        <button
          type="button"
          onClick={handleClose}
          disabled={isDeleting}
          className="px-5 py-2.5 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDeleting ? 'Eliminando...' : 'Eliminar Equipo'}
        </button>
      </div>
    </Modal>
  );
}
