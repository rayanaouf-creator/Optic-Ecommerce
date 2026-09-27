import React from "react";
import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Package, ShoppingCart, LayoutDashboard, Settings, LogOut, Camera, Lock, Menu, X } from 'lucide-react';
import logoImg from '../../assets/logo.jpg';
import { subscribeToStoreSettings, getLocalCachedSettings, StoreSettings } from '../../lib/storeSettings';

export function AdminLayout() {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [settings, setSettings] = useState<StoreSettings | null>(() => getLocalCachedSettings());

  useEffect(() => {
    const unsub = subscribeToStoreSettings((s) => setSettings(s));
    return () => unsub();
  }, []);

  // Automatically close sidebar when navigation/route changes
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Mot de passe incorrect');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
  };

  const links = [
    { name: 'Tableau de bord', path: '/admin', icon: LayoutDashboard },
    { name: 'Produits', path: '/admin/products', icon: Package },
    { name: 'Commandes', path: '/admin/orders', icon: ShoppingCart },
    { name: 'Stories Vidéo', path: '/admin/stories', icon: Camera },
    { name: 'Marques Partenaires', path: '/admin/brands', icon: Package },
    { name: 'Paramètres', path: '/admin/settings', icon: Settings },
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 p-8 rounded-2xl max-w-md w-full border border-slate-700 shadow-xl">
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center mb-4 text-white">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Accès Administrateur</h1>
            <p className="text-slate-400 text-sm text-center">
              Veuillez entrer le mot de passe pour accéder au panneau de gestion.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mot de passe (admin123)"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500 text-sm"
              />
              {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
            </div>

            <button
              type="submit"
              className="w-full bg-white text-slate-900 font-semibold py-3 rounded-xl hover:bg-slate-100 transition-colors text-sm shadow-sm"
            >
              Se connecter
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link to="/" className="text-xs text-slate-500 hover:text-slate-400 transition-colors">
              &larr; Retour à la boutique
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const logoSrc = settings?.logoUrl || (settings ? (settings.logoUrl || logoImg) : '');
  const titleName = settings?.storeName ? `${settings.storeName} Admin` : 'Admin';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
          <div className="flex items-center gap-2.5 overflow-hidden">
            {logoSrc && (
              <img 
                src={logoSrc} 
                alt="Logo" 
                className="w-8 h-8 rounded object-contain bg-white/10 shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = logoImg;
                }}
              />
            )}
            <span className="font-serif text-lg font-semibold tracking-tight text-white truncate">
              {titleName}
            </span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="Fermer le menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-2">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path || (link.path === '/admin/products' && location.pathname === '/admin/frames');
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar for Mobile Toggle & Quick Actions */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 md:justify-end sticky top-0 z-30">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Ouvrir le menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-4">
            <Link 
              to="/" 
              target="_blank" 
              className="text-xs text-slate-600 hover:text-slate-900 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors bg-white font-medium"
            >
              Voir la boutique &rarr;
            </Link>
          </div>
        </header>

        {/* Dynamic Nested View */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
