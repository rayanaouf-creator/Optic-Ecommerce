import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Story } from '../types';

export function StoriesBar() {
  const [stories, setStories] = useState<Story[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'stories'), (snapshot) => {
      const storiesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Story));
      setStories(storiesData);
    }, (error) => {
      console.error('Error fetching stories:', error);
    });

    return () => unsubscribe();
  }, []);

  if (stories.length === 0) return null;

  return (
    <div className="w-full bg-slate-50 border-b border-slate-200/50 pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-6">
        <div>
          <h2 className="text-xs font-semibold text-slate-400 tracking-[0.2em] uppercase">Sold</h2>
        </div>
      </div>
      <div className="w-full overflow-x-auto hide-scrollbar pb-2">
        <div className="flex gap-4 sm:gap-6 px-4 sm:px-6 max-w-7xl mx-auto">
          {stories.map(story => (
            <button key={story.id} className="flex flex-col items-center gap-2 shrink-0 group">
              {/* The outer ring */}
              <div className="p-[2px] rounded-full transition-transform group-hover:scale-105 bg-slate-900">
                {/* The inner gap */}
                <div className="bg-slate-50 p-[2px] rounded-full relative">
                  {/* The image */}
                  <img 
                    src={story.image} 
                    alt={story.title} 
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover bg-slate-100"
                  />
                </div>
              </div>
              <div className="flex flex-col items-center mt-1">
                <div className="flex items-center gap-1.5 text-xs sm:text-sm">
                  <span className="text-slate-400 line-through">${story.oldPrice}</span>
                  <span className="text-red-600 font-bold">${story.newPrice}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
