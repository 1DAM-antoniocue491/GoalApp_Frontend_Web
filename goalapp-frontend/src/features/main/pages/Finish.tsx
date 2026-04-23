import React from 'react'
import Card from '../components/Finish/Card'
import CardPartidos from '../components/Finish/CardPartidos'

export default function Finish() {
  return (
    <div className="bg-black h-full w-full text-white"> 
        <h1 className="text-4xl font-bold text-white mb-2">Todos los resultados</h1> 
        <p className='text-gray-400 mb-8'>Resultados de los partidos finalizados esta semana</p>
        <div className="flex gap-4 flex-1 justify-end ml-11 mr-8">
              <Card number={12} texto={'Partidos'} color={'text-lime-600'} />
              <Card number={3.3} texto={'Goles por Partidos'} color={'text-blue-600'}/>
              <Card number={4} texto={'Empates'} />
        </div>
        <div className="flex gap-4 flex-1 ml-11 mr-8 py-3">
            <button className='bg-lime-400 rounded-3xl'>
                <span className='text-black text-xl p-1.5'>Todos</span>
            </button>
            <button className='bg-gray-800 rounded-3xl'>
                <span className='text-gray-700 text-xl p-1.5'>LaLiga</span>
            </button>
            <button className='bg-gray-800 rounded-3xl'>
                <span className='text-gray-700 text-xl p-1.5'>Premier League</span>
            </button>
            <button className='bg-gray-800 rounded-3xl'>
                <span className='text-gray-700 text-xl p-1.5'>Bundesliga</span>
            </button>
            <button className='bg-gray-800 rounded-3xl'>
                <span className='text-gray-700 text-xl p-1.5'>Seria A</span>
            </button>
            <button className='bg-gray-800 rounded-3xl'>
                <span className='text-gray-700 text-xl p-1.5'>Ligue 1</span>
            </button>
        </div>
        <div className="grid grid-cols-2 gap-6 w-full px-11 mt-6">
            <CardPartidos 
                Competicion={'Ligue 1'} fecha={'18 abr 2026'} resultado={'3-0'} equipo1={'PSG'} equipo2={'Lyon'}
                goles1={['Mbappé 12\'', 'Dembélé 45\'', 'Barcola 78\'']} goles2={[]} 
            />

            <CardPartidos 
                Competicion={'Bundesliga'} fecha={'18 abr 2026'} resultado={'2-2'} equipo1={'Bayern Munich'} equipo2={'Dortmund'}
                goles1={['Harry Kane 34\'', 'Musiala 60\'']} goles2={['Fullkrug 15\'', 'Reus 90+2\'']} 
            />

            <CardPartidos 
                Competicion={'Serie A'} fecha={'18 abr 2026'} resultado={'3-1'} equipo1={'AC Milan'} equipo2={'Inter'}
                goles1={['Leao 21\'', 'Giroud 44\'', 'Pulisic 82\'']} goles2={['Lautaro 55\'']} 
            />

            <CardPartidos 
                Competicion={'LaLiga'} fecha={'21 abr 2026'} resultado={'0-1'} equipo1={'Atlético de Madrid'} equipo2={'Valencia'}
                goles1={[]} goles2={['Hugo Duro 72\'']} 
            />

            <CardPartidos 
                Competicion={'Premier League'} 
                fecha={'18 abr 2026'} 
                resultado={'4-2'} 
                equipo1={'Liverpool'} 
                equipo2={'Man. United'}
                goles1={['Salah 10\'', 'Luis Díaz 32\'', 'Darwin Nuñez 65\'', 'Cody Gakpo 81\'']} 
                goles2={['B. Fernandes 45\' (P)', 'Marcus Rashford 70\'']} 
            />

            <CardPartidos 
                Competicion={'Serie A'} fecha={'19 abr 2026'} resultado={'2-1'} equipo1={'Juventus'} equipo2={'Roma'}
                goles1={['Vlahovic 38\'', 'Chiesa 70\'']} goles2={['Dybala 12\' (P)']} 
            />

            <CardPartidos 
                Competicion={'LaLiga'} fecha={'21 abr 2026'} resultado={'2-2'} equipo1={'Sevilla'} equipo2={'Betis'}
                goles1={['En-Nesyri 45\'', 'Ocampos 88\'']} goles2={['Isco 20\'', 'Ayoze 63\'']} 
            />

            <CardPartidos 
                Competicion={'Serie A'} fecha={'18 abr 2026'} resultado={'1-1'} equipo1={'Napoli'} equipo2={'Lazio'}
                goles1={['Osimhen 50\'']} goles2={['Immobile 85\'']} 
            />

            <CardPartidos 
                Competicion={'Premier League'} fecha={'18 abr 2026'} resultado={'2-0'} equipo1={'Chelsea'} equipo2={'Tottenham'}
                goles1={['Cole Palmer 18\'', 'Jackson 55\'']} goles2={[]} 
            />

            <CardPartidos 
                Competicion={'Ligue 1'} fecha={'18 abr 2026'} resultado={'3-2'} equipo1={'Marsella'} equipo2={'Nice'}
                goles1={['Aubameyang 5\'', 'Harit 42\'', 'Vitinha 90\'']} goles2={['Moffi 15\'', 'Laborde 60\'']} 
            />
        </div>
    </div>
  )
}
