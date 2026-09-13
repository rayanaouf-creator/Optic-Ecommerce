import { ShoppingBag, Glasses, UserCog } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../CartContext';

export function Header() {
  const { cartCount, setIsCartOpen } = useCart();

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link 
          to="/"
          className="flex items-center gap-2 text-slate-900 hover:opacity-75 transition-opacity"
        >
          <Glasses className="w-8 h-8" />
          <span className="font-serif text-2xl font-semibold tracking-tight">Optica</span>
        </Link>

        <nav className="hidden md:flex gap-8 text-sm font-medium text-slate-600">
          <Link to="/" className="hover:text-slate-900 transition-colors">Men</Link>
          <Link to="/" className="hover:text-slate-900 transition-colors">Women</Link>
          <Link to="/" className="hover:text-slate-900 transition-colors">Sun</Link>
          <Link to="/admin" className="hover:text-slate-900 transition-colors flex items-center gap-1">
            <UserCog className="w-4 h-4" />
            Admin
          </Link>
        </nav>

        <button 
          onClick={() => setIsCartOpen(true)}
          className="relative p-2 text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ShoppingBag className="w-6 h-6" />
          {cartCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
