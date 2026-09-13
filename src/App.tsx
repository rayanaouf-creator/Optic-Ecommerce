import { useState } from 'react';
import { Frame, CartItem, Prescription, LensTreatment } from './types';
import { FRAMES } from './data';
import { Header } from './components/Header';
import { ProductGrid } from './components/ProductGrid';
import { ProductDetail } from './components/ProductDetail';
import { Configurator } from './components/Configurator';
import { CartSidebar } from './components/CartSidebar';

export default function App() {
  const [view, setView] = useState<'grid' | 'detail' | 'config'>('grid');
  const [selectedFrame, setSelectedFrame] = useState<Frame | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const handleSelectFrame = (frame: Frame) => {
    setSelectedFrame(frame);
    setView('detail');
  };

  const handleStartConfig = (frame: Frame) => {
    setSelectedFrame(frame);
    setView('config');
  };

  const handleAddToCart = (prescription: Prescription, treatments: LensTreatment[]) => {
    if (!selectedFrame) return;

    const treatmentsPrice = treatments.reduce((sum, t) => sum + t.price, 0);
    const newItem: CartItem = {
      id: Math.random().toString(36).substr(2, 9),
      frame: selectedFrame,
      prescription,
      treatments,
      totalPrice: selectedFrame.price + treatmentsPrice,
    };

    setCartItems(prev => [...prev, newItem]);
    setView('grid');
    setSelectedFrame(null);
    setIsCartOpen(true);
  };

  const handleRemoveFromCart = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        cartCount={cartItems.length} 
        onOpenCart={() => setIsCartOpen(true)}
        onGoHome={() => setView('grid')}
      />

      <main className="flex-1">
        {view === 'grid' && (
          <div className="animate-in fade-in duration-500">
            <ProductGrid frames={FRAMES} onSelectFrame={handleSelectFrame} />
          </div>
        )}

        {view === 'detail' && selectedFrame && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
            <ProductDetail 
              frame={selectedFrame} 
              onBack={() => setView('grid')}
              onStartConfig={handleStartConfig}
            />
          </div>
        )}

        {view === 'config' && selectedFrame && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <Configurator 
              frame={selectedFrame}
              onCancel={() => setView('detail')}
              onComplete={handleAddToCart}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} Optica Signature Eyewear. All rights reserved.
        </div>
      </footer>

      <CartSidebar 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onRemoveItem={handleRemoveFromCart}
      />
    </div>
  );
}
