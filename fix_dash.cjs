const fs = require('fs');
const path = 'src/admin/pages/AdminDashboard.tsx';
let content = fs.readFileSync(path, 'utf8');

// There are rogue </motion.div> after <Card>s that were NOT wrapped in motion.div because my regex matched all <Card ...
// Let's remove ALL stray </motion.div>s and just wrap the whole Right and Left columns.
// First, let's restore AdminDashboard to its clean state from earlier and apply motion correctly.
