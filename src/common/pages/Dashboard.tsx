import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { SEO } from '@/common/components/ui/SEO';
import { Button } from '@/common/components/ui/Button';
import { Input } from '@/common/components/ui/Input';
import { 
  User as UserIcon, 
  LogOut, 
  Copy, 
  Check, 
  Edit3, 
  GraduationCap, 
  MapPin, 
  Phone, 
  Mail, 
  Sparkles, 
  X, 
  Loader2, 
  Building2, 
  Users, 
  FileText, 
  UploadCloud, 
  Clock,
  CheckCircle2,
  Calendar,
  Award,
  QrCode,
  ShieldCheck,
  Home,
  Compass,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { StudentQrPassModal } from '@/common/components/StudentQrCard';
import { schoolConfig } from '@/config/schoolConfig';

export function Dashboard() {
  const { user, userData, signOut, role, refreshUserData, updateUserData } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  // Active Tab state
  const [activeTab, setActiveTab] = useState<'personal' | 'family' | 'address' | 'guardian'>(
    role === '__kx_0x5' ? 'guardian' : 'personal'
  );
  const [userApplications, setUserApplications] = useState<any[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);

  useEffect(() => {
    if (role === '__kx_0x5' && user?.uid) {
      const fetchApps = async () => {
        setLoadingApps(true);
        try {
          const q = query(collection(db, 'applications'), where('userId', '==', user.uid));
          const querySnapshot = await getDocs(q);
          const apps: any[] = [];
          querySnapshot.forEach(docSnap => apps.push({ id: docSnap.id, ...docSnap.data() }));
          setUserApplications(apps);
        } catch (error) {
          console.error('Error fetching applications:', error);
        } finally {
          setLoadingApps(false);
        }
      };
      fetchApps();
    }
  }, [role, user?.uid]);

  // QR Code Modal State
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  // Copy ID Feedback state
  const [copiedId, setCopiedId] = useState(false);

  // Edit Profile / Update Details Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [saveErrorMsg, setSaveErrorMsg] = useState('');

  const [editForm, setEditForm] = useState({
    fullName: userData?.fullName || userData?.name || '',
    mobileNumber: userData?.mobileNumber || '',
    fatherName: userData?.fatherName || '',
    motherName: userData?.motherName || '',
    villageTown: userData?.villageTown || '',
    block: userData?.block || '',
    district: userData?.district || 'Deoria',
    state: userData?.state || 'Uttar Pradesh',
    pincode: userData?.pincode || '',
  });

  // Sync form when userData updates
  useEffect(() => {
    if (userData) {
      setEditForm({
        fullName: userData.fullName || userData.name || '',
        mobileNumber: userData.mobileNumber || '',
        fatherName: userData.fatherName || '',
        motherName: userData.motherName || '',
        villageTown: userData.villageTown || '',
        block: userData.block || '',
        district: userData.district || 'Deoria',
        state: userData.state || 'Uttar Pradesh',
        pincode: userData.pincode || '',
      });
    }
  }, [userData]);

  const getRoleBadge = (r: string | null) => {
    switch (r) {
      case '__kx_0x1':
        return { label: 'Super Admin', bg: 'bg-purple-100 text-purple-900 border-purple-300' };
      case '__kx_0x2':
        return { label: 'Administrator', bg: 'bg-crhs-navy text-white border-crhs-navy' };
      case '__kx_0x3':
        return { label: 'Faculty / Teacher', bg: 'bg-amber-100 text-amber-900 border-amber-300' };
      case '__kx_0x5':
        return { label: 'Parent / Guardian', bg: 'bg-indigo-100 text-indigo-900 border-indigo-300' };
      case '__kx_0x4':
      default:
        return { label: 'Student', bg: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
    }
  };

  const roleBadge = getRoleBadge(role);

  const registrationDate = user?.metadata?.creationTime 
    ? new Date(user.metadata.creationTime).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    : userData?.createdAt
    ? new Date(userData.createdAt).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    : 'Active';

  const handleCopyCrhsId = () => {
    const idToCopy = userData?.crhsId || userData?.studentId;
    if (idToCopy) {
      navigator.clipboard.writeText(idToCopy);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleOpenEditModal = () => {
    setEditForm({
      fullName: userData?.fullName || userData?.name || '',
      mobileNumber: userData?.mobileNumber || '',
      fatherName: userData?.fatherName || '',
      motherName: userData?.motherName || '',
      villageTown: userData?.villageTown || '',
      block: userData?.block || '',
      district: userData?.district || 'Deoria',
      state: userData?.state || 'Uttar Pradesh',
      pincode: userData?.pincode || '',
    });
    setSaveSuccessMsg('');
    setSaveErrorMsg('');
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccessMsg('');
    setSaveErrorMsg('');

    const cleanName = editForm.fullName.trim();
    const cleanMobile = editForm.mobileNumber.trim().replace(/[\s-]/g, '');

    if (!cleanName) {
      setSaveErrorMsg(language === 'hi' ? 'कृपया अपना पूरा नाम दर्ज करें।' : 'Full Name is required.');
      setIsSaving(false);
      return;
    }

    if (cleanMobile && !/^[0-9]{10}$/.test(cleanMobile)) {
      setSaveErrorMsg(language === 'hi' ? 'कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें।' : 'Please enter a valid 10-digit mobile number.');
      setIsSaving(false);
      return;
    }

    try {
      const updatePayload = {
        fullName: cleanName,
        name: cleanName,
        mobileNumber: cleanMobile,
        fatherName: editForm.fatherName.trim(),
        motherName: editForm.motherName.trim(),
        villageTown: editForm.villageTown.trim(),
        block: editForm.block.trim(),
        district: editForm.district.trim(),
        state: editForm.state.trim(),
        pincode: editForm.pincode.trim(),
      };

      const success = await updateUserData(updatePayload);

      if (success) {
        setSaveSuccessMsg(language === 'hi' ? 'विवरण सफलतापूर्वक अपडेट हो गया!' : 'Details updated successfully!');
        setTimeout(() => {
          setIsEditModalOpen(false);
          setSaveSuccessMsg('');
        }, 1200);
      } else {
        setSaveErrorMsg(language === 'hi' ? 'अपडेट करने में समस्या आई। पुनः प्रयास करें।' : 'Failed to update details. Please try again.');
      }
    } catch (err: any) {
      console.error("Error updating profile:", err);
      setSaveErrorMsg(err.message || (language === 'hi' ? 'अपडेट असफल रहा।' : 'Failed to update details.'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const getUserInitials = () => {
    const name = userData?.fullName || userData?.name || user?.email || 'Student';
    const parts = name.trim().split(' ');
    if (parts.length >= 2 && parts[0] && parts[1]) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <>
      <SEO 
        title={`${userData?.fullName || 'Student Portal'} | ${schoolConfig.schoolShortName}`} 
        description={`${schoolConfig.schoolName} Portal.`}
      />
      <div className="bg-slate-50 min-h-[88vh] py-6 sm:py-8 px-3 sm:px-6 lg:px-8">
        
        {role === '__kx_0x5' ? (
          /* GUARDIAN VIEW */
          <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
            {/* Guardian Profile Header */}
            <div className="bg-gradient-to-r from-crhs-navy via-slate-900 to-crhs-navy text-white rounded-2xl p-6 sm:p-8 shadow-xl border-b-4 border-amber-400 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Users className="w-48 h-48 text-white rotate-12" />
              </div>
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/10 rounded-2xl border-2 border-white/20 flex items-center justify-center backdrop-blur-sm shadow-inner shrink-0">
                    <span className="text-3xl sm:text-4xl font-black text-white">{getUserInitials()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-black tracking-widest uppercase bg-indigo-100 text-indigo-900 border border-indigo-300 px-2 py-0.5 rounded-full inline-block mb-1">
                      Parent / Guardian
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
                      {userData?.fullName || userData?.name || 'Guardian Portal'}
                    </h1>
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-300 mt-1">
                      <Mail className="w-3.5 h-3.5 text-amber-400" />
                      {user?.email}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button 
                    onClick={handleOpenEditModal}
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/15 text-xs font-bold"
                  >
                    <Edit3 className="w-4 h-4 mr-1.5" /> {language === 'hi' ? 'विवरण अपडेट करें' : 'Update Details'}
                  </Button>
                  <Button 
                    onClick={handleSignOut}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10 text-xs font-bold uppercase tracking-widest"
                  >
                    <LogOut className="w-4 h-4 mr-2" /> Sign Out
                  </Button>
                </div>
              </div>
            </div>

            {/* Applications List */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-6 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-black text-crhs-navy">
                    {language === 'hi' ? 'नामांकन आवेदन स्थिति' : 'Admission Applications'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    {language === 'hi' ? 'नए बच्चों का प्रवेश और आवेदन स्थिति देखें।' : 'Manage admissions and track statuses.'}
                  </p>
                </div>
                <Button 
                  onClick={() => navigate('/admissions')}
                  className="bg-crhs-navy hover:bg-slate-800 text-white font-bold h-10 px-5 shadow-sm text-xs"
                >
                  + {language === 'hi' ? 'नया प्रवेश आवेदन' : 'New Admission'}
                </Button>
              </div>

              <div className="pt-6">
                {loadingApps ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                  </div>
                ) : userApplications.length === 0 ? (
                  <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl p-10 text-center space-y-3">
                    <FileText className="w-8 h-8 text-slate-400 mx-auto" />
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest">
                      {language === 'hi' ? 'कोई आवेदन नहीं मिला' : 'No Applications Yet'}
                    </h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      {language === 'hi' ? 'नया प्रवेश फॉर्म भरने के लिए ऊपर दिए बटन पर क्लिक करें।' : 'Click the button above to register and submit an admission application.'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userApplications.map(app => (
                      <div key={app.id} className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                            {app.status || 'Pending'}
                          </span>
                          <span className="text-[11px] font-mono font-bold text-slate-500">
                            {app.enrollmentNo || 'N/A'}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-bold text-base text-slate-800">{app.firstName} {app.lastName}</h4>
                          <p className="text-xs text-slate-500 mt-0.5">Class: {app.classApplied || app.prevClass}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* REGULAR STUDENT / ADMIN VIEW */
          <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
            {/* MODERN PROFILE HERO HEADER CARD */}
            <div className="bg-gradient-to-r from-crhs-navy via-slate-900 to-crhs-navy text-white rounded-2xl p-6 sm:p-8 shadow-xl border-b-4 border-amber-400 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <GraduationCap className="w-48 h-48 text-white rotate-12" />
              </div>
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4 sm:gap-6">
                  <div className="w-16 h-16 sm:w-22 sm:h-22 bg-white/10 rounded-2xl border-2 border-white/20 flex items-center justify-center backdrop-blur-sm shadow-inner shrink-0">
                    <span className="text-2xl sm:text-3xl font-black text-amber-300">{getUserInitials()}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black tracking-widest uppercase ${roleBadge.bg} px-2 py-0.5 rounded-full border`}>
                        {roleBadge.label}
                      </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
                      {userData?.fullName || userData?.name || 'Student Portal'}
                      <CheckCircle2 className="w-5 h-5 text-amber-400" />
                    </h1>
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-300 mt-1">
                      <Mail className="w-3.5 h-3.5 text-amber-400" />
                      <span className="truncate max-w-[220px] sm:max-w-none">{user?.email}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  {/* UPDATE DETAILS BUTTON */}
                  <Button 
                    onClick={handleOpenEditModal}
                    className="bg-amber-400 hover:bg-amber-500 text-crhs-navy text-xs font-bold shadow-md h-9 px-4 active:scale-95 transition-all"
                  >
                    <Edit3 className="w-3.5 h-3.5 mr-1.5" />
                    {language === 'hi' ? 'विवरण अपडेट करें' : 'Update Details'}
                  </Button>

                  <Button 
                    onClick={handleSignOut}
                    variant="outline"
                    className="border-white/25 text-white hover:bg-white/10 text-xs font-bold uppercase tracking-wider h-9 px-3"
                  >
                    <LogOut className="w-3.5 h-3.5 mr-1.5" />
                    {language === 'hi' ? 'लॉगआउट' : 'Sign Out'}
                  </Button>
                </div>
              </div>
            </div>

            {/* STATS & QUICK INFO WIDGETS */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* ID Card */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1 relative group">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    {language === 'hi' ? 'आईडी कोड' : 'Student ID'}
                  </span>
                  <Award className="w-4 h-4 text-amber-500" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm sm:text-base font-mono font-black text-crhs-navy tracking-wider truncate">
                    {userData?.crhsId || userData?.studentId || 'Pending'}
                  </div>
                  {(userData?.crhsId || userData?.studentId) && (
                    <button 
                      onClick={handleCopyCrhsId}
                      className="p-1 text-slate-400 hover:text-crhs-navy rounded transition-colors"
                      title="Copy ID"
                    >
                      {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-slate-500">{schoolConfig.schoolShortName} Official ID</p>
              </div>

              {/* Digital QR Pass */}
              <div 
                onClick={() => setIsQrModalOpen(true)}
                className="bg-gradient-to-br from-slate-900 to-crhs-navy text-white p-4 rounded-xl border border-amber-400/40 shadow-xs space-y-1 cursor-pointer hover:border-amber-400 transition-all group"
              >
                <div className="flex items-center justify-between text-amber-400">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                    {language === 'hi' ? 'डिजिटल पास' : 'Digital QR'}
                  </span>
                  <QrCode className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-xs font-bold text-white flex items-center gap-1">
                  <span>{language === 'hi' ? 'आईडी कार्ड देखें' : 'View Pass'}</span>
                  <Sparkles className="w-3 h-3 text-amber-400" />
                </div>
                <p className="text-[10px] text-slate-300 truncate">
                  {language === 'hi' ? 'क्यूआर व सत्यापन कार्ड' : 'Instant Verification'}
                </p>
              </div>

              {/* Mobile Contact */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    {language === 'hi' ? 'मोबाइल' : 'Mobile'}
                  </span>
                  <Phone className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                  {userData?.mobileNumber || (language === 'hi' ? 'उपलब्ध नहीं' : 'Not added')}
                </div>
                <p className="text-[10px] text-slate-500">
                  {language === 'hi' ? 'पंजीकृत संपर्क' : 'Registered Contact'}
                </p>
              </div>

              {/* Campus */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    {language === 'hi' ? 'कैंपस' : 'Campus'}
                  </span>
                  <Building2 className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                  {userData?.district || schoolConfig.location.address.split(',')[1]?.trim() || 'Deoria'}
                </div>
                <p className="text-[10px] text-slate-500">
                  {userData?.state || schoolConfig.location.state}
                </p>
              </div>
            </div>

            {/* PROFILE NAVIGATION TABS & DETAILS DISPLAY */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex border-b border-slate-200 bg-slate-50/80 overflow-x-auto no-scrollbar">
                <button
                  onClick={() => setActiveTab('personal')}
                  className={`py-3.5 px-5 sm:px-6 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 border-b-2 shrink-0 ${
                    activeTab === 'personal'
                      ? 'border-crhs-navy text-crhs-navy bg-white shadow-xs'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <UserIcon className="w-3.5 h-3.5 text-amber-500" />
                  {language === 'hi' ? 'व्यक्तिगत विवरण' : 'Personal Details'}
                </button>

                <button
                  onClick={() => setActiveTab('family')}
                  className={`py-3.5 px-5 sm:px-6 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 border-b-2 shrink-0 ${
                    activeTab === 'family'
                      ? 'border-crhs-navy text-crhs-navy bg-white shadow-xs'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Users className="w-3.5 h-3.5 text-blue-500" />
                  {language === 'hi' ? 'अभिभावक विवरण' : 'Family Details'}
                </button>

                <button
                  onClick={() => setActiveTab('address')}
                  className={`py-3.5 px-5 sm:px-6 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 border-b-2 shrink-0 ${
                    activeTab === 'address'
                      ? 'border-crhs-navy text-crhs-navy bg-white shadow-xs'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                  {language === 'hi' ? 'पता एवं निवास' : 'Address Details'}
                </button>
              </div>

              <div className="p-5 sm:p-8">
                {/* 1. PERSONAL DETAILS TAB */}
                {activeTab === 'personal' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-wider text-crhs-navy flex items-center gap-2">
                          <UserIcon className="w-4 h-4 text-amber-500" /> 
                          {language === 'hi' ? 'छात्र पहचान एवं विवरण' : 'Student Demographics'}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {language === 'hi' ? 'आपका आधिकारिक पंजीकृत प्रोफाइल डेटा' : 'Official registered profile data'}
                        </p>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={handleOpenEditModal} 
                        className="bg-amber-400 hover:bg-amber-500 text-crhs-navy text-[11px] font-bold h-8 px-3"
                      >
                        <Edit3 className="w-3 h-3 mr-1.5" /> 
                        {language === 'hi' ? 'अपडेट करें' : 'Update Details'}
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                      <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                          {language === 'hi' ? 'पूरा नाम' : 'Full Legal Name'}
                        </p>
                        <p className="text-sm font-bold text-slate-800">
                          {userData?.fullName || userData?.name || 'N/A'}
                        </p>
                      </div>

                      <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                          {language === 'hi' ? 'ईमेल पता' : 'Primary Email'}
                        </p>
                        <p className="text-sm font-bold text-slate-800 flex items-center justify-between">
                          <span className="truncate">{user?.email}</span>
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 ml-1" />
                        </p>
                      </div>

                      <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                          {language === 'hi' ? 'मोबाइल नंबर' : 'Mobile Contact'}
                        </p>
                        <p className="text-sm font-bold text-slate-800">
                          {userData?.mobileNumber || (
                            <span className="text-slate-400 text-xs italic">{language === 'hi' ? 'जोड़ें' : 'Click update to add'}</span>
                          )}
                        </p>
                      </div>

                      <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                          {language === 'hi' ? 'छात्र रोल / आईडी' : 'Student ID'}
                        </p>
                        <p className="text-sm font-mono font-bold text-crhs-navy">
                          {userData?.crhsId || userData?.studentId || 'Pending'}
                        </p>
                      </div>

                      <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                          {language === 'hi' ? 'पंजीकरण तिथि' : 'Registration Date'}
                        </p>
                        <p className="text-sm font-bold text-slate-800">
                          {registrationDate}
                        </p>
                      </div>

                      <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                          {language === 'hi' ? 'खाता स्थिति' : 'Account Status'}
                        </p>
                        <p className="text-sm font-bold text-emerald-600 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                          {language === 'hi' ? 'सक्रिय (Active)' : 'Verified & Active'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. FAMILY DETAILS TAB */}
                {activeTab === 'family' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-wider text-crhs-navy flex items-center gap-2">
                          <Users className="w-4 h-4 text-blue-500" /> 
                          {language === 'hi' ? 'माता-पिता / अभिभावक विवरण' : 'Parent & Guardian Information'}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {language === 'hi' ? 'पारिवारिक संपर्क एवं अभिभावक जानकारी' : 'Family contacts and guardian details'}
                        </p>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={handleOpenEditModal} 
                        className="bg-amber-400 hover:bg-amber-500 text-crhs-navy text-[11px] font-bold h-8 px-3"
                      >
                        <Edit3 className="w-3 h-3 mr-1.5" /> 
                        {language === 'hi' ? 'अपडेट करें' : 'Update Details'}
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100 space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                          {language === 'hi' ? 'पिता का नाम' : "Father's Name"}
                        </p>
                        <p className="text-sm font-bold text-slate-800">
                          {userData?.fatherName || (
                            <span className="text-slate-400 text-xs italic">{language === 'hi' ? 'उपलब्ध नहीं (अपडेट करें)' : 'Not provided yet'}</span>
                          )}
                        </p>
                      </div>

                      <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100 space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                          {language === 'hi' ? 'माता का नाम' : "Mother's Name"}
                        </p>
                        <p className="text-sm font-bold text-slate-800">
                          {userData?.motherName || (
                            <span className="text-slate-400 text-xs italic">{language === 'hi' ? 'उपलब्ध नहीं (अपडेट करें)' : 'Not provided yet'}</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. ADDRESS DETAILS TAB */}
                {activeTab === 'address' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-wider text-crhs-navy flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-emerald-500" /> 
                          {language === 'hi' ? 'स्थाई पता एवं स्थान' : 'Address & Residential Information'}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {language === 'hi' ? 'गांव, कस्बा, ब्लॉक और पिन कोड का विवरण' : 'Village, block, district and postal code'}
                        </p>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={handleOpenEditModal} 
                        className="bg-amber-400 hover:bg-amber-500 text-crhs-navy text-[11px] font-bold h-8 px-3"
                      >
                        <Edit3 className="w-3 h-3 mr-1.5" /> 
                        {language === 'hi' ? 'अपडेट करें' : 'Update Details'}
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                      <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                          {language === 'hi' ? 'गांव / कस्बा' : 'Village / Town'}
                        </p>
                        <p className="text-sm font-bold text-slate-800">
                          {userData?.villageTown || (
                            <span className="text-slate-400 text-xs italic">{language === 'hi' ? 'उपलब्ध नहीं' : 'Not specified'}</span>
                          )}
                        </p>
                      </div>

                      <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                          {language === 'hi' ? 'ब्लॉक / तहसील' : 'Block / Tehsil'}
                        </p>
                        <p className="text-sm font-bold text-slate-800">
                          {userData?.block || (
                            <span className="text-slate-400 text-xs italic">{language === 'hi' ? 'उपलब्ध नहीं' : 'Not specified'}</span>
                          )}
                        </p>
                      </div>

                      <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                          {language === 'hi' ? 'जिला' : 'District'}
                        </p>
                        <p className="text-sm font-bold text-slate-800">
                          {userData?.district || 'Deoria'}
                        </p>
                      </div>

                      <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                          {language === 'hi' ? 'राज्य' : 'State'}
                        </p>
                        <p className="text-sm font-bold text-slate-800">
                          {userData?.state || 'Uttar Pradesh'}
                        </p>
                      </div>

                      <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                          {language === 'hi' ? 'पिन कोड' : 'PIN Code'}
                        </p>
                        <p className="text-sm font-mono font-bold text-slate-800">
                          {userData?.pincode || '274702'}
                        </p>
                      </div>

                      <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                          {language === 'hi' ? 'संस्थान केंद्र' : 'Coaching Center'}
                        </p>
                        <p className="text-sm font-bold text-slate-800">
                          {schoolConfig.location.campusName}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ========================================================== */}
      {/* UPDATE DETAILS MODAL (POPUP TO EDIT ALL PROFILE FIELDS)    */}
      {/* ========================================================== */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div 
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-scale-up"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-6 bg-gradient-to-r from-crhs-navy to-slate-900 text-white flex items-center justify-between border-b-2 border-amber-400">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400/20 flex items-center justify-center text-amber-400 border border-amber-400/30">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                    {language === 'hi' ? 'छात्र विवरण अपडेट करें' : 'Update Profile Details'}
                  </h3>
                  <p className="text-xs text-slate-300">
                    {language === 'hi' ? 'अपनी व्यक्तिगत और संपर्क जानकारी संशोधित करें' : 'Edit your student information and contact details'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveProfile} className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
              
              {/* Feedback messages */}
              {saveSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{saveSuccessMsg}</span>
                </div>
              )}

              {saveErrorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{saveErrorMsg}</span>
                </div>
              )}

              {/* Section 1: Personal Info */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-crhs-navy flex items-center gap-1.5 pb-2 border-b border-slate-100">
                  <UserIcon className="w-3.5 h-3.5 text-amber-500" />
                  {language === 'hi' ? '1. व्यक्तिगत जानकारी' : '1. Personal Details'}
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {language === 'hi' ? 'पूरा नाम *' : 'Full Name *'}
                    </label>
                    <Input 
                      value={editForm.fullName}
                      onChange={(e) => setEditForm(prev => ({ ...prev, fullName: e.target.value }))}
                      placeholder="e.g. Rahul Sharma"
                      required
                      className="h-10 text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {language === 'hi' ? '10-अंकीय मोबाइल नंबर' : 'Mobile Number (10 Digits)'}
                    </label>
                    <Input 
                      value={editForm.mobileNumber}
                      onChange={(e) => setEditForm(prev => ({ ...prev, mobileNumber: e.target.value }))}
                      placeholder="e.g. 9876543210"
                      maxLength={10}
                      className="h-10 text-xs font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Parents Info */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-crhs-navy flex items-center gap-1.5 pb-2 border-b border-slate-100">
                  <Users className="w-3.5 h-3.5 text-blue-500" />
                  {language === 'hi' ? '2. माता-पिता की जानकारी' : '2. Parent Details'}
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {language === 'hi' ? 'पिता का नाम' : "Father's Name"}
                    </label>
                    <Input 
                      value={editForm.fatherName}
                      onChange={(e) => setEditForm(prev => ({ ...prev, fatherName: e.target.value }))}
                      placeholder={language === 'hi' ? 'पिता का नाम' : "Father's Name"}
                      className="h-10 text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {language === 'hi' ? 'माता का नाम' : "Mother's Name"}
                    </label>
                    <Input 
                      value={editForm.motherName}
                      onChange={(e) => setEditForm(prev => ({ ...prev, motherName: e.target.value }))}
                      placeholder={language === 'hi' ? 'माता का नाम' : "Mother's Name"}
                      className="h-10 text-xs font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Address Info */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-crhs-navy flex items-center gap-1.5 pb-2 border-b border-slate-100">
                  <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                  {language === 'hi' ? '3. पता एवं निवास स्थान' : '3. Address & Location'}
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {language === 'hi' ? 'गांव / कस्बा' : 'Village / Town'}
                    </label>
                    <Input 
                      value={editForm.villageTown}
                      onChange={(e) => setEditForm(prev => ({ ...prev, villageTown: e.target.value }))}
                      placeholder={language === 'hi' ? 'उदा. भवानी छापर' : 'e.g. Bhawani Chhapar'}
                      className="h-10 text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {language === 'hi' ? 'ब्लॉक / तहसील' : 'Block / Tehsil'}
                    </label>
                    <Input 
                      value={editForm.block}
                      onChange={(e) => setEditForm(prev => ({ ...prev, block: e.target.value }))}
                      placeholder={language === 'hi' ? 'उदा. भाटपार रानी' : 'e.g. Bhatpar Rani'}
                      className="h-10 text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {language === 'hi' ? 'जिला' : 'District'}
                    </label>
                    <Input 
                      value={editForm.district}
                      onChange={(e) => setEditForm(prev => ({ ...prev, district: e.target.value }))}
                      placeholder="Deoria"
                      className="h-10 text-xs font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {language === 'hi' ? 'राज्य' : 'State'}
                    </label>
                    <Input 
                      value={editForm.state}
                      onChange={(e) => setEditForm(prev => ({ ...prev, state: e.target.value }))}
                      placeholder="Uttar Pradesh"
                      className="h-10 text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {language === 'hi' ? 'पिन कोड' : 'PIN Code (6 digits)'}
                    </label>
                    <Input 
                      value={editForm.pincode}
                      onChange={(e) => setEditForm(prev => ({ ...prev, pincode: e.target.value }))}
                      placeholder="274702"
                      maxLength={6}
                      className="h-10 text-xs font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={isSaving}
                  className="text-xs font-bold text-slate-600 border-slate-200 hover:bg-slate-50 h-10 px-4"
                >
                  {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                </Button>

                <Button 
                  type="submit"
                  disabled={isSaving}
                  className="bg-crhs-navy hover:bg-slate-800 text-white text-xs font-bold h-10 px-6 shadow-sm active:scale-95 transition-all"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                      {language === 'hi' ? 'सेव हो रहा है...' : 'Saving Details...'}
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
                      {language === 'hi' ? 'विवरण सुरक्षित करें' : 'Save Details'}
                    </>
                  )}
                </Button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* QR PASS MODAL */}
      <StudentQrPassModal 
        isOpen={isQrModalOpen} 
        onClose={() => setIsQrModalOpen(false)} 
        user={user as any} 
        userData={userData} 
        roleLabel={roleBadge.label} 
      />
    </>
  );
}
