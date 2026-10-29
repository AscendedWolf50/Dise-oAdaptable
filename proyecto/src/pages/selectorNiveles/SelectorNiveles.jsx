import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import LevelCard from '../../components/ui/LevelCard.jsx';

// IMPORTACIONES DE FIREBASE
import { auth, db } from '../../firebase/config.js';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const TOTAL_NIVELES_EN_BUILD = 10; 
const OFFSET_ESCENAS_UNITY = -1; 

const getCurrentUser = () => {
  return new Promise((resolve) => {
    if (auth.currentUser) {
      resolve(auth.currentUser);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

// Extraer el array de niveles de cualquier formato (JSON o Objeto)
const extraerNiveles = (raw) => {
  if (!raw) return [];
  let prog = raw;
  if (typeof prog === 'string') {
    try { prog = JSON.parse(prog); } catch(e) { return []; }
  }
  if (prog && Array.isArray(prog.niveles)) return prog.niveles;
  if (Array.isArray(prog)) return prog;
  return [];
};

// Función para fusionar progreso local y remoto manteniendo los mejores resultados
const fusionarNiveles = (listaA, listaB) => {
  const mapa = new Map();

  const procesarItem = (item) => {
    if (!item || item.idNivel === undefined || item.idNivel === null) return;
    const strId = String(item.idNivel).trim();
    const numId = parseInt(strId.replace(/\D/g, ''), 10);
    if (isNaN(numId)) return;

    const existente = mapa.get(numId);
    if (!existente) {
      mapa.set(numId, { ...item, numId });
    } else {
      // Unir estrellas y conservar el mejor tiempo
      const estrellaCompletado = Boolean(existente.estrellaCompletado || item.estrellaCompletado);
      const estrellaTiempo = Boolean(existente.estrellaTiempo || item.estrellaTiempo);
      const estrellaPuntos = Boolean(existente.estrellaPuntos || item.estrellaPuntos);

      let mejorTiempo = existente.mejorTiempo || 999999;
      if (item.mejorTiempo && item.mejorTiempo > 0 && item.mejorTiempo < mejorTiempo) {
        mejorTiempo = item.mejorTiempo;
      }

      const ghostData = item.ghostData || existente.ghostData || null;

      mapa.set(numId, {
        ...existente,
        ...item,
        numId,
        estrellaCompletado,
        estrellaTiempo,
        estrellaPuntos,
        mejorTiempo,
        ghostData
      });
    }
  };

  listaA.forEach(procesarItem);
  listaB.forEach(procesarItem);

  return Array.from(mapa.values());
};

const SelectorNiveles = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const cardsRef = useRef([]);
  const [levels, setLevels] = useState([]);

  useEffect(() => {
    const obtenerProgreso = async () => {
      // 1. Cargar datos del almacenamiento local (Caché reciente de Unity)
      let nivelesLocal = [];
      const progresoLocalRaw = localStorage.getItem('VoxelDriftProgress');
      if (progresoLocalRaw) {
        nivelesLocal = extraerNiveles(progresoLocalRaw);
      }

      // 2. Cargar datos de Firestore
      let nivelesFirestore = [];
      let currentUser = null;
      try {
        currentUser = await getCurrentUser();
        if (currentUser) {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            nivelesFirestore = extraerNiveles(data.progress);
          }
        }
      } catch (e) {
        console.error("Error al obtener progreso de Firestore en SelectorNiveles:", e);
      }

      // 3. Fusionar ambas fuentes conservando el progreso máximo
      const nivelesCompletados = fusionarNiveles(nivelesLocal, nivelesFirestore);

      // 4. Actualizar las fuentes para mantenerlas 100% sincronizadas
      const estructuraProgreso = { niveles: nivelesCompletados };
      localStorage.setItem('VoxelDriftProgress', JSON.stringify(estructuraProgreso));

      if (currentUser && nivelesCompletados.length > 0) {
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          await setDoc(userRef, { progress: estructuraProgreso }, { merge: true });
        } catch (e) {
          console.error("Error al sincronizar datos fusionados en Firestore:", e);
        }
      }

      // 5. Generar la lista de niveles con mapeo numérico estricto 1:1
      const nivelesGenerados = [];
      let nivelAnteriorCompletado = true;

      for (let i = 1; i <= TOTAL_NIVELES_EN_BUILD; i++) {
        const progresoNivel = nivelesCompletados.find(n => n.numId === i);

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
    };

    obtenerProgreso();
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
      const indiceEscenaUnity = level.id + OFFSET_ESCENAS_UNITY;
      navigate('/gameplay', { state: { nivelSeleccionado: indiceEscenaUnity } });
    }
  };

  const totalStars = levels.reduce((sum, lvl) => sum + lvl.stars, 0);
  const completedCount = levels.filter(l => l.status === 'completed').length;

  return (
    <div className="flex h-full min-h-full w-full items-center justify-center bg-[#142A3A] p-4 font-sans uppercase tracking-widest text-[#0D0D0D] lg:p-6">
      <div
        ref={containerRef}
        className="w-full max-w-md overflow-hidden border-2 border-[#0D0D0D] bg-[#D8E4E6] p-5 shadow-[4px_4px_0px_0px_#0D0D0D] md:max-w-2xl md:p-7 lg:grid lg:max-w-5xl lg:grid-cols-12 lg:gap-6 lg:p-8"
      >
        <div className="mb-6 flex items-center gap-3 lg:col-span-12 lg:mb-0">
          <button onClick={() => navigate('/')} className="button-secondary px-3 py-1 text-xs font-bold transition-all">
            ← VOLVER
          </button>
          <h1 className="font-bold text-sm sm:text-base tracking-tighter">ELIGE EL SIGUIENTE NIVEL</h1>
        </div>

        <div className="mb-6 flex items-center justify-between lg:col-span-3 lg:mb-0 lg:flex-col lg:items-stretch lg:justify-center lg:gap-8 lg:border-2 lg:border-[#0D0D0D] lg:p-6">
          <div className="voxel-grid-surface bg-[#0D0D0D] px-3 py-1 text-sm font-bold text-white">
            {completedCount}/{TOTAL_NIVELES_EN_BUILD} NIVELES
          </div>
          <div className="font-bold text-lg text-[#963C00]">
            ★ {totalStars}
          </div>
        </div>

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