import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDXMjBnQ17H2rW4eq6P0Ncq4hyxLfuM4AE",
  authDomain: "burgerorder-typescript.firebaseapp.com",
  projectId: "burgerorder-typescript",
  storageBucket: "burgerorder-typescript.firebasestorage.app",
  messagingSenderId: "556746695349",
  appId: "1:556746695349:web:928b7b9f745d53592dd4fc"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);