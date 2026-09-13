const STORIES = [
  { 
    id: 1, 
    title: 'New Arrivals', 
    image: 'https://images.unsplash.com/photo-1559838031-6e1189178347?w=800&q=80', 
    hasSeen: false 
  },
  { 
    id: 2, 
    title: 'Summer \'26', 
    image: 'https://images.unsplash.com/photo-1509695507497-903c140c43b0?w=800&q=80', 
    hasSeen: false 
  },
  { 
    id: 3, 
    title: 'Staff Picks', 
    image: 'https://images.unsplash.com/photo-1522204523234-8729aa6e3d5f?w=800&q=80', 
    hasSeen: false 
  },
  { 
    id: 4, 
    title: 'Bestsellers', 
    image: 'https://images.unsplash.com/photo-1589830500806-0563f69542a2?w=800&q=80', 
    hasSeen: true 
  },
  { 
    id: 5, 
    title: 'Clear Frames', 
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80', 
    hasSeen: true 
  },
  { 
    id: 6, 
    title: 'Vintage', 
    image: 'https://images.unsplash.com/photo-1556306535-0f09a536f01f?w=800&q=80', 
    hasSeen: true 
  },
];

export function StoriesBar() {
  return (
    <div className="w-full overflow-x-auto pt-6 pb-2 hide-scrollbar bg-slate-50 border-b border-slate-200/50">
      <div className="flex gap-4 sm:gap-6 px-4 sm:px-6 max-w-7xl mx-auto">
        {STORIES.map(story => (
          <button key={story.id} className="flex flex-col items-center gap-2 shrink-0 group">
            {/* The outer ring (solid or gradient to mimic insta) */}
            <div className={`p-[2px] rounded-full transition-transform group-hover:scale-105 ${
              story.hasSeen 
                ? 'bg-slate-200' 
                : 'bg-slate-900' // using a solid dark ring to match the prompt's "solid" and store's premium vibe
            }`}>
              {/* The inner gap */}
              <div className="bg-slate-50 p-[2px] rounded-full">
                {/* The image */}
                <img 
                  src={story.image} 
                  alt={story.title} 
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover bg-slate-100"
                />
              </div>
            </div>
            <span className={`text-[11px] sm:text-xs font-medium tracking-wide ${
              story.hasSeen ? 'text-slate-500' : 'text-slate-900'
            }`}>
              {story.title}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
