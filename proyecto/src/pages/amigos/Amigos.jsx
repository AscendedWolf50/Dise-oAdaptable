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
  addDoc,
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
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

// Genera una ID única y consistente para la conversación de 2 usuarios
const getChatId = (uid1, uid2) => {
  return [uid1, uid2].sort().join('_');
};

export default function Amigos() {
  const containerRef = useRef(null);
  const chatScrollRef = useRef(null);

  const [activeTab, setActiveTab] = useState('lista'); // 'lista', 'buscar', 'solicitudes'
  
  const [currentUserData, setCurrentUserData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [requestStatus, setRequestStatus] = useState('');

  const [amigosList, setAmigosList] = useState([]);
  const [solicitudesList, setSolicitudesList] = useState([]);

  // ESTADOS PARA VER EL PERFIL DE OTRO JUGADOR
  const [selectedUser, setSelectedUser] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  // ESTADOS DEL CHAT
  const [activeChatFriend, setActiveChatFriend] = useState(null); // Objeto del amigo con quien se chatea
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessageText, setNewMessageText] = useState('');

  // 1. Obtener usuario actual y escuchar solicitudes + amigos en tiempo real
  useEffect(() => {
    let unsubscribeFriends = () => {};
    let unsubscribeRequests = () => {};

    const initFirebaseListeners = async () => {
      const user = await getCurrentUser();
      if (!user) return;

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setCurrentUserData({ uid: user.uid, ...userDoc.data() });
      } else {
        setCurrentUserData({ uid: user.uid, username: user.displayName || 'Jugador' });
      }

      const friendsRef = collection(db, 'users', user.uid, 'friends');
      unsubscribeFriends = onSnapshot(friendsRef, (snapshot) => {
        const friends = snapshot.docs.map(docSnap => ({
          uid: docSnap.id,
          ...docSnap.data()
        }));
        setAmigosList(friends);
      }, (error) => console.error("Error al escuchar amigos:", error));

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

  // 2. Escuchar mensajes del chat activo en tiempo real
  useEffect(() => {
    if (!activeChatFriend || !currentUserData) return;

    const chatId = getChatId(currentUserData.uid, activeChatFriend.uid);
    const messagesQuery = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribeChat = onSnapshot(messagesQuery, (snapshot) => {
      const msgs = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      setChatMessages(msgs);

      // Scroll automático al último mensaje recibido
      setTimeout(() => {
        if (chatScrollRef.current) {
          chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
        }
      }, 50);
    }, (error) => console.error("Error al escuchar mensajes del chat:", error));

    return () => unsubscribeChat();
  }, [activeChatFriend, currentUserData]);

  // 3. Animación de entrada con GSAP
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

  // 4. Enviar un mensaje de chat
  const handleSendMessage = async (e) => {
    e.preventDefault();
    const text = newMessageText.trim();
    if (!text || !activeChatFriend || !currentUserData) return;

    setNewMessageText('');

    try {
      const chatId = getChatId(currentUserData.uid, activeChatFriend.uid);
      const messagesRef = collection(db, 'chats', chatId, 'messages');

      await addDoc(messagesRef, {
        senderUid: currentUserData.uid,
        text,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
    }
  };

  // 5. Abrir perfil de otro jugador
  const handleViewProfile = async (targetUid) => {
    if (!targetUid) return;
    setIsLoadingProfile(true);

    try {
      const userDoc = await getDoc(doc(db, 'users', targetUid));
      if (userDoc.exists()) {
        setSelectedUser({ uid: targetUid, ...userDoc.data() });
      }
    } catch (error) {
      console.error("Error al obtener perfil del jugador:", error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // 6. Buscar usuario por username
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
          const isAlreadyFriend = amigosList.some(f => f.uid === targetUser.uid);
          if (isAlreadyFriend) {
            setRequestStatus('already_friends');
          } else {
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
      console.error("Error al buscar usuario:", error);
      setSearchResults(false);
    } finally {
      setIsSearching(false);
    }
  };

  // 7. Enviar solicitud de amistad
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

  // 8. Aceptar solicitud
  const handleAcceptRequest = async (solicitud) => {
    if (!currentUserData) return;

    try {
      const requestRef = doc(db, 'friend_requests', solicitud.id);
      await updateDoc(requestRef, { status: 'accepted' });

      const myFriendRef = doc(db, 'users', currentUserData.uid, 'friends', solicitud.fromUid);
      await setDoc(myFriendRef, {
        username: solicitud.fromUsername,
        nickname: solicitud.fromNickname || '',
        photoURL: solicitud.fromPhotoURL || null,
        addedAt: serverTimestamp()
      }, { merge: true });

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

  // 9. Rechazar solicitud
  const handleRejectRequest = async (solicitudId) => {
    try {
      const requestRef = doc(db, 'friend_requests', solicitudId);
      await deleteDoc(requestRef);
    } catch (error) {
      console.error("Error al rechazar solicitud:", error);
    }
  };

  const computeUserStats = (profile) => {
    if (!profile) return { completedLevels: 0, stars: 0, completionPercent: 0 };
    
    let niveles = [];
    let prog = profile.progress;
    if (typeof prog === 'string') {
      try { prog = JSON.parse(prog); } catch (e) {}
    }
    if (prog && Array.isArray(prog.niveles)) {
      niveles = prog.niveles;
    }

    const TOTAL_NIVELES = 10;
    const completedLevels = niveles.filter(n => n.estrellaCompletado).length;
    
    let stars = 0;
    niveles.forEach(n => {
      if (n.estrellaCompletado) stars += 1;
      if (n.estrellaTiempo) stars += 1;
      if (n.estrellaPuntos) stars += 1;
    });

    const completionPercent = Math.round((completedLevels / TOTAL_NIVELES) * 100);
    return { completedLevels, stars, completionPercent };
  };

  const selectedStats = selectedUser ? computeUserStats(selectedUser) : null;
  const isSelectedUserFriend = selectedUser ? amigosList.some(f => f.uid === selectedUser.uid) : false;

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
                  <button
                    type="button"
                    onClick={() => handleViewProfile(amigo.uid)}
                    title="Ver perfil del jugador"
                    className="group flex items-center gap-3 min-w-0 flex-1 text-left cursor-pointer focus:outline-none"
                  >
                    <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden border-2 border-[#0D0D0D] bg-[#1B384B] font-black text-[#FF7800] group-hover:border-[#FF7800] transition-colors">
                      {amigo.photoURL ? (
                        <img src={amigo.photoURL} alt={amigo.username} className="h-full w-full object-cover" />
                      ) : (
                        amigo.username?.slice(0, 1).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-black uppercase tracking-widest truncate group-hover:text-[#FF7800] transition-colors">
                        {amigo.username}
                      </p>
                      <p className="text-[9px] font-bold text-[#0D0D0D]/70 uppercase truncate">{amigo.nickname || 'SIN APODO'}</p>
                    </div>
                  </button>

                  <div className="flex gap-1.5 shrink-0 ml-2">
                    <button
                      {...gsapButtonMotion}
                      onClick={() => setActiveChatFriend(amigo)}
                      className="button-secondary px-2.5 py-1.5 text-[10px] font-black uppercase tracking-widest"
                      title="Abrir chat de texto"
                    >
                      💬 CHAT
                    </button>
                    <button
                      {...gsapButtonMotion}
                      onClick={() => alert(`Próximamente retarás al fantasma de ${amigo.username}`)}
                      className="button-primary px-2.5 py-1.5 text-[10px] font-black uppercase tracking-widest"
                    >
                      👻 RETAR
                    </button>
                  </div>
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
                <button
                  type="button"
                  onClick={() => handleViewProfile(searchResults.uid)}
                  title="Ver perfil del jugador"
                  className="group flex items-center gap-3 min-w-0 flex-1 text-left cursor-pointer focus:outline-none"
                >
                  <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden border-2 border-[#0D0D0D] bg-[#1B384B] font-black text-[#FF7800] group-hover:border-[#FF7800] transition-colors">
                    {searchResults.photoURL ? (
                      <img src={searchResults.photoURL} alt={searchResults.username} className="h-full w-full object-cover" />
                    ) : (
                      searchResults.username?.slice(0, 1).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-black uppercase tracking-widest truncate group-hover:text-[#FF7800] transition-colors">
                      {searchResults.username}
                    </p>
                    <p className="text-[9px] font-bold text-[#0D0D0D]/70 uppercase truncate">{searchResults.nickname || 'SIN APODO'}</p>
                  </div>
                </button>

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
                    className="button-primary px-3 py-1.5 text-[10px] font-black uppercase tracking-widest ml-2 shrink-0"
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
                  <button
                    type="button"
                    onClick={() => handleViewProfile(solicitud.fromUid)}
                    title="Ver perfil del remitente"
                    className="group min-w-0 flex-1 pr-2 text-left cursor-pointer focus:outline-none"
                  >
                    <p className="text-xs font-black uppercase tracking-widest truncate group-hover:text-[#FF7800] transition-colors">
                      {solicitud.fromUsername}
                    </p>
                    <p className="text-[9px] font-bold text-[#0D0D0D]/70 uppercase">TE ENVIÓ UNA SOLICITUD</p>
                  </button>

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

      {/* INDICADOR DE CARGA DE PERFIL */}
      {isLoadingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D0D0D]/70 p-4">
          <div className="border-2 border-[#0D0D0D] bg-[#8BA3A7] p-4 text-xs font-black uppercase tracking-widest text-[#0D0D0D] shadow-[4px_4px_0px_0px_#0D0D0D]">
            CARGANDO PERFIL...
          </div>
        </div>
      )}

      {/* OVERLAY DE VISTA DE PERFIL DE JUGADOR */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D0D0D]/80 p-4">
          <div className="relative flex w-full max-w-md flex-col gap-4 border-2 border-[#0D0D0D] bg-[#8BA3A7] p-5 font-sans shadow-[4px_4px_0px_0px_#0D0D0D]">
            
            <div className="flex items-center justify-between border-b-2 border-[#0D0D0D] pb-3">
              <span className="text-xs font-black uppercase tracking-widest text-[#0D0D0D]">
                PERFIL DE JUGADOR
              </span>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="text-sm font-black text-[#0D0D0D] hover:text-[#FF7800]"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center gap-4 border-2 border-[#0D0D0D] bg-[#1B384B] p-3 text-white shadow-[3px_3px_0px_0px_#0D0D0D]">
              <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden border-2 border-[#0D0D0D] bg-[#8BA3A7] text-2xl font-black text-[#FF7800]">
                {selectedUser.photoURL ? (
                  <img src={selectedUser.photoURL} alt={selectedUser.username} className="h-full w-full object-cover" />
                ) : (
                  selectedUser.username?.slice(0, 1).toUpperCase()
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-black uppercase tracking-widest truncate">{selectedUser.username}</p>
                <p className="text-[10px] font-bold text-[#FF7800] uppercase tracking-widest truncate">
                  {selectedUser.nickname || 'SIN APODO'}
                </p>
                <p className="mt-1 text-[9px] font-bold text-gray-300 uppercase tracking-wider">
                  REGISTRO: {selectedUser.joinDate || 'N/A'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col border-2 border-[#0D0D0D] bg-white p-3 shadow-[2px_2px_0px_0px_#0D0D0D]">
                <span className="text-[9px] font-black uppercase tracking-widest text-[#0D0D0D]">COMPLETADO</span>
                <strong className="text-lg font-black text-[#FF7800]">{selectedStats.completionPercent}%</strong>
                <span className="text-[8px] font-bold text-[#0D0D0D]/70">{selectedStats.completedLevels} / 10 NIVELES</span>
              </div>

              <div className="flex flex-col border-2 border-[#0D0D0D] bg-white p-3 shadow-[2px_2px_0px_0px_#0D0D0D]">
                <span className="text-[9px] font-black uppercase tracking-widest text-[#0D0D0D]">ESTRELLAS</span>
                <strong className="text-lg font-black text-[#FF7800]">{selectedStats.stars} ★</strong>
                <span className="text-[8px] font-bold text-[#0D0D0D]/70">DE 30 POSIBLES</span>
              </div>

              <div className="flex flex-col border-2 border-[#0D0D0D] bg-white p-3 shadow-[2px_2px_0px_0px_#0D0D0D]">
                <span className="text-[9px] font-black uppercase tracking-widest text-[#0D0D0D]">TIEMPO JUGADO</span>
                <strong className="text-sm font-black text-[#0D0D0D]">{selectedUser.playedTime || '0h 0m'}</strong>
              </div>

              <div className="flex flex-col border-2 border-[#0D0D0D] bg-white p-3 shadow-[2px_2px_0px_0px_#0D0D0D]">
                <span className="text-[9px] font-black uppercase tracking-widest text-[#0D0D0D]">INTENTOS FALLIDOS</span>
                <strong className="text-sm font-black text-[#0D0D0D]">☠ {selectedUser.failedAttempts ?? 0}</strong>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              {isSelectedUserFriend && (
                <>
                  <button
                    type="button"
                    {...gsapButtonMotion}
                    onClick={() => {
                      const friendData = {
                        uid: selectedUser.uid,
                        username: selectedUser.username,
                        photoURL: selectedUser.photoURL || null
                      };
                      setSelectedUser(null);
                      setActiveChatFriend(friendData);
                    }}
                    className="button-secondary flex-1 py-2 text-xs font-black uppercase tracking-widest"
                  >
                    💬 CHAT
                  </button>

                  <button
                    type="button"
                    {...gsapButtonMotion}
                    onClick={() => {
                      alert(`Iniciando duelo contra el fantasma de ${selectedUser.username}`);
                      setSelectedUser(null);
                    }}
                    className="button-primary flex-1 py-2 text-xs font-black uppercase tracking-widest"
                  >
                    👻 RETAR
                  </button>
                </>
              )}

              <button
                type="button"
                {...gsapButtonMotion}
                onClick={() => setSelectedUser(null)}
                className="button-secondary flex-1 py-2 text-xs font-black uppercase tracking-widest"
              >
                CERRAR
              </button>
            </div>

          </div>
        </div>
      )}

      {/* SUB-OVERLAY DE CHAT DE TEXTO EN TIEMPO REAL */}
      {activeChatFriend && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D0D0D]/80 p-4">
          <div className="relative flex h-[480px] w-full max-w-md flex-col border-2 border-[#0D0D0D] bg-[#8BA3A7] font-sans shadow-[4px_4px_0px_0px_#0D0D0D]">
            
            {/* ENCABEZADO DEL CHAT */}
            <div className="flex items-center justify-between border-b-2 border-[#0D0D0D] bg-[#1B384B] p-3 text-white">
              <div className="flex items-center gap-3 min-w-0">
                <div className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden border-2 border-[#0D0D0D] bg-[#8BA3A7] font-black text-[#FF7800]">
                  {activeChatFriend.photoURL ? (
                    <img src={activeChatFriend.photoURL} alt={activeChatFriend.username} className="h-full w-full object-cover" />
                  ) : (
                    activeChatFriend.username?.slice(0, 1).toUpperCase()
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase tracking-widest truncate">{activeChatFriend.username}</p>
                  <p className="text-[8px] font-bold text-[#FF7800] uppercase tracking-widest">CHAT DE TEXTO</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveChatFriend(null)}
                className="text-sm font-black text-white hover:text-[#FF7800] px-2"
              >
                ✕
              </button>
            </div>

            {/* CAJA DE MENSAJES (SCROLLABLE) */}
            <div 
              ref={chatScrollRef}
              className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5 bg-[#8BA3A7]"
            >
              {chatMessages.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center text-center text-[#0D0D0D]/60 my-auto">
                  <span className="text-2xl mb-1">💬</span>
                  <p className="text-xs font-bold uppercase tracking-widest">
                    Inicia la conversación enviando un mensaje
                  </p>
                </div>
              ) : (
                chatMessages.map((msg) => {
                  const isMine = msg.senderUid === currentUserData?.uid;
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[80%] border-2 border-[#0D0D0D] p-2 text-xs font-bold shadow-[2px_2px_0px_0px_#0D0D0D] ${
                          isMine
                            ? 'bg-[#FF7800] text-white'
                            : 'bg-white text-[#0D0D0D]'
                        }`}
                      >
                        <p className="break-words leading-relaxed">{msg.text}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* FORMULARIO PARA ENVIAR MENSAJE */}
            <form onSubmit={handleSendMessage} className="flex gap-2 border-t-2 border-[#0D0D0D] bg-[#1B384B] p-3">
              <input
                type="text"
                placeholder="ESCRIBE UN MENSAJE..."
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                className="flex-1 border-2 border-[#0D0D0D] bg-white px-3 py-2 text-xs font-bold uppercase tracking-widest text-[#0D0D0D] focus:border-[#FF7800] focus:outline-none placeholder:text-[#0D0D0D]/50"
              />
              <button
                type="submit"
                {...gsapButtonMotion}
                className="button-primary px-4 py-2 text-xs font-black uppercase tracking-widest shrink-0"
              >
                ENVIAR
              </button>
            </form>

          </div>
        </div>
      )}

    </ModalOverlay>
  );
}