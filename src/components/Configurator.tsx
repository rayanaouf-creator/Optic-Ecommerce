import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Prescription, LensTreatment, EyePrescription, CartItem } from '../types';
import { TREATMENTS, FRAMES } from '../data';
import { ArrowLeft, ArrowRight, Upload, CheckCircle2 } from 'lucide-react';
import { useCart } from '../CartContext';

export function Configurator() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const frame = FRAMES.find(f => f.id === id);

  const [step, setStep] = useState<1 | 2>(1);
  
  // Prescription State
  const [rxType, setRxType] = useState<'manual' | 'upload' | 'none'>('none');
  const [file, setFile] = useState<File | null>(null);
  const [od, setOd] = useState<EyePrescription>({ sphere: '', cylinder: '', axis: '' });
  const [os, setOs] = useState<EyePrescription>({ sphere: '', cylinder: '', axis: '' });
  const [pd, setPd] = useState<string>('63');

  // Treatments State
  const [selectedTreatments, setSelectedTreatments] = useState<string[]>(['t1']); // Default to standard

  if (!frame) {
    return <div className="text-center py-20">Product not found</div>;
  }

  const handleNext = () => {
    if (step === 1) setStep(2);
    else {
      let rx: Prescription;
      if (rxType === 'manual') {
        rx = { type: 'manual', od, os, pd: Number(pd) };
      } else if (rxType === 'upload') {
        rx = { type: 'upload', file };
      } else {
        rx = { type: 'none' };
      }
      
      const treatments = TREATMENTS.filter(t => selectedTreatments.includes(t.id));
      
      // Add to cart logic
      const treatmentsPrice = treatments.reduce((sum, t) => sum + t.price, 0);
      const newItem: CartItem = {
        id: Math.random().toString(36).substr(2, 9),
        frame,
        prescription: rx,
        treatments,
        totalPrice: frame.price + treatmentsPrice,
      };

      addToCart(newItem);
      navigate('/');
    }
  };

  const toggleTreatment = (tid: string) => {
    setSelectedTreatments(prev => 
      prev.includes(tid) ? prev.filter(t => t !== tid) : [...prev, tid]
    );
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <button 
          onClick={step === 1 ? () => navigate(-1) : () => setStep(1)}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {step === 1 ? 'Back to Frame' : 'Back to Prescription'}
        </button>
      </div>

      <div className="flex gap-4 mb-12">
        <div className="flex-1">
          <div className={`h-1.5 rounded-full ${step >= 1 ? 'bg-slate-900' : 'bg-slate-200'}`} />
          <div className="text-xs font-medium text-slate-500 mt-2">Step 1: Prescription</div>
        </div>
        <div className="flex-1">
          <div className={`h-1.5 rounded-full ${step >= 2 ? 'bg-slate-900' : 'bg-slate-200'}`} />
          <div className="text-xs font-medium text-slate-500 mt-2">Step 2: Lenses & Treatments</div>
        </div>
      </div>

      {step === 1 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="font-serif text-3xl text-slate-900 mb-6">Your Prescription</h2>
          
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setRxType('none')}
              className={`flex-1 py-4 px-2 sm:px-6 rounded-xl border text-center font-medium transition-colors ${
                rxType === 'none' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              No Prescription
            </button>
            <button
              onClick={() => setRxType('manual')}
              className={`flex-1 py-4 px-2 sm:px-6 rounded-xl border text-center font-medium transition-colors ${
                rxType === 'manual' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              Enter Manually
            </button>
            <button
              onClick={() => setRxType('upload')}
              className={`flex-1 py-4 px-2 sm:px-6 rounded-xl border text-center font-medium transition-colors ${
                rxType === 'upload' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              Upload Image/PDF
            </button>
          </div>

          {rxType === 'none' && (
            <div className="bg-white border border-slate-100 rounded-3xl p-12 flex flex-col items-center justify-center text-center shadow-sm">
              <h3 className="font-serif text-2xl text-slate-900 mb-4">Frame Only</h3>
              <p className="text-slate-500 max-w-md">
                Your frames will come with clear, non-prescription (plano) lenses. You can still add protective treatments in the next step.
              </p>
            </div>
          )}

          {rxType === 'manual' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="grid grid-cols-4 gap-4 mb-4 text-sm font-medium text-slate-500 border-b border-slate-100 pb-2">
                  <div>Eye</div>
                  <div>Sphere (SPH)</div>
                  <div>Cylinder (CYL)</div>
                  <div>Axis</div>
                </div>
                
                <div className="grid grid-cols-4 gap-4 mb-4 items-center">
                  <div className="font-medium text-slate-900">OD (Right)</div>
                  <input type="text" placeholder="-2.00" className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" value={od.sphere} onChange={e => setOd({...od, sphere: e.target.value})} />
                  <input type="text" placeholder="-0.50" className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" value={od.cylinder} onChange={e => setOd({...od, cylinder: e.target.value})} />
                  <input type="text" placeholder="180" className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" value={od.axis} onChange={e => setOd({...od, axis: e.target.value})} />
                </div>

                <div className="grid grid-cols-4 gap-4 items-center">
                  <div className="font-medium text-slate-900">OS (Left)</div>
                  <input type="text" placeholder="-1.75" className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" value={os.sphere} onChange={e => setOs({...os, sphere: e.target.value})} />
                  <input type="text" placeholder="-0.25" className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" value={os.cylinder} onChange={e => setOs({...os, cylinder: e.target.value})} />
                  <input type="text" placeholder="175" className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" value={os.axis} onChange={e => setOs({...os, axis: e.target.value})} />
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-slate-900">Pupillary Distance (PD)</h4>
                  <p className="text-sm text-slate-500">Distance between your pupils in mm.</p>
                </div>
                <input type="number" placeholder="63" className="w-24 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 text-center" value={pd} onChange={e => setPd(e.target.value)} />
              </div>
            </div>
          )}
          
          {rxType === 'upload' && (
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-400">
                <Upload className="w-8 h-8" />
              </div>
              <h3 className="font-medium text-slate-900 mb-2">Upload your prescription</h3>
              <p className="text-sm text-slate-500 mb-6 max-w-sm">
                Take a photo or upload a PDF of your doctor's prescription. We'll verify the details before production.
              </p>
              
              <input 
                type="file" 
                id="rx-upload" 
                className="hidden" 
                accept="image/*,.pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <label 
                htmlFor="rx-upload"
                className="bg-slate-900 text-white px-6 py-3 rounded-full font-medium cursor-pointer hover:bg-slate-800 transition-colors"
              >
                Select File
              </label>

              {file && (
                <div className="mt-6 flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm font-medium">{file.name}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="font-serif text-3xl text-slate-900 mb-2">Lenses & Treatments</h2>
          <p className="text-slate-500 mb-8">Customize your lenses for optimal clarity and protection.</p>

          <div className="space-y-4">
            {TREATMENTS.map(treatment => {
              const isSelected = selectedTreatments.includes(treatment.id);
              // Make standard mutually exclusive or just add on?
              // Assuming treatment 1 is base, others are add-ons. 
              
              return (
                <div 
                  key={treatment.id}
                  onClick={() => toggleTreatment(treatment.id)}
                  className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                    isSelected ? 'border-slate-900 bg-slate-50' : 'border-slate-100 bg-white hover:border-slate-200'
                  } flex justify-between items-center`}
                >
                  <div className="pr-8">
                    <h4 className="font-medium text-slate-900 text-lg">{treatment.name}</h4>
                    <p className="text-slate-500 text-sm mt-1">{treatment.description}</p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="font-medium text-slate-900">
                      {treatment.price === 0 ? 'Included' : `+$${treatment.price}`}
                    </span>
                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                      isSelected ? 'bg-slate-900 border-slate-900 text-white' : 'border-slate-300'
                    }`}>
                      {isSelected && <CheckCircle2 className="w-4 h-4" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-12 flex justify-end">
        <button 
          onClick={handleNext}
          className="bg-slate-900 text-white px-8 py-4 rounded-xl font-medium hover:bg-slate-800 transition-colors flex items-center gap-2"
        >
          {step === 1 ? 'Continue to Lenses' : 'Add to Cart'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
