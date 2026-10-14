const fs = require('fs');
let content = fs.readFileSync('src/admin/components/AdminLetters.tsx', 'utf8');

content = content.replace("import { schoolConfig } from '@/config/schoolConfig';", "import { schoolConfig } from '@/config/schoolConfig';\nimport { connectGmail, sendEmail, getGmailToken } from '@/lib/gmail';\nimport { Mail } from 'lucide-react';");

content = content.replace("content: ''\n  });", "content: '',\n    recipientEmail: '',\n    sendEmail: false\n  });");
content = content.replace("content: letter.content || ''\n      });", "content: letter.content || '',\n        recipientEmail: letter.recipientEmail || '',\n        sendEmail: false\n      });");
content = content.replace("content: ''\n      });", "content: '',\n        recipientEmail: '',\n        sendEmail: false\n      });");

const handleSaveCode = `
  const handleSave = async () => {
    if (!formData.title || !formData.recipientName || !formData.content) return;
    
    setIsSaving(true);
    try {
      if (formData.sendEmail && formData.recipientEmail) {
        // Authenticate with Gmail first if not already
        const token = await getGmailToken();
        if (!token) {
           await connectGmail();
        }
      }

      if (editingId) {
        const docRef = doc(db, 'letters', editingId);
        await updateDoc(docRef, {
          title: formData.title,
          recipientName: formData.recipientName,
          recipientRole: formData.recipientRole,
          type: formData.type,
          content: formData.content,
          recipientEmail: formData.recipientEmail,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, 'letters'), {
          title: formData.title,
          recipientName: formData.recipientName,
          recipientRole: formData.recipientRole,
          type: formData.type,
          content: formData.content,
          recipientEmail: formData.recipientEmail,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      
      if (formData.sendEmail && formData.recipientEmail) {
         try {
             const emailContent = \`
               <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                 <div style="text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 20px; margin-bottom: 20px;">
                    <h1 style="color: #0f172a; margin: 0;">\${schoolConfig.schoolName}</h1>
                    <p style="color: #64748b; margin: 5px 0;">\${schoolConfig.location.fullAddress}</p>
                 </div>
                 <p><strong>Date:</strong> \${new Date().toLocaleDateString()}</p>
                 <p><strong>To:</strong> \${formData.recipientName} (\${formData.recipientRole})</p>
                 <p><strong>Subject:</strong> \${formData.title}</p>
                 <div style="margin-top: 20px; line-height: 1.6; white-space: pre-wrap;">\${formData.content}</div>
                 <div style="margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
                    <p>Best Regards,</p>
                    <p><strong>Administration</strong><br/>\${schoolConfig.schoolName}</p>
                 </div>
               </div>
             \`;
             await sendEmail([formData.recipientEmail], formData.title, emailContent);
         } catch (emailErr: any) {
             console.error("Email send failed:", emailErr);
             if (emailErr.message?.includes('popup_closed_by_user')) {
                alert("Gmail connection was cancelled. Letter saved but not emailed.");
             } else {
                alert("Letter saved, but failed to send email.");
             }
         }
      }

      handleCloseModal();
      await fetchLetters();
`;

content = content.replace(/const handleSave = async \(\) => \{[\s\S]*?handleCloseModal\(\);\n      await fetchLetters\(\);/, handleSaveCode);

const emailField = `
              <div className="space-y-2">
                <label className="text-xs font-bold text-crhs-navy uppercase tracking-wider">Recipient Name</label>
                <Input 
                  value={formData.recipientName}
                  onChange={(e) => setFormData({...formData, recipientName: e.target.value})}
                  placeholder="e.g. John Doe"
                  className="border-2 rounded-none focus:border-crhs-navy"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-crhs-navy uppercase tracking-wider">Recipient Email (Optional)</label>
                <Input 
                  type="email"
                  value={formData.recipientEmail}
                  onChange={(e) => setFormData({...formData, recipientEmail: e.target.value})}
                  placeholder="e.g. john@example.com"
                  className="border-2 rounded-none focus:border-crhs-navy"
                />
              </div>
`;
content = content.replace(/<div className="space-y-2">\s*<label className="text-xs font-bold text-crhs-navy uppercase tracking-wider">Recipient Name<\/label>\s*<Input[\s\S]*?<\/div>/, emailField);

const toggleUI = `
              <div className="space-y-2">
                <label className="text-xs font-bold text-crhs-navy uppercase tracking-wider">Letter Content</label>
                <textarea 
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  placeholder="Type the main body of the letter here..."
                  className="w-full min-h-[150px] border-2 border-slate-200 bg-white p-4 text-sm focus:border-crhs-navy focus:outline-none rounded-none resize-y"
                />
              </div>
              
              <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-100 mt-4">
                <input 
                   type="checkbox" 
                   id="sendEmail" 
                   checked={formData.sendEmail} 
                   onChange={(e) => setFormData({...formData, sendEmail: e.target.checked})}
                   disabled={!formData.recipientEmail}
                   className="w-4 h-4 text-crhs-navy border-slate-300 rounded focus:ring-crhs-navy disabled:opacity-50"
                />
                <label htmlFor="sendEmail" className="text-sm font-bold text-crhs-navy flex items-center gap-2 cursor-pointer">
                  <Mail className="w-4 h-4" /> Email this letter directly to the recipient (Requires Recipient Email)
                </label>
              </div>
`;
content = content.replace(/<div className="space-y-2">\s*<label className="text-xs font-bold text-crhs-navy uppercase tracking-wider">Letter Content<\/label>\s*<textarea[\s\S]*?<\/div>/, toggleUI);

fs.writeFileSync('src/admin/components/AdminLetters.tsx', content);
