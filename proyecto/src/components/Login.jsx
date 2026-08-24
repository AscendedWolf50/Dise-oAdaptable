export default function Login({ alNavegar }) {
  return (
    <div>
      <h1>Pantalla de Registro</h1>
      <button onClick={() => alNavegar('inicio')}>
        Ingresar al juego
      </button>
    </div>
  );
}