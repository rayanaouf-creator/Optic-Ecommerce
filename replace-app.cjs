const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /import { CartProvider, useCart } from '\.\/CartContext';\n/,
  ''
);

code = code.replace(
  /import { CartSidebar } from '\.\/components\/CartSidebar';\n/,
  ''
);

code = code.replace(
  /  const { isCartOpen, setIsCartOpen, cartItems, removeFromCart } = useCart\(\);\n/,
  ''
);

code = code.replace(
  /      <CartSidebar[\s\S]*?\/>/,
  ''
);

code = code.replace(
  /<CartProvider>\n/,
  ''
);

code = code.replace(
  /    <\/CartProvider>\n/,
  ''
);

fs.writeFileSync('src/App.tsx', code);
