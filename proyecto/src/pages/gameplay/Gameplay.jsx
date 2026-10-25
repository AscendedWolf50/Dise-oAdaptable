import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useAppNavigation } from '../../utils/useAppNavigation.js';

export default function Gameplay() {
  const navigate = useAppNavigation();

  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const controlsRef = useRef(null);

  // Referencia directa al canvas donde se renderizará Unity
  const unityCanvasRef = useRef(null);

  // Lógica de comunicación con Unity (Escuchando a Unity)
  useEffect(() => {
    window.ReactBridge_AbrirPausa = () => {
      console.log("Unity solicitó abrir la pausa");
      navigate('/pausa');
    };

    window.ReactBridge_NivelCompletado = (estrellas) => {
      console.log("Unity finalizó el nivel con estrellas:", estrellas);
      navigate('/victoria', { state: { estrellasTotales: estrellas } });
    };

    window.ReactBridge_NivelFallido = () => {
      navigate('/derrota');
    };

    return () => {
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
      dataUrl: `${buildUrl}/BuildVoxelDrift.data`,
      frameworkUrl: `${buildUrl}/BuildVoxelDrift.framework.js`,
      codeUrl: `${buildUrl}/BuildVoxelDrift.wasm`,
      streamingAssetsUrl: "StreamingAssets",
      companyName: "DefaultCompany",
      productName: "VoxelDrift",
      productVersion: "0.1.0",
      devicePixelRatio: window.devicePixelRatio || 1,
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
      inicializarUnity();
    } else {
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

      gsap.from(canvasRef.current, {
        opacity: 0,
        scale: 0.95,
        duration: 0.6,
        delay: 0.2,
        ease: 'power2.out'
      });

      if (controlsRef.current) {
        gsap.from(controlsRef.current.children, {
          opacity: 0,
          y: 30,
          duration: 0.5,
          stagger: 0.1,
          delay: 0.3,
          ease: 'back.out(1.5)'
        });
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="flex h-screen min-h-0 items-center justify-center bg-[#1B384B] p-4 font-sans selection:bg-[#FF7800] selection:text-white lg:p-8">
      
      {/* Pantalla de bloqueo para forzar Landscape (Solo visible en vertical) */}
      <div className="fixed inset-0 z-50 hidden portrait:flex flex-col items-center justify-center bg-[#1B384B] p-6 text-center text-white">
        <svg className="mb-6 h-20 w-20 animate-pulse text-[#FF7800]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <h2 className="mb-2 text-2xl font-black uppercase tracking-widest text-[#FF7800]">Gira tu dispositivo</h2>
        <p className="text-lg text-gray-300">Este juego requiere que juegues en modo horizontal.</p>
      </div>

      {/* Contenedor Principal (Se oculta en vertical) */}
      <div 
        ref={containerRef}
        className="relative flex portrait:hidden w-full max-w-5xl flex-col overflow-hidden border-2 border-[#0D0D0D] bg-[#8BA3A7] shadow-[4px_4px_0px_0px_#0D0D0D]"
      >
        
        {/* Área del Canvas del Juego */}
        <div ref={canvasRef} className="relative z-0 flex w-full aspect-video items-center justify-center overflow-hidden bg-[#1B384B]">
          <canvas 
            ref={unityCanvasRef}
            id="unity-canvas" 
            className="block h-full w-full object-cover"
            tabIndex={-1}
          />
        </div>

        {/* Controles Táctiles Inferiores */}
        <div ref={controlsRef} className="z-10 flex shrink-0 gap-3 bg-[#8BA3A7] p-4 border-t-2 border-[#0D0D0D] lg:hidden">
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