export default function Victoria({ alNavegar }) {
  return (
    <div>
      <h1>Pantalla de Victoria</h1>
      <h2>¡Felicidades, ganaste!</h2>
      
      <div className="botones-contenedor">
        <button onClick={() => alNavegar('niveles')}>Siguiente Nivel / Ver Niveles</button>
        <button onClick={() => alNavegar('inicio')}>Volver al Menú Principal</button>
      </div>
    </div>
  );
}