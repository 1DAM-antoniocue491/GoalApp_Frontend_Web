import { useState } from 'react'

type Partidos = {
    Competicion:string,
    fecha:string,
    resultado:string,
    equipo1:string,
    equipo2:string
    goles1?: string[]; // Opcional: Lista de goleadores equipo 1
    goles2?: string[]; // Opcional: Lista de goleadores equipo 2
}

export default function CardPartidos({Competicion,fecha,resultado,equipo1,equipo2,goles1,goles2}:Partidos) {
 const [expandido, setExpandido] = useState(false);

  return (
    <div 
        onMouseEnter={() => setExpandido(true)} 
        onMouseLeave={() => setExpandido(false)}
        className={`bg-[#1a1a1e] border ${expandido ? 'border-gray-600' : 'border-gray-800'} rounded-2xl p-6 w-full cursor-pointer transition-all hover:bg-[#202024] shadow-lg`}
    >
      
      {/* CABECERA (Igual que antes) */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <div className="w-[2px] h-3 bg-lime-400"></div>
          <span className="text-gray-500 text-xs font-medium uppercase">{Competicion}</span>
        </div>
        <span className="text-gray-500 text-xs">📅 {fecha}</span>
      </div>

      {/* CUERPO PRINCIPAL */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 text-left">
          <h4 className="text-white font-semibold text-lg">{equipo1}</h4>
          
        </div>

        <div className="flex flex-col items-center min-w-[80px]">
          <div className="bg-[#252529] px-4 py-2 rounded-lg border border-gray-800 shadow-inner">
            <span className="text-white font-bold text-xl tracking-widest">{resultado}</span>
          </div>
          <span className="text-[10px] text-gray-600 font-bold mt-2 uppercase tracking-tighter">Final</span>
        </div>

        <div className="flex-1 text-right">
          <h4 className="text-white font-semibold text-lg">{equipo2}</h4>
          
        </div>
      </div>

      {/* SECCIÓN DETALLES (Solo se ve si expandido es true) */}
      {expandido && (
        <div className="mt-6 pt-6 border-t border-gray-800/50 animate-in fade-in slide-in-from-top-2 duration-300">
            
            {/* FILA DE ESTADO DINÁMICA */}
            <div className="relative flex justify-center items-center mb-6 h-6">
            
            {(() => {
                const [g1, g2] = resultado.split('-').map(num => parseInt(num.trim()));
                
                return (
                <>
                    {/* 1. CASO: GANA EQUIPO 1 */}
                    {g1 > g2 && (
                    <div className="w-full flex justify-between items-center px-2">
                        <div className="flex items-center gap-1.5 bg-lime-400/10 px-2 py-1 rounded-md border border-lime-400/20">
                        <span className="text-[10px] text-lime-400 font-black uppercase">Ganador</span>
                        <span className="text-[10px]">🏆</span>
                        </div>
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">Goles</span>
                        <div className="w-16"></div> {/* Espaciador para mantener el centro */}
                    </div>
                    )}

                    {/* 2. CASO: GANA EQUIPO 2 */}
                    {g2 > g1 && (
                    <div className="w-full flex justify-between items-center px-2">
                        <div className="w-16"></div> {/* Espaciador */}
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">Goles</span>
                        <div className="flex items-center gap-1.5 bg-lime-400/10 px-2 py-1 rounded-md border border-lime-400/20">
                        <span className="text-[10px] text-lime-400 font-black uppercase">Ganador</span>
                        <span className="text-[10px]">🏆</span>
                        </div>
                    </div>
                    )}

                    {/* 3. CASO: EMPATE (Todo al centro) */}
                    {g1 === g2 && (
                    <div className="flex flex-col items-center gap-1">
                         <span className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">Goles</span>
                        <span className="text-[11px] text-gray-400 font-black uppercase tracking-[0.2em]">Empate</span>
                        <div className="h-[1px] w-8 bg-gray-700"></div>
                        <span className="text-[9px] text-gray-600 font-bold uppercase">Reparto de puntos</span>
                    </div>
                    )}
                </>
                );
            })()}
            </div>

            {/* LISTA DE GOLEADORES (Igual que antes) */}
            <div className="flex justify-between text-[13px] px-2">
            <div className="flex-1 space-y-2">
                {goles1?.map((gol, i) => (
                <div key={i} className="flex items-center gap-2">
                    <span className="text-[10px] opacity-70">⚽</span>
                    <span className="text-gray-400">{gol}</span>
                </div>
                ))}
            </div>
            
            <div className="flex-1 text-right space-y-2">
                {goles2?.map((gol, i) => (
                <div key={i} className="flex items-center justify-end gap-2">
                    <span className="text-gray-400">{gol}</span>
                    <span className="text-[10px] opacity-70">⚽</span>
                </div>
                ))}
            </div>
            </div>

            {/* RESUMEN FINAL */}
            <div className="mt-6 flex justify-center border-t border-gray-800/40 pt-4">
            <span className="text-[9px] text-gray-600 uppercase tracking-[0.3em] font-bold hover:text-gray-400 transition-colors cursor-pointer">
                Resumen completo disponible
            </span>
            </div>
        </div>
        )}
    </div>
  );
}
