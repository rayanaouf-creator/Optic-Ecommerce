import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { initAuth, googleSignIn, getAccessToken, logout } from '../../lib/auth';
import { Story } from '../../types';
import { Trash2, Plus, LogIn, LogOut, Upload } from 'lucide-react';

export function AdminStories() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  // Auth state
  const [needsAuth, setNeedsAuth] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Form state
  const [file, setFile] = useState<File | null>(null);
  const [oldPrice, setOldPrice] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  useEffect(() => {
    fetchStories();
    
    // Initialize auth
    const unsubscribe = initAuth(
      () => setNeedsAuth(false),
      () => setNeedsAuth(true)
    );

    return () => unsubscribe();
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

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      await googleSignIn();
      setNeedsAuth(false);
    } catch (err) {
      console.error('Login failed:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };
  
  const handleLogout = async () => {
    await logout();
    setNeedsAuth(true);
  };

  const uploadToDrive = async (fileToUpload: File): Promise<string> => {
    const token = await getAccessToken();
    if (!token) throw new Error("Not authenticated");

    setUploadProgress('Uploading to Google Drive...');

    const metadata = {
      name: fileToUpload.name,
      mimeType: fileToUpload.type,
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', fileToUpload);

    const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: form
    });

    const data = await res.json();
    if (data.error) throw new Error(data.error.message);

    const fileId = data.id;

    setUploadProgress('Making file public...');
    await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        role: 'reader',
        type: 'anyone'
      })
    });

    setUploadProgress('Finalizing...');
    const metaRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?fields=thumbnailLink,webContentLink`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const metaData = await metaRes.json();
    if (metaData.thumbnailLink) {
      return metaData.thumbnailLink.replace(/=s\d+/, '=s800');
    }
    return metaData.webContentLink;
  };

  async function handleAddStory(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !oldPrice || !newPrice) return;
    
    setSubmitting(true);
    try {
      const publicImageUrl = await uploadToDrive(file);

      setUploadProgress('Saving record...');
      const newStory = {
        title: 'Sold', // Hardcoded as per requirements
        image: publicImageUrl,
        oldPrice: Number(oldPrice),
        newPrice: Number(newPrice)
      };
      
      const docRef = await addDoc(collection(db, 'stories'), newStory);
      setStories([...stories, { id: docRef.id, ...newStory }]);
      
      // Reset form
      setFile(null);
      setOldPrice('');
      setNewPrice('');
      setUploadProgress('');
      // reset file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (error) {
      console.error('Error adding story:', error);
      alert('Failed to upload image. Please ensure you have signed in and granted Drive permissions.');
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
          
          {needsAuth ? (
            <button 
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm"
            >
              {isLoggingIn ? 'Signing in...' : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign in to Google Drive
                </>
              )}
            </button>
          ) : (
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign out Drive
            </button>
          )}
        </div>

        {needsAuth ? (
          <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-3" />
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Please sign in with Google Drive to upload photos for sold items.
            </p>
          </div>
        ) : (
          <form onSubmit={handleAddStory} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Photo</label>
              <input 
                id="file-upload"
                type="file" 
                accept="image/*"
                required
                onChange={e => setFile(e.target.files?.[0] || null)}
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
            <div className="col-span-1 md:col-span-4 mt-2 flex items-center justify-between">
              <span className="text-sm text-blue-600 font-medium">{uploadProgress}</span>
              <button 
                type="submit" 
                disabled={submitting || !file}
                className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 ml-auto"
              >
                <Plus className="w-4 h-4" />
                {submitting ? 'Uploading...' : 'Upload & Add'}
              </button>
            </div>
          </form>
        )}
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
