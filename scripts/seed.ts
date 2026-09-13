import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

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

const FRAMES = [
  {
    id: 'f1',
    name: 'The Architect',
    brand: 'Optica Signature',
    price: 145,
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=800',
    category: 'Unisex',
    shape: 'Round',
    colors: ['#000000', '#4A3B32'],
  },
  {
    id: 'f2',
    name: 'Classic Square',
    brand: 'Visionary',
    price: 125,
    image: 'https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&q=80&w=800',
    category: 'Men',
    shape: 'Square',
    colors: ['#1A1A1A', '#8B4513'],
  },
  {
    id: 'f3',
    name: 'Retro Aviator',
    brand: 'Lumina',
    price: 160,
    image: 'https://images.unsplash.com/photo-1572402230267-f3e267c1e5d2?auto=format&fit=crop&q=80&w=800',
    category: 'Unisex',
    shape: 'Aviator',
    colors: ['#FFD700', '#C0C0C0'],
  },
  {
    id: 'f4',
    name: 'Minimalist Wire',
    brand: 'Optica Signature',
    price: 135,
    image: 'https://images.unsplash.com/photo-1625591342279-b1d5bd33db5f?auto=format&fit=crop&q=80&w=800',
    category: 'Women',
    shape: 'Round',
    colors: ['#C0C0C0', '#B87333'],
  },
  {
    id: 'f5',
    name: 'Bold Cat Eye',
    brand: 'Aura',
    price: 155,
    image: 'https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&q=80&w=800',
    category: 'Women',
    shape: 'Cat Eye',
    colors: ['#000000', '#800000'],
  }
];

const TREATMENTS = [
  {
    id: 't1',
    name: 'Standard CR-39',
    description: 'Basic clear lenses suitable for everyday wear. No extra charge.',
    price: 0,
  },
  {
    id: 't2',
    name: 'Anti-Reflective Coating',
    description: 'Reduces glare from screens and headlights, improving clarity.',
    price: 50,
  },
  {
    id: 't3',
    name: 'Blue Light Filter',
    description: 'Blocks harmful blue light emitted from digital devices. Includes Anti-Reflective coating.',
    price: 80,
  },
  {
    id: 't4',
    name: 'High-Index (Thin Lenses)',
    description: 'Thinner and lighter lenses, recommended for stronger prescriptions (Sphere > +/- 4.00).',
    price: 120,
  }
];

const STORIES = [
  { 
    id: 's1', 
    title: 'Sold', 
    image: 'https://images.unsplash.com/photo-1559838031-6e1189178347?w=800&q=80', 
    oldPrice: 180,
    newPrice: 120
  },
  { 
    id: 's2', 
    title: 'Sold', 
    image: 'https://images.unsplash.com/photo-1509695507497-903c140c43b0?w=800&q=80', 
    oldPrice: 145,
    newPrice: 95
  },
  { 
    id: 's3', 
    title: 'Sold', 
    image: 'https://images.unsplash.com/photo-1522204523234-8729aa6e3d5f?w=800&q=80', 
    oldPrice: 200,
    newPrice: 150
  },
  { 
    id: 's4', 
    title: 'Sold', 
    image: 'https://images.unsplash.com/photo-1589830500806-0563f69542a2?w=800&q=80', 
    oldPrice: 135,
    newPrice: 85
  },
  { 
    id: 's5', 
    title: 'Sold', 
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80', 
    oldPrice: 160,
    newPrice: 110
  }
];

async function seed() {
  console.log('Seeding frames...');
  for (const frame of FRAMES) {
    await setDoc(doc(db, 'frames', frame.id), frame);
  }
  
  console.log('Seeding treatments...');
  for (const treatment of TREATMENTS) {
    await setDoc(doc(db, 'treatments', treatment.id), treatment);
  }

  console.log('Seeding stories...');
  for (const story of STORIES) {
    await setDoc(doc(db, 'stories', story.id), story);
  }

  console.log('Done!');
  process.exit(0);
}

seed().catch(console.error);
