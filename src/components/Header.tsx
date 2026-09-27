import { useState, useEffect } from 'react';
import { ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import logoImg from '../assets/logo.jpg';
import { subscribeToStoreSettings, StoreSettings } from '../lib/storeSettings';

export function Header() {
  const [settings, setSettings] = useState<StoreSettings>({
    logoUrl: '',
    storeName: 'VISIOTTICA',
    storeSubtitle: 'EYEWEAR'
  });

  useEffect(() => {
    const unsubscribe = subscribeToStoreSettings((updated) => {
      setSettings(updated);
    });
    return () => unsubscribe();
  }, []);

  const logoSrc = settings.logoUrl || logoImg;
  const storeName = settings.storeName || 'VISIOTTICA';
  const storeSubtitle = settings.storeSubtitle || 'EYEWEAR';

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        <Link 
          to="/"
          className="flex items-center gap-3 hover:opacity-75 transition-opacity py-2"
        >
          <img 
            src={logoSrc} 
            alt={`${storeName} Logo`} 
            className="h-16 w-auto max-w-[180px] object-contain block rounded"
            onError={(e) => {
              // Graceful fallback to default asset if URL fails
              (e.target as HTMLImageElement).src = logoImg;
            }}
          />
          <div className="flex flex-col">
            <span className="font-serif text-lg font-semibold tracking-tight text-slate-900 leading-none">
              {storeName}
            </span>
            {storeSubtitle && (
              <span className="text-[10px] font-medium tracking-[0.25em] text-slate-500 mt-1 uppercase">
                {storeSubtitle}
              </span>
            )}
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
