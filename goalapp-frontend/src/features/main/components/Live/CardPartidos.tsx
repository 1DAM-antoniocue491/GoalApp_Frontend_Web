import React from 'react';

// Definimos todas las propiedades que necesita la tarjeta
interface CardPartidosProps {
  equipo1: string;
  equipo2: string;
  resultado: string;
  Competicion?: string; // Opcional si no se usa siempre
  fecha?: string;       // Opcional
  tiempo?: string;      // El "67'" o "81'" de tus fotos
  isadmin: boolean;
  isdelegado: boolean;
  isentrenador: boolean;
}

export default function CardPartidos({
  equipo1,
  equipo2,
  resultado,
  tiempo,
  isadmin,
  isdelegado,
  isentrenador
}: CardPartidosProps) {
  
  // Nivel de acceso para mostrar la botonera triple
  const tienePoderes = isadmin || isdelegado;

  return (
    <div className="bg-[#1a1a1e] border-2 border-red-900/30 rounded-2xl p-5 mb-4 shadow-xl">
      
      {/* Indicador EN VIVO (Parte superior derecha) */}
      <div className="flex justify-end items-center gap-2 mb-2">
        <span className="flex h-2 w-2 rounded-full bg-red-600 animate-pulse"></span>
        <span className="text-red-600 text-[10px] font-bold uppercase tracking-wider">En Vivo</span>
        <span className="bg-red-900/20 text-red-400 text-[10px] px-2 py-0.5 rounded-full border border-red-900/40 font-mono">
          {tiempo || "00'"}
        </span>
      </div>

      {/* Marcador Central */}
      <div className="flex items-center justify-between mb-8 px-4 gap-2">
        <span className="text-white font-medium flex-1 text-sm truncate">{equipo1}</span>
        
        <div className="bg-[#252529] px-6 py-2 rounded-xl border border-gray-800 mx-2 shadow-inner">
          <span className="text-white font-black text-xl tracking-[0.2em]">{resultado}</span>
        </div>
        
        <span className="text-white font-medium flex-1 text-right text-sm truncate">{equipo2}</span>
      </div>

      {/* --- BOTONERA CONDICIONAL --- */}
      <div className="flex gap-3 items-center justify-between mt-4">
        
        {!tienePoderes ? (
          /* VISTA USUARIO / ENTRENADOR */
          <button className="w-full bg-[#0a1e24] border border-[#144d5a] text-[#22d3ee] py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold hover:bg-[#0f2d35] transition-all active:scale-95">
            <span>🏆</span> Plantilla
          </button>
        ) : (
          /* VISTA ADMIN / DELEGADO */
          <>
            <button className="flex-1 bg-[#1a1e12] border border-[#3f4d1a] text-[#a3e635] py-3 rounded-xl flex items-center justify-center gap-1 text-[10px] font-bold hover:bg-[#252c1a] transition-all">
              <span>🏆</span> Registrar Evento
            </button>
            
            <button className="flex-1 bg-[#0a1e24] border border-[#144d5a] text-[#22d3ee] py-3 rounded-xl flex items-center justify-center gap-1 text-[10px] font-bold hover:bg-[#0f2d35] transition-all">
              <span>👥</span> Ver Plantilla
            </button>
            
            <button className="flex-1 bg-[#f59e0b] text-black py-3 rounded-xl flex items-center justify-center gap-1 text-[10px] font-black shadow-[0_4px_15px_rgba(245,158,11,0.3)] hover:brightness-110 active:scale-95 transition-all">
              <span>🔒</span> Finalizar
            </button>
          </>
        )}

      </div>
    </div>
  );
}
