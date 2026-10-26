import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { gsapButtonMotion } from '../../utils/gsapButtonMotion.js';
import ModalOverlay from '../../components/ui/ModalOverlay.jsx';

// IMPORTACIONES DE FIREBASE
import { auth, db } from '../../firebase/config.js';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const getCurrentUser = () => {
  return new Promise((resolve) => {
    if (auth.currentUser) {
      resolve(auth.currentUser);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

export default function Amigos() {
  const containerRef = useRef(null);
  const [activeTab, setActiveTab] = useState('lista'); // 'lista', 'buscar', 'solicitudes'
  
  const [currentUserData, setCurrentUserData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(null); // null: sin buscar, object: encontrado, false: no encontrado
  const [requestStatus, setRequestStatus] = useState(''); // 'idle', 'sending', 'sent', 'already_friends', 'already_sent', 'self'

  const [amigosList, setAmigosList] = useState([]);
  const [solicitudesList, setSolicitudesList] = useState([]);

  // 1. Obtener usuario actual y escuchar solicitudes + amigos en tiempo real
  useEffect(() => {
    let unsubscribeFriends = () => {};
    let unsubscribeRequests = () => {};

    const initFirebaseListeners = async () => {
      const user = await getCurrentUser();
      if (!user) return;

      // Obtener datos del perfil actual (username, nickname, photoURL)
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setCurrentUserData({ uid: user.uid, ...userDoc.data() });
      } else {
        setCurrentUserData({ uid: user.uid, username: user.displayName || 'Jugador' });
      }

      // Listener 1: Escuchar la subcolección de amigos del usuario
      const friendsRef = collection(db, 'users', user.uid, 'friends');
      unsubscribeFriends = onSnapshot(friendsRef, (snapshot) => {
        const friends = snapshot.docs.map(docSnap => ({
          uid: docSnap.id,
          ...docSnap.data()
        }));
        setAmigosList(friends);
      }, (error) => console.error("Error al escuchar amigos:", error));

      // Listener 2: Escuchar solicitudes de amistad pendientes dirijidas a este usuario
      const requestsQuery = query(
        collection(db, 'friend_requests'),
        where('toUid', '==', user.uid),
        where('status', '==', 'pending')
      );

      unsubscribeRequests = onSnapshot(requestsQuery, (snapshot) => {
        const requests = snapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data()
        }));
        setSolicitudesList(requests);
      }, (error) => console.error("Error al escuchar solicitudes:", error));
    };

    initFirebaseListeners();

    return () => {
      unsubscribeFriends();
      unsubscribeRequests();
    };
  }, []);

  // 2. Animación de entrada con GSAP
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(containerRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.5,
        ease: 'power3.out',
      });

      gsap.from('[data-friends-enter]', {
        opacity: 0,
        y: 12,
        stagger: 0.06,
        duration: 0.35,
        ease: 'power2.out',
      });
    }, containerRef);

    return () => ctx.revert();
  }, [activeTab]);

  // 3. Buscar usuario por username en Firestore
  const handleSearch = async (e) => {
    e.preventDefault();
    const queryTerm = searchQuery.trim();
    if (!queryTerm) return;

    setIsSearching(true);
    setSearchResults(null);
    setRequestStatus('idle');

    try {
      const q = query(collection(db, 'users'), where('username', '==', queryTerm));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setSearchResults(false);
      } else {
        const targetDoc = querySnapshot.docs[0];
        const targetUser = { uid: targetDoc.id, ...targetDoc.data() };

        if (currentUserData && targetUser.uid === currentUserData.uid) {
          setRequestStatus('self');
        } else {
          // Verificar si ya son amigos
          const isAlreadyFriend = amigosList.some(f => f.uid === targetUser.uid);
          if (isAlreadyFriend) {
            setRequestStatus('already_friends');
          } else {
            // Verificar si ya le enviaste una solicitud pendiente
            const reqQuery = query(
              collection(db, 'friend_requests'),
              where('fromUid', '==', currentUserData.uid),
              where('toUid', '==', targetUser.uid),
              where('status', '==', 'pending')
            );
            const reqSnap = await getDocs(reqQuery);
            if (!reqSnap.empty) {
              setRequestStatus('already_sent');
            }
          }
        }

        setSearchResults(targetUser);
      }
    } catch (error) {
      console.error("Error al buscar usuario en Firestore:", error);
      setSearchResults(false);
    } finally {
      setIsSearching(false);
    }
  };

  // 4. Enviar solicitud de amistad
  const handleSendRequest = async () => {
    if (!searchResults || !currentUserData) return;
    setRequestStatus('sending');

    try {
      const requestId = `${currentUserData.uid}_${searchResults.uid}`;
      const requestRef = doc(db, 'friend_requests', requestId);

      await setDoc(requestRef, {
        fromUid: currentUserData.uid,
        fromUsername: currentUserData.username || 'Jugador',
        fromNickname: currentUserData.nickname || '',
        fromPhotoURL: currentUserData.photoURL || null,
        toUid: searchResults.uid,
        toUsername: searchResults.username,
        status: 'pending',
        createdAt: serverTimestamp()
      }, { merge: true });

      setRequestStatus('sent');
    } catch (error) {
      console.error("Error al enviar solicitud:", error);
      setRequestStatus('idle');
    }
  };

  // 5. Aceptar solicitud de amistad (Bidireccional en subcolección 'friends')
  const handleAcceptRequest = async (solicitud) => {
    if (!currentUserData) return;

    try {
      // a) Actualizar estado de la solicitud en Firestore
      const requestRef = doc(db, 'friend_requests', solicitud.id);
      await updateDoc(requestRef, { status: 'accepted' });

      // b) Guardar amigo en subcolección del usuario actual
      const myFriendRef = doc(db, 'users', currentUserData.uid, 'friends', solicitud.fromUid);
      await setDoc(myFriendRef, {
        username: solicitud.fromUsername,
        nickname: solicitud.fromNickname || '',
        photoURL: solicitud.fromPhotoURL || null,
        addedAt: serverTimestamp()
      }, { merge: true });

      // c) Guardar al usuario actual en la subcolección del amigo
      const otherFriendRef = doc(db, 'users', solicitud.fromUid, 'friends', currentUserData.uid);
      await setDoc(otherFriendRef, {
        username: currentUserData.username,
        nickname: currentUserData.nickname || '',
        photoURL: currentUserData.photoURL || null,
        addedAt: serverTimestamp()
      }, { merge: true });

    } catch (error) {
      console.error("Error al aceptar solicitud:", error);
    }
  };

  // 6. Rechazar / Eliminar solicitud
  const handleRejectRequest = async (solicitudId) => {
    try {
      const requestRef = doc(db, 'friend_requests', solicitudId);
      await deleteDoc(requestRef);
    } catch (error) {
      console.error("Error al rechazar solicitud:", error);
    }
  };

  return (
    <ModalOverlay title="AMIGOS">
      <div ref={containerRef} className="flex flex-col gap-4 font-sans text-[#0D0D0D]">
        
        {/* NAVEGACIÓN POR PESTAÑAS */}
        <div data-friends-enter className="grid grid-cols-3 gap-2 border-b-2 border-[#0D0D0D] pb-3">
          <button
            {...gsapButtonMotion}
            onClick={() => setActiveTab('lista')}
            className={`py-2 text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all border-2 border-[#0D0D0D] ${
              activeTab === 'lista'
                ? 'bg-[#FF7800] text-white shadow-[2px_2px_0px_0px_#0D0D0D]'
                : 'bg-[#8BA3A7] hover:bg-white/50'
            }`}
          >
            LISTA ({amigosList.length})
          </button>

          <button
            {...gsapButtonMotion}
            onClick={() => setActiveTab('buscar')}
            className={`py-2 text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all border-2 border-[#0D0D0D] ${
              activeTab === 'buscar'
                ? 'bg-[#FF7800] text-white shadow-[2px_2px_0px_0px_#0D0D0D]'
                : 'bg-[#8BA3A7] hover:bg-white/50'
            }`}
          >
            🔍 BUSCAR
          </button>

          <button
            {...gsapButtonMotion}
            onClick={() => setActiveTab('solicitudes')}
            className={`relative py-2 text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all border-2 border-[#0D0D0D] ${
              activeTab === 'solicitudes'
                ? 'bg-[#FF7800] text-white shadow-[2px_2px_0px_0px_#0D0D0D]'
                : 'bg-[#8BA3A7] hover:bg-white/50'
            }`}
          >
            SOLICITUDES
            {solicitudesList.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-black text-white border border-[#0D0D0D]">
                {solicitudesList.length}
              </span>
            )}
          </button>
        </div>

        {/* PESTAÑA 1: LISTA DE AMIGOS */}
        {activeTab === 'lista' && (
          <div data-friends-enter className="flex flex-col gap-3 min-h-[260px] max-h-[340px] overflow-y-auto pr-1">
            {amigosList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-[#0D0D0D]/40 text-center">
                <span className="text-3xl mb-2">👥</span>
                <p className="text-xs font-black uppercase tracking-widest text-[#0D0D0D]">
                  AÚN NO TIENES AMIGOS AGREGADOS
                </p>
                <p className="mt-1 text-[10px] font-bold text-[#0D0D0D]/70 uppercase">
                  Usa la pestaña "BUSCAR" para enviar solicitudes
                </p>
              </div>
            ) : (
              amigosList.map((amigo) => (
                <div
                  key={amigo.uid}
                  className="flex items-center justify-between border-2 border-[#0D0D0D] bg-[#8BA3A7] p-3 shadow-[3px_3px_0px_0px_#0D0D0D]"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden border-2 border-[#0D0D0D] bg-[#1B384B] font-black text-[#FF7800]">
                      {amigo.photoURL ? (
                        <img src={amigo.photoURL} alt={amigo.username} className="h-full w-full object-cover" />
                      ) : (
                        amigo.username?.slice(0, 1).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-black uppercase tracking-widest truncate">{amigo.username}</p>
                      <p className="text-[9px] font-bold text-[#0D0D0D]/70 uppercase truncate">{amigo.nickname || 'SIN APODO'}</p>
                    </div>
                  </div>

                  <button
                    {...gsapButtonMotion}
                    onClick={() => alert(`Próximamente retarás al fantasma de ${amigo.username}`)}
                    className="button-primary px-3 py-1.5 text-[10px] font-black uppercase tracking-widest ml-2"
                  >
                    👻 RETAR
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* PESTAÑA 2: BUSCAR AMIGOS */}
        {activeTab === 'buscar' && (
          <div data-friends-enter className="flex flex-col gap-4 min-h-[260px]">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                placeholder="INGRESA EL USUARIO EXACTO"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 border-2 border-[#0D0D0D] bg-white px-3 py-2 text-xs font-bold uppercase tracking-widest text-[#0D0D0D] focus:border-[#FF7800] focus:outline-none placeholder:text-[#0D0D0D]/50"
              />
              <button
                type="submit"
                disabled={isSearching}
                {...gsapButtonMotion}
                className="button-primary px-4 py-2 text-xs font-black uppercase tracking-widest disabled:opacity-50"
              >
                {isSearching ? '...' : 'BUSCAR'}
              </button>
            </form>

            {searchResults === null ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-[#0D0D0D]/60">
                <p className="text-xs font-bold uppercase tracking-widest">
                  Busca a tus amigos por su nombre de usuario registrado
                </p>
              </div>
            ) : searchResults ? (
              <div className="flex items-center justify-between border-2 border-[#0D0D0D] bg-[#8BA3A7] p-3 shadow-[3px_3px_0px_0px_#0D0D0D]">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden border-2 border-[#0D0D0D] bg-[#1B384B] font-black text-[#FF7800]">
                    {searchResults.photoURL ? (
                      <img src={searchResults.photoURL} alt={searchResults.username} className="h-full w-full object-cover" />
                    ) : (
                      searchResults.username?.slice(0, 1).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-black uppercase tracking-widest truncate">{searchResults.username}</p>
                    <p className="text-[9px] font-bold text-[#0D0D0D]/70 uppercase truncate">{searchResults.nickname || 'SIN APODO'}</p>
                  </div>
                </div>

                {requestStatus === 'self' ? (
                  <span className="text-[9px] font-black text-[#0D0D0D]/60 uppercase tracking-widest px-2">
                    ES TU USUARIO
                  </span>
                ) : requestStatus === 'already_friends' ? (
                  <span className="text-[9px] font-black text-[#0D0D0D] uppercase tracking-widest px-2">
                    ✓ YA ES TU AMIGO
                  </span>
                ) : requestStatus === 'already_sent' || requestStatus === 'sent' ? (
                  <span className="text-[9px] font-black text-[#FF7800] uppercase tracking-widest px-2">
                    ✓ ENVIADA
                  </span>
                ) : (
                  <button
                    {...gsapButtonMotion}
                    onClick={handleSendRequest}
                    disabled={requestStatus === 'sending'}
                    className="button-primary px-3 py-1.5 text-[10px] font-black uppercase tracking-widest ml-2"
                  >
                    {requestStatus === 'sending' ? 'ENVIANDO...' : '+ AGREGAR'}
                  </button>
                )}
              </div>
            ) : (
              <div className="py-6 text-center text-xs font-black text-red-700 uppercase tracking-widest">
                No se encontró ningún usuario con ese nombre
              </div>
            )}
          </div>
        )}

        {/* PESTAÑA 3: SOLICITUDES PENDIENTES */}
        {activeTab === 'solicitudes' && (
          <div data-friends-enter className="flex flex-col gap-3 min-h-[260px] max-h-[340px] overflow-y-auto pr-1">
            {solicitudesList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-[#0D0D0D]/40 text-center">
                <span className="text-3xl mb-2">📩</span>
                <p className="text-xs font-black uppercase tracking-widest text-[#0D0D0D]">
                  NO TIENES SOLICITUDES PENDIENTES
                </p>
              </div>
            ) : (
              solicitudesList.map((solicitud) => (
                <div
                  key={solicitud.id}
                  className="flex items-center justify-between border-2 border-[#0D0D0D] bg-[#8BA3A7] p-3 shadow-[3px_3px_0px_0px_#0D0D0D]"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="text-xs font-black uppercase tracking-widest truncate">{solicitud.fromUsername}</p>
                    <p className="text-[9px] font-bold text-[#0D0D0D]/70 uppercase">TE ENVIÓ UNA SOLICITUD</p>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <button
                      {...gsapButtonMotion}
                      onClick={() => handleAcceptRequest(solicitud)}
                      className="button-primary px-3 py-1 text-[10px] font-black uppercase tracking-widest"
                    >
                      ✓ ACEPTAR
                    </button>
                    <button
                      {...gsapButtonMotion}
                      onClick={() => handleRejectRequest(solicitud.id)}
                      className="button-secondary px-3 py-1 text-[10px] font-black uppercase tracking-widest"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </ModalOverlay>
  );
}