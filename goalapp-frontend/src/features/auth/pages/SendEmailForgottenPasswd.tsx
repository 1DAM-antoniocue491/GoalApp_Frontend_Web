import { Link, useNavigate } from 'react-router';
import { IoMdArrowBack } from 'react-icons/io';
import { FaSpinner } from 'react-icons/fa';
import { useState, type FormEvent } from 'react';
import { forgotPassword } from '../services/authApi';
import foco from '../../../assets/foco-auth.jpeg';

export default function SendEmailForgottenPasswd() {
  const [email, setEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !isValidEmail(email)) {
      setError('Introduce un email válido.');
      return;
    }

    setIsLoading(true);
    try {
      await forgotPassword(email);
      navigate('/email-sent', { state: { email } });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al enviar el email.';
      setError(message);
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

      {/* Formulario */}
      <div className="bg-zinc-950 flex justify-center items-center h-full w-full md:w-1/2">
        <div className="bg-zinc-800 p-3 sm:p-10 rounded-lg flex flex-col justify-center gap-9 sm:w-3/5">
          <Link to={'/login'} className="flex flex-row items-center gap-2">
            <IoMdArrowBack className="text-zinc-400" />
            <p className="text-[12px] text-zinc-400">Volver</p>
          </Link>

          <div>
            <Link to={'/'} className="text-lime-300 font-semibold mb-3 hover:text-lime-400 transition-colors">GoalApp</Link>
            <h2 className="text-white text-2xl font-semibold">¿Olvidaste tu contraseña?</h2>
            <p className="text-sm text-zinc-400">Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div>
              <label className="text-sm text-zinc-400 font-semibold block mb-1">Correo Electrónico</label>
              <input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (error) setError(null); }}
                disabled={isLoading}
                className="focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 w-full bg-zinc-700 p-2 text-sm rounded-sm placeholder:text-zinc-500 text-zinc-100 disabled:opacity-50 transition-all"
              />

              {error && (
                <div className="mt-3 bg-red-500/10 border border-red-500/30 rounded-sm p-3">
                  <p className="text-red-400 text-sm text-center">{error}</p>
                </div>
              )}

              <div className="mt-6">
                <button
                  type="submit"
                  disabled={isLoading || !email.trim()}
                  className="w-full py-2.5 text-sm bg-lime-300 text-zinc-900 rounded-full font-semibold hover:bg-lime-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    'Enviar enlace'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}