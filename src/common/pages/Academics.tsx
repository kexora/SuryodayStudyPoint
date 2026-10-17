import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Award, 
  Video, 
  Building2, 
  Sparkles, 
  BookOpen, 
  Layers, 
  ArrowRight, 
  Check, 
  Phone, 
  GraduationCap, 
  Monitor, 
  AlertCircle
} from 'lucide-react';
import { ScrollReveal } from '@/common/components/ui/ScrollReveal';
import { SEO } from '@/common/components/ui/SEO';
import { Button } from '@/common/components/ui/Button';
import { Link } from 'react-router-dom';
import { schoolConfig } from '@/config/schoolConfig';
import { useLanguage } from '@/context/LanguageContext';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CourseItem } from '@/types';

export function Academics() {
  const { t, language } = useLanguage();
  // Strictly fetched from Firebase - NO fake/mock fallback batches
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMode, setSelectedMode] = useState<'all' | 'online' | 'offline'>('all');

  // Real-time synchronization directly with Firebase Firestore 'courses' collection
  useEffect(() => {
    setLoading(true);
    const coursesRef = collection(db, 'courses');
    
    const unsubscribe = onSnapshot(
      coursesRef,
      (snapshot) => {
        const fetchedList: CourseItem[] = [];
        snapshot.forEach((docSnap) => {
          fetchedList.push({ id: docSnap.id, ...docSnap.data() } as CourseItem);
        });

        // Sort by order ascending, then created date
        fetchedList.sort((a, b) => {
          const orderA = a.order ?? 99;
          const orderB = b.order ?? 99;
          if (orderA !== orderB) return orderA - orderB;
          return (b.createdAt || 0) - (a.createdAt || 0);
        });

        // Set strictly what exists in Firebase
        setCourses(fetchedList);
        setLoading(false);
      },
      (error) => {
        console.warn('Academics courses fetch notice:', error?.message || error);
        setCourses([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const onlineCount = courses.filter(c => c.modes?.includes('Online')).length;
  const offlineCount = courses.filter(c => c.modes?.includes('Offline')).length;

  const filteredCourses = courses.filter(course => {
    if (selectedMode === 'all') return true;
    if (selectedMode === 'online') return course.modes?.includes('Online');
    if (selectedMode === 'offline') return course.modes?.includes('Offline');
    return true;
  });

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800">
      <SEO 
        title={language === 'hi' ? 'कोर्सेज एवं शैक्षणिक बैचेज | सूर्योदय स्टडी प्वाइंट' : 'Courses & Academic Programs | Suryoday Study Point'}
        description="Explore Suryoday Study Point online live classes & offline classroom coaching courses for Class 6th to 12th, JEE, NEET and Foundation batches."
      />

      {/* Hero Section - Sleek, Non-Boxy with Staggered Blur Reveal */}
      <div className="bg-crhs-navy text-white py-10 sm:py-14 md:py-18 relative overflow-hidden border-b-4 border-amber-500">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-80 sm:w-96 h-80 sm:h-96 bg-amber-500/15 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-80 sm:w-96 h-80 sm:h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          {/* Top Badge with Blur Reveal */}
          <ScrollReveal direction="up" delay={0.05} blur={10}>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30 mb-3 sm:mb-4">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{language === 'hi' ? 'अकादमिक एवं कोर्सेज' : 'Academic Programs & Batches'}</span>
            </div>
          </ScrollReveal>

          {/* Title with Blur Reveal */}
          <ScrollReveal direction="up" delay={0.12} blur={10}>
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-black uppercase tracking-wider text-white mb-3 sm:mb-4">
              {t('academics.title', 'Suryoday Study Point Courses')}
            </h1>
          </ScrollReveal>

          {/* Subtitle with Blur Reveal */}
          <ScrollReveal direction="up" delay={0.18} blur={8}>
            <p className="text-xs sm:text-sm md:text-base text-slate-300 max-w-2xl mx-auto font-normal sm:font-medium leading-relaxed px-2">
              {t('academics.desc', 'We offer comprehensive Coaching Batches in both Online Live Mode and Offline Classroom Mode with daily practice, test series, and expert faculty support.')}
            </p>
          </ScrollReveal>

          {/* Quick Category Chips for Mobile */}
          <ScrollReveal direction="up" delay={0.24} blur={8}>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-[11px] sm:text-xs">
              <span className="bg-white/10 backdrop-blur-xs text-amber-300 px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5 font-medium">
                <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                {language === 'hi' ? '6वीं से 12वीं शाम के बैच' : '6th-12th Evening Batches'}
              </span>
              <span className="bg-white/10 backdrop-blur-xs text-slate-200 px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5 font-medium">
                <Award className="w-3.5 h-3.5 text-emerald-400" />
                {language === 'hi' ? 'प्रतियोगी परीक्षा तैयारी' : 'Competition Batches'}
              </span>
              <span className="bg-white/10 backdrop-blur-xs text-slate-200 px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5 font-medium">
                <Monitor className="w-3.5 h-3.5 text-purple-400" />
                {language === 'hi' ? 'CCC & ADCA कंप्यूटर लैब' : 'Computer Lab (CCC/ADCA)'}
              </span>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Main Body Content */}
      <div className="py-6 sm:py-10 md:py-14 max-w-6xl mx-auto px-3.5 sm:px-6 lg:px-8">

        {/* 3 Separate Compact Pills Filter - Directly connected to Firebase counts */}
        <ScrollReveal direction="up" delay={0.08} blur={8}>
          <div className="py-1 mb-6 sm:mb-8 flex justify-center">
            <div className="flex items-center justify-center gap-1.5 sm:gap-3 px-2 max-w-full">
              {/* Pill 1: All Batches */}
              <button
                onClick={() => setSelectedMode('all')}
                className={`inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs font-bold transition-all duration-200 shrink-0 whitespace-nowrap active:scale-95 ${
                  selectedMode === 'all'
                    ? 'bg-crhs-navy text-white border border-crhs-navy shadow-sm ring-1 sm:ring-2 ring-crhs-navy/15'
                    : 'bg-white text-slate-700 border border-slate-200 shadow-xs hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <Layers className={`w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 ${selectedMode === 'all' ? 'text-amber-400' : 'text-slate-500'}`} />
                <span>
                  <span className="sm:hidden">{language === 'hi' ? 'सभी' : 'All'}</span>
                  <span className="hidden sm:inline">{language === 'hi' ? 'सभी बैचेज' : 'All Batches'}</span>
                </span>
                <span className={`text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold ${
                  selectedMode === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600 border border-slate-200/60'
                }`}>
                  {loading ? '...' : courses.length}
                </span>
              </button>

              {/* Pill 2: Online Batches */}
              <button
                onClick={() => setSelectedMode('online')}
                className={`inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs font-bold transition-all duration-200 shrink-0 whitespace-nowrap active:scale-95 ${
                  selectedMode === 'online'
                    ? 'bg-blue-600 text-white border border-blue-600 shadow-sm ring-1 sm:ring-2 ring-blue-500/20'
                    : 'bg-white text-slate-700 border border-slate-200 shadow-xs hover:border-blue-200 hover:bg-blue-50/50'
                }`}
              >
                <Video className={`w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 ${selectedMode === 'online' ? 'text-white' : 'text-blue-500'}`} />
                <span>
                  <span className="sm:hidden">{language === 'hi' ? 'ऑनलाइन' : 'Online'}</span>
                  <span className="hidden sm:inline">{language === 'hi' ? 'ऑनलाइन बैचेज' : 'Online Batches'}</span>
                </span>
                <span className={`text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold ${
                  selectedMode === 'online' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600 border border-slate-200/60'
                }`}>
                  {loading ? '...' : onlineCount}
                </span>
              </button>

              {/* Pill 3: Offline Batches */}
              <button
                onClick={() => setSelectedMode('offline')}
                className={`inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs font-bold transition-all duration-200 shrink-0 whitespace-nowrap active:scale-95 ${
                  selectedMode === 'offline'
                    ? 'bg-amber-500 text-crhs-navy border border-amber-500 shadow-sm ring-1 sm:ring-2 ring-amber-400/30'
                    : 'bg-white text-slate-700 border border-slate-200 shadow-xs hover:border-amber-200 hover:bg-amber-50/50'
                }`}
              >
                <Building2 className={`w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 ${selectedMode === 'offline' ? 'text-crhs-navy' : 'text-amber-600'}`} />
                <span>
                  <span className="sm:hidden">{language === 'hi' ? 'ऑफलाइन' : 'Offline'}</span>
                  <span className="hidden sm:inline">{language === 'hi' ? 'ऑफलाइन बैचेज' : 'Offline Batches'}</span>
                </span>
                <span className={`text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold ${
                  selectedMode === 'offline' ? 'bg-crhs-navy/15 text-crhs-navy' : 'bg-slate-100 text-slate-600 border border-slate-200/60'
                }`}>
                  {loading ? '...' : offlineCount}
                </span>
              </button>
            </div>
          </div>
        </ScrollReveal>

        {/* Courses List - Directly Rendered from Firebase with Blur Revealing Animation */}
        <div className="space-y-4 sm:space-y-6 mb-12 sm:mb-16">
          {loading ? (
            /* Clean skeleton with blur reveal while loading from Firebase */
            <ScrollReveal direction="up" blur={8}>
              <div className="space-y-4">
                {[1, 2].map((n) => (
                  <div key={n} className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xs animate-pulse">
                    <div className="flex justify-between items-center mb-4">
                      <div className="h-6 w-28 bg-slate-200 rounded-full"></div>
                      <div className="h-6 w-24 bg-slate-200 rounded-full"></div>
                    </div>
                    <div className="h-7 w-3/4 bg-slate-200 rounded mb-2"></div>
                    <div className="h-4 w-1/2 bg-slate-100 rounded mb-4"></div>
                    <div className="h-10 w-full bg-slate-100 rounded-xl mb-4"></div>
                    <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                      <div className="h-4 w-32 bg-slate-100 rounded"></div>
                      <div className="h-9 w-36 bg-slate-200 rounded-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          ) : filteredCourses.length === 0 ? (
            /* When no batches exist in Firebase or for chosen filter */
            <ScrollReveal direction="up" blur={8}>
              <div className="text-center py-12 sm:py-16 bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-6 sm:p-8 space-y-3 shadow-xs">
                <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200/60">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-crhs-navy">
                  {courses.length === 0 
                    ? (language === 'hi' ? 'डेटाबेस में अभी कोई बैच उपलब्ध नहीं है' : 'No Batches Listed in Firebase')
                    : (language === 'hi' ? 'चयनित माध्यम के लिए कोई बैच उपलब्ध नहीं है' : 'No Batches Found for Selected Mode')}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                  {courses.length === 0 
                    ? (language === 'hi' ? 'जैसे ही एडमिनिस्ट्रेशन द्वारा नया बैच जोड़ा जाएगा, वह सीधे यहां लाइव प्रदर्शित होगा।' : 'Live courses will appear here as soon as they are published in the database.')
                    : (language === 'hi' ? 'उपलब्ध प्रोग्राम देखने के लिए \'सभी बैचेज\' विकल्प चुनें।' : 'Try switching to All Batches to view available programs.')}
                </p>
                {selectedMode !== 'all' && (
                  <Button onClick={() => setSelectedMode('all')} variant="outline" size="sm" className="rounded-full text-xs font-bold mt-2">
                    {language === 'hi' ? 'सभी बैचेज देखें' : 'View All Batches'}
                  </Button>
                )}
                {courses.length === 0 && (
                  <div className="pt-2">
                    <Link to="/contact">
                      <Button size="sm" className="rounded-full bg-crhs-navy text-white text-xs font-bold px-4 py-2">
                        {language === 'hi' ? 'बैच के लिए संपर्क करें' : 'Contact for Batches'}
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </ScrollReveal>
          ) : (
            /* Strictly the courses existing in Firebase */
            filteredCourses.map((course, idx) => (
              <ScrollReveal direction="up" delay={idx * 0.08} blur={8} key={course.id || idx}>
                <div className={`bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-7 md:p-8 border transition-all duration-300 shadow-xs hover:shadow-md ${
                  course.isAdmissionOpen 
                    ? 'border-amber-300/80 hover:border-amber-400' 
                    : 'border-slate-200/80 hover:border-slate-300'
                }`}>
                  
                  {/* Card Top Row: Modes & Admission Badge */}
                  <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3.5">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      {course.modes?.map(mode => (
                        <span 
                          key={mode} 
                          className={`inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 sm:py-1 rounded-full ${
                            mode === 'Online' 
                              ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          }`}
                        >
                          {mode === 'Online' ? (
                            <>
                              <Video className="w-3 h-3 text-blue-600" />
                              <span>{language === 'hi' ? 'ऑनलाइन लाइव' : 'Online Live'}</span>
                            </>
                          ) : (
                            <>
                              <Building2 className="w-3 h-3 text-emerald-600" />
                              <span>{language === 'hi' ? 'ऑफलाइन कैंपस' : 'Offline Campus'}</span>
                            </>
                          )}
                        </span>
                      ))}
                    </div>

                    {/* Status Indicator */}
                    {course.isAdmissionOpen ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold bg-amber-400/90 text-crhs-navy shadow-2xs">
                        <Sparkles className="w-3 h-3 text-crhs-navy" />
                        <span>{language === 'hi' ? 'एडमिशन चालू है' : 'Admission Open'}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium bg-slate-100 text-slate-500">
                        <span>{language === 'hi' ? 'एडमिशन बंद' : 'Admission Closed'}</span>
                      </span>
                    )}
                  </div>

                  {/* Course Title & Target */}
                  <div className="mb-4">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-black text-crhs-navy mb-1 leading-snug">
                      {course.title}
                    </h2>
                    {course.target && (
                      <p className="text-amber-700 text-xs sm:text-sm font-semibold">
                        {course.target}
                      </p>
                    )}
                    {course.description && (
                      <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                        {course.description}
                      </p>
                    )}
                  </div>

                  {/* Subjects Pills */}
                  {course.subjects && course.subjects.length > 0 && (
                    <div className="mb-4">
                      <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                        {language === 'hi' ? 'शामिल विषय / पाठ्यक्रम:' : 'Subjects Covered:'}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {course.subjects.map(sub => (
                          <span 
                            key={sub} 
                            className="bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] sm:text-xs font-medium px-2.5 py-0.5 sm:py-1 rounded-full border border-slate-200/70 transition-colors"
                          >
                            {sub}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Key Highlights */}
                  {course.highlights && course.highlights.length > 0 && (
                    <div className="mb-5 pt-3 border-t border-slate-100">
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {course.highlights.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs font-medium text-slate-600">
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Integrated Action Bar - Mobile Friendly Flex Row / Column */}
                  <div className="pt-3.5 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-[11px] sm:text-xs text-slate-500">
                      <span className="font-bold text-crhs-navy bg-slate-50 px-2.5 py-1 rounded border border-slate-100">
                        {course.academicSession || 'Session 2026-27'}
                      </span>
                      {course.batchTiming && (
                        <span className="flex items-center gap-1 text-slate-600">
                          <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span>{course.batchTiming}</span>
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-emerald-700 font-medium">
                        <Award className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{language === 'hi' ? 'फ्री डेमो उपलब्ध' : 'Free Demo'}</span>
                      </span>
                    </div>

                    {/* Dynamic Action Button */}
                    <div>
                      {course.isAdmissionOpen ? (
                        <Link 
                          to={`/admissions?courseId=${course.id}&course=${encodeURIComponent(course.title)}`}
                          className="w-full sm:w-auto inline-block"
                        >
                          <Button className="w-full sm:w-auto rounded-full bg-amber-500 hover:bg-amber-600 text-crhs-navy font-black px-4 sm:px-6 py-2.5 shadow-xs text-xs sm:text-xs transition-all hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-1.5">
                            <span>{language === 'hi' ? 'ऑनलाइन आवेदन करें' : 'Apply Online for Batch'}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                      ) : (
                        <div className="flex items-center justify-between sm:justify-end gap-3 w-full">
                          <span className="text-xs font-medium text-slate-400 px-3 py-1.5 rounded-full bg-slate-100">
                            {language === 'hi' ? 'प्रवेश बंद' : 'Admissions Closed'}
                          </span>
                          <Link to="/contact" className="text-xs font-bold text-amber-700 hover:underline">
                            {language === 'hi' ? 'पूछताछ करें →' : 'Inquire →'}
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </ScrollReveal>
            ))
          )}
        </div>

        {/* Clean Mode Advantages Section with Blur Reveal */}
        <div className="max-w-5xl mx-auto mb-10 sm:mb-14">
          <ScrollReveal direction="up" delay={0.1} blur={8}>
            <div className="text-center mb-6 sm:mb-8">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100/60 px-3 py-1 rounded-full mb-2 inline-block">
                {language === 'hi' ? 'सुविधाजनक माध्यम' : 'Study Modes Comparison'}
              </span>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-crhs-navy mb-2">
                {language === 'hi' ? 'ऑनलाइन एवं ऑफलाइन माध्यम की तुलना' : 'Compare Online & Offline Modes at Suryoday'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
                {language === 'hi' ? 'अपनी सुविधा और तैयारी के अनुसार उपयुक्त माध्यम चुनें' : 'Choose the study mode that fits your routine and learning style'}
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Online Features with Blur Reveal */}
            <ScrollReveal direction="up" delay={0.14} blur={8}>
              <div className="p-4 sm:p-6 md:p-7 bg-white rounded-2xl sm:rounded-3xl border border-blue-100 shadow-xs space-y-4 h-full hover:border-blue-300 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                    <Video className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-crhs-navy">
                      {language === 'hi' ? 'ऑनलाइन लाइव लर्निंग' : 'Online Live Learning'}
                    </h3>
                    <p className="text-xs text-blue-600 font-semibold">
                      {language === 'hi' ? 'घर बैठे डिजिटल माध्यम से पढ़ाई' : 'Study from home via student portal'}
                    </p>
                  </div>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-600 font-medium">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span>{language === 'hi' ? 'HD लाइव इंटरैक्टिव स्ट्रीमिंग क्लासेस' : 'HD Live interactive streaming classes'}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span>{language === 'hi' ? 'रिकॉर्डेड लेक्चर्स का असीमित रिवीजन' : 'Unlimited recorded lectures replay access'}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span>{language === 'hi' ? 'DPPs और टीचर नोट्स के डिजिटल PDF' : 'Digital PDFs of DPPs and teacher notes'}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span>{language === 'hi' ? 'ऑनलाइन CBT मॉक टेस्ट व त्वरित रैंकिंग' : 'Online CBT mock test portal with instant ranking'}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span>{language === 'hi' ? 'क्लास के दौरान लाइव चैट डाउट समाधान' : 'Online live chat doubt solving during class'}</span>
                  </li>
                </ul>
              </div>
            </ScrollReveal>

            {/* Offline Features with Blur Reveal */}
            <ScrollReveal direction="up" delay={0.2} blur={8}>
              <div className="p-4 sm:p-6 md:p-7 bg-white rounded-2xl sm:rounded-3xl border border-amber-100 shadow-xs space-y-4 h-full hover:border-amber-300 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-crhs-navy">
                      {language === 'hi' ? 'ऑफलाइन क्लासरूम लर्निंग' : 'Offline Classroom Learning'}
                    </h3>
                    <p className="text-xs text-amber-600 font-semibold">
                      {language === 'hi' ? `${schoolConfig.location.campusName} कैंपस में भौतिक कक्षाएं` : `Physical classroom experience at ${schoolConfig.location.campusName}`}
                    </p>
                  </div>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-600 font-medium">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span>{language === 'hi' ? 'शिक्षकों से आमने-सामने व्यक्तिगत मार्गदर्शन' : 'Face-to-face interaction with top faculty'}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span>{language === 'hi' ? 'स्मार्ट क्लासरूम्स एवं शांत अध्ययन कक्ष' : 'Smart classrooms & quiet study hall'}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span>{language === 'hi' ? 'प्रिंटेड बुकलेट्स, बुक्स और टेस्ट पेपर्स' : 'Hardcopy printed booklets, books & test papers'}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span>{language === 'hi' ? 'साप्ताहिक OMR टेस्ट एवं ऑफलाइन डाउट डेस्क' : 'Weekly OMR tests & offline doubt desks'}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span>{language === 'hi' ? 'अनुशासित एवं प्रतिस्पर्धी सहपाठी माहौल' : 'High discipline, peer study group environment'}</span>
                  </li>
                </ul>
              </div>
            </ScrollReveal>
          </div>
        </div>

        {/* Quick Contact & Helpline Action Bar with Blur Reveal */}
        <ScrollReveal direction="up" delay={0.16} blur={8}>
          <div className="bg-linear-to-r from-crhs-navy to-slate-900 text-white p-5 sm:p-7 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <h3 className="text-base sm:text-lg font-black text-white">
                {language === 'hi' ? 'किसी कोर्स या बैच के बारे में जानकारी चाहिए?' : 'Need guidance choosing the right course or batch?'}
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                {language === 'hi' 
                  ? 'हमारे काउंसलर से सीधे बात करें या भवानी छपार कैंपस में पधारें।' 
                  : 'Speak directly with our academic counselors or visit our campus.'}
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-center">
              <a 
                href={`tel:${schoolConfig.contact.phonePrimary}`} 
                className="px-4 py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-crhs-navy font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{schoolConfig.contact.phonePrimary}</span>
              </a>
              <Link 
                to="/contact" 
                className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 border border-white/20 transition-colors"
              >
                <span>{language === 'hi' ? 'संपर्क केंद्र' : 'Contact Center'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </ScrollReveal>

      </div>
    </div>
  );
}
