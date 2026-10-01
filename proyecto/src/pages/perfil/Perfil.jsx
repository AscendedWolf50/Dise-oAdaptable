import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import profileData from '../../data/playerProfile.json';
import { gsapButtonMotion } from '../../utils/gsapButtonMotion.js';

export default function Perfil() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(containerRef.current, {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: 'power3.out',
      });

      gsap.from('[data-profile-enter]', { opacity: 0, y: 16, stagger: 0.08, duration: 0.42, ease: 'power2.out', delay: 0.12 });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const completionPercent = Math.round((profileData.completedLevels / profileData.totalLevels) * 100);

  return (
    <main className="min-h-screen bg-[#8BA3A7] px-4 py-4 font-sans">
      <div
        ref={containerRef}
        className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-3 border-2 border-[#0D0D0D] bg-white p-4 shadow-[4px_4px_0px_0px_#0D0D0D]"
      >
        {/* Header */}
        <div data-profile-enter className="flex items-center gap-2">
          <button
            {...gsapButtonMotion}
            onClick={() => navigate('/')}
            className="border-2 border-[#0D0D0D] px-3 py-1 font-bold text-xs tracking-widest uppercase
                       shadow-[3px_3px_0px_0px_#0D0D0D] hover:translate-x-[1px] hover:translate-y-[1px]
                       hover:shadow-[2px_2px_0px_0px_#0D0D0D] active:shadow-none active:translate-x-[3px]
                       active:translate-y-[3px] transition-all cursor-pointer"
          >
            ← VOLVER
          </button>
          <h1 className="text-xl font-black uppercase tracking-tighter leading-tight">
            PERFIL
          </h1>
          <button {...gsapButtonMotion} aria-label="Compartir perfil" onClick={() => { navigator.clipboard?.writeText(window.location.href); setCopied(true); }} className="ml-auto border-2 border-[#0D0D0D] px-3 py-2 font-bold shadow-[2px_2px_0px_0px_#0D0D0D]">{copied ? '✓' : '↗'}</button>
        </div>

        <div data-profile-enter className="border-2 border-[#0D0D0D] p-3">
          <div>
            <p className="font-black text-sm tracking-widest uppercase">{profileData.username}</p>
            <p className="mt-1 text-[10px] text-[#8BA3A7] tracking-widest uppercase">SE UNIÓ EL {profileData.joinDate}</p>
          </div>
        </div>

        <div data-profile-enter className="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em]">
          <span className="h-2 w-2 border border-[#0D0D0D]" />PROGRESO<span className="flex-1 border-t-2 border-dashed border-[#8BA3A7]" />
        </div>

        <div data-profile-enter className="border-2 border-[#0D0D0D] p-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-bold tracking-widest uppercase text-[#0D0D0D]">
              NIVELES COMPLETADOS
            </span>
            <span className="text-xs font-bold">{completionPercent}%</span>
          </div>
          <div className="h-3 w-full border-2 border-[#0D0D0D] bg-white">
            <div
              className="h-full bg-[#0D0D0D] transition-all duration-500"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
          <span className="mt-1 block text-[9px] font-bold tracking-widest text-[#8BA3A7]">{profileData.completedLevels} / {profileData.totalLevels} NIVELES</span>
          <div className="mb-1 mt-3 flex justify-between">
            <span className="text-xs font-bold tracking-widest uppercase">ESTRELLAS</span><span className="text-xs font-bold">{profileData.stars}</span>
          </div>
          <div className="h-3 w-full border-2 border-[#0D0D0D] bg-white"><div className="h-full bg-[#0D0D0D]" style={{ width: `${(profileData.stars / 300) * 100}%` }} /></div>
          <span className="mt-1 block text-[9px] font-bold tracking-widest text-[#8BA3A7]">{profileData.stars} ESTRELLAS</span>
        </div>

        <div data-profile-enter className="grid grid-cols-2 gap-3">
          <div className="col-span-2 flex items-center gap-4 border-2 border-[#0D0D0D] p-3 shadow-[3px_3px_0px_0px_#0D0D0D]"><strong className="text-3xl font-black">{profileData.failedAttempts}</strong><span className="text-[9px] font-bold leading-4 tracking-widest">☠<br />INTENTOS<br />FALLIDOS</span></div>
          <div className="flex flex-col justify-center border-2 border-[#0D0D0D] p-3 shadow-[3px_3px_0px_0px_#0D0D0D]"><span className="text-[9px] font-bold tracking-widest text-[#8BA3A7]">TIEMPO JUGADO</span><strong className="mt-1 text-lg font-black">{profileData.playedTime}</strong></div>
          <div className="flex flex-col justify-center border-2 border-[#0D0D0D] p-3 shadow-[3px_3px_0px_0px_#0D0D0D]"><span className="text-[9px] font-bold tracking-widest text-[#8BA3A7]">RACHA ACTUAL</span><strong className="mt-1 text-lg font-black">{profileData.currentStreak}</strong></div>
        </div>
      </div>
    </main>
  );
}
