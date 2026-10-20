import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import LevelCard from '../../components/ui/LevelCard.jsx';

// CONFIGURACIÓN: Cambia este número según la cantidad de niveles reales
const TOTAL_NIVELES_EN_BUILD = 10; 
const OFFSET_ESCENAS_UNITY = -1; // <-- EL DESFASE: Nivel 1 = Escena 0, Nivel 2 = Escena 1

const SelectorNiveles = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const cardsRef = useRef([]);
  const [levels, setLevels] = useState([]);

  useEffect(() => {
    // 1. Leer el progreso guardado
    const progresoGuardado = localStorage.getItem('VoxelDriftProgress');
    let nivelesCompletados = [];
    
    if (progresoGuardado) {
      try {
        const data = JSON.parse(progresoGuardado);
        nivelesCompletados = data.niveles || [];
      } catch (e) {
        console.error("Error al leer el progreso", e);
      }
    }

    // 2. Construir la lista dinámica
    const nivelesGenerados = [];
    let nivelAnteriorCompletado = true;

    for (let i = 1; i <= TOTAL_NIVELES_EN_BUILD; i++) {
      
      const progresoNivel = nivelesCompletados.find(n => {
        if (!n.idNivel) return false;
        const numId = parseInt(String(n.idNivel).replace(/\D/g, ''), 10);
        return numId === i;
      });

      let status = 'locked';
      let stars = 0;

      if (progresoNivel && progresoNivel.estrellaCompletado) {
        status = 'completed';
        stars += progresoNivel.estrellaCompletado ? 1 : 0;
        stars += progresoNivel.estrellaTiempo ? 1 : 0;
        stars += progresoNivel.estrellaPuntos ? 1 : 0;
        nivelAnteriorCompletado = true;
      } else if (nivelAnteriorCompletado) {
        status = 'current';
        nivelAnteriorCompletado = false;
      }

      nivelesGenerados.push({
        id: i,
        number: i.toString().padStart(2, '0'),
        stars: stars,
        status: status
      });
    }

    setLevels(nivelesGenerados);
  }, []);

  useEffect(() => {
    if (levels.length > 0) {
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
    }
  }, [levels]);

  const handleLevelClick = (level) => {
    if (level.status === 'completed' || level.status === 'current') {
      // Aplicamos el desfase antes de navegar
      const indiceEscenaUnity = level.id + OFFSET_ESCENAS_UNITY;
      navigate('/gameplay', { state: { nivelSeleccionado: indiceEscenaUnity } });
    }
  };

  const totalStars = levels.reduce((sum, lvl) => sum + lvl.stars, 0);
  const completedCount = levels.filter(l => l.status === 'completed').length;

  return (
    <div className="flex h-full min-h-full w-full items-center justify-center bg-[#1B384B] p-4 font-sans uppercase tracking-widest text-[#0D0D0D] lg:p-6">
      <div
        ref={containerRef}
        className="w-full max-w-md overflow-hidden border-2 border-[#0D0D0D] bg-[#8BA3A7] p-5 shadow-[4px_4px_0px_0px_#0D0D0D] md:max-w-2xl md:p-7 lg:grid lg:max-w-5xl lg:grid-cols-12 lg:gap-6 lg:p-8"
      >
        {/* Header row */}
        <div className="mb-6 flex items-center gap-3 lg:col-span-12 lg:mb-0">
          <button onClick={() => navigate('/')} className="button-secondary px-3 py-1 text-xs font-bold transition-all">
            ← VOLVER
          </button>
          <h1 className="font-bold text-sm sm:text-base tracking-tighter">ELIGE EL SIGUIENTE NIVEL</h1>
        </div>

        {/* Stats bar */}
        <div className="mb-6 flex items-center justify-between lg:col-span-3 lg:mb-0 lg:flex-col lg:items-stretch lg:justify-center lg:gap-8 lg:border-2 lg:border-[#0D0D0D] lg:p-6">
          <div className="voxel-grid-surface bg-[#0D0D0D] px-3 py-1 text-sm font-bold text-white">
            {completedCount}/{TOTAL_NIVELES_EN_BUILD} NIVELES
          </div>
          <div className="font-bold text-lg text-[#FF7800]">
            ★ {totalStars}
          </div>
        </div>

        {/* Level Grid Area */}
        <div className="max-h-[60vh] overflow-y-auto scroll-smooth pb-2 pr-1 md:max-h-[70vh] lg:col-span-9 lg:max-h-[65vh]">
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 lg:gap-4">
            {levels.map((level, index) => {
              const isFirstLocked = level.status === 'locked' && levels[index - 1]?.status !== 'locked';
              return (
                <LevelCard
                  key={level.id}
                  level={level}
                  isFirstLocked={isFirstLocked}
                  onClick={handleLevelClick}
                  ref={(el) => (cardsRef.current[index] = el)}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectorNiveles;