const fs = require('fs');
let code = fs.readFileSync('src/components/StoryViewer.tsx', 'utf8');

if (!code.includes("import { OrderModal } from './OrderModal';")) {
  code = code.replace(
    /import \{ X, ChevronLeft, ChevronRight \} from 'lucide-react';/,
    "import { X, ChevronLeft, ChevronRight } from 'lucide-react';\nimport { OrderModal } from './OrderModal';"
  );
}

code = code.replace(
  /  const \[progress, setProgress\] = useState\(0\);/,
  "  const [progress, setProgress] = useState(0);\n  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);"
);

code = code.replace(
  /  useEffect\(\(\) => \{\n    setProgress\(0\);\n    const interval = setInterval/,
  `  useEffect(() => {
    if (isOrderModalOpen) return;
    setProgress(0);
    const interval = setInterval`
);

code = code.replace(
  /  \}, \[activeIndex\]\);/,
  "  }, [activeIndex, isOrderModalOpen]);"
);

code = code.replace(
  /<span className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Sold Out<\/span>\n          <div className="flex items-center gap-3">\n            <span className="text-slate-400 line-through font-medium">\$(\{currentStory.oldPrice\})<\/span>\n            <span className="text-red-600 font-bold text-xl">\$(\{currentStory.newPrice\})<\/span>\n          <\/div>/,
  `<span className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Available Again!</span>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-slate-400 line-through font-medium">\$$1</span>
            <span className="text-red-600 font-bold text-xl">\$$2</span>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); setIsOrderModalOpen(true); }}
            className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-medium text-sm hover:bg-slate-800 transition-colors w-full"
          >
            Order Now
          </button>`
);

code = code.replace(
  /        <\/div>\n      <\/div>\n    <\/div>/,
  `        </div>
      </div>
      {currentStory && (
        <OrderModal 
          isOpen={isOrderModalOpen} 
          onClose={() => setIsOrderModalOpen(false)} 
          product={{
            id: currentStory.id,
            name: currentStory.title,
            price: currentStory.newPrice,
            image: currentStory.image
          }} 
        />
      )}
    </div>`
);

fs.writeFileSync('src/components/StoryViewer.tsx', code);
