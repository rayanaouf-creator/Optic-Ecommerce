export type Gender = 'Men' | 'Women' | 'Unisex';
export type AgeGroup = 'Adult' | 'Kid'; // Tranche d'âge: Adulte ou Enfant

export interface Frame {
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  gender: Gender;                 // Sexe: Homme (Men), Femme (Women), Unisexe (Unisex)
  ageGroup: AgeGroup;             // Tranche d'âge: Adulte (Adult) ou Enfant (Kid)
  category?: 'Men' | 'Women' | 'Unisex' | string; // Backward compatibility
  shape: 'Round' | 'Square' | 'Aviator' | 'Cat Eye';
  colors: string[];
  stockQuantity?: number;         // Available inventory quantity (e.g. 10, 5, 0)
  inStock?: boolean;              // Whether the item is available for order
  sku?: string;                   // Optional SKU/Reference code
  lowStockThreshold?: number;     // Alert threshold (default: 3)
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
  brand?: string;
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

export interface Order {
  id: string;
  frameId: string;
  frameName: string;
  customerName: string;
  customerPhone: string;
  wilaya: string;
  commune: string;
  addressDetails?: string;
  deliveryMethod: 'home' | 'desk';
  needsCorrectingLenses: boolean;
  leftSph?: string | null;
  leftCyl?: string | null;
  rightSph?: string | null;
  rightCyl?: string | null;
  leftEye?: string | null;
  rightEye?: string | null;
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled';
  createdAt: any;
}
