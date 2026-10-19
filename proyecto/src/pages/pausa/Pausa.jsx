import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { gsapButtonMotion } from '../../utils/gsapButtonMotion.js';
import ModalOverlay from '../../components/ui/ModalOverlay.jsx';
import { useAppNavigation, useDismissModal } from '../../utils/useAppNavigation.js';

export default function Pausa() {
  const navigate = useAppNavigation();
  const dismiss = useDismissModal();
  const pageRef = useRef(null);

  useEffect(() => {
    const context = gsap.context(() => gsap.from('[data-pause-enter]', { opacity: 0, y: 16, duration: 0.42, stagger: 0.08, ease: 'power2.out' }), pageRef);
    return () => context.revert();
  }, []);

  const handleReanudar = () => {
    if (window.unityInstance) {
      window.unityInstance.SendMessage('WebBridge', 'ReanudarJuego');
    }
    dismiss();
  };

  const handleReiniciar = () => {
    if (window.unityInstance) {
      // Ordenamos a Unity reiniciar la escena actual
      window.unityInstance.SendMessage('WebBridge', 'ReiniciarNivelActual');
    }
    dismiss();
  };

  return (
    <ModalOverlay 
      title="Ⅱ PAUSADO" 
      panelClassName="!pt-14 [&>button.absolute]:hidden [&>button[aria-label]]:hidden"
      showCloseButton={false}
      showClose={false}
      hideCloseButton={true}
      hasCloseButton={false}
      onClose={null}
    >
      <div ref={pageRef} className="flex flex-col gap-3 text-[#0D0D0D] lg:grid lg:grid-cols-2 lg:items-center lg:gap-6">
        <div data-pause-enter className="flex items-center justify-between border-2 border-[#0D0D0D] bg-[#8BA3A7] px-4 py-3 lg:col-span-1 lg:row-span-2 lg:flex-col lg:items-stretch lg:gap-4 lg:p-6">
          <div><p className="text-xs font-bold tracking-widest">NIVEL 12</p><p aria-label="3 estrellas" className="text-lg leading-none">★★★</p></div>
          <div className="w-20"><p className="mb-1 text-right text-[9px] font-bold tracking-widest">PROGRESO</p><div className="h-3 border-2 border-[#0D0D0D] bg-white"><div className="h-full w-3/5 bg-[#FF7800]" /></div></div>
        </div>
          
        <button 
          {...gsapButtonMotion} 
          data-pause-enter 
          onClick={handleReanudar} 
          className="button-primary !bg-[#FF7800] !opacity-100 py-4 text-base font-black tracking-widest lg:col-start-2 lg:row-start-1 lg:py-6 lg:text-lg"
        >
          ▶ REANUDAR
        </button>
          
        <div data-pause-enter className="border-2 border-[#0D0D0D] p-2 lg:col-start-2 lg:row-start-2">
          <button {...gsapButtonMotion} onClick={handleReiniciar} className="button-secondary flex w-full items-center gap-3 px-2 py-3 text-left text-xs font-bold tracking-widest"><span>↻</span><span>REINICIAR NIVEL</span></button>
          <button {...gsapButtonMotion} onClick={() => navigate('/configuracion')} className="button-secondary flex w-full items-center gap-3 px-2 py-3 text-left text-xs font-bold tracking-widest"><span>⚙</span><span>CONFIGURACIÓN</span></button>
          <button {...gsapButtonMotion} onClick={() => navigate('/')} className="button-secondary flex w-full items-center gap-3 px-2 py-3 text-left text-xs font-bold tracking-widest"><span>≡</span><span>MENÚ PRINCIPAL</span></button>
        </div>
      </div>
    </ModalOverlay>
  );
}