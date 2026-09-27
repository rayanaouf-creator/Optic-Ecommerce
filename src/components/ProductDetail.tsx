import { ArrowLeft, ShieldCheck, CheckCircle2, AlertTriangle, XCircle, Package, UserCheck, Baby } from 'lucide-react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { OrderModal } from './OrderModal';
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Frame, Gender, AgeGroup } from '../types';
import { trackViewContent, trackInitiateCheckout } from '../lib/metaPixel';

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [frame, setFrame] = useState<Frame | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  useEffect(() => {
    async function fetchFrame() {
      if (!id) return;
      try {
        const docRef = doc(db, 'frames', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const qty = data.stockQuantity !== undefined ? Number(data.stockQuantity) : 10;
          
          let g: Gender = 'Unisex';
          if (data.gender) g = data.gender;
          else if (data.category === 'Men') g = 'Men';
          else if (data.category === 'Women') g = 'Women';

          let a: AgeGroup = 'Adult';
          if (data.ageGroup) a = data.ageGroup;
          else if (data.category === 'Kids' || data.category === 'Kid') a = 'Kid';

          const frameData = { 
            id: docSnap.id, 
            ...data,
            gender: g,
            ageGroup: a,
            category: g,
            stockQuantity: qty,
            inStock: data.inStock !== undefined ? Boolean(data.inStock) : qty > 0,
            lowStockThreshold: data.lowStockThreshold !== undefined ? Number(data.lowStockThreshold) : 3
          } as Frame;
          setFrame(frameData);

          // Meta Pixel: Track ViewContent
          trackViewContent({
            id: frameData.id,
            name: frameData.name,
            price: frameData.price,
            brand: frameData.brand
          });
        }
      } catch (error) {
        console.error('Error fetching frame:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchFrame();
  }, [id]);

  if (loading) {
    return <div className="text-center py-20 text-slate-500">Chargement de l'article...</div>;
  }

  if (!frame) {
    return <div className="text-center py-20 text-slate-500">Article introuvable</div>;
  }

  const qty = frame.stockQuantity !== undefined ? frame.stockQuantity : 10;
  const th = frame.lowStockThreshold || 3;
  const isOutOfStock = qty === 0 || frame.inStock === false;
  const isLowStock = qty > 0 && qty <= th && frame.inStock !== false;

  const genderLabel = 
    frame.gender === 'Men' ? 'Homme' : 
    frame.gender === 'Women' ? 'Femme' : 'Unisexe';
  const ageLabel = frame.ageGroup === 'Kid' ? 'Enfant' : 'Adulte';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-8 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour au catalogue
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
        {/* Left: Image with Badges */}
        <div className="aspect-square bg-slate-100 rounded-3xl overflow-hidden relative shadow-xs">
          <img 
            src={frame.image} 
            alt={frame.name}
            className="w-full h-full object-cover"
          />
          {/* Out of Stock Overlay on Image */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center p-4">
              <span className="bg-rose-600 text-white font-bold text-sm tracking-wider uppercase px-4 py-2 rounded-xl shadow-lg">
                Rupture de Stock / Épuisé
              </span>
            </div>
          )}
        </div>

        {/* Right: Details & Actions */}
        <div className="flex flex-col justify-center">
          <div className="flex items-center justify-between gap-4 mb-2">
            <Link 
              to={`/?brand=${encodeURIComponent(frame.brand)}`}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 tracking-widest uppercase inline-flex items-center gap-1.5 transition-colors group"
              title={`Voir toutes les lunettes ${frame.brand}`}
            >
              <span>{frame.brand}</span>
              <span className="text-[10px] text-slate-400 group-hover:text-slate-700 transition-colors">→ Voir tout</span>
            </Link>

            {/* Real-time Stock indicator badge */}
            <div>
              {isOutOfStock ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                  <XCircle className="w-3.5 h-3.5 text-rose-500" />
                  Rupture temporaire
                </span>
              ) : isLowStock ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  Plus que {qty} en stock !
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  En stock ({qty} disponibles)
                </span>
              )}
            </div>
          </div>

          <h1 className="font-serif text-4xl lg:text-5xl text-slate-900 mb-3">
            {frame.name}
          </h1>

          <div className="text-2xl font-bold text-slate-900 mb-4">
            {frame.price.toLocaleString()} DA
          </div>

          {/* Sexe & Tranche d'âge Tags */}
          <div className="flex items-center gap-2 mb-6">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold ${
              frame.gender === 'Men' ? 'bg-sky-50 text-sky-800 border border-sky-200' :
              frame.gender === 'Women' ? 'bg-pink-50 text-pink-800 border border-pink-200' :
              'bg-slate-100 text-slate-700 border border-slate-200'
            }`}>
              <UserCheck className="w-3.5 h-3.5" />
              Sexe : {genderLabel}
            </span>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold ${
              frame.ageGroup === 'Kid' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
              'bg-emerald-50 text-emerald-800 border border-emerald-200'
            }`}>
              <Baby className="w-3.5 h-3.5" />
              Tranche d'âge : {ageLabel}
            </span>
          </div>

          {frame.colors && frame.colors.length > 0 && (
            <div className="space-y-3 mb-8">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Couleurs disponibles</h3>
              <div className="flex gap-2.5">
                {frame.colors.map((color) => (
                  <div 
                    key={color}
                    className="w-8 h-8 rounded-full border border-slate-200 shadow-xs cursor-pointer hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    title={`Couleur: ${color}`}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button 
              disabled={isOutOfStock}
              onClick={() => {
                if (frame && !isOutOfStock) {
                  trackInitiateCheckout({
                    id: frame.id,
                    name: frame.name,
                    price: frame.price
                  });
                  setIsOrderModalOpen(true);
                }
              }}
              className={`w-full py-4 rounded-xl font-semibold transition-all text-center flex items-center justify-center gap-2 shadow-sm ${
                isOutOfStock 
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300' 
                  : 'bg-slate-900 text-white hover:bg-slate-800 cursor-pointer active:scale-[0.99]'
              }`}
            >
              {isOutOfStock ? (
                <>
                  <XCircle className="w-5 h-5 text-slate-400" />
                  Produit Actuellement Épuisé
                </>
              ) : (
                <>
                  <Package className="w-5 h-5" />
                  Commander maintenant
                </>
              )}
            </button>
            {isLowStock && (
              <p className="text-center text-xs text-amber-600 font-medium">
                Attention : Stock très limité pour ce modèle.
              </p>
            )}
          </div>

          <div className="mt-8 pt-8 border-t border-slate-100 space-y-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-slate-900">Qualité Optique Certifiée</h4>
                <p className="text-xs text-slate-500">Produits sélectionnés avec garantie et vérification optique avant expédition.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {frame && (
        <OrderModal 
          isOpen={isOrderModalOpen} 
          onClose={() => setIsOrderModalOpen(false)} 
          product={frame} 
        />
      )}
    </div>
  );
}
