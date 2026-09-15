const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminBrands.tsx', 'utf8');

code = code.replace(
  /<table className="w-full text-left border-collapse">/,
  '<div className="overflow-x-auto">\n        <table className="w-full text-left border-collapse">'
);

code = code.replace(
  /        <\/table>\n      <\/div>\n    <\/div>/,
  '        </table>\n        </div>\n      </div>\n    </div>'
);

fs.writeFileSync('src/components/admin/AdminBrands.tsx', code);
