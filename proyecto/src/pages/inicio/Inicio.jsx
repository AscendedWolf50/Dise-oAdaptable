export default function Inicio({ alNavegar }) {
  return (
    <div>
      <h1>Pantalla de Inicio</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
        <button onClick={() => alNavegar('niveles')}>
          Jugar (Selección de niveles)
        </button>
        <button onClick={() => alNavegar('perfil')}>
          Ver Perfil
        </button>
        <button onClick={() => alNavegar('configuracion')}>
          Configuración
        </button>
      </div>
    </div>
  );
}