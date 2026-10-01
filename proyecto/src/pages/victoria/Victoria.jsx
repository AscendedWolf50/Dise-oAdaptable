import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ModalOverlay from '../../components/ui/ModalOverlay.jsx';
import { useAppNavigation } from '../../utils/useAppNavigation.js';

const Victoria = () => {
  const containerRef = useRef(null);
  const bannerRef = useRef(null);
  const starsRef = useRef([]);
  const buttonsRef = useRef([]);
  const navigate = useAppNavigation();

  useEffect(() => {
    // Animations
    const tl = gsap.timeline();

    tl.fromTo(containerRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
    )
    .fromTo(bannerRef.current,
      { scale: 0.5, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.5)' },
      "-=0.2"
    )
    .fromTo(starsRef.current,
      { scale: 0, rotation: -45, opacity: 0 },
      { scale: 1, rotation: 0, opacity: 1, duration: 0.4, stagger: 0.2, ease: 'back.out(2)' },
      "-=0.2"
    )
    .fromTo(buttonsRef.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.4, stagger: 0.1, ease: 'power2.out' },
      "-=0.1"
    );
  }, []);

  const handleMenu = () => navigate('/');
  const handleRestart = () => navigate('/gameplay');
  const handleNext = () => navigate('/niveles');

  return (
    <ModalOverlay title="¡VICTORIA!">
      <div ref={containerRef} className="flex flex-col items-center gap-4 font-sans md:gap-5">
        {/* Illustration placeholder */}
        <div className="w-full h-36 border-2 border-[#0D0D0D] bg-[#8BA3A7] relative flex items-center justify-center">
          <div className="absolute top-0 left-0 w-2 h-2 bg-[#0D0D0D]"></div>
          <div className="absolute top-0 right-0 w-2 h-2 bg-[#0D0D0D]"></div>
          <div className="absolute bottom-0 left-0 w-2 h-2 bg-[#0D0D0D]"></div>
          <div className="absolute bottom-0 right-0 w-2 h-2 bg-[#0D0D0D]"></div>
          <span className="font-bold text-[#0D0D0D] tracking-widest">ILUSTRACIÓN</span>
        </div>

        {/* Victory Banner */}
        <div 
          ref={bannerRef}
          className="bg-[#0D0D0D] text-white w-full p-4 text-center font-black text-3xl tracking-widest uppercase border-2 border-[#0D0D0D]"
        >
          ¡VICTORIA!
        </div>

        {/* Stars Section */}
        <div className="flex flex-col items-center gap-4 py-2">
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <div 
                key={i} 
                ref={el => starsRef.current[i] = el}
                className="text-5xl"
              >
                {i < 2 ? (
                  // Filled star
                  <svg className="w-12 h-12 text-[#FF7800]" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ) : (
                  // Empty star
                  <svg className="w-12 h-12 text-[#0D0D0D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                )}
              </div>
            ))}
          </div>
          <div className="font-bold text-[#0D0D0D] tracking-widest text-lg">
            2/3 ESTRELLAS
          </div>
        </div>

        {/* Bottom 3-button row */}
        <div className="mt-2 grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
          <button
            ref={el => buttonsRef.current[0] = el}
            onClick={handleMenu}
            className="bg-[#8BA3A7] text-[#0D0D0D] border-2 border-[#0D0D0D] p-3 flex flex-col items-center justify-center gap-1 font-bold shadow-[4px_4px_0px_0px_#0D0D0D] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#0D0D0D] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span className="text-[10px] tracking-wider">MENÚ</span>
          </button>

          <button
            ref={el => buttonsRef.current[1] = el}
            onClick={handleRestart}
            className="bg-[#8BA3A7] text-[#0D0D0D] border-2 border-[#0D0D0D] p-3 flex flex-col items-center justify-center gap-1 font-bold shadow-[4px_4px_0px_0px_#0D0D0D] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#0D0D0D] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="text-[10px] tracking-wider">REINICIAR</span>
          </button>

          <button
            ref={el => buttonsRef.current[2] = el}
            onClick={handleNext}
            className="bg-[#8BA3A7] text-[#0D0D0D] border-2 border-[#0D0D0D] p-3 flex flex-col items-center justify-center gap-1 font-bold shadow-[4px_4px_0px_0px_#0D0D0D] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#0D0D0D] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all"
          >
            <svg className="w-6 h-6" fill="currentColor" stroke="none" viewBox="0 0 24 24">
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