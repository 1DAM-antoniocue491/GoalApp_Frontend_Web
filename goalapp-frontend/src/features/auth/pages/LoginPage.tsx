/**
 * Página de inicio de sesión
 * Permite a los usuarios autenticarse con email y contraseña
 */

import { Link, useNavigate } from 'react-router';
import { FaEye, FaEyeSlash, FaSpinner } from 'react-icons/fa';
import { useState, type FormEvent, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import foco from '../../../assets/foco-auth.jpeg';

export default function LoginPage() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Usar el contexto de autenticación
  const { login, isLoading, error, clearError, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/onboarding', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Validar formato de email
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validar formulario
  const isValidForm = (): boolean => {
    if (!email.trim()) {
      return false;
    }
    if (!isValidEmail(email)) {
      return false;
    }
    if (!password.trim()) {
      return false;
    }
    if (password.length < 6) {
      return false;
    }
    return true;
  };

  // Manejar submit
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();

    if (!isValidForm()) {
      return;
    }

    const success = await login(email, password);

    if (success) {
      navigate('/onboarding');
    }
    // Si falla, el error se maneja en el contexto
  };

  // Manejar cambio de email
  const handleEmailChange = (value: string) => {
    setEmail(value);
  };

  // Manejar cambio de contraseña
  const handlePasswordChange = (value: string) => {
    setPassword(value);
  };

  return (
    <div className="bg-zinc-950 min-h-screen flex justify-center md:justify-start items-center">
      {/* Imagen decorativa (solo en desktop) */}
      <div className="hidden md:block relative w-1/2">
        <img
          src={foco}
          alt="Logo del proyecto"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-zinc-950 from-30%" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-zinc-950 from-30%" />
      </div>

      {/* Formulario de login */}
      <div className="bg-zinc-950 flex justify-center items-center h-full w-full md:w-1/2">
        <div className="bg-zinc-800 p-3 sm:p-10 rounded-xl flex flex-col justify-center gap-9 sm:w-3/5">
          {/* Header */}
          <div>
            <Link to="/" className="text-lime-300 font-semibold mb-3 hover:text-lime-400 transition-colors">
              GoalApp
            </Link>
            <h2 className="text-white text-2xl font-semibold">Bienvenido</h2>
          </div>

          {/* Tabs de navegación */}
          <div className="flex bg-zinc-700 text-sm rounded-sm">
            <Link
              to="/login"
              className="w-1/2 text-center m-0.5 mr-0 rounded-sm text-white py-1 bg-zinc-800"
            >
              Iniciar Sesión
            </Link>
            <Link
              to="/register"
              className="w-1/2 text-center m-0.5 ml-0 rounded-sm text-white py-1 hover:bg-zinc-600 transition-colors"
            >
              Registrarse
            </Link>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit}>
            {/* Campo de email */}
            <div>
              <label className="text-sm text-zinc-400 font-semibold block mb-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                disabled={isLoading}
                className="focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 w-full bg-zinc-700 p-2 text-sm rounded-sm placeholder:text-zinc-500 text-zinc-100 disabled:opacity-50 transition-all"
              />
            </div>

            {/* Campo de contraseña */}
            <div className="mt-3">
              <label className="text-sm text-zinc-400 font-semibold block mb-1">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="**********"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  disabled={isLoading}
                  className="focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 w-full bg-zinc-700 p-2 pr-10 text-sm rounded-sm placeholder:text-zinc-500 text-zinc-100 disabled:opacity-50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <FaEyeSlash className="text-lg" />
                  ) : (
                    <FaEye className="text-lg" />
                  )}
                </button>
              </div>
            </div>

            {/* Mensaje de error */}
            {error && (
              <div className="mt-3 bg-red-500/10 border border-red-500/30 rounded-sm p-3">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}

            {/* Botón de submit */}
            <div className="mt-6">
              <button
                type="submit"
                disabled={isLoading || !isValidForm()}
                className="w-full py-2.5 text-sm bg-lime-300 text-zinc-900 rounded-full font-semibold hover:bg-lime-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  'Acceder'
                )}
              </button>
            </div>

            {/* Link de recuperación de contraseña */}
            <Link
              to="/forgot-password"
              className="block text-center text-[13px] text-blue-400 hover:text-blue-300 mt-3 transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}