export default function Tutorial({ alNavegar }) {
  return (
    <div>
      <h1>Pantalla de Tutorial</h1>
      <p>Instrucciones de cómo jugar...</p>
      
      <div className="botones-contenedor">
        <button onClick={() => alNavegar('gameplay')}>¡Jugar Ahora!</button>
        <button onClick={() => alNavegar('inicio')}>Volver al Inicio</button>
      </div>
    </div>
  );
}