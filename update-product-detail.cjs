const fs = require('fs');
let code = fs.readFileSync('src/components/ProductDetail.tsx', 'utf8');

code = code.replace(
  /import { useParams, useNavigate, Link } from 'react-router-dom';/,
  "import { useParams, useNavigate } from 'react-router-dom';\nimport { OrderModal } from './OrderModal';"
);

code = code.replace(
  /  const \[loading, setLoading\] = useState\(true\);/,
  "  const [loading, setLoading] = useState(true);\n  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);"
);

code = code.replace(
  /<Link[\s\S]*?Configure & Order Now[\s\S]*?<\/Link>/,
  `<button 
              onClick={() => setIsOrderModalOpen(true)}
              className="w-full bg-slate-900 text-white py-4 rounded-xl font-medium hover:bg-slate-800 transition-colors text-center"
            >
              Order Now
            </button>`
);

code = code.replace(
  /    <\/div>\n  \);\n}/,
  `      {frame && (
        <OrderModal 
          isOpen={isOrderModalOpen} 
          onClose={() => setIsOrderModalOpen(false)} 
          frame={frame} 
        />
      )}
    </div>
  );
}`
);

fs.writeFileSync('src/components/ProductDetail.tsx', code);
