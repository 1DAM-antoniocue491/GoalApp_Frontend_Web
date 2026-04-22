import React from 'react'

type Partidos = {
    equipo_a: string;
    equipo_b: string;
    fecha: string;
    esHoy: boolean;
    isadmin: boolean;
    isentrenador: boolean; // Corregido el typo de 'isentranador'
    isdelegado: boolean;
}

export default function CardJornadas({
    equipo_a, equipo_b, fecha, esHoy, 
    isadmin, isentrenador, isdelegado 
}: Partidos) {
    
    const borderCard = esHoy ? 'border-lime-500/20' : 'border-gray-800';

    // Estilo de la píldora de fecha
    const estiloHora = esHoy 
        ? 'text-cyan-400 bg-cyan-950/40 border-cyan-800/50' 
        : 'text-gray-500 bg-gray-900/50 border-gray-800';

    // Estilo del botón INICIAR
    const estiloBotonIniciar = esHoy
        ? 'bg-[#c5f52a] text-black shadow-[0_10px_20px_rgba(197,245,42,0.3)]' 
        : 'bg-[#4a5d23] text-black/60 opacity-70';
    return (
    /* 1. Quitamos max-w-4xl para que ocupe el 100% del contenedor padre */
        <div className="w-full px-1 flex justify-center"> 

        {/* LA TARJETA */}
        <div className={`
            bg-[#1a1a1e] 
            border ${borderCard} 
            rounded-2xl 
            p-6 
            w-[95%]      /* Ocupa el 90% del padre */
              /* Opcional: para que en pantallas gigantes no sea infinita */
            mt-6 
            font-sans 
            transition-all 
            duration-300
        `}>
            
            {/* CABECERA */}
            <div className="flex justify-between items-center w-full mb-6">
                <div className="flex items-center gap-3">
                    <span className="text-gray-500 text-lg">🕒</span>
                    <p className="text-white font-bold text-lg">{equipo_a} vs {equipo_b}</p>
                </div>
                <p className={`text-xs px-3 py-1.5 rounded-full border ${estiloHora}`}>
                    {fecha}
                </p>
            </div>
                
            {/* CONTENEDOR DE BOTONES: Ocupa todo el ancho en una sola línea */}
            <div className="flex gap-3 w-full items-center pr-1 pl-1 mr-2 ml-2">
                
                {/* Botones para Admin o Entrenador */}
                {(isadmin || isentrenador) && (
                    <>
                        <button className="flex-1 bg-lime-900/10 border border-lime-500/30 text-lime-400 py-4 rounded-xl flex items-center justify-center gap-2 text-sm hover:bg-lime-500/20 transition-all">
                            <span className="opacity-80">👥</span> 
                            <span>Convocatoria</span>
                        </button>
                        <button className="flex-1 bg-cyan-900/10 border border-cyan-500/30 text-cyan-400 py-4 rounded-xl flex items-center justify-center gap-2 text-sm hover:bg-cyan-500/20 transition-all">
                            <span className="opacity-80">📋</span> 
                            <span>Plantilla</span>
                        </button>
                    </>
                )}

                {/* Botón Iniciar para Admin o Delegado */}
                {(isadmin || isdelegado) && (
                    <button className={`
                        flex-1 /* Ahora es flex-1 siempre para igualar el tamaño */
                        ${estiloBotonIniciar} 
                        font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.01] transition-all whitespace-nowrap
                    `}>
                        <span className="text-xs">▶️</span> 
                        <span>INICIAR</span>
                    </button>
                )}
            </div>

            {/* Mensaje para Usuario Normal (No cambia) */}
            {(!isadmin && !isentrenador && !isdelegado) && (
                <div className="border border-dashed border-gray-800 p-4 rounded-xl text-center mt-2 ">
                    <p className="text-gray-600 text-xs">Información del encuentro disponible para el equipo técnico.</p>
                </div>
            )}
        </div>
        </div>
    )
}
