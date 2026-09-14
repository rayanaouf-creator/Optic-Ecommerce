const fs = require('fs');
let code = fs.readFileSync('src/components/StoriesBar.tsx', 'utf8');

code = code.replace(
  /    <\/div>\n      <AnimatePresence>/,
  '      <AnimatePresence>'
);

fs.writeFileSync('src/components/StoriesBar.tsx', code);
