import { useState } from 'react';
import Inicio from './components/Inicio';
import Login from './components/Login';
import SelectorNiveles from './components/SelectorNiveles';
import Configuracion from './components/Configuracion';
import Perfil from './components/Perfil';
import './App.css'; 

function App() {
  // Iniciamos el estado en la pantalla de 'login'
  const [pantallaActual, setPantallaActual] = useState('login');

  return (
    <main className="app-container">
      {pantallaActual === 'login' && (
        <Login alNavegar={setPantallaActual} />
      )}
      {pantallaActual === 'inicio' && (
        <Inicio alNavegar={setPantallaActual} />
      )}
      {pantallaActual === 'niveles' && (
        <SelectorNiveles alNavegar={setPantallaActual} />
      )}
      {pantallaActual === 'configuracion' && (
        <Configuracion alNavegar={setPantallaActual} />
      )}
      {pantallaActual === 'perfil' && (
        <Perfil alNavegar={setPantallaActual} />
      )}
    </main>
  );
}

export default App;