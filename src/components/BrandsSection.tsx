import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Brand } from '../types';
import { useSearchParams } from 'react-router-dom';
import { Sparkles, X } from 'lucide-react';

export function BrandsSection() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedBrand = searchParams.get('brand');

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'brands'), (snapshot) => {
      const brandsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Brand));
      setBrands(brandsData);
    }, (error) => {
      console.error('Error fetching brands:', error);
    });

    return () => unsubscribe();
  }, []);

  const handleBrandClick = (brandName: string) => {
    const isCurrentlySelected = selectedBrand?.trim().toLowerCase() === brandName.trim().toLowerCase();
    const nextParams = new URLSearchParams(searchParams);
    
    if (isCurrentlySelected) {
      nextParams.delete('brand');
    } else {
      nextParams.set('brand', brandName);
    }
    setSearchParams(nextParams);

    // Smooth scroll down to the product list
    setTimeout(() => {
      const target = document.getElementById('items-section');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 60);
  };

  const handleClearFilter = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('brand');
    setSearchParams(nextParams);
    setTimeout(() => {
      const target = document.getElementById('items-section');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 60);
  };

  if (brands.length === 0) return null;

  return (
    <div className="w-full bg-white border-b border-slate-200/50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-semibold text-slate-400 tracking-[0.2em] uppercase">Featured Brands</h2>
          {selectedBrand && (
            <span className="text-xs text-slate-500 font-medium">
              (Filtered: <span className="font-semibold text-slate-900">{selectedBrand}</span>)
            </span>
          )}
        </div>
        {selectedBrand && (
          <button
            onClick={handleClearFilter}
            className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1 font-medium transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Show All
          </button>
        )}
      </div>
      
      <div className="w-full overflow-x-auto hide-scrollbar pb-2">
        <div className="flex gap-4 sm:gap-8 px-4 sm:px-6 max-w-7xl mx-auto items-center">
          {/* All Brands Circle */}
          <button
            id="brand-circle-all"
            type="button"
            onClick={handleClearFilter}
            className="flex flex-col items-center gap-3 shrink-0 group cursor-pointer focus:outline-none"
            aria-label="View all brands"
          >
            <div className={`w-16 h-16 sm:w-24 sm:h-24 rounded-full border flex flex-col items-center justify-center p-2 transition-all duration-300 ${
              !selectedBrand
                ? 'border-slate-900 bg-slate-900 text-white shadow-md ring-2 ring-slate-900 ring-offset-2'
                : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-400 group-hover:scale-105'
            }`}>
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 mb-0.5" />
              <span className="text-[10px] sm:text-xs font-bold tracking-wider uppercase">ALL</span>
            </div>
            <span className={`text-xs sm:text-sm tracking-wide transition-colors ${
              !selectedBrand ? 'font-bold text-slate-900' : 'font-medium text-slate-600 group-hover:text-slate-900'
            }`}>
              All Brands
            </span>
          </button>

          {/* Individual Brand Circles */}
          {brands.map((brand) => {
            const isSelected = selectedBrand?.trim().toLowerCase() === brand.name.trim().toLowerCase();
            return (
              <button
                key={brand.id}
                id={`brand-circle-${brand.id}`}
                type="button"
                onClick={() => handleBrandClick(brand.name)}
                className="flex flex-col items-center gap-3 shrink-0 group cursor-pointer focus:outline-none"
                aria-label={`View ${brand.name} items`}
              >
                <div className={`p-1 rounded-full border transition-all duration-300 ${
                  isSelected 
                    ? 'border-slate-900 ring-2 ring-slate-900 ring-offset-2 scale-105 shadow-md bg-white' 
                    : 'border-slate-200 group-hover:border-slate-400 group-hover:scale-105 bg-white'
                }`}>
                  <img 
                    src={brand.image} 
                    alt={brand.name} 
                    className="w-16 h-16 sm:w-24 sm:h-24 rounded-full object-contain bg-white p-2"
                  />
                </div>
                <span className={`text-xs sm:text-sm tracking-wide transition-colors ${
                  isSelected 
                    ? 'font-bold text-slate-900' 
                    : 'font-medium text-slate-600 group-hover:text-slate-900'
                }`}>
                  {brand.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
