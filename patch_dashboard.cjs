const fs = require('fs');
let content = fs.readFileSync('src/common/pages/Dashboard.tsx', 'utf8');

content = content.replace("case '__kx_0x3': return { label: 'Teacher', bg: 'bg-amber-100', text: 'text-amber-800' };", "case '__kx_0x3': return { label: 'Teacher', bg: 'bg-amber-100', text: 'text-amber-800' };\n      case '__kx_0x5': return { label: 'Parent / Guardian', bg: 'bg-purple-100', text: 'text-purple-800' };");

fs.writeFileSync('src/common/pages/Dashboard.tsx', content);

let appContent = fs.readFileSync('src/App.tsx', 'utf8');
appContent = appContent.replace("allowedRoles={['__kx_0x4', '__kx_0x3', '__kx_0x2', '__kx_0x1']}", "allowedRoles={['__kx_0x5', '__kx_0x4', '__kx_0x3', '__kx_0x2', '__kx_0x1']}");
fs.writeFileSync('src/App.tsx', appContent);
