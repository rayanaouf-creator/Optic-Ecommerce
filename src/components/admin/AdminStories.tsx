import React from "react";
import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Story } from '../../types';
import { Trash2, Plus, Upload, Link as LinkIcon } from 'lucide-react';
import { compressImage } from '../../lib/imageUtils';

export function AdminStories() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [inputType, setInputType] = useState<'upload' | 'url'>('upload');
  const [imageUrl, setImageUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [oldPrice, setOldPrice] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  useEffect(() => {
    fetchStories();
  }, []);

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
    
    setSubmitting(true);
    try {
      setUploadProgress('Processing image...');
      let finalImageUrl = imageUrl;
      
      if (inputType === 'upload' && file) {
        finalImageUrl = await uploadToServer(file);
      }

      setUploadProgress('Saving record...');
      const newStory = {
        title: 'Sold', // Hardcoded as per requirements
        image: finalImageUrl,
        oldPrice: Number(oldPrice),
        newPrice: Number(newPrice)
      };
      
      const docRef = await addDoc(collection(db, 'stories'), newStory);
      setStories([...stories, { id: docRef.id, ...newStory }]);
      
      // Reset form
      setFile(null);
      setImageUrl('');
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
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-900">Add New Sold Item</h2>
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
                <p className="text-xs text-slate-500 mt-1">Image will be uploaded to UploadThing and saved to database.</p>
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

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Old Price ($)</label>
            <input 
              type="number" 
              required
              min="0"
              step="1"
              value={oldPrice}
              onChange={e => setOldPrice(e.target.value)}
              placeholder="180"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">New Price ($)</label>
            <input 
              type="number" 
              required
              min="0"
              step="1"
              value={newPrice}
              onChange={e => setNewPrice(e.target.value)}
              placeholder="120"
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
              {submitting ? 'Saving...' : 'Save Item'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-sm font-medium text-slate-500">
              <th className="px-6 py-4 font-medium">Image</th>
              <th className="px-6 py-4 font-medium">Title</th>
              <th className="px-6 py-4 font-medium">Old Price</th>
              <th className="px-6 py-4 font-medium">New Price</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {stories.map(story => (
              <tr key={story.id} className="hover:bg-slate-50/50">
                <td className="px-6 py-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-200">
                    <img src={story.image} alt="Sold item" className="w-full h-full object-cover" />
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-900 font-medium">
                  {story.title}
                </td>
                <td className="px-6 py-4 text-slate-500 line-through">${story.oldPrice}</td>
                <td className="px-6 py-4 text-slate-900 font-medium">${story.newPrice}</td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => handleDelete(story.id)}
                    className="text-red-500 hover:text-red-700 transition-colors p-2"
                    title="Delete story"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {stories.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                  No sold items found. Add one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
