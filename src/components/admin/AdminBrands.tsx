import React from "react";
import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Brand } from '../../types';
import { Trash2, Plus, Upload, Link as LinkIcon } from 'lucide-react';
import { compressImage } from '../../lib/imageUtils';

export function AdminBrands() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [inputType, setInputType] = useState<'upload' | 'url'>('upload');
  const [imageUrl, setImageUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  useEffect(() => {
    fetchBrands();
  }, []);

  async function fetchBrands() {
    try {
      const querySnapshot = await getDocs(collection(db, 'brands'));
      const brandsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Brand));
      setBrands(brandsData);
    } catch (error) {
      console.error('Error fetching brands:', error);
    } finally {
      setLoading(false);
    }
  }

  const uploadToServer = async (file: File): Promise<string> => {
    return compressImage(file, 600, 0.8);
  };

  async function handleAddBrand(e: React.FormEvent) {
    e.preventDefault();
    if ((inputType === 'upload' && !file) || (inputType === 'url' && !imageUrl)) return;
    if (!name) return;
    
    setSubmitting(true);
    try {
      setUploadProgress('Processing image...');
      let finalImageUrl = imageUrl;
      
      if (inputType === 'upload' && file) {
        finalImageUrl = await uploadToServer(file);
      }

      setUploadProgress('Saving record...');
      const newBrand = {
        name,
        image: finalImageUrl,
      };
      
      const docRef = await addDoc(collection(db, 'brands'), newBrand);
      setBrands([...brands, { id: docRef.id, ...newBrand }]);
      
      // Reset form
      setFile(null);
      setImageUrl('');
      setName('');
      setUploadProgress('');
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (error) {
      console.error('Error adding brand:', error);
      alert('Failed to save image. It might be too large even after compression.');
      setUploadProgress('');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Are you sure you want to delete this brand?')) return;
    
    try {
      await deleteDoc(doc(db, 'brands', id));
      setBrands(brands.filter(b => b.id !== id));
    } catch (error) {
      console.error('Error deleting brand:', error);
    }
  }

  if (loading) {
    return <div className="text-slate-500">Loading brands...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-900">Add New Featured Brand</h2>
        </div>

        <form onSubmit={handleAddBrand} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
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
                <p className="text-xs text-slate-500 mt-1">Image will be uploaded to UploadThing and saved.</p>
              </div>
            ) : (
              <div>
                <input 
                  type="text" 
                  required={inputType === 'url'}
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  placeholder="https://example.com/logo.jpg or /assets/logo.jpg"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            )}
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Brand Name</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Ray-Ban"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div className="col-span-1 md:col-span-4 mt-2 flex items-center justify-between">
            <span className="text-sm text-blue-600 font-medium">{uploadProgress}</span>
            <button 
              type="submit" 
              disabled={submitting || (inputType === 'upload' && !file) || (inputType === 'url' && !imageUrl)}
              className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 ml-auto"
            >
              <Plus className="w-4 h-4" />
              {submitting ? 'Saving...' : 'Save Brand'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-sm font-medium text-slate-500">
              <th className="px-6 py-4 font-medium">Image</th>
              <th className="px-6 py-4 font-medium">Name</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {brands.map(brand => (
              <tr key={brand.id} className="hover:bg-slate-50/50">
                <td className="px-6 py-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-200">
                    <img src={brand.image} alt={brand.name} className="w-full h-full object-cover" />
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-900 font-medium">
                  {brand.name}
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => handleDelete(brand.id)}
                    className="text-red-500 hover:text-red-700 transition-colors p-2"
                    title="Delete brand"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {brands.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                  No brands found. Add one above.
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
