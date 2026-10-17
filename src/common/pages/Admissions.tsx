import React, { useState, useEffect } from 'react';
import { AdmissionForm } from '@/common/components/AdmissionForm';
import { ScrollReveal } from '@/common/components/ui/ScrollReveal';
import { SEO } from '@/common/components/ui/SEO';
import { Card, CardContent } from '@/common/components/ui/Card';
import { Button } from '@/common/components/ui/Button';
import { 
  Check, 
  AlertCircle, 
  FileText, 
  Info, 
  CalendarX, 
  Lock, 
  Sparkles, 
  BookOpen, 
  ArrowRight,
  Phone,
  GraduationCap,
  Award,
  Video,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdmission } from '@/context/AdmissionContext';
import { useAuth } from '@/context/AuthContext';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { schoolConfig } from '@/config/schoolConfig';
import { useLanguage } from '@/context/LanguageContext';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CourseItem } from '@/types';

export function Admissions() {
  const { t, language } = useLanguage();
  const [hasAgreed, setHasAgreed] = useState(false);
  const [isCheckboxChecked, setIsCheckboxChecked] = useState(false);
  const { activeCampaign } = useAdmission();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const targetCourseId = searchParams.get('courseId');

  // Real-time courses list from Firebase
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'courses'),
      (snapshot) => {
        const list: CourseItem[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() } as CourseItem);
        });
        setCourses(list);
        setLoadingCourses(false);
      },
      (err) => {
        console.error('Error fetching courses on admissions page:', err);
        setCourses([]);
        setLoadingCourses(false);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [hasAgreed]);

  // Determine course-specific context if courseId was passed in URL
  const targetCourse = targetCourseId ? courses.find(c => c.id === targetCourseId) : null;
  const isCourseLinkExpired = Boolean(targetCourseId && !loadingCourses && !targetCourse);

  // Online admissions are OPEN by default for Suryoday coaching and computer batches
  // unless an active campaign in Firebase is explicitly set to false with closed status
  const isAdmissionAllowed = activeCampaign ? activeCampaign.isActive : true;

  // Header Title & Description
  const pageTitle = targetCourse 
    ? `${language === 'hi' ? 'प्रवेश आवेदन' : 'Application'}: ${targetCourse.title}`
    : (activeCampaign?.title || (language === 'hi' ? 'ऑनलाइन प्रवेश फॉर्म' : 'Online Admission Form'));

  const pageSubtitle = targetCourse
    ? `${targetCourse.target || ''} • ${targetCourse.academicSession || 'Session 2026-27'}`
    : (activeCampaign?.description || (language === 'hi' 
        ? 'सत्र 2026-27 के लिए स्कूली शिक्षा (कक्षा 6वीं से 12वीं), प्रतियोगी परीक्षा एवं कंप्यूटर कोर्सेज में प्रवेश प्रारंभ हैं।' 
        : 'Admissions are open for academic session 2026-27: Class 6th to 12th, Competitive Exams & Computer Courses.'));

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800">
      <SEO 
        title={targetCourse ? `Apply: ${targetCourse.title}` : "Online Admissions | Suryoday Study Point"} 
        description={`Apply for admission at ${schoolConfig.schoolName} (${schoolConfig.schoolAbbreviation}), ${schoolConfig.location.address}.`}
        keywords={`${schoolConfig.schoolShortName} admissions, school admission form, apply online coaching`}
      />
      
      {/* Header Banner - Sleek, Theme-Consistent & Mobile-Optimized */}
      <div className="bg-crhs-navy text-white py-10 sm:py-16 md:py-20 relative overflow-hidden border-b-4 border-amber-500">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-72 sm:w-96 h-72 sm:h-96 bg-amber-500/15 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-72 sm:w-96 h-72 sm:h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          {/* Top Badge with Blur Reveal */}
          <ScrollReveal direction="up" delay={0.05} blur={10}>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30 mb-3 sm:mb-4">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>
                {targetCourse 
                  ? (language === 'hi' ? 'चयनित बैच में प्रवेश' : 'Selected Batch Application') 
                  : (language === 'hi' ? 'सत्र 2026-27 प्रवेश प्रारंभ' : 'Session 2026-27 Admissions Open')}
              </span>
            </div>
          </ScrollReveal>

          {/* Heading with Blur Reveal */}
          <ScrollReveal direction="up" delay={0.12} blur={10}>
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-black uppercase tracking-wider mb-3 sm:mb-4 text-white leading-tight">
              {pageTitle}
            </h1>
          </ScrollReveal>

          {/* Subtitle with Blur Reveal */}
          <ScrollReveal direction="up" delay={0.18} blur={8}>
            <p className="text-xs sm:text-sm md:text-base text-slate-300 max-w-2xl mx-auto font-normal sm:font-medium leading-relaxed px-2">
              {pageSubtitle}
            </p>
          </ScrollReveal>

          {/* Quick Category Chips for Mobile */}
          <ScrollReveal direction="up" delay={0.24} blur={8}>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-[11px] sm:text-xs">
              <span className="bg-white/10 backdrop-blur-xs text-amber-300 px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5 font-medium">
                <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                {language === 'hi' ? '6वीं-12वीं शाम के बैच' : 'Class 6th-12th'}
              </span>
              <span className="bg-white/10 backdrop-blur-xs text-slate-200 px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5 font-medium">
                <Award className="w-3.5 h-3.5 text-emerald-400" />
                {language === 'hi' ? 'प्रतियोगी परीक्षा' : 'Competition'}
              </span>
              <span className="bg-white/10 backdrop-blur-xs text-slate-200 px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5 font-medium">
                <Video className="w-3.5 h-3.5 text-purple-400" />
                {language === 'hi' ? 'लाइव + क्लासरूम' : 'Online & Offline'}
              </span>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Main Container */}
      <div className="py-6 sm:py-10 md:py-14 max-w-5xl mx-auto px-3.5 sm:px-6 lg:px-8">
        
        {/* Expired Course Link Notice (Graceful, Never a Dead-End) */}
        {isCourseLinkExpired && (
          <ScrollReveal direction="up" blur={8}>
            <div className="mb-6 p-3.5 sm:p-4 bg-amber-50 border border-amber-300/80 rounded-xl flex items-start gap-3 shadow-2xs">
              <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-amber-900 leading-snug">
                <p className="font-bold">
                  {language === 'hi' 
                    ? 'लिंक किया गया विशिष्ट बैच उपलब्ध नहीं है या अपडेट हो गया है।' 
                    : 'The specific batch link you followed is no longer active or was updated.'}
                </p>
                <p className="text-amber-800 text-[11px] sm:text-xs mt-0.5">
                  {language === 'hi'
                    ? 'चिंता न करें! आप नीचे दिए गए फॉर्म में सीधे उपलब्ध कोर्स (जैसे 6वीं-12वीं, कॉम्पिटिशन, कंप्यूटर) चुनकर अपना ऑनलाइन आवेदन पूर्ण कर सकते हैं।'
                    : 'No worries! You can select any active course or class directly in the application form below to complete your admission.'}
                </p>
              </div>
            </div>
          </ScrollReveal>
        )}

        {loadingCourses ? (
          <ScrollReveal direction="up" blur={8}>
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 shadow-xs max-w-xl mx-auto">
              <div className="w-9 h-9 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {language === 'hi' ? 'प्रवेश पोर्टल लोड हो रहा है...' : 'Verifying admission portal...'}
              </p>
            </div>
          </ScrollReveal>
        ) : !isAdmissionAllowed ? (
          /* When Admissions are explicitly closed by Administration campaign */
          <ScrollReveal direction="up" blur={8}>
            <div className="max-w-2xl mx-auto">
              <Card className="border border-slate-200 shadow-xs overflow-hidden bg-white rounded-2xl border-t-4 border-t-amber-500">
                <CardContent className="p-6 sm:p-10 text-center flex flex-col items-center">
                  <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mb-4 border border-amber-200/60">
                    <CalendarX className="w-7 h-7 text-amber-600" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-crhs-navy uppercase tracking-wider mb-2">
                    {language === 'hi' ? 'प्रवेश वर्तमान में बंद हैं' : 'Admissions Closed'}
                  </h2>
                  <p className="text-slate-600 font-medium text-xs sm:text-sm max-w-md mb-6 leading-relaxed">
                    {activeCampaign?.description || (language === 'hi' 
                      ? 'वर्तमान में ऑनलाइन प्रवेश प्रक्रिया बंद है। आगामी बैच की जानकारी हेतु हमारे केंद्र से संपर्क करें।' 
                      : 'The online admission process is temporarily closed. Please check back later or contact our counseling desk.')}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto">
                    <Link to="/academics" className="w-full sm:w-auto">
                      <Button variant="outline" size="sm" className="w-full rounded-full text-xs font-bold">
                        {language === 'hi' ? 'कोर्सेज देखें' : 'View Courses'}
                      </Button>
                    </Link>
                    <a href={`tel:${schoolConfig.contact.phonePrimary}`} className="w-full sm:w-auto">
                      <Button size="sm" className="w-full rounded-full bg-crhs-navy text-white text-xs font-bold flex items-center justify-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-amber-400" />
                        <span>{language === 'hi' ? 'हेल्पलाइन पर कॉल करें' : 'Call Helpline'}</span>
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollReveal>
        ) : !user ? (
          /* Authentication Required - Sleek, Mobile-Friendly with Blur Reveal */
          <ScrollReveal direction="up" blur={8}>
            <div className="max-w-2xl mx-auto">
              <Card className="border border-slate-200 shadow-xs overflow-hidden bg-white rounded-2xl border-t-4 border-t-crhs-navy">
                <CardContent className="p-6 sm:p-10 text-center flex flex-col items-center">
                  <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 border border-blue-200/60">
                    <Lock className="w-7 h-7 text-crhs-navy" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-crhs-navy uppercase tracking-wider mb-2">
                    {language === 'hi' ? 'छात्र खाता आवश्यक है' : 'Student Account Required'}
                  </h2>
                  <p className="text-slate-600 font-medium text-xs sm:text-sm max-w-md mb-6 leading-relaxed">
                    {language === 'hi' 
                      ? 'ऑनलाइन प्रवेश फॉर्म भरने, आवेदन की स्थिति ट्रैक करने एवं स्टूडेंट आईडी कार्ड प्राप्त करने के लिए कृपया अपने खाते में लॉगिन करें या 1 मिनट में नया छात्र खाता बनाएं।' 
                      : 'To submit your admission form, track application status, and receive your Student ID, please sign in or create a new student account in 1 minute.'}
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto justify-center">
                    <Link 
                      to={`/login?redirect=${encodeURIComponent(targetCourseId ? `/admissions?courseId=${targetCourseId}` : '/admissions')}`}
                      className="w-full sm:w-auto"
                    >
                      <Button size="md" className="w-full rounded-full bg-crhs-navy hover:bg-slate-900 text-white font-black text-xs uppercase tracking-wider px-6 py-2.5 shadow-xs flex items-center justify-center gap-2">
                        <span>{language === 'hi' ? 'साइन इन या नया छात्र खाता बनाएं' : 'Sign In / Register'}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                      </Button>
                    </Link>
                    <a 
                      href={`tel:${schoolConfig.contact.phonePrimary}`}
                      className="w-full sm:w-auto"
                    >
                      <Button variant="outline" size="md" className="w-full rounded-full text-xs font-bold flex items-center justify-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-amber-600" />
                        <span>{language === 'hi' ? 'हेल्पलाइन सहायता' : 'Admission Helpline'}</span>
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollReveal>
        ) : (
          /* User is logged in: Instructions & Admission Form */
          <AnimatePresence mode="wait">
            {!hasAgreed ? (
              <motion.div 
                key="instructions"
                initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -20, filter: 'blur(8px)' }}
                transition={{ duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
                className="max-w-3xl mx-auto"
              >
                <Card className="border border-slate-200/80 shadow-xs bg-white rounded-2xl overflow-hidden border-t-4 border-t-crhs-navy">
                  <CardContent className="p-4 sm:p-7 md:p-8">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0 border border-blue-100">
                        <Info className="w-5 h-5 text-crhs-navy" />
                      </div>
                      <div>
                        <h2 className="text-base sm:text-xl font-black text-crhs-navy uppercase tracking-wide">
                          {targetCourse 
                            ? `${targetCourse.title} - ${language === 'hi' ? 'प्रवेश निर्देश' : 'Application Guide'}` 
                            : (language === 'hi' ? 'प्रवेश नियम एवं निर्देश' : 'Admission Criteria & Instructions')}
                        </h2>
                        <p className="text-slate-500 font-medium text-xs mt-0.5">
                          {language === 'hi' ? 'कृपया फॉर्म भरने से पहले निर्देशों को ध्यान से पढ़ें' : 'Please review instructions before opening application form'}
                        </p>
                      </div>
                    </div>

                    {/* Target Course Highlight Box if selected */}
                    {targetCourse && (
                      <div className="mb-5 p-3.5 sm:p-4 bg-amber-50 border border-amber-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded">
                            {language === 'hi' ? 'चयनित बैच' : 'Targeted Batch'}
                          </span>
                          <h3 className="text-sm sm:text-base font-black text-crhs-navy mt-1">{targetCourse.title}</h3>
                          <p className="text-xs text-slate-600 font-medium">{targetCourse.target}</p>
                        </div>
                        <span className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 rounded-full shrink-0 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>{language === 'hi' ? 'प्रवेश चालू' : 'Admission Open'}</span>
                        </span>
                      </div>
                    )}

                    <div className="space-y-4 text-slate-700 leading-relaxed text-xs sm:text-sm">
                      <p className="text-justify sm:text-left">
                        {language === 'hi'
                          ? `सूर्योदय स्टडी प्वाइंट (${schoolConfig.location.address}) में शैक्षणिक सत्र 2026-27 के लिए ऑनलाइन आवेदन स्वीकार किए जा रहे हैं। फॉर्म जमा होने के बाद आपको अपनी स्टूडेंट आईडी (SSP ID) प्राप्त होगी।`
                          : `Online applications are active at Suryoday Study Point (${schoolConfig.location.address}) for session 2026-27. Upon submission, you will receive your Student ID (SSP ID).`}
                      </p>

                      <div className="bg-slate-50 border border-slate-200/80 p-4 sm:p-5 rounded-xl">
                        <h3 className="text-xs sm:text-sm font-bold text-crhs-navy uppercase tracking-wider mb-3 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-amber-500" />
                          <span>{language === 'hi' ? 'फॉर्म भरने हेतु आवश्यक विवरण:' : 'Documents / Info to Keep Ready:'}</span>
                        </h3>
                        <ul className="space-y-2 text-xs">
                          {[
                            language === 'hi' ? 'अभ्यर्थी का 12-अंकों का आधार कार्ड नंबर' : "Candidate's 12-digit Aadhaar Card Number",
                            language === 'hi' ? 'पिछली कक्षा / स्कूल की अंकतालिका विवरण' : 'Previous School / Class Marksheet details',
                            language === 'hi' ? 'अभिभावक का चालू मोबाइल नंबर (SMS एवं बैच अपडेट हेतु)' : 'Active Guardian Mobile Number for SMS & updates',
                            language === 'hi' ? 'पासपोर्ट साइज फोटो एवं श्रेणी (General/OBC/SC/ST)' : 'Passport size photo & student category'
                          ].map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Terms Checkbox and Proceed Button */}
                    <div className="mt-6 pt-5 border-t border-slate-100">
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 mt-0.5 accent-crhs-navy cursor-pointer"
                          checked={isCheckboxChecked}
                          onChange={(e) => setIsCheckboxChecked(e.target.checked)}
                        />
                        <span className="text-xs sm:text-sm text-slate-700 font-semibold select-none group-hover:text-slate-900 transition-colors">
                          {language === 'hi' 
                            ? 'मैंने प्रवेश संबंधी नियम पढ़ लिए हैं और सभी विवरण सही व सत्य भरने की सहमति देता/देती हूँ।' 
                            : 'I have read and understood the admission criteria and agree to submit accurate details.'}
                        </span>
                      </label>
                      
                      <div className="mt-5 flex justify-end">
                        <Button 
                          size="md" 
                          variant="primary"
                          disabled={!isCheckboxChecked}
                          onClick={() => setHasAgreed(true)}
                          className="w-full sm:w-auto text-xs uppercase font-black tracking-wider rounded-full bg-amber-500 hover:bg-amber-600 text-crhs-navy px-6 py-2.5 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          <span>{language === 'hi' ? 'आवेदन फॉर्म भरें' : 'Proceed to Application Form'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              /* The Live Admission Form */
              <motion.div 
                key="form"
                initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -20, filter: 'blur(8px)' }}
                transition={{ duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
                className="max-w-4xl mx-auto"
              >
                <div className="mb-4 sm:mb-6 flex flex-wrap justify-between items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setHasAgreed(false)}
                    className="text-slate-600 font-bold hover:text-crhs-navy text-xs rounded-full"
                  >
                    ← {language === 'hi' ? 'निर्देश पुनः देखें' : 'Back to Instructions'}
                  </Button>

                  {targetCourse && (
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                      {language === 'hi' ? 'चयनित बैच:' : 'Applying for:'} <strong>{targetCourse.title}</strong>
                    </span>
                  )}
                </div>
                
                <AdmissionForm 
                  targetCourse={targetCourse} 
                  openCourses={courses.filter(c => c.isAdmissionOpen)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
