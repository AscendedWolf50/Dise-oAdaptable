import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { gsapButtonMotion } from '../../utils/gsapButtonMotion.js';
import ModalOverlay from '../../components/ui/ModalOverlay.jsx';
import { useDismissModal } from '../../utils/useAppNavigation.js';
import movimientoVid from '../../assets/Videos/Movimiento.mp4';
import saltoVid from '../../assets/Videos/Salto.mp4';
import ganchoVid from '../../assets/Videos/Gancho.mp4';
import trucoVid from '../../assets/Videos/Trucos.mp4';

const steps = [
  { 
    tag: 'PASO 01 - MOVIMIENTO', 
    title: 'MANEJA TU NAVE', 
    body: 'Usa los botones direccionales en pantalla o las teclas A y D de tu teclado para hacer avanzar y retroceder el coche. Domina la velocidad para mantener el control sobre la pista en todo momento.', 
    icon: '◀  ▶',
    videos: [movimientoVid]
  },
  { 
    tag: 'PASO 02 - IMPULSO', 
    title: 'ESQUIVA OBSTÁCULOS', 
    body: 'Toca el botón de salto en pantalla o presiona la Barra Espaciadora para saltar. Si estás en el aire y ves un punto de enganche, vuelve a presionar para sujetarte a él. Además, tu vehículo tiene la capacidad de adherirse y rodar sobre paredes verticales.', 
    icon: '◆  ◇  ◆',
    videos: [saltoVid, ganchoVid] // Secuencia: Salto -> Gancho
  },
  { 
    tag: 'PASO 03 - OBJETIVO', 
    title: 'LLEGA A LA META', 
    body: 'Llega a la meta para ganar y evita a toda costa que el coche golpee su techo contra el suelo o las superficies, o perderás. Puedes conseguir hasta 3 estrellas por nivel: la primera por completarlo, la segunda por superarlo en un tiempo récord y la tercera por alcanzar la puntuación requerida haciendo trucos en el aire.', 
    icon: '★  ★  ★',
    videos: [trucoVid]
  },
];

