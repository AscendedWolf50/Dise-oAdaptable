import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { useAppNavigation } from '../../utils/useAppNavigation.js';

// IMPORTACIONES DE FIREBASE
import { doc, setDoc, increment, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase/config.js';
import { onAuthStateChanged } from 'firebase/auth';

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

const formatearTiempo = (totalSegundos) => {
  const horas = Math.floor(totalSegundos / 3600);
  const minutos = Math.floor((totalSegundos % 3600) / 60);
  return `${horas}h ${minutos}m`;
};

// FUNCIÓN PERSISTENTE GLOBAL: Se ejecuta al recibir señal de Unity
window.ReactBridge_GuardarProgreso = async (jsonString) => {
  try {
    let parsedData = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
    
    // 1. Guardar en localStorage
    localStorage.setItem('VoxelDriftProgress', typeof jsonString === 'string' ? jsonString : JSON.stringify(jsonString));

    // 2. Actualizar caché de usuario local
    const userCached = localStorage.getItem('VoxelDriftUser');
    if (userCached) {
      try {
        const parsedUser = JSON.parse(userCached);
        parsedUser.progress = parsedData;
        localStorage.setItem('VoxelDriftUser', JSON.stringify(parsedUser));
      } catch (e) {}
    }

    // 3. Guardar en Firestore garantizando persistencia con merge: true
    const user = await getCurrentUser();
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, { progress: parsedData }, { merge: true });
      console.log("¡Progreso del juego guardado con éxito en Firestore!");
    }
  } catch (e) {
    console.error("Error al sincronizar progreso con Firestore:", e);
  }
};

