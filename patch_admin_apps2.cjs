const fs = require('fs');
let content = fs.readFileSync('src/admin/pages/AdminApplications.tsx', 'utf8');

// Also add CRHS ID in the view of selectedApp
const replaceText = `
                        <div className="p-4 flex flex-col">
                          <span className="text-slate-500 text-sm mb-1">First Name</span>
`;

const crhsIdView = `
                        {selectedApp.crhsId && (
                           <div className="p-4 flex flex-col bg-emerald-50 border-b border-emerald-100">
                             <span className="text-emerald-700 text-sm mb-1 font-bold">Generated CRHS ID</span>
                             <span className="font-black text-emerald-900 text-lg">{selectedApp.crhsId}</span>
                           </div>
                        )}
                        <div className="p-4 flex flex-col">
                          <span className="text-slate-500 text-sm mb-1">First Name</span>
`;

content = content.replace(replaceText, crhsIdView);
fs.writeFileSync('src/admin/pages/AdminApplications.tsx', content);
