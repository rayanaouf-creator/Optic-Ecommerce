import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Brand } from '../types';

export function BrandsSection() {
  const [brands, setBrands] = useState<Brand[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'brands'), (snapshot) => {
      const brandsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Brand));
      setBrands(brandsData);
    }, (error) => {
      console.error('Error fetching brands:', error);
    });

    return () => unsubscribe();
  }, []);

  if (brands.length === 0) return null;

  return (
    <div className="w-full bg-white border-b border-slate-200/50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-6">
        <div>
          <h2 className="text-xs font-semibold text-slate-400 tracking-[0.2em] uppercase">Featured Brands</h2>
        </div>
      </div>
      
      <div className="w-full overflow-x-auto hide-scrollbar pb-2">
        <div className="flex gap-4 sm:gap-8 px-4 sm:px-6 max-w-7xl mx-auto items-center">
          {brands.map((brand) => (
            <div key={brand.id} className="flex flex-col items-center gap-3 shrink-0 group">
              <div className="p-1 rounded-full border border-slate-200 transition-colors group-hover:border-slate-400">
                <img 
                  src={brand.image} 
                  alt={brand.name} 
                  className="w-16 h-16 sm:w-24 sm:h-24 rounded-full object-contain bg-white p-2"
                />
              </div>
              <span className="text-xs sm:text-sm font-medium text-slate-600 tracking-wide">
                {brand.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
