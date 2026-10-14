const fs = require('fs');
let content = fs.readFileSync('src/admin/pages/AdminLayout.tsx', 'utf8');

if (!content.includes('AlertsBanner')) {
  content = content.replace("import { cn } from '@/lib/utils';", "import { cn } from '@/lib/utils';\nimport { AlertsBanner } from '@/common/components/AlertsBanner';");
  content = content.replace("<Outlet />", "<AlertsBanner userData={userData} />\n              <Outlet />");
  fs.writeFileSync('src/admin/pages/AdminLayout.tsx', content);
}