export default function Gameplay() {
  const navigate = useAppNavigation();
  const location = useLocation();

  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  // Referencia directa al canvas donde se renderizará Unity
  const unityCanvasRef = useRef(null);

  const startTimeRef = useRef(Date.now());
  const hasHandledFailureRef = useRef(false);

  const acumularTiempoYGuardar = async () => {
    if (!startTimeRef.current) return;
    
    const segundosJugados = Math.floor((Date.now() - startTimeRef.current) / 1000);
    startTimeRef.current = Date.now();

    if (segundosJugados <= 0) return;

    try {
      const user = await getCurrentUser();
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        
        let totalSegundosPrevios = 0;
        if (userSnap.exists()) {
          totalSegundosPrevios = userSnap.data().playedSeconds || 0;
        }

        const nuevoTotalSegundos = totalSegundosPrevios + segundosJugados;
        const nuevoTiempoFormateado = formatearTiempo(nuevoTotalSegundos);

        await setDoc(userRef, {
          playedSeconds: nuevoTotalSegundos,
          playedTime: nuevoTiempoFormateado
        }, { merge: true });

        const userCached = localStorage.getItem('VoxelDriftUser');
        if (userCached) {
          const parsedUser = JSON.parse(userCached);
          parsedUser.playedSeconds = nuevoTotalSegundos;
          parsedUser.playedTime = nuevoTiempoFormateado;
          localStorage.setItem('VoxelDriftUser', JSON.stringify(parsedUser));
        }
      }
    } catch (e) {
      console.error("Error al actualizar tiempo en Firestore:", e);
    }
  };

  // Lógica de comunicación con Unity (Escuchando a Unity)
  useEffect(() => {
    hasHandledFailureRef.current = false;

    window.ReactBridge_AbrirPausa = () => {
      console.log("Unity solicitó abrir la pausa");
      navigate('/pausa');
    };

    window.ReactBridge_NivelCompletado = async (estrellas) => {
      console.log("Unity finalizó el nivel con estrellas:", estrellas);
      await acumularTiempoYGuardar();
      navigate('/victoria', { state: { estrellasTotales: estrellas } });
    };

    window.ReactBridge_NivelFallido = async () => {
      if (hasHandledFailureRef.current) return;
      hasHandledFailureRef.current = true;

      await acumularTiempoYGuardar();

      try {
        const user = await getCurrentUser();
        if (user) {
          const userRef = doc(db, 'users', user.uid);
          await setDoc(userRef, {
            failedAttempts: increment(1)
          }, { merge: true });

          const userCached = localStorage.getItem('VoxelDriftUser');
          if (userCached) {
            const parsedUser = JSON.parse(userCached);
            parsedUser.failedAttempts = (parsedUser.failedAttempts || 0) + 1;
            localStorage.setItem('VoxelDriftUser', JSON.stringify(parsedUser));
          }
        }
      } catch (e) {
        console.error("Error al actualizar intentos fallidos en Firestore:", e);
      }

      navigate('/derrota');
    };

    return () => {
      acumularTiempoYGuardar();
      delete window.ReactBridge_AbrirPausa;
      delete window.ReactBridge_NivelCompletado;
      delete window.ReactBridge_NivelFallido;
    };
  }, [navigate]);

  // Carga dinámica de Unity WebGL
  useEffect(() => {
    const base = import.meta.env.BASE_URL.endsWith('/') 
      ? import.meta.env.BASE_URL 
      : `${import.meta.env.BASE_URL}/`;

    const buildUrl = `${base}BuildVoxelDrift/Build`;
    const loaderUrl = `${buildUrl}/BuildVoxelDrift.loader.js`;

    const config = {
      arguments: [],
      dataUrl: `${buildUrl}/BuildVoxelDrift.data.unityweb`,
      frameworkUrl: `${buildUrl}/BuildVoxelDrift.framework.js.unityweb`,
      codeUrl: `${buildUrl}/BuildVoxelDrift.wasm.unityweb`,
      streamingAssetsUrl: "StreamingAssets",
      companyName: "DefaultCompany",
      productName: "VoxelDrift",
      productVersion: "0.1.0",
      devicePixelRatio: window.devicePixelRatio || 1,
    };

    let script = document.querySelector(`script[src="${loaderUrl}"]`);

    const inicializarUnity = () => {
      if (window.createUnityInstance && unityCanvasRef.current) {
        window.createUnityInstance(unityCanvasRef.current, config, (progreso) => {})
        .then((unityInstance) => {
          window.unityInstance = unityInstance;
          console.log("¡Unity WebGL cargado con éxito!");

          const nivelSeleccionado = location.state?.nivelSeleccionado;
          if (nivelSeleccionado !== undefined && nivelSeleccionado !== 0) {
            setTimeout(() => {
              unityInstance.SendMessage('WebBridge', 'CargarNivelDesdeWeb', nivelSeleccionado);
            }, 100);
          }
        })
        .catch((error) => {
          console.error("Error al instanciar el canvas de Unity:", error);
        });
      }
    };

    if (!script) {
      script = document.createElement("script");
      script.src = loaderUrl;
      script.async = true;
      script.onload = inicializarUnity;
      document.body.appendChild(script);
    } else if (window.createUnityInstance) {
      inicializarUnity();
    } else {
      script.addEventListener('load', inicializarUnity);
    }

    return () => {
      if (script) {
        script.removeEventListener('load', inicializarUnity);
      }
      if (window.unityInstance) {
        try {
          window.unityInstance.SendMessage('WebBridge', 'PausarJuego');
          if (typeof window.unityInstance.Quit === 'function') {
            window.unityInstance.Quit().then(() => {
              window.unityInstance = null;
            }).catch(() => {
              window.unityInstance = null;
            });
          } else {
            window.unityInstance = null;
          }
        } catch (e) {
          console.error("Error al limpiar la instancia de Unity:", e);
        }
      }
    };
  }, []);

  // Animaciones GSAP
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(containerRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.5,
        ease: 'power3.out'
      });

      gsap.from(canvasRef.current, {
        opacity: 0,
        scale: 0.95,
        duration: 0.6,
        delay: 0.2,
        ease: 'power2.out'
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="flex h-full min-h-0 justify-center bg-[#1B384B] p-4 font-sans selection:bg-[#FF7800] selection:text-white lg:p-0">
      
      {/* Mensaje obligatorio para girar el dispositivo en celulares/tablets en posición vertical */}
      <div className="fixed inset-0 z-50 hidden portrait:flex flex-col items-center justify-center bg-[#1B384B] p-6 text-center text-white">
        <svg className="mb-6 h-20 w-20 animate-pulse text-[#FF7800]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <h2 className="mb-2 text-2xl font-black uppercase tracking-widest text-[#FF7800]">Gira tu dispositivo</h2>
        <p className="text-lg text-gray-300">Este juego requiere que juegues en modo horizontal.</p>
      </div>

      {/* Contenedor Principal */}
      <div 
        ref={containerRef}
        className="relative flex portrait:hidden h-[min(70dvh,640px)] min-h-[420px] w-full max-w-md flex-col overflow-hidden border-2 border-[#0D0D0D] bg-[#1B384B] shadow-[4px_4px_0px_0px_#0D0D0D] md:h-[min(76dvh,760px)] md:max-w-2xl lg:h-full lg:min-h-0 lg:max-w-none"
      >
        
        {/* Área del Canvas del Juego */}
        <div ref={canvasRef} className="relative z-0 flex min-h-0 flex-1 w-full items-center justify-center overflow-hidden bg-[#1B384B]">
          <canvas 
            ref={unityCanvasRef}
            id="unity-canvas" 
            className="block h-full w-full object-contain"
            tabIndex={-1}
          />
        </div>

      </div>
    </div>
  );
}