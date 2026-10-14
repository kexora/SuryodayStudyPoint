const fs = require('fs');
let content = fs.readFileSync('src/admin/pages/AdminUserManagement.tsx', 'utf8');

content = content.replace(
  /'__kx_0x4': 'Student\/Parent'/g,
  "'__kx_0x4': 'Student',\n  '__kx_0x5': 'Parent'"
);

content = content.replace(
  /'__kx_0x4': <GraduationCap className="w-4 h-4 text-emerald-500" \/>/g,
  "'__kx_0x4': <GraduationCap className=\"w-4 h-4 text-emerald-500\" />,\n  '__kx_0x5': <Users className=\"w-4 h-4 text-purple-500\" />"
);

content = content.replace(
  /\['All', '__kx_0x1', '__kx_0x2', '__kx_0x3', '__kx_0x4'\]/g,
  "['All', '__kx_0x1', '__kx_0x2', '__kx_0x3', '__kx_0x4', '__kx_0x5']"
);

content = content.replace(
  /\{ label: "Student \/ Parent", value: "__kx_0x4" \},/g,
  "{ label: \"Student\", value: \"__kx_0x4\" },\n                      { label: \"Parent\", value: \"__kx_0x5\" },"
);

fs.writeFileSync('src/admin/pages/AdminUserManagement.tsx', content);
