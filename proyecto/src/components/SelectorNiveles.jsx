export default function SelectorNiveles({ alNavegar }) {
  return (
    <div>
      <h1>Pantalla para seleccionar los niveles</h1>
      <button onClick={() => alNavegar('inicio')}>
        Volver al Inicio
      </button>
    </div>
  );
}