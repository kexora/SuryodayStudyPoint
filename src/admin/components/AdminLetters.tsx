import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/common/components/ui/Card';
import { Button } from '@/common/components/ui/Button';
import { Input } from '@/common/components/ui/Input';
import { CustomSelect } from '@/common/components/ui/CustomSelect';
import { FileText, Plus, Trash2, Edit, Printer, Loader2, Search, X } from 'lucide-react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { schoolConfig } from '@/config/schoolConfig';
import { connectGmail, sendEmail, getGmailToken } from '@/lib/gmail';
import { Mail } from 'lucide-react';

const LETTER_TYPES = ['Warning', 'Appreciation', 'Admissions', 'General Notice', 'Custom'];

export function AdminLetters() {
  const [letters, setLetters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    recipientName: '',
    recipientRole: 'Student',
    type: 'General Notice',
    content: '',
    recipientEmail: '',
    sendEmail: false
  });
  const [isSaving, setIsSaving] = useState(false);
  
  // Print State
  const [printLetter, setPrintLetter] = useState<any | null>(null);

  const fetchLetters = async () => {
    try {
      const q = query(collection(db, 'letters'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const list: any[] = [];
      snap.forEach(d => list.push({ id: d.id, ...d.data() }));
      setLetters(list);
    } catch (err) {
      console.error("Error fetching letters:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLetters();
  }, []);

  const handleOpenModal = (letter?: any) => {
    if (letter) {
      setEditingId(letter.id);
      setFormData({
        title: letter.title || '',
        recipientName: letter.recipientName || '',
        recipientRole: letter.recipientRole || 'Student',
        type: letter.type || 'General Notice',
        content: letter.content || '',
        recipientEmail: letter.recipientEmail || '',
        sendEmail: false
      });
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        recipientName: '',
        recipientRole: 'Student',
        type: 'General Notice',
        content: '',
        recipientEmail: '',
        sendEmail: false
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  
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
             const emailContent = `
               <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                 <div style="text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 20px; margin-bottom: 20px;">
                    <h1 style="color: #0f172a; margin: 0;">${schoolConfig.schoolName}</h1>
                    <p style="color: #64748b; margin: 5px 0;">${schoolConfig.location.fullAddress}</p>
                 </div>
                 <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                 <p><strong>To:</strong> ${formData.recipientName} (${formData.recipientRole})</p>
                 <p><strong>Subject:</strong> ${formData.title}</p>
                 <div style="margin-top: 20px; line-height: 1.6; white-space: pre-wrap;">${formData.content}</div>
                 <div style="margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
                    <p>Best Regards,</p>
                    <p><strong>Administration</strong><br/>${schoolConfig.schoolName}</p>
                 </div>
               </div>
             `;
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

    } catch (err) {
      console.error("Error saving letter:", err);
      alert("Failed to save letter.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this letter?")) return;
    try {
      await deleteDoc(doc(db, 'letters', id));
      await fetchLetters();
    } catch (err) {
      console.error("Error deleting letter:", err);
    }
  };

  const handlePrint = (letter: any) => {
    setPrintLetter(letter);
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const filteredLetters = letters.filter(l => 
    l.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.recipientName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-crhs-navy uppercase tracking-widest flex items-center gap-2">
            <FileText className="w-6 h-6 text-crhs-gold" />
            Letter Management
          </h2>
          <p className="text-slate-600 text-sm mt-1">Create, manage, and print official school letters.</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="bg-crhs-navy text-white hover:bg-crhs-gold hover:text-crhs-navy">
          <Plus className="w-4 h-4 mr-2" /> New Letter
        </Button>
      </div>

      <Card className="border-t-4 border-t-crhs-navy rounded-none shadow-sm">
        <CardHeader className="bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <CardTitle className="text-sm font-bold text-crhs-navy uppercase tracking-wider">Generated Letters</CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input 
              placeholder="Search letters..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 text-xs border-2 border-slate-200 focus:border-crhs-navy rounded-none"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-crhs-navy" /></div>
          ) : filteredLetters.length === 0 ? (
            <div className="p-8 text-center text-slate-500 font-medium text-sm">No letters found. Create a new letter to get started.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-crhs-navy font-bold uppercase text-[10px] tracking-wider border-b">
                  <tr>
                    <th className="px-6 py-4">Title</th>
                    <th className="px-6 py-4">Recipient</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLetters.map((letter) => (
                    <tr key={letter.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-crhs-navy">{letter.title}</td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-800">{letter.recipientName}</div>
                        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{letter.recipientRole}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-1 rounded bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                          {letter.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs font-medium">
                        {letter.createdAt?.toDate ? letter.createdAt.toDate().toLocaleDateString() : 'Just now'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handlePrint(letter)} className="p-2 text-slate-400 hover:text-crhs-navy hover:bg-slate-100 transition-colors" title="Print Letter">
                            <Printer className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleOpenModal(letter)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition-colors" title="Edit Letter">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(letter.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Delete Letter">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm print:hidden">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto border-t-4 border-crhs-navy shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-xl font-black text-crhs-navy uppercase tracking-widest">
                {editingId ? 'Edit Letter' : 'Create New Letter'}
              </h3>
              <button onClick={handleCloseModal} className="p-2 text-slate-400 hover:text-crhs-navy hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-crhs-navy uppercase tracking-wider">Letter Title</label>
                  <Input 
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g. Warning Letter - Attendance"
                    className="border-2 rounded-none focus:border-crhs-navy"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-crhs-navy uppercase tracking-wider">Letter Type</label>
                  <CustomSelect 
                    value={formData.type}
                    onChange={(val) => setFormData({...formData, type: val as string})}
                    options={LETTER_TYPES.map(t => ({label: t, value: t}))}
                    placeholder="Select Type"
                  />
                </div>
                
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

                <div className="space-y-2">
                  <label className="text-xs font-bold text-crhs-navy uppercase tracking-wider">Recipient Role</label>
                  <CustomSelect 
                    value={formData.recipientRole}
                    onChange={(val) => setFormData({...formData, recipientRole: val as string})}
                    options={[
                      {label: 'Student', value: 'Student'},
                      {label: 'Parent', value: 'Parent'},
                      {label: 'Teacher', value: 'Teacher'},
                      {label: 'Staff', value: 'Staff'},
                    ]}
                    placeholder="Select Role"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-crhs-navy uppercase tracking-wider">Letter Content</label>
                <div className="bg-slate-50 border-2 border-slate-200 p-2 text-xs text-slate-500 font-medium mb-2">
                  Tip: Use standard text. The final print will automatically include the school letterhead and formatting.
                </div>
                <textarea 
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  placeholder="Enter the main body of the letter here..."
                  className="w-full min-h-[300px] border-2 border-slate-200 bg-white p-4 text-sm focus:border-crhs-navy focus:outline-none rounded-none resize-y font-sans"
                />
              </div>
            </div>
            
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <Button onClick={handleCloseModal} variant="ghost" className="text-slate-600 rounded-none font-bold uppercase tracking-wider text-xs">
                Cancel
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={isSaving || !formData.title || !formData.recipientName || !formData.content} 
                className="bg-crhs-navy text-white hover:bg-crhs-gold hover:text-crhs-navy rounded-none font-black uppercase tracking-widest text-xs px-8"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Letter'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Print View (Hidden in Screen, Visible in Print) */}
      {printLetter && (
        <div className="hidden print:block fixed inset-0 bg-white z-[9999] p-12 overflow-visible w-full h-full text-black">
          {/* Letterhead */}
          <div className="flex items-center justify-between border-b-2 border-crhs-navy pb-6 mb-8">
            <div className="flex-1">
              <h1 className="text-3xl font-black text-crhs-navy uppercase tracking-widest m-0 leading-tight">
                {schoolConfig.schoolName}
              </h1>
              <p className="text-sm font-medium text-slate-600 mt-1">{schoolConfig.location.fullAddress}</p>
              <p className="text-sm font-medium text-slate-600">
                Email: {schoolConfig.contact.emailPrimary} | Phone: {schoolConfig.contact.phonePrimary}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-crhs-navy uppercase tracking-wider">Official Correspondence</div>
              <div className="text-xs text-slate-500 mt-1">
                Date: {printLetter.createdAt?.toDate ? printLetter.createdAt.toDate().toLocaleDateString() : new Date().toLocaleDateString()}
              </div>
              <div className="text-xs text-slate-500">Ref: {printLetter.id?.substring(0, 8).toUpperCase() || 'NEW'}</div>
            </div>
          </div>

          {/* Recipient Area */}
          <div className="mb-8">
            <div className="text-sm text-slate-600 font-medium mb-1">To:</div>
            <div className="text-lg font-bold text-crhs-navy">{printLetter.recipientName}</div>
            <div className="text-sm font-bold uppercase tracking-widest text-slate-500">{printLetter.recipientRole}</div>
          </div>

          {/* Subject */}
          <div className="mb-8 border-y border-slate-200 py-3">
            <div className="font-bold text-sm uppercase tracking-wider flex items-center">
              <span className="w-24 text-slate-500">Subject:</span> 
              <span className="text-crhs-navy">{printLetter.title}</span>
            </div>
          </div>

          {/* Body */}
          <div className="whitespace-pre-wrap text-base font-medium text-slate-800 leading-relaxed mb-16 font-serif">
            {printLetter.content}
          </div>

          {/* Signatures */}
          <div className="mt-24 pt-8">
            <div className="w-64">
              <div className="border-t border-slate-800 pt-2 text-center text-sm font-bold uppercase tracking-wider text-crhs-navy">
                Authorized Signatory
              </div>
              <div className="text-center text-xs text-slate-500 font-medium mt-1">
                {schoolConfig.schoolName} Administration
              </div>
            </div>
          </div>
          
          <style dangerouslySetInnerHTML={{__html: `
            @media print {
              @page { margin: 2cm; }
              body * { visibility: hidden; }
              .print\\:block, .print\\:block * { visibility: visible; }
              .print\\:block {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
              }
              header, footer, nav, .floating-quick-links { display: none !important; }
            }
          `}} />
        </div>
      )}
    </div>
  );
}
