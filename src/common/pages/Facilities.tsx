import React from 'react';
import { Card, CardContent } from '@/common/components/ui/Card';
import { 
  Video, 
  Monitor, 
  BookOpen, 
  HelpCircle, 
  FileText, 
  Wifi, 
  Sparkles, 
  CheckCircle2, 
  Phone, 
  MapPin, 
  ArrowRight,
  ShieldCheck,
  Clock,
  Layers
} from 'lucide-react';
import { ScrollReveal } from '@/common/components/ui/ScrollReveal';
import { SEO } from '@/common/components/ui/SEO';
import { useLanguage } from '@/context/LanguageContext';
import { schoolConfig } from '@/config/schoolConfig';
import { Link } from 'react-router-dom';

export function Facilities() {
  const { t, language } = useLanguage();

  const facilities = [
    { 
      title: t('facilities.f1_title', "HD Studio for Online Streaming"), 
      icon: Video, 
      desc: t('facilities.f1_desc', "High-definition camera setups, smart interactive panels, and noise-isolated acoustic studios for smooth live lectures."),
      tag: language === 'hi' ? 'डिजिटल क्लास' : 'Online Tech',
      color: 'blue'
    },
    { 
      title: t('facilities.f2_title', "Smart AC Classrooms"), 
      icon: Monitor, 
      desc: t('facilities.f2_desc', "Climate-controlled, comfortable seating with interactive digital boards for visual diagrammatic explanations."),
      tag: language === 'hi' ? 'स्मार्ट क्लासरूम' : 'Air-Conditioned',
      color: 'amber'
    },
    { 
      title: t('facilities.f3_title', "Computer-Based Test (CBT) Lab"), 
      icon: Wifi, 
      desc: t('facilities.f3_desc', "Dedicated computer lab with JEE / NEET mock test software simulating actual NTA national exam environments."),
      tag: language === 'hi' ? 'CBT मॉक टेस्ट' : 'Computer Lab',
      color: 'purple'
    },
    { 
      title: t('facilities.f4_title', "Library & Silent Self-Study Hall"), 
      icon: BookOpen, 
      desc: t('facilities.f4_desc', "Extensive collection of reference books, HC Verma, Irodov, NCERT exemplar books, and peaceful study desks."),
      tag: language === 'hi' ? 'शांत स्वाध्याय' : 'Self-Study',
      color: 'emerald'
    },
    { 
      title: t('facilities.f5_title', "Dedicated Offline Doubt Desks"), 
      icon: HelpCircle, 
      desc: t('facilities.f5_desc', "Special doubt clearing counters available before and after regular batches for 1-on-1 problem resolution with faculties."),
      tag: language === 'hi' ? '1-ऑन-1 मेंटरशिप' : 'Doubt Counter',
      color: 'rose'
    },
    { 
      title: t('facilities.f6_title', "Study Material & DPP Distribution Center"), 
      icon: FileText, 
      desc: t('facilities.f6_desc', "In-house module printing and distribution desk providing comprehensive printed booklets and daily practice papers."),
      tag: language === 'hi' ? 'प्रिंटेड बुक्स' : 'Printed DPPs',
      color: 'amber'
    },
  ];

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800">
      <SEO 
        title="Infrastructure & Facilities | Suryoday Study Point"
        description="Explore Suryoday Study Point's state-of-the-art facilities: HD Online Recording Studio, Smart AC Classrooms, CBT Test Lab, Library & Doubt Counters."
      />
      
      {/* Hero Section - Sleek, Theme-Consistent & Blur-Revealed */}
      <div className="bg-crhs-navy text-white py-10 sm:py-16 md:py-20 relative overflow-hidden border-b-4 border-amber-500">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-72 sm:w-96 h-72 sm:h-96 bg-amber-500/15 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-72 sm:w-96 h-72 sm:h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          {/* Top Badge with Blur Reveal */}
          <ScrollReveal direction="up" delay={0.05} blur={10}>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30 mb-3 sm:mb-4">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{t('facilities.badge', 'Modern Infrastructure')}</span>
            </div>
          </ScrollReveal>

          {/* Heading with Blur Reveal */}
          <ScrollReveal direction="up" delay={0.12} blur={10}>
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-black uppercase tracking-wider mb-3 sm:mb-4 text-white">
              {t('facilities.title', 'Suryoday Coaching Facilities')}
            </h1>
          </ScrollReveal>

          {/* Subtitle with Blur Reveal */}
          <ScrollReveal direction="up" delay={0.18} blur={8}>
            <p className="text-xs sm:text-sm md:text-base text-slate-300 max-w-2xl mx-auto font-normal sm:font-medium leading-relaxed px-2">
              {t('facilities.desc', 'Equipped with cutting-edge technology for online streaming as well as high-comfort classrooms for offline physical batches.')}
            </p>
          </ScrollReveal>

          {/* Quick Chips on Hero for Mobile */}
          <ScrollReveal direction="up" delay={0.24} blur={8}>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-[11px] sm:text-xs">
              <span className="bg-white/10 backdrop-blur-xs text-amber-300 px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5 font-medium">
                <Video className="w-3.5 h-3.5 text-amber-400" />
                {language === 'hi' ? 'HD ऑनलाइन स्टूडियो' : 'HD Live Studio'}
              </span>
              <span className="bg-white/10 backdrop-blur-xs text-slate-200 px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5 font-medium">
                <Monitor className="w-3.5 h-3.5 text-blue-400" />
                {language === 'hi' ? 'स्मार्ट क्लासरूम्स' : 'Smart AC Rooms'}
              </span>
              <span className="bg-white/10 backdrop-blur-xs text-slate-200 px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5 font-medium">
                <Wifi className="w-3.5 h-3.5 text-purple-400" />
                {language === 'hi' ? 'CBT कंप्यूटर टेस्ट लैब' : 'CBT Exam Lab'}
              </span>
              <span className="bg-white/10 backdrop-blur-xs text-slate-200 px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5 font-medium">
                <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
                {language === 'hi' ? '1-ऑन-1 डाउट डेस्क' : 'Doubt Counters'}
              </span>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Main Container */}
      <div className="py-6 sm:py-10 md:py-14 max-w-6xl mx-auto px-3.5 sm:px-6 lg:px-8">
        
        {/* Quick Snapshot Metrics Bar (Mobile & Desktop friendly 4-card grid) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 mb-6 sm:mb-10">
          <ScrollReveal direction="up" delay={0.06} blur={8}>
            <div className="bg-white p-3.5 sm:p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3 h-full">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg bg-amber-50 flex items-center justify-center shrink-0 border border-amber-200/60">
                <Monitor className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider truncate">
                  {language === 'hi' ? 'डिजिटल बोर्ड' : 'Smart Tech'}
                </p>
                <p className="text-xs sm:text-sm font-black text-crhs-navy truncate">
                  100% Interactive
                </p>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.12} blur={8}>
            <div className="bg-white p-3.5 sm:p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3 h-full">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 border border-blue-200/60">
                <Wifi className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider truncate">
                  {language === 'hi' ? 'कंप्यूटर लैब' : 'CBT Lab'}
                </p>
                <p className="text-xs sm:text-sm font-black text-crhs-navy truncate">
                  Online Mock Portal
                </p>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.18} blur={8}>
            <div className="bg-white p-3.5 sm:p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3 h-full">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-200/60">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider truncate">
                  {language === 'hi' ? 'शांत लाइब्रेरी' : 'Study Hall'}
                </p>
                <p className="text-xs sm:text-sm font-black text-crhs-navy truncate">
                  Standard Reference
                </p>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.24} blur={8}>
            <div className="bg-white p-3.5 sm:p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3 h-full">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg bg-purple-50 flex items-center justify-center shrink-0 border border-purple-200/60">
                <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider truncate">
                  {language === 'hi' ? 'डाउट समाधान' : 'Doubts Desk'}
                </p>
                <p className="text-xs sm:text-sm font-black text-crhs-navy truncate">
                  1-on-1 Faculty Help
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Facilities Grid with Staggered Blur Revealing Animation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6 mb-10 sm:mb-14">
          {facilities.map((fac, i) => {
            const Icon = fac.icon;
            return (
              <ScrollReveal direction="up" delay={i * 0.08} blur={8} key={i}>
                <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-amber-400/80 transition-all duration-300 h-full flex flex-col justify-between">
                  <div>
                    {/* Top Row: Icon + Badge */}
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200/60">
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60">
                        {fac.tag}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-base sm:text-lg font-black text-crhs-navy mb-2 leading-snug">
                      {fac.title}
                    </h3>

                    {/* Description */}
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-normal">
                      {fac.desc}
                    </p>
                  </div>

                  {/* Bottom Accent */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-bold text-amber-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{language === 'hi' ? 'छात्रों के लिए पूर्णतः उपलब्ध' : 'Available for All Enrolled Students'}</span>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>

        {/* Campus Visit Helpline Action Bar with Blur Reveal */}
        <ScrollReveal direction="up" delay={0.16} blur={8}>
          <div className="bg-linear-to-r from-crhs-navy to-slate-900 text-white p-5 sm:p-7 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded border border-amber-400/20 mb-2 inline-block">
                {language === 'hi' ? 'कैंपस विजिट आमंत्रण' : 'Campus Tour'}
              </span>
              <h3 className="text-base sm:text-lg font-black text-white">
                {language === 'hi' ? 'क्या आप सूर्योदय कोचिंग सेंटर आकर देखना चाहते हैं?' : 'Want to experience our modern classrooms & labs in person?'}
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                {language === 'hi' 
                  ? `हमारा केंद्र ${schoolConfig.location.address} (सिरिसिया बाबू रोड के पास) स्थित है। आप किसी भी दिन सुबह 7 से शाम 7 बजे तक पधार सकते हैं।` 
                  : `Visit our campus at ${schoolConfig.location.address}. Counseling hours: Mon - Sat, 7:00 AM - 7:00 PM.`}
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-center shrink-0">
              <a 
                href={`tel:${schoolConfig.contact.phonePrimary}`} 
                className="px-4 py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-crhs-navy font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{schoolConfig.contact.phonePrimary}</span>
              </a>
              <Link 
                to="/admissions" 
                className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 border border-white/20 transition-colors"
              >
                <span>{language === 'hi' ? 'ऑनलाइन आवेदन करें' : 'Apply Online'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </ScrollReveal>

      </div>
    </div>
  );
}
