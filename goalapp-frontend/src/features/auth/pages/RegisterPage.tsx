import { Link, useNavigate, useSearchParams } from 'react-router';
import { FaEye, FaEyeSlash, FaSpinner, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { useState, type FormEvent, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { register, validateInvitation, acceptInvitation, type InvitationValidationResponse } from '../services/authApi';
import foco from '../../../assets/foco-auth.jpeg';

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const invitationToken = searchParams.get('invitation_token');

  // Estados del formulario
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [firstPasswd, setFirstPasswd] = useState<string>('');
  const [firstPasswdType, setFirstPasswdType] = useState<boolean>(false);
  const [secondPasswd, setSecondPasswd] = useState<string>('');
  const [secondPasswdType, setSecondPasswdType] = useState<boolean>(false);
  const [checkbox, setCheckbox] = useState(false);

  // Estados de invitación
  const [isLoadingInvitation, setIsLoadingInvitation] = useState<boolean>(false);
  const [invitationData, setInvitationData] = useState<InvitationValidationResponse | null>(null);
  const [invitationError, setInvitationError] = useState<string | null>(null);

  const { register: registerUser, isLoading, error, clearError, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/onboarding', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Validar invitación al montar si hay token
  useEffect(() => {
    if (invitationToken) {
      setIsLoadingInvitation(true);
      setInvitationError(null);

      validateInvitation(invitationToken)
        .then((data) => {
          if (data.valido) {
            setInvitationData(data);
            // Pre-rellenar email (solo lectura)
            setEmail(data.email || '');
          } else {
            setInvitationError(data.motivo || 'Invitación inválida');
          }
        })
        .catch((err) => {
          setInvitationError(err.message || 'Error al validar la invitación');
        })
        .finally(() => {
          setIsLoadingInvitation(false);
        });
    }
  }, [invitationToken]);

  // Validar formato de email
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

    if (invitationToken && invitationData?.valido) {
      // Modo invitación: aceptar invitación y crear usuario
      try {
        const result = await acceptInvitation(invitationToken, name.trim(), email.trim(), firstPasswd);
        if (result.mensaje) {
          navigate('/login', {
            state: { message: 'Cuenta creada correctamente. Ahora puedes iniciar sesión.' }
          });
        }
      } catch (err) {
        // Error manejado por el hook de auth o mostrar mensaje
      }
    } else {
      // Modo normal: registro estándar
      const success = await registerUser(name.trim(), email.trim(), firstPasswd);
      if (success) {
        navigate('/onboarding');
      }
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

  // Mostrar estado de carga de invitación
  if (isLoadingInvitation) {
    return (
      <div className="bg-zinc-950 min-h-screen flex justify-center items-center">
        <div className="text-center">
          <FaSpinner className="w-8 h-8 text-lime-400 animate-spin mx-auto mb-4" />
          <p className="text-zinc-400">Validando invitación...</p>
        </div>
      </div>
    );
  }

  // Mostrar error de invitación inválida
  if (invitationToken && invitationError && !invitationData?.valido) {
    return (
      <div className="bg-zinc-950 min-h-screen flex justify-center items-center">
        <div className="bg-zinc-800 p-8 rounded-lg max-w-md w-full mx-4 text-center">
          <FaExclamationCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-white text-xl font-semibold mb-2">Invitación no válida</h2>
          <p className="text-zinc-400 mb-6">{invitationError}</p>
          <Link
            to="/register"
            className="inline-block px-6 py-2.5 bg-lime-300 text-zinc-900 rounded-full font-semibold hover:bg-lime-400 transition-colors"
          >
            Crear una cuenta nueva
          </Link>
        </div>
      </div>
    );
  }

  const isInvitationMode = !!invitationToken && invitationData?.valido;

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
            <h2 className="text-white text-2xl font-semibold">
              {isInvitationMode ? 'Únete a la liga' : 'Bienvenido'}
            </h2>
            {isInvitationMode && (
              <p className="text-zinc-400 text-sm mt-1">
                {invitationData?.liga_nombre}
              </p>
            )}
          </div>

          {!isInvitationMode && (
            <div className="flex bg-zinc-700 text-sm rounded-sm">
              <Link to={'/login'} className="w-1/2 text-center m-0.5 mr-0 rounded-sm text-white py-1 hover:bg-zinc-600 transition-colors">Iniciar Sesión</Link>
              <Link to={'/register'} className="w-1/2 text-center m-0.5 ml-0 rounded-sm text-white py-1 bg-zinc-800">Registrarse</Link>
            </div>
          )}

          {/* Info de invitación (solo modo invitación) */}
          {isInvitationMode && invitationData && (
            <div className="bg-zinc-900/50 border border-zinc-700 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <FaCheckCircle className="text-lime-400" />
                <span className="text-white font-semibold">Invitación válida</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-zinc-500 text-xs">Liga</p>
                  <p className="text-white">{invitationData.liga_nombre}</p>
                </div>
                {invitationData.equipo_nombre && (
                  <div>
                    <p className="text-zinc-500 text-xs">Equipo</p>
                    <p className="text-white">{invitationData.equipo_nombre}</p>
                  </div>
                )}
                <div>
                  <p className="text-zinc-500 text-xs">Rol</p>
                  <p className="text-white capitalize">{invitationData.rol}</p>
                </div>
                {invitationData.dorsal && (
                  <div>
                    <p className="text-zinc-500 text-xs">Dorsal</p>
                    <p className="text-white">{invitationData.dorsal}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div>
              <label className="text-sm text-zinc-400 font-semibold block mb-1">Nombre</label>
              <input
                type="text"
                placeholder="Juan Pérez"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                disabled={isLoading || isLoadingInvitation}
                className="focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 w-full bg-zinc-700 p-2 text-sm rounded-sm placeholder:text-zinc-500 text-zinc-100 disabled:opacity-50 transition-all"
              />

              <label className="text-sm text-zinc-400 font-semibold block mb-1 mt-3">
                Correo Electrónico
                {isInvitationMode && <span className="text-zinc-500 text-xs ml-2">(no editable)</span>}
              </label>
              <input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                disabled={isLoading || isLoadingInvitation || isInvitationMode}
                className="focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 w-full bg-zinc-700 p-2 text-sm rounded-sm placeholder:text-zinc-500 text-zinc-100 disabled:opacity-50 transition-all"
              />

              <label className="text-sm text-zinc-400 font-semibold block mb-1 mt-3">Contraseña</label>
              <div className="relative">
                <input
                  type={firstPasswdType ? 'text' : 'password'}
                  placeholder="**********"
                  value={firstPasswd}
                  onChange={(e) => handleFirstPasswdChange(e.target.value)}
                  disabled={isLoading || isLoadingInvitation}
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
                  disabled={isLoading || isLoadingInvitation}
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
                  disabled={isLoading || isLoadingInvitation}
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
                disabled={isLoading || !isValidForm() || isLoadingInvitation}
                className="w-full py-2.5 text-sm bg-lime-300 text-zinc-900 rounded-full font-semibold hover:bg-lime-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    {isInvitationMode ? 'Aceptando invitación...' : 'Registrando...'}
                  </>
                ) : (
                  isInvitationMode ? 'Aceptar invitación' : 'Registrarse'
                )}
              </button>
            </div>
          </form>

          {/* Link a login (solo modo normal) */}
          {!isInvitationMode && (
            <p className="text-center text-zinc-400 text-sm">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="text-lime-300 hover:text-lime-400 font-semibold">
                Inicia sesión
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
