import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Story } from '../../types';
import { Trash2, Plus } from 'lucide-react';

export function AdminStories() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [image, setImage] = useState('');
  const [oldPrice, setOldPrice] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  async function handleAddStory(e: React.FormEvent) {
    e.preventDefault();
    if (!image || !oldPrice || !newPrice) return;
    
    setSubmitting(true);
    try {
      const newStory = {
        title: 'Sold', // Hardcoded as per requirements
        image,
        oldPrice: Number(oldPrice),
        newPrice: Number(newPrice)
      };
      
      const docRef = await addDoc(collection(db, 'stories'), newStory);
      setStories([...stories, { id: docRef.id, ...newStory }]);
      
      // Reset form
      setImage('');
      setOldPrice('');
      setNewPrice('');
    } catch (error) {
      console.error('Error adding story:', error);
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
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Add New Sold Item</h2>
        <form onSubmit={handleAddStory} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Image URL</label>
            <input 
              type="url" 
              required
              value={image}
              onChange={e => setImage(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
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
          <div className="col-span-1 md:col-span-4 mt-2">
            <button 
              type="submit" 
              disabled={submitting}
              className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              {submitting ? 'Adding...' : 'Add Sold Item'}
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
