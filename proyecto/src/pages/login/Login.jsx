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
    <div className="flex h-full min-h-full w-full justify-center bg-[#1B384B] p-4 font-sans lg:p-6">
      <div 
        ref={containerRef}
        className="relative flex h-full w-full max-w-md flex-col justify-between border-2 border-[#0D0D0D] bg-[#8BA3A7] p-5 shadow-[4px_4px_0px_0px_#0D0D0D] md:max-w-xl md:p-8 lg:grid lg:max-w-none lg:grid-cols-2 lg:items-center lg:gap-8 lg:p-10"
      >
        {/* Version Label */}
        <div className="text-right text-xs font-black tracking-widest text-[#FF7800] lg:col-span-2">
          V 1.0
        </div>

        {/* Title Section */}
        <div className="my-auto text-center lg:col-start-1 lg:text-left">
          <h1 className="text-5xl font-black leading-none tracking-tighter text-[#0D0D0D] md:text-6xl lg:text-7xl">
            VOXEL
          </h1>
          <h1 className="text-5xl font-black leading-none tracking-tighter text-[#0D0D0D] md:text-6xl lg:text-7xl">
            DRIFT
          </h1>

          {/* Decorative Diamond Separator */}
          <div className="mt-4 flex items-center justify-center gap-2 text-[#0D0D0D] lg:justify-start">
            <div className="h-0.5 w-16 bg-[#0D0D0D]"></div>
            <div className="h-3 w-3 rotate-45 border-2 border-[#0D0D0D] bg-[#FF7800]"></div>
            <div className="h-0.5 w-16 bg-[#0D0D0D]"></div>
          </div>
        </div>

        {/* Form and Message Section */}
        <div className="my-auto flex flex-col gap-6 lg:col-start-2">
          {/* Message Box */}
          <div className="relative border-2 border-[#0D0D0D] bg-[#8BA3A7] p-4 shadow-[2px_2px_0px_0px_#0D0D0D]">
            <div className="absolute -top-1.5 -left-1.5 h-3 w-3 border-2 border-[#0D0D0D] bg-[#FF7800]"></div>
            <div className="absolute -top-1.5 -right-1.5 h-3 w-3 border-2 border-[#0D0D0D] bg-[#FF7800]"></div>
            <div className="absolute -bottom-1.5 -left-1.5 h-3 w-3 border-2 border-[#0D0D0D] bg-[#FF7800]"></div>
            <div className="absolute -bottom-1.5 -right-1.5 h-3 w-3 border-2 border-[#0D0D0D] bg-[#FF7800]"></div>
            
            <p className="text-center text-sm font-bold uppercase tracking-widest text-[#0D0D0D]">
              PREPÁRATE PARA LA AVENTURA...
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input 
              type="text" 
              placeholder="ingresa tu usuario..."
              className="w-full border-2 border-[#0D0D0D] bg-[#FFFFFF] p-4 font-bold uppercase tracking-widest text-[#0D0D0D] shadow-[4px_4px_0px_0px_#0D0D0D] placeholder:text-[#8BA3A7] focus:outline-none focus:ring-2 focus:ring-[#FF7800]"
              required
            />
            <button 
              type="submit"
              className="button-primary w-full py-4 font-black uppercase tracking-widest transition-all"
            >
              INGRESAR
            </button>
          </form>
        </div>

        {/* Stats Grid - Ubicado en la franja inferior */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3 lg:col-span-2 lg:mt-0">
          {statsData && statsData.map((stat, index) => (
            <div 
              key={stat.id}
              ref={el => statsRef.current[index] = el}
              className="flex flex-col items-center justify-center border-2 border-[#0D0D0D] bg-[#8BA3A7] p-2.5 text-center shadow-[2px_2px_0px_0px_#0D0D0D]"
            >
              <div className="mb-0.5 text-lg font-black text-[#FF7800]">{stat.valor}</div>
              <div className="text-[9px] font-bold uppercase leading-tight tracking-widest text-[#0D0D0D]">{stat.etiqueta}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Login;