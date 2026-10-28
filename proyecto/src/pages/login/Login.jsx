import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import statsData from '../../data/stats.json';
import { auth, db } from '../../firebase/config.js';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const Login = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const statsRef = useRef([]);

  // Estados de autenticación y formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

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

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (isRegistering) {
        // Registro con Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const defaultData = {
          username: username.trim() || email.split('@')[0],
          email: email,
          joinDate: new Date().toLocaleDateString('es-ES'),
          progress: { niveles: [] },
          failedAttempts: 0,
          playedTime: '0h 0m'
        };

        // Crear documento del usuario en Firestore
        await setDoc(doc(db, 'users', user.uid), defaultData);
        localStorage.setItem('VoxelDriftProgress', JSON.stringify(defaultData.progress));
        localStorage.setItem('VoxelDriftUser', JSON.stringify(defaultData));
      } else {
        // Inicio de sesión con Firebase Auth
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Descargar perfil y progreso del usuario desde Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          localStorage.setItem('VoxelDriftProgress', JSON.stringify(userData.progress || { niveles: [] }));
          localStorage.setItem('VoxelDriftUser', JSON.stringify(userData));
        }
      }

      // Navegar al menú principal
      navigate('/');
    } catch (err) {
      console.error("Error en autenticación:", err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setErrorMsg('Correo o contraseña incorrectos.');
      } else if (err.code === 'auth/email-already-in-use') {
        setErrorMsg('El correo ya está registrado.');
      } else if (err.code === 'auth/weak-password') {
        setErrorMsg('La contraseña debe tener mínimo 6 caracteres.');
      } else if (err.code === 'auth/invalid-email') {
        setErrorMsg('Ingresa un correo electrónico válido.');
      } else {
        setErrorMsg('Error al conectar. Inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Función para enviar correo de recuperación de contraseña
  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setErrorMsg('Ingresa tu correo en el campo de texto para enviarte el enlace.');
      setSuccessMsg('');
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email.trim());
      setSuccessMsg('¡Correo enviado! Revisa tu bandeja de entrada o spam.');
    } catch (err) {
      console.error("Error al restablecer contraseña:", err);
      if (err.code === 'auth/user-not-found') {
        setErrorMsg('No existe ninguna cuenta con este correo.');
      } else if (err.code === 'auth/invalid-email') {
        setErrorMsg('Ingresa un correo electrónico válido.');
      } else {
        setErrorMsg('Error al enviar el correo. Inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full min-h-full w-full justify-center bg-[#142A3A] p-4 font-sans lg:p-6">
      <div 
        ref={containerRef}
        className="relative flex h-full w-full max-w-md flex-col justify-between border-2 border-[#0D0D0D] bg-[#D8E4E6] p-5 shadow-[4px_4px_0px_0px_#0D0D0D] md:max-w-xl md:p-8 lg:grid lg:max-w-none lg:grid-cols-2 lg:items-center lg:gap-8 lg:p-10"
      >
        {/* Version Label */}
        <div className="text-right text-xs font-black tracking-widest text-[#963C00] lg:col-span-2">
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
            <div className="h-3 w-3 rotate-45 border-2 border-[#0D0D0D] bg-[#F4A340]"></div>
            <div className="h-0.5 w-16 bg-[#0D0D0D]"></div>
          </div>
        </div>

        {/* Form and Message Section */}
        <div className="my-auto flex flex-col gap-4 lg:col-start-2">
          {/* Message Box */}
          <div className="relative border-2 border-[#0D0D0D] bg-[#D8E4E6] p-3 shadow-[2px_2px_0px_0px_#0D0D0D]">
            <div className="absolute -top-1.5 -left-1.5 h-3 w-3 border-2 border-[#0D0D0D] bg-[#F4A340]"></div>
            <div className="absolute -top-1.5 -right-1.5 h-3 w-3 border-2 border-[#0D0D0D] bg-[#F4A340]"></div>
            <div className="absolute -bottom-1.5 -left-1.5 h-3 w-3 border-2 border-[#0D0D0D] bg-[#F4A340]"></div>
            <div className="absolute -bottom-1.5 -right-1.5 h-3 w-3 border-2 border-[#0D0D0D] bg-[#F4A340]"></div>
            
            <p className="text-center text-xs font-bold uppercase tracking-widest text-[#0D0D0D]">
              {isRegistering ? 'REGISTRAR NUEVA CUENTA' : 'PREPÁRATE PARA LA AVENTURA...'}
            </p>
          </div>

          {/* Caja de Error */}
          {errorMsg && (
            <div className="border-2 border-[#0D0D0D] bg-[#B42318] p-2 text-center text-xs font-bold uppercase tracking-widest text-white shadow-[2px_2px_0px_0px_#0D0D0D]">
              {errorMsg}
            </div>
          )}

          {/* Caja de Éxito */}
          {successMsg && (
            <div className="border-2 border-[#0D0D0D] bg-[#142A3A] p-2 text-center text-xs font-bold uppercase tracking-widest text-[#FF7800] shadow-[2px_2px_0px_0px_#0D0D0D]">
              {successMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAuthSubmit} className="flex flex-col gap-3">
            {isRegistering && (
              <input 
                type="text" 
                placeholder="nombre de usuario..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border-2 border-[#0D0D0D] bg-[#FFFFFF] p-3 font-bold uppercase tracking-widest text-[#0D0D0D] shadow-[4px_4px_0px_0px_#0D0D0D] placeholder:text-[#53636B] focus:outline-none focus:ring-2 focus:ring-[#142A3A]"
                required
              />
            )}

            <input 
              type="email" 
              placeholder="correo electrónico..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-2 border-[#0D0D0D] bg-[#FFFFFF] p-3 font-bold tracking-widest text-[#0D0D0D] shadow-[4px_4px_0px_0px_#0D0D0D] placeholder:text-[#53636B] focus:outline-none focus:ring-2 focus:ring-[#142A3A]"
              required
            />

            <input 
              type="password" 
              placeholder="contraseña..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-2 border-[#0D0D0D] bg-[#FFFFFF] p-3 font-bold tracking-widest text-[#0D0D0D] shadow-[4px_4px_0px_0px_#0D0D0D] placeholder:text-[#53636B] focus:outline-none focus:ring-2 focus:ring-[#142A3A]"
              required
            />

            {/* Enlace para Olvidó su Contraseña (Solo en pantalla de Login) */}
            {!isRegistering && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={loading}
                  className="text-[10px] font-bold uppercase tracking-widest text-[#0D0D0D] underline hover:text-[#963C00] transition-colors disabled:opacity-50"
                >
                  ¿OLVIDASTE TU CONTRASEÑA?
                </button>
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="button-primary w-full py-3.5 font-black uppercase tracking-widest transition-all disabled:opacity-50"
            >
              {loading ? 'CARGANDO...' : isRegistering ? 'REGISTRARSE' : 'INGRESAR'}
            </button>
          </form>

          {/* Alternar modo Registro / Login */}
          <button
            type="button"
            onClick={() => { setIsRegistering(!isRegistering); setErrorMsg(''); setSuccessMsg(''); }}
            className="text-center text-xs font-bold uppercase tracking-widest text-[#0D0D0D] underline hover:text-[#963C00] transition-colors"
          >
            {isRegistering ? '¿YA TIENES CUENTA? INICIA SESIÓN' : '¿NO TIENES CUENTA? REGÍSTRATE AQUÍ'}
          </button>
        </div>

        {/* Stats Grid - Ubicado en la franja inferior */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3 lg:col-span-2 lg:mt-0">
          {statsData && statsData.map((stat, index) => (
            <div 
              key={stat.id}
              ref={el => statsRef.current[index] = el}
              className="flex flex-col items-center justify-center border-2 border-[#0D0D0D] bg-[#D8E4E6] p-2.5 text-center shadow-[2px_2px_0px_0px_#0D0D0D]"
            >
              <div className="mb-0.5 text-lg font-black text-[#963C00]">{stat.valor}</div>
              <div className="text-[9px] font-bold uppercase leading-tight tracking-widest text-[#0D0D0D]">{stat.etiqueta}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Login;
