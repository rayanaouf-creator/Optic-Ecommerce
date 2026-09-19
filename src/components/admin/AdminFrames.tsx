import React from "react";
import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Frame, Brand } from '../../types';
import { Trash2, Plus, Upload, Link as LinkIcon, Edit2, X, Check } from 'lucide-react';
import { compressImage } from '../../lib/imageUtils';

export function AdminFrames() {
  const [frames, setFrames] = useState<Frame[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state for adding
  const [inputType, setInputType] = useState<'upload' | 'url'>('upload');
  const [imageUrl, setImageUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [isCustomBrand, setIsCustomBrand] = useState(false);
  const [customBrandName, setCustomBrandName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<'Men' | 'Women' | 'Unisex'>('Unisex');
  const [shape, setShape] = useState<'Round' | 'Square' | 'Aviator' | 'Cat Eye'>('Square');
  const [colors, setColors] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  // Editing state
  const [editingFrame, setEditingFrame] = useState<Frame | null>(null);
  const [editName, setEditName] = useState('');
  const [editBrand, setEditBrand] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editCategory, setEditCategory] = useState<'Men' | 'Women' | 'Unisex'>('Unisex');
  const [editShape, setEditShape] = useState<'Round' | 'Square' | 'Aviator' | 'Cat Eye'>('Square');
  const [editColors, setEditColors] = useState('');
  const [editInputType, setEditInputType] = useState<'keep' | 'upload' | 'url'>('keep');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);

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
      const framesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Frame));
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
      setUploadProgress('Processing image...');
      let finalImageUrl = imageUrl;
      
      if (inputType === 'upload' && file) {
        finalImageUrl = await uploadToServer(file);
      }

      setUploadProgress('Saving record...');
      const newFrame: Omit<Frame, 'id'> = {
        name: name.trim(),
        brand: finalBrand,
        price: Number(price),
        image: finalImageUrl,
        category: category || 'Unisex',
        shape: shape || 'Square',
        colors: colors.split(',').map(c => c.trim()).filter(Boolean)
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
      setUploadProgress('');
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (error) {
      console.error('Error adding frame:', error);
      alert('Failed to save frame. Image might be too large even after compression.');
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
    setEditCategory((frame.category as any) || 'Unisex');
    setEditShape((frame.shape as any) || 'Square');
    setEditColors(frame.colors ? frame.colors.join(', ') : '');
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

      const updatedData = {
        name: editName.trim(),
        brand: editBrand.trim(),
        price: Number(editPrice),
        category: editCategory,
        shape: editShape,
        colors: editColors.split(',').map(c => c.trim()).filter(Boolean),
        image: finalImg
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

  async function handleDelete(id: string) {
    if (!window.confirm('Are you sure you want to delete this frame?')) return;
    
    try {
      await deleteDoc(doc(db, 'frames', id));
      setFrames(frames.filter(s => s.id !== id));
    } catch (error) {
      console.error('Error deleting frame:', error);
    }
  }

  if (loading) {
    return <div className="text-slate-500">Loading frames...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Edit Modal */}
      {editingFrame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Modifier l'article (Edit Item)</h3>
                <p className="text-xs text-slate-500">Mettre à jour les informations de la monture</p>
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nom de l'article (Name)</label>
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Prix (DA)</label>
                  <input 
                    type="number" 
                    required 
                    min="0" 
                    step="1" 
                    value={editPrice} 
                    onChange={e => setEditPrice(e.target.value)} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Catégorie</label>
                  <select
                    value={editCategory}
                    onChange={e => setEditCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="Unisex">Unisex</option>
                    <option value="Men">Homme (Men)</option>
                    <option value="Women">Femme (Women)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Forme (Shape)</label>
                  <select
                    value={editShape}
                    onChange={e => setEditShape(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="Square">Square (Carrée)</option>
                    <option value="Round">Round (Ronde)</option>
                    <option value="Aviator">Aviator</option>
                    <option value="Cat Eye">Cat Eye</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Couleurs (séparées par des virgules)</label>
                <input 
                  type="text" 
                  value={editColors} 
                  onChange={e => setEditColors(e.target.value)} 
                  placeholder="Black, Gold, Tortoise"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              {/* Edit Image options */}
              <div className="border border-slate-200 rounded-xl p-3.5 space-y-3 bg-slate-50/50">
                <label className="block text-xs font-semibold text-slate-700">Photo de l'article</label>
                <div className="flex items-center gap-4">
                  <img src={editingFrame.image} alt={editingFrame.name} className="w-16 h-14 object-cover rounded-lg border border-slate-200 bg-white" />
                  <div className="flex gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setEditInputType('keep')}
                      className={`px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                        editInputType === 'keep' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      Conserver actuelle
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditInputType('upload')}
                      className={`px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                        editInputType === 'upload' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      Nouvelle photo
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditInputType('url')}
                      className={`px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                        editInputType === 'url' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      URL
                    </button>
                  </div>
                </div>

                {editInputType === 'upload' && (
                  <input 
                    type="file" 
                    accept="image/*" 
                    required 
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

      {/* Add New Frame Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Add New Frame (Item)</h2>
            <p className="text-xs text-slate-500">Ajouter une nouvelle monture avec sa marque</p>
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
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input 
                  type="text" 
                  required 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  placeholder="e.g. Aviator Classic" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Brand (Marque)</label>
                {!isCustomBrand ? (
                  <div className="space-y-1">
                    <select
                      value={brand}
                      onChange={e => {
                        if (e.target.value === '__custom__') {
                          setIsCustomBrand(true);
                        } else {
                          setBrand(e.target.value);
                        }
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                    >
                      {brands.map(b => (
                        <option key={b.id} value={b.name}>{b.name}</option>
                      ))}
                      <option value="__custom__">+ Other / Autre marque...</option>
                    </select>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <input 
                      type="text" 
                      required 
                      value={customBrandName} 
                      onChange={e => setCustomBrandName(e.target.value)} 
                      placeholder="Type brand name..." 
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                    <button 
                      type="button" 
                      onClick={() => setIsCustomBrand(false)}
                      className="text-[11px] text-slate-500 hover:text-slate-800 underline"
                    >
                      ← Pick from brand list
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Price (DA)</label>
                <input 
                  type="number" 
                  required 
                  min="0" 
                  step="1" 
                  value={price} 
                  onChange={e => setPrice(e.target.value)} 
                  placeholder="18000" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
              <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Colors (comma separated)</label>
                <input 
                  type="text" 
                  value={colors} 
                  onChange={e => setColors(e.target.value)} 
                  placeholder="Black, Tortoise, Gold" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="Unisex">Unisex</option>
                  <option value="Men">Men</option>
                  <option value="Women">Women</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Shape</label>
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
              {submitting ? 'Saving...' : 'Save Frame'}
            </button>
          </div>
        </form>
      </div>

      {/* Frame list table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-sm font-medium text-slate-500">
              <th className="px-6 py-4 font-medium">Image</th>
              <th className="px-6 py-4 font-medium">Name</th>
              <th className="px-6 py-4 font-medium">Brand</th>
              <th className="px-6 py-4 font-medium">Price</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {frames.map(frame => (
              <tr key={frame.id} className="hover:bg-slate-50/50">
                <td className="px-6 py-4">
                  <div className="w-16 h-12 rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                    <img src={frame.image} alt={frame.name} className="w-full h-full object-cover" />
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-900 font-medium">{frame.name}</td>
                <td className="px-6 py-4 text-slate-600">
                  <span className="inline-block bg-slate-100 px-2 py-0.5 rounded text-xs font-medium">
                    {frame.brand || 'No brand'}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-900 font-medium">{frame.price} DA</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button 
                      onClick={() => startEdit(frame)}
                      className="text-blue-600 hover:text-blue-800 transition-colors p-2 hover:bg-blue-50 rounded-lg"
                      title="Modifier cet article (Edit Frame)"
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
            ))}
            {frames.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                  No frames found. Add one above.
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

