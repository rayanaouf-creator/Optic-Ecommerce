import { Frame, LensTreatment } from './types';

export const FRAMES: Frame[] = [
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

export const TREATMENTS: LensTreatment[] = [
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
