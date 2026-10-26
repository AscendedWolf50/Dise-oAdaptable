import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { gsapButtonMotion } from '../../utils/gsapButtonMotion.js';
import ModalOverlay from '../../components/ui/ModalOverlay.jsx';
import { useAppNavigation, useDismissModal } from '../../utils/useAppNavigation.js';
import imgConfigMobile from '../../assets/ConfiDesktop.png';
import imgConfigDesktop from '../../assets/ConfiMobile.png';

export default function Configuracion() {
  const pageRef = useRef(null);
  
  const location = useLocation();
  const navigate = useAppNavigation();
  const dismiss = useDismissModal();

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

  console.log("Estado al montar Configuración:", location.state);

  const handleClose = () => {
    console.log("Botón X presionado. Estado actual:", location.state);
    
    if (location.state?.desdePausa) {
      console.log("Regresando a pausa...");
      navigate('/pausa');
    } else {
      console.log("Cerrando modal normal...");
      dismiss();
    }
  };

  return (
    <ModalOverlay title="CONFIGURACIÓN" onClose={handleClose}>
      <div ref={pageRef} className="flex flex-col gap-4 text-[#0D0D0D] md:gap-6 lg:grid lg:grid-cols-2 lg:items-center lg:gap-8">

        <div data-enter className="relative flex h-24 items-center justify-center overflow-hidden border-2 border-[#0D0D0D] bg-[#8BA3A7] lg:col-start-1 lg:row-span-4 lg:h-full lg:w-full">
          
          {/* Esquinas decorativas (Se añade z-10 para que queden sobre la imagen) */}
          <span className="absolute left-1 top-1 z-10 text-[#8BA3A7]">┌</span>
          <span className="absolute right-1 top-1 z-10 text-[#8BA3A7]">┐</span>
          <span className="absolute bottom-1 left-1 z-10 text-[#8BA3A7]">└</span>
          <span className="absolute bottom-1 right-1 z-10 text-[#8BA3A7]">┘</span>

          {/* Imagen Mobile/Tablet (Apaisada - Visible por defecto, oculta en desktop lg) */}
          <img 
            src={imgConfigDesktop} 
            alt="Configuración" 
            className="absolute inset-0 h-full w-full object-cover lg:hidden" 
          />

          {/* Imagen Desktop (Vertical - Oculta por defecto, visible en desktop lg) */}
          <img 
            src={imgConfigMobile} 
            alt="Configuración" 
            className="absolute inset-0 hidden h-full w-full object-cover lg:block" 
          />
          
        </div>

        {/* Divisor de AUDIO (Oculto en móvil/tablet, visible en escritorio) */}
<div data-enter className="hidden items-center gap-3 text-[10px] font-bold tracking-[0.25em] text-[#0D0D0D] lg:col-start-2 lg:row-start-1 lg:flex">
  <span className="flex-1 border-t-2 border-dashed border-[#0D0D0D]" />
  AUDIO
  <span className="flex-1 border-t-2 border-dashed border-[#0D0D0D]" />
</div>
        <label data-enter className="border-2 border-[#0D0D0D] p-3 shadow-[3px_3px_0px_0px_#0D0D0D] lg:col-start-2 lg:row-start-2">
          <span className="flex items-center justify-between text-xs font-black tracking-widest"><span>♫ VOLUMEN DE MÚSICA</span><output>{music}%</output></span>
          <input aria-label="Volumen de música" type="range" min="0" max="100" value={music} onChange={(event) => { setMusic(Number(event.target.value)); setSaved(false); }} className="mt-4 w-full accent-[#0D0D0D]" />
          <span className="flex justify-between text-[9px] font-bold text-[#8BA3A7]"><span>0</span><span>50</span><span>100</span></span>
        </label>

        <label data-enter className="border-2 border-[#0D0D0D] p-3 shadow-[3px_3px_0px_0px_#0D0D0D] lg:col-start-2 lg:row-start-3">
          <span className="flex items-center justify-between text-xs font-black tracking-widest"><span>✧ EFECTOS VISUALES</span><output>{effects}%</output></span>
          <input aria-label="Intensidad de efectos visuales" type="range" min="0" max="100" value={effects} onChange={(event) => { setEffects(Number(event.target.value)); setSaved(false); }} className="mt-4 w-full accent-[#0D0D0D]" />
          <span className="flex justify-between text-[9px] font-bold text-[#8BA3A7]"><span>0</span><span>50</span><span>100</span></span>
        </label>

        <button {...gsapButtonMotion} data-apply onClick={applySettings} className="button-primary py-3 text-lg font-black tracking-widest lg:col-start-2 lg:row-start-4">
          {saved ? 'APLICADO ✓' : 'APLICAR'}
        </button>
      </div>
    </ModalOverlay>
  );
}