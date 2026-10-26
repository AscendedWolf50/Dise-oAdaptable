import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { gsapButtonMotion } from '../../utils/gsapButtonMotion.js';
import ModalOverlay from '../../components/ui/ModalOverlay.jsx';
import { useAppNavigation } from '../../utils/useAppNavigation.js';
import imagenDerrota from '../../assets/derrotaImageFinal.png';

export default function Derrota() {
  const navigate = useAppNavigation();
  const pageRef = useRef(null);
  const starsRef = useRef([]);

  useEffect(() => {
    const context = gsap.context(() => {
      gsap.from('[data-defeat-enter]', { opacity: 0, y: 16, duration: 0.45, stagger: 0.08, ease: 'power2.out' });
      gsap.from(starsRef.current, { scale: 0, rotation: -20, duration: 0.35, stagger: 0.1, delay: 0.35, ease: 'back.out(2)' });
    }, pageRef);
    return () => context.revert();
  }, []);

  const handleMenu = () => {
    if (window.unityInstance) {
      window.unityInstance.SendMessage('WebBridge', 'ReanudarJuego');
    }
    navigate('/');
  };

  const handleRestart = () => {
    if (window.unityInstance) {
      // Ordenamos a Unity reiniciar la escena actual
      window.unityInstance.SendMessage('WebBridge', 'ReiniciarNivelActual');
    }
    navigate('/gameplay');
  };

  return (
    <ModalOverlay 
      title="¡PERDISTE!"
      panelClassName="[&>button.absolute]:hidden [&>button[aria-label]]:hidden"
      showCloseButton={false}
      showClose={false}
      hideCloseButton={true}
      hasCloseButton={false}
      onClose={null}
    >
      <section ref={pageRef} className="flex flex-col items-center gap-4 text-[#0D0D0D] lg:grid lg:grid-cols-2 lg:items-center lg:gap-8">
        {/* Columna Izquierda: Ilustración */}
<div data-defeat-enter className="relative flex h-32 w-full items-center justify-center overflow-hidden border-2 border-[#0D0D0D] bg-[#0D0D0D] lg:col-start-1 lg:row-start-1 lg:h-40 xl:h-48">
  <img 
    src={imagenDerrota} 
    alt="Ilustración de derrota" 
    className="absolute inset-0 h-full w-full object-fill" 
  />
</div>
        
        {/* Banner Pérdida */}
        <p data-defeat-enter className="voxel-grid-surface w-full border-2 border-[#0D0D0D] bg-[#0D0D0D] p-3 text-center text-xl font-black tracking-widest text-white lg:col-start-1 lg:row-start-2">
          ¡PERDISTE!
        </p>

        {/* Columna Derecha: Estrellas y Conteo */}
        <div className="flex flex-col items-center justify-center gap-2 py-2 lg:col-start-2 lg:row-start-1">
          <div className="flex w-full items-center justify-center gap-3" aria-label="0 de 3 estrellas">
            {[0, 1, 2].map((star, index) => (
              <svg 
                key={star} 
                ref={(element) => { starsRef.current[index] = element; }} 
                className="h-14 w-14 sm:h-16 sm:w-16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="#0D0D0D" 
                strokeWidth="1.8"
              >
                <path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8l-6.2 3.2L7 14.2l-5-4.9 6.9-1L12 2Z" />
              </svg>
            ))}
          </div>
          <p data-defeat-enter className="text-center text-xs font-bold tracking-[0.2em] text-[#0D0D0D]">
            0/3 ESTRELLAS
          </p>
        </div>

        {/* Columna Derecha: Botones */}
        <div className="mt-2 grid w-full grid-cols-2 gap-3 lg:col-start-2 lg:row-start-2">
          <button {...gsapButtonMotion} onClick={handleMenu} className="button-secondary flex min-h-16 flex-col items-center justify-center gap-1 text-xs font-black tracking-widest">
            ≡<span>MENÚ</span>
          </button>
          <button {...gsapButtonMotion} onClick={handleRestart} className="button-primary flex min-h-16 flex-col items-center justify-center gap-1 text-xs font-black tracking-widest">
            ↻<span>REINTENTAR</span>
          </button>
        </div>
      </section>
    </ModalOverlay>
  );
}