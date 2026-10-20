import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { useAppNavigation } from '../../utils/useAppNavigation.js';

export default function Gameplay() {
  const navigate = useAppNavigation();
  const location = useLocation();

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

          // Solo se fuerza cambio de escena si el nivel seleccionado NO es el nivel por defecto (0)
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
    <div className="flex h-full min-h-0 justify-center bg-[#1B384B] p-4 font-sans selection:bg-[#FF7800] selection:text-white lg:p-0">
      {/* Contenedor Principal */}
      <div 
        ref={containerRef}
        className="relative flex h-[min(70dvh,640px)] min-h-[420px] w-full max-w-md flex-col overflow-hidden border-2 border-[#0D0D0D] bg-[#8BA3A7] shadow-[4px_4px_0px_0px_#0D0D0D] md:h-[min(76dvh,760px)] md:max-w-2xl lg:h-full lg:min-h-0 lg:max-w-none"
      >
        
        {/* Área del Canvas del Juego (Ahora toma todo el espacio superior) */}
        <div ref={canvasRef} className="relative z-0 flex min-h-0 flex-1 w-full items-center justify-center overflow-hidden bg-[#1B384B]">
          <canvas 
            ref={unityCanvasRef}
            id="unity-canvas" 
            className="block h-full w-full object-contain"
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