import { Route, Routes, useLocation } from 'react-router-dom';
import Inicio from './pages/inicio/Inicio.jsx';
import Login from './pages/login/Login.jsx';
import SelectorNiveles from './pages/selectorNiveles/SelectorNiveles.jsx';
import Configuracion from './pages/configuracion/Configuracion.jsx';
import Perfil from './pages/perfil/Perfil.jsx';
import Derrota from './pages/derrota/Derrota.jsx';
import Gameplay from './pages/gameplay/Gameplay.jsx';
import Pausa from './pages/pausa/Pausa.jsx';
import Tutorial from './pages/tutorial/Tutorial.jsx';
import Victoria from './pages/victoria/Victoria.jsx';
import Menu from './components/ui/Menu.jsx';
import { DEFAULT_BACKGROUND_LOCATION, MODAL_PATHS } from './utils/useAppNavigation.js';

export default function App() {
  const location = useLocation();
  const isModalRoute = MODAL_PATHS.has(location.pathname);
  const backgroundLocation = isModalRoute
    ? location.state?.backgroundLocation || DEFAULT_BACKGROUND_LOCATION
    : location;

  return (
    <div className="voxel-grid-surface flex min-h-screen w-full flex-col items-center justify-center bg-[#1B384B] p-4">
      <div className="pixel-edge relative flex h-[800px] w-full max-w-[390px] shrink-0 flex-col overflow-hidden border-[3px] border-[#0D0D0D] bg-[#8BA3A7] shadow-[6px_6px_0px_0px_#0D0D0D] md:h-[960px] md:max-w-[768px]">
        <Menu />
        <div className="relative min-h-0 flex-1 overflow-y-auto">
          <Routes location={backgroundLocation}>
            <Route path="/" element={<Inicio />} />
            <Route path="/login" element={<Login />} />
            <Route path="/niveles" element={<SelectorNiveles />} />
            <Route path="/configuracion" element={<Configuracion />} />
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/gameplay" element={<Gameplay />} />
            <Route path="/pausa" element={<Inicio />} />
            <Route path="/victoria" element={<Inicio />} />
            <Route path="/derrota" element={<Inicio />} />
          </Routes>
        </div>
        {isModalRoute && (
          <Routes location={location}>
            <Route path="/configuracion" element={<Configuracion />} />
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/tutorial" element={<Tutorial />} />
            <Route path="/pausa" element={<Pausa />} />
            <Route path="/victoria" element={<Victoria />} />
            <Route path="/derrota" element={<Derrota />} />
          </Routes>
        )}
        <div aria-hidden="true" className="crt-overlay pointer-events-none absolute inset-0 z-50" />
      </div>
    </div>
  );
}