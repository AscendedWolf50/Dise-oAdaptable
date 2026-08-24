export default function Derrota({ alNavegar }) {
  return (
    <div>
      <h1>Pantalla de Derrota</h1>
      <h2>Fin del juego. ¡Sigue intentando!</h2>
      
      <div className="botones-contenedor">
        <button onClick={() => alNavegar('gameplay')}>Reintentar Nivel</button>
        <button onClick={() => alNavegar('inicio')}>Volver al Menú Principal</button>
      </div>
    </div>
  );
}