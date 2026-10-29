import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { gsapButtonMotion } from '../../utils/gsapButtonMotion.js';
import ModalOverlay from '../../components/ui/ModalOverlay.jsx';
import { useAppNavigation } from '../../utils/useAppNavigation.js';
import imagenVictoria from '../../assets/victoriaImagenFinal.png';

const Victoria = () => {
  const containerRef = useRef(null);
  const starsRef = useRef([]);
  const buttonsRef = useRef([]);

  const navigate = useAppNavigation();
  const location = useLocation();

  // Extraemos las estrellas del estado (por defecto 1 si no hay dato)
  const estrellasObtenidas = location.state?.estrellasTotales || 1;

  useEffect(() => {
    // 1. Aseguramos que el juego se pause cuando aparece la pantalla de victoria
    if (window.unityInstance) {
      window.unityInstance.SendMessage('WebBridgeManager', 'PausarJuego');
    }

    // 2. Animaciones de entrada GSAP
    const context = gsap.context(() => {
      const timeline = gsap.timeline();
      timeline
        .fromTo(
          containerRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
        )
        .fromTo(
          starsRef.current,
          { scale: 0, rotation: -45, opacity: 0 },
          { scale: 1, rotation: 0, opacity: 1, duration: 0.4, stagger: 0.2, ease: 'back.out(2)' },
          '-=0.2'
        )
        .fromTo(
          buttonsRef.current,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.4, stagger: 0.1, ease: 'power2.out' },
          '-=0.1'
        );
    });

    return () => context.revert();
  }, []);

  // Handlers para la interacción con Unity y navegación
  const handleMenu = () => {
    if (window.unityInstance) {
      window.unityInstance.SendMessage('WebBridgeManager', 'PausarJuego');
    }
    navigate('/');
  };

  const handleRestart = () => {
    if (window.unityInstance) {
      window.unityInstance.SendMessage('WebBridgeManager', 'ReiniciarNivelActual');
      window.unityInstance.SendMessage('WebBridgeManager', 'ReanudarJuego');
    }
    navigate('/gameplay');
  };

  const handleNext = () => {
    if (window.unityInstance) {
      window.unityInstance.SendMessage('WebBridgeManager', 'PausarJuego');
    }
    navigate('/niveles');
  };

  return (
    <ModalOverlay 
      title=""
      panelClassName="!pt-6 [&>*:not(:last-child)]:hidden"
      showCloseButton={false}
      showClose={false}
      hideCloseButton={true}
      hasCloseButton={false}
      onClose={null}
    >
      <div
        ref={containerRef}
        className="flex flex-col items-center gap-4 font-sans md:gap-5 lg:grid lg:grid-cols-2 lg:items-center lg:gap-6"
      >
        {/* Ilustración / Imagen de Victoria */}
        <div className="relative flex h-32 w-full items-center justify-center overflow-hidden border-2 border-[#0D0D0D] bg-[#0D0D0D] lg:col-start-1 lg:row-start-1 lg:h-40 xl:h-48">
          <div className="absolute top-0 left-0 z-10 h-2 w-2 bg-[#0D0D0D]"></div>
          <div className="absolute top-0 right-0 z-10 h-2 w-2 bg-[#0D0D0D]"></div>
          <div className="absolute bottom-0 left-0 z-10 h-2 w-2 bg-[#0D0D0D]"></div>
          <div className="absolute bottom-0 right-0 z-10 h-2 w-2 bg-[#0D0D0D]"></div>
          
          <img 
            src={imagenVictoria} 
            alt="Ilustración de victoria" 
            className="absolute inset-0 h-full w-full object-fill" 
          />
        </div>

        {/* Banner de Victoria */}
        <div className="voxel-grid-surface w-full border-2 border-[#0D0D0D] bg-[#0D0D0D] p-4 text-center text-3xl font-black uppercase tracking-widest text-white lg:col-start-1 lg:row-start-2">
          ¡VICTORIA!
        </div>

        {/* Sección de Estrellas Dinámicas */}
        <div className="flex flex-col items-center gap-4 py-2 lg:col-start-2 lg:row-start-1">
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                ref={(el) => {
                  starsRef.current[i] = el;
                }}
                className="text-5xl"
              >
                {i < estrellasObtenidas ? (
                  <svg
                    className="h-12 w-12 text-[#963C00]"
                    fill="currentColor"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="square"
                      strokeLinejoin="miter"
                      strokeWidth="1"
                      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-12 w-12 text-[#0D0D0D]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="square"
                      strokeLinejoin="miter"
                      strokeWidth="2"
                      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                    />
                  </svg>
                )}
              </div>
            ))}
          </div>
          <div className="text-lg font-bold tracking-widest text-[#0D0D0D]">
            {estrellasObtenidas}/3 ESTRELLAS
          </div>
        </div>

        {/* Botones */}
        <div className="mt-2 grid w-full grid-cols-1 gap-3 sm:grid-cols-3 lg:col-start-2 lg:row-start-2">
          <button
            {...gsapButtonMotion}
            ref={(el) => {
              buttonsRef.current[0] = el;
            }}
            onClick={handleMenu}
            className="button-secondary flex flex-col items-center justify-center gap-1 p-3 font-bold"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span className="text-[10px] tracking-wider">MENÚ</span>
          </button>

          <button
            {...gsapButtonMotion}
            ref={(el) => {
              buttonsRef.current[1] = el;
            }}
            onClick={handleRestart}
            className="button-secondary flex flex-col items-center justify-center gap-1 p-3 font-bold"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="text-[10px] tracking-wider">REINICIAR</span>
          </button>

          <button
            {...gsapButtonMotion}
            ref={(el) => {
              buttonsRef.current[2] = el;
            }}
            onClick={handleNext}
            className="button-primary flex flex-col items-center justify-center gap-1 p-3 font-bold"
          >
            <svg className="h-6 w-6" fill="currentColor" stroke="none" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            <span className="text-[10px] tracking-wider">SIGUIENTE</span>
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
};

export default Victoria;
