export default function Pausa({ alNavegar }) {
  return (
    <div>
      <h1>Pantalla de Pausa</h1>
      <p>El juego está detenido.</p>
      
      <div className="botones-contenedor">
        <button onClick={() => alNavegar('gameplay')}>Reanudar</button>
        <button onClick={() => alNavegar('inicio')}>Salir al Menú Principal</button>
      </div>
    </div>
  );
}