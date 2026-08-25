export default function Configuracion({ alNavegar }) {
  return (
    <div>
      <h1>Pantalla de Configuración</h1>
      <button onClick={() => alNavegar('inicio')}>
        Volver al Inicio
      </button>
    </div>
  );
}