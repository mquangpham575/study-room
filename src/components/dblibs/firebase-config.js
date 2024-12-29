import { initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth, GoogleAuthProvider } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { connectStorageEmulator, getStorage } from "firebase/storage";
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
  console.warn('Starting in dev mode');
  connectFunctionsEmulator(getFunctions(app), "localhost", 5001);
  connectAuthEmulator(getAuth(app), "http://127.0.0.1:9099");
  connectFirestoreEmulator(getFirestore(), '127.0.0.1', 8082);
  connectStorageEmulator(getStorage(), "127.0.0.1", 9199);
}

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore();
export const storage = getStorage();