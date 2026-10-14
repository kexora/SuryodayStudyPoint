import React from 'react';
import { Card, CardContent } from '@/common/components/ui/Card';
import { ScrollReveal } from '@/common/components/ui/ScrollReveal';
import { SEO } from '@/common/components/ui/SEO';
import { BookOpen, MapPin, Users, Award, Target, Compass, Video } from 'lucide-react';
import { schoolConfig } from '@/config/schoolConfig';
import { useLanguage } from '@/context/LanguageContext';

export function About() {
  const { t } = useLanguage();
  return (
    <>
      <SEO 
        title="About Us | Suryoday Study Point"
        description={`Learn about ${schoolConfig.schoolName}, established in ${schoolConfig.academics.establishmentYear}. Premier coaching institute offering Online & Offline classes for Class 6th to 12th, JEE & NEET.`}
      />
      
      {/* Hero Section */}
      <div className="bg-crhs-navy text-white py-20 relative overflow-hidden border-b-4 border-amber-500">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <ScrollReveal direction="up">
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-wider mb-6">{t('about.title', 'About Us')}</h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto font-medium">
              {t('about.subtitle', `Empowering students with top-tier Online & Offline coaching since ${schoolConfig.academics.establishmentYear}.`)}
            </p>
          </ScrollReveal>
        </div>
      </div>

      <div className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-slate-50 min-h-screen">
        
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 mb-16">
          <div className="lg:col-span-8 space-y-8">
            <ScrollReveal direction="up">
              <Card className="border-0 shadow-xl overflow-hidden bg-white">
                <CardContent className="p-8 md:p-12 space-y-8">
                  <div className="space-y-6 text-slate-700 leading-relaxed text-base md:text-lg">
                    <p>
                      {t('about.p1')}
                    </p>
                    
                    <p>
                      {t('about.p2')}
                    </p>

                    <p>
                      {t('about.p3')}
                    </p>

                    <div className="bg-amber-50 p-6 border-l-4 border-amber-500 rounded-r-lg mt-8">
                      <p className="text-amber-900 font-bold italic text-lg leading-relaxed">
                        {t('about.quote')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>

            {/* Vision & Mission */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ScrollReveal direction="up" delay={0.1}>
                <div className="bg-white p-8 rounded-xl shadow-md border-t-4 border-crhs-navy h-full">
                  <Target className="w-10 h-10 text-amber-500 mb-4" />
                  <h3 className="text-xl font-black text-crhs-navy uppercase mb-3">{t('about.mission_title', 'Our Mission')}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed font-medium">
                    {t('about.mission_desc')}
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={0.2}>
                <div className="bg-white p-8 rounded-xl shadow-md border-t-4 border-amber-500 h-full">
                  <Compass className="w-10 h-10 text-crhs-navy mb-4" />
                  <h3 className="text-xl font-black text-crhs-navy uppercase mb-3">{t('about.vision_title', 'Our Vision')}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed font-medium">
                    {t('about.vision_desc')}
                  </p>
                </div>
              </ScrollReveal>
            </div>
          </div>

          {/* Quick Facts Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <ScrollReveal direction="up" delay={0.2}>
              <Card className="border-0 shadow-md bg-white">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-crhs-navy uppercase tracking-wider mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
                    <Award className="text-amber-500 w-6 h-6" />
                    {t('about.highlights', 'Institute Highlights')}
                  </h3>
                  
                  <ul className="space-y-6">
                    <li className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                        <BookOpen className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-bold text-crhs-navy text-sm uppercase tracking-wider">Established</p>
                        <p className="text-slate-600 font-medium">Year {schoolConfig.academics.establishmentYear}</p>
                      </div>
                    </li>
                    <li className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                        <Video className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-bold text-crhs-navy text-sm uppercase tracking-wider">Modes Offered</p>
                        <p className="text-slate-600 font-medium">Online Live & Offline Batches</p>
                      </div>
                    </li>
                    <li className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                        <Users className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-bold text-crhs-navy text-sm uppercase tracking-wider">Courses</p>
                        <p className="text-slate-600 font-medium">Class 6th-12th, JEE & NEET</p>
                      </div>
                    </li>
                    <li className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                        <MapPin className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-bold text-crhs-navy text-sm uppercase tracking-wider">Location</p>
                        <p className="text-slate-600 font-medium">{schoolConfig.location.address}, {schoolConfig.location.state}</p>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </>
  );
}
