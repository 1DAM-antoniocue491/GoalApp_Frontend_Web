/**
 * Barra de navegación principal
 * Muestra el nombre de la liga seleccionada y permite cambiar de liga
 */

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { NavLink } from 'react-router-dom';
import { FaChevronDown } from 'react-icons/fa';
import { IoIosNotificationsOutline, IoMdMenu } from 'react-icons/io';
import { TfiCup } from 'react-icons/tfi';
import { useAuth } from '../features/auth/hooks/useAuth';

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

  const { user } = useAuth();

  // Obtener iniciales del usuario
  const userInitials = user?.nombre
    ? user.nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'U';
  const userFirstName = user?.nombre?.split(' ')[0] || 'Usuario';

  const navItems = [
    { label: 'Inicio', path: '/dashboard', implemented: true },
    { label: 'Calendario', path: '/calendar', implemented: false },
    { label: 'Equipos', path: '/teams', implemented: true },
    { label: 'Estadísticas', path: '/statistics', implemented: true },
    { label: 'Usuarios', path: '/users', implemented: false },
  ];

  const handleLeagueChange = () => {
    setShowLeagueMenu(false);
    navigate('/onboarding');
  };

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
          <div className="flex flex-row items-center justify-between bg-zinc-700 rounded-full p-0.5 gap-1">
            <div className="bg-gradient-to-br from-lime-300 to-blue-300 rounded-full p-0.5 px-1.5">
              <p className="font-bold text-sm">{userInitials}</p>
            </div>
            <p className="text-sm text-zinc-400 font-semibold hidden md:block">
              {userFirstName}
            </p>
            <FaChevronDown className="w-4 h-4 text-zinc-400 p-1 md:mr-2" />
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
    </div>
  );
}