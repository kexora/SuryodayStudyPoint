import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/common/components/ui/Card';
import { Button } from '@/common/components/ui/Button';
import { Database, Link2, ShieldAlert, Loader2, Cloud, HardDrive, Key, CheckCircle2, RefreshCw, Eye, EyeOff, Mail, Send, Save, Users, Sparkles, AlertCircle } from 'lucide-react';
import { signInWithGoogleDrive, getDriveAccessToken, disconnectGoogleDrive } from '@/lib/driveAuth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { schoolConfig } from '@/config/schoolConfig';

import { useSettings } from '@/context/SettingsContext';
import { UserData } from '@/types';
import { collection, getDocs } from 'firebase/firestore';
import { Input } from '@/common/components/ui/Input';


export function AdminTechnicalSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [driveStatus, setDriveStatus] = useState<{ connected: boolean; lastSynced: any; expiresAt: any } | null>(null);
  const [message, setMessage] = useState({ text: '', type: '' });


  const { settings, updateSettings } = useSettings();
  const [formData, setFormData] = useState<any>({ mailConfig: {} });
  // Mail Config State
  const [smtpPassVisible, setSmtpPassVisible] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [testEmailLoading, setTestEmailLoading] = useState(false);
  const [testEmailStatus, setTestEmailStatus] = useState<{ success?: boolean; msg?: string } | null>(null);

  // Registered Students / Users list for Direct Mailer
  const [registeredUsers, setRegisteredUsers] = useState<UserData[]>([]);
  const [selectedUserUid, setSelectedUserUid] = useState<string>('');
  const [directRecipientEmail, setDirectRecipientEmail] = useState('');
  const [directRecipientName, setDirectRecipientName] = useState('');
  const [directSubject, setDirectSubject] = useState('');
  const [directBody, setDirectBody] = useState('');
  const [directMailLoading, setDirectMailLoading] = useState(false);
  const [directMailStatus, setDirectMailStatus] = useState<{ success?: boolean; msg?: string } | null>(null);


  useEffect(() => {
    fetchGlobalDriveStatus();
  }, []);

  useEffect(() => {
    setFormData({ mailConfig: { ...settings.mailConfig } });
    if (settings.contactEmail) {
      setTestEmailAddress(settings.contactEmail);
    }
  }, [settings]);

  const handleMailConfigChange = (field: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      mailConfig: {
        ...prev.mailConfig,
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });
    try {
      await updateSettings({ mailConfig: formData.mailConfig });
      setMessage({ text: 'Technical settings updated successfully!', type: 'success' });
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to update settings.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };


  const fetchGlobalDriveStatus = async () => {
    try {
      const docRef = doc(db, 'systemConfig', 'googleDriveAuth');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setDriveStatus(docSnap.data() as any);
      } else {
        setDriveStatus({ connected: false, lastSynced: null, expiresAt: null });
      }
    } catch (error) {
      console.error("Failed to fetch drive status", error);
    } finally {
      setLoading(false);
    }
  };


  // Test Gmail / SMTP Connection Handler
  const handleTestMailConnection = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!testEmailAddress.trim()) {
      setTestEmailStatus({ success: false, msg: "Please enter a target recipient email address for testing." });
      return;
    }

    setTestEmailLoading(true);
    setTestEmailStatus(null);

    try {
      const res = await fetch('/api/admin/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testEmail: testEmailAddress.trim(),
          smtpUser: formData.mailConfig?.smtpUser,
          smtpPass: formData.mailConfig?.smtpPass,
          smtpHost: formData.mailConfig?.smtpHost,
          smtpPort: formData.mailConfig?.smtpPort,
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.details || "Test delivery failed");
      }

      setTestEmailStatus({
        success: true,
        msg: `Test email successfully sent to ${testEmailAddress.trim()} on behalf of ${formData.mailConfig?.senderName || "${schoolConfig.schoolShortName} Administration"}!`
      });
    } catch (err: any) {
      console.error("Test mail error:", err);
      setTestEmailStatus({
        success: false,
        msg: err.message || "Failed to deliver test email. Please check your Gmail address and Gmail App Password."
      });
    } finally {
      setTestEmailLoading(false);
    }
  };

  // User Selection in Direct Mailer
  const handleSelectUserForMailer = (uid: string) => {
    setSelectedUserUid(uid);
    if (!uid) return;
    const foundUser = registeredUsers.find(u => u.uid === uid);
    if (foundUser) {
      setDirectRecipientEmail(foundUser.email || '');
      setDirectRecipientName(foundUser.fullName || foundUser.name || 'Parent / Student');
    }
  };

  // Preset Template Loader
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

  // Direct Mail Dispatch Handler
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
          smtpUser: formData.mailConfig?.smtpUser,
          smtpPass: formData.mailConfig?.smtpPass,
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.details || "Dispatch failed");
      }

      setDirectMailStatus({
        success: true,
        msg: `Official email dispatched successfully to ${directRecipientName ? `${directRecipientName} (${directRecipientEmail})` : directRecipientEmail}!`
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



  const handleConnectGlobalDrive = async () => {
    setMessage({ text: 'Authenticating with Google Drive...', type: 'info' });
    try {
      const authResult = await signInWithGoogleDrive();
      if (authResult && authResult.accessToken) {
        setSaving(true);
        const expiresAt = Date.now() + 3500 * 1000; // 3500 seconds from now
        
        // Save to Firestore globally so other users can upload without logging in
        const docRef = doc(db, 'systemConfig', 'googleDriveAuth');
        await setDoc(docRef, {
          connected: true,
          accessToken: authResult.accessToken,
          lastSynced: serverTimestamp(),
          expiresAt: expiresAt,
          linkedBy: authResult.user.email
        });
        
        await fetchGlobalDriveStatus();
        setMessage({ text: 'Global Google Drive linked successfully. All authorized users can now upload documents/photos.', type: 'success' });
      }
    } catch (error: any) {
      console.error('Error connecting to Drive:', error);
      setMessage({ text: `Auth failed: ${error.message || 'Unknown error'}`, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDisconnectGlobalDrive = async () => {
    setSaving(true);
    try {
      disconnectGoogleDrive();
      const docRef = doc(db, 'systemConfig', 'googleDriveAuth');
      await setDoc(docRef, {
        connected: false,
        accessToken: null,
        lastSynced: serverTimestamp(),
        expiresAt: null
      });
      await fetchGlobalDriveStatus();
      setMessage({ text: 'Global Google Drive integration has been disconnected.', type: 'info' });
    } catch (error) {
      setMessage({ text: 'Failed to disconnect.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-crhs-navy" /></div>;
  }

  const isExpired = driveStatus?.expiresAt && Date.now() > driveStatus.expiresAt;

  return (
    <div className="space-y-8 w-full pb-10">
      
      {/* Header Info */}
      <div className="bg-crhs-navy rounded-2xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl border-4 border-crhs-navy">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-crhs-gold/20 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-crhs-gold text-crhs-navy text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-sm mb-3">
              <Database className="w-3.5 h-3.5" /> Super Admin Only
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wider mb-2">
              Technical Settings
            </h1>
            <p className="text-sm text-slate-300 font-medium max-w-2xl leading-relaxed">
              Configure system-level integrations for the entire website. Once you link these services here, all users (students, teachers, admins) can utilize them based on their roles, without needing to authenticate themselves.
            </p>
          </div>
        </div>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl font-bold text-sm border-2 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : message.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-blue-50 text-blue-700 border-blue-200'} flex items-start gap-2`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <ShieldAlert className="w-5 h-5 shrink-0" />}
          {message.text}
        </div>
      )}

      {/* 1. GLOBAL DRIVE INTEGRATION */}
      <Card className="border-0 shadow-lg border-2 border-slate-200">
        <CardHeader className="bg-slate-50 border-b-2 border-slate-100 py-5 px-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-lg font-black uppercase tracking-wider flex items-center gap-2 text-crhs-navy">
                <HardDrive className="w-5 h-5 text-blue-600" />
                Global Google Drive Integration
              </CardTitle>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Link your Admin Google Drive account. This acts as the central storage for uploaded documents and gallery photos.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg flex gap-3 text-sm text-amber-900">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold mb-1 uppercase tracking-wider text-xs">Security Note</p>
                <p className="opacity-90 leading-relaxed text-xs">
                  By connecting your Drive, you grant the application permission to upload files on your behalf. Since the OAuth access token expires after 1 hour, this connection may need to be refreshed by clicking "Link Drive" again if uploads start failing. For permanent backend storage, a Service Account is recommended, but this will fulfill the current prototype requirement.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-white border-2 border-slate-100 rounded-xl">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${driveStatus?.connected && !isExpired ? 'bg-emerald-100 text-emerald-600' : isExpired ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>
                  <Cloud className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-black uppercase tracking-wider text-slate-800 text-sm">
                    {driveStatus?.connected && !isExpired ? 'Drive Connected' : isExpired ? 'Drive Token Expired' : 'Not Connected'}
                  </h4>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">
                    {driveStatus?.connected && !isExpired 
                      ? 'The website can currently upload files directly to your Drive.' 
                      : isExpired 
                      ? 'The previous token expired. Please re-link your Drive to resume uploads.' 
                      : 'Link an account to enable website uploads.'}
                  </p>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                {(driveStatus?.connected && !isExpired) ? (
                  <>
                    <Button 
                      variant="outline" 
                      onClick={handleConnectGlobalDrive} 
                      disabled={saving}
                      className="border-crhs-navy text-crhs-navy hidden sm:flex"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" /> Refresh Token
                    </Button>
                    <Button 
                      variant="ghost" 
                      onClick={handleDisconnectGlobalDrive} 
                      disabled={saving}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Disconnect
                    </Button>
                  </>
                ) : (
                  <Button 
                    onClick={handleConnectGlobalDrive} 
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
                  >
                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Link2 className="w-4 h-4 mr-2" />}
                    Link Google Drive
                  </Button>
                )}
              </div>
            </div>

          </div>
        </CardContent>
      </Card>
      
      {/* 2. ADMIN GMAIL / MAIL SYSTEM CONFIGURATION CARD */}
      <Card className="border-0 shadow-lg border-2 border-crhs-navy">
        <CardHeader className="bg-crhs-navy text-white py-5 px-6 border-b-4 border-crhs-gold flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-xl font-black uppercase tracking-wider flex items-center gap-2 text-white">
              <Mail className="w-5 h-5 text-crhs-gold" />
              Admin Gmail & Automated Mail System
            </CardTitle>
            <p className="text-xs text-slate-300 font-semibold mt-1">
              Configure official Gmail SMTP to dispatch automated user registration emails with 12-digit {schoolConfig.schoolShortName} IDs, password reset links, and direct announcements to families.
            </p>
          </div>
          <span className="bg-crhs-gold text-crhs-navy font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-none shrink-0 border border-white/20">
            Official Admin Service
          </span>
        </CardHeader>

        <CardContent className="p-6 space-y-6 bg-slate-50/50">
          
          {/* Instructions Box */}
          <div className="bg-amber-50/90 border-2 border-amber-300 p-4 text-xs font-medium text-amber-900 leading-relaxed space-y-2">
            <div className="font-extrabold uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
              <Key className="w-4 h-4 text-amber-700" /> How to connect your official Gmail account (App Password):
            </div>
            <ol className="list-decimal list-inside space-y-1 font-semibold text-slate-800">
              <li>Enter your official School Admin Gmail (e.g. <code className="bg-amber-100 px-1 font-mono">crhs.admin@gmail.com</code>).</li>
              <li>Open your Google Account (<a href="https://myaccount.google.com/security" target="_blank" rel="noreferrer" className="underline font-bold text-crhs-navy">myaccount.google.com/security</a>) and turn on <strong>2-Step Verification</strong>.</li>
              <li>Search or navigate to <strong>App Passwords</strong> and generate a 16-character App Password for "Mail".</li>
              <li>Paste the generated 16-character key into the <strong>Gmail App Password</strong> field below and click <strong>Save Settings</strong>.</li>
            </ol>
          </div>

          {/* Credentials Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 bg-white p-5 border-2 border-slate-200">
            
            {/* Admin Gmail Address */}
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-xs font-black uppercase tracking-widest text-slate-700 mb-2">
                Admin Gmail Address
              </label>
              <div className="relative">
                <Input 
                  type="email"
                  value={formData.mailConfig?.smtpUser || ''}
                  onChange={(e) => handleMailConfigChange('smtpUser', e.target.value)}
                  placeholder="crhs.admin@gmail.com"
                  className="font-mono font-bold text-sm"
                />
              </div>
            </div>

            {/* Gmail App Password */}
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-700 mb-2">
                Gmail App Password (16-Chars)
              </label>
              <div className="relative">
                <Input 
                  type={smtpPassVisible ? "text" : "password"}
                  value={formData.mailConfig?.smtpPass || ''}
                  onChange={(e) => handleMailConfigChange('smtpPass', e.target.value)}
                  placeholder="xxxx xxxx xxxx xxxx"
                  className="font-mono font-bold text-sm pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setSmtpPassVisible(!smtpPassVisible)}
                >
                  {smtpPassVisible ? (
                    <EyeOff className="h-4 w-4 text-slate-400 hover:text-slate-600" />
                  ) : (
                    <Eye className="h-4 w-4 text-slate-400 hover:text-slate-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Sender Display Name */}
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-700 mb-2">
                Sender Display Name
              </label>
              <Input 
                type="text"
                value={formData.mailConfig?.senderName || ''}
                onChange={(e) => handleMailConfigChange('senderName', e.target.value)}
                placeholder={`${schoolConfig.schoolName} Administration`}
                className="font-medium text-sm"
              />
            </div>

            {/* Host */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                SMTP Host
              </label>
              <Input 
                type="text"
                value={formData.mailConfig?.smtpHost || 'smtp.gmail.com'}
                onChange={(e) => handleMailConfigChange('smtpHost', e.target.value)}
                placeholder="smtp.gmail.com"
                className="font-mono text-xs bg-slate-50"
              />
            </div>

            {/* Port */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                SMTP Port (465 SSL / 587 TLS)
              </label>
              <Input 
                type="text"
                value={formData.mailConfig?.smtpPort || '465'}
                onChange={(e) => handleMailConfigChange('smtpPort', e.target.value)}
                placeholder="465"
                className="font-mono text-xs bg-slate-50"
              />
            </div>

            {/* Quick Action Button */}
            <div className="flex items-end">
              <Button type="button" onClick={handleSubmit} disabled={saving} className="w-full bg-crhs-navy text-white">
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Save Mail Credentials
              </Button>
            </div>

          </div>

          {/* Test Email Connection Tool */}
          <div className="bg-white p-5 border-2 border-slate-200 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-crhs-navy flex items-center gap-2">
              <Send className="w-4 h-4 text-crhs-gold" /> Test Gmail Delivery Connection
            </h4>

            {testEmailStatus && (
              <div className={`p-4 text-xs font-bold border-2 ${testEmailStatus.success ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-red-50 text-red-800 border-red-300'} flex items-start gap-2`}>
                {testEmailStatus.success ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> : <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />}
                <div>{testEmailStatus.msg}</div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <Input 
                type="email"
                value={testEmailAddress}
                onChange={(e) => setTestEmailAddress(e.target.value)}
                placeholder="Enter test recipient email address (e.g. parent@gmail.com)"
                className="flex-1 font-medium text-sm"
              />
              <Button 
                type="button" 
                onClick={handleTestMailConnection} 
                disabled={testEmailLoading} 
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs uppercase tracking-wider shrink-0"
              >
                {testEmailLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                Dispatch Test Email
              </Button>
            </div>
          </div>

        </CardContent>
      </Card>

      

    </div>
  );
}
