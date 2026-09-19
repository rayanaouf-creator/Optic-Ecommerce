import { Frame } from '../types';
import { Link, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { X, Sparkles } from 'lucide-react';

export function ProductGrid() {
  const [frames, setFrames] = useState<Frame[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedBrand = searchParams.get('brand');

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'frames'), (snapshot) => {
      const framesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Frame));
      setFrames(framesData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching frames:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filter frames by selected brand if one is picked
  const filteredFrames = selectedBrand
    ? frames.filter(f => f.brand && f.brand.trim().toLowerCase() === selectedBrand.trim().toLowerCase())
    : frames;

  const handleClearBrand = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('brand');
    setSearchParams(nextParams);
  };

  if (loading) {
    return <div className="text-center py-20 text-slate-500">Loading collection...</div>;
  }

  return (
    <div id="items-section" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 scroll-mt-20">
      {selectedBrand ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-200/80">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xs font-semibold text-slate-400 tracking-[0.2em] uppercase">Brand Collection</h2>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-bold text-slate-900 uppercase tracking-[0.15em] bg-slate-100 px-2 py-0.5 rounded">
                {selectedBrand}
              </span>
            </div>
            <p className="text-sm text-slate-600">
              Showing {filteredFrames.length} {filteredFrames.length === 1 ? 'frame' : 'frames'} from <span className="font-semibold text-slate-900">{selectedBrand}</span>
            </p>
          </div>

          <button
            onClick={handleClearBrand}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 px-3.5 py-2 rounded-xl transition-colors shadow-sm self-start sm:self-auto cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            Show All Brands
          </button>
        </div>
      ) : (
        <div className="flex items-end justify-between mb-8 pb-4 border-b border-slate-200/50">
          <div>
            <h2 className="text-xs font-semibold text-slate-400 tracking-[0.2em] uppercase">Items</h2>
          </div>
          <span className="text-xs text-slate-400 font-medium">{frames.length} frames</span>
        </div>
      )}

      {filteredFrames.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-500">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-serif font-semibold text-slate-900 mb-2">
            No frames found for "{selectedBrand}"
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
            There are currently no items in our catalog registered under this brand. Check back soon or browse our full eyewear selection.
          </p>
          <button
            onClick={handleClearBrand}
            className="inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Browse All Eyewear
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {filteredFrames.map((frame) => (
            <Link 
              to={`/product/${frame.id}`}
              key={frame.id} 
              className="group cursor-pointer block"
            >
              <div className="aspect-[4/3] bg-slate-100 rounded-2xl overflow-hidden mb-4 relative">
                <img 
                  src={frame.image} 
                  alt={frame.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                {frame.brand && (
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-md text-[10px] font-semibold tracking-wider uppercase text-slate-800 shadow-sm">
                    {frame.brand}
                  </div>
                )}
              </div>
              
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-slate-900 text-lg group-hover:text-slate-700 transition-colors">{frame.name}</h3>
                  <p className="text-sm text-slate-500">
                    {frame.colors && frame.colors.length ? `${frame.colors.length} colors` : 'Standard edition'}
                  </p>
                </div>
                <span className="font-medium text-slate-900 text-lg">{frame.price} DA</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
