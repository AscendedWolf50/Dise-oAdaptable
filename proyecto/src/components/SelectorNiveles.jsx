export default function SelectorNiveles({ alNavegar }) {
  return (
    <div>
      <h1>Pantalla para seleccionar los niveles</h1>
      
      {/* Botones para seleccionar un nivel e ir al Gameplay */}
      <div className="niveles-contenedor">
        <button onClick={() => alNavegar('gameplay')}>Jugar Nivel 1</button>
        <button onClick={() => alNavegar('gameplay')}>Jugar Nivel 2</button>
        <button onClick={() => alNavegar('gameplay')}>Jugar Nivel 3</button>
      </div>

      <br />
      
      <button onClick={() => alNavegar('inicio')}>
        Volver al Inicio
      </button>
    </div>
  );
}