import React from 'react';
import { SectionHeading } from '@/common/components/ui/SectionHeading';
import { Card, CardContent } from '@/common/components/ui/Card';
import { Video, Monitor, BookOpen, HelpCircle, FileText, Wifi, Building2, Award } from 'lucide-react';
import { ScrollReveal } from '@/common/components/ui/ScrollReveal';
import { SEO } from '@/common/components/ui/SEO';
import { useLanguage } from '@/context/LanguageContext';

export function Facilities() {
  const { t } = useLanguage();

  const facilities = [
    { title: t('facilities.f1_title', "HD Studio for Online Streaming"), icon: Video, desc: t('facilities.f1_desc', "High-definition camera setups, smart interactive panels, and noise-isolated acoustic studios for smooth live lectures.") },
    { title: t('facilities.f2_title', "Smart AC Classrooms"), icon: Monitor, desc: t('facilities.f2_desc', "Climate-controlled, comfortable seating with interactive digital boards for visual diagrammatic explanations.") },
    { title: t('facilities.f3_title', "Computer-Based Test (CBT) Lab"), icon: Wifi, desc: t('facilities.f3_desc', "Dedicated computer lab with JEE / NEET mock test software simulating actual NTA national exam environments.") },
    { title: t('facilities.f4_title', "Library & Silent Self-Study Hall"), icon: BookOpen, desc: t('facilities.f4_desc', "Extensive collection of reference books, HC Verma, Irodov, NCERT exemplar books, and peaceful study desks.") },
    { title: t('facilities.f5_title', "Dedicated Offline Doubt Desks"), icon: HelpCircle, desc: t('facilities.f5_desc', "Special doubt clearing counters available before and after regular batches for 1-on-1 problem resolution with faculties.") },
    { title: t('facilities.f6_title', "Study Material & DPP Distribution Center"), icon: FileText, desc: t('facilities.f6_desc', "In-house module printing and distribution desk providing comprehensive printed booklets and daily practice papers.") },
  ];

  return (
    <div className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-slate-50 min-h-screen">
      <SEO 
        title="Infrastructure & Facilities | Suryoday Study Point"
        description="Explore Suryoday Study Point's state-of-the-art facilities: HD Online Recording Studio, Smart AC Classrooms, CBT Test Lab, Library & Doubt Counters."
      />
      
      <ScrollReveal direction="up">
        <div className="text-center mb-12">
          <span className="text-amber-600 font-black text-xs uppercase tracking-widest block mb-2">{t('facilities.badge', 'Modern Infrastructure')}</span>
          <h1 className="text-3xl md:text-4xl font-black uppercase text-crhs-navy">{t('facilities.title', 'Suryoday Coaching Facilities')}</h1>
          <p className="text-slate-600 max-w-2xl mx-auto mt-3 font-medium text-sm md:text-base">
            {t('facilities.desc')}
          </p>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
        {facilities.map((fac, i) => (
          <ScrollReveal direction="up" delay={i * 0.1} key={i}>
            <Card className="hover:shadow-xl transition-shadow h-full border-0 bg-white border-t-4 border-amber-500">
              <CardContent className="p-8 text-center flex flex-col items-center h-full">
                <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center mb-6 text-amber-800">
                  <fac.icon className="h-8 w-8 text-amber-600" />
                </div>
                <h3 className="text-xl font-bold text-crhs-navy mb-3">{fac.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed font-medium">{fac.desc}</p>
              </CardContent>
            </Card>
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
}
