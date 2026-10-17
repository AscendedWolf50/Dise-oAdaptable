import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useAppNavigation } from '../../utils/useAppNavigation.js';

export default function Gameplay() {
  const navigate = useAppNavigation();
  const [timeLeft, setTimeLeft] = useState(102); // 102 segundos = 01:42
  const progress = 62;
  const level = 22;

  const containerRef = useRef(null);
  const hudRef = useRef(null);
  const canvasRef = useRef(null);
  const controlsRef = useRef(null);

  // Referencia directa al canvas donde se renderizará Unity
  const unityCanvasRef = useRef(null);

  // Lógica del temporizador
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Lógica de comunicación con Unity (Escuchando a Unity)
  useEffect(() => {
    window.ReactBridge_AbrirPausa = () => {
      console.log("Unity solicitó abrir la pausa");
      navigate('/pausa');
    };

    window.ReactBridge_NivelCompletado = (estrellas) => {
      console.log("Unity finalizó el nivel con estrellas:", estrellas);
    };

    return () => {
      delete window.ReactBridge_AbrirPausa;
      delete window.ReactBridge_NivelCompletado;
    };
  }, [navigate]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Carga dinámica de Unity WebGL
  useEffect(() => {
    const base = import.meta.env.BASE_URL.endsWith('/') 
      ? import.meta.env.BASE_URL 
      : `${import.meta.env.BASE_URL}/`;

    const buildUrl = `${base}BuildVoxelDrift/Build`;
    const loaderUrl = `${buildUrl}/BuildVoxelDrift.loader.js`;

    // Si tu build en disco todavía usa compresión, cambia las extensiones a .data.unityweb, etc.
    const config = {
      arguments: [],
      dataUrl: `${buildUrl}/BuildVoxelDrift.data`,
      frameworkUrl: `${buildUrl}/BuildVoxelDrift.framework.js`,
      codeUrl: `${buildUrl}/BuildVoxelDrift.wasm`,
      streamingAssetsUrl: "StreamingAssets",
      companyName: "DefaultCompany",
      productName: "VoxelDrift",
      productVersion: "0.1.0",
    };

    let script = document.querySelector(`script[src="${loaderUrl}"]`);

    const inicializarUnity = () => {
      if (window.createUnityInstance && unityCanvasRef.current) {
        window.createUnityInstance(unityCanvasRef.current, config, (progreso) => {
          // Opcional: progreso de carga
        })
        .then((unityInstance) => {
          window.unityInstance = unityInstance;
          console.log("¡Unity WebGL cargado con éxito!");
        })
        .catch((error) => {
          console.error("Error al instanciar el canvas de Unity:", error);
        });
      }
    };

    // Manejo correcto de carga síncrona/asíncrona del script
    if (!script) {
      script = document.createElement("script");
      script.src = loaderUrl;
      script.async = true;
      script.onload = inicializarUnity;
      document.body.appendChild(script);
    } else if (window.createUnityInstance) {
      // Si el script ya existía y ya terminó de cargar
      inicializarUnity();
    } else {
      // Si el script existe en el DOM pero aún está en proceso de descarga
      script.addEventListener('load', inicializarUnity);
    }

    return () => {
      if (script) {
        script.removeEventListener('load', inicializarUnity);
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

      gsap.from(hudRef.current, {
        opacity: 0,
        y: -30,
        duration: 0.6,
        delay: 0.2,
        ease: 'back.out(1.7)'
      });

      gsap.from(canvasRef.current, {
        opacity: 0,
        scale: 0.95,
        duration: 0.6,
        delay: 0.4,
        ease: 'power2.out'
      });

      if (controlsRef.current) {
        gsap.from(controlsRef.current.children, {
          opacity: 0,
          y: 30,
          duration: 0.5,
          stagger: 0.1,
          delay: 0.5,
          ease: 'back.out(1.5)'
        });
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="flex h-full min-h-0 justify-center bg-[#1B384B] p-4 font-sans selection:bg-[#FF7800] selection:text-white lg:p-0">
      {/* Contenedor Principal */}
      <div 
        ref={containerRef}
        className="relative flex h-[min(70dvh,640px)] min-h-[420px] w-full max-w-md flex-col overflow-hidden border-2 border-[#0D0D0D] bg-[#8BA3A7] shadow-[4px_4px_0px_0px_#0D0D0D] md:h-[min(76dvh,760px)] md:max-w-2xl lg:h-full lg:min-h-0 lg:max-w-none"
      >
        {/* Área HUD */}
        <div ref={hudRef} className="relative z-10 flex shrink-0 flex-col gap-3 bg-[#8BA3A7] p-4 shadow-[0px_4px_0px_0px_#0D0D0D] lg:flex-row lg:items-center lg:justify-between lg:gap-8 lg:px-8 lg:py-3">
          {/* Fila 1: Pausa, Progreso */}
          <div className="flex items-center gap-3 lg:flex-1">
            <button 
              onClick={() => {
                if (window.unityInstance) {
                  window.unityInstance.SendMessage('WebBridge', 'PausarJuego');
                }
                navigate('/pausa');
              }}
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
                <div className="absolute left-0 top-0 h-1 w-full bg-white"></div>
              </div>
              <span className="font-black text-[#0D0D0D] w-10 text-right">{progress}%</span>
            </div>
          </div>

          {/* Fila 2: Nivel, Cronómetro */}
          <div className="flex items-center justify-between font-black text-[#0D0D0D] lg:w-auto lg:gap-8 lg:text-xl">
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

        {/* Área del Canvas del Juego */}
        <div ref={canvasRef} className="relative z-0 flex min-h-0 flex-1 items-center justify-center overflow-hidden border-y-2 border-[#0D0D0D] bg-[#1B384B]">
          <canvas 
            ref={unityCanvasRef}
            id="unity-canvas" 
            className="h-full w-full object-contain"
            tabIndex={-1}
          />
        </div>

        {/* Controles Táctiles Inferiores */}
        <div ref={controlsRef} className="z-10 flex shrink-0 gap-3 bg-[#8BA3A7] p-4 shadow-[0px_-4px_0px_0px_#0D0D0D] lg:hidden">
          <button className="voxel-grid-surface flex h-14 w-14 items-center justify-center border-2 border-[#0D0D0D] bg-[#1B384B] text-white shadow-[4px_4px_0px_0px_#0D0D0D] hover:bg-[#8BA3A7] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all md:h-16 md:w-16">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>

          <button className="button-primary flex h-14 flex-1 items-center justify-center text-lg font-black uppercase tracking-widest transition-all md:h-16 md:text-xl">
            ACCIÓN
          </button>

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