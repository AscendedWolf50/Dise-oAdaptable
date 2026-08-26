export default function Menu() {
  return (
    <nav style={{
      display: 'flex', flexWrap: 'wrap', gap: '15px', padding: '15px',
      background: '#111', justifyContent: 'center', borderBottom: '3px solid #aa3bff',
      marginBottom: '20px'
    }}>
      <a href="#/" style={{ color: 'white', fontWeight: 'bold' }}>Inicio</a>
      <a href="#/login" style={{ color: 'white', fontWeight: 'bold' }}>Registro</a>
      <a href="#/niveles" style={{ color: 'white', fontWeight: 'bold' }}>Niveles</a>
      <a href="#/perfil" style={{ color: 'white', fontWeight: 'bold' }}>Perfil</a>
      <a href="#/configuracion" style={{ color: 'white', fontWeight: 'bold' }}>Configuración</a>
      <a href="#/tutorial" style={{ color: 'white', fontWeight: 'bold' }}>Tutorial</a>
      <a href="#/gameplay" style={{ color: 'white', fontWeight: 'bold' }}>Gameplay</a>
      <a href="#/pausa" style={{ color: 'white', fontWeight: 'bold' }}>Pausa</a>
      <a href="#/victoria" style={{ color: 'white', fontWeight: 'bold' }}>Victoria</a>
      <a href="#/derrota" style={{ color: 'white', fontWeight: 'bold' }}>Derrota</a>
    </nav>
  );
}