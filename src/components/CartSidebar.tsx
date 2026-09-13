import { X, Trash2 } from 'lucide-react';
import { CartItem } from '../types';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemoveItem: (id: string) => void;
}

export function CartSidebar({ isOpen, onClose, items, onRemoveItem }: CartSidebarProps) {
  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 animate-in fade-in"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
          <h2 className="font-serif text-2xl text-slate-900">Your Cart</h2>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-500">
              <p>Your cart is empty.</p>
              <button 
                onClick={onClose}
                className="mt-4 text-slate-900 font-medium hover:underline"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map(item => (
                <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex gap-4">
                  <div className="w-24 h-24 bg-slate-50 rounded-xl overflow-hidden shrink-0">
                    <img src={item.frame.image} alt={item.frame.name} className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-medium text-slate-900">{item.frame.name}</h3>
                      <button 
                        onClick={() => onRemoveItem(item.id)}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <p className="text-sm text-slate-500 mb-3">{item.frame.brand}</p>
                    
                    <div className="space-y-1 mb-3">
                      <div className="flex justify-between text-xs text-slate-600">
                        <span>Frame</span>
                        <span>${item.frame.price}</span>
                      </div>
                      {item.treatments.map(t => (
                        <div key={t.id} className="flex justify-between text-xs text-slate-600">
                          <span>{t.name}</span>
                          <span>{t.price === 0 ? 'Inc.' : `+$${t.price}`}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                      <span className="font-medium text-slate-900">Total</span>
                      <span className="font-medium text-slate-900">${item.totalPrice}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 bg-white border-t border-slate-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-center mb-6 text-lg">
              <span className="font-medium text-slate-600">Subtotal</span>
              <span className="font-serif text-2xl text-slate-900">${subtotal}</span>
            </div>
            <button className="w-full bg-slate-900 text-white py-4 rounded-xl font-medium hover:bg-slate-800 transition-colors">
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}
