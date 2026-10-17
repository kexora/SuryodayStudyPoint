import React, { useState } from 'react';
import { 
  Sparkles, 
  GraduationCap, 
  AlertCircle, 
  ArrowRight, 
  Lock, 
  Phone, 
  CheckCircle2, 
  X, 
  BookOpen
} from 'lucide-react';
import { 
  GoogleAuthProvider, 
  signInWithPopup 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { generateCrhsId } from '@/lib/crhsId';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { schoolConfig } from '@/config/schoolConfig';
import { encryptData } from '@/lib/encryption';
import { ScrollReveal } from '@/common/components/ui/ScrollReveal';

// Timeout wrapper to ensure async calls never hang
function withTimeout<T>(promise: Promise<T>, ms = 6000, timeoutErrorMsg = 'Connection timed out. Please try again.'): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(timeoutErrorMsg)), ms))
  ]);
}

export function LoginForm() {
  const { language } = useLanguage();
  const { refreshUserData } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [errorDetails, setErrorDetails] = useState<{ title: string; desc: string } | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Profile Completion Modal State (when signup is incomplete or new)
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [pendingUser, setPendingUser] = useState<any>(null);
  const [completionData, setCompletionData] = useState({
    mobileNumber: '',
    fatherName: '',
    classApplied: 'Class 10th',
    villageTown: '',
    district: '',
  });
  const [completionLoading, setCompletionLoading] = useState(false);
  const [completionError, setCompletionError] = useState<string | null>(null);

  const isSuperAdminEmail = (email: string) => {
    const clean = (email || '').toLowerCase().trim();
    return clean === 'kexorastudio@gmail.com' || clean === 'admin@kexora.in';
  };

  // Google Sign-In with Database Role Check & Routing
  const handleGoogleSignIn = async () => {
    setErrorDetails(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });

      const result = await withTimeout(
        signInWithPopup(auth, provider),
        45000,
        language === 'hi' ? 'गूगल लॉगिन में अधिक समय लगा। कृपया पुनः प्रयास करें।' : 'Google sign-in timed out. Please try again.'
      );

      const user = result.user;
      if (!user) throw new Error('No user returned from Google sign-in.');

      const cleanEmail = (user.email || '').toLowerCase().trim();
      const isAdminEmail = isSuperAdminEmail(cleanEmail);

      // Check database (Firestore) for existing user record & role
      let dbRole = isAdminEmail ? '__kx_0x1' : '__kx_0x4';
      let existingData: any = null;
      let studentId = 'SSP-' + generateCrhsId();

      try {
        const userDocRef = doc(db, 'users', user.uid);
        const docSnap = await withTimeout(getDoc(userDocRef), 4000);
        if (docSnap && docSnap.exists()) {
          existingData = docSnap.data();
          if (existingData.role) {
            dbRole = existingData.role;
          }
          if (isAdminEmail) {
            dbRole = '__kx_0x1'; // Force super admin for authorized email
          }
          studentId = existingData.studentId || existingData.crhsId || studentId;
        }
      } catch (dbErr) {
        console.warn("Database role fetch warning:", dbErr);
      }

      const isSignupComplete = Boolean(existingData && existingData.signupCompleted && existingData.mobileNumber);

      const userProfile = {
        uid: user.uid,
        role: dbRole,
        email: cleanEmail,
        fullName: existingData?.fullName || user.displayName || (isAdminEmail ? 'Admin' : 'Student'),
        name: existingData?.name || user.displayName || (isAdminEmail ? 'Admin' : 'Student'),
        mobileNumber: existingData?.mobileNumber || '',
        fatherName: existingData?.fatherName || '',
        classApplied: existingData?.classApplied || '',
        villageTown: existingData?.villageTown || '',
        district: existingData?.district || '',
        crhsId: studentId,
        studentId: studentId,
        photoURL: user.photoURL || '',
        signupCompleted: Boolean(isSignupComplete || isAdminEmail),
        createdAt: existingData?.createdAt || new Date().toISOString(),
      };

      // If signup is incomplete and user is not admin, prompt completion modal
      if (!userProfile.signupCompleted && !isAdminEmail) {
        setPendingUser(userProfile);
        setCompletionData({
          mobileNumber: userProfile.mobileNumber || '',
          fatherName: userProfile.fatherName || '',
          classApplied: userProfile.classApplied || 'Class 10th',
          villageTown: userProfile.villageTown || '',
          district: userProfile.district || '',
        });
        setIsLoading(false);
        setShowCompletionModal(true);
        return;
      }

      // Save encrypted session
      localStorage.setItem('secure_user_data', encryptData(userProfile));

      // Sync to Firestore
      try {
        await withTimeout(setDoc(doc(db, 'users', user.uid), userProfile, { merge: true }), 4000);
      } catch (fbErr) {
        console.warn("Firestore sync warning:", fbErr);
      }

      setSuccessMessage(
        language === 'hi' 
          ? `लॉगिन सफल! स्वागत है, ${userProfile.fullName}` 
          : `Signed in as ${userProfile.fullName}!`
      );

      // Route strictly based on database role
      const targetRoute = (dbRole === '__kx_0x1' || dbRole === '__kx_0x2') ? '/admin' : '/dashboard';

      setTimeout(() => {
        refreshUserData();
        window.location.href = targetRoute;
      }, 500);

    } catch (err: any) {
      console.error("Google Auth Error:", err);
      setIsLoading(false);
      if (err.code === 'auth/popup-closed-by-user') {
        setErrorDetails({
          title: language === 'hi' ? 'गूगल साइन-इन रद्द' : 'Google Sign-In Cancelled',
          desc: language === 'hi' ? 'गूगल लॉगिन विंडो पूरी होने से पहले बंद कर दी गई।' : 'Sign-in popup was closed before completion.'
        });
      } else if (err.code === 'auth/popup-blocked') {
        setErrorDetails({
          title: language === 'hi' ? 'पॉपअप ब्लॉक हुआ' : 'Popup Blocked',
          desc: language === 'hi' ? 'ब्राउज़र ने पॉपअप ब्लॉक कर दिया है। कृपया पॉपअप की अनुमति दें।' : 'Browser blocked the popup window. Please allow popups.'
        });
      } else {
        setErrorDetails({
          title: language === 'hi' ? 'प्रमाणीकरण में त्रुटि' : 'Authentication Error',
          desc: err.message || (language === 'hi' ? 'लॉगिन में समस्या आई। कृपया पुनः प्रयास करें।' : 'Something went wrong. Please try again.')
        });
      }
    }
  };

  // Submit Profile Completion Details
  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setCompletionError(null);

    const cleanMobile = completionData.mobileNumber.trim().replace(/[\s-]/g, '');
    if (!cleanMobile || cleanMobile.length < 10) {
      setCompletionError(language === 'hi' ? 'कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें।' : 'Please enter a valid 10-digit mobile number.');
      return;
    }

    setCompletionLoading(true);

    try {
      const updatedProfile = {
        ...pendingUser,
        mobileNumber: cleanMobile,
        fatherName: completionData.fatherName.trim(),
        classApplied: completionData.classApplied.trim(),
        villageTown: completionData.villageTown.trim(),
        district: completionData.district.trim(),
        signupCompleted: true,
      };

      localStorage.setItem('secure_user_data', encryptData(updatedProfile));

      try {
        await withTimeout(setDoc(doc(db, 'users', updatedProfile.uid), updatedProfile, { merge: true }), 4000);
      } catch (fbErr) {
        console.warn("Firestore sync warning:", fbErr);
      }

      setSuccessMessage(
        language === 'hi' 
          ? `पंजीकरण पूर्ण हुआ! स्वागत है, ${updatedProfile.fullName}` 
          : `Registration complete! Welcome, ${updatedProfile.fullName}`
      );
      setShowCompletionModal(false);

      const targetRoute = (updatedProfile.role === '__kx_0x1' || updatedProfile.role === '__kx_0x2') ? '/admin' : '/dashboard';

      setTimeout(() => {
        refreshUserData();
        window.location.href = targetRoute;
      }, 500);

    } catch (err: any) {
      setCompletionError(err.message || 'Failed to complete registration.');
    } finally {
      setCompletionLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <ScrollReveal direction="up" delay={0.05} blur={10}>
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/90 overflow-hidden relative">
          {/* Top Decorative Amber Line */}
          <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600" />

          <div className="p-6 sm:p-8">
            {/* Institution Badge & Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200 mb-3 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>{language === 'hi' ? 'सत्र 2026-27 • छात्र एवं सदस्य पोर्टल' : 'Session 2026-27 • Student Portal'}</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {language === 'hi' ? 'पोर्टल में साइन इन करें' : 'Sign in to Portal'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                {language === 'hi' 
                  ? 'अपने आधिकारिक गूगल खाते के माध्यम से प्रवेश करें' 
                  : 'Access your student or admin dashboard with Google'}
              </p>
            </div>

            {/* Error Banner */}
            {errorDetails && (
              <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl space-y-1 text-xs animate-fade-in">
                <div className="flex items-center gap-2 font-bold text-rose-900">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorDetails.title}</span>
                </div>
                <p className="text-rose-700 leading-relaxed text-[11px]">
                  {errorDetails.desc}
                </p>
              </div>
            )}

            {/* Success Banner */}
            {successMessage && (
              <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-2 text-xs font-bold animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Clean Google Sign-In Button Only */}
            <div className="space-y-3 mb-6">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-2xl border-2 border-slate-200 hover:border-amber-400 bg-white hover:bg-slate-50/80 active:bg-slate-100 text-slate-800 font-bold text-sm sm:text-base flex items-center justify-center gap-3 shadow-sm hover:shadow-md transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-slate-400 border-t-amber-500 rounded-full animate-spin" />
                ) : (
                  <svg className="w-5 h-5 shrink-0 group-hover:scale-105 transition-transform" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
                <span>
                  {language === 'hi' ? 'गूगल से साइन इन करें (Sign in with Google)' : 'Sign in with Google'}
                </span>
              </button>
            </div>

            {/* Helpline Footer */}
            <div className="mt-6 text-center text-xs text-slate-500 border-t border-slate-100 pt-4">
              <span>{language === 'hi' ? 'सहायता के लिए संपर्क करें: ' : 'Need help signing in? '}</span>
              <a 
                href={`tel:${schoolConfig.contact.phonePrimary.replace(/\s+/g, '')}`} 
                className="font-bold text-amber-700 hover:text-amber-900 inline-flex items-center gap-1"
              >
                <Phone className="w-3 h-3" />
                <span>{schoolConfig.contact.phonePrimary}</span>
              </a>
            </div>

          </div>
        </div>
      </ScrollReveal>

      {/* Profile Completion Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative animate-scale-up my-auto">
            
            <div className="text-center mb-5">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 mx-auto flex items-center justify-center mb-3">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900">
                {language === 'hi' ? 'पंजीकरण पूरा करें' : 'Complete Your Registration'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {language === 'hi' 
                  ? 'कृपया छात्र पोर्टल में प्रवेश करने से पहले अपने आवश्यक विवरण भरें।' 
                  : 'Please provide your essential details to complete your student profile.'}
              </p>
            </div>

            {completionError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{completionError}</span>
              </div>
            )}

            <form onSubmit={handleCompleteRegistration} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'hi' ? 'मोबाइल नंबर (Mobile Number) *' : 'Mobile Number *'}
                </label>
                <input
                  type="tel"
                  required
                  placeholder="9876543210"
                  maxLength={10}
                  value={completionData.mobileNumber}
                  onChange={(e) => setCompletionData({ ...completionData, mobileNumber: e.target.value.replace(/\D/g, '') })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-xs sm:text-sm outline-hidden transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'hi' ? 'पिता का नाम (Father\'s Name)' : 'Father\'s Name'}
                </label>
                <input
                  type="text"
                  placeholder={language === 'hi' ? 'पिता का पूरा नाम' : 'Enter Father\'s Name'}
                  value={completionData.fatherName}
                  onChange={(e) => setCompletionData({ ...completionData, fatherName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-xs sm:text-sm outline-hidden transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'hi' ? 'कक्षा / कोर्स (Class / Course)' : 'Class / Course'}
                </label>
                <select
                  value={completionData.classApplied}
                  onChange={(e) => setCompletionData({ ...completionData, classApplied: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-xs sm:text-sm outline-hidden bg-white transition-all font-medium"
                >
                  <option value="Class 6th">Class 6th (Foundation)</option>
                  <option value="Class 7th">Class 7th (Foundation)</option>
                  <option value="Class 8th">Class 8th (Foundation)</option>
                  <option value="Class 9th">Class 9th (Foundation)</option>
                  <option value="Class 10th">Class 10th (Board Exam)</option>
                  <option value="Class 11th Science">Class 11th Science (PCM/PCB)</option>
                  <option value="Class 12th Science">Class 12th Science (PCM/PCB)</option>
                  <option value="JEE / NEET Target">JEE / NEET Competitive Batch</option>
                  <option value="Computer Course">Computer Course (ADCA/DCA/Tally)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={completionLoading}
                className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {completionLoading ? (
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{language === 'hi' ? 'पंजीकरण पूर्ण करें और आगे बढ़ें' : 'Complete Registration & Continue'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