export default function Tutorial() {
  const dismiss = useDismissModal();
  const pageRef = useRef(null);
  const videoRef = useRef(null);

  const [stepIndex, setStepIndex] = useState(0);
  const [subVideoIndex, setSubVideoIndex] = useState(0);
  
  // 1. Iniciamos en true para que reproduzca automáticamente
  const [demoPlaying, setDemoPlaying] = useState(true);

  const step = steps[stepIndex];
  const currentVideos = step.videos || [];
  const isMultiVideo = currentVideos.length > 1;
  const currentVideoSrc = currentVideos[subVideoIndex] || currentVideos[0];

  useEffect(() => {
    const context = gsap.context(() => gsap.from('[data-tutorial-enter]', { opacity: 0, y: 18, duration: 0.45, stagger: 0.08, ease: 'power2.out' }), pageRef);
    return () => context.revert();
  }, []);

  // Reinicia la secuencia al cambiar de paso
  useEffect(() => {
    setSubVideoIndex(0);
  }, [stepIndex]);

  // 2. Control de reproducción sincronizado
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (demoPlaying) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Si el navegador bloquea el play momentáneamente, no apagamos el estado
        });
      }
    } else {
      video.pause();
    }
  }, [demoPlaying, currentVideoSrc]);

  const handleVideoEnded = () => {
  if (isMultiVideo) {
    // Solo cambia el sub-índice si hay más de 1 video (Paso 2)
    setSubVideoIndex((prevIndex) => (prevIndex + 1) % currentVideos.length);
  }
};
  const changeStep = (nextIndex) => {
    const boundedIndex = Math.max(0, Math.min(steps.length - 1, nextIndex));
    if (boundedIndex === stepIndex) return;
    gsap.to('[data-step-content]', { opacity: 0, x: boundedIndex > stepIndex ? -14 : 14, duration: 0.16, onComplete: () => {
      setStepIndex(boundedIndex);
      gsap.fromTo('[data-step-content]', { opacity: 0, x: boundedIndex > stepIndex ? 14 : -14 }, { opacity: 1, x: 0, duration: 0.24, ease: 'power2.out' });
    } });
  };

  return (
    <ModalOverlay 
      title="TUTORIAL"
      panelClassName="[&>button.absolute]:hidden [&>button[aria-label]]:hidden"
      showCloseButton={false}
      showClose={false}
      hideCloseButton={true}
      hasCloseButton={false}
      onClose={null}
    >
      <section ref={pageRef} className="flex flex-col text-[#0D0D0D] lg:grid lg:grid-cols-2 lg:items-stretch lg:gap-6">
        {/* Panel de Demostración / Video */}
        <div data-tutorial-enter className="relative mb-4 flex min-h-[160px] items-center justify-center overflow-hidden border-2 border-[#0D0D0D] bg-[#D8E4E6] lg:col-start-1 lg:mb-0 lg:h-full lg:min-h-[300px]">
          <video
  key={currentVideoSrc}
  ref={videoRef}
  src={currentVideoSrc}
  autoPlay
  muted
  playsInline
  loop={!isMultiVideo} // Bucle nativo fluido para pasos 1 y 3
  onEnded={handleVideoEnded} // Transición para la secuencia del paso 2
  className="h-full w-full object-cover"
/>
          <button 
            {...gsapButtonMotion} 
            onClick={() => setDemoPlaying((playing) => !playing)} 
            aria-label={demoPlaying ? 'Pausar demostración' : 'Reproducir demostración'} 
            className="button-secondary absolute bottom-3 right-3 grid h-10 w-10 place-items-center p-0 text-lg shadow-[2px_2px_0px_0px_#0D0D0D]"
          >
            {demoPlaying ? 'Ⅱ' : '▶'}
          </button>
        </div>

        {/* Panel Contenido e Instrucciones */}
        <div className="flex flex-col justify-between lg:col-start-2">
          <div data-step-content className="flex flex-col gap-2">
            <span data-tutorial-enter className="w-fit border-2 border-[#0D0D0D] bg-[#D8E4E6] px-2 py-1 text-[10px] font-black tracking-[0.18em] shadow-[2px_2px_0px_0px_#0D0D0D]">
              {step.tag}
            </span>
            <h2 data-tutorial-enter className="text-xl font-black tracking-wide md:text-2xl [text-shadow:2px_2px_0px_#D8E4E6]">
              {step.title}
            </h2>
            <p data-tutorial-enter className="mt-1 text-xs font-semibold leading-relaxed text-[#0D0D0D] md:text-sm">
              {step.body}
            </p>
            <p data-tutorial-enter aria-hidden="true" className="mt-1 text-lg font-black tracking-widest text-[#0D0D0D]">
              {step.icon}
            </p>
            <div className="mt-2 flex gap-2" aria-label={`Paso ${stepIndex + 1} de ${steps.length}`}>
              {steps.map((item, index) => (
                <span key={item.tag} className={`h-2 flex-1 border border-[#0D0D0D] ${index === stepIndex ? 'bg-[#F4A340]' : 'bg-white'}`} />
              ))}
            </div>
          </div>

          {/* Botones de Navegación del Tutorial */}
          <div className="mt-4 flex flex-col gap-3">
            <div data-tutorial-enter className="grid grid-cols-2 gap-3">
              <button 
                {...gsapButtonMotion} 
                onClick={() => changeStep(stepIndex - 1)} 
                disabled={stepIndex === 0} 
                className="button-secondary px-2 py-3 text-xs font-black tracking-widest disabled:opacity-50"
              >
                ◂ ANTERIOR
              </button>
              <button 
                {...gsapButtonMotion} 
                onClick={() => changeStep(stepIndex + 1)} 
                disabled={stepIndex === steps.length - 1} 
                className="button-primary px-2 py-3 text-xs font-black tracking-widest disabled:opacity-50"
              >
                SIGUIENTE ▸
              </button>
            </div>
            <button 
              {...gsapButtonMotion} 
              onClick={dismiss} 
              className="button-secondary py-3 text-xs font-black tracking-widest"
            >
              X CERRAR TUTORIAL
            </button>
          </div>
        </div>
      </section>
    </ModalOverlay>
  );
}