/**
 * Página de confirmación de email enviado
 * Muestra confirmación de que el enlace de recuperación fue enviado
 * Permite reenviar el email si no ha llegado
 */

import { Link, useLocation } from 'react-router';
import { useState, useEffect } from 'react';
import { FaCheckCircle, FaSpinner, FaEnvelope } from 'react-icons/fa';
import { IoMdArrowBack } from 'react-icons/io';
import { forgotPassword } from '../services/authApi';
import foco from '../../../assets/foco-auth.jpeg';

export default function EmailSentPage() {
  const location = useLocation();
  const email = (location.state as { email?: string })?.email || '';

  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  // Cooldown para el botón de reenviar
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (!email || cooldown > 0) return;

    setIsResending(true);
    setResendMessage(null);

    try {
      await forgotPassword(email);
      setResendMessage('Email reenviado correctamente');
      setCooldown(60);
    } catch {
      setResendMessage('Error al reenviar el email. Inténtalo de nuevo.');
    } finally {
      setIsResending(false);
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
          <Link to={'/login'} className="flex flex-row items-center gap-2">
            <IoMdArrowBack className="text-zinc-400" />
            <p className="text-[12px] text-zinc-400">Volver</p>
          </Link>

          <div className='flex flex-col gap-2'>
            <Link to={'/'} className="text-lime-300 font-semibold mb-3 hover:text-lime-400 transition-colors">GoalApp</Link>
            <h2 className="text-white text-2xl font-semibold">¡Correo enviado!</h2>
            <p className="text-sm text-zinc-400">
              Hemos enviado un enlace para restablecer tu contraseña a
              {email && <span className="text-lime-300 font-medium"> {email}</span>}
            </p>
          </div>

          <div className="flex flex-col items-center text-center gap-4">
            <div className="bg-lime-300/10 rounded-full p-4">
              <FaEnvelope className="text-lime-400 text-5xl" />
            </div>

            <p className="text-xs text-zinc-500">
              Si no encuentras el email, revisa tu carpeta de spam
            </p>

            {/* Mensaje de reenvío */}
            {resendMessage && (
              <div className={`w-full p-3 rounded-sm text-sm text-center ${
                resendMessage.includes('Error')
                  ? 'bg-red-500/10 border border-red-500/30 text-red-400'
                  : 'bg-lime-300/10 border border-lime-300/30 text-lime-400'
              }`}>
                {resendMessage}
              </div>
            )}

            {/* Botón reenviar */}
            <button
              onClick={handleResend}
              disabled={isResending || cooldown > 0 || !email}
              className="w-full py-2.5 text-sm bg-zinc-700 text-zinc-300 rounded-full font-semibold hover:bg-zinc-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isResending ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Reenviando...
                </>
              ) : cooldown > 0 ? (
                `Reenviar en ${cooldown}s`
              ) : (
                'Reenviar email'
              )}
            </button>

            <Link
              to="/login"
              className="text-lime-300 font-semibold hover:text-lime-400 transition-colors"
            >
              Volver a iniciar sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}