import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

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
