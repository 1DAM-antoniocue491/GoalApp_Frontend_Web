import { Link, useNavigate } from 'react-router';
import { FaEye, FaEyeSlash, FaSpinner } from 'react-icons/fa';
import { useState, type FormEvent, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import foco from '../../../assets/foco-auth.jpeg';

export default function RegisterPage() {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [firstPasswd, setFirstPasswd] = useState<string>('');
  const [firstPasswdType, setFirstPasswdType] = useState<boolean>(false);
  const [secondPasswd, setSecondPasswd] = useState<string>('');
  const [secondPasswdType, setSecondPasswdType] = useState<boolean>(false);
  const [checkbox, setCheckbox] = useState(false);

  const { register, isLoading, error, clearError, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/onboarding', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Validar formato de email (mismo patrón que LoginPage)
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validar formulario completo
  const isValidForm = (): boolean => {
    if (!name.trim() || name.trim().length < 2) return false;
    if (!email.trim() || !isValidEmail(email)) return false;
    if (firstPasswd.length < 6) return false;
    if (firstPasswd !== secondPasswd) return false;
    if (!checkbox) return false;
    return true;
  };

  // Manejar submit
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();

    if (!isValidForm()) return;

    const success = await register(name.trim(), email.trim(), firstPasswd);
    if (success) {
      navigate('/onboarding');
    }
  };

  // Limpiar error al cambiar cualquier campo
  const handleNameChange = (value: string) => {
    setName(value);
    if (error) clearError();
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (error) clearError();
  };

  const handleFirstPasswdChange = (value: string) => {
    setFirstPasswd(value);
    if (error) clearError();
  };

  const handleSecondPasswdChange = (value: string) => {
    setSecondPasswd(value);
    if (error) clearError();
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
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-zinc-950 from-30%"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-zinc-950 from-30%"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-transparent to-zinc-950 from-30%"></div>
      </div>

      {/* Formulario de registro */}
      <div className="bg-zinc-950 flex justify-center items-center h-full w-full md:w-1/2">
        <div className="bg-zinc-800 p-3 sm:p-10 rounded-lg flex flex-col justify-center gap-9 sm:w-3/5">
          <div>
            <Link to={'/login'} className="text-lime-300 font-semibold mb-3 hover:text-lime-400 transition-colors">GoalApp</Link>
            <h2 className="text-white text-2xl font-semibold">Bienvenido</h2>
          </div>

          <div className="flex bg-zinc-700 text-sm rounded-sm">
            <Link to={'/login'} className="w-1/2 text-center m-0.5 mr-0 rounded-sm text-white py-1 hover:bg-zinc-600 transition-colors">Iniciar Sesión</Link>
            <Link to={'/register'} className="w-1/2 text-center m-0.5 ml-0 rounded-sm text-white py-1 bg-zinc-800">Registrarse</Link>
          </div>

          <form onSubmit={handleSubmit}>
            <div>
              <label className="text-sm text-zinc-400 font-semibold block mb-1">Nombre</label>
              <input
                type="text"
                placeholder="Juan Pérez"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                disabled={isLoading}
                className="focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 w-full bg-zinc-700 p-2 text-sm rounded-sm placeholder:text-zinc-500 text-zinc-100 disabled:opacity-50 transition-all"
              />

              <label className="text-sm text-zinc-400 font-semibold block mb-1 mt-3">Correo Electrónico</label>
              <input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                disabled={isLoading}
                className="focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 w-full bg-zinc-700 p-2 text-sm rounded-sm placeholder:text-zinc-500 text-zinc-100 disabled:opacity-50 transition-all"
              />

              <label className="text-sm text-zinc-400 font-semibold block mb-1 mt-3">Contraseña</label>
              <div className="relative">
                <input
                  type={firstPasswdType ? 'text' : 'password'}
                  placeholder="**********"
                  value={firstPasswd}
                  onChange={(e) => handleFirstPasswdChange(e.target.value)}
                  disabled={isLoading}
                  className="focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 w-full bg-zinc-700 p-2 pr-10 text-sm rounded-sm placeholder:text-zinc-500 text-zinc-100 disabled:opacity-50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setFirstPasswdType(!firstPasswdType)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition-colors"
                  tabIndex={-1}
                >
                  {firstPasswdType ? <FaEyeSlash className="text-lg" /> : <FaEye className="text-lg" />}
                </button>
              </div>

              <label className="text-sm text-zinc-400 font-semibold block mb-1 mt-3">Repetir contraseña</label>
              <div className="relative">
                <input
                  type={secondPasswdType ? 'text' : 'password'}
                  placeholder="Confirma la contraseña"
                  value={secondPasswd}
                  onChange={(e) => handleSecondPasswdChange(e.target.value)}
                  disabled={isLoading}
                  className="focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 w-full bg-zinc-700 p-2 pr-10 text-sm rounded-sm placeholder:text-zinc-500 text-zinc-100 disabled:opacity-50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setSecondPasswdType(!secondPasswdType)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition-colors"
                  tabIndex={-1}
                >
                  {secondPasswdType ? <FaEyeSlash className="text-lg" /> : <FaEye className="text-lg" />}
                </button>
                </div>
              {secondPasswd && firstPasswd !== secondPasswd && (
                <p className="text-red-400 text-xs mt-1">Las contraseñas no coinciden</p>
              )}

              <div className="flex flex-row items-center mt-3 gap-2">
                <input
                  type="checkbox"
                  checked={checkbox}
                  onChange={(e) => setCheckbox(e.target.checked)}
                  disabled={isLoading}
                  className="accent-lime-300"
                />
                <p className="text-[12px] text-zinc-400">Acepto los términos y condiciones</p>
              </div>
            </div>

            {/* Mensaje de error */}
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
                    Registrando...
                  </>
                ) : (
                  'Registrarse'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}