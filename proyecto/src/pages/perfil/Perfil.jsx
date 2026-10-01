import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import profileData from '../../data/playerProfile.json';

export default function Perfil() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const statsRef = useRef(null);
  const achievementsRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(containerRef.current, {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: 'power3.out',
      });

      gsap.from('.stat-card', {
        opacity: 0,
        y: 20,
        scale: 0.9,
        stagger: 0.1,
        duration: 0.5,
        ease: 'back.out(1.7)',
        delay: 0.4,
      });

      gsap.from('.achievement-row', {
        opacity: 0,
        x: -20,
        stagger: 0.12,
        duration: 0.5,
        ease: 'power2.out',
        delay: 0.8,
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const { jugador, progreso, estadisticas, logros } = profileData;
  const completionPercent = Math.round(
    (progreso.estrellasObtenidas / progreso.estrellasTotal) * 100
  );

  return (
    <div className="min-h-screen bg-[#1B384B] flex items-center justify-center p-4 font-sans">
      <div
        ref={containerRef}
        className="bg-white w-full max-w-md mx-auto border-2 border-[#0D0D0D] p-5 shadow-[6px_6px_0px_0px_#0D0D0D] flex flex-col gap-4"
      >
        {/* Browser bar */}
        <div className="border-2 border-[#0D0D0D] rounded px-3 py-1 flex justify-between items-center">
          <span className="text-xs tracking-widest text-[#8BA3A7] font-mono">WWW.</span>
          <svg className="w-4 h-4 text-[#8BA3A7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="border-2 border-[#0D0D0D] px-3 py-1 font-bold text-xs tracking-widest uppercase
                       shadow-[3px_3px_0px_0px_#0D0D0D] hover:translate-x-[1px] hover:translate-y-[1px]
                       hover:shadow-[2px_2px_0px_0px_#0D0D0D] active:shadow-none active:translate-x-[3px]
                       active:translate-y-[3px] transition-all cursor-pointer"
          >
            ← VOLVER
          </button>
          <h1 className="text-xl font-black uppercase tracking-tighter leading-tight">
            PERFIL DEL JUGADOR
          </h1>
        </div>

        {/* Player card */}
        <div className="bg-[#0D0D0D] text-white p-4 border-2 border-[#0D0D0D] flex items-center gap-4">
          <div className="w-14 h-14 border-2 border-[#FF7800] flex items-center justify-center text-3xl bg-[#1B384B]">
            {jugador.avatar}
          </div>
          <div>
            <p className="font-black text-lg tracking-wider uppercase">{jugador.nombre}</p>
            <p className="text-xs text-[#8BA3A7] tracking-widest uppercase">NIVEL {jugador.nivel}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-bold tracking-widest uppercase text-[#0D0D0D]">
              PROGRESO GENERAL
            </span>
            <span className="text-xs font-bold text-[#FF7800]">{completionPercent}%</span>
          </div>
          <div className="w-full h-4 border-2 border-[#0D0D0D] bg-white">
            <div
              className="h-full bg-[#FF7800] transition-all duration-500"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-[#8BA3A7] font-bold uppercase tracking-widest">
              {progreso.estrellasObtenidas}/{progreso.estrellasTotal} ESTRELLAS
            </span>
            <span className="text-[10px] text-[#8BA3A7] font-bold uppercase tracking-widest">
              {progreso.nivelesCompletados}/{progreso.nivelesTotal} NIVELES
            </span>
          </div>
        </div>

        {/* Stats grid */}
        <div ref={statsRef} className="grid grid-cols-2 gap-3">
          {[
            { label: 'TIEMPO JUGADO', value: estadisticas.tiempoJugado, icon: '⏱' },
            { label: 'RACHA ACTUAL', value: `${estadisticas.rachaActual} DÍAS`, icon: '🔥' },
            { label: 'INTENTOS FALLIDOS', value: estadisticas.intentosFallidos, icon: '💀' },
            { label: 'MONEDAS', value: estadisticas.monedasGanadas, icon: '🪙' },
            { label: 'MEJOR RACHA', value: `${estadisticas.mejorRacha} DÍAS`, icon: '⭐' },
            { label: 'VEHÍCULOS', value: estadisticas.vehiculosDesbloqueados, icon: '🚗' },
          ].map((stat, i) => (
            <div
              key={i}
              className="stat-card border-2 border-[#0D0D0D] p-3 shadow-[3px_3px_0px_0px_#0D0D0D]"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{stat.icon}</span>
                <span className="font-black text-lg text-[#0D0D0D]">{stat.value}</span>
              </div>
              <span className="text-[9px] font-bold text-[#8BA3A7] uppercase tracking-widest leading-tight">
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* Achievements */}
        <div className="flex items-center justify-center gap-3 my-1 opacity-50">
          <div className="h-[1px] flex-1 border-t-2 border-dashed border-[#0D0D0D]" />
          <span className="text-[10px] font-bold tracking-widest text-[#8BA3A7] uppercase">
            LOGROS
          </span>
          <div className="h-[1px] flex-1 border-t-2 border-dashed border-[#0D0D0D]" />
        </div>

        <div ref={achievementsRef} className="flex flex-col gap-2">
          {logros.map((logro) => (
            <div
              key={logro.id}
              className={`achievement-row flex items-center gap-3 border-2 p-3 transition-all
                ${logro.obtenido
                  ? 'border-[#0D0D0D] bg-white'
                  : 'border-[#8BA3A7] bg-[#f5f5f5] opacity-60'
                }`}
            >
              <div
                className={`w-8 h-8 border-2 flex items-center justify-center text-sm font-black
                  ${logro.obtenido
                    ? 'border-[#FF7800] text-[#FF7800] bg-white'
                    : 'border-[#8BA3A7] text-[#8BA3A7]'
                  }`}
              >
                {logro.obtenido ? '✓' : '🔒'}
              </div>
              <div className="flex-1">
                <p className="font-black text-xs tracking-widest uppercase text-[#0D0D0D]">
                  {logro.nombre}
                </p>
                <p className="text-[10px] text-[#8BA3A7] tracking-wider">{logro.descripcion}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
