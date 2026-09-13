import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { CartProvider, useCart } from './CartContext';
import { Header } from './components/Header';
import { ProductGrid } from './components/ProductGrid';
import { StoriesBar } from './components/StoriesBar';
import { ProductDetail } from './components/ProductDetail';
import { Configurator } from './components/Configurator';
import { CartSidebar } from './components/CartSidebar';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminStories } from './components/admin/AdminStories';

function StoreLayout() {
  const { isCartOpen, setIsCartOpen, cartItems, removeFromCart } = useCart();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} Optica Signature Eyewear. All rights reserved.
        </div>
      </footer>

      <CartSidebar 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onRemoveItem={removeFromCart}
      />
    </div>
  );
}

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<StoreLayout />}>
            <Route index element={
              <div className="animate-in fade-in duration-500">
                <StoriesBar />
                <ProductGrid />
              </div>
            } />
            <Route path="product/:id" element={
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
                <ProductDetail />
              </div>
            } />
            <Route path="configurator/:id" element={
              <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                <Configurator />
              </div>
            } />
          </Route>
          
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="stories" element={<AdminStories />} />
            <Route path="*" element={<div className="p-8 text-slate-500">Coming soon</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}
