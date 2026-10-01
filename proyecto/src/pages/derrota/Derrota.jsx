import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { gsapButtonMotion } from '../../utils/gsapButtonMotion.js';
import ModalOverlay from '../../components/ui/ModalOverlay.jsx';
import { useAppNavigation } from '../../utils/useAppNavigation.js';

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

  return (
    <ModalOverlay title="¡PERDISTE!">
      <section ref={pageRef} className="flex flex-col items-center gap-4 text-[#0D0D0D]">
        <div data-defeat-enter className="flex h-24 w-full items-center justify-center border-2 border-[#0D0D0D]">
          <span className="text-xs font-bold tracking-[0.3em] text-[#8BA3A7]">ILUSTRACIÓN</span>
        </div>
        <p data-defeat-enter className="text-center text-sm font-bold tracking-widest">FIN DEL RECORRIDO</p>
        <div className="flex gap-3 py-1" aria-label="0 de 3 estrellas">
          {[0, 1, 2].map((star, index) => <svg key={star} ref={(element) => { starsRef.current[index] = element; }} className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="#0D0D0D" strokeWidth="1.8"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8l-6.2 3.2L7 14.2l-5-4.9 6.9-1L12 2Z" /></svg>)}
        </div>
        <p data-defeat-enter className="text-xs font-bold tracking-[0.2em] text-[#8BA3A7]">0/3 ESTRELLAS</p>
        <div className="mt-2 grid w-full grid-cols-2 gap-3">
          <button {...gsapButtonMotion} data-defeat-enter onClick={() => navigate('/')} className="flex min-h-16 flex-col items-center justify-center gap-1 border-2 border-[#0D0D0D] bg-[#8BA3A7] text-xs font-black tracking-widest shadow-[4px_4px_0px_0px_#0D0D0D]">≡<span>MENÚ</span></button>
          <button {...gsapButtonMotion} data-defeat-enter onClick={() => navigate('/gameplay')} className="flex min-h-16 flex-col items-center justify-center gap-1 border-2 border-[#0D0D0D] bg-[#FF7800] text-xs font-black tracking-widest shadow-[4px_4px_0px_0px_#0D0D0D]">↻<span>REINTENTAR</span></button>
        </div>
      </section>
    </ModalOverlay>
  );
}