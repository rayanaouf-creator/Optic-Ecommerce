import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import fs from 'fs';

const config = {
  "projectId": "gen-lang-client-0343806632",
  "appId": "1:860983179239:web:7ab1c719d026f1073a6f42",
  "apiKey": "AIzaSyA1xl28dy35Y4EC_zdjfe2UT1SGokHFMKU",
  "authDomain": "gen-lang-client-0343806632.firebaseapp.com",
  "storageBucket": "gen-lang-client-0343806632.firebasestorage.app",
  "messagingSenderId": "860983179239"
};
const app = initializeApp(config);

async function run() {
  try {
    const db = getFirestore(app);
    console.log("Querying db: (default)");
    const snap = await getDocs(collection(db, 'brands'));
    console.log(`Success! Found ${snap.docs.length} brands.`);
  } catch (e) {
    console.error(`Error ->`, e);
  }
  process.exit(0);
}
run();
