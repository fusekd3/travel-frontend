import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCvjwu9JGYrWPKjIawfIv9zB49mCYcRUpY",
  authDomain: "travell-f136c.firebaseapp.com",
  projectId: "travell-f136c",
  storageBucket: "travell-f136c.firebasestorage.app",
  messagingSenderId: "228180543950",
  appId: "1:228180543950:web:e569baf3b26996d290039f",
  measurementId: "G-5FV0R2PGLK"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);  