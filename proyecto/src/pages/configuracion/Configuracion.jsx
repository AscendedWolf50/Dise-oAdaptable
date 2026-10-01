import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { gsapButtonMotion } from '../../utils/gsapButtonMotion.js';

export default function Configuracion() {
  const navigate = useNavigate();
  const pageRef = useRef(null);
  const [music, setMusic] = useState(70);
  const [effects, setEffects] = useState(85);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const context = gsap.context(() => {
      gsap.from('[data-enter]', { opacity: 0, y: 18, duration: 0.45, stagger: 0.08, ease: 'power2.out' });
    }, pageRef);
    return () => context.revert();
  }, []);

  const applySettings = () => {
    localStorage.setItem('voxel-drift-settings', JSON.stringify({ music, effects }));
    setSaved(true);
    gsap.fromTo('[data-apply]', { scale: 0.97 }, { scale: 1, duration: 0.25, ease: 'back.out(2)' });
  };

  return (
    <main className="min-h-screen bg-[#8BA3A7] px-4 py-4 text-[#0D0D0D]">
      <section ref={pageRef} className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-4 border-2 border-[#0D0D0D] bg-white p-5 shadow-[4px_4px_0px_0px_#0D0D0D]">
        <header data-enter className="flex items-center gap-3">
          <button {...gsapButtonMotion} onClick={() => navigate('/')} className="border-2 border-[#0D0D0D] px-3 py-2 text-xs font-black tracking-widest shadow-[3px_3px_0px_0px_#0D0D0D]">◂ VOLVER</button>
          <h1 className="text-lg font-black uppercase tracking-widest">CONFIGURACIÓN</h1>
        </header>

        <div data-enter className="relative flex h-24 items-center justify-center border-2 border-[#0D0D0D] bg-white">
          <span className="text-xs font-bold tracking-[0.3em] text-[#8BA3A7]">ILUSTRACIÓN</span>
          <span className="absolute left-1 top-1 text-[#8BA3A7]">┌</span><span className="absolute right-1 top-1 text-[#8BA3A7]">┐</span>
          <span className="absolute bottom-1 left-1 text-[#8BA3A7]">└</span><span className="absolute bottom-1 right-1 text-[#8BA3A7]">┘</span>
        </div>

        <div data-enter className="flex items-center gap-3 text-[10px] font-bold tracking-[0.25em] text-[#8BA3A7]">
          <span className="flex-1 border-t-2 border-dashed border-[#8BA3A7]" />AUDIO<span className="flex-1 border-t-2 border-dashed border-[#8BA3A7]" />
        </div>

        <label data-enter className="border-2 border-[#0D0D0D] p-3 shadow-[3px_3px_0px_0px_#0D0D0D]">
          <span className="flex items-center justify-between text-xs font-black tracking-widest"><span>♫ VOLUMEN DE MÚSICA</span><output>{music}%</output></span>
          <input aria-label="Volumen de música" type="range" min="0" max="100" value={music} onChange={(event) => { setMusic(Number(event.target.value)); setSaved(false); }} className="mt-4 w-full accent-[#0D0D0D]" />
          <span className="flex justify-between text-[9px] font-bold text-[#8BA3A7]"><span>0</span><span>50</span><span>100</span></span>
        </label>

        <label data-enter className="border-2 border-[#0D0D0D] p-3 shadow-[3px_3px_0px_0px_#0D0D0D]">
          <span className="flex items-center justify-between text-xs font-black tracking-widest"><span>✧ EFECTOS VISUALES</span><output>{effects}%</output></span>
          <input aria-label="Intensidad de efectos visuales" type="range" min="0" max="100" value={effects} onChange={(event) => { setEffects(Number(event.target.value)); setSaved(false); }} className="mt-4 w-full accent-[#0D0D0D]" />
          <span className="flex justify-between text-[9px] font-bold text-[#8BA3A7]"><span>0</span><span>50</span><span>100</span></span>
        </label>

        <button {...gsapButtonMotion} data-apply onClick={applySettings} className="mt-auto border-2 border-[#0D0D0D] bg-white py-3 text-lg font-black tracking-widest shadow-[4px_4px_0px_0px_#0D0D0D]">
          {saved ? 'APLICADO ✓' : 'APLICAR'}
        </button>
      </section>
    </main>
  );
}