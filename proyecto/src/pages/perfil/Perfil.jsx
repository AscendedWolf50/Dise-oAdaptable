import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import profileData from '../../data/playerProfile.json';
import { gsapButtonMotion } from '../../utils/gsapButtonMotion.js';
import ModalOverlay from '../../components/ui/ModalOverlay.jsx';

// IMPORTACIONES DE FIREBASE
import { auth, db } from '../../firebase/config.js';
import { doc, getDoc } from 'firebase/firestore';
import { signOut, onAuthStateChanged } from 'firebase/auth';

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

export default function Perfil() {
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const cargarDatosPerfil = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserData(data);
            localStorage.setItem('VoxelDriftUser', JSON.stringify(data));
            if (data.progress) {
              localStorage.setItem('VoxelDriftProgress', JSON.stringify(data.progress));
            }
            return;
          }
        }
        
        const userCached = localStorage.getItem('VoxelDriftUser');
        if (userCached) {
          setUserData(JSON.parse(userCached));
        }
      } catch (error) {
        console.error("Error al obtener datos del perfil:", error);
      }
    };

    cargarDatosPerfil();
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(containerRef.current, {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: 'power3.out',
      });

      gsap.from('[data-profile-enter]', { 
        opacity: 0, 
        y: 16, 
        stagger: 0.08, 
        duration: 0.42, 
        ease: 'power2.out', 
        delay: 0.12 
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('VoxelDriftProgress');
      localStorage.removeItem('VoxelDriftUser');
      navigate('/login');
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const TOTAL_NIVELES = 10;
  const TOTAL_ESTRELLAS_POSIBLES = TOTAL_NIVELES * 3; 

  let niveles = [];
  if (userData && userData.progress) {
    let prog = userData.progress;
    if (typeof prog === 'string') {
      try { prog = JSON.parse(prog); } catch(e) {}
    }
    if (prog && Array.isArray(prog.niveles)) {
      niveles = prog.niveles;
    }
  }

  if (niveles.length === 0) {
    const progresoLocalRaw = localStorage.getItem('VoxelDriftProgress');
    if (progresoLocalRaw) {
      try {
        let parsed = JSON.parse(progresoLocalRaw);
        if (typeof parsed === 'string') parsed = JSON.parse(parsed);
        if (parsed && Array.isArray(parsed.niveles)) {
          niveles = parsed.niveles;
        }
      } catch (e) {}
    }
  }

  const completedLevels = niveles.filter(n => n.estrellaCompletado).length;

  let stars = 0;
  niveles.forEach(n => {
    if (n.estrellaCompletado) stars += 1;
    if (n.estrellaTiempo) stars += 1;
    if (n.estrellaPuntos) stars += 1;
  });

  const username = userData?.username || profileData.username;
  const joinDate = userData?.joinDate || profileData.joinDate;
  const failedAttempts = userData?.failedAttempts ?? 0;
  const playedTime = userData?.playedTime || "0h 0m";
  const currentStreak = userData?.currentStreak || profileData.currentStreak;

  const completionPercent = Math.round((completedLevels / TOTAL_NIVELES) * 100);

  return (
    <ModalOverlay title="PERFIL">
      <div ref={containerRef} className="flex flex-col gap-3 font-sans text-[#0D0D0D] md:gap-4 lg:grid lg:grid-cols-2 lg:items-start lg:gap-6">
        
        <div data-profile-enter className="flex items-center justify-between gap-2 lg:col-span-2">
          <button 
            {...gsapButtonMotion}
            onClick={handleLogout}
            className="button-primary px-3 py-1.5 text-xs font-black uppercase tracking-widest transition-all"
          >
            CERRAR SESIÓN
          </button>

          <button 
            {...gsapButtonMotion} 
            aria-label="Compartir perfil" 
            onClick={() => { navigator.clipboard?.writeText(window.location.href); setCopied(true); }} 
            className="button-secondary ml-auto px-3 py-2 font-bold"
          >
            {copied ? '✓' : '↗'}
          </button>
        </div>

        <div data-profile-enter className="border-2 border-[#0D0D0D] p-3 lg:col-start-1 lg:row-start-2 lg:row-span-2">
          <div className="flex items-center gap-4">
            <div aria-hidden="true" className="grid h-16 w-16 shrink-0 place-items-center border-2 border-[#0D0D0D] bg-[#1B384B] text-2xl font-black text-[#FF7800] shadow-[3px_3px_0px_0px_#0D0D0D]">
              {username.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <p className="font-black text-sm tracking-widest uppercase">{username}</p>
              <p className="mt-1 text-[10px] text-[#8BA3A7] tracking-widest uppercase">SE UNIÓ EL {joinDate}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:col-start-2 lg:row-start-2 lg:row-span-2 lg:gap-4">
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
                className="h-full bg-[#FF7800] transition-all duration-500"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
            <span className="mt-1 block text-[9px] font-bold tracking-widest text-[#8BA3A7]">
              {completedLevels} / {TOTAL_NIVELES} NIVELES
            </span>

            <div className="mb-1 mt-3 flex justify-between">
              <span className="text-xs font-bold tracking-widest uppercase">ESTRELLAS</span>
              <span className="text-xs font-bold">{stars}</span>
            </div>
            <div className="h-3 w-full border-2 border-[#0D0D0D] bg-white">
              <div 
                className="h-full bg-[#FF7800] transition-all duration-500" 
                style={{ width: `${Math.min(100, Math.round((stars / TOTAL_ESTRELLAS_POSIBLES) * 100))}%` }} 
              />
            </div>
            <span className="mt-1 block text-[9px] font-bold tracking-widest text-[#8BA3A7]">
              {stars} / {TOTAL_ESTRELLAS_POSIBLES} ESTRELLAS
            </span>
          </div>
        </div>

        <div data-profile-enter className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:col-span-2 lg:grid-cols-2 lg:gap-6">
          <div className="col-span-2 flex items-center gap-4 border-2 border-[#0D0D0D] p-3 shadow-[3px_3px_0px_0px_#0D0D0D] md:col-span-1 lg:col-span-1">
            <strong className="text-3xl font-black">{failedAttempts}</strong>
            <span className="text-[9px] font-bold leading-4 tracking-widest">☠<br />INTENTOS<br />FALLIDOS</span>
          </div>
          <div className="col-span-2 grid grid-cols-2 gap-3 lg:col-span-1">
            <div className="flex flex-col justify-center border-2 border-[#0D0D0D] p-3 shadow-[3px_3px_0px_0px_#0D0D0D]">
              <span className="text-[9px] font-bold tracking-widest text-[#8BA3A7]">TIEMPO JUGADO</span>
              <strong className="mt-1 text-lg font-black">{playedTime}</strong>
            </div>
            <div className="flex flex-col justify-center border-2 border-[#0D0D0D] p-3 shadow-[3px_3px_0px_0px_#0D0D0D]">
              <span className="text-[9px] font-bold tracking-widest text-[#8BA3A7]">RACHA ACTUAL</span>
              <strong className="mt-1 text-lg font-black">{currentStreak}</strong>
            </div>
          </div>
        </div>

      </div>
    </ModalOverlay>
  );
}