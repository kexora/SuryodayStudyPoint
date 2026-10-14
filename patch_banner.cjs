const fs = require('fs');
let content = fs.readFileSync('src/common/components/AlertsBanner.tsx', 'utf8');

content = content.replace("let isVisible = false;", "let isVisible = false;\n        // Admins see all alerts in their banner\n        if (userRole === '__kx_0x1' || userRole === '__kx_0x2') isVisible = true;");

content = content.replace("<h4 className=\"font-bold text-sm uppercase tracking-wider\">{alert.title}</h4>", "<h4 className=\"font-bold text-sm uppercase tracking-wider\">\n                {alert.title}\n                {(userData?.role === '__kx_0x1' || userData?.role === '__kx_0x2') && (\n                  <span className=\"ml-2 text-[9px] bg-white/50 px-2 py-0.5 rounded-full\">\n                    Target: {alert.targetAudience}\n                  </span>\n                )}\n              </h4>");

fs.writeFileSync('src/common/components/AlertsBanner.tsx', content);
