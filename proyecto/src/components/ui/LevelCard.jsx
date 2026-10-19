import React, { forwardRef } from 'react';

const LevelCard = forwardRef(({ level, isFirstLocked, onClick }, ref) => {
  const renderStars = (count) => {
    let starsStr = '';
    for (let i = 0; i < 3; i++) {
      starsStr += i < count ? '★' : '☆';
    }
    return starsStr;
  };

  return (
    <React.Fragment>
      {/* Separador Visual para el primer nivel bloqueado */}
      {isFirstLocked && (
        <div className="col-span-3 my-2 flex items-center justify-center gap-2 opacity-60 sm:col-span-4 md:col-span-5 lg:col-span-6">
          <div className="flex-grow border-t-2 border-dashed border-[#8BA3A7]"></div>
          <svg aria-label="Niveles bloqueados" className="h-4 w-4 text-[#8BA3A7]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="5" y="10" width="14" height="11" />
            <path d="M8 10V7a4 4 0 1 1 8 0v3" />
          </svg>
          <div className="flex-grow border-t-2 border-dashed border-[#8BA3A7]"></div>
        </div>
      )}

      {/* Tarjeta del Nivel */}
      <div
        ref={ref}
        onClick={() => onClick(level)}
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
        {/* Corchetes parpadeantes para el nivel actual */}
        {level.status === 'current' && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-1 text-[#0D0D0D]">
            <span aria-hidden="true">[</span>
            <span aria-hidden="true">]</span>
          </div>
        )}
        
        {/* Número de Nivel */}
        <div className="mb-1 text-lg font-bold leading-none sm:text-xl">{level.number}</div>
        
        {/* Estrellas o Candado */}
        <div className={`flex min-h-5 items-center justify-center gap-1 text-[10px] leading-none sm:text-xs ${level.status === 'completed' ? 'text-[#FF7800]' : 'text-[#0D0D0D]'}`}>
          {level.status === 'locked' && (
            <svg aria-label="Nivel bloqueado" className="h-3 w-3 shrink-0 sm:h-4 sm:w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="5" y="10" width="14" height="11" />
              <path d="M8 10V7a4 4 0 1 1 8 0v3" />
            </svg>
          )}
          {renderStars(level.stars)}
        </div>
      </div>
    </React.Fragment>
  );
});

LevelCard.displayName = 'LevelCard';
export default LevelCard;