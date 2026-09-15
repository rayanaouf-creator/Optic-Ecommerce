const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminLayout.tsx', 'utf8');

code = code.replace(
  /        <div \n          className="fixed inset-0 bg-slate-900\/50 z-40 md:hidden" \n                  \/>/,
  `        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />`
);

code = code.replace(
  /              <Link \n                 key={link.name}\n                to={link.path}/g,
  `              <Link 
                 key={link.name}
                 onClick={() => setIsSidebarOpen(false)}
                to={link.path}`
);

fs.writeFileSync('src/components/admin/AdminLayout.tsx', code);
