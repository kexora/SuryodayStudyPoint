const fs = require('fs');
let content = fs.readFileSync('src/admin/pages/AdminApplications.tsx', 'utf8');

const approveLogic = `
  const handleStatusChange = async (id: string, newStatus: 'Pending' | 'Approved' | 'Rejected') => {
    try {
      const appRef = doc(db, 'applications', id);
      const updates: any = { status: newStatus };
      
      let generatedCrhsId = '';
      if (newStatus === 'Approved') {
        generatedCrhsId = \`221026\${Math.floor(100000 + Math.random() * 900000)}\`;
        updates.crhsId = generatedCrhsId;
      }
      
      await updateDoc(appRef, updates);
      
      const updatedApps = applications.map(app => 
         app.id === id ? { ...app, ...updates } : app
      );
      setApplications(updatedApps);
      
      if (selectedApp && selectedApp.id === id) {
        setSelectedApp({ ...selectedApp, ...updates });
      }
      
      if (newStatus === 'Approved') {
         alert(\`Application Approved! Generated CRHS ID for student: \${generatedCrhsId}\`);
      }
`;

content = content.replace(/const handleStatusChange = async \([\s\S]*?if \(selectedApp && selectedApp\.id === id\) \{[\s\S]*?setSelectedApp\(\{ \.\.\.selectedApp, status: newStatus \}\);\n      \}\n/, approveLogic);

fs.writeFileSync('src/admin/pages/AdminApplications.tsx', content);
