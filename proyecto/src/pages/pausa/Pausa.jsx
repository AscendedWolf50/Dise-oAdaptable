import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { gsapButtonMotion } from '../../utils/gsapButtonMotion.js';

export default function Pausa() {
  const navigate = useNavigate();
  const pageRef = useRef(null);

  useEffect(() => {
    const context = gsap.context(() => gsap.from('[data-pause-enter]', { opacity: 0, y: 16, duration: 0.42, stagger: 0.08, ease: 'power2.out' }), pageRef);
    return () => context.revert();
  }, []);

  return (
    <main className="min-h-screen bg-[#8BA3A7] px-4 py-4 text-[#0D0D0D]">
      <section ref={pageRef} className="mx-auto min-h-screen w-full max-w-md border-2 border-[#0D0D0D] bg-white shadow-[4px_4px_0px_0px_#0D0D0D]">
        <h1 data-pause-enter className="bg-[#0D0D0D] px-5 py-4 text-2xl font-black tracking-widest text-white">Ⅱ PAUSADO</h1>
        <div data-pause-enter className="flex items-center justify-between bg-[#8BA3A7] px-4 py-3">
          <div><p className="text-xs font-bold tracking-widest">NIVEL 12</p><p aria-label="3 estrellas" className="text-lg leading-none">★★★</p></div>
          <div className="w-20"><p className="mb-1 text-right text-[9px] font-bold tracking-widest">PROGRESO</p><div className="h-3 border-2 border-[#0D0D0D] bg-white"><div className="h-full w-3/5 bg-[#FF7800]" /></div></div>
        </div>
        <div className="flex flex-col gap-3 p-5">
          <button {...gsapButtonMotion} data-pause-enter onClick={() => navigate('/gameplay')} className="border-2 border-[#0D0D0D] py-4 text-base font-black tracking-widest shadow-[4px_4px_0px_0px_#0D0D0D]">▶ REANUDAR</button>
          <div data-pause-enter className="border-2 border-[#0D0D0D] p-2">
            <button {...gsapButtonMotion} onClick={() => navigate('/gameplay')} className="flex w-full items-center gap-3 px-2 py-3 text-left text-xs font-bold tracking-widest"><span>↻</span><span>REINICIAR NIVEL</span></button>
            <button {...gsapButtonMotion} onClick={() => navigate('/configuracion')} className="flex w-full items-center gap-3 px-2 py-3 text-left text-xs font-bold tracking-widest"><span>⚙</span><span>CONFIGURACIÓN</span></button>
            <button {...gsapButtonMotion} onClick={() => navigate('/')} className="flex w-full items-center gap-3 px-2 py-3 text-left text-xs font-bold tracking-widest"><span>≡</span><span>MENÚ PRINCIPAL</span></button>
          </div>
        </div>
      </section>
    </main>
  );
}