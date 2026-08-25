import { useState } from 'react';
import Inicio from './pages/inicio/Inicio.jsx';
import Login from './pages/login/Login.jsx';
import SelectorNiveles from './pages/selectorNiveles/SelectorNiveles.jsx';
import Configuracion from './pages/configuracion/Configuracion.jsx';
import Perfil from './pages/perfil/Perfil.jsx';
// Importamos las nuevas pantallas
import Derrota from './pages/derrota/Derrota.jsx';
import Gameplay from './pages/gameplay/Gameplay.jsx';
import Pausa from './pages/pausa/Pausa.jsx';
import Tutorial from './pages/tutorial/Tutorial.jsx';
import Victoria from './pages/victoria/Victoria.jsx';

import './App.css'; 

function App() {
  // Iniciamos el estado en la pantalla de 'login'
  const [pantallaActual, setPantallaActual] = useState('login');

  return (
    <main className="app-container">
      {pantallaActual === 'login' && <Login alNavegar={setPantallaActual} />}
      {pantallaActual === 'inicio' && <Inicio alNavegar={setPantallaActual} />}
      {pantallaActual === 'niveles' && <SelectorNiveles alNavegar={setPantallaActual} />}
      {pantallaActual === 'configuracion' && <Configuracion alNavegar={setPantallaActual} />}
      {pantallaActual === 'perfil' && <Perfil alNavegar={setPantallaActual} />}
      
      {/* Nuevas Rutas / Pantallas */}
      {pantallaActual === 'tutorial' && <Tutorial alNavegar={setPantallaActual} />}
      {pantallaActual === 'gameplay' && <Gameplay alNavegar={setPantallaActual} />}
      {pantallaActual === 'pausa' && <Pausa alNavegar={setPantallaActual} />}
      {pantallaActual === 'victoria' && <Victoria alNavegar={setPantallaActual} />}
      {pantallaActual === 'derrota' && <Derrota alNavegar={setPantallaActual} />}
    </main>
  );
}

export default App;