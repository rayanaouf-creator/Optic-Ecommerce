import React from "react";
import { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Order } from '../../types';
import { Trash2, CheckCircle, Clock, MapPin, Phone, User, Edit2, X, Check, Package, Truck, AlertCircle } from 'lucide-react';
import { ALGERIA_WILAYAS } from '../../data/algeriaLocations';

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit modal state
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editCustomerName, setEditCustomerName] = useState('');
  const [editCustomerPhone, setEditCustomerPhone] = useState('');
  const [editWilayaCode, setEditWilayaCode] = useState('16');
  const [editCommune, setEditCommune] = useState('');
  const [editIsCustomCommune, setEditIsCustomCommune] = useState(false);
  const [editCustomCommuneName, setEditCustomCommuneName] = useState('');
  const [editAddressDetails, setEditAddressDetails] = useState('');
  const [editDeliveryMethod, setEditDeliveryMethod] = useState<'home' | 'desk'>('home');
  const [editStatus, setEditStatus] = useState<Order['status']>('pending');
  const [editTotalAmount, setEditTotalAmount] = useState('');
  const [editNeedsLenses, setEditNeedsLenses] = useState(false);
  const [editLeftSph, setEditLeftSph] = useState('');
  const [editLeftCyl, setEditLeftCyl] = useState('');
  const [editRightSph, setEditRightSph] = useState('');
  const [editRightCyl, setEditRightCyl] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      const querySnapshot = await getDocs(collection(db, 'orders'));
      const ordersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      // Sort by newest first assuming createdAt is a timestamp
      ordersData.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          const timeA = typeof a.createdAt?.toMillis === 'function' ? a.createdAt.toMillis() : 0;
          const timeB = typeof b.createdAt?.toMillis === 'function' ? b.createdAt.toMillis() : 0;
          return timeB - timeA;
        }
        return 0;
      });
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  }

  function startEdit(order: Order) {
    setEditingOrder(order);
    setEditCustomerName(order.customerName || '');
    setEditCustomerPhone(order.customerPhone || '');
    
    // Determine wilaya code
    let code = '16';
    const anyOrder = order as any;
    if (anyOrder.wilayaCode) {
      code = anyOrder.wilayaCode;
    } else if (order.wilaya) {
      const match = order.wilaya.match(/^(\d{1,2})/);
      if (match) {
        code = match[1].padStart(2, '0');
      } else {
        const found = ALGERIA_WILAYAS.find(w => order.wilaya.toLowerCase().includes(w.name.toLowerCase()));
        if (found) code = found.code;
      }
    }
    setEditWilayaCode(code);

    const wilayaObj = ALGERIA_WILAYAS.find(w => w.code === code) || ALGERIA_WILAYAS[15];
    if (order.commune && wilayaObj.communes.includes(order.commune)) {
      setEditCommune(order.commune);
      setEditIsCustomCommune(false);
      setEditCustomCommuneName('');
    } else if (order.commune) {
      setEditIsCustomCommune(true);
      setEditCustomCommuneName(order.commune);
      setEditCommune('__custom__');
    } else {
      setEditCommune(wilayaObj.communes[0] || '');
      setEditIsCustomCommune(false);
      setEditCustomCommuneName('');
    }

    setEditAddressDetails(order.addressDetails || '');
    setEditDeliveryMethod(order.deliveryMethod || 'home');
    setEditStatus(order.status || 'pending');
    setEditTotalAmount(order.totalAmount?.toString() || '0');
    setEditNeedsLenses(Boolean(order.needsCorrectingLenses));
    setEditLeftSph(order.leftSph || '');
    setEditLeftCyl(order.leftCyl || '');
    setEditRightSph(order.rightSph || '');
    setEditRightCyl(order.rightCyl || '');
  }

  const handleWilayaChange = (code: string) => {
    setEditWilayaCode(code);
    const wilaya = ALGERIA_WILAYAS.find(w => w.code === code);
    if (wilaya && wilaya.communes.length > 0) {
      setEditCommune(wilaya.communes[0]);
      setEditIsCustomCommune(false);
      setEditCustomCommuneName('');
    }
  };

  async function handleSaveOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!editingOrder) return;

    if (!editCustomerName.trim() || !editCustomerPhone.trim()) {
      alert('Veuillez renseigner le nom et le numéro de téléphone.');
      return;
    }

    setSavingEdit(true);
    try {
      const currentWilaya = ALGERIA_WILAYAS.find(w => w.code === editWilayaCode) || ALGERIA_WILAYAS[15];
      const finalCommune = editIsCustomCommune ? editCustomCommuneName.trim() : editCommune;
      const wilayaFull = `${currentWilaya.code} - ${currentWilaya.name}`;

      const updatedFields: Partial<Order> & Record<string, any> = {
        customerName: editCustomerName.trim(),
        customerPhone: editCustomerPhone.trim(),
        wilaya: wilayaFull,
        wilayaCode: currentWilaya.code,
        wilayaName: currentWilaya.name,
        commune: finalCommune,
        addressDetails: editAddressDetails.trim(),
        deliveryMethod: editDeliveryMethod,
        status: editStatus,
        totalAmount: Number(editTotalAmount) || 0,
        needsCorrectingLenses: editNeedsLenses,
        leftSph: editNeedsLenses ? editLeftSph.trim() : null,
        leftCyl: editNeedsLenses ? editLeftCyl.trim() : null,
        rightSph: editNeedsLenses ? editRightSph.trim() : null,
        rightCyl: editNeedsLenses ? editRightCyl.trim() : null,
      };

      await updateDoc(doc(db, 'orders', editingOrder.id), updatedFields);

      setOrders(orders.map(o => o.id === editingOrder.id ? { ...o, ...updatedFields } : o));
      setEditingOrder(null);
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Erreur lors de la mise à jour de la commande.');
    } finally {
      setSavingEdit(false);
    }
  }

  async function updateStatus(id: string, newStatus: Order['status']) {
    try {
      await updateDoc(doc(db, 'orders', id), { status: newStatus });
      setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
    } catch (error) {
      console.error('Error updating order:', error);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Voulez-vous vraiment supprimer cette commande ?')) return;
    try {
      await deleteDoc(doc(db, 'orders', id));
      setOrders(orders.filter(o => o.id !== id));
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  }

  const selectedWilayaObj = ALGERIA_WILAYAS.find(w => w.code === editWilayaCode) || ALGERIA_WILAYAS[15];

  if (loading) {
    return <div className="text-slate-500">Chargement des commandes...</div>;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
            <CheckCircle className="w-3 h-3" /> Livrée / Terminée
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            <Truck className="w-3 h-3" /> En cours d'expédition
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Package className="w-3 h-3" /> En préparation
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-800">
            <AlertCircle className="w-3 h-3" /> Annulée
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
            <Clock className="w-3 h-3" /> En attente
          </span>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Edit Order Modal */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Modifier la commande #{editingOrder.id.slice(0, 8)}</h3>
                <p className="text-xs text-slate-500">Mettre à jour les informations client, livraison, verres et statut</p>
              </div>
              <button 
                onClick={() => setEditingOrder(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveOrder} className="space-y-4">
              {/* Product Info (read-only reference) */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 block">Article commandé :</span>
                  <span className="text-sm font-semibold text-slate-900">{editingOrder.frameName || 'Lunettes de vue'}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 block">Montant actuel :</span>
                  <span className="text-sm font-bold text-slate-900">{editingOrder.totalAmount} DA</span>
                </div>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nom et Prénom du client</label>
                  <input 
                    type="text" 
                    required
                    value={editCustomerName} 
                    onChange={e => setEditCustomerName(e.target.value)} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Numéro de Téléphone</label>
                  <input 
                    type="tel" 
                    required
                    value={editCustomerPhone} 
                    onChange={e => setEditCustomerPhone(e.target.value)} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              {/* Algerian Location: Wilaya & Commune */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Wilaya (Province)</label>
                  <select
                    value={editWilayaCode}
                    onChange={e => handleWilayaChange(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    {ALGERIA_WILAYAS.map(w => (
                      <option key={w.code} value={w.code}>
                        {w.code} - {w.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Commune (Municipalité)</label>
                  {!editIsCustomCommune ? (
                    <div className="space-y-1">
                      <select
                        value={editCommune}
                        onChange={e => {
                          if (e.target.value === '__custom__') {
                            setEditIsCustomCommune(true);
                          } else {
                            setEditCommune(e.target.value);
                          }
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                      >
                        {selectedWilayaObj.communes.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                        <option value="__custom__">+ Autre commune...</option>
                      </select>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <input 
                        type="text"
                        required
                        value={editCustomCommuneName}
                        onChange={e => setEditCustomCommuneName(e.target.value)}
                        placeholder="Saisissez la commune..."
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                      <button 
                        type="button" 
                        onClick={() => {
                          setEditIsCustomCommune(false);
                          setEditCommune(selectedWilayaObj.communes[0] || '');
                        }}
                        className="text-[11px] text-slate-500 hover:text-slate-900 underline"
                      >
                        ← Choisir dans la liste
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Address details */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Adresse détaillée / Quartier</label>
                <input 
                  type="text" 
                  value={editAddressDetails} 
                  onChange={e => setEditAddressDetails(e.target.value)} 
                  placeholder="Rue, Bâtiment, Numéro d'appartement..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              {/* Delivery method, Status & Total Amount */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mode de livraison</label>
                  <select
                    value={editDeliveryMethod}
                    onChange={e => setEditDeliveryMethod(e.target.value as 'home' | 'desk')}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="home">🏠 À Domicile</option>
                    <option value="desk">🏢 Point Relais (Stop Desk)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Statut commande</label>
                  <select
                    value={editStatus}
                    onChange={e => setEditStatus(e.target.value as Order['status'])}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
                  >
                    <option value="pending">⏳ En attente (Pending)</option>
                    <option value="processing">⚙️ En préparation (Processing)</option>
                    <option value="shipped">🚚 Expédiée (Shipped)</option>
                    <option value="completed">✅ Livrée / Terminée (Completed)</option>
                    <option value="cancelled">❌ Annulée (Cancelled)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Total (DA)</label>
                  <input 
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={editTotalAmount}
                    onChange={e => setEditTotalAmount(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 font-semibold"
                  />
                </div>
              </div>

              {/* Prescription / Lenses Section */}
              <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/70 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">Correction visuelle (Verres de vue)</span>
                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input 
                      type="checkbox"
                      checked={editNeedsLenses}
                      onChange={e => setEditNeedsLenses(e.target.checked)}
                      className="rounded text-slate-900 focus:ring-slate-900"
                    />
                    <span className="text-slate-600 font-medium">Inclut des verres correcteurs</span>
                  </label>
                </div>

                {editNeedsLenses && (
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/80">
                    <div className="space-y-1.5">
                      <span className="text-xs font-medium text-slate-700">Œil Gauche (Left Eye)</span>
                      <div className="grid grid-cols-2 gap-1.5">
                        <input 
                          type="text" 
                          placeholder="SPH (ex: -1.50)" 
                          value={editLeftSph} 
                          onChange={e => setEditLeftSph(e.target.value)} 
                          className="w-full bg-white text-xs border border-slate-200 rounded-lg px-2 py-1.5"
                        />
                        <input 
                          type="text" 
                          placeholder="CYL (ex: -0.50)" 
                          value={editLeftCyl} 
                          onChange={e => setEditLeftCyl(e.target.value)} 
                          className="w-full bg-white text-xs border border-slate-200 rounded-lg px-2 py-1.5"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-xs font-medium text-slate-700">Œil Droit (Right Eye)</span>
                      <div className="grid grid-cols-2 gap-1.5">
                        <input 
                          type="text" 
                          placeholder="SPH (ex: -1.25)" 
                          value={editRightSph} 
                          onChange={e => setEditRightSph(e.target.value)} 
                          className="w-full bg-white text-xs border border-slate-200 rounded-lg px-2 py-1.5"
                        />
                        <input 
                          type="text" 
                          placeholder="CYL (ex: -0.75)" 
                          value={editRightCyl} 
                          onChange={e => setEditRightCyl(e.target.value)} 
                          className="w-full bg-white text-xs border border-slate-200 rounded-lg px-2 py-1.5"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  {savingEdit ? 'Enregistrement...' : 'Enregistrer la commande'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Gestion des Commandes (Orders)</h2>
          <p className="text-xs text-slate-500">Visualisez, modifiez les adresses algériennes, coordonnées et statuts des commandes</p>
        </div>
        <div className="text-sm text-slate-500 font-medium">
          Total : {orders.length} commande{orders.length > 1 ? 's' : ''}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-sm font-medium text-slate-500">
              <th className="px-6 py-4 font-medium">Commande ID</th>
              <th className="px-6 py-4 font-medium">Client & Livraison</th>
              <th className="px-6 py-4 font-medium">Article</th>
              <th className="px-6 py-4 font-medium">Date</th>
              <th className="px-6 py-4 font-medium">Statut</th>
              <th className="px-6 py-4 font-medium">Total</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {orders.map(order => (
              <tr key={order.id} className="hover:bg-slate-50/50">
                <td className="px-6 py-4 font-mono text-xs text-slate-500">
                  <span className="bg-slate-100 px-2 py-1 rounded text-slate-700 font-medium">
                    #{order.id.slice(0, 8)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>{order.customerName || 'Client'}</span>
                  </div>
                  <div className="text-xs text-slate-600 mt-1 flex items-center gap-1.5 font-mono">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{order.customerPhone || 'Pas de numéro'}</span>
                  </div>

                  {/* Delivery Location: Algerian Wilaya & Commune */}
                  {(order.wilaya || order.commune || order.addressDetails) && (
                    <div className="mt-2 bg-slate-50 border border-slate-200/80 rounded-lg p-2 text-xs text-slate-700 max-w-xs">
                      <div className="flex items-start gap-1 font-medium text-slate-900">
                        <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <span>
                            {[order.commune, order.wilaya].filter(Boolean).join(', ')}
                          </span>
                          {order.addressDetails && (
                            <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                              {order.addressDetails}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-1.5">
                    <span className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-full ${
                      order.deliveryMethod === 'home'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-indigo-100 text-indigo-700'
                    }`}>
                      {order.deliveryMethod === 'home' ? '🏠 À domicile' : '🏢 Point relais (Stop Desk)'}
                    </span>
                  </div>

                  {order.needsCorrectingLenses && (
                    <div className="text-xs text-blue-700 mt-2 bg-blue-50/80 rounded-md border border-blue-100 overflow-hidden inline-block">
                      <div className="px-2 py-0.5 bg-blue-100/50 border-b border-blue-100 font-medium text-[10px]">Verres correcteurs</div>
                      <div className="p-1.5 space-y-0.5 text-[11px]">
                        <div><span className="font-semibold">G:</span> SPH {order.leftSph || '-'} | CYL {order.leftCyl || '-'}</div>
                        <div><span className="font-semibold">D:</span> SPH {order.rightSph || '-'} | CYL {order.rightCyl || '-'}</div>
                      </div>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className="font-medium text-slate-800 text-xs block">
                    {order.frameName || 'Produit'}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-500 text-xs">
                  {order.createdAt && typeof order.createdAt?.toMillis === 'function' 
                    ? new Date(order.createdAt.toMillis()).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) 
                    : 'Récemment'}
                </td>
                <td className="px-6 py-4">
                  {getStatusBadge(order.status)}
                </td>
                <td className="px-6 py-4 text-slate-900 font-bold whitespace-nowrap">
                  {order.totalAmount} DA
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => startEdit(order)}
                      className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
                      title="Modifier la commande"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Modifier</span>
                    </button>
                    {order.status !== 'completed' && (
                      <button
                        onClick={() => updateStatus(order.id, 'completed')}
                        className="text-xs font-medium text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-2 rounded-lg transition-colors"
                        title="Marquer comme livrée"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button 
                      onClick={() => handleDelete(order.id)}
                      className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors"
                      title="Supprimer la commande"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                  Aucune commande enregistrée.
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

