import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
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
