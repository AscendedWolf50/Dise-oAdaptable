import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import statsData from '../../data/stats.json';

const Login = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const statsRef = useRef([]);

  useEffect(() => {
    // Fade in main container
    gsap.fromTo(
      containerRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
    );

    // Staggered fade in for stats cards
    if (statsRef.current.length > 0) {
      gsap.fromTo(
        statsRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.15, delay: 0.3, ease: 'power2.out' }
      );
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    navigate('/');
  };

  return (
    <div className="bg-[#1B384B] flex justify-center p-4 font-sans">
      <div 
        ref={containerRef}
        className="relative flex w-full max-w-md flex-col border-2 border-[#0D0D0D] bg-[#8BA3A7] p-5 shadow-[4px_4px_0px_0px_#0D0D0D] md:max-w-xl md:p-8"
      >
        {/* Version Label */}
        <div className="text-right text-[#FF7800] font-black tracking-widest text-sm mb-2">
          V 1.0
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-6xl font-black text-[#0D0D0D] tracking-tighter leading-none mb-1">VOXEL</h1>
          <h1 className="text-6xl font-black text-[#0D0D0D] tracking-tighter leading-none">DRIFT</h1>
        </div>

        {/* Decorative Diamond Separator */}
        <div className="flex justify-center items-center gap-2 mb-6 text-[#0D0D0D]">
          <div className="w-16 h-0.5 bg-[#0D0D0D]"></div>
          <div className="w-3 h-3 bg-[#FF7800] border-2 border-[#0D0D0D] rotate-45"></div>
          <div className="w-16 h-0.5 bg-[#0D0D0D]"></div>
        </div>

        {/* Message Box */}
        <div className="relative border-2 border-[#0D0D0D] p-4 mb-8 bg-[#8BA3A7]">
          <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-[#FF7800] border-2 border-[#0D0D0D]"></div>
          <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-[#FF7800] border-2 border-[#0D0D0D]"></div>
          <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-[#FF7800] border-2 border-[#0D0D0D]"></div>
          <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-[#FF7800] border-2 border-[#0D0D0D]"></div>
          
          <p className="text-center text-[#0D0D0D] font-bold tracking-widest uppercase text-sm">
            PREPÁRATE PARA LA AVENTURA...
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="flex flex-col gap-6 mb-8">
          <input 
            type="text" 
            placeholder="ingresa tu usuario..."
            className="w-full bg-[#FFFFFF] border-2 border-[#0D0D0D] p-4 font-bold text-[#0D0D0D] placeholder:text-[#8BA3A7] focus:outline-none focus:ring-2 focus:ring-[#FF7800] uppercase tracking-widest shadow-[4px_4px_0px_0px_#0D0D0D]"
            required
          />
          <button 
            type="submit"
            className="button-primary w-full py-4 font-black tracking-widest uppercase transition-all"
          >
            INGRESAR
          </button>
        </form>

        {/* Stats Grid */}
        <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {statsData && statsData.map((stat, index) => (
            <div 
              key={stat.id}
              ref={el => statsRef.current[index] = el}
              className="border-2 border-[#0D0D0D] bg-[#8BA3A7] p-2 flex flex-col items-center justify-center text-center"
            >
              <div className="text-[#FF7800] font-black text-lg mb-1">{stat.valor}</div>
              <div className="text-[#0D0D0D] font-bold text-[9px] uppercase tracking-widest leading-tight">{stat.etiqueta}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Login;