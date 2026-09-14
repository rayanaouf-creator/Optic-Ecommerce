const fs = require('fs');
let code = fs.readFileSync('src/components/StoriesBar.tsx', 'utf8');

code = code.replace(
  /import { Story } from '\.\.\/types';/,
  "import { Story } from '../types';\nimport { StoryViewer } from './StoryViewer';\nimport { AnimatePresence, motion } from 'motion/react';"
);

code = code.replace(
  /const \[stories, setStories\] = useState<Story\[\]>\(\[\]\);/,
  "const [stories, setStories] = useState<Story[]>([]);\n  const [activeIndex, setActiveIndex] = useState<number | null>(null);"
);

code = code.replace(
  /<button key={story.id} className="flex flex-col items-center gap-2 shrink-0 group">/,
  "<button key={story.id} onClick={() => setActiveIndex(stories.findIndex(s => s.id === story.id))} className=\"flex flex-col items-center gap-2 shrink-0 group\">"
);

code = code.replace(
  /    <\/div>\n  \);\n}/,
  `    </div>\n\n      <AnimatePresence>
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
      </AnimatePresence>\n    </div>\n  );\n}`
);

fs.writeFileSync('src/components/StoriesBar.tsx', code);
