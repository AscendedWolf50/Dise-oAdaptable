import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { gsapButtonMotion } from '../../utils/gsapButtonMotion.js';
import ModalOverlay from '../../components/ui/ModalOverlay.jsx';
import { useDismissModal } from '../../utils/useAppNavigation.js';

const steps = [
  { tag: 'PASO 01 - MOVIMIENTO', title: 'MANEJA TU NAVE', body: 'Presiona los botones laterales para desplazarte por el espacio.', icon: '◀  ▶' },
  { tag: 'PASO 02 - IMPULSO', title: 'ESQUIVA OBSTÁCULOS', body: 'Observa la ruta y cambia de carril antes de chocar con los bloques.', icon: '◆  ◇  ◆' },
  { tag: 'PASO 03 - OBJETIVO', title: 'LLEGA A LA META', body: 'Completa el recorrido con rapidez para conseguir las tres estrellas.', icon: '★  ★  ★' },
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
    <ModalOverlay title="TUTORIAL">
      <section ref={pageRef} className="flex flex-col text-[#0D0D0D]">
        <div data-tutorial-enter className="mb-4 flex h-32 items-center justify-center border-2 border-[#0D0D0D]">
          <button {...gsapButtonMotion} onClick={() => setDemoPlaying((playing) => !playing)} aria-label={demoPlaying ? 'Pausar demostración' : 'Reproducir demostración'} className="button-secondary grid h-12 w-12 place-items-center p-0 text-xl">{demoPlaying ? 'Ⅱ' : '▶'}</button>
        </div>
        <div data-step-content className="flex flex-col">
          <span data-tutorial-enter className="w-fit border-2 border-[#0D0D0D] bg-[#8BA3A7] px-2 py-1 text-[10px] font-black tracking-[0.18em] shadow-[2px_2px_0px_0px_#0D0D0D]">{step.tag}</span>
          <h2 data-tutorial-enter className="mt-3 text-2xl font-black tracking-wide [text-shadow:2px_2px_0px_#8BA3A7]">{step.title}</h2>
          <p data-tutorial-enter className="mt-4 text-sm leading-6 text-[#8BA3A7]">{step.body}</p>
          <p data-tutorial-enter aria-hidden="true" className="mt-3 text-lg font-black tracking-widest">{step.icon}</p>
          <div className="mt-3 flex gap-2" aria-label={`Paso ${stepIndex + 1} de ${steps.length}`}>
            {steps.map((item, index) => <span key={item.tag} className={`h-2 flex-1 border border-[#0D0D0D] ${index === stepIndex ? 'bg-[#FF7800]' : 'bg-white'}`} />)}
          </div>
        </div>
        <div data-tutorial-enter className="mt-6 grid grid-cols-2 gap-3">
          <button {...gsapButtonMotion} onClick={() => changeStep(stepIndex - 1)} disabled={stepIndex === 0} className="button-secondary px-2 py-3 text-xs font-black tracking-widest disabled:opacity-50">◂ ANTERIOR</button>
          <button {...gsapButtonMotion} onClick={() => changeStep(stepIndex + 1)} disabled={stepIndex === steps.length - 1} className="button-primary px-2 py-3 text-xs font-black tracking-widest disabled:opacity-50">SIGUIENTE ▸</button>
        </div>
        <button {...gsapButtonMotion} data-tutorial-enter onClick={dismiss} className="button-secondary mt-3 py-3 text-xs font-black tracking-widest">X CERRAR TUTORIAL</button>
      </section>
    </ModalOverlay>
  );
}