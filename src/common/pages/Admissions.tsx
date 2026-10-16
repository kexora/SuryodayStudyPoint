import React, { useState, useEffect } from 'react';
import { SectionHeading } from '@/common/components/ui/SectionHeading';
import { AdmissionForm } from '@/common/components/AdmissionForm';
import { ScrollReveal } from '@/common/components/ui/ScrollReveal';
import { SEO } from '@/common/components/ui/SEO';
import { Card, CardContent } from '@/common/components/ui/Card';
import { Button } from '@/common/components/ui/Button';
import { Check, AlertCircle, FileText, Info, CalendarX, Lock, Sparkles, BookOpen, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { getRadiusClass } from '@/theme.config';
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
  const anyCourseOpen = courses.some(c => c.isAdmissionOpen);

  // Overall admission is allowed if:
  // 1. A specific course was requested AND that specific course is open
  // 2. OR no course was requested, but an active campaign exists OR any course is open
  const isTargetCourseRequested = Boolean(targetCourseId);
  const isTargetCourseOpen = Boolean(targetCourse && targetCourse.isAdmissionOpen);
  const isGeneralAdmissionOpen = Boolean((activeCampaign && activeCampaign.isActive) || anyCourseOpen);

  const isAdmissionAllowed = isTargetCourseRequested ? isTargetCourseOpen : isGeneralAdmissionOpen;

  // Header Title & Description
  const pageTitle = targetCourse 
    ? `Online Admission: ${targetCourse.title}`
    : activeCampaign?.title || (anyCourseOpen ? "Online Admissions" : "Admissions");

  const pageSubtitle = targetCourse
    ? `${targetCourse.target} • ${targetCourse.academicSession || 'Session 2026-27'}`
    : activeCampaign?.description || (anyCourseOpen ? "Online applications are currently open for active batches. Submit your details below." : "Admissions are currently closed.");

  return (
    <>
      <SEO 
        title={targetCourse ? `Apply: ${targetCourse.title}` : "Online Admissions"} 
        description={`Apply for admission at ${schoolConfig.schoolName} (${schoolConfig.schoolAbbreviation}), ${schoolConfig.location.address}.`}
        keywords={`${schoolConfig.schoolShortName} admissions, school admission form, apply online school`}
      />
      
      {/* Header Banner */}
      <div className="bg-crhs-navy text-white py-16 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-crhs-gold/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-crhs-gold/10 rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <ScrollReveal direction="up">
            {targetCourse && targetCourse.isAdmissionOpen && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-400 text-crhs-navy mb-4 shadow">
                <Sparkles className="w-3.5 h-3.5" /> Selected Batch Application
              </span>
            )}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-widest mb-4">
              {pageTitle}
            </h1>
            <p className="text-base md:text-lg text-slate-300 max-w-2xl mx-auto font-medium whitespace-pre-line leading-relaxed">
              {pageSubtitle}
            </p>
          </ScrollReveal>
        </div>
      </div>

      <div className="py-12 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-slate-50 min-h-screen">
        {loadingCourses ? (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Verifying admission status with database...</p>
          </div>
        ) : isTargetCourseRequested && !targetCourse ? (
          /* Case 1: Specific course was linked, but ID not found */
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
            <Card className="border-t-4 border-t-slate-400 shadow-xl overflow-hidden bg-white">
              <CardContent className="p-10 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="w-8 h-8 text-slate-400" />
                </div>
                <h2 className="text-2xl font-black text-crhs-navy uppercase tracking-wider mb-2">Course Not Found</h2>
                <p className="text-slate-600 font-medium text-sm max-w-md mb-6">
                  The course link you followed is no longer available or may have been updated.
                </p>
                <div className="flex gap-3">
                  <Link to="/academics">
                    <Button variant="outline">Browse All Courses</Button>
                  </Link>
                  <Link to="/contact">
                    <Button>Contact Office</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : isTargetCourseRequested && targetCourse && !targetCourse.isAdmissionOpen ? (
          /* Case 2: Specific course was linked, but its admission is closed */
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
            <Card className="border-t-4 border-t-rose-500 shadow-xl overflow-hidden bg-white">
              <CardContent className="p-10 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mb-4">
                  <Lock className="w-8 h-8 text-rose-600" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-rose-600 bg-rose-50 px-2.5 py-1 rounded border border-rose-200 mb-2">
                  Admissions Closed
                </span>
                <h2 className="text-2xl font-black text-crhs-navy uppercase tracking-wider mb-2">
                  Admissions Closed for {targetCourse.title}
                </h2>
                <p className="text-slate-600 font-medium text-sm max-w-md mb-6 leading-relaxed">
                  Online applications for <strong>{targetCourse.title}</strong> are currently inactive.
                  When the administration opens admissions for this batch, the apply link will be enabled automatically.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link to="/academics">
                    <Button variant="outline" className="text-xs font-bold uppercase">
                      Explore Other Open Batches
                    </Button>
                  </Link>
                  <Link to="/contact">
                    <Button className="text-xs font-bold uppercase bg-crhs-navy text-white">
                      Inquire with Counseling Desk
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : !isAdmissionAllowed ? (
          /* Case 3: No specific course requested, and NO general or course admissions are open */
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
            <Card className="border-t-4 border-t-amber-500 shadow-xl overflow-hidden bg-white">
              <CardContent className="p-12 text-center flex flex-col items-center">
                <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-6">
                  <CalendarX className="w-10 h-10 text-amber-600" />
                </div>
                <h2 className="text-3xl font-black text-crhs-navy uppercase tracking-wider mb-4">Admissions Closed</h2>
                <p className="text-slate-600 font-medium text-base max-w-lg mb-8 leading-relaxed">
                  The online admission process is currently closed. 
                  Please check back later or contact the administration desk for information on upcoming batch dates.
                </p>
                <div className="flex gap-4">
                  <Link to="/academics">
                    <Button variant="outline" size="lg">View Courses</Button>
                  </Link>
                  <Button size="lg" className="bg-crhs-navy text-white" onClick={() => navigate('/contact')}>
                    Contact Us
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : !user ? (
          /* Authentication check */
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
            <Card className="border-t-4 border-t-crhs-navy shadow-xl overflow-hidden bg-white">
              <CardContent className="p-12 text-center flex flex-col items-center">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                  <Lock className="w-10 h-10 text-crhs-navy" />
                </div>
                <h2 className="text-3xl font-black text-crhs-navy uppercase tracking-wider mb-4">Sign In Required</h2>
                <p className="text-slate-600 font-medium text-base max-w-lg mb-8 leading-relaxed">
                  {targetCourse 
                    ? `Please sign in or create an account to submit your application for ${targetCourse.title}.`
                    : 'You must be logged in to access the online admission form. Please log in or create an account to proceed.'}
                </p>
                <div className="flex gap-4">
                  <Link to={`/login?redirect=${encodeURIComponent(targetCourseId ? `/admissions?courseId=${targetCourseId}&course=${encodeURIComponent(targetCourse?.title || '')}` : '/admissions')}`}>
                    <Button size="lg" className="bg-crhs-navy text-white px-8">
                      Sign In / Register
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          /* User is logged in and admission is open for this course / general */
          <AnimatePresence mode="wait">
            {!hasAgreed ? (
              <motion.div 
                key="instructions"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-4xl mx-auto"
              >
                <Card className="border-t-4 border-t-crhs-navy shadow-xl bg-white">
                  <CardContent className="p-8 md:p-12">
                    <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-200">
                      <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center shrink-0">
                        <Info className="w-6 h-6 text-crhs-navy" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black text-crhs-navy uppercase tracking-wider">
                          {targetCourse ? `Application for ${targetCourse.title}` : "Admission Criteria & Instructions"}
                        </h2>
                        <p className="text-slate-500 font-medium text-sm mt-1">Please review carefully before proceeding to form</p>
                      </div>
                    </div>

                    {/* Target Course Highlight Box if selected */}
                    {targetCourse && (
                      <div className="mb-6 p-4 bg-amber-50 border-2 border-amber-300 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider bg-amber-200 text-amber-900 px-2 py-0.5 rounded">
                            Targeted Course Batch
                          </span>
                          <h3 className="text-base font-black text-crhs-navy mt-1">{targetCourse.title}</h3>
                          <p className="text-xs text-slate-600 font-medium">{targetCourse.target}</p>
                        </div>
                        <span className="px-3 py-1 text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 rounded-full shrink-0 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Admission Open
                        </span>
                      </div>
                    )}

                    <div className="space-y-6 text-slate-700 leading-relaxed font-medium text-sm">
                      <p>
                        {language === 'hi'
                          ? `सूर्योदय स्टडी प्वाइंट (${schoolConfig.location.address}) में शैक्षणिक सत्र के लिए प्रवेश प्रक्रिया चालू है। फॉर्म भरने के बाद हमारी टीम द्वारा आपके आवेदन की समीक्षा की जाएगी।`
                          : `Admissions are open at Suryoday Study Point (${schoolConfig.location.address}). Fill in accurate student and guardian details for verification and enrollment processing.`}
                      </p>

                      <div className="bg-slate-50 border border-slate-200 p-6 rounded-lg">
                        <h3 className="text-base font-bold text-crhs-navy uppercase tracking-wider mb-4 flex items-center gap-2">
                          <FileText className="w-5 h-5 text-crhs-gold" />
                          Documents to Keep Handy
                        </h3>
                        <ul className="space-y-2.5 text-xs">
                          {[
                            "Candidate's 12-digit Aadhaar Card Number",
                            "Previous School / Class Marksheet / Report Card details",
                            "Passport size photograph & identity verification",
                            "Valid mobile number for OTP and batch schedule notifications"
                          ].map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2.5">
                              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-200">
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          className="w-5 h-5 mt-0.5 accent-crhs-navy cursor-pointer"
                          checked={isCheckboxChecked}
                          onChange={(e) => setIsCheckboxChecked(e.target.checked)}
                        />
                        <span className="text-xs sm:text-sm text-slate-700 font-semibold select-none group-hover:text-slate-900 transition-colors">
                          I have read and understood the admission criteria and agree to submit valid and true details.
                        </span>
                      </label>
                      <div className="mt-6 flex justify-end">
                        <Button 
                          size="lg" 
                          variant="primary"
                          disabled={!isCheckboxChecked}
                          onClick={() => setHasAgreed(true)}
                          className="w-full md:w-auto text-xs uppercase font-bold"
                        >
                          Proceed to Application Form →
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div 
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-5xl mx-auto"
              >
                <div className="mb-6 flex justify-between items-center">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setHasAgreed(false)}
                    className="text-slate-500 font-bold hover:text-crhs-navy text-xs"
                  >
                    ← Back to Instructions
                  </Button>

                  {targetCourse && (
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-md">
                      Applying for: <strong>{targetCourse.title}</strong>
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
    </>
  );
}
