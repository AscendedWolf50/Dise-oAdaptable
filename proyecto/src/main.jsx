import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import './App.css'


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

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Menu />
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/login" element={<Login />} />
        <Route path="/niveles" element={<SelectorNiveles />} />
        <Route path="/configuracion" element={<Configuracion />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/tutorial" element={<Tutorial />} />
        <Route path="/gameplay" element={<Gameplay />} />
        <Route path="/pausa" element={<Pausa />} />
        <Route path="/victoria" element={<Victoria />} />
        <Route path="/derrota" element={<Derrota />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)