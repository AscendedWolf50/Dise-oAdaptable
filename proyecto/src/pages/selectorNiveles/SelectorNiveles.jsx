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
    <div className="min-h-screen bg-[#1B384B] flex items-center justify-center p-4 font-sans uppercase tracking-widest text-[#0D0D0D]">
      <div
        ref={containerRef}
        className="bg-[#FFFFFF] w-full max-w-md mx-auto border-2 border-[#0D0D0D] p-5 shadow-[6px_6px_0px_0px_#0D0D0D] overflow-hidden"
      >
        {/* Header row */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/')}
            className="border-2 border-[#0D0D0D] bg-white px-3 py-1 font-bold text-xs hover:shadow-[2px_2px_0px_0px_#0D0D0D] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all"
          >
            ← VOLVER
          </button>
          <h1 className="font-bold text-sm sm:text-base tracking-tighter">ELIGE EL SIGUIENTE NIVEL</h1>
        </div>

        {/* Stats bar */}
        <div className="flex justify-between items-center mb-6">
          <div className="bg-[#0D0D0D] text-white px-3 py-1 font-bold text-sm">
            {completedCount}/100 NIVELES
          </div>
          <div className="font-bold text-lg text-[#FF7800]">
            ★ {totalStars}
          </div>
        </div>

        {/* Level Grid Area */}
        <div className="overflow-y-auto max-h-[60vh] pr-1 pb-2">
          <div className="grid grid-cols-3 gap-3">
            {levels.map((level, index) => {
              // Add separator before first locked level
              const isFirstLocked = level.status === 'locked' && levels[index - 1]?.status !== 'locked';

              return (
                <React.Fragment key={level.id}>
                  {isFirstLocked && (
                    <div className="col-span-3 flex items-center justify-center gap-2 my-2 opacity-60">
                      <div className="flex-grow border-t-2 border-dashed border-[#8BA3A7]"></div>
                      <span className="text-sm">🔒</span>
                      <div className="flex-grow border-t-2 border-dashed border-[#8BA3A7]"></div>
                    </div>
                  )}

                  <div
                    ref={(el) => (cardsRef.current[index] = el)}
                    onClick={() => handleLevelClick(level.status)}
                    className={`
                      relative p-3 text-center transition-all 
                      ${level.status === 'completed'
                        ? 'border-2 border-[#0D0D0D] bg-white cursor-pointer hover:shadow-[4px_4px_0px_0px_#0D0D0D] hover:-translate-y-[2px] active:translate-y-0 active:shadow-none'
                        : level.status === 'current'
                          ? 'border-2 border-dashed border-[#8BA3A7] bg-white cursor-pointer hover:border-[#0D0D0D] hover:shadow-[4px_4px_0px_0px_#0D0D0D] hover:-translate-y-[2px]'
                          : 'border-2 border-[#8BA3A7] bg-[#f5f5f5] opacity-60 cursor-not-allowed'
                      }
                    `}
                  >
                    {level.status === 'current' && (
                      <div className="absolute inset-0 flex justify-between items-center px-1 pointer-events-none text-[#8BA3A7]">
                        <span>[⋮</span>
                        <span>⋮]</span>
                      </div>
                    )}
                    
                    <div className="font-bold text-xl mb-1">{level.number}</div>
                    
                    <div className={`text-xs ${level.status === 'completed' ? 'text-[#FF7800]' : 'text-[#8BA3A7]'}`}>
                      {level.status === 'locked' ? '🔒' : renderStars(level.stars)}
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