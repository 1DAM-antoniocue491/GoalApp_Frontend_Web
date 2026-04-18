import React from 'react'

type AdminProps = {
    isadmin: boolean;
}

export default function CardAdmin({ isadmin }: AdminProps) {
    if (!isadmin) {
        return (
            <div className="bg-[#1a1a1e] border border-gray-800 p-6 rounded-2xl w-full max-w-4xl mt-6 ml-11">
                <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                    <p className="text-gray-400 text-sm">
                        Solo los administradores pueden modificar el calendario. 
                        Consulta las próximas fechas abajo.
                    </p>
                </div>
            </div>
        );
    }

    return (
            <div className="w-full px-11 mt-8">
            {/* ETIQUETA SUPERIOR OPCIONAL (Fuera de las tarjetas) */}
            <div className="flex justify-end mb-4">
                <span className="bg-red-900/30 text-red-400 text-xs font-bold px-3 py-1 rounded-full border border-red-800/50 uppercase tracking-wider">
                    Modo Editor
                </span>
            </div>

            <div className="grid grid-cols-2 gap-6 w-full">
                {/* TARJETA 1: CALENDARIO AUTOMÁTICO */}
                <div className="bg-[#1a1a1e] border border-gray-800 p-8 rounded-3xl flex flex-col justify-between h-full shadow-xl relative overflow-hidden">
                    <div>
                        <div className="flex justify-between items-start mb-6">
                            <div className="bg-gray-800/50 w-12 h-12 rounded-xl flex items-center justify-center">
                                <span className="text-[#c5f52a] text-2xl">📅</span>
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3">Crear calendario automático</h3>
                        <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                            Genera todos los encuentros de la liga de forma automática según los equipos, días y horarios configurados.
                        </p>
                    </div>
                    
                    <button className="w-full bg-gradient-to-r from-[#c5f52a] via-[#c5f52a] to-[#2a5a55] text-black font-bold py-4 rounded-2xl flex justify-between px-6 items-center group transition-all">
                        <span>Crear calendario</span>
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </button>
                </div>

                {/* TARJETA 2: NUEVO ENCUENTRO */}
                <div className="bg-[#1a1a1e] border border-gray-800 p-8 rounded-3xl flex flex-col justify-between h-full shadow-xl">
                    <div>
                        <div className="bg-gray-800/50 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                            <span className="text-[#c5f52a] text-2xl">+</span>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3">Nuevo encuentro</h3>
                        <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                            Crea y programa manualmente un partido individual, definiendo fecha, hora y equipos sin afectar al resto del calendario.
                        </p>
                    </div>
                    
                    <button className="w-full bg-gradient-to-r from-[#c5f52a] via-[#c5f52a] to-[#2a5a55] text-black font-bold py-4 rounded-2xl flex justify-between px-6 items-center group transition-all">
                        <span>Nuevo encuentro</span>
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </button>
                </div>
            </div>
        </div>
    )
}