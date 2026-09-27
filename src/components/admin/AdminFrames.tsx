import React from "react";
import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Frame, Brand, Gender, AgeGroup } from '../../types';
import { 
  Trash2, Plus, Upload, Link as LinkIcon, Edit2, X, Check, 
  Package, AlertTriangle, Search, ShieldAlert, Minus, UserCheck, Baby
} from 'lucide-react';
import { compressImage } from '../../lib/imageUtils';

export function AdminFrames() {
  const [frames, setFrames] = useState<Frame[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStockStatus, setFilterStockStatus] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');
  const [filterBrand, setFilterBrand] = useState('all');
  const [filterGender, setFilterGender] = useState<'all' | Gender>('all');
  const [filterAgeGroup, setFilterAgeGroup] = useState<'all' | AgeGroup>('all');

  // Form state for adding
  const [inputType, setInputType] = useState<'upload' | 'url'>('upload');
  const [imageUrl, setImageUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [isCustomBrand, setIsCustomBrand] = useState(false);
  const [customBrandName, setCustomBrandName] = useState('');
  const [price, setPrice] = useState('');
  
  // Sex & Tranche d'âge
  const [gender, setGender] = useState<Gender>('Unisex');
  const [ageGroup, setAgeGroup] = useState<AgeGroup>('Adult');
  const [shape, setShape] = useState<'Round' | 'Square' | 'Aviator' | 'Cat Eye'>('Square');
  const [colors, setColors] = useState('');
  
  // Stock tracking form inputs
  const [stockQuantity, setStockQuantity] = useState('10');
  const [lowStockThreshold, setLowStockThreshold] = useState('3');
  const [sku, setSku] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  // Editing state
  const [editingFrame, setEditingFrame] = useState<Frame | null>(null);
  const [editName, setEditName] = useState('');
  const [editBrand, setEditBrand] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editGender, setEditGender] = useState<Gender>('Unisex');
  const [editAgeGroup, setEditAgeGroup] = useState<AgeGroup>('Adult');
  const [editShape, setEditShape] = useState<'Round' | 'Square' | 'Aviator' | 'Cat Eye'>('Square');
  const [editColors, setEditColors] = useState('');
  const [editStockQuantity, setEditStockQuantity] = useState('10');
  const [editLowStockThreshold, setEditLowStockThreshold] = useState('3');
  const [editSku, setEditSku] = useState('');
  const [editInStock, setEditInStock] = useState(true);
  const [editInputType, setEditInputType] = useState<'keep' | 'upload' | 'url'>('keep');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Quick inline stock edit state: frameId -> updating boolean
  const [updatingStockId, setUpdatingStockId] = useState<string | null>(null);

  useEffect(() => {
    fetchFrames();
    fetchBrands();
  }, []);

  async function fetchBrands() {
    try {
      const snap = await getDocs(collection(db, 'brands'));
      const brandsData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Brand));
      setBrands(brandsData);
      if (brandsData.length > 0 && !brand) {
        setBrand(brandsData[0].name);
      }
    } catch (err) {
      console.error('Error fetching brands:', err);
    }
  }

  async function fetchFrames() {
    try {
      const querySnapshot = await getDocs(collection(db, 'frames'));
      const framesData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        const qty = data.stockQuantity !== undefined ? Number(data.stockQuantity) : 10;
        const inStockVal = data.inStock !== undefined ? Boolean(data.inStock) : qty > 0;
        
        // Normalize Gender & Tranche d'âge
        let g: Gender = 'Unisex';
        if (data.gender) {
          g = data.gender;
        } else if (data.category === 'Men') {
          g = 'Men';
        } else if (data.category === 'Women') {
          g = 'Women';
        }

        let a: AgeGroup = 'Adult';
        if (data.ageGroup) {
          a = data.ageGroup;
        } else if (data.category === 'Kids' || data.category === 'Kid') {
          a = 'Kid';
        }

        return {
          id: doc.id,
          ...data,
          gender: g,
          ageGroup: a,
          category: g, // backward compatibility
          stockQuantity: qty,
          inStock: inStockVal,
          lowStockThreshold: data.lowStockThreshold !== undefined ? Number(data.lowStockThreshold) : 3,
          sku: data.sku || ''
        } as Frame;
      });
      setFrames(framesData);
    } catch (error) {
      console.error('Error fetching frames:', error);
    } finally {
      setLoading(false);
    }
  }

  const uploadToServer = async (file: File): Promise<string> => {
    return compressImage(file, 800, 0.7);
  };

  async function handleAddFrame(e: React.FormEvent) {
    e.preventDefault();
    if ((inputType === 'upload' && !file) || (inputType === 'url' && !imageUrl)) return;
    const finalBrand = isCustomBrand ? customBrandName.trim() : brand.trim();
    if (!name.trim() || !price || !finalBrand) return;
    
    setSubmitting(true);
    try {
      setUploadProgress('Traitement de l\'image...');
      let finalImageUrl = imageUrl;
      
      if (inputType === 'upload' && file) {
        finalImageUrl = await uploadToServer(file);
      }

      setUploadProgress('Enregistrement en cours...');
      const parsedStock = Math.max(0, parseInt(stockQuantity, 10) || 0);
      const parsedThreshold = Math.max(1, parseInt(lowStockThreshold, 10) || 3);
      
      const newFrame: Omit<Frame, 'id'> = {
        name: name.trim(),
        brand: finalBrand,
        price: Number(price),
        image: finalImageUrl,
        gender: gender || 'Unisex',
        ageGroup: ageGroup || 'Adult',
        category: gender || 'Unisex', // preserve for legacy queries
        shape: shape || 'Square',
        colors: colors.split(',').map(c => c.trim()).filter(Boolean),
        stockQuantity: parsedStock,
        inStock: parsedStock > 0,
        lowStockThreshold: parsedThreshold,
        sku: sku.trim() || `OPT-${Date.now().toString().slice(-6)}`
      };
      
      const docRef = await addDoc(collection(db, 'frames'), newFrame);
      setFrames([...frames, { id: docRef.id, ...newFrame }]);
      
      // Reset form
      setFile(null);
      setImageUrl('');
      setName('');
      setPrice('');
      setColors('');
      setCustomBrandName('');
      setIsCustomBrand(false);
      setGender('Unisex');
      setAgeGroup('Adult');
      setStockQuantity('10');
      setLowStockThreshold('3');
      setSku('');
      setUploadProgress('');
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (error) {
      console.error('Error adding frame:', error);
      alert('Échec de l\'enregistrement du produit.');
      setUploadProgress('');
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(frame: Frame) {
    setEditingFrame(frame);
    setEditName(frame.name);
    setEditBrand(frame.brand || '');
    setEditPrice(frame.price.toString());
    setEditGender(frame.gender || (frame.category as any) || 'Unisex');
    setEditAgeGroup(frame.ageGroup || 'Adult');
    setEditShape((frame.shape as any) || 'Square');
    setEditColors(frame.colors ? frame.colors.join(', ') : '');
    const currentQty = frame.stockQuantity !== undefined ? frame.stockQuantity : 10;
    setEditStockQuantity(currentQty.toString());
    setEditLowStockThreshold((frame.lowStockThreshold || 3).toString());
    setEditSku(frame.sku || '');
    setEditInStock(frame.inStock !== undefined ? frame.inStock : currentQty > 0);
    setEditInputType('keep');
    setEditImageUrl(frame.image);
    setEditFile(null);
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingFrame) return;
    if (!editName.trim() || !editBrand.trim() || !editPrice) {
      alert('Veuillez renseigner le nom, la marque et le prix.');
      return;
    }

    setEditSubmitting(true);
    try {
      let finalImg = editingFrame.image;
      if (editInputType === 'upload' && editFile) {
        finalImg = await uploadToServer(editFile);
      } else if (editInputType === 'url' && editImageUrl.trim()) {
        finalImg = editImageUrl.trim();
      }

      const parsedStock = Math.max(0, parseInt(editStockQuantity, 10) || 0);
      const parsedThreshold = Math.max(1, parseInt(editLowStockThreshold, 10) || 3);
      const calculatedInStock = parsedStock > 0 ? editInStock : false;

      const updatedData = {
        name: editName.trim(),
        brand: editBrand.trim(),
        price: Number(editPrice),
        gender: editGender,
        ageGroup: editAgeGroup,
        category: editGender, // Keep synced
        shape: editShape,
        colors: editColors.split(',').map(c => c.trim()).filter(Boolean),
        image: finalImg,
        stockQuantity: parsedStock,
        inStock: calculatedInStock,
        lowStockThreshold: parsedThreshold,
        sku: editSku.trim()
      };

      await updateDoc(doc(db, 'frames', editingFrame.id), updatedData);
      setFrames(frames.map(f => f.id === editingFrame.id ? { ...f, ...updatedData } : f));
      setEditingFrame(null);
    } catch (error) {
      console.error('Error updating frame:', error);
      alert('Erreur lors de la modification de l\'article.');
    } finally {
      setEditSubmitting(false);
    }
  }

  // Quick +1 / -1 Stock Adjustments
  async function adjustStockQuick(frame: Frame, delta: number) {
    const currentQty = frame.stockQuantity !== undefined ? frame.stockQuantity : 10;
    const newQty = Math.max(0, currentQty + delta);
    const newInStock = newQty > 0;
    
    setUpdatingStockId(frame.id);
    try {
      await updateDoc(doc(db, 'frames', frame.id), {
        stockQuantity: newQty,
        inStock: newInStock
      });
      setFrames(prev => prev.map(f => f.id === frame.id ? { ...f, stockQuantity: newQty, inStock: newInStock } : f));
    } catch (err) {
      console.error('Error quick updating stock:', err);
      alert('Erreur lors de la mise à jour rapide du stock.');
    } finally {
      setUpdatingStockId(null);
    }
  }

  // Toggle inStock status directly
  async function toggleInStock(frame: Frame) {
    const currentStatus = frame.inStock !== false;
    const newStatus = !currentStatus;
    
    setUpdatingStockId(frame.id);
    try {
      await updateDoc(doc(db, 'frames', frame.id), {
        inStock: newStatus
      });
      setFrames(prev => prev.map(f => f.id === frame.id ? { ...f, inStock: newStatus } : f));
    } catch (err) {
      console.error('Error toggling inStock:', err);
    } finally {
      setUpdatingStockId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) return;
    
    try {
      await deleteDoc(doc(db, 'frames', id));
      setFrames(frames.filter(s => s.id !== id));
    } catch (error) {
      console.error('Error deleting frame:', error);
    }
  }

  // Inventory Summary Stats
  const totalItems = frames.length;
  const totalStockUnits = frames.reduce((acc, f) => acc + (f.stockQuantity !== undefined ? f.stockQuantity : 10), 0);
  const outOfStockCount = frames.filter(f => (f.stockQuantity !== undefined ? f.stockQuantity : 10) === 0 || f.inStock === false).length;
  const lowStockCount = frames.filter(f => {
    const qty = f.stockQuantity !== undefined ? f.stockQuantity : 10;
    const th = f.lowStockThreshold || 3;
    return qty > 0 && qty <= th && f.inStock !== false;
  }).length;
  const inStockCount = frames.filter(f => {
    const qty = f.stockQuantity !== undefined ? f.stockQuantity : 10;
    const th = f.lowStockThreshold || 3;
    return qty > th && f.inStock !== false;
  }).length;

  // Filtered List
  const filteredFrames = frames.filter(f => {
    const matchesSearch = 
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.brand && f.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (f.sku && f.sku.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesBrand = filterBrand === 'all' || f.brand === filterBrand;
    const matchesGender = filterGender === 'all' || f.gender === filterGender;
    const matchesAgeGroup = filterAgeGroup === 'all' || f.ageGroup === filterAgeGroup;

    const qty = f.stockQuantity !== undefined ? f.stockQuantity : 10;
    const th = f.lowStockThreshold || 3;
    const isOut = qty === 0 || f.inStock === false;
    const isLow = qty > 0 && qty <= th && f.inStock !== false;
    const isIn = qty > th && f.inStock !== false;

    let matchesStock = true;
    if (filterStockStatus === 'in_stock') matchesStock = isIn;
    if (filterStockStatus === 'low_stock') matchesStock = isLow;
    if (filterStockStatus === 'out_of_stock') matchesStock = isOut;

    return matchesSearch && matchesBrand && matchesGender && matchesAgeGroup && matchesStock;
  });

  if (loading) {
    return <div className="text-slate-500 py-10 text-center">Chargement du stock et des produits...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Top Header & Stock Summary KPI Cards */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Gestion des Produits & Suivi de Stock</h2>
        <p className="text-sm text-slate-500">
          Gérez vos produits par Sexe (Homme, Femme, Unisexe), Tranche d'âge (Adulte, Enfant) et suivez votre stock en temps réel.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Stock */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>TOTAL UNITÉS</span>
            <Package className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900">{totalStockUnits}</div>
          <div className="text-[11px] text-slate-400 mt-1">{totalItems} références au catalogue</div>
        </div>

        {/* In Stock */}
        <div 
          onClick={() => setFilterStockStatus(filterStockStatus === 'in_stock' ? 'all' : 'in_stock')}
          className={`bg-white p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
            filterStockStatus === 'in_stock' ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-emerald-700 text-xs font-semibold mb-2">
            <span>EN STOCK</span>
            <Check className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-600">{inStockCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">Disponibles immédiatement</div>
        </div>

        {/* Low Stock Alert */}
        <div 
          onClick={() => setFilterStockStatus(filterStockStatus === 'low_stock' ? 'all' : 'low_stock')}
          className={`bg-white p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
            filterStockStatus === 'low_stock' ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-amber-700 text-xs font-semibold mb-2">
            <span>STOCK FAIBLE</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-amber-600">{lowStockCount}</div>
          <div className="text-[11px] text-amber-700/80 mt-1">≤ seuil d'alerte configuré</div>
        </div>

        {/* Out of Stock */}
        <div 
          onClick={() => setFilterStockStatus(filterStockStatus === 'out_of_stock' ? 'all' : 'out_of_stock')}
          className={`bg-white p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
            filterStockStatus === 'out_of_stock' ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-rose-700 text-xs font-semibold mb-2">
            <span>RUPTURE DE STOCK</span>
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-rose-600">{outOfStockCount}</div>
          <div className="text-[11px] text-rose-700/80 mt-1">Épuisé (Qty = 0)</div>
        </div>
      </div>

      {/* Edit Modal with Sexe, Tranche d'âge & Stock Controls */}
      {editingFrame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Modifier le Produit & le Stock</h3>
                <p className="text-xs text-slate-500">Mettre à jour le sexe, la tranche d'âge et les quantités</p>
              </div>
              <button 
                onClick={() => setEditingFrame(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nom du produit (Name)</label>
                  <input 
                    type="text" 
                    required 
                    value={editName} 
                    onChange={e => setEditName(e.target.value)} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Marque (Brand)</label>
                  <div className="space-y-1.5">
                    <select
                      value={brands.some(b => b.name === editBrand) ? editBrand : '__custom__'}
                      onChange={e => {
                        if (e.target.value === '__custom__') {
                          setEditBrand('');
                        } else {
                          setEditBrand(e.target.value);
                        }
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                    >
                      {brands.map(b => (
                        <option key={b.id} value={b.name}>{b.name}</option>
                      ))}
                      <option value="__custom__">+ Saisir une autre marque...</option>
                    </select>
                    {(!brands.some(b => b.name === editBrand) || editBrand === '') && (
                      <input 
                        type="text" 
                        required 
                        value={editBrand} 
                        onChange={e => setEditBrand(e.target.value)} 
                        placeholder="Ex. Oliver Peoples, Tom Ford..."
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Sexe & Tranche d'âge in Edit Modal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                    Sexe (Genre)
                  </label>
                  <select 
                    value={editGender} 
                    onChange={e => setEditGender(e.target.value as Gender)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="Men">Homme (Men)</option>
                    <option value="Women">Femme (Women)</option>
                    <option value="Unisex">Unisexe (Unisex)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                    <Baby className="w-3.5 h-3.5 text-amber-600" />
                    Tranche d'âge (Age)
                  </label>
                  <select 
                    value={editAgeGroup} 
                    onChange={e => setEditAgeGroup(e.target.value as AgeGroup)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="Adult">Adulte (Adult)</option>
                    <option value="Kid">Enfant (Kid)</option>
                  </select>
                </div>
              </div>

              {/* Stock Tracking Block in Modal */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-slate-700" />
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Gestion du Stock (Inventory)
                    </span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={editInStock}
                      onChange={e => setEditInStock(e.target.checked)}
                      className="w-4 h-4 text-slate-900 rounded focus:ring-slate-900"
                    />
                    Disponible à la vente
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Quantité disponible (Qty)
                    </label>
                    <input 
                      type="number" 
                      min="0"
                      required
                      value={editStockQuantity} 
                      onChange={e => setEditStockQuantity(e.target.value)} 
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Seuil d'alerte (Low Stock)
                    </label>
                    <input 
                      type="number" 
                      min="1"
                      value={editLowStockThreshold} 
                      onChange={e => setEditLowStockThreshold(e.target.value)} 
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Code SKU / Réf.
                    </label>
                    <input 
                      type="text" 
                      value={editSku} 
                      onChange={e => setEditSku(e.target.value)} 
                      placeholder="Ex: OPT-0012"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Prix (DA)</label>
                  <input 
                    type="number" 
                    required 
                    value={editPrice} 
                    onChange={e => setEditPrice(e.target.value)} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Forme (Shape)</label>
                  <select 
                    value={editShape} 
                    onChange={e => setEditShape(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="Square">Carrée (Square)</option>
                    <option value="Round">Ronde (Round)</option>
                    <option value="Aviator">Aviateur (Aviator)</option>
                    <option value="Cat Eye">Papillon (Cat Eye)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Couleurs (séparées par une virgule)</label>
                <input 
                  type="text" 
                  value={editColors} 
                  onChange={e => setEditColors(e.target.value)} 
                  placeholder="Ex: #000000, #C0C0C0, Gold, Brown"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              {/* Photo Source Switcher */}
              <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 space-y-2">
                <label className="block text-xs font-semibold text-slate-700">Photo du produit</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditInputType('keep')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      editInputType === 'keep' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-700'
                    }`}
                  >
                    Garder l'actuelle
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditInputType('upload')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      editInputType === 'upload' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-700'
                    }`}
                  >
                    Téléverser un nouveau fichier
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditInputType('url')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      editInputType === 'url' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-700'
                    }`}
                  >
                    Utiliser une URL
                  </button>
                </div>

                {editInputType === 'upload' && (
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={e => setEditFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-slate-600 bg-white p-2 rounded-lg border border-slate-200"
                  />
                )}
                {editInputType === 'url' && (
                  <input 
                    type="text" 
                    required 
                    value={editImageUrl} 
                    onChange={e => setEditImageUrl(e.target.value)} 
                    placeholder="https://..."
                    className="w-full text-xs bg-white px-3 py-2 rounded-lg border border-slate-200"
                  />
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingFrame(null)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  {editSubmitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Frame Card with Sexe and Tranche d'âge */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Ajouter un nouveau produit (Add Product)</h2>
            <p className="text-xs text-slate-500">Définissez le sexe, la tranche d'âge (Adulte / Enfant) et le stock</p>
          </div>
        </div>

        <form onSubmit={handleAddFrame} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
          <div className="col-span-1 md:col-span-2 space-y-3">
            <div className="flex gap-4 border-b border-slate-200 pb-2">
              <button
                type="button"
                onClick={() => setInputType('upload')}
                className={`flex items-center gap-2 text-sm font-medium pb-2 border-b-2 transition-colors ${
                  inputType === 'upload' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <Upload className="w-4 h-4" />
                Upload Photo
              </button>
              <button
                type="button"
                onClick={() => setInputType('url')}
                className={`flex items-center gap-2 text-sm font-medium pb-2 border-b-2 transition-colors ${
                  inputType === 'url' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <LinkIcon className="w-4 h-4" />
                Use URL
              </button>
            </div>

            {inputType === 'upload' ? (
              <div>
                <input 
                  id="file-upload"
                  type="file" 
                  accept="image/*" 
                  required={inputType === 'upload'}
                  onChange={e => setFile(e.target.files?.[0] || null)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            ) : (
              <div>
                <input 
                  type="text" 
                  required={inputType === 'url'}
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)} 
                  placeholder="https://example.com/image.jpg"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            )}
          </div>

          <div className="col-span-1 md:col-span-2 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nom (Name)</label>
                <input 
                  type="text" 
                  required 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  placeholder="Ex. Hexagonal Flat"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Marque (Brand)</label>
                <select 
                  value={isCustomBrand ? '__custom__' : brand} 
                  onChange={e => {
                    if (e.target.value === '__custom__') {
                      setIsCustomBrand(true);
                    } else {
                      setIsCustomBrand(false);
                      setBrand(e.target.value);
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 mb-1"
                >
                  {brands.map(b => (
                    <option key={b.id} value={b.name}>{b.name}</option>
                  ))}
                  <option value="__custom__">+ Saisir une autre marque...</option>
                </select>
                {isCustomBrand && (
                  <input 
                    type="text" 
                    required 
                    value={customBrandName} 
                    onChange={e => setCustomBrandName(e.target.value)} 
                    placeholder="Nom de la nouvelle marque"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 mt-1"
                  />
                )}
              </div>
            </div>

            {/* Sexe (Genre) and Tranche d'âge (Age Group) Selection */}
            <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50/80 rounded-xl border border-slate-200">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                  Sexe (Genre)
                </label>
                <select 
                  value={gender} 
                  onChange={e => setGender(e.target.value as Gender)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="Men">Homme (Men)</option>
                  <option value="Women">Femme (Women)</option>
                  <option value="Unisex">Unisexe (Unisex)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                  <Baby className="w-3.5 h-3.5 text-amber-600" />
                  Tranche d'âge (Age)
                </label>
                <select 
                  value={ageGroup} 
                  onChange={e => setAgeGroup(e.target.value as AgeGroup)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="Adult">Adulte (Adult)</option>
                  <option value="Kid">Enfant (Kid)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Prix (DA)</label>
                <input 
                  type="number" 
                  required 
                  value={price} 
                  onChange={e => setPrice(e.target.value)} 
                  placeholder="14500"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Stock Initial (Qty)</label>
                <input 
                  type="number" 
                  min="0"
                  required 
                  value={stockQuantity} 
                  onChange={e => setStockQuantity(e.target.value)} 
                  placeholder="10"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Seuil Alerte</label>
                <input 
                  type="number" 
                  min="1"
                  value={lowStockThreshold} 
                  onChange={e => setLowStockThreshold(e.target.value)} 
                  placeholder="3"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Réf / SKU</label>
                <input 
                  type="text" 
                  value={sku} 
                  onChange={e => setSku(e.target.value)} 
                  placeholder="OPT-100"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Forme</label>
                <select 
                  value={shape} 
                  onChange={e => setShape(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="Square">Square</option>
                  <option value="Round">Round</option>
                  <option value="Aviator">Aviator</option>
                  <option value="Cat Eye">Cat Eye</option>
                </select>
              </div>
            </div>
          </div>

          <div className="col-span-1 md:col-span-4 mt-2 flex items-center justify-between">
            <span className="text-sm text-blue-600 font-medium">{uploadProgress}</span>
            <button 
              type="submit" 
              disabled={submitting || (inputType === 'upload' && !file) || (inputType === 'url' && !imageUrl)}
              className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 ml-auto"
            >
              <Plus className="w-4 h-4" />
              {submitting ? 'Enregistrement...' : 'Enregistrer le produit'}
            </button>
          </div>
        </form>
      </div>

      {/* Frame list table & Stock Management Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Search & Filter Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom, marque ou code SKU..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter Sexe */}
            <select
              value={filterGender}
              onChange={e => setFilterGender(e.target.value as any)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="all">Tous les sexes</option>
              <option value="Men">Homme</option>
              <option value="Women">Femme</option>
              <option value="Unisex">Unisexe</option>
            </select>

            {/* Filter Tranche d'âge */}
            <select
              value={filterAgeGroup}
              onChange={e => setFilterAgeGroup(e.target.value as any)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="all">Toutes tranches d'âge</option>
              <option value="Adult">Adulte</option>
              <option value="Kid">Enfant</option>
            </select>

            <select
              value={filterStockStatus}
              onChange={e => setFilterStockStatus(e.target.value as any)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="all">Tous les stocks</option>
              <option value="in_stock">En stock</option>
              <option value="low_stock">Stock faible</option>
              <option value="out_of_stock">Ruptures</option>
            </select>

            <select
              value={filterBrand}
              onChange={e => setFilterBrand(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="all">Toutes les marques</option>
              {brands.map(b => (
                <option key={b.id} value={b.name}>{b.name}</option>
              ))}
            </select>

            {(searchQuery || filterStockStatus !== 'all' || filterBrand !== 'all' || filterGender !== 'all' || filterAgeGroup !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterStockStatus('all');
                  setFilterBrand('all');
                  setFilterGender('all');
                  setFilterAgeGroup('all');
                }}
                className="text-xs text-rose-600 hover:text-rose-700 font-medium px-2 py-1"
              >
                Réinitialiser
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3.5">Produit</th>
                <th className="px-4 py-3.5">Public & Tranche d'âge</th>
                <th className="px-4 py-3.5">Réf / Marque</th>
                <th className="px-4 py-3.5">Prix</th>
                <th className="px-4 py-3.5 text-center">Quantité (Qty)</th>
                <th className="px-4 py-3.5 text-center">Disponibilité</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredFrames.map(frame => {
                const qty = frame.stockQuantity !== undefined ? frame.stockQuantity : 10;
                const th = frame.lowStockThreshold || 3;
                const isOutOfStock = qty === 0 || frame.inStock === false;
                const isLowStock = qty > 0 && qty <= th && frame.inStock !== false;
                const isUpdating = updatingStockId === frame.id;

                const genderLabel = 
                  frame.gender === 'Men' ? 'Homme' : 
                  frame.gender === 'Women' ? 'Femme' : 'Unisexe';
                const ageLabel = frame.ageGroup === 'Kid' ? 'Enfant' : 'Adulte';

                return (
                  <tr key={frame.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Image & Name */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-12 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 shrink-0">
                          <img src={frame.image} alt={frame.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{frame.name}</div>
                          <div className="text-xs text-slate-400 capitalize">{frame.shape || 'Square'}</div>
                        </div>
                      </div>
                    </td>

                    {/* Sexe & Tranche d'âge Tags */}
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col gap-1 items-start">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                          frame.gender === 'Men' ? 'bg-sky-50 text-sky-800 border border-sky-200' :
                          frame.gender === 'Women' ? 'bg-pink-50 text-pink-800 border border-pink-200' :
                          'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          <UserCheck className="w-3 h-3" />
                          {genderLabel}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                          frame.ageGroup === 'Kid' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                          'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}>
                          <Baby className="w-3 h-3" />
                          {ageLabel}
                        </span>
                      </div>
                    </td>

                    {/* Brand & SKU */}
                    <td className="px-4 py-3.5">
                      <div className="space-y-1">
                        <span className="inline-block bg-slate-100 px-2 py-0.5 rounded text-xs font-semibold text-slate-700">
                          {frame.brand || 'Sans marque'}
                        </span>
                        {frame.sku && (
                          <div className="text-[11px] font-mono text-slate-400">
                            {frame.sku}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Price */}
                    <td className="px-4 py-3.5 text-slate-900 font-semibold whitespace-nowrap">
                      {frame.price.toLocaleString()} DA
                    </td>

                    {/* Stock Qty & Quick Increment / Decrement */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          disabled={qty === 0 || isUpdating}
                          onClick={() => adjustStockQuick(frame, -1)}
                          title="Diminuer le stock (-1)"
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>

                        <div className={`min-w-12 text-center font-bold px-2 py-1 rounded-lg text-sm ${
                          isOutOfStock ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                          isLowStock ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                          'bg-slate-100 text-slate-800'
                        }`}>
                          {qty}
                        </div>

                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => adjustStockQuick(frame, +1)}
                          title="Augmenter le stock (+1)"
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors disabled:opacity-30"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* Status Badge & Toggle */}
                    <td className="px-4 py-3.5 text-center">
                      <button
                        type="button"
                        onClick={() => toggleInStock(frame)}
                        title="Cliquer pour activer/désactiver la vente"
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-transform active:scale-95 ${
                          isOutOfStock 
                            ? 'bg-rose-100 text-rose-800 hover:bg-rose-200' 
                            : isLowStock
                            ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                            : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          isOutOfStock ? 'bg-rose-600' : isLowStock ? 'bg-amber-600' : 'bg-emerald-600'
                        }`} />
                        {isOutOfStock ? 'Épuisé' : isLowStock ? `Stock faible (${qty})` : 'En stock'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => startEdit(frame)}
                          className="text-blue-600 hover:text-blue-800 transition-colors p-2 hover:bg-blue-50 rounded-lg"
                          title="Modifier l'article, sexe, âge et stock"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(frame.id)}
                          className="text-red-500 hover:text-red-700 transition-colors p-2 hover:bg-red-50 rounded-lg"
                          title="Supprimer cet article"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredFrames.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <Package className="w-8 h-8 text-slate-300 mb-2" />
                      <p className="font-medium text-slate-700">Aucun produit trouvé</p>
                      <p className="text-xs text-slate-400 mt-0.5">Essayez de modifier vos filtres (sexe, tranche d'âge, marque ou recherche).</p>
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
