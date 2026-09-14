import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);

async function clearCollection(db, collectionName) {
  console.log(`Clearing ${collectionName}...`);
  const snap = await getDocs(collection(db, collectionName));
  console.log(`Found ${snap.docs.length} items in ${collectionName}`);
  for (const document of snap.docs) {
    await deleteDoc(doc(db, collectionName, document.id));
  }
  console.log(`Cleared ${collectionName}.`);
}

async function run() {
  try {
    const dbId = config.databaseId || config.firestoreDatabaseId;
    const db = dbId ? getFirestore(app, dbId) : getFirestore(app);
    console.log("Using db:", dbId || '(default)');
    
    await clearCollection(db, 'frames');
    await clearCollection(db, 'brands');
    await clearCollection(db, 'stories');
    await clearCollection(db, 'orders');
    
  } catch (e) {
    console.error(`Error ->`, e);
  }
  process.exit(0);
}
run();
