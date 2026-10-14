import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/common/components/ui/Card';
import { Button } from '@/common/components/ui/Button';
import { Input } from '@/common/components/ui/Input';
import { CustomSelect } from '@/common/components/ui/CustomSelect';
import { BellRing, Plus, Trash2, Loader2, Search, X, Send } from 'lucide-react';
import { collection, getDocs, addDoc, deleteDoc, doc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { connectGmail, sendEmail, getGmailToken } from '@/lib/gmail';
import { Mail } from 'lucide-react';

const TARGET_AUDIENCES = [
  { label: 'All Users', value: 'all' },
  { label: 'All Students', value: 'students' },
  { label: 'All Teachers', value: 'teachers' },
  { label: 'All Parents', value: 'parents' },
  { label: 'Class 9', value: 'class_9' },
  { label: 'Class 10', value: 'class_10' },
  { label: 'Class 11', value: 'class_11' },
  { label: 'Class 12', value: 'class_12' },
];

const SEVERITY_LEVELS = [
  { label: 'Informational (Blue)', value: 'info' },
  { label: 'Warning (Orange)', value: 'warning' },
  { label: 'Urgent / Alert (Red)', value: 'urgent' },
];

export function AdminAlerts() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    targetAudience: 'all',
    severity: 'info',
    sendEmail: false
  });
  const [isSaving, setIsSaving] = useState(false);

  const fetchAlerts = async () => {
    try {
      const q = query(collection(db, 'alerts'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const list: any[] = [];
      snap.forEach(d => list.push({ id: d.id, ...d.data() }));
      setAlerts(list);
    } catch (err) {
      console.error("Error fetching alerts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleOpenModal = () => {
    setFormData({
      title: '',
      message: '',
      targetAudience: 'all',
      severity: 'info',
      sendEmail: false
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  
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


  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this active alert? It will disappear from users' dashboards instantly.")) return;
    try {
      await deleteDoc(doc(db, 'alerts', id));
      await fetchAlerts();
    } catch (err) {
      console.error("Error deleting alert:", err);
    }
  };

  const filteredAlerts = alerts.filter(a => 
    a.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.message?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-crhs-navy uppercase tracking-widest flex items-center gap-2">
            <BellRing className="w-6 h-6 text-crhs-gold" />
            Live Broadcasts & Alerts
          </h2>
          <p className="text-slate-600 text-sm mt-1">Send instant push notifications to student and teacher dashboards.</p>
        </div>
        <Button onClick={handleOpenModal} className="bg-red-600 text-white hover:bg-red-700 hover:text-white">
          <Plus className="w-4 h-4 mr-2" /> Send New Alert
        </Button>
      </div>

      <Card className="border-t-4 border-t-crhs-navy rounded-none shadow-sm">
        <CardHeader className="bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <CardTitle className="text-sm font-bold text-crhs-navy uppercase tracking-wider">Active Broadcasts</CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input 
              placeholder="Search alerts..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 text-xs border-2 border-slate-200 focus:border-crhs-navy rounded-none"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-crhs-navy" /></div>
          ) : filteredAlerts.length === 0 ? (
            <div className="p-8 text-center text-slate-500 font-medium text-sm">No active alerts found. Broadcast a new message to show it here.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-crhs-navy font-bold uppercase text-[10px] tracking-wider border-b">
                  <tr>
                    <th className="px-6 py-4">Title / Message</th>
                    <th className="px-6 py-4">Audience</th>
                    <th className="px-6 py-4">Severity</th>
                    <th className="px-6 py-4">Broadcast Time</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAlerts.map((alert) => (
                    <tr key={alert.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-crhs-navy">{alert.title}</div>
                        <div className="text-xs text-slate-600 line-clamp-1 max-w-md">{alert.message}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-1 rounded bg-slate-200 text-slate-700 text-[10px] font-bold uppercase tracking-wider">
                          {TARGET_AUDIENCES.find(a => a.value === alert.targetAudience)?.label || alert.targetAudience}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                          alert.severity === 'urgent' ? 'bg-red-100 text-red-700' :
                          alert.severity === 'warning' ? 'bg-amber-100 text-amber-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {alert.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs font-medium">
                        {alert.createdAt?.toDate ? alert.createdAt.toDate().toLocaleString() : 'Just now'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => handleDelete(alert.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Revoke/Delete Alert">
                          <Trash2 className="w-4 h-4" />
                        </button>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl border-t-4 border-red-600 shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-xl font-black text-crhs-navy uppercase tracking-widest flex items-center gap-2">
                <Send className="w-5 h-5 text-red-600" />
                Broadcast Notification
              </h3>
              <button onClick={handleCloseModal} className="p-2 text-slate-400 hover:text-crhs-navy hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-crhs-navy uppercase tracking-wider">Target Audience</label>
                  <CustomSelect 
                    value={formData.targetAudience}
                    onChange={(val) => setFormData({...formData, targetAudience: val as string})}
                    options={TARGET_AUDIENCES}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-crhs-navy uppercase tracking-wider">Severity Level</label>
                  <CustomSelect 
                    value={formData.severity}
                    onChange={(val) => setFormData({...formData, severity: val as string})}
                    options={SEVERITY_LEVELS}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-crhs-navy uppercase tracking-wider">Alert Title</label>
                <Input 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g. Urgent: Heavy Rainfall Tomorrow"
                  className="border-2 rounded-none focus:border-red-600"
                />
              </div>

              
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

            </div>
            
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <Button onClick={handleCloseModal} variant="ghost" className="text-slate-600 rounded-none font-bold uppercase tracking-wider text-xs">
                Cancel
              </Button>
              <Button 
                onClick={handleSend} 
                disabled={isSaving || !formData.title || !formData.message} 
                className="bg-red-600 text-white hover:bg-red-700 rounded-none font-black uppercase tracking-widest text-xs px-8"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Broadcast Now'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
