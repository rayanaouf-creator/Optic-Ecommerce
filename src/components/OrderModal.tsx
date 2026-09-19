import React from "react";
import { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { X, MapPin } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { ALGERIA_WILAYAS } from '../data/algeriaLocations';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
  };
}

export function OrderModal({ isOpen, onClose, product }: OrderModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedWilayaCode, setSelectedWilayaCode] = useState('16'); // Default to Alger
  const [selectedCommune, setSelectedCommune] = useState('Alger-Centre');
  const [isCustomCommune, setIsCustomCommune] = useState(false);
  const [customCommuneName, setCustomCommuneName] = useState('');
  const [addressDetails, setAddressDetails] = useState('');
  const [delivery, setDelivery] = useState<'home' | 'desk'>('home');
  const [needsLenses, setNeedsLenses] = useState(false);
  const [leftSph, setLeftSph] = useState('');
  const [leftCyl, setLeftCyl] = useState('');
  const [rightSph, setRightSph] = useState('');
  const [rightCyl, setRightCyl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const currentWilaya = ALGERIA_WILAYAS.find(w => w.code === selectedWilayaCode) || ALGERIA_WILAYAS[15];

  const handleWilayaChange = (code: string) => {
    setSelectedWilayaCode(code);
    const wilaya = ALGERIA_WILAYAS.find(w => w.code === code);
    if (wilaya && wilaya.communes.length > 0) {
      setSelectedCommune(wilaya.communes[0]);
      setIsCustomCommune(false);
      setCustomCommuneName('');
    } else {
      setSelectedCommune('');
      setIsCustomCommune(true);
    }
  };

  const handleCommuneChange = (value: string) => {
    if (value === '__custom__') {
      setIsCustomCommune(true);
      setCustomCommuneName('');
    } else {
      setIsCustomCommune(false);
      setSelectedCommune(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalCommune = isCustomCommune ? customCommuneName.trim() : selectedCommune.trim();
    if (!name.trim() || !phone.trim() || !selectedWilayaCode || !finalCommune) {
      alert('Veuillez renseigner tous les champs obligatoires (nom, téléphone, wilaya et commune).');
      return;
    }
    
    setSubmitting(true);
    try {
      const wilayaFull = `${currentWilaya.code} - ${currentWilaya.name}`;
      await addDoc(collection(db, 'orders'), {
        frameId: product.id,
        frameName: product.name,
        customerName: name.trim(),
        customerPhone: phone.trim(),
        wilaya: wilayaFull,
        wilayaCode: currentWilaya.code,
        wilayaName: currentWilaya.name,
        commune: finalCommune,
        addressDetails: addressDetails.trim(),
        deliveryMethod: delivery,
        needsCorrectingLenses: needsLenses,
        leftSph: needsLenses ? leftSph : null,
        leftCyl: needsLenses ? leftCyl : null,
        rightSph: needsLenses ? rightSph : null,
        rightCyl: needsLenses ? rightCyl : null,
        totalAmount: product.price,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        setName('');
        setPhone('');
        setSelectedWilayaCode('16');
        setSelectedCommune('Alger-Centre');
        setIsCustomCommune(false);
        setCustomCommuneName('');
        setAddressDetails('');
        setDelivery('home');
        setNeedsLenses(false);
        setLeftSph('');
        setLeftCyl('');
        setRightSph('');
        setRightCyl('');
      }, 2000);
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Une erreur est survenue lors de la commande. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={!submitting && !success ? onClose : undefined}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.3, type: "spring", bounce: 0 }}
            className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
          >
            {success ? (
              <div className="p-10 text-center flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-2">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-serif text-slate-900">Commande reçue !</h2>
                <p className="text-slate-500">Nous vous contacterons rapidement pour confirmer votre commande.</p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 shrink-0 bg-white sticky top-0 z-10">
                  <div>
                    <h2 className="text-lg font-serif text-slate-900">Passer commande</h2>
                    <p className="text-xs text-slate-400">Livraison express dans toute l'Algérie</p>
                  </div>
                  <button 
                    onClick={onClose}
                    className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-full transition-colors cursor-pointer"
                    disabled={submitting}
                    aria-label="Fermer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
                  {/* Product Summary */}
                  <div className="flex items-center gap-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                    <img src={product.image} alt={product.name} className="w-14 h-14 object-cover rounded-xl bg-white p-1 border border-slate-200/60" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-slate-900 text-sm truncate">{product.name}</h3>
                      <p className="text-xs font-semibold text-slate-700 mt-0.5">{product.price} DA</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Customer Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Nom et prénom <span className="text-red-500">*</span>
                        </label>
                        <input 
                          type="text" 
                          required
                          value={name}
                          onChange={e => setName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition-shadow"
                          placeholder="ex. Karim Benali"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Numéro de téléphone <span className="text-red-500">*</span>
                        </label>
                        <input 
                          type="tel" 
                          required
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition-shadow"
                          placeholder="ex. 0550 12 34 56"
                        />
                      </div>
                    </div>

                    {/* Algerian Address: Province (Wilaya) & Commune */}
                    <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 space-y-3.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 uppercase tracking-wider">
                        <MapPin className="w-4 h-4 text-slate-700" />
                        <span>Lieu de livraison</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Province / Wilaya */}
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1.5">
                            Wilaya <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={selectedWilayaCode}
                            onChange={(e) => handleWilayaChange(e.target.value)}
                            required
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                          >
                            {ALGERIA_WILAYAS.map((w) => (
                              <option key={w.code} value={w.code}>
                                {w.code} - {w.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Commune */}
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1.5">
                            Commune <span className="text-red-500">*</span>
                          </label>
                          {!isCustomCommune ? (
                            <select
                              value={selectedCommune}
                              onChange={(e) => handleCommuneChange(e.target.value)}
                              required
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                            >
                              {currentWilaya.communes.map((communeName) => (
                                <option key={communeName} value={communeName}>
                                  {communeName}
                                </option>
                              ))}
                              <option value="__custom__">+ Autre commune (saisie libre)...</option>
                            </select>
                          ) : (
                            <div className="space-y-1.5">
                              <input
                                type="text"
                                required
                                value={customCommuneName}
                                onChange={(e) => setCustomCommuneName(e.target.value)}
                                placeholder="Indiquez votre commune..."
                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setIsCustomCommune(false);
                                  setSelectedCommune(currentWilaya.communes[0] || '');
                                }}
                                className="text-[11px] text-slate-500 hover:text-slate-900 underline"
                              >
                                ← Choisir dans la liste de {currentWilaya.name}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Street Address / Delivery Notes */}
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1.5">
                          Adresse exacte (Cité, rue, bâtiment, n°)
                        </label>
                        <input
                          type="text"
                          value={addressDetails}
                          onChange={(e) => setAddressDetails(e.target.value)}
                          placeholder="ex. Cité 500 Logements, Bâtiment 4, N° 12..."
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition-shadow"
                        />
                      </div>
                    </div>
                    
                    {/* Delivery Method */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-2">
                        Mode de livraison
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setDelivery('home')}
                          className={`py-3 px-3 rounded-xl border text-xs sm:text-sm font-medium transition-all text-center cursor-pointer ${
                            delivery === 'home' 
                              ? 'border-slate-900 bg-slate-900 text-white shadow-sm' 
                              : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          <div className="font-semibold">À domicile</div>
                          <div className="text-[11px] opacity-80 mt-0.5">Livraison à votre porte</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDelivery('desk')}
                          className={`py-3 px-3 rounded-xl border text-xs sm:text-sm font-medium transition-all text-center cursor-pointer ${
                            delivery === 'desk' 
                              ? 'border-slate-900 bg-slate-900 text-white shadow-sm' 
                              : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          <div className="font-semibold">Point relais</div>
                          <div className="text-[11px] opacity-80 mt-0.5">Bureau Stop Desk</div>
                        </button>
                      </div>
                    </div>

                    {/* Correcting Lenses Prescription */}
                    <div className="pt-2">
                      <label className="flex items-center gap-3 cursor-pointer group mb-3">
                        <div className="relative flex items-center justify-center">
                          <input 
                            type="checkbox" 
                            checked={needsLenses}
                            onChange={(e) => setNeedsLenses(e.target.checked)}
                            className="peer sr-only"
                          />
                          <div className="w-5 h-5 rounded-md border-2 border-slate-300 peer-checked:border-slate-900 peer-checked:bg-slate-900 transition-colors group-hover:border-slate-400 peer-checked:group-hover:border-slate-900" />
                          <svg className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-xs sm:text-sm font-medium text-slate-700">J'ai besoin de verres correcteurs</span>
                      </label>
                      
                      {needsLenses && (
                        <div className="space-y-3.5 animate-in fade-in slide-in-from-top-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                          <div>
                            <span className="block text-xs font-semibold text-slate-900 mb-1.5">Œil gauche (OG)</span>
                            <div className="grid grid-cols-2 gap-2.5">
                              <div>
                                <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">SPH</label>
                                <input 
                                  type="text" 
                                  value={leftSph}
                                  onChange={e => setLeftSph(e.target.value)}
                                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                                  placeholder="-2.00"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">CYL</label>
                                <input 
                                  type="text" 
                                  value={leftCyl}
                                  onChange={e => setLeftCyl(e.target.value)}
                                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                                  placeholder="-0.50"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="border-t border-slate-200 pt-3">
                            <span className="block text-xs font-semibold text-slate-900 mb-1.5">Œil droit (OD)</span>
                            <div className="grid grid-cols-2 gap-2.5">
                              <div>
                                <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">SPH</label>
                                <input 
                                  type="text" 
                                  value={rightSph}
                                  onChange={e => setRightSph(e.target.value)}
                                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                                  placeholder="-1.75"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">CYL</label>
                                <input 
                                  type="text" 
                                  value={rightCyl}
                                  onChange={e => setRightCyl(e.target.value)}
                                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                                  placeholder="-0.75"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-2">
                    <button 
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md cursor-pointer"
                    >
                      {submitting ? 'Envoi de la commande...' : 'Confirmer la commande'}
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
