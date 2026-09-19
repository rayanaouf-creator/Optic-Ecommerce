const fs = require('fs');
let code = fs.readFileSync('src/components/OrderModal.tsx', 'utf8');

code = code.replace(
  /const \[leftEye, setLeftEye\] = useState\(''\);\n  const \[rightEye, setRightEye\] = useState\(''\);/,
  `const [leftSph, setLeftSph] = useState('');
  const [leftCyl, setLeftCyl] = useState('');
  const [rightSph, setRightSph] = useState('');
  const [rightCyl, setRightCyl] = useState('');`
);

code = code.replace(
  /leftEye: needsLenses \? leftEye : null,\n        rightEye: needsLenses \? rightEye : null,/,
  `leftSph: needsLenses ? leftSph : null,
        leftCyl: needsLenses ? leftCyl : null,
        rightSph: needsLenses ? rightSph : null,
        rightCyl: needsLenses ? rightCyl : null,`
);

code = code.replace(
  /setLeftEye\(''\);\n        setRightEye\(''\);/,
  `setLeftSph('');
        setLeftCyl('');
        setRightSph('');
        setRightCyl('');`
);

code = code.replace(
  /\{needsLenses && \(\n                        <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">[\s\S]*?<\/div>\n                      \)\}/,
  `{needsLenses && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                          <div>
                            <span className="block text-xs font-semibold text-slate-900 mb-2">Left Eye (OS)</span>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">SPH</label>
                                <input 
                                  type="text" 
                                  value={leftSph}
                                  onChange={e => setLeftSph(e.target.value)}
                                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                                  placeholder="-2.00"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">CYL</label>
                                <input 
                                  type="text" 
                                  value={leftCyl}
                                  onChange={e => setLeftCyl(e.target.value)}
                                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                                  placeholder="-0.50"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="border-t border-slate-200 pt-4">
                            <span className="block text-xs font-semibold text-slate-900 mb-2">Right Eye (OD)</span>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">SPH</label>
                                <input 
                                  type="text" 
                                  value={rightSph}
                                  onChange={e => setRightSph(e.target.value)}
                                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                                  placeholder="-1.75"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">CYL</label>
                                <input 
                                  type="text" 
                                  value={rightCyl}
                                  onChange={e => setRightCyl(e.target.value)}
                                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                                  placeholder="-0.75"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}`
);

fs.writeFileSync('src/components/OrderModal.tsx', code);
