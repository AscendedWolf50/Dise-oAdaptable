import React from 'react';
import statsData from '../../data/stats.json';

export default function Login() {
  return (
    <div className="min-h-screen bg-[#e8e8e8] flex items-center justify-center p-4 font-sans text-black">
      
      {/* Contenedor Principal (Simulando la pantalla del móvil) */}
      <div className="bg-white w-full max-w-sm border-[3px] border-black rounded-[2rem] p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)] relative overflow-hidden">
        
        {/* Barra superior (Buscador falso) */}
        <div className="border-2 border-black rounded px-3 py-1 flex justify-between items-center mb-1">
          <span className="text-xs tracking-widest text-gray-400">WWW.</span>
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
        <div className="text-right text-[10px] tracking-widest text-gray-500 font-mono mb-8">
          V 1.0
        </div>

        {/* Título Principal */}
        <h1 className="text-5xl font-black text-center uppercase tracking-tighter leading-none mb-6">
          VOXEL<br />DRIFT
        </h1>

        {/* Separador decorativo con el rombo */}
        <div className="flex items-center justify-center mb-8 opacity-50">
          <div className="h-[1px] w-1/4 bg-black"></div>
          <div className="w-2 h-2 border border-black rotate-45 mx-3"></div>
          <div className="h-[1px] w-1/4 bg-black"></div>
        </div>

        {/* Caja de mensaje */}
        <div className="border-2 border-black p-4 mb-6 relative">
          {/* Esquinas decorativas tipo retícula */}
          <div className="absolute top-1 left-1 w-2 h-2 border-t-2 border-l-2 border-gray-400"></div>
          <div className="absolute top-1 right-1 w-2 h-2 border-t-2 border-r-2 border-gray-400"></div>
          <div className="absolute bottom-1 left-1 w-2 h-2 border-b-2 border-l-2 border-gray-400"></div>
          <div className="absolute bottom-1 right-1 w-2 h-2 border-b-2 border-r-2 border-gray-400"></div>
          
          <p className="text-sm font-bold tracking-widest text-gray-600 uppercase">
            Prepárate para<br />la aventura...
          </p>
        </div>

        {/* Input de Usuario */}
        <input 
          type="text" 
          placeholder="ingresa tu usuario..."
          className="w-full border-2 border-black p-3 mb-6 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#aa3bff]"
        />

        {/* Botón Ingresar */}
        <button 
          onClick={() => window.location.href = '#/niveles'}
          className="w-full bg-[#c4c4c4] border-2 border-black p-4 font-bold tracking-widest uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all active:shadow-none active:translate-x-[4px] active:translate-y-[4px] mb-12"
        >
          Ingresar
        </button>

        {/* Grid de Estadísticas (Cargadas desde JSON) */}
        <div className="grid grid-cols-3 gap-2">
          {statsData.map((stat) => (
            <div key={stat.id} className="border-2 border-black p-2 flex flex-col justify-center">
              <span className="font-black text-sm">{stat.valor}</span>
              <span className="text-[9px] font-bold text-gray-500 uppercase leading-tight mt-1">
                {stat.etiqueta}
              </span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}