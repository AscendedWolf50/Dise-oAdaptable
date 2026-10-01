import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';

const SelectorNiveles = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const cardsRef = useRef([]);

  const levels = [
    { id: 1, number: '01', stars: 3, status: 'completed' },
    { id: 2, number: '02', stars: 3, status: 'completed' },
    { id: 3, number: '03', stars: 2, status: 'completed' },
    { id: 4, number: '04', stars: 3, status: 'completed' },
    { id: 5, number: '05', stars: 1, status: 'completed' },
    { id: 6, number: '06', stars: 3, status: 'completed' },
    { id: 7, number: '07', stars: 2, status: 'completed' },
    { id: 8, number: '08', stars: 3, status: 'completed' },
    { id: 9, number: '09', stars: 1, status: 'completed' },
    { id: 10, number: '10', stars: 0, status: 'completed' },
    { id: 11, number: '11', stars: 0, status: 'current' },
    { id: 12, number: '12', stars: 0, status: 'current' },
    { id: 13, number: '13', stars: 0, status: 'locked' },
    { id: 14, number: '14', stars: 0, status: 'locked' },
    { id: 15, number: '15', stars: 0, status: 'locked' },
    { id: 16, number: '16', stars: 0, status: 'locked' },
    { id: 17, number: '17', stars: 0, status: 'locked' },
    { id: 18, number: '18', stars: 0, status: 'locked' },
    { id: 19, number: '19', stars: 0, status: 'locked' },
    { id: 20, number: '20', stars: 0, status: 'locked' },
    { id: 21, number: '21', stars: 0, status: 'locked' }
  ];

  useEffect(() => {
    gsap.fromTo(
      containerRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }
    );

    gsap.fromTo(
      cardsRef.current,
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 0.4, stagger: 0.05, ease: 'back.out(1.7)' }
    );
  }, []);

  const handleLevelClick = (status) => {
    if (status === 'completed' || status === 'current') {
      navigate('/gameplay');
    }
  };

  const renderStars = (count) => {
    const totalStars = 3;
    let starsStr = '';
    for (let i = 0; i < totalStars; i++) {
      if (i < count) {
        starsStr += '★';
      } else {
        starsStr += '☆';
      }
    }
    return starsStr;
  };

  const totalStars = levels.reduce((sum, lvl) => sum + lvl.stars, 0);
  const completedCount = levels.filter(l => l.status === 'completed').length;

  return (
    <div className="bg-[#1B384B] flex justify-center p-4 font-sans uppercase tracking-widest text-[#0D0D0D]">
      <div
        ref={containerRef}
        className="w-full max-w-md overflow-hidden border-2 border-[#0D0D0D] bg-[#8BA3A7] p-5 shadow-[4px_4px_0px_0px_#0D0D0D] md:max-w-2xl md:p-7"
      >
        {/* Header row */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/')}
            className="button-secondary px-3 py-1 text-xs font-bold transition-all"
          >
            ← VOLVER
          </button>
          <h1 className="font-bold text-sm sm:text-base tracking-tighter">ELIGE EL SIGUIENTE NIVEL</h1>
        </div>

        {/* Stats bar */}
        <div className="flex justify-between items-center mb-6">
          <div className="voxel-grid-surface bg-[#0D0D0D] px-3 py-1 text-sm font-bold text-white">
            {completedCount}/100 NIVELES
          </div>
          <div className="font-bold text-lg text-[#FF7800]">
            ★ {totalStars}
          </div>
        </div>

        {/* Level Grid Area */}
        <div className="max-h-[60vh] overflow-y-auto pb-2 pr-1 md:max-h-[70vh]">
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
            {levels.map((level, index) => {
              // Add separator before first locked level
              const isFirstLocked = level.status === 'locked' && levels[index - 1]?.status !== 'locked';

              return (
                <React.Fragment key={level.id}>
                  {isFirstLocked && (
                    <div className="col-span-3 my-2 flex items-center justify-center gap-2 opacity-60 sm:col-span-4 md:col-span-5">
                      <div className="flex-grow border-t-2 border-dashed border-[#8BA3A7]"></div>
                      <svg aria-label="Niveles bloqueados" className="h-4 w-4 text-[#8BA3A7]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="10" width="14" height="11" /><path d="M8 10V7a4 4 0 1 1 8 0v3" /></svg>
                      <div className="flex-grow border-t-2 border-dashed border-[#8BA3A7]"></div>
                    </div>
                  )}

                  <div
                    ref={(el) => (cardsRef.current[index] = el)}
                    onClick={() => handleLevelClick(level.status)}
                    aria-disabled={level.status === 'locked'}
                    className={`
                      relative flex aspect-square min-w-0 flex-col items-center justify-between border-2 border-[#0D0D0D] p-2 text-center transition-all sm:p-3
                      ${level.status === 'completed'
                        ? 'bg-[#8BA3A7] cursor-pointer hover:shadow-[4px_4px_0px_0px_#0D0D0D] hover:-translate-y-[2px] active:translate-y-0 active:shadow-none'
                        : level.status === 'current'
                          ? 'border-dashed bg-[#8BA3A7] cursor-pointer hover:shadow-[4px_4px_0px_0px_#0D0D0D] hover:-translate-y-[2px]'
                          : 'bg-[#8BA3A7] text-[#1B384B] cursor-not-allowed'
                      }
                    `}
                  >
                    {level.status === 'current' && (
                      <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-1 text-[#0D0D0D]">
                        <span aria-hidden="true">[</span>
                        <span aria-hidden="true">]</span>
                      </div>
                    )}
                    
                    <div className="mb-1 text-lg font-bold leading-none sm:text-xl">{level.number}</div>
                    
                    <div className={`flex min-h-5 items-center justify-center gap-1 text-[10px] leading-none sm:text-xs ${level.status === 'completed' ? 'text-[#FF7800]' : 'text-[#0D0D0D]'}`}>
                      {level.status === 'locked' && <svg aria-label="Nivel bloqueado" className="h-3 w-3 shrink-0 sm:h-4 sm:w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="10" width="14" height="11" /><path d="M8 10V7a4 4 0 1 1 8 0v3" /></svg>}
                      {renderStars(level.stars)}
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectorNiveles;