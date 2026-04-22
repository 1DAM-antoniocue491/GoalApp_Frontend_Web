/**
 * Página de restablecer contraseña
 * Permite al usuario establecer una nueva contraseña usando un token de recuperación
 */

import { Link, useNavigate, useSearchParams } from 'react-router';
import { FaEye, FaEyeSlash, FaSpinner, FaLock } from 'react-icons/fa';
import { useState, type FormEvent } from 'react';
import { resetPassword } from '../services/authApi';
import foco from '../../../assets/foco-auth.jpeg';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isValidForm = (): boolean => {
    if (!token) return false;
    if (newPassword.length < 6) return false;
    if (newPassword !== confirmPassword) return false;
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isValidForm()) return;

    setIsLoading(true);
    try {
      await resetPassword({
        token,
        nueva_contrasena: newPassword,
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al restablecer la contraseña.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-zinc-950 min-h-screen flex justify-center md:justify-start items-center">
      {/* Imagen decorativa (solo en desktop) */}
      <div className="hidden md:block relative w-1/2">
        <img src={foco} alt="Logo del proyecto" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-zinc-950 from-30%"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-zinc-950 from-30%"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-transparent to-zinc-950 from-30%"></div>
      </div>

      {/* Contenido */}
      <div className="bg-zinc-950 flex justify-center items-center h-full w-full md:w-1/2">
        <div className="bg-zinc-800 p-3 sm:p-10 rounded-lg flex flex-col justify-center gap-9 sm:w-3/5">
          {success ? (
            <div className="flex flex-col items-center text-center gap-4">
              <div className="bg-lime-300/10 rounded-full p-4">
                <FaLock className="text-lime-400 text-5xl" />
              </div>
              <div>
                <h2 className="text-white text-2xl font-semibold mb-2">Contraseña actualizada</h2>
                <p className="text-sm text-zinc-400">
                  Tu contraseña ha sido cambiada correctamente. Ya puedes iniciar sesión con tu nueva contraseña.
                </p>
              </div>
              <Link
                to="/login"
                className="w-full py-2.5 text-sm bg-lime-300 text-zinc-900 rounded-full font-semibold hover:bg-lime-400 transition-colors text-center"
              >
                Iniciar sesión
              </Link>
            </div>
          ) : (
            <>
              <div>
                <Link to="/" className="text-lime-300 font-semibold mb-3 hover:text-lime-400 transition-colors">
                  GoalApp
                </Link>
                <h2 className="text-white text-2xl font-semibold">Restablecer contraseña</h2>
                <p className="text-sm text-zinc-400">Introduce tu nueva contraseña para recuperar el acceso a tu cuenta.</p>
              </div>

              {!token && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-sm p-3">
                  <p className="text-red-400 text-sm text-center">
                    Enlace inválido o expirado. Solicita uno nuevo.
                  </p>
                  <Link to="/forgot-password" className="text-blue-400 text-sm hover:text-blue-300 block text-center mt-2">
                    Solicitar nuevo enlace
                  </Link>
                </div>
              )}

              {token && (
                <form onSubmit={handleSubmit}>
                  <div>
                    <label className="text-sm text-zinc-400 font-semibold block mb-1">Nueva contraseña</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder="Mínimo 6 caracteres"
                        value={newPassword}
                        onChange={(e) => { setNewPassword(e.target.value); if (error) setError(null); }}
                        disabled={isLoading}
                        className="focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 w-full bg-zinc-700 p-2 pr-10 text-sm rounded-sm placeholder:text-zinc-500 text-zinc-100 disabled:opacity-50 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition-colors"
                        tabIndex={-1}
                      >
                        {showNewPassword ? <FaEyeSlash className="text-lg" /> : <FaEye className="text-lg" />}
                      </button>
                    </div>

                    <label className="text-sm text-zinc-400 font-semibold block mb-1 mt-3">Confirmar contraseña</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Repite la contraseña"
                        value={confirmPassword}
                        onChange={(e) => { setConfirmPassword(e.target.value); if (error) setError(null); }}
                        disabled={isLoading}
                        className="focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 w-full bg-zinc-700 p-2 pr-10 text-sm rounded-sm placeholder:text-zinc-500 text-zinc-100 disabled:opacity-50 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition-colors"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? <FaEyeSlash className="text-lg" /> : <FaEye className="text-lg" />}
                      </button>
                    </div>

                    {confirmPassword && newPassword !== confirmPassword && (
                      <p className="text-red-400 text-xs mt-1">Las contraseñas no coinciden</p>
                    )}
                  </div>

                  {error && (
                    <div className="mt-3 bg-red-500/10 border border-red-500/30 rounded-sm p-3">
                      <p className="text-red-400 text-sm text-center">{error}</p>
                    </div>
                  )}

                  <div className="mt-6">
                    <button
                      type="submit"
                      disabled={isLoading || !isValidForm()}
                      className="w-full py-2.5 text-sm bg-lime-300 text-zinc-900 rounded-full font-semibold hover:bg-lime-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <FaSpinner className="animate-spin" />
                          Restableciendo...
                        </>
                      ) : (
                        'Restablecer contraseña'
                      )}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}