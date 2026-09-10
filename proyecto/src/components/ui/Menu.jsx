export default function Menu() {
  return (
    <nav className="flex flex-wrap gap-4 p-4 bg-[#111] justify-center border-b-[3px] border-[#aa3bff] mb-5">
      <a href="#/" className="text-white font-bold hover:text-[#aa3bff] transition-colors">Inicio</a>
      <a href="#/login" className="text-white font-bold hover:text-[#aa3bff] transition-colors">Registro</a>
      <a href="#/niveles" className="text-white font-bold hover:text-[#aa3bff] transition-colors">Niveles</a>
      <a href="#/perfil" className="text-white font-bold hover:text-[#aa3bff] transition-colors">Perfil</a>
      <a href="#/configuracion" className="text-white font-bold hover:text-[#aa3bff] transition-colors">Configuración</a>
      <a href="#/tutorial" className="text-white font-bold hover:text-[#aa3bff] transition-colors">Tutorial</a>
      <a href="#/gameplay" className="text-white font-bold hover:text-[#aa3bff] transition-colors">Gameplay</a>
      <a href="#/pausa" className="text-white font-bold hover:text-[#aa3bff] transition-colors">Pausa</a>
      <a href="#/victoria" className="text-white font-bold hover:text-[#aa3bff] transition-colors">Victoria</a>
      <a href="#/derrota" className="text-white font-bold hover:text-[#aa3bff] transition-colors">Derrota</a>
    </nav>
  );
}