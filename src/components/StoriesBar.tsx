import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Story } from '../types';
import { StoryViewer } from './StoryViewer';
import { AnimatePresence, motion } from 'motion/react';

export function StoriesBar() {
  const [stories, setStories] = useState<Story[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

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
    <>
      <div className="w-full bg-slate-50 border-b border-slate-200/50 pt-12 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-6">
          <div>
            <h2 className="text-xs font-semibold text-slate-400 tracking-[0.2em] uppercase">Sold</h2>
          </div>
        </div>
        <div className="w-full overflow-x-auto hide-scrollbar pb-2">
          <div className="flex gap-4 sm:gap-6 px-4 sm:px-6 max-w-7xl mx-auto">
            {stories.map(story => (
              <button key={story.id} onClick={() => setActiveIndex(stories.findIndex(s => s.id === story.id))} className="flex flex-col items-center gap-2 shrink-0 group">
                <div className="p-[2px] rounded-full transition-transform group-hover:scale-105 bg-slate-900">
                  <div className="bg-slate-50 p-[2px] rounded-full relative">
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

      <AnimatePresence>
        {activeIndex !== null && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50"
          >
            <StoryViewer 
              stories={stories} 
              initialIndex={activeIndex} 
              onClose={() => setActiveIndex(null)} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
