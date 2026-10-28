import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useAppNavigation } from '../../utils/useAppNavigation.js';
import CarCanvas from '../../components/ui/CarCanvas.jsx';
import { auth, db } from '../../firebase/config.js';
import { doc, setDoc } from 'firebase/firestore';

// Paleta con los 8 colores solicitados: Azul, Rojo, Verde, Rosado, Morado, Naranjado, Blanco, Negro
const PALETA_COLORES = [
  { id: 0, hex: '#2572E6', nombre: 'Azul' },
  { id: 1, hex: '#E62525', nombre: 'Rojo' },
  { id: 2, hex: '#25E652', nombre: 'Verde' },
  { id: 3, hex: '#FF69B4', nombre: 'Rosado' },
  { id: 4, hex: '#9B25E6', nombre: 'Morado' },
  { id: 5, hex: '#FF7800', nombre: 'Naranjado' },
  { id: 6, hex: '#FFFFFF', nombre: 'Blanco' },
  { id: 7, hex: '#222222', nombre: 'Negro' },
];

const Inicio = () => {
  const navigate = useAppNavigation();
  const containerRef = useRef(null);
  const elementsRef = useRef([]);

  // Carga del color activo desde localStorage (por defecto 0 = Azul)
  const [selectedColor, setSelectedColor] = useState(() => {
    const saved = localStorage.getItem('VoxelDriftCarColor');
    return saved !== null ? parseInt(saved, 10) : 0;
  });

  useEffect(() => {
    // Fade in container
    gsap.fromTo(
      containerRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
    );

    // Stagger inner elements
    gsap.fromTo(
      elementsRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power3.out', delay: 0.2 }
    );
  }, []);

  const addToRefs = (el) => {
    if (el && !elementsRef.current.includes(el)) {
      elementsRef.current.push(el);
    }
  };

  // Manejar el clic en un botón de la paleta
  const handleSeleccionarColor = async (index) => {
    setSelectedColor(index);
    localStorage.setItem('VoxelDriftCarColor', index.toString());

    if (auth.currentUser) {
      try {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await setDoc(userRef, { carColorIndex: index }, { merge: true });
      } catch (e) {
        console.error("Error al sincronizar color en Firestore:", e);
      }
    }
  };

  const buttonPressStyle = "active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all duration-100";

  return (
    <div className="flex h-full min-h-full w-full justify-center bg-[#142A3A] p-4 font-sans lg:p-6">
      <div 
        ref={containerRef}
        className="grid h-full w-full max-w-md content-center grid-cols-1 gap-4 border-2 border-[#0D0D0D] bg-[#D8E4E6] p-5 shadow-[4px_4px_0px_0px_#0D0D0D] md:max-w-2xl md:grid-cols-2 md:gap-5 md:p-8 lg:max-w-5xl lg:items-center lg:gap-8 lg:p-10"
      >
        {/* Modelo 3D con Paleta Vertical Lateral en el lado izquierdo */}
        <div ref={addToRefs} className="relative flex h-40 w-full items-center justify-center overflow-hidden md:col-span-2 md:h-52 lg:col-span-1 lg:col-start-1 lg:row-start-1 lg:row-span-2 lg:h-full lg:min-h-[240px]">
          
          {/* Paleta Vertical de los 8 Colores */}
          <div className="absolute left-2 top-1/2 z-20 flex -translate-y-1/2 flex-col gap-1.5 rounded border-2 border-[#0D0D0D] bg-[#0D0D0D]/70 p-1.5 backdrop-blur-sm">
            {PALETA_COLORES.map((c) => (
              <button
                key={c.id}
                onClick={() => handleSeleccionarColor(c.id)}
                title={c.nombre}
                style={{ backgroundColor: c.hex }}
                className={`h-4 w-4 rounded-sm border border-[#0D0D0D] transition-transform sm:h-5 sm:w-5 ${
                  selectedColor === c.id
                    ? 'scale-125 border-2 border-white shadow-[0_0_6px_rgba(255,255,255,0.8)]'
                    : 'opacity-80 hover:scale-110 hover:opacity-100'
                }`}
              />
            ))}
          </div>

          <CarCanvas colorIndex={selectedColor} />
        </div>

        {/* Big Banner */}
        <div ref={addToRefs} className="voxel-grid-surface flex h-full w-full items-center justify-center border-2 border-[#0D0D0D] bg-[#0D0D0D] p-6 text-center text-4xl font-black uppercase tracking-widest text-white md:col-span-2 md:text-5xl lg:col-span-1 lg:col-start-1 lg:row-start-3 lg:row-span-3 lg:text-6xl">
          VOXEL DRIFT
        </div>

        {/* Main Buttons */}
        <button 
          ref={addToRefs}
          onClick={() => navigate('/niveles')}
          className={`button-primary flex w-full items-center justify-center gap-2 p-4 font-bold tracking-widest uppercase md:text-lg lg:col-start-2 lg:row-start-1 ${buttonPressStyle}`}
        >
          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 4l12 6-12 6z" />
          </svg>
          JUGAR
        </button>

        <button 
          ref={addToRefs}
          onClick={() => navigate('/perfil')}
          className={`button-secondary flex w-full items-center justify-center gap-2 p-4 font-bold tracking-widest uppercase md:text-lg lg:col-start-2 lg:row-start-2 ${buttonPressStyle}`}
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          PERFIL
        </button>

        <button 
          ref={addToRefs}
          onClick={() => navigate('/configuracion')}
          className={`button-secondary flex w-full items-center justify-center gap-2 p-4 font-bold tracking-widest uppercase md:col-span-2 md:text-lg lg:col-span-1 lg:col-start-2 lg:row-start-3 ${buttonPressStyle}`}
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          CONFIGURACIÓN
        </button>

        {/* Separator */}
        <div ref={addToRefs} className="my-2 flex w-full items-center gap-4 md:col-span-2 lg:col-span-1 lg:col-start-2 lg:row-start-4">
          <div className="flex-1 border-b-2 border-dashed border-[#0D0D0D]"></div>
          <span className="text-sm font-bold uppercase tracking-widest text-[#0D0D0D]">MÁS</span>
          <div className="flex-1 border-b-2 border-dashed border-[#0D0D0D]"></div>
        </div>

        {/* Bottom Grid */}
        <div ref={addToRefs} className="grid w-full grid-cols-2 gap-4 md:col-span-2 lg:col-span-1 lg:col-start-2 lg:row-start-5">
          <button 
            className={`button-secondary flex flex-col items-center justify-center gap-2 p-3 text-sm font-bold tracking-widest uppercase ${buttonPressStyle}`}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            CRÉDITOS
          </button>

          <button 
            onClick={() => navigate('/tutorial')}
            className={`button-secondary flex flex-col items-center justify-center gap-2 p-3 text-sm font-bold tracking-widest uppercase ${buttonPressStyle}`}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            TUTORIAL
          </button>
        </div>

      </div>
    </div>
  );
};

export default Inicio;