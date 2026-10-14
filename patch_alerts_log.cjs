const fs = require('fs');
let content = fs.readFileSync('src/common/components/AlertsBanner.tsx', 'utf8');
content = content.replace("setAlerts(activeAlerts);", "console.log('Fetched alerts:', activeAlerts); setAlerts(activeAlerts);");
content = content.replace("const unsubscribe = onSnapshot(q, (snapshot) => {", "const unsubscribe = onSnapshot(q, (snapshot) => { console.log('Snapshot received:', snapshot.size, 'documents');");
content = content.replace("activeAlerts.push({ id: doc.id, ...data });", "console.log('Alert visible for user:', {id: doc.id, audience}); activeAlerts.push({ id: doc.id, ...data });");
fs.writeFileSync('src/common/components/AlertsBanner.tsx', content);
