import React from "react";
import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Story, Brand } from '../../types';
import { Trash2, Plus, Upload, Link as LinkIcon, Edit2, X, Check } from 'lucide-react';
import { compressImage } from '../../lib/imageUtils';

export function AdminStories() {
  const [stories, setStories] = useState<Story[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state for adding
  const [inputType, setInputType] = useState<'upload' | 'url'>('upload');
  const [imageUrl, setImageUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [brand, setBrand] = useState('');
  const [isCustomBrand, setIsCustomBrand] = useState(false);
  const [customBrandName, setCustomBrandName] = useState('');
  const [oldPrice, setOldPrice] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  // Editing state
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editBrand, setEditBrand] = useState('');
  const [editOldPrice, setEditOldPrice] = useState('');
  const [editNewPrice, setEditNewPrice] = useState('');
  const [editInputType, setEditInputType] = useState<'keep' | 'upload' | 'url'>('keep');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);

  useEffect(() => {
    fetchStories();
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

  async function fetchStories() {
    try {
      const querySnapshot = await getDocs(collection(db, 'stories'));
      const storiesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Story));
      setStories(storiesData);
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setLoading(false);
    }
  }

  const uploadToServer = async (file: File): Promise<string> => {
    return compressImage(file, 800, 0.7);
  };

  async function handleAddStory(e: React.FormEvent) {
    e.preventDefault();
    if ((inputType === 'upload' && !file) || (inputType === 'url' && !imageUrl)) return;
    if (!oldPrice || !newPrice) return;
    const finalBrand = isCustomBrand ? customBrandName.trim() : brand.trim();
    
    setSubmitting(true);
    try {
      setUploadProgress('Processing image...');
      let finalImageUrl = imageUrl;
      
      if (inputType === 'upload' && file) {
        finalImageUrl = await uploadToServer(file);
      }

      setUploadProgress('Saving record...');
      const newStory: Omit<Story, 'id'> = {
        title: title.trim() || (finalBrand ? `${finalBrand} Special` : 'Article en solde'),
        brand: finalBrand,
        image: finalImageUrl,
        oldPrice: Number(oldPrice),
        newPrice: Number(newPrice)
      };
      
      const docRef = await addDoc(collection(db, 'stories'), newStory);
      setStories([...stories, { id: docRef.id, ...newStory }]);
      
      // Reset form
      setFile(null);
      setImageUrl('');
      setTitle('');
      setCustomBrandName('');
      setIsCustomBrand(false);
      setOldPrice('');
      setNewPrice('');
      setUploadProgress('');
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (error) {
      console.error('Error adding story:', error);
      alert('Failed to save image. It might be too large even after compression.');
      setUploadProgress('');
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(story: Story) {
    setEditingStory(story);
    setEditTitle(story.title || '');
    setEditBrand(story.brand || '');
    setEditOldPrice(story.oldPrice.toString());
    setEditNewPrice(story.newPrice.toString());
    setEditInputType('keep');
    setEditImageUrl(story.image);
    setEditFile(null);
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingStory) return;
    if (!editOldPrice || !editNewPrice) {
      alert('Veuillez renseigner les prix.');
      return;
    }

    setEditSubmitting(true);
    try {
      let finalImg = editingStory.image;
      if (editInputType === 'upload' && editFile) {
        finalImg = await uploadToServer(editFile);
      } else if (editInputType === 'url' && editImageUrl.trim()) {
        finalImg = editImageUrl.trim();
      }

      const updatedData: Partial<Story> = {
        title: editTitle.trim() || editingStory.title || 'Article en solde',
        brand: editBrand.trim(),
        oldPrice: Number(editOldPrice),
        newPrice: Number(editNewPrice),
        image: finalImg
      };

      await updateDoc(doc(db, 'stories', editingStory.id), updatedData);
      setStories(stories.map(s => s.id === editingStory.id ? { ...s, ...updatedData } : s));
      setEditingStory(null);
    } catch (error) {
      console.error('Error updating story:', error);
      alert('Erreur lors de la modification de l\'article en solde.');
    } finally {
      setEditSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Are you sure you want to delete this sold item?')) return;
    
    try {
      await deleteDoc(doc(db, 'stories', id));
      setStories(stories.filter(s => s.id !== id));
    } catch (error) {
      console.error('Error deleting story:', error);
    }
  }

  if (loading) {
    return <div className="text-slate-500">Loading stories...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Edit Modal */}
      {editingStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Modifier l'article en solde (Edit Sold Item)</h3>
                <p className="text-xs text-slate-500">Mettre à jour les prix, la marque et les visuels</p>
              </div>
              <button 
                onClick={() => setEditingStory(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Titre / Modèle (Title)</label>
                <input 
                  type="text" 
                  value={editTitle} 
                  onChange={e => setEditTitle(e.target.value)} 
                  placeholder="Ex. Aviator Gold Edition"
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
                    <option value="">Sélectionner une marque (facultatif)</option>
                    {brands.map(b => (
                      <option key={b.id} value={b.name}>{b.name}</option>
                    ))}
                    <option value="__custom__">+ Saisir une autre marque...</option>
                  </select>
                  {(!brands.some(b => b.name === editBrand) || editBrand === '') && (
                    <input 
                      type="text" 
                      value={editBrand} 
                      onChange={e => setEditBrand(e.target.value)} 
                      placeholder="Ex. Ray-Ban, Dior, Carrera..."
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Ancien Prix (DA)</label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    step="1"
                    value={editOldPrice} 
                    onChange={e => setEditOldPrice(e.target.value)} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nouveau Prix Solde (DA)</label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    step="1"
                    value={editNewPrice} 
                    onChange={e => setEditNewPrice(e.target.value)} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              {/* Edit Image options */}
              <div className="border border-slate-200 rounded-xl p-3.5 space-y-3 bg-slate-50/50">
                <label className="block text-xs font-semibold text-slate-700">Photo du produit</label>
                <div className="flex items-center gap-4">
                  <img src={editingStory.image} alt={editingStory.title} className="w-14 h-14 object-cover rounded-full border border-slate-200 bg-white" />
                  <div className="flex gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setEditInputType('keep')}
                      className={`px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                        editInputType === 'keep' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      Conserver
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
                  onClick={() => setEditingStory(null)}
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

      {/* Add New Sold Item Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Add New Sold Item (Article en solde)</h2>
            <p className="text-xs text-slate-500">Ajouter une promotion flash ou article soldé avec sa marque</p>
          </div>
        </div>

        <form onSubmit={handleAddStory} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
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
                <p className="text-xs text-slate-500 mt-1">Image will be compressed and saved to database.</p>
              </div>
            ) : (
              <div>
                <input 
                  type="text" 
                  required={inputType === 'url'}
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg or /assets/my-image.jpg"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            )}
          </div>

          <div className="col-span-1 md:col-span-2 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title / Nom</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  placeholder="Ex. Aviator Flash Solde" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Marque (Brand)</label>
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
                      <option value="">Sélectionner une marque</option>
                      {brands.map(b => (
                        <option key={b.id} value={b.name}>{b.name}</option>
                      ))}
                      <option value="__custom__">+ Other / Autre...</option>
                    </select>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <input 
                      type="text" 
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
                <label className="block text-sm font-medium text-slate-700 mb-1">Old Price (DA)</label>
                <input 
                  type="number" 
                  required
                  min="0"
                  step="1"
                  value={oldPrice}
                  onChange={e => setOldPrice(e.target.value)}
                  placeholder="18000"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">New Price (DA)</label>
                <input 
                  type="number" 
                  required
                  min="0"
                  step="1"
                  value={newPrice}
                  onChange={e => setNewPrice(e.target.value)}
                  placeholder="12000"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
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
              {submitting ? 'Saving...' : 'Save Item'}
            </button>
          </div>
        </form>
      </div>

      {/* Sold items list table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-sm font-medium text-slate-500">
              <th className="px-6 py-4 font-medium">Image</th>
              <th className="px-6 py-4 font-medium">Title</th>
              <th className="px-6 py-4 font-medium">Brand</th>
              <th className="px-6 py-4 font-medium">Old Price</th>
              <th className="px-6 py-4 font-medium">New Price</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {stories.map(story => (
              <tr key={story.id} className="hover:bg-slate-50/50">
                <td className="px-6 py-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-200 bg-slate-50">
                    <img src={story.image} alt="Sold item" className="w-full h-full object-cover" />
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-900 font-medium">
                  {story.title}
                </td>
                <td className="px-6 py-4 text-slate-600">
                  {story.brand ? (
                    <span className="inline-block bg-slate-100 px-2 py-0.5 rounded text-xs font-medium">
                      {story.brand}
                    </span>
                  ) : (
                    <span className="text-slate-400 text-xs">—</span>
                  )}
                </td>
                <td className="px-6 py-4 text-slate-500 line-through">{story.oldPrice} DA</td>
                <td className="px-6 py-4 text-emerald-700 font-semibold">{story.newPrice} DA</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button 
                      onClick={() => startEdit(story)}
                      className="text-blue-600 hover:text-blue-800 transition-colors p-2 hover:bg-blue-50 rounded-lg"
                      title="Modifier cet article soldé"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(story.id)}
                      className="text-red-500 hover:text-red-700 transition-colors p-2 hover:bg-red-50 rounded-lg"
                      title="Supprimer cet article"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {stories.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                  No sold items found. Add one above.
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

