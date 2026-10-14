import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
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
  BookOpen, 
  Sparkles, 
  X, 
  Loader2, 
  Building2, 
  LayoutDashboard, 
  Image as ImageIcon, 
  ExternalLink,
  Users, FileText, UploadCloud, Clock,
  CheckCircle2,
  Calendar,
  Award,
  QrCode
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { StudentQrPassModal } from '@/common/components/StudentQrCard';
import { schoolConfig } from '@/config/schoolConfig';

export function Dashboard() {
  const { user, userData, signOut, role, refreshUserData } = useAuth();
  const navigate = useNavigate();

  // Active Tab state
  
  const [activeTab, setActiveTab] = useState<'personal' | 'family' | 'address' | 'quicklinks' | 'guardian'>(role === '__kx_0x5' ? 'guardian' : 'personal');
  const [userApplications, setUserApplications] = useState<any[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);

  React.useEffect(() => {
    if (role === '__kx_0x5' && user?.uid) {
      const fetchApps = async () => {
        setLoadingApps(true);
        try {
          const q = query(collection(db, 'applications'), where('userId', '==', user.uid));
          const querySnapshot = await getDocs(q);
          const apps: any[] = [];
          querySnapshot.forEach(doc => apps.push({ id: doc.id, ...doc.data() }));
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

  // Copy {schoolConfig.schoolShortName} ID Feedback state
  const [copiedId, setCopiedId] = useState(false);

  // Edit Profile Modal states
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
    district: userData?.district || 'Siwan',
    state: userData?.state || 'Bihar',
    pincode: userData?.pincode || '',
  });

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

  const registrationDate = user?.metadata.creationTime 
    ? new Date(user.metadata.creationTime).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    : 'N/A';

  const handleCopyCrhsId = () => {
    if (userData?.crhsId) {
      navigator.clipboard.writeText(userData.crhsId);
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
      district: userData?.district || 'Siwan',
      state: userData?.state || 'Bihar',
      pincode: userData?.pincode || '',
    });
    setSaveSuccessMsg('');
    setSaveErrorMsg('');
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    setSaveSuccessMsg('');
    setSaveErrorMsg('');

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        fullName: editForm.fullName.trim(),
        name: editForm.fullName.trim(),
        mobileNumber: editForm.mobileNumber.trim(),
        fatherName: editForm.fatherName.trim(),
        motherName: editForm.motherName.trim(),
        villageTown: editForm.villageTown.trim(),
        block: editForm.block.trim(),
        district: editForm.district.trim(),
        state: editForm.state.trim(),
        pincode: editForm.pincode.trim(),
      });

      await refreshUserData();
      setSaveSuccessMsg('Profile updated successfully!');
      setTimeout(() => {
        setIsEditModalOpen(false);
      }, 1200);
    } catch (err: any) {
      console.error("Error updating profile:", err);
      setSaveErrorMsg(err.message || 'Failed to update profile. Please try again.');
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
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <>
      <SEO 
        title={`${userData?.fullName || 'Portal'} | ${schoolConfig.schoolShortName}`} 
        description={`${schoolConfig.schoolName} Portal.`}
      />
      <div className="bg-slate-50 min-h-[88vh] py-8 px-4 sm:px-6 lg:px-8">
        
        {role === '__kx_0x5' ? (
          /* GUARDIAN VIEW */
          <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
            {/* Guardian Profile Header */}
            <div className="bg-gradient-to-r from-crhs-navy via-slate-900 to-crhs-navy text-white rounded-2xl p-6 sm:p-8 shadow-xl border-b-4 border-crhs-gold relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Users className="w-48 h-48 text-white rotate-12" />
              </div>
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/10 rounded-2xl border-2 border-white/20 flex items-center justify-center backdrop-blur-sm shadow-inner shrink-0">
                    <span className="text-3xl sm:text-4xl font-black text-white">{getUserInitials()}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black tracking-widest uppercase bg-crhs-gold/20 text-crhs-gold px-2 py-0.5 rounded-full border border-crhs-gold/30">
                        Guardian Portal
                      </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
                      {userData?.fullName || userData?.name || 'Guardian'}
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-300 mt-2">
                      <div className="flex items-center gap-1.5 bg-black/20 px-2.5 py-1 rounded-md">
                        <Phone className="w-3.5 h-3.5 text-crhs-gold" /> {userData?.mobileNumber || 'Not provided'}
                      </div>
                      <div className="flex items-center gap-1.5 bg-black/20 px-2.5 py-1 rounded-md">
                        <Mail className="w-3.5 h-3.5 text-crhs-gold" /> {user?.email || 'Not provided'}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <Button 
                    onClick={handleSignOut}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10 text-xs font-bold uppercase tracking-widest shadow-sm"
                  >
                    <LogOut className="w-4 h-4 mr-2" /> Sign Out
                  </Button>
                </div>
              </div>
            </div>

            {/* Applications Section */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight text-crhs-navy flex items-center gap-2">
                    <Users className="w-5 h-5 text-crhs-gold" /> My Children & Applications
                  </h3>
                  <p className="text-sm text-slate-500 font-medium mt-1">Manage admissions and track statuses.</p>
                </div>
                <Button 
                  onClick={() => navigate('/admissions')}
                  className="bg-crhs-navy hover:bg-slate-800 text-white font-bold h-11 px-6 shadow-md"
                >
                  + Add Child / New Admission
                </Button>
              </div>

              <div className="pt-6">
                {loadingApps ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
                  </div>
                ) : userApplications.length === 0 ? (
                  <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl p-12 text-center space-y-4">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                      <FileText className="w-8 h-8 text-slate-300" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-700 uppercase tracking-widest">No Applications Yet</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Click the button above to register your child and start a new admission application.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {userApplications.map(app => (
                      <div key={app.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md">
                        <div className={`p-4 border-b flex justify-between items-center ${app.status === 'Approved' ? 'bg-emerald-50 border-emerald-100' : app.status === 'Rejected' ? 'bg-rose-50 border-rose-100' : 'bg-slate-50 border-slate-100'}`}>
                          <div className="flex items-center gap-2">
                            {app.status === 'Approved' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : app.status === 'Rejected' ? <X className="w-4 h-4 text-rose-600" /> : <Clock className="w-4 h-4 text-blue-600" />}
                            <span className={`text-xs font-bold uppercase tracking-widest ${app.status === 'Approved' ? 'text-emerald-700' : app.status === 'Rejected' ? 'text-rose-700' : 'text-blue-700'}`}>
                              Status: {app.status || 'Pending'}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-1 rounded-md border border-slate-200 shadow-sm">
                            {app.enrollmentNo || 'N/A'}
                          </span>
                        </div>
                        
                        <div className="p-5 flex-1 space-y-4">
                          <div>
                            <h4 className="font-black text-lg text-crhs-navy">{app.firstName} {app.lastName}</h4>
                            <p className="text-xs font-medium text-slate-500 mt-1">Class Applied: <span className="text-slate-800 font-bold">{app.classApplied || app.prevClass}</span></p>
                          </div>
                          
                          {app.status === 'Approved' && app.crhsId && (
                            <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-100/50 flex items-center justify-between">
                              <div>
                                <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-widest block mb-0.5">Official CRHS ID</span>
                                <span className="font-black text-crhs-navy">{app.crhsId}</span>
                              </div>
                              <Award className="w-6 h-6 text-emerald-200" />
                            </div>
                          )}
                        </div>
                        
                        <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
                          <Button variant="outline" className="flex-1 text-xs font-bold border-crhs-navy text-crhs-navy hover:bg-slate-100" onClick={() => alert('Document upload is currently being processed offline. Please visit the school with original copies.')}>
                            <UploadCloud className="w-3.5 h-3.5 mr-2" /> Upload Docs
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* REGULAR STUDENT/ADMIN VIEW */
          <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
            {/* MODERN PROFILE HERO HEADER CARD */}
            <div className="bg-gradient-to-r from-crhs-navy via-slate-900 to-crhs-navy text-white rounded-2xl p-6 sm:p-8 shadow-xl border-b-4 border-crhs-gold relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <GraduationCap className="w-48 h-48 text-white rotate-12" />
              </div>
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/10 rounded-2xl border-2 border-white/20 flex items-center justify-center backdrop-blur-sm shadow-inner shrink-0 relative group">
                    <span className="text-3xl sm:text-4xl font-black text-white">{getUserInitials()}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black tracking-widest uppercase ${roleBadge.bg} px-2 py-0.5 rounded-full border`}>
                        {roleBadge.label}
                      </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
                      {userData?.fullName || userData?.name || 'Student Name'}
                      <CheckCircle2 className="w-5 h-5 text-crhs-gold" />
                    </h1>
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-300 mt-2">
                      <Mail className="w-3.5 h-3.5 text-crhs-gold" />
                      {user?.email}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <Button 
                    onClick={handleSignOut}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10 text-xs font-bold uppercase tracking-widest shadow-sm"
                  >
                    <LogOut className="w-4 h-4 mr-2" /> Sign Out
                  </Button>
                </div>
              </div>
            </div>

            {/* STATS & QUICK INFO WIDGETS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[10px] font-black uppercase tracking-widest">{schoolConfig.schoolShortName} ID</span>
                  <Award className="w-4 h-4 text-crhs-gold" />
                </div>
                <div className="text-base font-mono font-black text-crhs-navy tracking-wider truncate">
                  {userData?.crhsId || 'Pending'}
                </div>
                <p className="text-[11px] text-slate-500">Official Identity</p>
              </div>

              <div 
                onClick={() => setIsQrModalOpen(true)}
                className="bg-gradient-to-br from-slate-900 to-crhs-navy text-white p-4 rounded-xl border border-crhs-gold/40 shadow-sm space-y-1 cursor-pointer hover:border-crhs-gold transition-all group"
              >
                <div className="flex items-center justify-between text-crhs-gold">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Verification Pass</span>
                  <QrCode className="w-4 h-4 text-crhs-gold group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-xs font-black uppercase text-white flex items-center gap-1">
                  <span>View Digital QR</span>
                  <Sparkles className="w-3.5 h-3.5 text-crhs-gold" />
                </div>
                <p className="text-[10px] text-slate-300 font-medium">Download or print ID pass</p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[10px] font-black uppercase tracking-widest">Mobile Contact</span>
                  <Phone className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-sm font-bold text-slate-800">
                  {userData?.mobileNumber || 'Not provided'}
                </div>
                <p className="text-[11px] text-slate-500">Registered Mobile</p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[10px] font-black uppercase tracking-widest">Campus</span>
                  <Building2 className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-sm font-bold text-slate-800 truncate">
                  {schoolConfig.schoolShortName} {schoolConfig.location.campusName}
                </div>
                <p className="text-[11px] text-slate-500">{schoolConfig.location.state} Campus</p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1 sm:col-span-2 lg:col-span-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[10px] font-black uppercase tracking-widest">Member Since</span>
                  <Calendar className="w-4 h-4 text-purple-600" />
                </div>
                <div className="text-sm font-bold text-slate-800">
                  {registrationDate}
                </div>
                <p className="text-[11px] text-slate-500">Registration Date</p>
              </div>
            </div>

            {/* PROFILE NAVIGATION TABS */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex border-b border-slate-200 bg-slate-50/80 overflow-x-auto scrollbar-none">
                <button
                  onClick={() => setActiveTab('personal')}
                  className={`py-3.5 px-6 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 border-b-2 shrink-0 ${
                    activeTab === 'personal'
                      ? 'border-crhs-navy text-crhs-navy bg-white shadow-sm'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <UserIcon className="w-4 h-4 text-crhs-gold" /> Personal Details
                </button>
              </div>
              <div className="p-6 sm:p-8">
                {activeTab === 'personal' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <h3 className="text-sm font-black uppercase tracking-wider text-crhs-navy flex items-center gap-2">
                        <UserIcon className="w-4 h-4 text-crhs-gold" /> Student Demographics
                      </h3>
                      <Button size="sm" variant="outline" onClick={handleOpenEditModal} className="text-[10px] font-bold uppercase tracking-widest h-8 border-slate-200 text-slate-600 hover:bg-slate-50">
                        <Edit3 className="w-3 h-3 mr-1.5" /> Edit Info
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Full Legal Name</p>
                        <p className="text-sm font-medium text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-100">{userData?.fullName || userData?.name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Primary Email</p>
                        <p className="text-sm font-medium text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex items-center justify-between group">
                          {user?.email} <Check className="w-4 h-4 text-emerald-500" />
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Mobile Contact</p>
                        <p className="text-sm font-medium text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-100">{userData?.mobileNumber || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
      <StudentQrPassModal isOpen={isQrModalOpen} onClose={() => setIsQrModalOpen(false)} user={user as any} userData={userData} roleLabel={roleBadge.label} />
    </>
  );
}
