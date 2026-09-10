import React from 'react';

export default function Inicio() {
  return (
    <div className="min-h-screen bg-[#e8e8e8] flex items-center justify-center p-4 font-sans text-black">
      
      {/* Contenedor Principal (Simulando la pantalla del móvil) */}
      <div className="bg-white w-full max-w-sm border-[3px] border-black rounded-[2rem] p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)] relative overflow-hidden flex flex-col gap-4">
        
        {/* Barra superior (Buscador falso) */}
        <div className="border-[2px] border-black rounded px-3 py-1 flex justify-between items-center mb-1">
          <span className="text-xs tracking-widest text-gray-400">WWW.</span>
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>

        {/* Caja de Ilustración */}
        <div className="border-[2px] border-black h-32 relative flex items-center justify-center mb-2">
          {/* Esquinas decorativas tipo retícula */}
          <div className="absolute top-1 left-1 w-2 h-2 border-t-2 border-l-2 border-gray-400"></div>
          <div className="absolute top-1 right-1 w-2 h-2 border-t-2 border-r-2 border-gray-400"></div>
          <div className="absolute bottom-1 left-1 w-2 h-2 border-b-2 border-l-2 border-gray-400"></div>
          <div className="absolute bottom-1 right-1 w-2 h-2 border-b-2 border-r-2 border-gray-400"></div>
          
          <p className="text-xs font-bold tracking-widest text-gray-400 uppercase">
            ILUSTRACIÓN
          </p>
        </div>

        {/* Título Voxel Drift (Bloque negro) */}
        <div className="bg-[#111] text-white border-[2px] border-black p-4 text-center font-black text-2xl tracking-widest uppercase mb-2">
          VOXEL DRIFT
        </div>

        {/* Botón Jugar */}
        <button 
          onClick={() => window.location.href = '#/niveles'}
          className="w-full bg-[#111] text-white border-[2px] border-black p-4 font-bold tracking-widest uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all active:shadow-none active:translate-x-[4px] active:translate-y-[4px] flex items-center justify-start gap-3"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
          JUGAR
        </button>

        {/* Botón Perfil */}
        <button 
          onClick={() => window.location.href = '#/perfil'}
          className="w-full bg-white text-black border-[2px] border-black p-4 font-bold tracking-widest uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all active:shadow-none active:translate-x-[4px] active:translate-y-[4px] flex items-center justify-start gap-3"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          PERFIL
        </button>

        {/* Botón Configuración */}
        <button 
          onClick={() => window.location.href = '#/configuracion'}
          className="w-full bg-white text-black border-[2px] border-black p-4 font-bold tracking-widest uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all active:shadow-none active:translate-x-[4px] active:translate-y-[4px] flex items-center justify-start gap-3"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          CONFIGURACIÓN
        </button>

        {/* Divisor "MÁS" */}
        <div className="flex items-center justify-center gap-3 my-2 opacity-50">
          <div className="h-[1px] flex-1 bg-transparent border-t-2 border-dashed border-black"></div>
          <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">MÁS</span>
          <div className="h-[1px] flex-1 bg-transparent border-t-2 border-dashed border-black"></div>
        </div>

        {/* Botones Inferiores (Créditos y Tutorial) */}
        <div className="grid grid-cols-2 gap-4">
          {/* Créditos */}
          <button className="bg-[#c4c4c4] border-[2px] border-black p-3 font-bold uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all active:shadow-none active:translate-x-[4px] active:translate-y-[4px] flex flex-col items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-[10px] tracking-widest">CRÉDITOS</span>
          </button>
          
          {/* Tutorial */}
          <button 
            onClick={() => window.location.href = '#/tutorial'}
            className="bg-[#c4c4c4] border-[2px] border-black p-3 font-bold uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all active:shadow-none active:translate-x-[4px] active:translate-y-[4px] flex flex-col items-center justify-center gap-2"
          >
            <span className="font-black text-lg leading-none">?</span>
            <span className="text-[10px] tracking-widest">TUTORIAL</span>
          </button>
        </div>

      </div>
    </div>
  );
}