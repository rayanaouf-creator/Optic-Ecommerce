import React from "react";
import { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Frame } from '../types';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  frame: Frame;
}

export function OrderModal({ isOpen, onClose, frame }: OrderModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [delivery, setDelivery] = useState<'home' | 'desk'>('home');
  const [needsLenses, setNeedsLenses] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'orders'), {
        frameId: frame.id,
        frameName: frame.name,
        customerName: name,
        customerPhone: phone,
        deliveryMethod: delivery,
        needsCorrectingLenses: needsLenses,
        totalAmount: frame.price,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        setName('');
        setPhone('');
        setDelivery('home');
        setNeedsLenses(false);
      }, 2000);
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={!submitting && !success ? onClose : undefined}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.3, type: "spring", bounce: 0 }}
            className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
          >
            {success ? (
              <div className="p-10 text-center flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-2">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-serif text-slate-900">Order Received!</h2>
                <p className="text-slate-500">We'll contact you shortly to confirm.</p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center p-6 border-b border-slate-100">
                  <h2 className="text-xl font-serif text-slate-900">Direct Order</h2>
                  <button 
                    onClick={onClose}
                    className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-full transition-colors"
                    disabled={submitting}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-6">
                    <img src={frame.image} alt={frame.name} className="w-16 h-16 object-cover rounded-xl bg-white" />
                    <div>
                      <h3 className="font-medium text-slate-900">{frame.name}</h3>
                      <p className="text-sm text-slate-500">${frame.price}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                      <input 
                        type="text" 
                        required
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition-shadow"
                        placeholder="e.g. John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number</label>
                      <input 
                        type="tel" 
                        required
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition-shadow"
                        placeholder="e.g. +1 234 567 890"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Delivery Method</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setDelivery('home')}
                          className={`py-3 px-4 rounded-xl border text-sm font-medium transition-colors ${
                            delivery === 'home' 
                              ? 'border-slate-900 bg-slate-900 text-white' 
                              : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          To Home
                        </button>
                        <button
                          type="button"
                          onClick={() => setDelivery('desk')}
                          className={`py-3 px-4 rounded-xl border text-sm font-medium transition-colors ${
                            delivery === 'desk' 
                              ? 'border-slate-900 bg-slate-900 text-white' 
                              : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          To Desk (Pickup)
                        </button>
                      </div>
                    </div>

                    <div className="pt-2">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative flex items-center justify-center">
                          <input 
                            type="checkbox" 
                            checked={needsLenses}
                            onChange={(e) => setNeedsLenses(e.target.checked)}
                            className="peer sr-only"
                          />
                          <div className="w-6 h-6 rounded-md border-2 border-slate-300 peer-checked:border-slate-900 peer-checked:bg-slate-900 transition-colors group-hover:border-slate-400 peer-checked:group-hover:border-slate-900" />
                          <svg className="absolute w-4 h-4 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-sm font-medium text-slate-700">I need correcting lenses</span>
                      </label>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button 
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-slate-900 text-white py-4 rounded-xl font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? 'Placing Order...' : 'Confirm Order'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
