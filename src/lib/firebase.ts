import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  projectId: "bongsho-brikkho-family",
  appId: "1:1006675992346:web:7883f73118efeed18616a3",
  storageBucket: "bongsho-brikkho-family.firebasestorage.app",
  apiKey: "AIzaSyBefsCFPl2lkeNI26tu4v2CZj0vac6E0fU",
  authDomain: "bongsho-brikkho-family.firebaseapp.com",
  messagingSenderId: "1006675992346",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);

