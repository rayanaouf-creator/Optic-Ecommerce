import React from "react";
import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Frame } from '../../types';
import { Trash2, Plus, Upload, Link as LinkIcon } from 'lucide-react';
import { compressImage } from '../../lib/imageUtils';

export function AdminFrames() {
  const [frames, setFrames] = useState<Frame[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [inputType, setInputType] = useState<'upload' | 'url'>('upload');
  const [imageUrl, setImageUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [shape, setShape] = useState('');
  const [colors, setColors] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  useEffect(() => {
    fetchFrames();
  }, []);

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
    if (!name || !price || !brand) return;
    
    setSubmitting(true);
    try {
      setUploadProgress('Processing image...');
      let finalImageUrl = imageUrl;
      
      if (inputType === 'upload' && file) {
        finalImageUrl = await uploadToServer(file);
      }

      setUploadProgress('Saving record...');
      const newFrame = {
        name,
        brand,
        price: Number(price),
        image: finalImageUrl,
        category: category || 'Optical',
        shape: shape || 'Square',
        colors: colors.split(',').map(c => c.trim()).filter(Boolean)
      };
      
      const docRef = await addDoc(collection(db, 'frames'), newFrame);
      setFrames([...frames, { id: docRef.id, ...newFrame }]);
      
      // Reset form
      setFile(null);
      setImageUrl('');
      setName('');
      setBrand('');
      setPrice('');
      setCategory('');
      setShape('');
      setColors('');
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
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-900">Add New Frame (Item)</h2>
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
                <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Aviator" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Brand</label>
                <input type="text" required value={brand} onChange={e => setBrand(e.target.value)} placeholder="e.g. Ray-Ban" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"/>
              </div>
            </div>
             <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Price ($)</label>
                <input type="number" required min="0" step="1" value={price} onChange={e => setPrice(e.target.value)} placeholder="180" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"/>
              </div>
              <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Colors (comma separated)</label>
                <input type="text" value={colors} onChange={e => setColors(e.target.value)} placeholder="Black, Tortoise" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"/>
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
                <td className="px-6 py-4 text-slate-500">{frame.brand}</td>
                <td className="px-6 py-4 text-slate-900 font-medium">${frame.price}</td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => handleDelete(frame.id)}
                    className="text-red-500 hover:text-red-700 transition-colors p-2"
                    title="Delete frame"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
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
