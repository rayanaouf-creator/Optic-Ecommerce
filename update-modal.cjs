const fs = require('fs');
let code = fs.readFileSync('src/components/OrderModal.tsx', 'utf8');

code = code.replace(
  /  const \[needsLenses, setNeedsLenses\] = useState\(false\);/,
  "  const [needsLenses, setNeedsLenses] = useState(false);\n  const [leftEye, setLeftEye] = useState('');\n  const [rightEye, setRightEye] = useState('');"
);

code = code.replace(
  /        needsCorrectingLenses: needsLenses,/,
  "        needsCorrectingLenses: needsLenses,\n        leftEye: needsLenses ? leftEye : null,\n        rightEye: needsLenses ? rightEye : null,"
);

code = code.replace(
  /        setNeedsLenses\(false\);/,
  "        setNeedsLenses(false);\n        setLeftEye('');\n        setRightEye('');"
);

code = code.replace(
  /                    <div className="pt-2">\n                      <label className="flex items-center gap-3 cursor-pointer group">\n                        <div className="relative flex items-center justify-center">\n                          <input \n                            type="checkbox" \n                            checked=\{needsLenses\}\n                            onChange=\{\(e\) => setNeedsLenses\(e.target.checked\)\}\n                            className="peer sr-only"\n                          \/>\n                          <div className="w-6 h-6 rounded-md border-2 border-slate-300 peer-checked:border-slate-900 peer-checked:bg-slate-900 transition-colors group-hover:border-slate-400 peer-checked:group-hover:border-slate-900" \/>\n                          <svg className="absolute w-4 h-4 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth=\{3\}>\n                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" \/>\n                          <\/svg>\n                        <\/div>\n                        <span className="text-sm font-medium text-slate-700">I need correcting lenses<\/span>\n                      <\/label>\n                    <\/div>/,
  `                    <div className="pt-2">
                      <label className="flex items-center gap-3 cursor-pointer group mb-4">
                        <div className="relative flex items-center justify-center">
                          <input 
                            type="checkbox" 
                            checked={needsLenses}
                            onChange={(e) => setNeedsLenses(e.target.checked)}
                            className="peer sr-only"
                          />
                          <div className="w-6 h-6 rounded-md border-2 border-slate-300 peer-checked:border-slate-900 peer-checked:bg-slate-900 transition-colors group-hover:border-slate-400 peer-checked:group-hover:border-slate-900" />
                          <svg className="absolute w-4 h-4 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-sm font-medium text-slate-700">I need correcting lenses</span>
                      </label>
                      
                      {needsLenses && (
                        <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">Left Eye (OS)</label>
                            <input 
                              type="text" 
                              value={leftEye}
                              onChange={e => setLeftEye(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition-shadow"
                              placeholder="e.g. -2.00"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">Right Eye (OD)</label>
                            <input 
                              type="text" 
                              value={rightEye}
                              onChange={e => setRightEye(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition-shadow"
                              placeholder="e.g. -1.75"
                            />
                          </div>
                        </div>
                      )}
                    </div>`
);

fs.writeFileSync('src/components/OrderModal.tsx', code);
