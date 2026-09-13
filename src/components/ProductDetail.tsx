import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FRAMES } from '../data';

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const frame = FRAMES.find(f => f.id === id);

  if (!frame) {
    return <div className="text-center py-20">Product not found</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
        {/* Left: Image */}
        <div className="aspect-square bg-slate-100 rounded-3xl overflow-hidden relative">
          <img 
            src={frame.image} 
            alt={frame.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right: Details & Actions */}
        <div className="flex flex-col justify-center">
          <div className="mb-2 text-sm font-medium text-slate-500 tracking-wider uppercase">
            {frame.brand}
          </div>
          <h1 className="font-serif text-4xl lg:text-5xl text-slate-900 mb-4">
            {frame.name}
          </h1>
          <div className="text-2xl text-slate-900 mb-8">${frame.price}</div>

          <div className="space-y-4 mb-10">
            <h3 className="text-sm font-medium text-slate-900">Available Colors</h3>
            <div className="flex gap-3">
              {frame.colors.map((color) => (
                <div 
                  key={color}
                  className="w-8 h-8 rounded-full border border-slate-200 shadow-sm cursor-pointer hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  title={`Color: ${color}`}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <Link 
              to={`/configurator/${frame.id}`}
              className="w-full bg-slate-900 text-white py-4 rounded-xl font-medium hover:bg-slate-800 transition-colors text-center"
            >
              Select Lenses & Add to Cart
            </Link>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-100 space-y-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-slate-900">Premium Quality</h4>
                <p className="text-sm text-slate-500">Handcrafted frames with a 2-year warranty.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
