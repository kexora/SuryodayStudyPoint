import React from 'react';
import { HeroSlider } from '@/common/components/HeroSlider';
import { NoticeBoard } from '@/common/components/NoticeBoard';
import { StatsCounter } from '@/common/components/StatsCounter';
import { PrincipalMessage } from '@/common/components/PrincipalMessage';
import { WhyChooseUs } from '@/common/components/WhyChooseUs';
import { ProgramsOverview } from '@/common/components/ProgramsOverview';
import { AdmissionsCTA } from '@/common/components/AdmissionsCTA';
import { Button } from '@/common/components/ui/Button';
import { Link } from 'react-router-dom';
import { ScrollReveal } from '@/common/components/ui/ScrollReveal';
import { SEO } from '@/common/components/ui/SEO';
import { useSettings } from '@/context/SettingsContext';
import { schoolConfig } from '@/config/schoolConfig';
import { useLanguage } from '@/context/LanguageContext';
import { Clock, Trophy, Laptop, Smartphone, ArrowRight } from 'lucide-react';

export function Home() {
  const { settings } = useSettings();
  const { t } = useLanguage();

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <SEO 
        title={`${settings.schoolName} | ${settings.address.split(',')[1] || settings.address}`}
        description={`Welcome to ${settings.schoolName}. A premier co-educational institution shaping brilliant minds.`}
        keywords={`${settings.schoolName}, school, admissions`}
      />
      
      {/* Hero Section */}
      <HeroSlider />

      {/* Welcome Section */}
      <section className="py-16 md:py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            
            <div className="order-2 lg:order-1 relative z-10">
              <ScrollReveal direction="up" delay={0.1}>
                <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-amber-100 text-amber-900 font-black text-xs uppercase tracking-widest rounded-full mb-4">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  {t('hero.badge')}
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black leading-[1.2] uppercase mb-6 text-crhs-navy">
                  {t('hero.welcome_title')}
                </h2>
              </ScrollReveal>
              
              <ScrollReveal direction="up" delay={0.2}>
                <p className="text-base text-slate-600 leading-relaxed mb-4 font-medium">
                  {t('hero.welcome_p1')}
                </p>
                <p className="text-base text-slate-600 leading-relaxed mb-6 font-medium">
                  {t('hero.welcome_p2')}
                </p>

                {/* Badges with SVG Icons */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-center flex items-center justify-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                    <p className="font-bold text-crhs-navy text-xs uppercase">{t('hero.badge_evening')}</p>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-center flex items-center justify-center gap-1.5">
                    <Trophy className="w-4 h-4 text-amber-600 shrink-0" />
                    <p className="font-bold text-crhs-navy text-xs uppercase">{t('hero.badge_competition')}</p>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-center flex items-center justify-center gap-1.5">
                    <Laptop className="w-4 h-4 text-amber-600 shrink-0" />
                    <p className="font-bold text-crhs-navy text-xs uppercase">{t('hero.badge_computer')}</p>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-center flex items-center justify-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-amber-600 shrink-0" />
                    <p className="font-bold text-crhs-navy text-xs uppercase">{t('hero.badge_online')}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <Link to="/admissions" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:w-auto px-8 shadow-sm text-sm sm:text-base py-4 sm:py-3 h-auto bg-amber-500 hover:bg-amber-600 text-crhs-navy font-black flex items-center justify-center gap-2">
                      <span>{t('hero.btn_enroll')}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link to="/academics" className="w-full sm:w-auto">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto px-8 bg-white border-2 text-sm sm:text-base py-4 sm:py-3 h-auto">
                      {t('hero.btn_courses')}
                    </Button>
                  </Link>
                </div>
              </ScrollReveal>
            </div>

            <div className="order-1 lg:order-2">
              <ScrollReveal direction="left" delay={0.3} className="relative">
                <div className="aspect-[4/3] bg-slate-200 overflow-hidden shadow-2xl relative z-10 border-4 border-white">
                  <img src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=1200" alt="Suryoday Coaching Classroom & Online Study" className="w-full h-full object-cover" />
                </div>
                {/* Decorative Badges */}
                <div className="absolute -bottom-6 -left-6 bg-crhs-navy text-white p-4 shadow-xl z-20 hidden sm:block border-l-4 border-amber-500">
                  <p className="text-xl font-black text-amber-400">ONLINE + OFFLINE</p>
                  <p className="text-xs font-bold text-slate-300">Complete Study Solution</p>
                </div>
                <div className="absolute -top-6 -right-6 w-24 h-24 sm:w-32 sm:h-32 bg-amber-400/20 z-0 hidden sm:block"></div>
              </ScrollReveal>
            </div>
            
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <WhyChooseUs />

      {/* Stats Section */}
      <section className="bg-crhs-navy py-16 md:py-20 text-white border-y-[6px] border-crhs-gold relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up" delay={0.1}>
            <StatsCounter className="text-white" />
          </ScrollReveal>
        </div>
      </section>

      {/* Educational Programs Section */}
      <ProgramsOverview />

      {/* News & Principal Message */}
      <section className="py-10 sm:py-16 md:py-24 bg-slate-50 relative">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12">
            
            <div className="lg:col-span-8 flex flex-col">
              <ScrollReveal direction="right" delay={0.2} className="h-full">
                <NoticeBoard />
              </ScrollReveal>
            </div>
            
            <div className="lg:col-span-4 flex flex-col">
              <ScrollReveal direction="left" delay={0.3} className="h-full">
                <PrincipalMessage />
              </ScrollReveal>
            </div>
            
          </div>
        </div>
      </section>

      {/* Admissions CTA Section */}
      <AdmissionsCTA />
      
    </div>
  );
}
