import { Frame, Gender, AgeGroup } from '../types';
import { Link, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { X, Sparkles, Filter } from 'lucide-react';

export function ProductGrid() {
  const [frames, setFrames] = useState<Frame[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  
  const selectedBrand = searchParams.get('brand');
  const selectedGender = searchParams.get('gender') as Gender | null;
  const selectedAgeGroup = searchParams.get('age') as AgeGroup | null;

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'frames'), (snapshot) => {
      const framesData = snapshot.docs.map(doc => {
        const data = doc.data();
        const qty = data.stockQuantity !== undefined ? Number(data.stockQuantity) : 10;
        
        let g: Gender = 'Unisex';
        if (data.gender) g = data.gender;
        else if (data.category === 'Men') g = 'Men';
        else if (data.category === 'Women') g = 'Women';

        let a: AgeGroup = 'Adult';
        if (data.ageGroup) a = data.ageGroup;
        else if (data.category === 'Kids' || data.category === 'Kid') a = 'Kid';

        return {
          id: doc.id,
          ...data,
          gender: g,
          ageGroup: a,
          category: g,
          stockQuantity: qty,
          inStock: data.inStock !== undefined ? Boolean(data.inStock) : qty > 0,
          lowStockThreshold: data.lowStockThreshold !== undefined ? Number(data.lowStockThreshold) : 3
        } as Frame;
      });
      setFrames(framesData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching frames:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filter frames by brand, gender, age group
  const filteredFrames = frames.filter(f => {
    if (selectedBrand && f.brand?.trim().toLowerCase() !== selectedBrand.trim().toLowerCase()) {
      return false;
    }
    if (selectedGender && f.gender !== selectedGender && f.gender !== 'Unisex') {
      return false;
    }
    if (selectedAgeGroup && f.ageGroup !== selectedAgeGroup) {
      return false;
    }
    return true;
  });

  const updateParam = (key: string, value: string | null) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value) {
      nextParams.set(key, value);
    } else {
      nextParams.delete(key);
    }
    setSearchParams(nextParams);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters = selectedBrand || selectedGender || selectedAgeGroup;

  if (loading) {
    return <div className="text-center py-20 text-slate-500">Chargement de la collection...</div>;
  }

  return (
    <div id="items-section" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 scroll-mt-20">
      {/* Category & Filter Tabs: All, Hommes, Femmes, Enfants */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-200/80">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => {
              const p = new URLSearchParams(searchParams);
              p.delete('gender');
              p.delete('age');
              setSearchParams(p);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              !selectedGender && !selectedAgeGroup
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            Tous les modèles
          </button>

          <button
            onClick={() => {
              const p = new URLSearchParams(searchParams);
              p.set('gender', 'Men');
              p.delete('age');
              setSearchParams(p);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedGender === 'Men' && !selectedAgeGroup
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            Hommes (Men)
          </button>

          <button
            onClick={() => {
              const p = new URLSearchParams(searchParams);
              p.set('gender', 'Women');
              p.delete('age');
              setSearchParams(p);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedGender === 'Women' && !selectedAgeGroup
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            Femmes (Women)
          </button>

          <button
            onClick={() => {
              const p = new URLSearchParams(searchParams);
              p.set('age', 'Kid');
              p.delete('gender');
              setSearchParams(p);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedAgeGroup === 'Kid'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
            }`}
          >
            Enfants (Kids)
          </button>
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 bg-rose-50 px-3 py-1.5 rounded-xl transition-colors self-start sm:self-auto"
          >
            <X className="w-3.5 h-3.5" />
            Effacer les filtres
          </button>
        )}
      </div>

      {/* Brand Filter active banner if applicable */}
      {selectedBrand && (
        <div className="flex items-center gap-2 mb-6">
          <span className="text-xs text-slate-500">Filtré par marque :</span>
          <span className="inline-flex items-center gap-1.5 bg-slate-900 text-white px-3 py-1 rounded-lg text-xs font-semibold">
            {selectedBrand}
            <button 
              onClick={() => updateParam('brand', null)}
              className="text-slate-300 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        </div>
      )}

      {filteredFrames.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-500">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-serif font-semibold text-slate-900 mb-2">
            Aucun modèle ne correspond à ces critères
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
            Essayez de sélectionner une autre catégorie ou de réinitialiser vos filtres pour voir tous les produits.
          </p>
          <button
            onClick={clearAllFilters}
            className="inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Voir toute la collection
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {filteredFrames.map((frame) => {
            const qty = frame.stockQuantity !== undefined ? frame.stockQuantity : 10;
            const th = frame.lowStockThreshold || 3;
            const isOutOfStock = qty === 0 || frame.inStock === false;
            const isLowStock = qty > 0 && qty <= th && frame.inStock !== false;

            const genderText = 
              frame.gender === 'Men' ? 'Homme' : 
              frame.gender === 'Women' ? 'Femme' : 'Unisexe';
            const ageText = frame.ageGroup === 'Kid' ? 'Enfant' : 'Adulte';

            return (
              <Link 
                to={`/product/${frame.id}`}
                key={frame.id} 
                className="group cursor-pointer block"
              >
                <div className="aspect-[4/3] bg-slate-100 rounded-2xl overflow-hidden mb-4 relative shadow-xs">
                  <img 
                    src={frame.image} 
                    alt={frame.name}
                    className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out ${
                      isOutOfStock ? 'grayscale opacity-75' : ''
                    }`}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                  
                  {/* Brand Tag Top-Left */}
                  {frame.brand && (
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase text-slate-800 shadow-xs">
                      {frame.brand}
                    </div>
                  )}

                  {/* Stock Badges Top-Right */}
                  <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
                    {isOutOfStock ? (
                      <span className="bg-rose-600 text-white px-2.5 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase shadow-xs">
                        Épuisé
                      </span>
                    ) : isLowStock ? (
                      <span className="bg-amber-500 text-white px-2.5 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase shadow-xs animate-pulse">
                        Stock Faible ({qty})
                      </span>
                    ) : null}
                  </div>

                  {/* Sexe & Tranche d'âge Pill Bottom-Left */}
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                    <span className="bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-0.5 rounded-md">
                      {genderText}
                    </span>
                    {frame.ageGroup === 'Kid' && (
                      <span className="bg-amber-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md">
                        Enfant
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-slate-900 text-lg group-hover:text-slate-700 transition-colors">
                      {frame.name}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {isOutOfStock ? (
                        <span className="text-rose-600 font-medium text-xs">Rupture de stock temporaire</span>
                      ) : (
                        `${genderText} • ${ageText}`
                      )}
                    </p>
                  </div>
                  <span className="font-semibold text-slate-900 text-lg">
                    {frame.price.toLocaleString()} DA
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
