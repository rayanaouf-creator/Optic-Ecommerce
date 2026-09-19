const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminOrders.tsx', 'utf8');

code = code.replace(
  /                  \{order.needsCorrectingLenses && \(\n                    <div className="text-xs text-blue-600 mt-1 bg-blue-50 inline-block px-2 py-0.5 rounded">\n                      Lenses: L\(\{order.leftEye \|\| 'N\/A'\}\) R\(\{order.rightEye \|\| 'N\/A'\}\)\n                    <\/div>\n                  \)\}/,
  `                  {order.needsCorrectingLenses && (
                    <div className="text-xs text-blue-700 mt-2 bg-blue-50/80 rounded-md border border-blue-100 overflow-hidden inline-block">
                      <div className="px-2 py-1 bg-blue-100/50 border-b border-blue-100 font-medium">Prescription</div>
                      <div className="p-2 space-y-1">
                        {order.leftEye || order.rightEye ? (
                          <div>L({order.leftEye || 'N/A'}) R({order.rightEye || 'N/A'})</div>
                        ) : (
                          <>
                            <div><span className="font-medium text-slate-500">L:</span> SPH {order.leftSph || '-'} | CYL {order.leftCyl || '-'}</div>
                            <div><span className="font-medium text-slate-500">R:</span> SPH {order.rightSph || '-'} | CYL {order.rightCyl || '-'}</div>
                          </>
                        )}
                      </div>
                    </div>
                  )}`
);

fs.writeFileSync('src/components/admin/AdminOrders.tsx', code);
