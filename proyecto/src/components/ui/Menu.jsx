import { useNavigate, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { path: '/', label: 'INICIO' },
  { path: '/login', label: 'REGISTRO' },
  { path: '/niveles', label: 'NIVELES' },
  { path: '/perfil', label: 'PERFIL' },
  { path: '/configuracion', label: 'CONFIG' },
  { path: '/tutorial', label: 'TUTORIAL' },
  { path: '/gameplay', label: 'JUEGO' },
  { path: '/pausa', label: 'PAUSA' },
  { path: '/victoria', label: 'VICTORIA' },
  { path: '/derrota', label: 'DERROTA' },
];

export default function Menu() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="flex flex-wrap gap-2 p-3 bg-[#0D0D0D] justify-center border-b-[3px] border-[#FF7800]">
      {NAV_ITEMS.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`text-xs font-bold tracking-widest uppercase px-3 py-1 border-2 transition-all duration-150 cursor-pointer
              ${isActive
                ? 'bg-[#FF7800] text-[#0D0D0D] border-[#FF7800]'
                : 'bg-transparent text-white border-[#8BA3A7] hover:border-[#FF7800] hover:text-[#FF7800]'
              }`}
          >
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
