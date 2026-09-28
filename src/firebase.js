import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB-zKN5ZI8s5f3llayUwLrG8AM-BYwJUQ4",
  authDomain: "oc-bloobit.firebaseapp.com",
  projectId: "oc-bloobit",
  storageBucket: "oc-bloobit.firebasestorage.app",
  messagingSenderId: "353084857863",
  appId: "1:353084857863:web:9bf1873d7003ad3fecd4a2",
  measurementId: "G-BFV1CJEC29",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
// Cortar reintentos rápido: si Storage no responde, falla en ~12s en vez de colgarse 2 min.
storage.maxUploadRetryTime = 12000;
storage.maxOperationRetryTime = 12000;
