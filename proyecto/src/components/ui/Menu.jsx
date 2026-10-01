import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { gsapButtonMotion } from '../../utils/gsapButtonMotion.js';
import { useAppNavigation } from '../../utils/useAppNavigation.js';

const NAV_ITEMS = [
  { path: '/', label: 'INICIO' },
  { path: '/login', label: 'REGISTRO' },
  { path: '/niveles', label: 'NIVELES' },
  { path: '/perfil', label: 'PERFIL' },
  { path: '/configuracion', label: 'CONFIGURACIÓN' },
  { path: '/tutorial', label: 'TUTORIAL' },
  { path: '/gameplay', label: 'JUEGO' },
  { path: '/pausa', label: 'PAUSA' },
  { path: '/victoria', label: 'VICTORIA' },
  { path: '/derrota', label: 'DERROTA' },
];

export default function Menu() {
  const navigate = useAppNavigation();
  const location = useLocation();
  const activeItemRef = useRef(null);
  const menuItemsRef = useRef([]);

  useEffect(() => {
    const context = gsap.context(() => {
      gsap.from(menuItemsRef.current, { opacity: 0, y: -8, duration: 0.28, stagger: 0.035, ease: 'power2.out' });
    });
    return () => context.revert();
  }, []);

  useEffect(() => {
    if (window.matchMedia('(max-width: 639px)').matches) {
      activeItemRef.current?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
    }
  }, [location.pathname]);

  return (
    <nav aria-label="Navegación principal" className="voxel-grid-surface border-b-2 border-[#0D0D0D] bg-[#1B384B] px-3 py-2 text-white shadow-[0px_4px_0px_0px_#0D0D0D] sm:px-4">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <button onClick={() => navigate('/')} className="shrink-0 self-center border-2 border-[#0D0D0D] bg-[#FF7800] px-3 py-2 text-sm font-black tracking-[0.2em] text-[#0D0D0D] shadow-[4px_4px_0px_0px_#0D0D0D] sm:self-auto">VOXEL DRIFT</button>
        <div className="flex w-full gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:justify-end sm:overflow-visible sm:pb-0">
          {NAV_ITEMS.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                {...gsapButtonMotion}
                key={item.path}
                ref={(element) => {
                  menuItemsRef.current[index] = element;
                  if (isActive) activeItemRef.current = element;
                }}
                onClick={() => navigate(item.path)}
                aria-current={isActive ? 'page' : undefined}
                className={`shrink-0 border-2 px-3 py-2 text-[10px] font-black tracking-widest transition-colors duration-150 sm:text-xs
                  ${isActive
                    ? 'border-[#FF7800] bg-[#FF7800] text-[#0D0D0D] shadow-[2px_2px_0px_0px_#0D0D0D]'
                    : 'border-[#8BA3A7] bg-[#1B384B] text-white hover:border-[#FF7800] hover:text-white'
                  }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
