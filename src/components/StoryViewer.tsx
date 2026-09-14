import { useEffect, useState } from 'react';
import { Story } from '../types';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface StoryViewerProps {
  stories: Story[];
  initialIndex: number;
  onClose: () => void;
}

export function StoryViewer({ stories, initialIndex, onClose }: StoryViewerProps) {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          handleNext();
          return 100;
        }
        return p + 2; // 50 steps * 100ms = 5s
      });
    }, 100);
    return () => clearInterval(interval);
  }, [activeIndex]);

  const handleNext = () => {
    if (activeIndex < stories.length - 1) {
      setActiveIndex(activeIndex + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (activeIndex > 0) {
      setActiveIndex(activeIndex - 1);
    }
  };

  const currentStory = stories[activeIndex];

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      {/* Progress Bars */}
      <div className="absolute top-0 left-0 right-0 z-10 flex gap-1 p-4">
        {stories.map((s, i) => (
          <div key={s.id} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white transition-all duration-100 ease-linear"
              style={{ 
                width: i === activeIndex ? `${progress}%` : i < activeIndex ? '100%' : '0%' 
              }}
            />
          </div>
        ))}
      </div>

      {/* Header Info */}
      <div className="absolute top-8 left-4 right-4 z-10 flex justify-between items-center text-white">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full border border-white/20 overflow-hidden">
             <img src={currentStory.image} alt="Avatar" className="w-full h-full object-cover" />
          </div>
          <span className="font-medium text-sm">Sold Items</span>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Navigation Areas */}
      <div className="absolute inset-0 z-0 flex">
        <div className="w-1/3 h-full cursor-pointer" onClick={handlePrev} />
        <div className="w-2/3 h-full cursor-pointer" onClick={handleNext} />
      </div>

      {/* Content */}
      <div className="relative w-full h-full max-w-md mx-auto flex flex-col items-center justify-center">
        <img 
          src={currentStory.image} 
          alt={currentStory.title || "Story"} 
          className="w-full h-auto max-h-[80vh] object-cover"
        />
        
        {/* Price Tag Overlay */}
        <div className="absolute bottom-12 bg-white/90 backdrop-blur-md px-6 py-3 rounded-2xl flex flex-col items-center">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Sold Out</span>
          <div className="flex items-center gap-3">
            <span className="text-slate-400 line-through font-medium">${currentStory.oldPrice}</span>
            <span className="text-red-600 font-bold text-xl">${currentStory.newPrice}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
