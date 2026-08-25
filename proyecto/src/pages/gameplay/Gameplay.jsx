export default function Gameplay({ alNavegar }) {
  return (
    <div>
      <h1>Pantalla de Gameplay (HUD)</h1>
      <p>Jugando nivel actual...</p>
      
      <div className="botones-contenedor">
        <button onClick={() => alNavegar('pausa')}>Pausar Juego</button>
        <button onClick={() => alNavegar('victoria')}>Simular Victoria</button>
        <button onClick={() => alNavegar('derrota')}>Simular Derrota</button>
      </div>
    </div>
  );
}