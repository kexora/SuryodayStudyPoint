const fs = require('fs');
let content = fs.readFileSync('src/admin/components/AdminAlerts.tsx', 'utf8');

// Add imports
content = content.replace("import { db } from '@/lib/firebase';", "import { db } from '@/lib/firebase';\nimport { connectGmail, sendEmail, getGmailToken } from '@/lib/gmail';\nimport { Mail } from 'lucide-react';");

// Add state for email
content = content.replace("severity: 'info'\n  });", "severity: 'info',\n    sendEmail: false\n  });");
content = content.replace("severity: 'info'\n    });", "severity: 'info',\n      sendEmail: false\n    });");

// Handle Send
const handleSendCode = `
  const handleSend = async () => {
    if (!formData.title || !formData.message) return;
    
    setIsSaving(true);
    try {
      if (formData.sendEmail) {
        // Authenticate with Gmail first if not already
        const token = await getGmailToken();
        if (!token) {
           await connectGmail();
        }
      }

      await addDoc(collection(db, 'alerts'), {
        title: formData.title,
        message: formData.message,
        targetAudience: formData.targetAudience,
        severity: formData.severity,
        createdAt: serverTimestamp()
      });
      
      // If email is requested, send it
      if (formData.sendEmail) {
         // Query users based on audience
         let emails = [];
         const usersSnap = await getDocs(collection(db, 'users'));
         usersSnap.forEach(doc => {
            const data = doc.data();
            if (!data.email) return;
            
            if (formData.targetAudience === 'all') {
               emails.push(data.email);
            } else if (formData.targetAudience === 'students' && data.role === '__kx_0x4') {
               emails.push(data.email);
            } else if (formData.targetAudience === 'teachers' && data.role === '__kx_0x3') {
               emails.push(data.email);
            } else if (formData.targetAudience === 'parents' && data.isParent) {
               emails.push(data.email);
            } else if (formData.targetAudience.startsWith('class_') && String(data.currentClass) === formData.targetAudience.split('_')[1]) {
               emails.push(data.email);
            }
         });
         
         if (emails.length > 0) {
            // Batch emails or BCC them. Gmail API limit applies, but for MVP we send one email BCCing everyone or batch them.
            // Sending individually to avoid exposing emails
            for (const email of emails) {
                try {
                  await sendEmail([email], formData.title, formData.message);
                } catch (emailErr) {
                  console.error("Failed to send to", email, emailErr);
                }
            }
         }
      }

      handleCloseModal();
      await fetchAlerts();
    } catch (err: any) {
      console.error("Error sending alert:", err);
      if (err.message?.includes('popup_closed_by_user')) {
         alert("Gmail connection was cancelled. Alert not sent.");
      } else {
         alert("Failed to send alert or emails.");
      }
    } finally {
      setIsSaving(false);
    }
  };
`;
content = content.replace(/const handleSend = async \(\) => \{[\s\S]*?setIsSaving\(false\);\n    \}\n  \};/, handleSendCode);

// Add toggle to UI
const toggleUI = `
              <div className="space-y-2">
                <label className="text-xs font-bold text-crhs-navy uppercase tracking-wider">Message Content</label>
                <textarea 
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  placeholder="Enter the full notification message here. This will appear instantly on the dashboards of the selected audience."
                  className="w-full min-h-[120px] border-2 border-slate-200 bg-white p-4 text-sm focus:border-red-600 focus:outline-none rounded-none resize-y"
                />
              </div>

              <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-100 mt-4">
                <input 
                   type="checkbox" 
                   id="sendEmail" 
                   checked={formData.sendEmail} 
                   onChange={(e) => setFormData({...formData, sendEmail: e.target.checked})}
                   className="w-4 h-4 text-crhs-navy border-slate-300 rounded focus:ring-crhs-navy"
                />
                <label htmlFor="sendEmail" className="text-sm font-bold text-crhs-navy flex items-center gap-2 cursor-pointer">
                  <Mail className="w-4 h-4" /> Also send this alert via Email to the target audience (Uses Gmail API)
                </label>
              </div>
`;
content = content.replace(/<div className="space-y-2">\s*<label className="text-xs font-bold text-crhs-navy uppercase tracking-wider">Message Content<\/label>\s*<textarea[\s\S]*?<\/div>/, toggleUI);

fs.writeFileSync('src/admin/components/AdminAlerts.tsx', content);
