import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useDismissModal } from '../../utils/useAppNavigation.js';
import { gsapButtonMotion } from '../../utils/gsapButtonMotion.js';

export default function ModalOverlay({ title, children, panelClassName = '' }) {
  const backdropRef = useRef(null);
  const panelRef = useRef(null);
  const closeButtonRef = useRef(null);
  const openerRef = useRef(null);
  const dismissRef = useRef(null);
  const dismiss = useDismissModal();

  useEffect(() => {
    dismissRef.current = dismiss;
  }, [dismiss]);

  useEffect(() => {
    openerRef.current = document.activeElement;
    closeButtonRef.current?.focus();

    const context = gsap.context(() => {
      gsap.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: 'power1.out' });
      gsap.fromTo(panelRef.current, { scale: 0.85, y: 24, opacity: 0 }, { scale: 1, y: 0, opacity: 1, duration: 0.35, ease: 'back.out(1.5)' });
    });

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') dismissRef.current();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      context.revert();
      if (openerRef.current?.isConnected) openerRef.current.focus();
    };
  }, []);

  return (
    <div
      ref={backdropRef}
      className="absolute inset-0 z-50 flex items-center justify-center bg-[#0D0D0D]/70 p-4 backdrop-blur-sm"
      onMouseDown={(event) => { if (event.target === event.currentTarget) dismissRef.current(); }}
    >
      <section
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative max-h-full w-full max-w-[360px] overflow-y-auto border-2 border-[#0D0D0D] bg-[#FFFFFF] p-5 pt-14 shadow-[6px_6px_0px_0px_#0D0D0D] md:max-w-[640px] md:p-8 md:pt-16 ${panelClassName}`}
      >
        <h1 className="absolute left-5 right-16 top-4 truncate text-base font-black uppercase tracking-widest md:left-8 md:top-5 md:text-lg">{title}</h1>
        <button
          {...gsapButtonMotion}
          ref={closeButtonRef}
          type="button"
          aria-label="Cerrar ventana"
          onClick={() => dismissRef.current()}
          className="absolute right-4 top-3 grid h-8 w-8 place-items-center border-2 border-[#0D0D0D] bg-[#8BA3A7] text-lg font-black shadow-[2px_2px_0px_0px_#0D0D0D] md:right-6 md:top-4"
        >
          ×
        </button>
        {children}
      </section>
    </div>
  );
}