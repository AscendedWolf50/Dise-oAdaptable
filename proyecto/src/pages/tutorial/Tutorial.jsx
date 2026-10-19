import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { gsapButtonMotion } from '../../utils/gsapButtonMotion.js';
import ModalOverlay from '../../components/ui/ModalOverlay.jsx';
import { useDismissModal } from '../../utils/useAppNavigation.js';

const steps = [
  { 
    tag: 'PASO 01 - MOVIMIENTO', 
    title: 'MANEJA TU NAVE', 
    body: 'Usa los botones direccionales en pantalla o las teclas A y D de tu teclado para hacer avanzar y retroceder el coche. Domina la velocidad para mantener el control sobre la pista en todo momento.', 
    icon: '◀  ▶' 
  },
  { 
    tag: 'PASO 02 - IMPULSO', 
    title: 'ESQUIVA OBSTÁCULOS', 
    body: 'Toca el botón de salto en pantalla o presiona la Barra Espaciadora para saltar. Si estás en el aire y ves un punto de enganche, vuelve a presionar para sujetarte a él. Además, tu vehículo tiene la capacidad de adherirse y rodar sobre paredes verticales.', 
    icon: '◆  ◇  ◆' 
  },
  { 
    tag: 'PASO 03 - OBJETIVO', 
    title: 'LLEGA A LA META', 
    body: 'Llega a la meta para ganar y evita a toda costa que el coche golpee su techo contra el suelo o las superficies, o perderás. Puedes conseguir hasta 3 estrellas por nivel: la primera por completarlo, la segunda por superarlo en un tiempo récord y la tercera por alcanzar la puntuación requerida haciendo trucos en el aire.', 
    icon: '★  ★  ★' 
  },
];

export default function Tutorial() {
  const dismiss = useDismissModal();
  const pageRef = useRef(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [demoPlaying, setDemoPlaying] = useState(false);
  const step = steps[stepIndex];

  useEffect(() => {
    const context = gsap.context(() => gsap.from('[data-tutorial-enter]', { opacity: 0, y: 18, duration: 0.45, stagger: 0.08, ease: 'power2.out' }), pageRef);
    return () => context.revert();
  }, []);

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
        <div data-tutorial-enter className="mb-4 flex min-h-[160px] items-center justify-center border-2 border-[#0D0D0D] bg-[#8BA3A7] lg:col-start-1 lg:mb-0 lg:h-full lg:min-h-[300px]">
          <button 
            {...gsapButtonMotion} 
            onClick={() => setDemoPlaying((playing) => !playing)} 
            aria-label={demoPlaying ? 'Pausar demostración' : 'Reproducir demostración'} 
            className="button-secondary grid h-12 w-12 place-items-center p-0 text-xl"
          >
            {demoPlaying ? 'Ⅱ' : '▶'}
          </button>
        </div>

        {/* Panel Contenido e Instrucciones */}
        <div className="flex flex-col justify-between lg:col-start-2">
          <div data-step-content className="flex flex-col gap-2">
            <span data-tutorial-enter className="w-fit border-2 border-[#0D0D0D] bg-[#8BA3A7] px-2 py-1 text-[10px] font-black tracking-[0.18em] shadow-[2px_2px_0px_0px_#0D0D0D]">
              {step.tag}
            </span>
            <h2 data-tutorial-enter className="text-xl font-black tracking-wide md:text-2xl [text-shadow:2px_2px_0px_#8BA3A7]">
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
                <span key={item.tag} className={`h-2 flex-1 border border-[#0D0D0D] ${index === stepIndex ? 'bg-[#FF7800]' : 'bg-white'}`} />
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