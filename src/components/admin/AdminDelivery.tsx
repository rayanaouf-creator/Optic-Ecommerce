import React, { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Order } from '../../types';
import { 
  Truck, Package, MapPin, Phone, User, CheckCircle, Clock, 
  Search, ExternalLink, Calendar, Building, Home
} from 'lucide-react';
import { ALGERIA_WILAYAS } from '../../data/algeriaLocations';

export function AdminDelivery() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMethod, setFilterMethod] = useState<'all' | 'home' | 'desk'>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterWilaya, setFilterWilaya] = useState<string>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'orders'));
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      list.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          const tA = typeof a.createdAt?.toMillis === 'function' ? a.createdAt.toMillis() : 0;
          const tB = typeof b.createdAt?.toMillis === 'function' ? b.createdAt.toMillis() : 0;
          return tB - tA;
        }
        return 0;
      });
      setOrders(list);
    } catch (err) {
      console.error('Error fetching delivery orders:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleQuickStatus(orderId: string, newStatus: Order['status']) {
    setUpdatingId(orderId);
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (err) {
      console.error('Error updating order delivery status:', err);
      alert('Erreur lors du changement de statut de livraison.');
    } finally {
      setUpdatingId(null);
    }
  }

  const filteredOrders = orders.filter(o => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      (o.customerName && o.customerName.toLowerCase().includes(q)) ||
      (o.customerPhone && o.customerPhone.toLowerCase().includes(q)) ||
      (o.frameName && o.frameName.toLowerCase().includes(q)) ||
      (o.wilaya && o.wilaya.toLowerCase().includes(q)) ||
      (o.commune && o.commune.toLowerCase().includes(q));

    const matchesMethod = filterMethod === 'all' || (o.deliveryMethod || 'home') === filterMethod;
    const matchesStatus = filterStatus === 'all' || o.status === filterStatus;
    const matchesWilaya = filterWilaya === 'all' || (o.wilaya && o.wilaya.includes(filterWilaya));

    return matchesSearch && matchesMethod && matchesStatus && matchesWilaya;
  });

  const totalDeliveries = orders.length;
  const homeCount = orders.filter(o => (o.deliveryMethod || 'home') === 'home').length;
  const deskCount = orders.filter(o => o.deliveryMethod === 'desk').length;
  const deliveredCount = orders.filter(o => o.status === 'completed').length;
  const inTransitCount = orders.filter(o => o.status === 'shipped').length;

  if (loading) {
    return <div className="text-slate-500 py-10 text-center">Chargement des expéditions & livraisons...</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Truck className="w-6 h-6 text-slate-800" />
          Suivi des Livraisons & Expéditions
        </h2>
        <p className="text-sm text-slate-500">
          Supervisez l'état d'expédition de vos colis (Livraison à domicile ou Retrait Stop-Desk) à travers les 58 wilayas.
        </p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>TOTAL COLIS</span>
            <Package className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{totalDeliveries}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Toutes commandes confondues</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-indigo-600 text-xs font-semibold mb-1">
            <span>À DOMICILE</span>
            <Home className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-indigo-600">{homeCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Livraison porte-à-porte</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-amber-600 text-xs font-semibold mb-1">
            <span>STOP-DESK</span>
            <Building className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600">{deskCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Retrait en agence de livraison</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-emerald-600 text-xs font-semibold mb-1">
            <span>COLIS LIVRÉS</span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600">{deliveredCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Livraison finalisée</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Rechercher par client, téléphone, wilaya, commune..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Method Filter */}
          <select
            value={filterMethod}
            onChange={e => setFilterMethod(e.target.value as any)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            <option value="all">Tous modes de livraison</option>
            <option value="home">À domicile</option>
            <option value="desk">Stop-Desk (Agence)</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            <option value="all">Tous statuts</option>
            <option value="pending">En attente</option>
            <option value="processing">En préparation</option>
            <option value="shipped">Expédiée / En livraison</option>
            <option value="completed">Livrée</option>
            <option value="cancelled">Annulée</option>
          </select>

          {/* Wilaya Filter */}
          <select
            value={filterWilaya}
            onChange={e => setFilterWilaya(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 max-w-[160px]"
          >
            <option value="all">Toutes wilayas</option>
            {ALGERIA_WILAYAS.map(w => (
              <option key={w.code} value={w.name}>{w.code} - {w.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Deliveries List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3.5">Destinataire & Contact</th>
                <th className="px-4 py-3.5">Adresse de Livraison</th>
                <th className="px-4 py-3.5">Mode</th>
                <th className="px-4 py-3.5">Article commandé</th>
                <th className="px-4 py-3.5 text-center">Statut Expédition</th>
                <th className="px-5 py-3.5 text-right">Mise à jour rapide</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredOrders.map(order => {
                const isHome = (order.deliveryMethod || 'home') === 'home';
                const isUpdating = updatingId === order.id;

                return (
                  <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Customer */}
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {order.customerName || 'Client inconnu'}
                      </div>
                      <a 
                        href={`tel:${order.customerPhone}`}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-mono flex items-center gap-1 mt-0.5"
                      >
                        <Phone className="w-3 h-3" />
                        {order.customerPhone}
                      </a>
                    </td>

                    {/* Address & Wilaya */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold text-slate-900 text-xs">
                            {order.wilaya || 'Non spécifié'}
                            {order.commune && <span className="text-slate-600 font-normal">, {order.commune}</span>}
                          </div>
                          {order.addressDetails && (
                            <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                              {order.addressDetails}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Mode */}
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        isHome ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                      }`}>
                        {isHome ? <Home className="w-3 h-3" /> : <Building className="w-3 h-3" />}
                        {isHome ? 'Domicile' : 'Stop-Desk'}
                      </span>
                    </td>

                    {/* Frame */}
                    <td className="px-4 py-3.5">
                      <div className="font-medium text-slate-900 text-xs">{order.frameName}</div>
                      <div className="text-[11px] text-slate-500 font-semibold">{order.totalAmount?.toLocaleString()} DA</div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        order.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'processing' ? 'bg-indigo-100 text-indigo-800' :
                        order.status === 'cancelled' ? 'bg-rose-100 text-rose-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {order.status === 'completed' ? 'Livré' :
                         order.status === 'shipped' ? 'En expédition' :
                         order.status === 'processing' ? 'En préparation' :
                         order.status === 'cancelled' ? 'Annulé' : 'En attente'}
                      </span>
                    </td>

                    {/* Quick Action */}
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {order.status !== 'shipped' && order.status !== 'completed' && (
                          <button
                            disabled={isUpdating}
                            onClick={() => handleQuickStatus(order.id, 'shipped')}
                            className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-lg font-semibold transition-colors disabled:opacity-50"
                          >
                            Expédier
                          </button>
                        )}
                        {order.status !== 'completed' && (
                          <button
                            disabled={isUpdating}
                            onClick={() => handleQuickStatus(order.id, 'completed')}
                            className="text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg font-semibold transition-colors disabled:opacity-50"
                          >
                            Marquer Livré
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <Truck className="w-8 h-8 text-slate-300 mb-2" />
                      <p className="font-medium text-slate-700">Aucune livraison trouvée</p>
                      <p className="text-xs text-slate-400 mt-0.5">Modifiez vos filtres de recherche ou de wilaya.</p>
                    </div>
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
