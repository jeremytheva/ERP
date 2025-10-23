import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDN_ZVv5jlV7qh_A2JqQcrt0F7CWoYytx4",
  authDomain: "erpsim-project.firebaseapp.com",
  projectId: "erpsim-project",
  storageBucket: "erpsim-project.appspot.com",
  messagingSenderId: "353698400971",
  appId: "1:353698400971:web:544fffce8ddcba8734a94e",
  measurementId: "G-FKJVTS55SL"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
