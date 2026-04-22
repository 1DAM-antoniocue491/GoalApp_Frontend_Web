import React from 'react'
import Card from '../components/Card'
import CardPartidos from '../components/CardPartidos'
import CardJornadas from '../components/CardJornadas'
import CardAdmin from '../components/CardAdmin'

export default function Caledario() {
  const rawAdmin = true;
  const rawEntrenador = true;
  const rawDelegado = false; // Supongamos que aquí hay un error y ambos son true

  // --- LÓGICA DE PROTECCIÓN (Solo uno puede ser true) ---
  // Prioridad: 1. Admin, 2. Entrenador, 3. Delegado
  const isadmin = rawAdmin;
  const isentrenador = !isadmin && rawEntrenador;
  const isdelegado = !isadmin && !isentrenador && rawDelegado;
  return (
  <div className="bg-black h-full w-full text-white"> 
    <h1 className="text-4xl font-bold ml-11">Calendario</h1> 
    <p className='ml-11'>Todos los encuentros oficiales</p>
    <div className="flex gap-4 flex-1 justify-end ml-11 mr-8">
      <Card number={8} texto={'Total partidos'} />
      <Card number={3} texto={'Jornadas'} />
      <Card number={6} texto={'Proximos'} color={'text-blue-600'}/>
      <Card number={1} texto={'Mañana'} color={'text-purple-500'}/>
      <Card number={1} texto={'Hoy'} color={'text-lime-400'}/>
    </div>
    <CardAdmin isadmin={isadmin}/>
    <CardPartidos numero={1} encuentros={'3 encuentros'}/>
    <CardJornadas equipo_a={'Juventus'} equipo_b={'Inter'} fecha={'Hoy, 21:00'} esHoy={true} isadmin={isadmin} isentrenador={isentrenador} isdelegado={isdelegado}/>
    <CardJornadas equipo_a={'Dormund'} equipo_b={'Bayern'} fecha={'12 Abr, 21:00'} esHoy={false} isadmin={isadmin} isentrenador={isentrenador} isdelegado={isdelegado}/>
    <CardJornadas equipo_a={'Real Madrid'} equipo_b={'Sevilla'} fecha={'12 Abr, 21:00'} esHoy={false} isadmin={isadmin} isentrenador={isentrenador} isdelegado={isdelegado}/>
    <CardPartidos numero={2} encuentros={'3 encuentros'}/>
    <CardJornadas equipo_a={'Barcelona'} equipo_b={'Altetico de Madrid'} fecha={'18 Abr, 21:00'} esHoy={false} isadmin={isadmin} isentrenador={isentrenador} isdelegado={isdelegado}/>
    <CardJornadas equipo_a={'Arsenal (UK)'} equipo_b={'Man. City'} fecha={'18 Abr, 21:00'} esHoy={false} isadmin={isadmin} isentrenador={isentrenador} isdelegado={isdelegado}/>
    <CardJornadas equipo_a={'AC Milan'} equipo_b={'Roma'} fecha={'18 Abr, 21:00'} esHoy={false} isadmin={isadmin} isentrenador={isentrenador} isdelegado={isdelegado}/>
     <CardPartidos numero={3} encuentros={'2 encuentros'}/>
    <CardJornadas equipo_a={'Lyon'} equipo_b={'Marseille'} fecha={'18 Abr, 21:00'} esHoy={false} isadmin={isadmin} isentrenador={isentrenador} isdelegado={isdelegado}/>
    <CardJornadas equipo_a={'Parma'} equipo_b={'Napoles'} fecha={'18 Abr, 21:00'} esHoy={false} isadmin={isadmin} isentrenador={isentrenador} isdelegado={isdelegado}/>  
  </div>
)
}
