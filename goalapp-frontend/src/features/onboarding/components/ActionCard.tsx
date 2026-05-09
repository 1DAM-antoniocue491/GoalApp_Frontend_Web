/**
 * Tarjeta de acción para el onboarding
 * Usada para "Crear nueva liga" y "Unirme a una liga"
 */

import type { ReactNode } from 'react';
import { FiPlus, FiLink } from 'react-icons/fi';

interface ActionCardProps {
  icon: 'plus' | 'link';
  title: string;
  description: string;
  buttonText: string;
  onClick: () => void;
}

const iconMap: Record<'plus' | 'link', ReactNode> = {
  plus: <FiPlus className="w-6 h-6" />,
  link: <FiLink className="w-6 h-6" />,
};

export function ActionCard({ icon, title, description, buttonText, onClick }: ActionCardProps) {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors">
      {/* Icono */}
      <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-lime-400 mb-4">
        {iconMap[icon]}
      </div>

      {/* Título y descripción */}
      <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
      <p className="text-zinc-400 text-sm mb-6">{description}</p>

      {/* Botón */}
      <button
        onClick={onClick}
        className="w-full bg-gradient-to-r from-lime-500 to-emerald-500 text-zinc-900 font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 hover:from-lime-400 hover:to-emerald-400 transition-all"
      >
        {buttonText}
        <span className="text-lg">→</span>
      </button>
    </div>
  );
}