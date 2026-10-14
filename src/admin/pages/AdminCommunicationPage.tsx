import React, { useState, useEffect } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/common/components/ui/Card';
import { Button } from '@/common/components/ui/Button';
import { CustomSelect } from '@/common/components/ui/CustomSelect';
import { Input } from '@/common/components/ui/Input';
import { Loader2, Send, CheckCircle2, AlertCircle, Users, Sparkles, Mail } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserData } from '@/types';
import { schoolConfig } from '@/config/schoolConfig';

export function AdminCommunicationPage() {
  const { settings } = useSettings();
  
  const [registeredUsers, setRegisteredUsers] = useState<any[]>([]);
  const [selectedUserUid, setSelectedUserUid] = useState<string>('');
  const [directRecipientEmail, setDirectRecipientEmail] = useState('');
  const [directRecipientName, setDirectRecipientName] = useState('');
  const [directSubject, setDirectSubject] = useState('');
  const [directBody, setDirectBody] = useState('');
  const [directMailLoading, setDirectMailLoading] = useState(false);
  const [directMailStatus, setDirectMailStatus] = useState<{ success?: boolean; msg?: string } | null>(null);

  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('All');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        const usersList: any[] = [];
        usersSnap.forEach((doc) => {
          usersList.push(doc.data());
        });
        setRegisteredUsers(usersList);
      } catch (err) {
        console.warn("Could not fetch user list for mailer:", err);
      }
    };
    fetchUsers();
  }, []);

  const handleSelectUserForMailer = (uid: string) => {
    setSelectedUserUid(uid);
    if (!uid) return;
    const foundUser = registeredUsers.find(u => u.uid === uid);
    if (foundUser) {
      setDirectRecipientEmail(foundUser.email || '');
      setDirectRecipientName(foundUser.fullName || foundUser.name || 'Parent / Student');
    }
  };

  const handleApplyEmailTemplate = (templateType: string) => {
    const contactInfo = `Contact us at: ${settings.contactPhone || schoolConfig.contact.phonePrimary} or ${settings.contactEmail || schoolConfig.contact.emailPrimary}`;
    switch (templateType) {
      case 'welcome':
        setDirectSubject(`Welcome & Registration Details - ${schoolConfig.schoolName}`);
        setDirectBody(`Dear ${directRecipientName || 'Parent / Student'},\n\nWelcome to ${schoolConfig.schoolName} (${schoolConfig.schoolShortName}). Your student portal account is active.\n\nPlease retain your official 12-Digit ${schoolConfig.schoolShortName} ID and credentials for accessing exam results, fee receipts, and academic notices.\n\n${contactInfo}\n\nWarm regards,\n${schoolConfig.schoolName} Administration`);
        break;
      case 'fee':
        setDirectSubject(`Important Academic Notice - ${schoolConfig.schoolName}`);
        setDirectBody(`Dear ${directRecipientName || 'Parent / Student'},\n\nThis is an official notice regarding academic session updates and fee status.\n\nPlease review your student dashboard or visit the school office at ${schoolConfig.location.address} for details.\n\n${contactInfo}\n\nWarm regards,\n${schoolConfig.schoolName} Administration`);
        break;
      case 'reset':
        setDirectSubject(`Portal Security Notice - ${schoolConfig.schoolName}`);
        setDirectBody(`Dear ${directRecipientName || 'Parent / Student'},\n\nYour portal account password reset instructions have been issued. If you requested a password change, please follow the link sent to your registered email.\n\n${contactInfo}\n\nWarm regards,\n${schoolConfig.schoolShortName} Administration Security Team`);
        break;
      case 'exam':
        setDirectSubject(`Exam Results Declaration - ${schoolConfig.schoolName}`);
        setDirectBody(`Dear ${directRecipientName || 'Parent / Student'},\n\nThis is to inform you that the recent examination results have been declared.\n\nPlease log in to your student portal using your ${schoolConfig.schoolShortName} ID to view the detailed academic performance report.\n\n${contactInfo}\n\nWarm regards,\n${schoolConfig.schoolName} Examination Board`);
        break;
      case 'attendance':
        setDirectSubject(`Important Notice: Attendance Shortfall - ${schoolConfig.schoolName}`);
        setDirectBody(`Dear ${directRecipientName || 'Parent / Student'},\n\nThis is an official communication regarding the student's attendance. The current attendance has fallen below the required academic threshold.\n\nPlease ensure regular attendance to avoid any impact on academic progression. Please contact the class teacher or administration for further discussion.\n\n${contactInfo}\n\nWarm regards,\n${schoolConfig.schoolName} Administration`);
        break;
      case 'holiday':
        setDirectSubject(`Holiday / Event Announcement - ${schoolConfig.schoolName}`);
        setDirectBody(`Dear ${directRecipientName || 'Parent / Student'},\n\nThis is to inform you about an upcoming school holiday/event. The school will remain closed / function according to a special schedule.\n\nPlease check the notice board on your student portal for specific dates and details.\n\n${contactInfo}\n\nWarm regards,\n${schoolConfig.schoolName} Administration`);
        break;
      case 'general':
        setDirectSubject(`General Announcement - ${schoolConfig.schoolName}`);
        setDirectBody(`Dear ${directRecipientName || 'Parent / Student'},\n\nWe have an important update from the administration.\n\n[Please insert your message here]\n\n${contactInfo}\n\nWarm regards,\n${schoolConfig.schoolName} Administration`);
        break;
    }
  };

  const handleSendDirectEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directRecipientEmail.trim() || !directSubject.trim() || !directBody.trim()) {
      setDirectMailStatus({ success: false, msg: "Please fill in recipient email, subject, and message body." });
      return;
    }

    setDirectMailLoading(true);
    setDirectMailStatus(null);

    try {
      const res = await fetch('/api/admin/send-direct-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: directRecipientEmail.trim(),
          recipientName: directRecipientName.trim(),
          subject: directSubject.trim(),
          messageBody: directBody.trim(),
          smtpUser: settings.mailConfig?.smtpUser,
          smtpPass: settings.mailConfig?.smtpPass,
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.details || "Dispatch failed");
      }

      setDirectMailStatus({
        success: true,
        msg: `Official email dispatched successfully!`
      });

      setDirectSubject('');
      setDirectBody('');
    } catch (err: any) {
      console.error("Direct email dispatch error:", err);
      setDirectMailStatus({
        success: false,
        msg: err.message || "Failed to dispatch email. Check admin mail credentials."
      });
    } finally {
      setDirectMailLoading(false);
    }
  };

  // Derive unique classes for filter
  const availableClasses: string[] = Array.from(new Set<string>(registeredUsers.map(u => String(u.currentClass || u.classApplied || 'Unassigned')))).sort();
  
  const filteredUsers = selectedClassFilter === 'All' 
    ? registeredUsers 
    : registeredUsers.filter(u => (u.currentClass || u.classApplied || 'Unassigned') === selectedClassFilter);

  return (
    <div className="space-y-8 w-full pb-10">
      <div className="bg-crhs-navy rounded-2xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl border-4 border-crhs-navy">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-crhs-gold/20 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-crhs-gold text-crhs-navy text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-sm mb-3">
              <Mail className="w-3.5 h-3.5" /> Communications
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wider mb-2">
              Family Mailer
            </h1>
            <p className="text-sm text-slate-300 font-medium max-w-2xl leading-relaxed">
              Compose and dispatch official administrative emails directly to registered parents and students. Use the class filter to easily find recipients.
            </p>
          </div>
        </div>
      </div>

      <Card className="border-0 shadow-lg border-2 border-slate-200">
        <CardHeader className="bg-white border-b-2 border-slate-100 py-5 px-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-xl font-black uppercase tracking-wider flex items-center gap-2 text-crhs-navy">
                <Users className="w-5 h-5 text-crhs-gold" />
                Direct Mail Dispatcher
              </CardTitle>
            </div>
            <span className="bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full shrink-0 border border-emerald-300">
              On Behalf of Admin
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          
          {directMailStatus && (
            <div className={`p-4 text-xs font-bold border-2 ${directMailStatus.success ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-red-50 text-red-800 border-red-300'} flex items-start gap-2`}>
              {directMailStatus.success ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> : <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />}
              <div>{directMailStatus.msg}</div>
            </div>
          )}

          <form onSubmit={handleSendDirectEmail} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-700 mb-2">
                  Filter by Class
                </label>
                <CustomSelect
                  value={selectedClassFilter}
                  onChange={(val) => {
                    setSelectedClassFilter(val);
                    setSelectedUserUid('');
                    setDirectRecipientEmail('');
                    setDirectRecipientName('');
                  }}
                  options={[
                    { label: '-- All Classes --', value: 'All' },
                    ...availableClasses.map(cls => ({ label: cls, value: cls }))
                  ]}
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-700 mb-2">
                  Select Student / Parent Profile
                </label>
                <CustomSelect
                  value={selectedUserUid}
                  onChange={handleSelectUserForMailer}
                  options={[
                    { label: `-- Select Recipient (${filteredUsers.length}) --`, value: '' },
                    ...filteredUsers.map(u => ({
                      label: `${u.fullName || u.name || 'Unnamed Student'} (${u.email || 'No Email'}) - ${u.currentClass || u.classApplied || 'Unassigned'}`,
                      value: u.uid || ''
                    }))
                  ]}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-700 mb-1">
                  Recipient Family Email <span className="text-red-500">*</span>
                </label>
                <Input 
                  type="email"
                  required
                  value={directRecipientEmail}
                  onChange={(e) => setDirectRecipientEmail(e.target.value)}
                  placeholder="parent@domain.com"
                  className="font-medium text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-700 mb-1">
                  Recipient Full Name
                </label>
                <Input 
                  type="text"
                  value={directRecipientName}
                  onChange={(e) => setDirectRecipientName(e.target.value)}
                  placeholder="e.g. Shri Ramesh Prasad"
                  className="font-medium text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-700 mb-2">
                Quick Apply Email Template
              </label>
              <div className="flex flex-wrap gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleApplyEmailTemplate('welcome')}
                  className="text-xs uppercase font-bold text-crhs-navy border-crhs-navy hover:bg-slate-100"
                >
                  <Sparkles className="w-3.5 h-3.5 text-crhs-gold mr-1" /> Registration Welcome & ID
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleApplyEmailTemplate('fee')}
                  className="text-xs uppercase font-bold text-crhs-navy border-crhs-navy hover:bg-slate-100"
                >
                  Academic / Fee Notice
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleApplyEmailTemplate('exam')}
                  className="text-xs uppercase font-bold text-crhs-navy border-crhs-navy hover:bg-slate-100"
                >
                  Exam Results
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleApplyEmailTemplate('attendance')}
                  className="text-xs uppercase font-bold text-red-700 border-red-700 hover:bg-red-50"
                >
                  Attendance Warning
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleApplyEmailTemplate('holiday')}
                  className="text-xs uppercase font-bold text-emerald-700 border-emerald-700 hover:bg-emerald-50"
                >
                  Holiday / Event
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleApplyEmailTemplate('general')}
                  className="text-xs uppercase font-bold text-crhs-navy border-crhs-navy hover:bg-slate-100"
                >
                  General Notice
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleApplyEmailTemplate('reset')}
                  className="text-xs uppercase font-bold text-slate-500 border-slate-300 hover:bg-slate-100"
                >
                  Password Reset
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-700 mb-1">
                Official Email Subject <span className="text-red-500">*</span>
              </label>
              <Input 
                type="text"
                required
                value={directSubject}
                onChange={(e) => setDirectSubject(e.target.value)}
                placeholder={`e.g. Official Notice: Academic Session Updates - ${schoolConfig.schoolShortName}`}
                className="font-bold text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-700 mb-1">
                Official Message Content (Formatted for Parent/Family) <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={6}
                required
                value={directBody}
                onChange={(e) => setDirectBody(e.target.value)}
                placeholder="Type the message content to send to the student/family on behalf of administration..."
                className="block w-full p-3 border-2 border-slate-200 rounded-none text-xs font-medium text-slate-800 leading-relaxed focus:ring-crhs-navy focus:border-crhs-navy"
              />
            </div>

            <Button 
              type="submit" 
              disabled={directMailLoading} 
              className="w-full bg-crhs-navy text-white font-black text-sm uppercase tracking-wider py-3"
            >
              {directMailLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
              Dispatch Official Email to Family
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
