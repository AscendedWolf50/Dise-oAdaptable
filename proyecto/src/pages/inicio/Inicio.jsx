import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';

const Inicio = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const elementsRef = useRef([]);

  useEffect(() => {
    // Fade in container
    gsap.fromTo(
      containerRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
    );

    // Stagger inner elements
    gsap.fromTo(
      elementsRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power3.out', delay: 0.2 }
    );
  }, []);

  const addToRefs = (el) => {
    if (el && !elementsRef.current.includes(el)) {
      elementsRef.current.push(el);
    }
  };

  const buttonPressStyle = "active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all duration-100";

  return (
    <div className="min-h-screen bg-[#1B384B] flex items-center justify-center p-4 font-sans">
      <div 
        ref={containerRef}
        className="bg-white w-full max-w-md mx-auto border-2 border-[#0D0D0D] p-6 shadow-[6px_6px_0px_0px_#0D0D0D] flex flex-col gap-4"
      >
        {/* Illustration Box */}
        <div ref={addToRefs} className="relative w-full h-40 bg-[#FF7800] border-2 border-[#0D0D0D] flex items-center justify-center overflow-hidden">
          <div className="absolute top-2 left-2 w-2 h-2 bg-[#0D0D0D]"></div>
          <div className="absolute top-2 right-2 w-2 h-2 bg-[#0D0D0D]"></div>
          <div className="absolute bottom-2 left-2 w-2 h-2 bg-[#0D0D0D]"></div>
          <div className="absolute bottom-2 right-2 w-2 h-2 bg-[#0D0D0D]"></div>
          <span className="font-black text-[#0D0D0D] text-xl tracking-widest">ILUSTRACIÓN</span>
        </div>

        {/* Big Banner */}
        <div ref={addToRefs} className="bg-[#0D0D0D] text-white p-4 text-center font-black text-2xl tracking-widest uppercase border-2 border-[#0D0D0D]">
          VOXEL DRIFT
        </div>

        {/* Main Buttons */}
        <button 
          ref={addToRefs}
          onClick={() => navigate('/niveles')}
          className={`flex items-center justify-center gap-2 bg-[#0D0D0D] text-white border-2 border-[#0D0D0D] p-4 font-bold tracking-widest uppercase shadow-[4px_4px_0px_0px_#0D0D0D] hover:bg-gray-800 ${buttonPressStyle}`}
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 4l12 6-12 6z" />
          </svg>
          JUGAR
        </button>

        <button 
          ref={addToRefs}
          onClick={() => navigate('/perfil')}
          className={`flex items-center justify-center gap-2 bg-white text-[#0D0D0D] border-2 border-[#0D0D0D] p-4 font-bold tracking-widest uppercase shadow-[4px_4px_0px_0px_#0D0D0D] hover:bg-gray-50 ${buttonPressStyle}`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          PERFIL
        </button>

        <button 
          ref={addToRefs}
          onClick={() => navigate('/configuracion')}
          className={`flex items-center justify-center gap-2 bg-white text-[#0D0D0D] border-2 border-[#0D0D0D] p-4 font-bold tracking-widest uppercase shadow-[4px_4px_0px_0px_#0D0D0D] hover:bg-gray-50 ${buttonPressStyle}`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          CONFIGURACIÓN
        </button>

        {/* Separator */}
        <div ref={addToRefs} className="flex items-center gap-4 my-2">
          <div className="flex-1 border-b-2 border-dashed border-[#0D0D0D]"></div>
          <span className="font-bold tracking-widest text-sm text-[#0D0D0D] uppercase">MÁS</span>
          <div className="flex-1 border-b-2 border-dashed border-[#0D0D0D]"></div>
        </div>

        {/* Bottom Grid */}
        <div ref={addToRefs} className="grid grid-cols-2 gap-4">
          <button 
            className={`flex flex-col items-center justify-center gap-2 bg-[#8BA3A7] text-[#0D0D0D] border-2 border-[#0D0D0D] p-3 font-bold tracking-widest text-sm uppercase shadow-[4px_4px_0px_0px_#0D0D0D] hover:bg-[#7a9296] ${buttonPressStyle}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            CRÉDITOS
          </button>

          <button 
            onClick={() => navigate('/tutorial')}
            className={`flex flex-col items-center justify-center gap-2 bg-[#8BA3A7] text-[#0D0D0D] border-2 border-[#0D0D0D] p-3 font-bold tracking-widest text-sm uppercase shadow-[4px_4px_0px_0px_#0D0D0D] hover:bg-[#7a9296] ${buttonPressStyle}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            TUTORIAL
          </button>
        </div>

      </div>
    </div>
  );
};

export default Inicio;