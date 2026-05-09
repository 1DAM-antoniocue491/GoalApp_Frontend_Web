import React from 'react'

type CardPartido = {
    number: number;
    texto: string;
    color?: string
};

export default function Card({number, texto, color}: CardPartido) {
  return (
    <div className="bg-[#1a1a1e] border border-gray-800 p-6 rounded-2xl w-full h-full flex flex-col justify-center">
      <p className={`text-4xl font-bold mb-1 ${color}`}>
        {number}
      </p>
      <p className="text-gray-500 text-sm font-medium whitespace-nowrap">
        {texto}
      </p>
    </div>
  )
}
