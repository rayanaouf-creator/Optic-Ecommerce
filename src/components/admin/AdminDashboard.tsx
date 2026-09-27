import { useState, useEffect } from 'react';
import { Banknote, Package, ShoppingCart, AlertTriangle, ArrowRight, ShieldAlert } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Frame, Order } from '../../types';
import { Link } from 'react-router-dom';

export function AdminDashboard() {
  const [frames, setFrames] = useState<Frame[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [framesSnap, ordersSnap] = await Promise.all([
          getDocs(collection(db, 'frames')),
          getDocs(collection(db, 'orders'))
        ]);

        const framesList = framesSnap.docs.map(doc => {
          const data = doc.data();
          const qty = data.stockQuantity !== undefined ? Number(data.stockQuantity) : 10;
          return {
            id: doc.id,
            ...data,
            stockQuantity: qty,
            inStock: data.inStock !== undefined ? Boolean(data.inStock) : qty > 0,
            lowStockThreshold: data.lowStockThreshold !== undefined ? Number(data.lowStockThreshold) : 3
          } as Frame;
        });

        const ordersList = ordersSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Order));

        setFrames(framesList);
        setOrders(ordersList);
      } catch (err) {
        console.error('Error loading dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const totalStockUnits = frames.reduce((acc, f) => acc + (f.stockQuantity !== undefined ? f.stockQuantity : 10), 0);
  const outOfStockFrames = frames.filter(f => (f.stockQuantity !== undefined ? f.stockQuantity : 10) === 0 || f.inStock === false);
  const lowStockFrames = frames.filter(f => {
    const qty = f.stockQuantity !== undefined ? f.stockQuantity : 10;
    const th = f.lowStockThreshold || 3;
    return qty > 0 && qty <= th && f.inStock !== false;
  });

  const totalRevenue = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((acc, o) => acc + (Number(o.totalAmount) || 0), 0);

  const stats = [
    { 
      name: 'Revenu Total', 
      value: `${totalRevenue.toLocaleString()} DA`, 
      icon: Banknote, 
      sub: `${orders.length} commandes enregistrées`,
      color: 'text-slate-900'
    },
    { 
      name: 'Commandes Actives', 
      value: orders.filter(o => o.status === 'pending' || o.status === 'processing').length.toString(), 
      icon: ShoppingCart, 
      sub: 'En attente / traitement',
      color: 'text-blue-600'
    },
    { 
      name: 'Stock Total Disponible', 
      value: totalStockUnits.toString(), 
      icon: Package, 
      sub: `${frames.length} références d'articles`,
      color: 'text-emerald-600'
    },
    { 
      name: 'Alertes de Stock', 
      value: (outOfStockFrames.length + lowStockFrames.length).toString(), 
      icon: AlertTriangle, 
      sub: `${outOfStockFrames.length} ruptures, ${lowStockFrames.length} faibles`,
      color: (outOfStockFrames.length + lowStockFrames.length) > 0 ? 'text-rose-600' : 'text-slate-500'
    },
  ];

  const recentOrders = [...orders]
    .sort((a, b) => {
      const timeA = typeof a.createdAt?.toMillis === 'function' ? a.createdAt.toMillis() : 0;
      const timeB = typeof b.createdAt?.toMillis === 'function' ? b.createdAt.toMillis() : 0;
      return timeB - timeA;
    })
    .slice(0, 5);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Tableau de bord de la Boutique</h2>
        <p className="text-sm text-slate-500">Aperçu en temps réel de vos ventes, commandes et stocks disponibles.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex justify-between items-start mb-3">
                <div className="p-2.5 bg-slate-50 rounded-xl text-slate-700 border border-slate-100">
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">{stat.name}</h3>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-slate-400 mt-1">{stat.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Stock Attention Banner if there are low stock or out of stock items */}
      {(outOfStockFrames.length > 0 || lowStockFrames.length > 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-xl text-amber-700 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900">
                Attention requise sur l'inventaire ({outOfStockFrames.length + lowStockFrames.length} articles concernés)
              </h4>
              <p className="text-xs text-amber-700/90 mt-0.5">
                {outOfStockFrames.length > 0 && `${outOfStockFrames.length} produit(s) en rupture totale. `}
                {lowStockFrames.length > 0 && `${lowStockFrames.length} produit(s) ont un stock faible inférieur au seuil.`}
              </p>
            </div>
          </div>
          <Link
            to="/admin/products"
            className="inline-flex items-center gap-1.5 text-xs font-semibold bg-amber-900 text-white px-4 py-2 rounded-xl hover:bg-amber-800 transition-colors shrink-0 shadow-xs"
          >
            Gérer les produits
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Recent Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-slate-900">Dernières Commandes Clients</h3>
          <Link to="/admin/orders" className="text-xs text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1">
            Voir toutes les commandes &rarr;
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <th className="pb-3">Client</th>
                <th className="pb-3">Article commandé</th>
                <th className="pb-3">Wilaya</th>
                <th className="pb-3">Montant</th>
                <th className="pb-3 text-right">Statut</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 font-medium text-slate-900">
                    <div>{order.customerName}</div>
                    <div className="text-xs text-slate-400">{order.customerPhone}</div>
                  </td>
                  <td className="py-3.5 text-slate-700">
                    {order.frameName}
                  </td>
                  <td className="py-3.5 text-slate-600 text-xs font-medium">
                    {order.wilaya || 'Algérie'}
                  </td>
                  <td className="py-3.5 text-slate-900 font-semibold whitespace-nowrap">
                    {order.totalAmount?.toLocaleString()} DA
                  </td>
                  <td className="py-3.5 text-right">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                      order.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                      order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'shipped' ? 'bg-indigo-100 text-indigo-800' :
                      order.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                      'bg-rose-100 text-rose-800'
                    }`}>
                      {order.status || 'pending'}
                    </span>
                  </td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 text-sm">
                    Aucune commande enregistrée pour le moment.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
