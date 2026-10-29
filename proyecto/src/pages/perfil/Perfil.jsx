import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { gsapButtonMotion } from '../../utils/gsapButtonMotion.js';
import ModalOverlay from '../../components/ui/ModalOverlay.jsx';

// IMPORTACIONES DE FIREBASE
import { auth, db } from '../../firebase/config.js';
import { doc, getDoc, setDoc } from 'firebase/firestore';
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

const MAX_NICKNAME_LENGTH = 18;

export default function Perfil() {
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [nickname, setNickname] = useState('');

  // Estados para controlar los modales de Opciones y Vista Previa
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);

  useEffect(() => {
    const cargarDatosPerfil = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserData(data);
            setNickname(data.nickname || '');
            localStorage.setItem('VoxelDriftUser', JSON.stringify(data));
            if (data.progress) {
              localStorage.setItem('VoxelDriftProgress', JSON.stringify(data.progress));
            }
            return;
          }
        }
        
        const userCached = localStorage.getItem('VoxelDriftUser');
        if (userCached) {
          const parsed = JSON.parse(userCached);
          setUserData(parsed);
          setNickname(parsed.nickname || '');
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

  // Guardar apodo en Firestore y LocalStorage
  const handleNicknameChange = (e) => {
    const val = e.target.value;
    if (val.length <= MAX_NICKNAME_LENGTH) {
      setNickname(val);
    }
  };

  const handleNicknameBlur = async () => {
    const updatedUserData = { ...userData, nickname };
    setUserData(updatedUserData);

    // Actualizar localStorage
    const userCached = localStorage.getItem('VoxelDriftUser');
    if (userCached) {
      try {
        const parsed = JSON.parse(userCached);
        parsed.nickname = nickname;
        localStorage.setItem('VoxelDriftUser', JSON.stringify(parsed));
      } catch (err) {}
    }

    // Actualizar Firestore
    try {
      const user = await getCurrentUser();
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, { nickname }, { merge: true });
        console.log("¡Apodo actualizado en Firestore!");
      }
    } catch (err) {
      console.error("Error al guardar el apodo:", err);
    }
  };

  // Función para procesar y guardar la nueva foto de perfil
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 256;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);

        // Update estado local de React
        setUserData((prev) => ({ ...prev, photoURL: compressedBase64 }));

        // Update localStorage
        const userCached = localStorage.getItem('VoxelDriftUser');
        if (userCached) {
          try {
            const parsed = JSON.parse(userCached);
            parsed.photoURL = compressedBase64;
            localStorage.setItem('VoxelDriftUser', JSON.stringify(parsed));
          } catch (err) {}
        }

        // Update en Firestore
        getCurrentUser().then(async (user) => {
          if (user) {
            try {
              const userRef = doc(db, 'users', user.uid);
              await setDoc(userRef, { photoURL: compressedBase64 }, { merge: true });
              console.log("¡Foto de perfil actualizada en Firestore!");
            } catch (err) {
              console.error("Error al guardar foto en Firestore:", err);
            }
          }
        });
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
    setShowAvatarMenu(false);
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

  const username = userData?.username || 'Jugador';
  const joinDate = userData?.joinDate || 'N/A';
  const photoURL = userData?.photoURL || null;
  const failedAttempts = userData?.failedAttempts ?? 0;
  const playedTime = userData?.playedTime || "0h 0m";

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

          {/* BOTÓN DE AMIGOS */}
          <button 
            {...gsapButtonMotion} 
            aria-label="Ver amigos" 
            onClick={() => navigate('/amigos')} 
            className="button-primary ml-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-black uppercase tracking-widest transition-all"
          >
            <span>👥</span>
            <span>AMIGOS</span>
          </button>
        </div>

        {/* Tarjeta de usuario con Foto de Perfil y Apodo Editable */}
        <div data-profile-enter className="border-2 border-[#0D0D0D] p-3 lg:col-start-1 lg:row-start-2 lg:row-span-2">
          <div className="flex items-center gap-4">
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              accept="image/*" 
              className="hidden" 
            />

            <button
              type="button"
              onClick={() => setShowAvatarMenu(true)}
              title="Opciones de foto de perfil"
              className="group relative grid h-16 w-16 shrink-0 place-items-center overflow-hidden border-2 border-[#0D0D0D] bg-[#142A3A] text-2xl font-black text-[#FF7800] shadow-[3px_3px_0px_0px_#0D0D0D] cursor-pointer focus:outline-none"
            >
              {photoURL ? (
                <img src={photoURL} alt={username} className="h-full w-full object-cover" />
              ) : (
                username.slice(0, 1).toUpperCase()
              )}

              <div className="absolute inset-0 flex items-center justify-center bg-[#0D0D0D]/70 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[9px] font-bold tracking-widest text-white uppercase">OPCIONES</span>
              </div>
            </button>

            <div className="flex flex-col min-w-0 flex-1">
              <p className="font-black text-sm tracking-widest uppercase truncate">{username}</p>
              
              <input
                type="text"
                maxLength={MAX_NICKNAME_LENGTH}
                placeholder="INGRESA TU APODO"
                value={nickname}
                onChange={handleNicknameChange}
                onBlur={handleNicknameBlur}
                onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
                className="mt-1 w-full bg-transparent text-[10px] font-bold tracking-widest uppercase text-[#0D0D0D] border-b border-dashed border-[#0D0D0D] focus:border-[#142A3A] focus:outline-none focus:ring-2 focus:ring-[#142A3A] placeholder:text-[#53636B] placeholder:font-bold"
                title="Haz clic para ingresar o cambiar tu apodo"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:col-start-2 lg:row-start-2 lg:row-span-2 lg:gap-4">
          <div data-profile-enter className="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em]">
            <span className="h-2 w-2 border border-[#0D0D0D]" />PROGRESO<span className="flex-1 border-t-2 border-dashed border-[#D8E4E6]" />
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
                className="h-full bg-[#F4A340] transition-all duration-500"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
            <span className="mt-1 block text-[9px] font-bold tracking-widest text-[#0D0D0D]">
              {completedLevels} / {TOTAL_NIVELES} NIVELES
            </span>

            <div className="mb-1 mt-3 flex justify-between">
              <span className="text-xs font-bold tracking-widest uppercase">ESTRELLAS</span>
              <span className="text-xs font-bold">{stars}</span>
            </div>
            <div className="h-3 w-full border-2 border-[#0D0D0D] bg-white">
              <div 
                className="h-full bg-[#F4A340] transition-all duration-500"
                style={{ width: `${Math.min(100, Math.round((stars / TOTAL_ESTRELLAS_POSIBLES) * 100))}%` }} 
              />
            </div>
            <span className="mt-1 block text-[9px] font-bold tracking-widest text-[#0D0D0D]">
              {stars} / {TOTAL_ESTRELLAS_POSIBLES} ESTRELLAS
            </span>
          </div>
        </div>

        <div data-profile-enter className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:col-span-2 lg:grid-cols-2 lg:gap-6">
          <div className="col-span-2 flex items-center gap-4 border-2 border-[#0D0D0D] p-3 shadow-[3px_3px_0px_0px_#0D0D0D] md:col-span-1 lg:col-span-1">
            <strong className="text-3xl font-black">{failedAttempts}</strong>
            <span className="flex flex-col text-xs font-black leading-tight tracking-widest uppercase text-[#0D0D0D]">
              <span className="text-base font-black">☠</span>
              INTENTOS FALLIDOS
            </span>
          </div>

          <div className="col-span-2 grid grid-cols-2 gap-3 lg:col-span-1">
            <div className="flex flex-col justify-center border-2 border-[#0D0D0D] p-3 shadow-[3px_3px_0px_0px_#0D0D0D]">
              <span className="text-[10px] font-black tracking-widest text-[#0D0D0D] uppercase">TIEMPO JUGADO</span>
              <strong className="mt-1 text-lg font-black text-[#0D0D0D]">{playedTime}</strong>
            </div>
            <div className="flex min-w-0 flex-col justify-center border-2 border-[#0D0D0D] p-2.5 sm:p-3 shadow-[3px_3px_0px_0px_#0D0D0D]">
              <span className="text-[10px] font-black tracking-widest text-[#0D0D0D] uppercase truncate">FECHA DE REGISTRO</span>
              <strong className="mt-1 text-xs sm:text-sm md:text-lg font-black tracking-normal sm:tracking-widest text-[#0D0D0D] truncate">{joinDate}</strong>
            </div>
          </div>

        </div>

      </div>

      {/* MODAL CON OPCIONES DE FOTO DE PERFIL */}
      {showAvatarMenu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D0D0D]/70 p-4">
          <div className="w-full max-w-xs border-2 border-[#0D0D0D] bg-[#D8E4E6] p-4 shadow-[4px_4px_0px_0px_#0D0D0D] font-sans">
            <div className="mb-3 flex items-center justify-between border-b-2 border-[#0D0D0D] pb-2">
              <span className="text-xs font-black uppercase tracking-widest text-[#0D0D0D]">
                FOTO DE PERFIL
              </span>
              <button 
                onClick={() => setShowAvatarMenu(false)}
                className="text-sm font-black text-[#0D0D0D] hover:text-[#963C00]"
              >
                ✕
              </button>
            </div>
            
            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setShowAvatarMenu(false);
                  setShowImagePreview(true);
                }}
                className="button-secondary w-full py-2 text-xs font-black uppercase tracking-widest transition-all"
              >
                VER FOTO DE PERFIL
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowAvatarMenu(false);
                  fileInputRef.current?.click();
                }}
                className="button-primary w-full py-2 text-xs font-black uppercase tracking-widest transition-all"
              >
                CAMBIAR FOTO DE PERFIL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE VISTA PREVIA / AMPLIAR FOTO */}
      {showImagePreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D0D0D]/80 p-4">
          <div className="relative flex w-full max-w-sm flex-col items-center gap-4 border-2 border-[#0D0D0D] bg-[#D8E4E6] p-5 shadow-[4px_4px_0px_0px_#0D0D0D] font-sans">
            <div className="flex w-full items-center justify-between border-b-2 border-[#0D0D0D] pb-2">
              <span className="text-xs font-black uppercase tracking-widest text-[#0D0D0D]">
                {username}
              </span>
              <button 
                onClick={() => setShowImagePreview(false)}
                className="text-sm font-black text-[#0D0D0D] hover:text-[#963C00]"
              >
                ✕
              </button>
            </div>

            <div className="my-2 flex justify-center w-full">
              {photoURL ? (
                <img 
                  src={photoURL} 
                  alt={username} 
                  className="max-h-64 w-64 border-2 border-[#0D0D0D] object-cover shadow-[3px_3px_0px_0px_#0D0D0D]" 
                />
              ) : (
                <div className="grid h-40 w-40 place-items-center border-2 border-[#0D0D0D] bg-[#142A3A] text-6xl font-black text-[#FF7800] shadow-[3px_3px_0px_0px_#0D0D0D]">
                  {username.slice(0, 1).toUpperCase()}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowImagePreview(false)}
              className="button-primary w-full py-2 text-xs font-black uppercase tracking-widest transition-all"
            >
              CERRAR
            </button>
          </div>
        </div>
      )}
    </ModalOverlay>
  );
}