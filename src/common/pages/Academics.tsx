import React, { useState, useEffect } from 'react';
import { CheckCircle2, Clock, Award, Video, Building2, Sparkles, BookOpen, Layers, ArrowRight, Check } from 'lucide-react';
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
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMode, setSelectedMode] = useState<'all' | 'online' | 'offline'>('all');

  // Real-time synchronization with Firebase 'courses' collection
  useEffect(() => {
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

        setCourses(fetchedList);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching courses from Firebase:', error);
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
    <div className="py-10 md:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-slate-50 min-h-screen">
      <SEO 
        title={language === 'hi' ? 'कोर्सेज एवं शैक्षणिक बैचेज | सूर्योदय स्टडी प्वाइंट' : 'Courses & Academic Programs | Suryoday Study Point'}
        description="Explore Suryoday Study Point online live classes & offline classroom coaching courses for Class 6th to 12th, JEE, NEET and Foundation batches."
      />

      {/* Clean, Non-Boxy Hero Header */}
      <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
        <ScrollReveal direction="up">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100/80 border border-amber-200/80 text-amber-900 text-xs font-bold mb-4 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>{t('academics.sub', 'Academic Programs & Batches')}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-crhs-navy leading-tight mb-3">
            {t('academics.title', 'Suryoday Study Point Courses')}
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            {t('academics.desc')}
          </p>
        </ScrollReveal>
      </div>

      {/* 3 Separate Compact Pills - Fits all 3 together on mobile, non-sticky so lower content is never blocked */}
      <div className="py-2 mb-8 flex justify-center">
        <div className="flex items-center justify-center gap-1.5 sm:gap-3 px-2 max-w-full">
          {/* Pill 1: All */}
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
              {courses.length}
            </span>
          </button>

          {/* Pill 2: Online */}
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
              {onlineCount}
            </span>
          </button>

          {/* Pill 3: Offline */}
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
              {offlineCount}
            </span>
          </button>
        </div>
      </div>

      {/* Courses List - Clean, Airy, Non-Boxy Cards */}
      <div className="space-y-6 sm:space-y-8 mb-16 max-w-5xl mx-auto">
        {loading ? (
          <div className="text-center py-20 flex flex-col items-center justify-center gap-3">
            <BookOpen className="w-8 h-8 text-amber-500 animate-bounce" />
            <p className="text-xs font-bold text-slate-400 animate-pulse">
              {language === 'hi' ? 'डेटाबेस से कोर्सेज फेच हो रहे हैं...' : 'Loading courses in real time from database...'}
            </p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl p-8 space-y-3 shadow-xs">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-crhs-navy">
              {courses.length === 0 
                ? (language === 'hi' ? 'अभी कोई कोर्स प्रकाशित नहीं है' : 'No Courses Published Yet')
                : (language === 'hi' ? 'चयनित माध्यम के लिए कोई बैच उपलब्ध नहीं है' : 'No Batches Found for Selected Mode')}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {courses.length === 0 
                ? (language === 'hi' ? 'जैसे ही एडमिनिस्ट्रेशन कोर्स जारी करेगा, वह तुरंत यहां दिखाई देगा।' : 'Course curriculums will appear here automatically as soon as published by administration.')
                : (language === 'hi' ? 'उपलब्ध प्रोग्राम देखने के लिए \'सभी बैचेज\' चुनें।' : 'Try switching to All Batches to explore available programs.')}
            </p>
            {selectedMode !== 'all' && (
              <Button onClick={() => setSelectedMode('all')} variant="outline" size="sm" className="rounded-full text-xs font-bold mt-2">
                {language === 'hi' ? 'सभी बैचेज देखें' : 'View All Batches'}
              </Button>
            )}
          </div>
        ) : (
          filteredCourses.map((course, idx) => (
            <ScrollReveal direction="up" delay={idx * 0.04} key={course.id}>
              <div className={`bg-white rounded-3xl p-6 sm:p-8 border transition-all duration-300 shadow-sm hover:shadow-lg ${
                course.isAdmissionOpen 
                  ? 'border-amber-300/80 hover:border-amber-400' 
                  : 'border-slate-200/80 hover:border-slate-300'
              }`}>
                {/* Card Top Row: Modes & Admission Badge */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div className="flex flex-wrap items-center gap-2">
                    {course.modes?.map(mode => (
                      <span 
                        key={mode} 
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-full ${
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
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-400/90 text-crhs-navy shadow-xs">
                      <Sparkles className="w-3.5 h-3.5 text-crhs-navy" />
                      <span>{language === 'hi' ? 'एडमिशन चालू है' : 'Admission Open'}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
                      <span>{language === 'hi' ? 'एडमिशन बंद' : 'Admission Closed'}</span>
                    </span>
                  )}
                </div>

                {/* Course Title & Target */}
                <div className="mb-5">
                  <h2 className="text-xl sm:text-2xl font-black text-crhs-navy mb-1.5">
                    {course.title}
                  </h2>
                  <p className="text-amber-700 text-xs sm:text-sm font-semibold">
                    {course.target}
                  </p>
                </div>

                {/* Subjects Pills */}
                {course.subjects && course.subjects.length > 0 && (
                  <div className="mb-5">
                    <p className="text-[11px] font-bold text-slate-400 mb-2">
                      {language === 'hi' ? 'शामिल विषय:' : 'Subjects Covered:'}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {course.subjects.map(sub => (
                        <span 
                          key={sub} 
                          className="bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium px-3 py-1 rounded-full border border-slate-200/70 transition-colors"
                        >
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Highlights */}
                {course.highlights && course.highlights.length > 0 && (
                  <div className="mb-6 pt-3 border-t border-slate-100">
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {course.highlights.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs font-medium text-slate-600">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Integrated Action Bar (Clean footer, not a heavy box inside) */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="font-bold text-crhs-navy">
                      {course.academicSession || 'Academic Session 2026-27'}
                    </span>
                    {course.batchTiming && (
                      <span className="flex items-center gap-1 text-slate-500">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        <span>{course.batchTiming}</span>
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-emerald-700 font-medium">
                      <Award className="w-3.5 h-3.5 text-amber-500" />
                      <span>{language === 'hi' ? 'फ्री डेमो क्लास उपलब्ध' : 'Free Demo Available'}</span>
                    </span>
                  </div>

                  {/* Dynamic Action Button */}
                  <div>
                    {course.isAdmissionOpen ? (
                      <Link 
                        to={`/admissions?courseId=${course.id}&course=${encodeURIComponent(course.title)}`}
                      >
                        <Button className="rounded-full bg-amber-500 hover:bg-amber-600 text-crhs-navy font-bold px-5 py-2.5 shadow-sm text-xs sm:text-sm transition-all hover:scale-[1.02] active:scale-[0.98] inline-flex items-center gap-1.5">
                          <span>{language === 'hi' ? 'बैच के लिए ऑनलाइन आवेदन करें' : 'Apply Online for Batch'}</span>
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    ) : (
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-medium text-slate-400 px-3 py-1.5 rounded-full bg-slate-100">
                          {language === 'hi' ? 'प्रवेश वर्तमान में बंद हैं' : 'Admissions Closed'}
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

      {/* Clean Mode Advantages Section (Unboxed, airy comparison) */}
      <div className="max-w-5xl mx-auto mb-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-crhs-navy mb-2">
            {language === 'hi' ? 'ऑनलाइन एवं ऑफलाइन माध्यम की तुलना' : 'Compare Online & Offline Modes at Suryoday Study Point'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            {language === 'hi' ? 'अपनी सुविधा और तैयारी के अनुसार उपयुक्त माध्यम चुनें' : 'Choose the study mode that fits your routine and learning style'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Online Features */}
          <div className="p-6 sm:p-7 bg-white rounded-3xl border border-blue-100 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-crhs-navy">
                  {language === 'hi' ? 'ऑनलाइन लाइव लर्निंग' : 'Online Live Learning'}
                </h3>
                <p className="text-xs text-blue-600 font-semibold">
                  {language === 'hi' ? 'घर बैठे डिजिटल माध्यम से पढ़ाई' : 'Study from home via student portal'}
                </p>
              </div>
            </div>
            <ul className="space-y-2 text-xs text-slate-600 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                <span>{language === 'hi' ? 'HD लाइव इंटरैक्टिव स्ट्रीमिंग क्लासेस' : 'HD Live interactive streaming classes'}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                <span>{language === 'hi' ? 'रिकॉर्डेड लेक्चर्स का असीमित रिवीजन' : 'Unlimited recorded lectures replay access'}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                <span>{language === 'hi' ? 'DPPs और टीचर नोट्स के डिजिटल PDF' : 'Digital PDFs of DPPs and teacher notes'}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                <span>{language === 'hi' ? 'ऑनलाइन CBT मॉक टेस्ट व त्वरित रैंकिंग' : 'Online CBT mock test portal with instant ranking'}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                <span>{language === 'hi' ? 'क्लास के दौरान लाइव चैट डाउट समाधान' : 'Online live chat doubt solving during class'}</span>
              </li>
            </ul>
          </div>

          {/* Offline Features */}
          <div className="p-6 sm:p-7 bg-white rounded-3xl border border-amber-100 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-crhs-navy">
                  {language === 'hi' ? 'ऑफलाइन क्लासरूम लर्निंग' : 'Offline Classroom Learning'}
                </h3>
                <p className="text-xs text-amber-600 font-semibold">
                  {language === 'hi' ? `${schoolConfig.location.campusName} कैंपस में भौतिक कक्षाएं` : `Physical classroom experience at ${schoolConfig.location.campusName}`}
                </p>
              </div>
            </div>
            <ul className="space-y-2 text-xs text-slate-600 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                <span>{language === 'hi' ? 'शिक्षकों से आमने-सामने व्यक्तिगत मार्गदर्शन' : 'Face-to-face interaction with top faculty'}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                <span>{language === 'hi' ? 'स्मार्ट एसी क्लासरूम्स एवं शांत लाइब्रेरी' : 'AC Smart classrooms & quiet library hall'}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                <span>{language === 'hi' ? 'प्रिंटेड बुकलेट्स, बुक्स और टेस्ट पेपर्स' : 'Hardcopy printed booklets, books & test papers'}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                <span>{language === 'hi' ? 'साप्ताहिक OMR टेस्ट एवं ऑफलाइन डाउट डेस्क' : 'Weekly OMR tests & offline doubt desks'}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                <span>{language === 'hi' ? 'अनुशासित एवं प्रतिस्पर्धी सहपाठी माहौल' : 'High discipline, peer study group environment'}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
