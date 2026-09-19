const fs = require('fs');
let code = fs.readFileSync('src/components/OrderModal.tsx', 'utf8');

code = code.replace(
  /interface OrderModalProps \{[\s\S]*?frame: Frame;\n\}/,
  `interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
  };
}`
);

code = code.replace(
  /export function OrderModal\(\{ isOpen, onClose, frame \}: OrderModalProps\) \{/,
  'export function OrderModal({ isOpen, onClose, product }: OrderModalProps) {'
);

code = code.replace(/frame\.id/g, 'product.id');
code = code.replace(/frame\.name/g, 'product.name');
code = code.replace(/frame\.price/g, 'product.price');
code = code.replace(/frame\.image/g, 'product.image');

fs.writeFileSync('src/components/OrderModal.tsx', code);
