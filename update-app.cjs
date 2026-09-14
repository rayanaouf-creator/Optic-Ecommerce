const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /import { Configurator } from '\.\/components\/Configurator';\n/,
  ''
);

code = code.replace(
  /            <Route path="configurator\/:id" element={\n              <div className="animate-in fade-in slide-in-from-right-8 duration-500">\n                <Configurator \/>\n              <\/div>\n            } \/>\n/,
  ''
);

fs.writeFileSync('src/App.tsx', code);
