export interface Frame {
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  category: 'Men' | 'Women' | 'Unisex';
  shape: 'Round' | 'Square' | 'Aviator' | 'Cat Eye';
  colors: string[];
}

export interface Prescription {
  type: 'manual' | 'upload' | 'none';
  od?: EyePrescription; // Right eye
  os?: EyePrescription; // Left eye
  file?: File | null;
  pd?: number; // Pupillary Distance
}

export interface Brand {
  id: string;
  name: string;
  image: string;
}

export interface Story {
  id: string;
  title: string;
  image: string;
  oldPrice: number;
  newPrice: number;
}

export interface EyePrescription {
  sphere: string;
  cylinder: string;
  axis: string;
}

export interface LensTreatment {
  id: string;
  name: string;
  description: string;
  price: number;
}

export interface CartItem {
  id: string; // unique cart item id
  frame: Frame;
  prescription: Prescription | null;
  treatments: LensTreatment[];
  totalPrice: number;
}
