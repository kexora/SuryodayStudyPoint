const fs = require('fs');
const path = 'src/admin/pages/AdminDashboard.tsx';
let content = fs.readFileSync(path, 'utf8');

// we have extra </motion.div> tags under the Bar Chart and Recent Apps, let's just remove them.
content = content.replace(/<\/CardContent>\n          <\/Card>\n          <\/motion\.div>/g, "</CardContent>\n          </Card>");

// But we DO want the statCards to have </motion.div>.
// Wait, the stat cards had:
// </CardContent>
//           </Card>
//           </motion.div>
// If I remove them all, the stat cards will be missing their closing tag.
// Let's just restore the file and do it manually.
