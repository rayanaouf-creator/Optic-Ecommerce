const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminOrders.tsx', 'utf8');

code = code.replace(
  /<td className="px-6 py-4 text-slate-900 font-medium">\n                  \{order.customerName \|\| 'Guest'\}\n                <\/td>/,
  `<td className="px-6 py-4">
                  <div className="font-medium text-slate-900">{order.customerName || 'Guest'}</div>
                  <div className="text-xs text-slate-500 mt-1">{order.customerPhone}</div>
                  <div className="text-xs text-slate-500 mt-0.5 capitalize">Delivery: {order.deliveryMethod}</div>
                  {order.needsCorrectingLenses && (
                    <div className="text-xs text-blue-600 mt-1 bg-blue-50 inline-block px-2 py-0.5 rounded">
                      Lenses: L({order.leftEye || 'N/A'}) R({order.rightEye || 'N/A'})
                    </div>
                  )}
                </td>`
);

fs.writeFileSync('src/components/admin/AdminOrders.tsx', code);
