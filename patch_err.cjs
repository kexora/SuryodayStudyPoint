const fs = require('fs');
let content = fs.readFileSync('src/common/components/AlertsBanner.tsx', 'utf8');
content = content.replace("});\n\n    return () => unsubscribe();", "}, (err) => console.error('Alerts snapshot error:', err));\n\n    return () => unsubscribe();");
fs.writeFileSync('src/common/components/AlertsBanner.tsx', content);
