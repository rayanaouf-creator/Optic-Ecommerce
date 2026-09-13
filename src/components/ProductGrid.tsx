import { Frame } from '../types';
import { Link } from 'react-router-dom';

interface ProductGridProps {
  frames: Frame[];
}

export function ProductGrid({ frames }: ProductGridProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="font-serif text-3xl text-slate-900 mb-2">Optical Frames</h2>
          <p className="text-slate-500">Discover our signature collection of handcrafted eyewear.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
        {frames.map((frame) => (
          <Link 
            to={`/product/${frame.id}`}
            key={frame.id} 
            className="group cursor-pointer"
          >
            <div className="aspect-[4/3] bg-slate-100 rounded-2xl overflow-hidden mb-4 relative">
              <img 
                src={frame.image} 
                alt={frame.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
            </div>
            
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-slate-900 text-lg">{frame.name}</h3>
                <p className="text-sm text-slate-500">{frame.colors.length} colors</p>
              </div>
              <span className="font-medium text-slate-900">${frame.price}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
