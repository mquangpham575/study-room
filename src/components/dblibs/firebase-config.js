import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from 'firebase/functions';
import { connectFunctionsEmulator } from 'firebase/functions';

const firebaseConfig = {
  apiKey: "AIzaSyAGrzql8I9t9OfhESlBAwA2Jh1S7MOxj_c",
  authDomain: "testyappayappadoo.firebaseapp.com",
  projectId: "testyappayappadoo",
  storageBucket: "testyappayappadoo.firebasestorage.app",
  messagingSenderId: "357937408509",
  appId: "1:357937408509:web:5f877b227b75eb7bf79194"
};

const app = initializeApp(firebaseConfig);

if (process.env.NODE_ENV === 'development')
{
  const functions = getFunctions(app);
  connectFunctionsEmulator(functions, "localhost", 5001);
}

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore();
export const storage = getStorage();