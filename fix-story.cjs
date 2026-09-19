const fs = require('fs');
let code = fs.readFileSync('src/components/StoryViewer.tsx', 'utf8');

code = code.replace(
  /<span className="text-slate-400 line-through font-medium">\$1<\/span>/,
  '<span className="text-slate-400 line-through font-medium">${currentStory.oldPrice}</span>'
);

code = code.replace(
  /<span className="text-red-600 font-bold text-xl">\$2<\/span>/,
  '<span className="text-red-600 font-bold text-xl">${currentStory.newPrice}</span>'
);

fs.writeFileSync('src/components/StoryViewer.tsx', code);
