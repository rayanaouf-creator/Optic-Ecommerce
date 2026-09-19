const fs = require('fs');
let code = fs.readFileSync('src/components/ProductDetail.tsx', 'utf8');

code = code.replace(
  /frame=\{frame\}/,
  'product={frame}'
);

fs.writeFileSync('src/components/ProductDetail.tsx', code);
