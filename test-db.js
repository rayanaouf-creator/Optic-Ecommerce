import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);

async function testDB(dbId) {
  try {
    const db = dbId ? getFirestore(app, dbId) : getFirestore(app);
    const snap = await getDocs(collection(db, 'brands'));
    console.log(`Success for dbId: ${dbId || '(default)'}`);
  } catch (e) {
    console.error(`Error for dbId: ${dbId || '(default)'} ->`, e.message);
  }
}

async function run() {
  await testDB(undefined);
  await testDB('ai-studio-opticapremiumeye-f9660ced-81a0-46d2-bef8-46e4d5cb13a0');
  process.exit(0);
}
run();
