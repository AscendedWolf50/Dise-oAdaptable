import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useAppNavigation } from '../../utils/useAppNavigation.js';

export default function Gameplay() {
  const navigate = useAppNavigation();
  const [timeLeft, setTimeLeft] = useState(102); // 102 seconds = 01:42
  const progress = 62;
  const level = 22;

  const containerRef = useRef(null);
  const hudRef = useRef(null);
  const canvasRef = useRef(null);
  const controlsRef = useRef(null);

  // Timer logic
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // GSAP Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Container fade in
      gsap.from(containerRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.5,
        ease: 'power3.out'
      });

      // HUD slide down
      gsap.from(hudRef.current, {
        opacity: 0,
        y: -30,
        duration: 0.6,
        delay: 0.2,
        ease: 'back.out(1.7)'
      });

      // Canvas fade in
      gsap.from(canvasRef.current, {
        opacity: 0,
        scale: 0.95,
        duration: 0.6,
        delay: 0.4,
        ease: 'power2.out'
      });

      // Controls slide up
      gsap.from(controlsRef.current.children, {
        opacity: 0,
        y: 30,
        duration: 0.5,
        stagger: 0.1,
        delay: 0.5,
        ease: 'back.out(1.5)'
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="flex justify-center bg-[#1B384B] p-4 font-sans selection:bg-[#FF7800] selection:text-white">
      {/* Main Container */}
      <div 
        ref={containerRef}
        className="relative flex h-[min(70dvh,640px)] min-h-[420px] w-full max-w-md flex-col overflow-hidden border-2 border-[#0D0D0D] bg-[#8BA3A7] shadow-[4px_4px_0px_0px_#0D0D0D] md:h-[min(76dvh,760px)] md:max-w-2xl"
      >
        {/* HUD Area */}
        <div ref={hudRef} className="relative z-10 flex shrink-0 flex-col gap-3 bg-[#8BA3A7] p-4 shadow-[0px_4px_0px_0px_#0D0D0D]">
          {/* Row 1: Pause, Progress */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/pausa')}
              className="button-secondary flex h-10 w-10 items-center justify-center p-0 transition-all"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="1" width="3" height="12" fill="#0D0D0D"/>
                <rect x="9" y="1" width="3" height="12" fill="#0D0D0D"/>
              </svg>
            </button>
            
            <div className="flex-1 flex items-center gap-3">
              <div className="relative h-5 flex-1 overflow-hidden border-2 border-[#0D0D0D] bg-white shadow-[2px_2px_0px_0px_#0D0D0D]">
                <div 
                  className="absolute top-0 left-0 h-full bg-[#FF7800] border-r-2 border-[#0D0D0D] transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
                {/* Highlight/shine effect on bar */}
                <div className="absolute left-0 top-0 h-1 w-full bg-white"></div>
              </div>
              <span className="font-black text-[#0D0D0D] w-10 text-right">{progress}%</span>
            </div>
          </div>

          {/* Row 2: Level, Timer */}
          <div className="flex justify-between items-center font-black text-[#0D0D0D]">
            <span className="uppercase tracking-widest text-lg">NIVEL {level}</span>
            <div className="flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span className="text-xl tracking-tighter">{formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>

        {/* Game Canvas Area */}
        <div ref={canvasRef} className="relative flex flex-1 items-center justify-center overflow-hidden border-y-2 border-[#0D0D0D] bg-[#8BA3A7]">
          {/* Ground Grid/Lines placeholder for 3D effect */}
          <div className="absolute bottom-0 h-1/3 w-full border-t-2 border-[#0D0D0D] opacity-20" style={{ backgroundImage: 'linear-gradient(#0D0D0D 2px, transparent 2px)', backgroundSize: '100% 20px' }}></div>
          
          {/* Voxel Truck SVG Illustration */}
          <svg width="200" height="160" viewBox="0 0 200 160" className="relative z-10 drop-shadow-[8px_12px_0px_#0D0D0D]">
            {/* Tires */}
            <rect x="20" y="100" width="30" height="40" rx="4" fill="#0D0D0D" />
            <rect x="150" y="100" width="30" height="40" rx="4" fill="#0D0D0D" />
            <rect x="30" y="105" width="10" height="30" fill="#0D0D0D" />
            <rect x="160" y="105" width="10" height="30" fill="#0D0D0D" />

            {/* Main Body */}
            <path d="M10 60 L190 60 L190 110 L10 110 Z" fill="#FF7800" stroke="#0D0D0D" strokeWidth="4" strokeLinejoin="round"/>
            <path d="M10 60 L190 60 L180 80 L20 80 Z" fill="#FF7800" stroke="#0D0D0D" strokeWidth="2" strokeLinejoin="round"/>
            
            {/* Cabin */}
            <path d="M40 60 L160 60 L140 20 L60 20 Z" fill="#FFFFFF" stroke="#0D0D0D" strokeWidth="4" strokeLinejoin="round"/>
            <path d="M50 55 L150 55 L135 25 L65 25 Z" fill="#8BA3A7" stroke="#0D0D0D" strokeWidth="2" strokeLinejoin="round"/>
            
            {/* Windshield Shine */}
            <path d="M70 30 L90 30 L80 50 L60 50 Z" fill="#FFFFFF" opacity="0.6"/>

            {/* Grill/Bumper */}
            <rect x="70" y="80" width="60" height="20" fill="#1B384B" stroke="#0D0D0D" strokeWidth="4" />
            <rect x="75" y="85" width="50" height="2" fill="#0D0D0D" />
            <rect x="75" y="90" width="50" height="2" fill="#0D0D0D" />
            <rect x="75" y="95" width="50" height="2" fill="#0D0D0D" />

            {/* Headlights */}
            <circle cx="40" cy="90" r="10" fill="#FFFFFF" stroke="#0D0D0D" strokeWidth="4" />
            <circle cx="160" cy="90" r="10" fill="#FFFFFF" stroke="#0D0D0D" strokeWidth="4" />
            <circle cx="40" cy="90" r="4" fill="#FF7800" />
            <circle cx="160" cy="90" r="4" fill="#FF7800" />
            
            {/* Speed Lines */}
            <line x1="220" y1="40" x2="170" y2="40" stroke="#0D0D0D" strokeWidth="3" strokeLinecap="round" opacity="0.5"/>
            <line x1="240" y1="70" x2="200" y2="70" stroke="#0D0D0D" strokeWidth="3" strokeLinecap="round" opacity="0.5"/>
            <line x1="-40" y1="120" x2="20" y2="120" stroke="#0D0D0D" strokeWidth="3" strokeLinecap="round" opacity="0.5"/>
          </svg>
        </div>

        {/* Bottom Controls */}
        <div ref={controlsRef} className="z-10 flex shrink-0 gap-3 bg-[#8BA3A7] p-4 shadow-[0px_-4px_0px_0px_#0D0D0D]">
          {/* Left Arrow */}
          <button className="voxel-grid-surface flex h-14 w-14 items-center justify-center border-2 border-[#0D0D0D] bg-[#1B384B] text-white shadow-[4px_4px_0px_0px_#0D0D0D] hover:bg-[#8BA3A7] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all md:h-16 md:w-16">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>

          {/* Action Button */}
          <button className="button-primary flex h-14 flex-1 items-center justify-center text-lg font-black uppercase tracking-widest transition-all md:h-16 md:text-xl">
            ACCIÓN
          </button>

          {/* Right Arrow */}
          <button className="voxel-grid-surface flex h-14 w-14 items-center justify-center border-2 border-[#0D0D0D] bg-[#1B384B] text-white shadow-[4px_4px_0px_0px_#0D0D0D] hover:bg-[#8BA3A7] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all md:h-16 md:w-16">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}