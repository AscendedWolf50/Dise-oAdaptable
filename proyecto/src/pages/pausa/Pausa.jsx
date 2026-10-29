import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { gsapButtonMotion } from '../../utils/gsapButtonMotion.js';
import ModalOverlay from '../../components/ui/ModalOverlay.jsx';
import { useAppNavigation, useDismissModal } from '../../utils/useAppNavigation.js';

export default function Pausa() {
  const navigate = useAppNavigation();
  const dismiss = useDismissModal();
  const location = useLocation();
  const pageRef = useRef(null);

  const [levelInfo, setLevelInfo] = useState({
    numNivel: 1,
    estrellas: 0,
    mejorTiempo: null,
    friendName: null,
    nivelesCompletados: 0,
    totalNiveles: 10
  });

  useEffect(() => {
    // 1. Obtener estado del nivel actual
    let currentState = location.state;
    if (!currentState || currentState.nivelSeleccionado === undefined) {
      const savedState = localStorage.getItem('VoxelDriftCurrentLevelState');
      if (savedState) {
        try { currentState = JSON.parse(savedState); } catch(e) {}
      }
    }

    const indiceUnity = currentState?.nivelSeleccionado;
    const numNivel = (indiceUnity !== undefined && indiceUnity !== null) ? (indiceUnity + 1) : 1;
    const friendName = currentState?.friendName || null;

    // 2. Obtener progreso guardado
    let niveles = [];
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

    // Buscar progreso del nivel específico
    const progresoNivel = niveles.find(n => {
      if (!n || n.idNivel === undefined || n.idNivel === null) return false;
      const strId = String(n.idNivel).trim();
      const numId = parseInt(strId.replace(/\D/g, ''), 10);
      return numId === numNivel;
    });

    let estrellas = 0;
    let mejorTiempo = null;

    if (progresoNivel) {
      if (progresoNivel.estrellaCompletado) estrellas += 1;
      if (progresoNivel.estrellaTiempo) estrellas += 1;
      if (progresoNivel.estrellaPuntos) estrellas += 1;
      if (progresoNivel.mejorTiempo && progresoNivel.mejorTiempo < 9999) {
        mejorTiempo = progresoNivel.mejorTiempo;
      }
    }

    const nivelesCompletados = niveles.filter(n => n.estrellaCompletado).length;

    setLevelInfo({
      numNivel,
      estrellas,
      mejorTiempo,
      friendName,
      nivelesCompletados,
      totalNiveles: 10
    });
  }, [location.state]);

  useEffect(() => {
    const context = gsap.context(() => gsap.from('[data-pause-enter]', { opacity: 0, y: 16, duration: 0.42, stagger: 0.08, ease: 'power2.out' }), pageRef);
    return () => context.revert();
  }, []);

  const handleReanudar = () => {
    if (window.unityInstance) {
      window.unityInstance.SendMessage('WebBridgeManager', 'ReanudarJuego');
    }
    dismiss();
  };

  const handleReiniciar = () => {
    if (window.unityInstance) {
      window.unityInstance.SendMessage('WebBridgeManager', 'ReiniciarNivelActual');
      window.unityInstance.SendMessage('WebBridgeManager', 'ReanudarJuego');
    }
    dismiss();
  };

  const handleMenuPrincipal = () => {
    if (window.unityInstance) {
      window.unityInstance.SendMessage('WebBridgeManager', 'PausarJuego');
    }
    navigate('/');
  };

  const mejorTiempoTexto = levelInfo.mejorTiempo 
    ? `${levelInfo.mejorTiempo.toFixed(2)}s` 
    : 'SIN TIEMPO';

  return (
    <ModalOverlay 
      title="Ⅱ PAUSADO" 
      panelClassName="!pt-14 [&>button.absolute]:hidden [&>button[aria-label]]:hidden"
      showCloseButton={false}
      showClose={false}
      hideCloseButton={true}
      hasCloseButton={false}
      onClose={null}
    >
      <div ref={pageRef} className="flex flex-col gap-3 text-[#0D0D0D] lg:grid lg:grid-cols-2 lg:items-center lg:gap-6">
        
        {/* CUADRO DE INFORMACIÓN REAL Y DINÁMICA DEL NIVEL */}
        <div data-pause-enter className="flex flex-col justify-between border-2 border-[#0D0D0D] bg-[#D8E4E6] p-4 lg:col-span-1 lg:row-span-2 lg:p-5 shadow-[2px_2px_0px_0px_#0D0D0D]">
          <div className="flex items-start justify-between border-b-2 border-[#0D0D0D] pb-3">
            <div>
              <p className="text-xs font-black tracking-widest text-[#0D0D0D] uppercase">
                NIVEL {levelInfo.numNivel}
              </p>
              <div className="flex items-center gap-1 mt-1">
                {[0, 1, 2].map((i) => (
                  <span 
                    key={i} 
                    className={`text-base font-black ${i < levelInfo.estrellas ? 'text-[#FF7800]' : 'text-[#0D0D0D]/25'}`}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>

            <div className="text-right">
              <span className="text-[9px] font-bold tracking-widest text-[#0D0D0D]/70 uppercase block">MEJOR TIEMPO</span>
              <span className="text-xs font-black text-[#FF7800]">
                {mejorTiempoTexto}
              </span>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between pt-1">
            <div className="flex flex-col">
              <span className="text-[9px] font-bold tracking-widest text-[#0D0D0D]/70 uppercase">
                {levelInfo.friendName ? 'DESAFÍO' : 'MODO DE JUEGO'}
              </span>
              <span className="text-[10px] font-black text-[#0D0D0D] uppercase truncate max-w-[110px]">
                {levelInfo.friendName ? `VS ${levelInfo.friendName}` : 'INDIVIDUAL'}
              </span>
            </div>

            <div className="flex flex-col items-end">
              <span className="text-[9px] font-bold tracking-widest text-[#0D0D0D]/70 uppercase">PROGRESO</span>
              <span className="text-[10px] font-black text-[#0D0D0D]">
                {levelInfo.nivelesCompletados} / {levelInfo.totalNiveles} NIVELES
              </span>
            </div>
          </div>
        </div>
          
        <button 
          {...gsapButtonMotion} 
          data-pause-enter 
          onClick={handleReanudar} 
          className="button-primary !bg-[#F4A340] !opacity-100 py-4 text-base font-black tracking-widest lg:col-start-2 lg:row-start-1 lg:py-6 lg:text-lg"
        >
          ▶ REANUDAR
        </button>
          
        <div data-pause-enter className="border-2 border-[#0D0D0D] p-2 lg:col-start-2 lg:row-start-2">
          <button {...gsapButtonMotion} onClick={handleReiniciar} className="button-secondary flex w-full items-center gap-3 px-2 py-3 text-left text-xs font-bold tracking-widest"><span>↻</span><span>REINICIAR NIVEL</span></button>
          <button {...gsapButtonMotion} onClick={() => navigate('/configuracion', { state: { desdePausa: true } })} className="button-secondary flex w-full items-center gap-3 px-2 py-3 text-left text-xs font-bold tracking-widest"><span>⚙</span><span>CONFIGURACIÓN</span></button>
          <button {...gsapButtonMotion} onClick={handleMenuPrincipal} className="button-secondary flex w-full items-center gap-3 px-2 py-3 text-left text-xs font-bold tracking-widest"><span>≡</span><span>MENÚ PRINCIPAL</span></button>
        </div>
      </div>
    </ModalOverlay>
  );
}