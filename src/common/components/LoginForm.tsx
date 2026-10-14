import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, User, Phone, Key, CheckCircle, AlertCircle, ArrowRight, X, GraduationCap, BookOpen, Sparkles } from 'lucide-react';
import { Button } from '@/common/components/ui/Button';
import { cn } from '@/lib/utils';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, setPersistence, browserLocalPersistence, browserSessionPersistence } from 'firebase/auth';
import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useNavigate } from 'react-router-dom';
import { validateMobileNumber, validateEmail, validatePassword, generateCrhsId } from '@/lib/crhsId';
import { useAuth } from '@/context/AuthContext';
import { useLanguage, LanguageSwitcher } from '@/context/LanguageContext';
import { useSettings } from '@/context/SettingsContext';
import { schoolConfig } from '@/config/schoolConfig';

export function LoginForm() {
  const { t } = useLanguage();
  const { settings } = useSettings();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Login Form State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Student Registration Form State
  const [regData, setRegData] = useState({
    fullName: '',
    courseCategory: 'academic',
    mobileNumber: '',
    email: '',
    password: '',
  });

  // Validation
  const [regErrors, setRegErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

  // Forgot Password Modal State
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotInput, setForgotInput] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);

  const navigate = useNavigate();
  const { refreshUserData } = useAuth();

  const handleRegChange = (field: string, value: string) => {
    setRegData(prev => ({ ...prev, [field]: value }));
    setTouchedFields(prev => ({ ...prev, [field]: true }));
    if (regErrors[field]) {
      setRegErrors(prev => ({ ...prev, [field]: undefined as any }));
    }
  };

  const withAuthRetry = async <T,>(fn: () => Promise<T>, retries = 2, delay = 800): Promise<T> => {
    try {
      return await fn();
    } catch (error: any) {
      if (retries > 0 && (error.code === 'auth/network-request-failed' || error.code === 'auth/internal-error')) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return withAuthRetry(fn, retries - 1, delay * 1.5);
      }
      throw error;
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    let isValid = true;
    const errors: Record<string, string> = {};

    if (!regData.fullName.trim()) {
      errors.fullName = t('auth.error_name_required', 'Full Name is required');
      isValid = false;
    }
    if (!regData.mobileNumber.trim() || !validateMobileNumber(regData.mobileNumber)) {
      errors.mobileNumber = t('auth.error_mobile_invalid', 'Must be a valid 10-digit mobile number');
      isValid = false;
    }
    if (!regData.email.trim() || !validateEmail(regData.email)) {
      errors.email = t('auth.error_email_invalid', 'Valid email is required');
      isValid = false;
    }
    if (!regData.password || !validatePassword(regData.password)) {
      errors.password = t('auth.error_password_length', 'Password must be at least 6 characters');
      isValid = false;
    }

    if (!isValid) {
      setRegErrors(errors);
      setTouchedFields({ fullName: true, mobileNumber: true, email: true, password: true });
      setError(t('auth.fix_errors', 'Please fix the validation errors below.'));
      return;
    }

    setIsLoading(true);

    try {
      const cleanEmail = regData.email.trim().toLowerCase();
      const cleanMobile = regData.mobileNumber.trim().replace(/[\s-]/g, '');
      const studentId = 'SSP-' + generateCrhsId();

      const userCred = await withAuthRetry(() => createUserWithEmailAndPassword(auth, cleanEmail, regData.password));
      const user = userCred.user;

      const userProfile = {
        uid: user.uid,
        role: '__kx_0x4' as const, // Student role
        email: cleanEmail,
        fullName: regData.fullName.trim(),
        name: regData.fullName.trim(),
        mobileNumber: cleanMobile,
        courseCategory: regData.courseCategory,
        crhsId: studentId,
        studentId: studentId,
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'users', user.uid), userProfile);

      setSuccessMessage(t('auth.reg_success', `Registration successful! Your Student ID is ${studentId}. Logging you in...`));

      setTimeout(() => {
        setIsLoading(false);
        refreshUserData();
        navigate('/dashboard');
      }, 1500);

    } catch (err: any) {
      console.error("Student Registration Error:", err);
      let errMsg = t('auth.reg_failed', 'Failed to register. Please try again.');
      if (err.code === 'auth/email-already-in-use') {
        errMsg = t('auth.email_in_use', 'This email is already registered. Please sign in instead.');
      }
      setError(errMsg);
      setIsLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const identifier = loginIdentifier.trim();
      let targetEmail = identifier;

      if (!identifier.includes('@')) {
        const cleanMobile = identifier.replace(/[\s-]/g, '');
        const isMobile = /^[0-9]{10}$/.test(cleanMobile);

        let q;
        if (isMobile) {
          q = query(collection(db, 'users'), where('mobileNumber', '==', cleanMobile));
        } else {
          q = query(collection(db, 'users'), where('crhsId', '==', identifier.toUpperCase()));
        }

        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
          throw new Error(t('auth.account_not_found', 'Account not found. Please check your Mobile Number or Email.'));
        }

        const userDoc = querySnapshot.docs[0].data() as any;
        if (!userDoc.email) {
          throw new Error(t('auth.no_registered_email', 'Account found but email address is missing. Please contact administration.'));
        }
        targetEmail = userDoc.email;
      }

      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      await withAuthRetry(() => signInWithEmailAndPassword(auth, targetEmail, password));

      setSuccessMessage(t('auth.login_success', 'Login successful! Redirecting to portal...'));
      setTimeout(() => {
        navigate('/dashboard');
      }, 800);

    } catch (err: any) {
      console.error("Login Error:", err);
      let errMsg = err.message || t('auth.invalid_credentials', 'Invalid credentials. Please try again.');
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        errMsg = t('auth.incorrect_pwd', 'Incorrect password or account details. Please try again.');
      } else if (err.code === 'auth/user-not-found') {
        errMsg = t('auth.user_not_found', 'No account found with this email.');
      } else if (err.code === 'auth/too-many-requests') {
        errMsg = t('auth.too_many_attempts', 'Too many failed attempts. Please try again later.');
      }
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotInput.trim()) {
      setForgotError(t('auth.enter_email_req', 'Please enter your registered email address.'));
      return;
    }
    setForgotLoading(true);
    setForgotError(null);
    setForgotSuccess(null);

    try {
      await sendPasswordResetEmail(auth, forgotInput.trim());
      setForgotSuccess(t('auth.reset_sent', 'Password reset link sent to your email. Check your inbox.'));
      setTimeout(() => {
        setShowForgotPassword(false);
        setForgotInput('');
        setForgotSuccess(null);
      }, 3000);
    } catch (err: any) {
      console.error("Password reset error:", err);
      if (err.code === 'auth/user-not-found') {
        setForgotError(t('auth.reset_no_user', 'No student account found with this email.'));
      } else if (err.code === 'auth/invalid-email') {
        setForgotError(t('auth.invalid_email_format', 'Please enter a valid email address.'));
      } else {
        setForgotError(t('auth.reset_failed', 'Failed to send reset email. Please try again.'));
      }
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="bg-white rounded-2xl shadow-xl border-2 border-slate-200 overflow-hidden relative">
        {/* Top Gold & Navy Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-crhs-navy via-amber-400 to-crhs-navy"></div>

        {/* Card Header with Brand & Language Switcher */}
        <div className="bg-slate-900 text-white p-6 sm:p-8 relative">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-amber-500/20 text-amber-400 rounded-lg border border-amber-400/30">
                <GraduationCap className="w-6 h-6" />
              </span>
              <div>
                <h1 className="text-lg sm:text-xl font-black text-amber-400 tracking-tight uppercase">
                  {schoolConfig.schoolName}
                </h1>
                <p className="text-[11px] text-slate-300 font-medium">
                  {t('hero.badge_online', 'Online & Offline Student Portal')}
                </p>
              </div>
            </div>

            {/* In-Card Language Switcher */}
            <LanguageSwitcher variant="compact" className="shrink-0" />
          </div>

          <div className="border-t border-slate-800 pt-3 flex items-center justify-between text-xs text-slate-300 font-semibold">
            <span className="flex items-center gap-1.5 text-amber-300">
              <Sparkles className="w-3.5 h-3.5" />
              {isLogin ? t('auth.login_title', 'User & Student Login') : t('auth.reg_title', 'New Student Registration')}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {isLogin ? 'STUDENT PORTAL' : 'STUDENT SIGNUP'}
            </span>
          </div>
        </div>

        {isLogin ? (
          /* LOGIN FORM */
          <div className="p-6 sm:p-10">
            <div className="text-center mb-6">
              <h2 className="text-xl sm:text-2xl font-black text-crhs-navy tracking-tight uppercase">
                {t('auth.login_title', 'User & Student Login')}
              </h2>
              <p className="text-xs sm:text-sm text-slate-700 font-bold mt-1">
                {t('auth.login_subtitle', 'Access Suryoday Study Point Student Portal, Live Classes & Notes')}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-3.5 bg-red-50 border-2 border-red-300 text-red-900 rounded-xl flex items-start gap-3 animate-fade-in text-xs sm:text-sm font-black">
                <AlertCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
                <p className="leading-relaxed">{error}</p>
              </div>
            )}

            {successMessage && (
              <div className="mb-6 p-3.5 bg-emerald-50 border-2 border-emerald-300 text-emerald-950 rounded-xl flex items-start gap-3 animate-fade-in text-xs sm:text-sm font-black">
                <CheckCircle className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
                <p className="leading-relaxed">{successMessage}</p>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4 sm:space-y-5">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-900 mb-1.5">
                  {t('auth.login_id_label', 'Mobile Number / Email / Student ID')} <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 bg-white border-2 border-slate-300 focus:bg-white focus:border-crhs-navy focus:ring-2 focus:ring-amber-400/40 text-slate-900 text-xs sm:text-sm font-bold rounded-lg placeholder:text-slate-500 transition-all shadow-sm"
                    placeholder={t('auth.login_id_placeholder', 'Enter 10-digit Mobile or Email ID')}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-900 mb-1.5">
                  {t('auth.password_label', 'Password')} <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-3 bg-white border-2 border-slate-300 focus:bg-white focus:border-crhs-navy focus:ring-2 focus:ring-amber-400/40 text-slate-900 text-xs sm:text-sm font-bold rounded-lg placeholder:text-slate-500 transition-all shadow-sm"
                    placeholder={t('auth.password_placeholder', 'Enter your password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900 p-1"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-400 text-crhs-navy focus:ring-crhs-navy cursor-pointer"
                  />
                  <span className="text-xs font-extrabold text-slate-800">
                    {t('auth.remember_me', 'Remember Me')}
                  </span>
                </label>

                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-xs font-black text-crhs-navy hover:text-amber-600 hover:underline transition-colors"
                >
                  {t('auth.forgot_password', 'Lost Password?')}
                </button>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-crhs-navy text-white hover:bg-slate-900 focus:ring-2 focus:ring-amber-400 flex items-center justify-center font-black tracking-wider text-xs sm:text-sm uppercase shadow-lg group rounded-lg"
                >
                  {isLoading ? t('auth.authenticating', 'Authenticating...') : (
                    <>
                      {t('auth.btn_sign_in', 'Sign In to Portal')}
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </div>
            </form>

            <div className="mt-8 text-center border-t-2 border-slate-200 pt-6">
              <p className="text-xs text-slate-700 font-bold mb-3">
                {t('auth.no_account', "Don't have a student account?")}
              </p>
              <Button
                type="button"
                onClick={() => setIsLogin(false)}
                className="w-full h-11 text-xs font-black uppercase tracking-wider text-crhs-navy border-2 border-crhs-navy hover:bg-crhs-navy hover:text-white transition-all shadow-sm rounded-lg flex items-center justify-center gap-2"
              >
                <User className="w-4 h-4" />
                {t('auth.btn_create_account', 'Create New Student Account')}
              </Button>
            </div>

            {/* Quick Contact Links on Login Form */}
            <div className="mt-6 pt-4 border-t border-slate-200 text-center">
              <p className="text-[11px] font-bold text-slate-700 flex flex-wrap justify-center items-center gap-2">
                <span>{t('auth.help_contact', 'Need Help? Call:')}</span>
                <a 
                  href={`tel:${(settings.contactNumber || schoolConfig.contact.phonePrimary).replace(/\s+/g, '')}`}
                  className="text-crhs-navy font-black hover:text-amber-600 hover:underline flex items-center gap-1"
                >
                  <Phone className="w-3 h-3 text-amber-500 shrink-0" />
                  {settings.contactNumber || schoolConfig.contact.phonePrimary}
                </a>
                <span className="text-slate-300">|</span>
                <a 
                  href={`mailto:${settings.contactEmail || schoolConfig.contact.emailPrimary}`}
                  className="text-crhs-navy font-black hover:text-amber-600 hover:underline flex items-center gap-1"
                >
                  <Mail className="w-3 h-3 text-amber-500 shrink-0" />
                  {settings.contactEmail || schoolConfig.contact.emailPrimary}
                </a>
              </p>
            </div>
          </div>
        ) : (
          /* STUDENT REGISTRATION FORM */
          <div className="p-6 sm:p-10">
            <div className="text-center mb-6">
              <h2 className="text-xl sm:text-2xl font-black text-crhs-navy tracking-tight uppercase">
                {t('auth.reg_title', 'New Student Registration')}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                {t('auth.reg_subtitle', 'Create your personal Suryoday Study Point ID')}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start gap-3 animate-fade-in text-xs sm:text-sm font-bold">
                <AlertCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
                <p className="leading-relaxed">{error}</p>
              </div>
            )}

            {successMessage && (
              <div className="mb-6 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-start gap-3 animate-fade-in text-xs sm:text-sm font-bold">
                <CheckCircle className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
                <p className="leading-relaxed">{successMessage}</p>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-4 sm:space-y-5">
              <div className="border-b-2 border-amber-400 pb-2 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-600 shrink-0" />
                <h3 className="text-xs font-black uppercase tracking-wider text-crhs-navy">
                  {t('auth.reg_student_info', 'Student / Candidate Details')}
                </h3>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-900 mb-1">
                  {t('auth.full_name', 'Student Full Name')} <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={regData.fullName}
                    onChange={(e) => handleRegChange('fullName', e.target.value)}
                    className={cn(
                      "block w-full pl-10 pr-3 py-2.5 border-2 rounded-lg text-xs sm:text-sm text-slate-900 font-bold focus:bg-white focus:border-crhs-navy focus:ring-2 focus:ring-amber-400/40 placeholder:text-slate-500 transition-all",
                      regErrors.fullName && touchedFields.fullName ? "border-red-500 bg-red-50/50" : "border-slate-300 bg-white"
                    )}
                    placeholder={t('auth.full_name_placeholder', 'e.g. Rahul Kumar')}
                  />
                </div>
                {regErrors.fullName && touchedFields.fullName && (
                  <p className="text-[11px] font-bold text-red-600 mt-1">{regErrors.fullName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-900 mb-1">
                  {t('auth.select_course', 'Course / Stream Category')}
                </label>
                <select
                  value={regData.courseCategory}
                  onChange={(e) => handleRegChange('courseCategory', e.target.value)}
                  className="block w-full px-3 py-2.5 bg-white border-2 border-slate-300 text-slate-900 rounded-lg text-xs sm:text-sm font-bold focus:bg-white focus:border-crhs-navy focus:ring-2 focus:ring-amber-400/40 transition-all"
                >
                  <option value="academic">{t('auth.course_academic', 'School Academic (Class 6th to 12th)')}</option>
                  <option value="competition">{t('auth.course_competition', 'Suryoday Competition Classes (SSC/Police/Railway)')}</option>
                  <option value="computer">{t('auth.course_computer', 'Suryoday Computer Classes (CCC/ADCA/Tally)')}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-900 mb-1">
                  {t('auth.mobile_number', 'Mobile Number (10 Digits)')} <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={regData.mobileNumber}
                    onChange={(e) => handleRegChange('mobileNumber', e.target.value.replace(/\D/g, ''))}
                    className={cn(
                      "block w-full pl-10 pr-3 py-2.5 border-2 rounded-lg text-xs sm:text-sm text-slate-900 font-bold focus:bg-white focus:border-crhs-navy focus:ring-2 focus:ring-amber-400/40 placeholder:text-slate-500 transition-all",
                      regErrors.mobileNumber && touchedFields.mobileNumber ? "border-red-500 bg-red-50/50" : "border-slate-300 bg-white"
                    )}
                    placeholder={t('auth.mobile_placeholder', 'e.g. 9876543210')}
                  />
                </div>
                {regErrors.mobileNumber && touchedFields.mobileNumber && (
                  <p className="text-[11px] font-bold text-red-600 mt-1">{regErrors.mobileNumber}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-900 mb-1">
                  {t('auth.email_address', 'Email Address')} <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={regData.email}
                    onChange={(e) => handleRegChange('email', e.target.value)}
                    className={cn(
                      "block w-full pl-10 pr-3 py-2.5 border-2 rounded-lg text-xs sm:text-sm text-slate-900 font-bold focus:bg-white focus:border-crhs-navy focus:ring-2 focus:ring-amber-400/40 placeholder:text-slate-500 transition-all",
                      regErrors.email && touchedFields.email ? "border-red-500 bg-red-50/50" : "border-slate-300 bg-white"
                    )}
                    placeholder={t('auth.email_placeholder', 'e.g. student@example.com')}
                  />
                </div>
                {regErrors.email && touchedFields.email && (
                  <p className="text-[11px] font-bold text-red-600 mt-1">{regErrors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-900 mb-1">
                  {t('auth.create_password', 'Create Password')} <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={regData.password}
                    onChange={(e) => handleRegChange('password', e.target.value)}
                    className={cn(
                      "block w-full pl-10 pr-10 py-2.5 border-2 rounded-lg text-xs sm:text-sm text-slate-900 font-bold focus:bg-white focus:border-crhs-navy focus:ring-2 focus:ring-amber-400/40 placeholder:text-slate-500 transition-all",
                      regErrors.password && touchedFields.password ? "border-red-500 bg-red-50/50" : "border-slate-300 bg-white"
                    )}
                    placeholder={t('auth.password_min_placeholder', 'Min. 6 characters')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900 p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {regErrors.password && touchedFields.password && (
                  <p className="text-[11px] font-bold text-red-600 mt-1">{regErrors.password}</p>
                )}
              </div>

              <div className="pt-3 space-y-3">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-crhs-navy text-white hover:bg-slate-800 flex items-center justify-center font-black tracking-wider text-xs sm:text-sm uppercase shadow-lg rounded-lg"
                >
                  {isLoading ? t('auth.creating_account', 'Creating Student Account...') : t('auth.btn_register', 'Register Student Account')}
                </Button>
                <Button
                  type="button"
                  onClick={() => setIsLogin(true)}
                  className="w-full h-11 text-xs font-black uppercase tracking-wider text-crhs-navy border-2 border-crhs-navy hover:bg-crhs-navy hover:text-white transition-all shadow-sm rounded-lg"
                >
                  {t('auth.btn_back_login', 'Back to Sign In')}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* FORGOT PASSWORD MODAL */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative border-2 border-crhs-navy animate-fade-in">
            <button
              onClick={() => setShowForgotPassword(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-crhs-navy rounded-full flex items-center justify-center mx-auto mb-3 text-amber-400">
                <Key className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-crhs-navy uppercase tracking-tight">
                {t('auth.reset_title', 'Reset Password')}
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-2">
                {t('auth.reset_sub', 'Enter your registered email address and we will send you a reset link.')}
              </p>
            </div>

            {forgotError && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs font-bold rounded-lg border border-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {forgotError}
              </div>
            )}
            {forgotSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                {forgotSuccess}
              </div>
            )}

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 mb-1">
                  {t('auth.reset_email_label', 'Email Address')}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={forgotInput}
                    onChange={(e) => setForgotInput(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border-2 border-slate-200 focus:bg-white text-xs sm:text-sm font-bold rounded-lg"
                    placeholder={t('auth.reset_email_placeholder', 'Enter email address')}
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForgotPassword(false)}
                  className="flex-1 text-xs font-bold h-11"
                >
                  {t('auth.cancel', 'Cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={forgotLoading}
                  className="flex-1 bg-crhs-navy text-white hover:bg-slate-800 text-xs uppercase font-black h-11"
                >
                  {forgotLoading ? '...' : t('auth.send_reset_link', 'Send Reset Link')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
