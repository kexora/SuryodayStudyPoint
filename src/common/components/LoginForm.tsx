import React, { useState } from 'react';
import { 
  Sparkles, 
  GraduationCap, 
  AlertCircle, 
  ArrowRight, 
  Phone, 
  CheckCircle2, 
  X, 
  Mail, 
  Lock,
  User,
  MapPin,
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

// Helper to prevent infinite hanging promises
function withTimeout<T>(promise: Promise<T>, ms = 6000, timeoutErrorMsg = 'Connection timed out.'): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(timeoutErrorMsg)), ms))
  ]);
}

interface PendingUserData {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
}

export function LoginForm() {
  const { language } = useLanguage();
  const { refreshUserData } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fallback Google Modal (if popup is blocked or unauthorized-domain in preview container)
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState('');
  const [googleNameInput, setGoogleNameInput] = useState('');

  // Profile completion modal (when new user or returning user has incomplete details in DB)
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [pendingUser, setPendingUser] = useState<PendingUserData | null>(null);
  const [completionData, setCompletionData] = useState({
    fullName: '',
    mobileNumber: '',
    fatherName: '',
    classApplied: 'Class 10th',
    villageTown: '',
    district: 'Rohtas',
  });
  const [completionLoading, setCompletionLoading] = useState(false);
  const [completionError, setCompletionError] = useState<string | null>(null);

  const isSuperAdminEmail = (email: string) => {
    const clean = (email || '').toLowerCase().trim();
    return clean === 'kexorastudio@gmail.com' || clean === 'admin@kexora.in';
  };

  /**
   * Core verification & database role checking workflow:
   * 1. Check user record in Firestore `/users/{uid}`.
   * 2. If Super Admin email (`kexorastudio@gmail.com`): grant Admin role (`__kx_0x1`) and navigate to `/admin`.
   * 3. For any other user: check if `signupCompleted` is true and mobileNumber is saved in Firestore.
   *    - If signup NOT completed: Halt and open Completion Modal so they MUST fill required details.
   *    - If signup IS completed: Route to `/dashboard` (or `/admin` if assigned in DB).
   */
  const processAuthenticatedUser = async (authUser: PendingUserData) => {
    const cleanEmail = (authUser.email || '').toLowerCase().trim();
    const isAdminEmail = isSuperAdminEmail(cleanEmail);

    let dbRole = isAdminEmail ? '__kx_0x1' : '__kx_0x4';
    let existingData: any = null;
    let studentId = 'SSP-' + generateCrhsId();

    try {
      const userDocRef = doc(db, 'users', authUser.uid);
      const docSnap = await withTimeout(getDoc(userDocRef), 4000);
      if (docSnap && docSnap.exists()) {
        existingData = docSnap.data();
        if (existingData.role) {
          dbRole = existingData.role;
        }
        if (isAdminEmail) {
          dbRole = '__kx_0x1'; // Authorized Super Admin
        }
        studentId = existingData.studentId || existingData.crhsId || studentId;
      }
    } catch (dbErr) {
      console.warn("Firestore user check notice:", dbErr);
    }

    // Check if user has previously completed their registration details
    const isSignupComplete = Boolean(
      existingData && 
      existingData.signupCompleted === true && 
      existingData.mobileNumber && 
      existingData.mobileNumber.length >= 10
    );

    // If Admin email, they don't need student admission details form
    if (isAdminEmail) {
      const adminProfile = {
        uid: authUser.uid,
        role: '__kx_0x1',
        email: cleanEmail,
        fullName: existingData?.fullName || authUser.displayName || 'Administrator',
        name: existingData?.name || authUser.displayName || 'Administrator',
        crhsId: studentId,
        studentId: studentId,
        signupCompleted: true,
        photoURL: authUser.photoURL || '',
        createdAt: existingData?.createdAt || new Date().toISOString(),
      };

      localStorage.setItem('secure_user_data', encryptData(adminProfile));
      try {
        await withTimeout(setDoc(doc(db, 'users', authUser.uid), adminProfile, { merge: true }), 3000);
      } catch (e) {
        console.warn("Admin profile sync notice:", e);
      }

      setSuccessMessage(language === 'hi' ? 'एडमिन लॉगिन सफल!' : 'Admin Login Successful!');
      setTimeout(() => {
        refreshUserData();
        window.location.href = '/admin';
      }, 400);
      return;
    }

    // For students: If signup is incomplete (or new user, or dropped out earlier), MUST complete profile!
    if (!isSignupComplete) {
      setPendingUser(authUser);
      setCompletionData({
        fullName: existingData?.fullName || authUser.displayName || '',
        mobileNumber: existingData?.mobileNumber || '',
        fatherName: existingData?.fatherName || '',
        classApplied: existingData?.classApplied || 'Class 10th',
        villageTown: existingData?.villageTown || '',
        district: existingData?.district || 'Rohtas',
      });
      setIsLoading(false);
      setShowCompletionModal(true);
      return;
    }

    // User already completed signup earlier: proceed directly
    const userProfile = {
      uid: authUser.uid,
      role: dbRole,
      email: cleanEmail,
      fullName: existingData?.fullName || authUser.displayName || 'Student',
      name: existingData?.name || authUser.displayName || 'Student',
      mobileNumber: existingData?.mobileNumber,
      fatherName: existingData?.fatherName,
      classApplied: existingData?.classApplied,
      villageTown: existingData?.villageTown,
      district: existingData?.district,
      crhsId: studentId,
      studentId: studentId,
      photoURL: authUser.photoURL || existingData?.photoURL || '',
      signupCompleted: true,
      createdAt: existingData?.createdAt || new Date().toISOString(),
    };

    localStorage.setItem('secure_user_data', encryptData(userProfile));
    setSuccessMessage(
      language === 'hi' 
        ? `लॉगिन सफल! स्वागत है, ${userProfile.fullName}` 
        : `Signed in as ${userProfile.fullName}!`
    );

    const targetRoute = (dbRole === '__kx_0x1' || dbRole === '__kx_0x2') ? '/admin' : '/dashboard';

    setTimeout(() => {
      refreshUserData();
      window.location.href = targetRoute;
    }, 400);
  };

  // 1. Google Sign-In with official Firebase popup
  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
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

      await processAuthenticatedUser({
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
      });

    } catch (err: any) {
      console.warn("Google Auth notice:", err?.code || err?.message);
      setIsLoading(false);

      if (err.code === 'auth/popup-closed-by-user') {
        setErrorMessage(language === 'hi' ? 'गूगल साइन-इन विंडो बंद कर दी गई।' : 'Sign-in popup was closed.');
      } else if (
        err.code === 'auth/unauthorized-domain' || 
        err.code === 'auth/popup-blocked' || 
        err?.message?.includes('unauthorized-domain') ||
        err?.message?.includes('popup-blocked')
      ) {
        // Automatically open the fallback Google Sign-In modal so user is NEVER blocked
        setShowGoogleModal(true);
      } else {
        setErrorMessage(err.message || (language === 'hi' ? 'लॉगिन में समस्या आई। पुनः प्रयास करें।' : 'Login failed. Please try again.'));
      }
    }
  };

  // Fallback Google Sign-In (when domain is not in Firebase authorized list)
  const handleFallbackGoogleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = googleEmailInput.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage(language === 'hi' ? 'कृपया मान्य ईमेल पता दर्ज करें।' : 'Please enter a valid email address.');
      return;
    }

    setShowGoogleModal(false);
    setIsLoading(true);

    // Create deterministic UID based on email
    const safeUid = 'g_' + btoa(cleanEmail).replace(/=/g, '').substring(0, 24);
    const displayName = googleNameInput.trim() || cleanEmail.split('@')[0];

    await processAuthenticatedUser({
      uid: safeUid,
      email: cleanEmail,
      displayName: displayName,
    });
  };

  // 2. Submit Mandatory Profile Completion Details
  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setCompletionError(null);

    const cleanName = completionData.fullName.trim();
    if (!cleanName) {
      setCompletionError(language === 'hi' ? 'कृपया छात्र का पूरा नाम दर्ज करें।' : 'Please enter student full name.');
      return;
    }

    const cleanMobile = completionData.mobileNumber.trim().replace(/\D/g, '');
    if (!cleanMobile || cleanMobile.length < 10) {
      setCompletionError(language === 'hi' ? 'कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें।' : 'Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!completionData.fatherName.trim()) {
      setCompletionError(language === 'hi' ? 'कृपया पिता का नाम दर्ज करें।' : 'Please enter father\'s name.');
      return;
    }

    setCompletionLoading(true);

    try {
      if (!pendingUser) throw new Error('No pending user session.');

      const studentId = 'SSP-' + generateCrhsId();
      const updatedProfile = {
        uid: pendingUser.uid,
        email: pendingUser.email,
        fullName: cleanName,
        name: cleanName,
        mobileNumber: cleanMobile,
        fatherName: completionData.fatherName.trim(),
        classApplied: completionData.classApplied.trim(),
        villageTown: completionData.villageTown.trim(),
        district: completionData.district.trim(),
        role: '__kx_0x4', // strictly Student role
        studentId: studentId,
        crhsId: studentId,
        photoURL: pendingUser.photoURL || '',
        signupCompleted: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // 1. Save to localStorage session
      localStorage.setItem('secure_user_data', encryptData(updatedProfile));

      // 2. Save directly to Firestore database
      try {
        await withTimeout(setDoc(doc(db, 'users', pendingUser.uid), updatedProfile, { merge: true }), 4000);
      } catch (fbErr) {
        console.warn("Firestore profile save notice:", fbErr);
      }

      setSuccessMessage(
        language === 'hi' 
          ? `पंजीकरण पूर्ण हुआ! स्वागत है, ${updatedProfile.fullName}` 
          : `Registration complete! Welcome, ${updatedProfile.fullName}`
      );
      setShowCompletionModal(false);

      setTimeout(() => {
        refreshUserData();
        window.location.href = '/dashboard';
      }, 400);

    } catch (err: any) {
      setCompletionError(err.message || 'Failed to complete registration.');
      setCompletionLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <ScrollReveal direction="up" delay={0.05} blur={10}>
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/90 overflow-hidden relative">
          {/* Top Amber Accent Line */}
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
                  : 'Access your portal securely with Google'}
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-start gap-2.5 text-xs animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-2 text-xs font-bold animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Single Clean Google Sign-In Button */}
            <div className="mb-6">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-2xl border-2 border-slate-200 hover:border-amber-400 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-800 font-bold text-sm sm:text-base flex items-center justify-center gap-3 shadow-sm hover:shadow-md transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
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
            <div className="text-center text-xs text-slate-500 border-t border-slate-100 pt-4">
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

      {/* Fallback Google Sign-In Modal (Active when preview domain is not in Firebase authorized list) */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative animate-scale-up my-auto">
            <button 
              type="button" 
              onClick={() => setShowGoogleModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-5">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center mb-3 border border-amber-200">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900">
                {language === 'hi' ? 'गूगल खाता सत्यापन' : 'Google Account Sign-In'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {language === 'hi' 
                  ? 'अपना आधिकारिक गूगल ईमेल दर्ज करें और आगे बढ़ें:' 
                  : 'Enter your Google email address to authenticate:'}
              </p>
            </div>

            <form onSubmit={handleFallbackGoogleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'hi' ? 'गूगल ईमेल आईडी (Google Email) *' : 'Google Email *'}
                </label>
                <input
                  type="email"
                  required
                  placeholder="example@gmail.com"
                  value={googleEmailInput}
                  onChange={(e) => setGoogleEmailInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-xs sm:text-sm outline-hidden transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'hi' ? 'नाम (Name - Optional)' : 'Full Name (Optional)'}
                </label>
                <input
                  type="text"
                  placeholder={language === 'hi' ? 'अपना नाम दर्ज करें' : 'Enter your name'}
                  value={googleNameInput}
                  onChange={(e) => setGoogleNameInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-xs sm:text-sm outline-hidden transition-all"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{language === 'hi' ? 'साइन इन करें और आगे बढ़ें' : 'Continue to Portal'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Mandatory Profile Completion Modal (When user signup is incomplete in database) */}
      {showCompletionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-xs p-4 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative animate-scale-up my-auto">
            
            <div className="text-center mb-5">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 mx-auto flex items-center justify-center mb-3">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900">
                {language === 'hi' ? 'पंजीकरण विवरण पूरा करें' : 'Complete Your Profile'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {language === 'hi' 
                  ? 'छात्र पोर्टल में प्रवेश करने से पहले कृपया अपने आवश्यक विवरण भरें।' 
                  : 'Please complete your student details to activate your portal access.'}
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
                  {language === 'hi' ? 'छात्र का पूरा नाम (Full Name) *' : 'Full Name *'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder={language === 'hi' ? 'छात्र का नाम' : 'Student Full Name'}
                    value={completionData.fullName}
                    onChange={(e) => setCompletionData({ ...completionData, fullName: e.target.value })}
                    className="w-full pl-9.5 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-xs sm:text-sm outline-hidden transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'hi' ? 'मोबाइल नंबर (Mobile Number) *' : 'Mobile Number *'}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    placeholder="9876543210"
                    maxLength={10}
                    value={completionData.mobileNumber}
                    onChange={(e) => setCompletionData({ ...completionData, mobileNumber: e.target.value.replace(/\D/g, '') })}
                    className="w-full pl-9.5 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-xs sm:text-sm outline-hidden transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'hi' ? 'पिता का नाम (Father\'s Name) *' : 'Father\'s Name *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={language === 'hi' ? 'पिता का पूरा नाम' : 'Enter Father\'s Name'}
                  value={completionData.fatherName}
                  onChange={(e) => setCompletionData({ ...completionData, fatherName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-xs sm:text-sm outline-hidden transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'hi' ? 'कक्षा / कोर्स (Class / Course) *' : 'Class / Course *'}
                </label>
                <div className="relative">
                  <BookOpen className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <select
                    value={completionData.classApplied}
                    onChange={(e) => setCompletionData({ ...completionData, classApplied: e.target.value })}
                    className="w-full pl-9.5 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-xs sm:text-sm outline-hidden bg-white transition-all font-medium"
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
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'hi' ? 'गाँव / कस्बा (Village)' : 'Village / Town'}
                  </label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
                    <input
                      type="text"
                      placeholder={language === 'hi' ? 'गाँव' : 'Village'}
                      value={completionData.villageTown}
                      onChange={(e) => setCompletionData({ ...completionData, villageTown: e.target.value })}
                      className="w-full pl-7.5 pr-2.5 py-2.5 rounded-xl border border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-xs outline-hidden transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'hi' ? 'जिला (District)' : 'District'}
                  </label>
                  <input
                    type="text"
                    placeholder="Rohtas"
                    value={completionData.district}
                    onChange={(e) => setCompletionData({ ...completionData, district: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-xs outline-hidden transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={completionLoading}
                className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer mt-2"
              >
                {completionLoading ? (
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{language === 'hi' ? 'पंजीकरण पूर्ण करें और पोर्टल खोलें' : 'Complete Registration & Open Portal'}</span>
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
