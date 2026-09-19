import React from "react";
import { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Trash2, CheckCircle, Clock, MapPin, Phone, User } from 'lucide-react';

export function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      const querySnapshot = await getDocs(collection(db, 'orders'));
      const ordersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      // Sort by newest first assuming createdAt is a timestamp
      ordersData.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return b.createdAt.toMillis() - a.createdAt.toMillis();
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

  async function updateStatus(id: string, newStatus: string) {
    try {
      await updateDoc(doc(db, 'orders', id), { status: newStatus });
      setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
    } catch (error) {
      console.error('Error updating order:', error);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Are you sure you want to delete this order?')) return;
    try {
      await deleteDoc(doc(db, 'orders', id));
      setOrders(orders.filter(o => o.id !== id));
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  }

  if (loading) {
    return <div className="text-slate-500">Loading orders...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Manage Orders</h2>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-sm font-medium text-slate-500">
              <th className="px-6 py-4 font-medium">Order ID</th>
              <th className="px-6 py-4 font-medium">Customer</th>
              <th className="px-6 py-4 font-medium">Date</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Total</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {orders.map(order => (
              <tr key={order.id} className="hover:bg-slate-50/50">
                <td className="px-6 py-4 font-mono text-xs text-slate-500">
                  {order.id.slice(0, 8)}...
                </td>
                <td className="px-6 py-4">
                  <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>{order.customerName || 'Guest'}</span>
                  </div>
                  <div className="text-xs text-slate-600 mt-1 flex items-center gap-1.5 font-mono">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{order.customerPhone || 'No phone'}</span>
                  </div>

                  {/* Delivery Location: Algerian Wilaya & Commune */}
                  {(order.wilaya || order.commune || order.addressDetails) && (
                    <div className="mt-2 bg-slate-50 border border-slate-200/80 rounded-lg p-2 text-xs text-slate-700">
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
                      {order.deliveryMethod === 'home' ? '🏠 To Home (Domicile)' : '🏢 To Desk (Pickup)'}
                    </span>
                  </div>

                  {order.needsCorrectingLenses && (
                    <div className="text-xs text-blue-700 mt-2 bg-blue-50/80 rounded-md border border-blue-100 overflow-hidden inline-block">
                      <div className="px-2 py-1 bg-blue-100/50 border-b border-blue-100 font-medium">Prescription</div>
                      <div className="p-2 space-y-1">
                        {order.leftEye || order.rightEye ? (
                          <div>L({order.leftEye || 'N/A'}) R({order.rightEye || 'N/A'})</div>
                        ) : (
                          <>
                            <div><span className="font-medium text-slate-500">L:</span> SPH {order.leftSph || '-'} | CYL {order.leftCyl || '-'}</div>
                            <div><span className="font-medium text-slate-500">R:</span> SPH {order.rightSph || '-'} | CYL {order.rightCyl || '-'}</div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-slate-500">
                  {order.createdAt ? new Date(order.createdAt.toMillis()).toLocaleDateString() : 'Unknown'}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                    order.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {order.status === 'completed' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    {order.status === 'completed' ? 'Completed' : 'Pending'}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-900 font-medium">${order.totalAmount}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {order.status !== 'completed' && (
                      <button
                        onClick={() => updateStatus(order.id, 'completed')}
                        className="text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Mark Completed
                      </button>
                    )}
                    <button 
                      onClick={() => handleDelete(order.id)}
                      className="text-red-500 hover:text-red-700 transition-colors p-2"
                      title="Delete order"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                  No orders found.
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
