export default function Perfil({ alNavegar }) {
  return (
    <div>
      <h1>Pantalla del perfil del usuario</h1>
      <button onClick={() => alNavegar('inicio')}>
        Volver al Inicio
      </button>
    </div>
  );
}