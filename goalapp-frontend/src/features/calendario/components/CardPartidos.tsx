import React from 'react'

type Jornadas= {
    numero:number;
    encuentros:string;
}

export default function CardPartidos({numero,encuentros}:Jornadas) {
  return (
    <div className='flex gap-4 items-center mt-9 w-1/6 min-w-fit px-2 ml-11'>
      <p className='text-3xl font-bold text-white whitespace-nowrap'>
        Jornada {numero}
      </p>
      <p className='text-gray-400 text-lg whitespace-nowrap'>
        {encuentros}
      </p>
    </div>
  )
}
