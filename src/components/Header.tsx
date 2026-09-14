import { ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import logoImg from '../assets/logo.jpg';

export function Header() {
  
  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        <Link 
          to="/"
          className="flex items-center gap-3 hover:opacity-75 transition-opacity"
        >
          <img src={logoImg} alt="Visiottica Logo" className="h-16 w-auto object-contain block" />
          <div className="flex flex-col">
            <span className="font-serif text-lg font-semibold tracking-tight text-slate-900 leading-none">VISIOTTICA</span>
            <span className="text-[10px] font-medium tracking-[0.25em] text-slate-500 mt-1">EYEWEAR</span>
          </div>
        </Link>

        <nav className="hidden md:flex gap-8 text-sm font-medium text-slate-600">
          <Link to="/" className="hover:text-slate-900 transition-colors">Men</Link>
          <Link to="/" className="hover:text-slate-900 transition-colors">Women</Link>
          <Link to="/" className="hover:text-slate-900 transition-colors">Sun</Link>
        </nav>


      </div>
    </header>
  );
}
