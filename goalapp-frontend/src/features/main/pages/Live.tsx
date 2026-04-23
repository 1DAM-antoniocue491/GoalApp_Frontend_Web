import React from 'react'
import Card from '../components/Finish/Card'
import CardPartidos from '../components/Live/CardPartidos';

export default function Live() {
  const rawAdmin = false;
  const rawEntrenador = false;
  const rawDelegado = true; 

  // --- LÓGICA DE PROTECCIÓN ---
  const isadmin = rawAdmin;
  const isentrenador = !isadmin && rawEntrenador;
  const isdelegado = !isadmin && !isentrenador && rawDelegado;

  return (
    <div className="bg-black min-h-screen w-full text-white p-8"> 
      <div className="mb-8 ml-11">
        {/* Contenedor del Título con el indicador dinámico */}
        <div className="flex items-center gap-3 mb-2">
          <span className="relative flex h-3 w-3">
            {/* Efecto de pulso exterior */}
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            {/* Punto sólido central */}
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
          </span>
          
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Todos los partidos en vivo
          </h1>
        </div>
        </div>
        <p className='text-gray-400 mb-8 ml-11'>Resultados en vivo este momento</p>
        
        {/* Estadísticas superiores */}
        <div className="flex gap-4 justify-end ml-11 mr-8">
            <Card number={6} texto={'Vivo'} color={'text-red-600'} />
            <Card number={14} texto={'Goles en totales'} color={'text-lime-600'} />
            <Card number={3.3} texto={'Goles por Partidos'} color={'text-blue-600'}/>
        </div>

        {/* Grid de Partidos en Vivo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full px-11 mt-10">
            
            <CardPartidos 
                equipo1={'Atletico Madrid'} equipo2={'Sevilla'} resultado={'1 - 0'} 
                isadmin={isadmin} isdelegado={isdelegado} isentrenador={isentrenador} tiempo="67'" 
            />

            <CardPartidos 
                equipo1={'Liverpool'} equipo2={'Chelsea'} resultado={'2 - 2'} 
                isadmin={isadmin} isdelegado={isdelegado} isentrenador={isentrenador} tiempo="81'" 
            />

            <CardPartidos 
                equipo1={'Real Madrid'} equipo2={'Getafe'} resultado={'3 - 1'} 
                isadmin={isadmin} isdelegado={isdelegado} isentrenador={isentrenador} tiempo="34'" 
            />

            <CardPartidos 
                equipo1={'Manchester City'} equipo2={'Arsenal'} resultado={'0 - 0'} 
                isadmin={isadmin} isdelegado={isdelegado} isentrenador={isentrenador} tiempo="12'" 
            />

            <CardPartidos 
                equipo1={'Bayern Munich'} equipo2={'Leipzig'} resultado={'1 - 2'} 
                isadmin={isadmin} isdelegado={isdelegado} isentrenador={isentrenador} tiempo="55'" 
            />

            <CardPartidos 
                equipo1={'Juventus'} equipo2={'Milan'} resultado={'2 - 0'} 
                isadmin={isadmin} isdelegado={isdelegado} isentrenador={isentrenador} tiempo="89'" 
            />

        </div>
    </div>
  )
}
