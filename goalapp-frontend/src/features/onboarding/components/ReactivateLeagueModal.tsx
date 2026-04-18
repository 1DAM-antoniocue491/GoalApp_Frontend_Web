/**
 * Modal de confirmación para reactivar una liga finalizada
 */

import { FiX, FiLoader, FiAlertCircle } from 'react-icons/fi';

interface ReactivateLeagueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  leagueName: string;
  isSubmitting?: boolean;
  error?: string | null;
}

export function ReactivateLeagueModal({
  isOpen,
  onClose,
  onConfirm,
  leagueName,
  isSubmitting = false,
  error = null,
}: ReactivateLeagueModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={isSubmitting ? undefined : onClose} />

      <div className="relative bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white text-xl font-semibold">Reactivar Liga</h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-zinc-400 mb-2">
          ¿Estás seguro que deseas reactivar esta liga?
        </p>
        <p className="text-sm text-zinc-500 mb-6">
          Todos los miembros anteriores volverán a tener acceso inmediato a la liga.
        </p>

        {leagueName && (
          <div className="mb-6 p-3 bg-zinc-800/50 border border-zinc-700 rounded-lg">
            <p className="text-xs text-zinc-500 mb-1">Liga</p>
            <p className="text-white font-semibold">{leagueName}</p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-lg flex items-center gap-2">
            <FiAlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-2.5 text-white font-medium rounded-lg border border-zinc-700 hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex-1 py-2.5 bg-gradient-to-r from-lime-500 to-emerald-500 text-zinc-900 font-semibold rounded-lg hover:from-lime-400 hover:to-emerald-400 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <FiLoader className="w-4 h-4 animate-spin" />
                Reactivando...
              </>
            ) : (
              'Sí, reactivar liga'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}