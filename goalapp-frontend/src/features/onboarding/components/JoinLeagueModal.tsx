/**
 * Modal para unirse a una liga mediante código de invitación
 */

import { useState, useEffect } from 'react';
import { FiX, FiLoader, FiAlertCircle, FiCheck } from 'react-icons/fi';
import { validateCode, joinLeagueByCode } from '../services/onboardingApi';

interface JoinLeagueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface CodeInfo {
  valido: boolean;
  liga_nombre: string;
  rol: string;
  equipo_nombre?: string;
}

export function JoinLeagueModal({ isOpen, onClose, onSuccess }: JoinLeagueModalProps) {
  const [invitationCode, setInvitationCode] = useState('');
  const [codeInfo, setCodeInfo] = useState<CodeInfo | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Resetear estado al cerrar
  useEffect(() => {
    if (!isOpen) {
      setInvitationCode('');
      setCodeInfo(null);
      setError(null);
    }
  }, [isOpen]);

  // Retorno temprano si está cerrado
  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const codigoLimpio = invitationCode.trim().toUpperCase();

    if (!codigoLimpio) {
      setError('Introduce un código de invitación');
      return;
    }

    if (!/^[A-Z0-9]{6,8}$/.test(codigoLimpio)) {
      setError('El código debe tener 6-8 caracteres alfanuméricos (ej: A7K9M2)');
      return;
    }

    setIsSubmitting(true);

    try {
      // Paso 1: Validar código
      const info = await validateCode(codigoLimpio);
      setCodeInfo(info);

      // Paso 2: Unirse automáticamente (el backend asigna el rol)
      await joinLeagueByCode(codigoLimpio);

      onSuccess();
      handleClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Código inválido o expirado';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setInvitationCode('');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white text-xl font-semibold">Unirme a una liga</h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-zinc-400 mb-6">
          Introduce el código de invitación para unirte automáticamente
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-lg flex items-center gap-2">
            <FiAlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {codeInfo && (
          <div className="mb-4 p-3 bg-lime-500/10 border border-lime-500/20 rounded-lg">
            <p className="text-lime-400 text-sm font-medium mb-1 flex items-center gap-2">
              <FiCheck className="w-4 h-4" />
              ¡Código válido!
            </p>
            <p className="text-zinc-300 text-sm">
              Liga: <strong>{codeInfo.liga_nombre}</strong>
            </p>
            <p className="text-zinc-300 text-sm">
              Rol: <strong>{codeInfo.rol}</strong>
            </p>
            {codeInfo.equipo_nombre && (
              <p className="text-zinc-300 text-sm">
                Equipo: <strong>{codeInfo.equipo_nombre}</strong>
              </p>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">
              Código de invitación
            </label>
            <input
              type="text"
              value={invitationCode}
              onChange={(e) => {
                const value = e.target.value.toUpperCase();
                setInvitationCode(value);
                if (error) setError(null);
              }}
              placeholder="Ej: A7K9M2"
              disabled={isSubmitting || !!codeInfo}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-lime-500 disabled:opacity-50 text-center font-mono tracking-wider"
              maxLength={8}
            />
            <p className="text-xs text-zinc-500 mt-1">
              6-8 caracteres alfanuméricos
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 py-2.5 text-white font-medium rounded-lg border border-zinc-700 hover:bg-zinc-800 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !invitationCode.trim() || !!codeInfo}
              className="flex-1 py-2.5 bg-gradient-to-r from-lime-500 to-emerald-500 text-zinc-900 font-semibold rounded-lg hover:from-lime-400 hover:to-emerald-400 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <FiLoader className="w-4 h-4 animate-spin" />
                  Uniéndome...
                </>
              ) : (
                'Unirme a la liga'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}