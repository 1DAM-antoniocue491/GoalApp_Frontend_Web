/**
 * Barra de navegación principal
 * Muestra el nombre de la liga seleccionada y permite cambiar de liga
 */

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { NavLink } from 'react-router-dom';
import { FaChevronDown, FaSignOutAlt, FaUser, FaEnvelope, FaPhone, FaBirthdayCake, FaShieldAlt, FaEdit } from 'react-icons/fa';
import { IoIosNotificationsOutline, IoMdMenu } from 'react-icons/io';
import { TfiCup } from 'react-icons/tfi';
import { RxCross2 } from "react-icons/rx";
import { FiLoader, FiAlertCircle, FiX } from 'react-icons/fi';
import { useAuth } from '../features/auth/hooks/useAuth';
import { updateProfile } from '../features/auth/services/authApi';
import { getErrorMessage } from '../services/api';
import type { ApiError } from '../services/api';

interface NavProps {
  /** Nombre de la liga seleccionada para mostrar en el header */
  leagueName?: string;
  /** Rol del usuario en la liga actual */
  userRole?: string;
}

export default function Nav({ leagueName, userRole }: NavProps) {
  const navigate = useNavigate();
  const [notifications] = useState<boolean>(false);
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [showLeagueMenu, setShowLeagueMenu] = useState<boolean>(false);
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  const [showEditProfile, setShowEditProfile] = useState<boolean>(false);
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileForm, setProfileForm] = useState({ nombre: '', telefono: '', fecha_nacimiento: '' });
  const userMenuRef = useRef<HTMLDivElement>(null);

  const { user, logout, refreshUser } = useAuth();

  // Obtener iniciales del usuario
  const userInitials = user?.nombre
    ? user.nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'U';
  const userFirstName = user?.nombre?.split(' ')[0] || 'Usuario';
  const userDisplayName = user?.nombre?.split(' ').slice(0, 2).join(' ') || 'Usuario';

  const roleLabels: Record<string, string> = {
    admin: 'Administrador',
    entrenador: 'Entrenador',
    delegado: 'Delegado',
    jugador: 'Jugador',
    viewer: 'Espectador',
  };

  const getRoleLabel = (role: string) => roleLabels[role.toLowerCase()] || role;

  const formatDateSpanish = (dateStr: string) => {
    try {
      const date = new Date(dateStr + (dateStr.length === 10 ? 'T00:00:00' : ''));
      const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
      return `${date.getDate()} de ${meses[date.getMonth()]}, ${date.getFullYear()}`;
    } catch {
      return dateStr;
    }
  };

  const openEditProfile = () => {
    setProfileForm({
      nombre: user?.nombre || '',
      telefono: user?.telefono || '',
      fecha_nacimiento: user?.fecha_nacimiento || '',
    });
    setProfileError(null);
    setShowEditProfile(true);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSubmitting(true);
    setProfileError(null);

    try {
      if (user?.id_usuario) {
        await updateProfile(user.id_usuario, {
          nombre: profileForm.nombre,
          telefono: profileForm.telefono || null,
          fecha_nacimiento: profileForm.fecha_nacimiento || null,
        });
      }
      await refreshUser();
      setShowEditProfile(false);
    } catch (err) {
      setProfileError(getErrorMessage(err as ApiError));
    } finally {
      setProfileSubmitting(false);
    }
  };

  const navItems = [
    { label: 'Inicio', path: '/dashboard', implemented: true },
    { label: 'Calendario', path: '/calendar', implemented: true },
    { label: 'Equipos', path: '/teams', implemented: true },
    { label: 'Estadísticas', path: '/statistics', implemented: true },
    { label: 'Usuarios', path: '/users', implemented: true },
  ];

  const handleLeagueChange = () => {
    setShowLeagueMenu(false);
    navigate('/onboarding');
  };

  const handleLogout = async () => {
    setShowUserMenu(false);
    await logout();
    navigate('/login');
  };

  // Cerrar menú de usuario al hacer click fuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    }
    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showUserMenu]);

  return (
    <div className="bg-zinc-800 flex flex-col">
      <div className="bg-zinc-800 flex flex-row justify-between items-center h-12 px-2">
        {/* Logo y liga */}
        <div className="flex flex-row items-center justify-center gap-2 md:w-1/3">
          <div
            className="bg-lime-300 p-2 rounded-md cursor-pointer md:pointer-events-none"
            onClick={() => setShowMenu(!showMenu)}
          >
            <IoMdMenu className="md:hidden w-5 h-5" />
            <TfiCup className="hidden md:block w-5 h-5" />
          </div>

          {/* League Selector */}
          {leagueName ? (
            <button
              onClick={() => setShowLeagueMenu(!showLeagueMenu)}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-zinc-700 transition-colors"
            >
              <span className="text-white font-bold text-sm md:text-base truncate max-w-[120px] md:max-w-[200px]">
                {leagueName}
              </span>
              {userRole && (
                <span className="text-zinc-400 text-xs hidden sm:inline">
                  ({userRole})
                </span>
              )}
              <FaChevronDown className={`w-3 h-3 text-zinc-400 transition-transform ${showLeagueMenu ? 'rotate-180' : ''}`} />
            </button>
          ) : (
            <p className="text-white font-bold">GoalApp</p>
          )}

          {/* League Dropdown */}
          {showLeagueMenu && leagueName && (
            <div className="absolute top-12 left-2 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg z-50 min-w-[180px]">
              <div className="p-3 border-b border-zinc-700">
                <p className="text-zinc-400 text-xs">Liga actual</p>
                <p className="text-white font-semibold">{leagueName}</p>
                {userRole && (
                  <span className="text-xs text-lime-400">{userRole}</span>
                )}
              </div>
              <button
                onClick={handleLeagueChange}
                className="w-full text-left px-3 py-2 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors flex items-center gap-2"
              >
                <TfiCup className="w-4 h-4" />
                Cambiar de liga
              </button>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <div className="flex flex-row items-center justify-center gap-2 sm:w-1/3 hidden md:flex">
          {navItems.map((item) => (
            item.implemented ? (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `transition-colors ${isActive ? 'bg-lime-300/15 rounded-lg' : ''}`
                }
              >
                {({ isActive }) => (
                  <div className="rounded-lg px-3">
                    <p
                      className={`py-1 font-semibold text-sm ${
                        isActive
                          ? 'text-lime-300 border-b-2'
                          : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {item.label}
                    </p>
                  </div>
                )}
              </NavLink>
            ) : (
              <div key={item.path} className="rounded-lg px-3 cursor-not-allowed">
                <p className="py-1 font-semibold text-sm text-zinc-600">
                  {item.label}
                </p>
              </div>
            )
          ))}
        </div>

        {/* User Section */}
        <div className="flex flex-row justify-end md:pr-10 items-center gap-2 sm:w-1/3">
          {/* Notifications */}
          <button className="p-2 text-zinc-400 hover:text-white transition-colors relative">
            <IoIosNotificationsOutline className="w-5 h-5" />
            {notifications && (
              <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-lime-300 rounded-full border-2 border-zinc-800"></div>
            )}
          </button>

          {/* User Avatar */}
          <div ref={userMenuRef} className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex flex-row items-center bg-zinc-700 rounded-full p-0.5 gap-1 hover:bg-zinc-600 transition-colors"
            >
              <div className="bg-gradient-to-br from-lime-300 to-blue-300 rounded-full p-0.5 px-1.5">
                <p className="font-bold text-sm">{userInitials}</p>
              </div>
              <p className="text-sm text-zinc-400 font-semibold hidden md:block">
                {userFirstName}
              </p>
              <FaChevronDown className={`w-4 h-4 text-zinc-400 p-1 md:mr-2 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* User Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 top-12 bg-gradient-to-b from-zinc-800 to-70% to-zinc-950 border border-zinc-700 rounded-lg shadow-lg z-50 md:w-96">
                <div className="p-3">
                  <div className="flex flex-col items-center  gap-2 mb-2">
                    <div className='flex flex-row items-center justify-between gap-2 text-zinc-400 w-full'>
                      <div className='flex flex-row items-center gap-2 text-white text-sm'>
                        <FaUser className="w-3 h-3 text-white" />
                        <p>Mi perfil</p>
                      </div>
                      <div className='bg-zinc-700/50 p-1 rounded-md cursor-pointer hover:bg-zinc-600/50 transition-colors' onClick={() => setShowUserMenu(false)}>
                        <RxCross2 />
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-lime-300 to-blue-300 rounded-full py-5 px-5">
                      <p className="font-bold text-3xl">{userInitials}</p>
                    </div>
                    <div className='flex flex-col items-center gap-2'>
                      <p className="text-white font-semibold text-sm">{userDisplayName}</p>
                      {user?.rol_principal && (
                        <span className="text-xs text-lime-400">{getRoleLabel(user.rol_principal)}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 p-3 mx-5 space-y-2 text-sm border border-zinc-700 rounded-lg bg-zinc-950">
                  {user?.nombre && (
                    <div className="flex items-start gap-2 text-zinc-400">
                      <div className='flex flex-row text-sm bg-zinc-700/50 py-2 px-2 rounded-lg'>
                        <FaUser className="w-5 h-5 shrink-0" />
                      </div>
                      <div className='flex flex-col gap-1'>
                        <p className='text-sm'>Nombre</p>
                        <span className="truncate text-zinc-400">{user.nombre}</span>
                      </div>
                    </div>
                  )}
                  {user?.email && (
                    <div className="flex items-start gap-2 text-zinc-400">
                      <div className='flex flex-row text-sm bg-zinc-700/50 py-2 px-2 rounded-lg'>
                        <FaEnvelope className="w-5 h-5 shrink-0" />
                      </div>
                      <div className='flex flex-col gap-1'>
                        <p className='text-sm'>Email</p>
                        <span className="truncate text-zinc-400">{user.email}</span>
                      </div>
                    </div>
                  )}
                  {user?.telefono && (
                    <div className="flex items-start gap-2 text-zinc-400">
                      <div className='flex flex-row text-sm bg-zinc-700/50 py-2 px-2 rounded-lg'>
                        <FaPhone className="w-5 h-5 shrink-0" />
                      </div>
                      <div className='flex flex-col gap-1'>
                        <p className='text-sm'>Teléfono</p>
                        <span className="truncate text-zinc-400">{user.telefono}</span>
                      </div>
                    </div>
                  )}
                  {user?.fecha_nacimiento && (
                    <div className="flex items-start gap-2 text-zinc-400">
                      <div className='flex flex-row text-sm bg-zinc-700/50 py-2 px-2 rounded-lg'>
                        <FaBirthdayCake className="w-5 h-5 shrink-0" />
                      </div>
                      <div className='flex flex-col gap-1'>
                        <p className='text-sm'>Fecha de nacimiento</p>
                        <span className="truncate text-zinc-400">{formatDateSpanish(user.fecha_nacimiento)}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className='flex flex-col gap-2 m-5'>
                  <button
                    onClick={openEditProfile}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-lime-900 hover:bg-lime-800 rounded-lg border border-lime-700 transition-colors text-sm text-lime-300 font-semibold"
                  >
                    <FaEdit className="w-3.5 h-3.5" />
                    Editar perfil
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-900 hover:bg-red-800 rounded-lg border border-red-700 transition-colors text-sm text-red-300 font-semibold"
                  >
                    <FaSignOutAlt className="w-3.5 h-3.5" />
                    Cerrar sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className={`flex flex-col items-center gap-2 md:w-1/3 pb-2 px-5 ${showMenu ? '' : 'hidden'}`}>
        {navItems.map((item) => (
          item.implemented ? (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `transition-colors w-full ${isActive ? 'bg-lime-300/15 rounded-lg' : ''}`
              }
            >
              {({ isActive }) => (
                <div className="rounded-lg text-center px-3">
                  <p
                    className={`py-1 font-semibold text-sm ${
                      isActive
                        ? 'text-lime-300 border-b-2'
                        : 'text-zinc-500'
                    }`}
                  >
                    {item.label}
                  </p>
                </div>
              )}
            </NavLink>
          ) : (
            <div key={item.path} className="rounded-lg text-center px-3 w-full cursor-not-allowed">
              <p className="py-1 font-semibold text-sm text-zinc-600">
                {item.label}
              </p>
            </div>
          )
        ))}
      </div>

      {/* Modal Editar Perfil */}
      {showEditProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowEditProfile(false)} />
          <div className="relative bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-3xl mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white text-xl font-semibold">Editar Perfil</h2>
              <button
                onClick={() => setShowEditProfile(false)}
                disabled={profileSubmitting}
                className="p-2 text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {profileError && (
              <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-lg flex items-center gap-2">
                <FiAlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-red-400 text-sm">{profileError}</p>
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Nombre completo</label>
                <input
                  type="text"
                  value={profileForm.nombre}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, nombre: e.target.value }))}
                  disabled={profileSubmitting}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-lime-500 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-1">Teléfono</label>
                <input
                  type="tel"
                  value={profileForm.telefono}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, telefono: e.target.value }))}
                  placeholder="Ej: +34 612 345 678"
                  disabled={profileSubmitting}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-lime-500 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-1">Fecha de nacimiento</label>
                <input
                  type="date"
                  value={profileForm.fecha_nacimiento}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, fecha_nacimiento: e.target.value }))}
                  disabled={profileSubmitting}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-lime-500 disabled:opacity-50"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditProfile(false)}
                  disabled={profileSubmitting}
                  className="flex-1 py-2.5 text-white font-medium rounded-lg border border-zinc-700 hover:bg-zinc-800 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={profileSubmitting}
                  className="flex-1 py-2.5 bg-gradient-to-r from-lime-500 to-emerald-500 text-zinc-900 font-semibold rounded-lg hover:from-lime-400 hover:to-emerald-400 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {profileSubmitting ? (
                    <>
                      <FiLoader className="w-4 h-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    'Guardar Cambios'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}