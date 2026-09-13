import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA1xl28dy35Y4EC_zdjfe2UT1SGokHFMKU",
  authDomain: "gen-lang-client-0343806632.firebaseapp.com",
  projectId: "gen-lang-client-0343806632",
  storageBucket: "gen-lang-client-0343806632.firebasestorage.app",
  messagingSenderId: "860983179239",
  appId: "1:860983179239:web:7ab1c719d026f1073a6f42"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, "ai-studio-opticapremiumeye-f9660ced-81a0-46d2-bef8-46e4d5cb13a0");

export { db };
