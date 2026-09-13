import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadString } from 'firebase/storage';

const firebaseConfig = {  
  apiKey: "AIzaSyA1xl28dy35Y4EC_zdjfe2UT1SGokHFMKU",  
  authDomain: "gen-lang-client-0343806632.firebaseapp.com",  
  projectId: "gen-lang-client-0343806632",  
  storageBucket: "gen-lang-client-0343806632.firebasestorage.app",  
  messagingSenderId: "860983179239",  
  appId: "1:860983179239:web:7ab1c719d026f1073a6f42"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const storageRef = ref(storage, 'test.txt');

uploadString(storageRef, 'Hello World').then(() => {
  console.log('Uploaded successfully');
  process.exit(0);
}).catch((error) => {
  console.error('Upload failed', error);
  process.exit(1);
});
