import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBLI3lrs7meSSygek6BGDxMPKmkptm_qv0",
  authDomain: "voxeldrift-df06f.firebaseapp.com",
  projectId: "voxeldrift-df06f",
  storageBucket: "voxeldrift-df06f.firebasestorage.app",
  messagingSenderId: "960752144744",
  appId: "1:960752144744:web:0d04306082a32a28f4c6dd"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);