import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);

async function run() {
  try {
    const dbId = config.databaseId || config.firestoreDatabaseId;
    const db = dbId ? getFirestore(app, dbId) : getFirestore(app);
    console.log("Using db:", dbId || '(default)');
    const snap = await getDocs(collection(db, 'treatments'));
    console.log(`Found ${snap.docs.length} treatments`);
  } catch (e) {
    console.error(`Error ->`, e);
  }
  process.exit(0);
}
run();
