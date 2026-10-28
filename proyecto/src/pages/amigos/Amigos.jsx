import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { gsapButtonMotion } from '../../utils/gsapButtonMotion.js';
import ModalOverlay from '../../components/ui/ModalOverlay.jsx';
import { useAppNavigation } from '../../utils/useAppNavigation.js';

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

const OFFSET_ESCENAS_UNITY = -1;

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

const getChatId = (uid1, uid2) => {
  return [uid1, uid2].sort().join('_');
};

export default function Amigos() {
  const navigate = useAppNavigation();
  const containerRef = useRef(null);
  const chatScrollRef = useRef(null);
  const chatFileInputRef = useRef(null);

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
  const [activeChatFriend, setActiveChatFriend] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [previewImage, setPreviewImage] = useState(null);

  // ESTADOS DEL MODAL DE DESAFÍO FANTASMA
  const [challengeFriend, setChallengeFriend] = useState(null);
  const [challengeLevels, setChallengeLevels] = useState([]);
  const [isLoadingChallenge, setIsLoadingChallenge] = useState(false);

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

  // 4. Procesar selección de imagen para adjuntar
  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 512;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
        setPreviewImage(compressedBase64);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // 5. Enviar mensaje de texto o con imagen
  const handleSendMessage = async (e) => {
    e.preventDefault();
    const text = newMessageText.trim();
    if ((!text && !previewImage) || !activeChatFriend || !currentUserData) return;

    const currentText = text;
    const currentImg = previewImage;

    setNewMessageText('');
    setPreviewImage(null);

    try {
      const chatId = getChatId(currentUserData.uid, activeChatFriend.uid);
      const messagesRef = collection(db, 'chats', chatId, 'messages');

      await addDoc(messagesRef, {
        senderUid: currentUserData.uid,
        text: currentText,
        imageURL: currentImg || null,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
    }
  };

  // 6. Abrir perfil de otro jugador
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

  // 7. Abrir modal para elegir nivel a retar contra el fantasma
  const handleOpenChallengeModal = async (amigo) => {
    if (!amigo || !amigo.uid) return;
    setIsLoadingChallenge(true);
    setChallengeFriend(amigo);
    setChallengeLevels([]);

    try {
      const userDoc = await getDoc(doc(db, 'users', amigo.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        let prog = data.progress;
        if (typeof prog === 'string') {
          try { prog = JSON.parse(prog); } catch (e) {}
        }

        if (prog && Array.isArray(prog.niveles)) {
          // Filtrar niveles completados por el amigo
          const nivelesJugados = prog.niveles.filter(n => n.estrellaCompletado);
          setChallengeLevels(nivelesJugados);
        }
      }
    } catch (error) {
      console.error("Error al obtener datos de desafío:", error);
    } finally {
      setIsLoadingChallenge(false);
    }
  };

  // 8. Iniciar partida contra el fantasma (se mapea idNivel exacto a la escena de Unity)
  const handleStartGhostChallenge = (nivelProgress) => {
    if (!nivelProgress || !challengeFriend) return;

    let numNivel = parseInt(nivelProgress.idNivel, 10);
    if (isNaN(numNivel)) {
      numNivel = parseInt(String(nivelProgress.idNivel).replace(/\D/g, ''), 10) || 1;
    }

    const indiceEscenaUnity = numNivel + OFFSET_ESCENAS_UNITY;

    navigate('/gameplay', {
      state: {
        nivelSeleccionado: indiceEscenaUnity,
        ghostData: nivelProgress.ghostData || null,
        friendName: challengeFriend.username || challengeFriend.fromUsername || 'Amigo'
      }
    });
  };

  // 9. Buscar usuario por username
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

  // 10. Enviar solicitud de amistad
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

  // 11. Aceptar solicitud
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

  // 12. Rechazar solicitud
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
                ? 'bg-[#F4A340] text-[#0D0D0D] shadow-[2px_2px_0px_0px_#0D0D0D]'
                : 'bg-[#D8E4E6] hover:bg-white/50'
            }`}
          >
            LISTA ({amigosList.length})
          </button>

          <button
            {...gsapButtonMotion}
            onClick={() => setActiveTab('buscar')}
            className={`py-2 text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all border-2 border-[#0D0D0D] ${
              activeTab === 'buscar'
                ? 'bg-[#F4A340] text-[#0D0D0D] shadow-[2px_2px_0px_0px_#0D0D0D]'
                : 'bg-[#D8E4E6] hover:bg-white/50'
            }`}
          >
            🔍 BUSCAR
          </button>

          <button
            {...gsapButtonMotion}
            onClick={() => setActiveTab('solicitudes')}
            className={`relative py-2 text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all border-2 border-[#0D0D0D] ${
              activeTab === 'solicitudes'
                ? 'bg-[#F4A340] text-[#0D0D0D] shadow-[2px_2px_0px_0px_#0D0D0D]'
                : 'bg-[#D8E4E6] hover:bg-white/50'
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
              <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-[#0D0D0D] text-center">
                <span className="text-3xl mb-2">👥</span>
                <p className="text-xs font-black uppercase tracking-widest text-[#0D0D0D]">
                  AÚN NO TIENES AMIGOS AGREGADOS
                </p>
                <p className="mt-1 text-[10px] font-bold text-[#3A4548] uppercase">
                  Usa la pestaña "BUSCAR" para enviar solicitudes
                </p>
              </div>
            ) : (
              amigosList.map((amigo) => (
                <div
                  key={amigo.uid}
                  className="flex items-center justify-between border-2 border-[#0D0D0D] bg-[#D8E4E6] p-3 shadow-[3px_3px_0px_0px_#0D0D0D]"
                >
                  <button
                    type="button"
                    onClick={() => handleViewProfile(amigo.uid)}
                    title="Ver perfil del jugador"
                    className="group flex items-center gap-3 min-w-0 flex-1 text-left cursor-pointer focus:outline-none"
                  >
                    <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden border-2 border-[#0D0D0D] bg-[#142A3A] font-black text-[#FF7800] group-hover:border-[#FF7800] transition-colors">
                      {amigo.photoURL ? (
                        <img src={amigo.photoURL} alt={amigo.username} className="h-full w-full object-cover" />
                      ) : (
                        amigo.username?.slice(0, 1).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-black uppercase tracking-widest truncate group-hover:text-[#963C00] transition-colors">
                        {amigo.username}
                      </p>
                      <p className="text-[9px] font-bold text-[#3A4548] uppercase truncate">{amigo.nickname || 'SIN APODO'}</p>
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
                      onClick={() => handleOpenChallengeModal(amigo)}
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
                className="flex-1 border-2 border-[#0D0D0D] bg-white px-3 py-2 text-xs font-bold uppercase tracking-widest text-[#0D0D0D] focus:border-[#142A3A] focus:outline-none focus:ring-2 focus:ring-[#142A3A] placeholder:text-[#53636B]"
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
              <div className="flex flex-col items-center justify-center py-8 text-center text-[#3A4548]">
                <p className="text-xs font-bold uppercase tracking-widest">
                  Busca a tus amigos por su nombre de usuario registrado
                </p>
              </div>
            ) : searchResults ? (
              <div className="flex items-center justify-between border-2 border-[#0D0D0D] bg-[#D8E4E6] p-3 shadow-[3px_3px_0px_0px_#0D0D0D]">
                <button
                  type="button"
                  onClick={() => handleViewProfile(searchResults.uid)}
                  title="Ver perfil del jugador"
                  className="group flex items-center gap-3 min-w-0 flex-1 text-left cursor-pointer focus:outline-none"
                >
                  <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden border-2 border-[#0D0D0D] bg-[#142A3A] font-black text-[#FF7800] group-hover:border-[#FF7800] transition-colors">
                    {searchResults.photoURL ? (
                      <img src={searchResults.photoURL} alt={searchResults.username} className="h-full w-full object-cover" />
                    ) : (
                      searchResults.username?.slice(0, 1).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-black uppercase tracking-widest truncate group-hover:text-[#963C00] transition-colors">
                      {searchResults.username}
                    </p>
                    <p className="text-[9px] font-bold text-[#3A4548] uppercase truncate">{searchResults.nickname || 'SIN APODO'}</p>
                  </div>
                </button>

                {requestStatus === 'self' ? (
                  <span className="text-[9px] font-black text-[#3A4548] uppercase tracking-widest px-2">
                    ES TU USUARIO
                  </span>
                ) : requestStatus === 'already_friends' ? (
                  <span className="text-[9px] font-black text-[#0D0D0D] uppercase tracking-widest px-2">
                    ✓ YA ES TU AMIGO
                  </span>
                ) : requestStatus === 'already_sent' || requestStatus === 'sent' ? (
                  <span className="text-[9px] font-black text-[#963C00] uppercase tracking-widest px-2">
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
              <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-[#0D0D0D] text-center">
                <span className="text-3xl mb-2">📩</span>
                <p className="text-xs font-black uppercase tracking-widest text-[#0D0D0D]">
                  NO TIENES SOLICITUDES PENDIENTES
                </p>
              </div>
            ) : (
              solicitudesList.map((solicitud) => (
                <div
                  key={solicitud.id}
                  className="flex items-center justify-between border-2 border-[#0D0D0D] bg-[#D8E4E6] p-3 shadow-[3px_3px_0px_0px_#0D0D0D]"
                >
                  <button
                    type="button"
                    onClick={() => handleViewProfile(solicitud.fromUid)}
                    title="Ver perfil del remitente"
                    className="group min-w-0 flex-1 pr-2 text-left cursor-pointer focus:outline-none"
                  >
                    <p className="text-xs font-black uppercase tracking-widest truncate group-hover:text-[#963C00] transition-colors">
                      {solicitud.fromUsername}
                    </p>
                    <p className="text-[9px] font-bold text-[#3A4548] uppercase">TE ENVIÓ UNA SOLICITUD</p>
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
          <div className="border-2 border-[#0D0D0D] bg-[#D8E4E6] p-4 text-xs font-black uppercase tracking-widest text-[#0D0D0D] shadow-[4px_4px_0px_0px_#0D0D0D]">
            CARGANDO PERFIL...
          </div>
        </div>
      )}

      {/* OVERLAY DE VISTA DE PERFIL DE JUGADOR */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D0D0D]/80 p-4">
          <div className="relative flex w-full max-w-md flex-col gap-4 border-2 border-[#0D0D0D] bg-[#D8E4E6] p-5 font-sans shadow-[4px_4px_0px_0px_#0D0D0D]">
            
            <div className="flex items-center justify-between border-b-2 border-[#0D0D0D] pb-3">
              <span className="text-xs font-black uppercase tracking-widest text-[#0D0D0D]">
                PERFIL DE JUGADOR
              </span>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="text-sm font-black text-[#0D0D0D] hover:text-[#963C00]"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center gap-4 border-2 border-[#0D0D0D] bg-[#142A3A] p-3 text-white shadow-[3px_3px_0px_0px_#0D0D0D]">
              <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden border-2 border-[#0D0D0D] bg-[#D8E4E6] text-2xl font-black text-[#963C00]">
                {selectedUser.photoURL ? (
                  <img src={selectedUser.photoURL} alt={selectedUser.username} className="h-full w-full object-cover" />
                ) : (
                  selectedUser.username?.slice(0, 1).toUpperCase()
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-black uppercase tracking-widest truncate">{selectedUser.username}</p>
                <p className="text-[10px] font-bold text-[#963C00] uppercase tracking-widest truncate">
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
                <strong className="text-lg font-black text-[#963C00]">{selectedStats.completionPercent}%</strong>
                <span className="text-[8px] font-bold text-[#3A4548]">{selectedStats.completedLevels} / 10 NIVELES</span>
              </div>

              <div className="flex flex-col border-2 border-[#0D0D0D] bg-white p-3 shadow-[2px_2px_0px_0px_#0D0D0D]">
                <span className="text-[9px] font-black uppercase tracking-widest text-[#0D0D0D]">ESTRELLAS</span>
                <strong className="text-lg font-black text-[#963C00]">{selectedStats.stars} ★</strong>
                <span className="text-[8px] font-bold text-[#3A4548]">DE 30 POSIBLES</span>
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
                      const fData = { ...selectedUser };
                      setSelectedUser(null);
                      handleOpenChallengeModal(fData);
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

      {/* MODAL DE SELECCIÓN DE NIVEL PARA RETAR AL FANTASMA */}
      {challengeFriend && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D0D0D]/80 p-4">
          <div className="relative flex w-full max-w-md flex-col gap-4 border-2 border-[#0D0D0D] bg-[#D8E4E6] p-5 font-sans shadow-[4px_4px_0px_0px_#0D0D0D]">
            
            <div className="flex items-center justify-between border-b-2 border-[#0D0D0D] pb-3">
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-[#0D0D0D]">
                  DESAFÍO FANTASMA 👻
                </h3>
                <p className="text-[10px] font-bold text-[#963C00] uppercase tracking-wider">
                  RETANDO A: {challengeFriend.username || challengeFriend.fromUsername}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setChallengeFriend(null)}
                className="text-sm font-black text-[#0D0D0D] hover:text-[#963C00]"
              >
                ✕
              </button>
            </div>

            {isLoadingChallenge ? (
              <div className="py-8 text-center text-xs font-black uppercase tracking-widest text-[#0D0D0D]">
                OBTENIENDO NIVELES DE TU AMIGO...
              </div>
            ) : challengeLevels.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <span className="text-3xl mb-2">🚗</span>
                <p className="text-xs font-black uppercase tracking-widest text-[#0D0D0D]">
                  ESTE JUGADOR AÚN NO HA COMPLETADO NINGÚN NIVEL
                </p>
                <p className="mt-1 text-[10px] font-bold text-[#3A4548] uppercase">
                  Dile a tu amigo que juegue un nivel para poder competir contra su fantasma.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5 max-h-[280px] overflow-y-auto pr-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#3A4548]">
                  Selecciona un nivel jugado por {challengeFriend.username || challengeFriend.fromUsername} para superar su récord:
                </p>
                
                {challengeLevels.map((nivel) => {
                  let numNivel = parseInt(nivel.idNivel, 10);
                  if (isNaN(numNivel)) {
                    numNivel = parseInt(String(nivel.idNivel).replace(/\D/g, ''), 10) || 1;
                  }

                  const tiempoFormateado = nivel.mejorTiempo && nivel.mejorTiempo < 9999
                    ? `${nivel.mejorTiempo.toFixed(2)}s`
                    : 'COMPLETADO';

                  return (
                    <div
                      key={nivel.idNivel}
                      className="flex items-center justify-between border-2 border-[#0D0D0D] bg-white p-3 shadow-[2px_2px_0px_0px_#0D0D0D]"
                    >
                      <div>
                        <p className="text-xs font-black uppercase tracking-widest text-[#0D0D0D]">
                          NIVEL {numNivel}
                        </p>
                        <p className="text-[10px] font-bold text-[#963C00] uppercase tracking-wider">
                          MEJOR TIEMPO: {tiempoFormateado}
                        </p>
                      </div>

                      <button
                        type="button"
                        {...gsapButtonMotion}
                        onClick={() => handleStartGhostChallenge(nivel)}
                        className="button-primary px-3 py-1.5 text-[10px] font-black uppercase tracking-widest"
                      >
                        ¡COMPETIR! 👻
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            <button
              type="button"
              {...gsapButtonMotion}
              onClick={() => setChallengeFriend(null)}
              className="button-secondary w-full py-2 text-xs font-black uppercase tracking-widest mt-1"
            >
              CANCELAR
            </button>

          </div>
        </div>
      )}

      {/* SUB-OVERLAY DE CHAT DE TEXTO E IMÁGENES EN TIEMPO REAL */}
      {activeChatFriend && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D0D0D]/80 p-3 sm:p-4">
          <div className="relative flex h-[420px] sm:h-[460px] max-h-[85vh] w-full max-w-sm sm:max-w-md flex-col border-2 border-[#0D0D0D] bg-[#D8E4E6] font-sans shadow-[4px_4px_0px_0px_#0D0D0D] overflow-hidden">
            
            {/* ENCABEZADO DEL CHAT */}
            <div className="flex items-center justify-between border-b-2 border-[#0D0D0D] bg-[#142A3A] p-2.5 sm:p-3 text-white">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="grid h-8 w-8 sm:h-9 sm:w-9 shrink-0 place-items-center overflow-hidden border-2 border-[#0D0D0D] bg-[#D8E4E6] font-black text-[#963C00]">
                  {activeChatFriend.photoURL ? (
                    <img src={activeChatFriend.photoURL} alt={activeChatFriend.username} className="h-full w-full object-cover" />
                  ) : (
                    activeChatFriend.username?.slice(0, 1).toUpperCase()
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase tracking-widest truncate">{activeChatFriend.username}</p>
                  <p className="text-[8px] font-bold text-[#963C00] uppercase tracking-widest">CHAT DE TEXTO</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setActiveChatFriend(null);
                  setPreviewImage(null);
                }}
                className="text-sm font-black text-white hover:text-[#FF7800] px-2"
              >
                ✕
              </button>
            </div>

            {/* CAJA DE MENSAJES */}
            <div 
              ref={chatScrollRef}
              className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5 bg-[#D8E4E6]"
            >
              {chatMessages.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center text-center text-[#3A4548] my-auto">
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
                            ? 'bg-[#F4A340] text-[#0D0D0D]'
                            : 'bg-white text-[#0D0D0D]'
                        }`}
                      >
                        {msg.imageURL && (
                          <img 
                            src={msg.imageURL} 
                            alt="Imagen adjunta" 
                            className="mb-1 max-h-40 w-full border border-[#0D0D0D] object-cover" 
                          />
                        )}
                        {msg.text && <p className="break-words leading-relaxed">{msg.text}</p>}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* VISTA PREVIA DE IMAGEN ADJUNTA */}
            {previewImage && (
              <div className="relative flex items-center gap-2 border-t-2 border-[#0D0D0D] bg-[#D8E4E6] px-3 py-1.5">
                <img src={previewImage} alt="Adjunto" className="h-10 w-10 border border-[#0D0D0D] object-cover" />
                <span className="text-[9px] font-black uppercase text-[#0D0D0D]">Imagen adjuntada</span>
                <button
                  type="button"
                  onClick={() => setPreviewImage(null)}
                  className="ml-auto text-xs font-black text-red-700 hover:text-red-900"
                >
                  ✕
                </button>
              </div>
            )}

            {/* FORMULARIO PARA ENVIAR MENSAJE */}
            <form onSubmit={handleSendMessage} className="flex gap-1.5 border-t-2 border-[#0D0D0D] bg-[#142A3A] p-2 sm:p-2.5">
              <input
                type="file"
                ref={chatFileInputRef}
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => chatFileInputRef.current?.click()}
                title="Adjuntar imagen"
                className="button-secondary px-2.5 py-1.5 text-xs font-black uppercase shrink-0"
              >
                📷
              </button>

              <input
                type="text"
                placeholder="MENSAJE..."
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                className="flex-1 min-w-0 border-2 border-[#0D0D0D] bg-white px-2.5 py-1.5 text-xs font-bold uppercase tracking-widest text-[#0D0D0D] focus:border-[#142A3A] focus:outline-none focus:ring-2 focus:ring-[#142A3A] placeholder:text-[#53636B]"
              />
              <button
                type="submit"
                {...gsapButtonMotion}
                className="button-primary px-3 py-1.5 text-xs font-black uppercase tracking-widest shrink-0"
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
