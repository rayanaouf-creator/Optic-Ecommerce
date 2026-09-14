const fs = require('fs');
let code = fs.readFileSync('src/components/Header.tsx', 'utf8');

code = code.replace(
  /import { useCart } from '\.\.\/CartContext';\n/,
  ''
);

code = code.replace(
  /const { cartCount, setIsCartOpen } = useCart\(\);\n/,
  ''
);

code = code.replace(
  /        <button[\s\S]*?<\/button>/,
  ''
);

fs.writeFileSync('src/components/Header.tsx', code);
