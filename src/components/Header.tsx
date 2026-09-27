import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logoImg from '../assets/logo.jpg';
import { subscribeToStoreSettings, StoreSettings } from '../lib/storeSettings';

export function Header() {
  const [settings, setSettings] = useState<StoreSettings>({
    logoUrl: '',
    logoShape: 'rectangle',
    showStoreName: true,
    showStoreSubtitle: true,
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
  const isSquare = settings.logoShape === 'square';
  const showName = settings.showStoreName !== false;
  const showSubtitle = settings.showStoreSubtitle !== false;

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        <Link 
          to="/"
          className="flex items-center gap-3 hover:opacity-85 transition-opacity py-2.5"
        >
          {/* Logo container with square vs rectangle support */}
          <div className={`flex items-center justify-center overflow-hidden transition-all ${
            isSquare 
              ? 'w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-slate-50 border border-slate-200/80 p-1 shrink-0' 
              : 'h-14 sm:h-16 w-auto max-w-[200px] shrink-0'
          }`}>
            <img 
              src={logoSrc} 
              alt={`${storeName} Logo`} 
              className={`object-contain block transition-all ${
                isSquare 
                  ? 'w-full h-full rounded-lg' 
                  : 'h-12 sm:h-14 w-auto max-w-[180px] rounded'
              }`}
              onError={(e) => {
                (e.target as HTMLImageElement).src = logoImg;
              }}
            />
          </div>

          {/* Conditional Name and Sous-titre */}
          {(showName || (showSubtitle && storeSubtitle)) && (
            <div className="flex flex-col justify-center">
              {showName && (
                <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-slate-900 leading-none">
                  {storeName}
                </span>
              )}
              {showSubtitle && storeSubtitle && (
                <span className="text-[10px] sm:text-[11px] font-semibold tracking-[0.22em] text-slate-500 mt-1 uppercase">
                  {storeSubtitle}
                </span>
              )}
            </div>
          )}
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
