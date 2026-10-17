import React from 'react';
import { Card, CardContent } from '@/common/components/ui/Card';
import { ScrollReveal } from '@/common/components/ui/ScrollReveal';
import { SEO } from '@/common/components/ui/SEO';
import { 
  BookOpen, 
  MapPin, 
  Users, 
  Award, 
  Target, 
  Compass, 
  Video, 
  CheckCircle2, 
  Phone, 
  GraduationCap, 
  Monitor, 
  Calendar,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { schoolConfig } from '@/config/schoolConfig';
import { useLanguage } from '@/context/LanguageContext';
import { Link } from 'react-router-dom';

export function About() {
  const { t, language } = useLanguage();

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800">
      <SEO 
        title="About Us | Suryoday Study Point"
        description={`Learn about ${schoolConfig.schoolName}, established in ${schoolConfig.academics.establishmentYear}. Premier coaching institute offering Online & Offline classes for Class 6th to 12th, JEE & NEET.`}
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
              <span>{language === 'hi' ? 'संस्थान परिचय' : 'Institute Profile'}</span>
            </div>
          </ScrollReveal>

          {/* Heading with Blur Reveal */}
          <ScrollReveal direction="up" delay={0.12} blur={10}>
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-black uppercase tracking-wider mb-3 sm:mb-4 text-white">
              {t('about.title', 'About Us')}
            </h1>
          </ScrollReveal>

          {/* Subtitle with Blur Reveal */}
          <ScrollReveal direction="up" delay={0.18} blur={8}>
            <p className="text-xs sm:text-sm md:text-base text-slate-300 max-w-2xl mx-auto font-normal sm:font-medium leading-relaxed px-2">
              {t('about.subtitle', `Empowering students with top-tier Online & Offline coaching since ${schoolConfig.academics.establishmentYear}.`)}
            </p>
          </ScrollReveal>

          {/* Quick Chips on Hero for Mobile */}
          <ScrollReveal direction="up" delay={0.24} blur={8}>
            <div className="mt-5 sm:mt-6 flex flex-wrap items-center justify-center gap-2 text-[11px] sm:text-xs">
              <span className="bg-white/10 backdrop-blur-xs text-amber-300 px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                {language === 'hi' ? 'स्थापना 2015' : 'Est. 2015'}
              </span>
              <span className="bg-white/10 backdrop-blur-xs text-slate-200 px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5 font-medium">
                <Video className="w-3.5 h-3.5 text-emerald-400" />
                {language === 'hi' ? 'ऑनलाइन + ऑफलाइन बैचेस' : 'Online & Offline'}
              </span>
              <span className="bg-white/10 backdrop-blur-xs text-slate-200 px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5 font-medium">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                {language === 'hi' ? 'देवरिया (उत्तर प्रदेश)' : 'Deoria, Uttar Pradesh'}
              </span>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Main Container - Compact Padding on Mobile */}
      <div className="py-6 sm:py-10 md:py-14 max-w-6xl mx-auto px-3.5 sm:px-6 lg:px-8">
        
        {/* Quick Snapshot Metrics Bar (Staggered Blur Revealing Animation) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 mb-6 sm:mb-10">
          <ScrollReveal direction="up" delay={0.06} blur={8}>
            <div className="bg-white p-3.5 sm:p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3 h-full hover:border-amber-400/60 transition-all duration-300">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg bg-amber-50 flex items-center justify-center shrink-0 border border-amber-200/60">
                <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider truncate">
                  {language === 'hi' ? 'कोर्स वर्ग' : 'Academics'}
                </p>
                <p className="text-xs sm:text-sm font-black text-crhs-navy truncate">
                  {language === 'hi' ? '6वीं - 12वीं' : 'Class 6th-12th'}
                </p>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.12} blur={8}>
            <div className="bg-white p-3.5 sm:p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3 h-full hover:border-blue-400/60 transition-all duration-300">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 border border-blue-200/60">
                <Target className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider truncate">
                  {language === 'hi' ? 'प्रतियोगी बैच' : 'Competition'}
                </p>
                <p className="text-xs sm:text-sm font-black text-crhs-navy truncate">
                  {language === 'hi' ? 'SSC / पुलिस / रेलवे' : 'SSC/Police/Rail'}
                </p>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.18} blur={8}>
            <div className="bg-white p-3.5 sm:p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3 h-full hover:border-purple-400/60 transition-all duration-300">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg bg-purple-50 flex items-center justify-center shrink-0 border border-purple-200/60">
                <Monitor className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider truncate">
                  {language === 'hi' ? 'कंप्यूटर क्लास' : 'Computer Lab'}
                </p>
                <p className="text-xs sm:text-sm font-black text-crhs-navy truncate">
                  CCC • ADCA • DCA
                </p>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.24} blur={8}>
            <div className="bg-white p-3.5 sm:p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3 h-full hover:border-emerald-400/60 transition-all duration-300">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-200/60">
                <Video className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider truncate">
                  {language === 'hi' ? 'अध्ययन माध्यम' : 'Modes'}
                </p>
                <p className="text-xs sm:text-sm font-black text-crhs-navy truncate">
                  {language === 'hi' ? 'लाइव + क्लासरूम' : 'Live & Offline'}
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Content Layout: Main Info & Highlights */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 mb-8 sm:mb-12">
          
          {/* Main Story Column */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Story Card with Blur Reveal */}
            <ScrollReveal direction="up" delay={0.1} blur={8}>
              <Card className="border border-slate-200/80 shadow-xs overflow-hidden bg-white rounded-xl">
                <CardContent className="p-4 sm:p-7 md:p-8 space-y-5">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    <h2 className="text-base sm:text-lg font-black text-crhs-navy uppercase tracking-wide">
                      {language === 'hi' ? 'सूर्योदय स्टडी पॉइंट की विकास यात्रा' : 'Our Institute Story'}
                    </h2>
                  </div>

                  <div className="space-y-3.5 text-slate-700 leading-relaxed text-xs sm:text-sm md:text-base">
                    <p className="text-justify sm:text-left">
                      {t('about.p1')}
                    </p>
                    
                    <p className="text-justify sm:text-left">
                      {t('about.p2')}
                    </p>

                    <p className="text-justify sm:text-left">
                      {t('about.p3')}
                    </p>
                  </div>

                  {/* Director Quote Banner inside story */}
                  <div className="bg-amber-50/70 p-4 sm:p-5 border-l-4 border-amber-500 rounded-r-lg mt-4">
                    <p className="text-amber-950 font-bold italic text-xs sm:text-sm md:text-base leading-relaxed">
                      {t('about.quote')}
                    </p>
                    <div className="mt-3 flex items-center justify-between text-xs text-amber-900/80">
                      <span className="font-bold">— Er. Alok Kumar</span>
                      <span className="text-[11px] font-medium">{language === 'hi' ? 'संस्थापक एवं निदेशक' : 'Founder & Director'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>

            {/* Vision & Mission - Clean Staggered Blur Reveal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ScrollReveal direction="up" delay={0.12} blur={8}>
                <div className="bg-white p-4 sm:p-6 rounded-xl shadow-xs border border-slate-200/80 border-t-4 border-t-amber-500 h-full flex flex-col justify-between">
                  <div>
                    <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center mb-3 border border-amber-200/50">
                      <Target className="w-5 h-5 text-amber-600" />
                    </div>
                    <h3 className="text-sm sm:text-base font-black text-crhs-navy uppercase mb-2">
                      {t('about.mission_title', 'Our Mission')}
                    </h3>
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-normal">
                      {t('about.mission_desc')}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-bold text-amber-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{language === 'hi' ? 'सुलभ व गुणवत्तापूर्ण कोचिंग' : 'Quality & Affordable'}</span>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={0.18} blur={8}>
                <div className="bg-white p-4 sm:p-6 rounded-xl shadow-xs border border-slate-200/80 border-t-4 border-t-crhs-navy h-full flex flex-col justify-between">
                  <div>
                    <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center mb-3 border border-blue-200/50">
                      <Compass className="w-5 h-5 text-crhs-navy" />
                    </div>
                    <h3 className="text-sm sm:text-base font-black text-crhs-navy uppercase mb-2">
                      {t('about.vision_title', 'Our Vision')}
                    </h3>
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-normal">
                      {t('about.vision_desc')}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-bold text-crhs-navy">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{language === 'hi' ? 'भविष्य के लीडर्स और टॉपर्स' : 'Future Leaders & Toppers'}</span>
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* Three Pillar Cards with Staggered Blur Reveal */}
            <ScrollReveal direction="up" delay={0.1} blur={8}>
              <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200/80 shadow-xs">
                <h3 className="text-sm sm:text-base font-black text-crhs-navy uppercase tracking-wide mb-3.5 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-500" />
                  {language === 'hi' ? 'अध्ययन के तीन मुख्य स्तंभ' : 'Three Core Academic Pillars'}
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <ScrollReveal direction="up" delay={0.14} blur={6}>
                    <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200/60 h-full hover:bg-amber-50/30 transition-colors">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded">
                        1. Academics
                      </span>
                      <h4 className="font-black text-xs sm:text-sm text-slate-900 mt-2">
                        {language === 'hi' ? 'कक्षा 6वीं से 12वीं' : 'Class 6th to 12th'}
                      </h4>
                      <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                        {language === 'hi' 
                          ? 'CBSE एवं UP बोर्ड हेतु शाम के बैच, दैनिक प्रैक्टिस एवं टॉपिक टेस्ट।'
                          : 'CBSE & UP Board evening batches, daily practice papers & weekly tests.'}
                      </p>
                    </div>
                  </ScrollReveal>

                  <ScrollReveal direction="up" delay={0.2} blur={6}>
                    <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200/60 h-full hover:bg-blue-50/30 transition-colors">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded">
                        2. Competition
                      </span>
                      <h4 className="font-black text-xs sm:text-sm text-slate-900 mt-2">
                        {language === 'hi' ? 'सूर्योदय कॉम्पिटिशन' : 'Competition Batches'}
                      </h4>
                      <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                        {language === 'hi' 
                          ? 'SSC, यूपी पुलिस, आर्मी, रेलवे, UP TGT/PGT स्पीड मैथ व रीज़निंग।'
                          : 'SSC, UP Police, Railway & Army prep with speed math & previous papers.'}
                      </p>
                    </div>
                  </ScrollReveal>

                  <ScrollReveal direction="up" delay={0.26} blur={6}>
                    <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200/60 h-full hover:bg-purple-50/30 transition-colors">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-100/60 px-2 py-0.5 rounded">
                        3. Computer Lab
                      </span>
                      <h4 className="font-black text-xs sm:text-sm text-slate-900 mt-2">
                        {language === 'hi' ? 'कंप्यूटर एकेडमी' : 'Computer Courses'}
                      </h4>
                      <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                        {language === 'hi' 
                          ? 'CCC, ADCA, DCA, Tally सरकारी सर्टिफिकेशन एवं प्रैक्टिकल हैंड्स-ऑन।'
                          : 'Govt. recognized CCC, ADCA, DCA, Tally with practical lab sessions.'}
                      </p>
                    </div>
                  </ScrollReveal>
                </div>
              </div>
            </ScrollReveal>

          </div>

          {/* Sidebar / Quick Facts & Contact with Staggered Blur Reveal */}
          <div className="lg:col-span-4 space-y-5">
            
            {/* Quick Facts Card */}
            <ScrollReveal direction="up" delay={0.12} blur={8}>
              <Card className="border border-slate-200/80 shadow-xs bg-white rounded-xl">
                <CardContent className="p-4 sm:p-6">
                  <h3 className="text-sm sm:text-base font-black text-crhs-navy uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                    <Award className="text-amber-500 w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                    <span>{t('about.highlights', 'Institute Highlights')}</span>
                  </h3>
                  
                  <ul className="space-y-4">
                    <li className="flex gap-3 items-start">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0 border border-amber-200/50 mt-0.5">
                        <BookOpen className="w-4 h-4 text-amber-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-crhs-navy text-xs uppercase tracking-wider">
                          {language === 'hi' ? 'स्थापना वर्ष' : 'Established Year'}
                        </p>
                        <p className="text-slate-600 text-xs sm:text-sm font-medium">
                          {schoolConfig.academics.establishmentYear} ({language === 'hi' ? '10+ वर्षों का विश्वास' : '10+ Years of Trust'})
                        </p>
                      </div>
                    </li>

                    <li className="flex gap-3 items-start">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 border border-blue-200/50 mt-0.5">
                        <Video className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-crhs-navy text-xs uppercase tracking-wider">
                          {language === 'hi' ? 'अध्ययन माध्यम' : 'Modes Offered'}
                        </p>
                        <p className="text-slate-600 text-xs sm:text-sm font-medium">
                          {language === 'hi' ? 'ऑनलाइन लाइव + ऑफलाइन क्लासरूम' : 'Online Live & Offline Batches'}
                        </p>
                      </div>
                    </li>

                    <li className="flex gap-3 items-start">
                      <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center shrink-0 border border-purple-200/50 mt-0.5">
                        <Users className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-crhs-navy text-xs uppercase tracking-wider">
                          {language === 'hi' ? 'छात्र सहायता' : 'Faculty & Doubt Support'}
                        </p>
                        <p className="text-slate-600 text-xs sm:text-sm font-medium">
                          {language === 'hi' ? 'अनुभवी शिक्षक • क्लास बाद डाउट काउंटर' : 'Expert Mentors • After-Class Doubts'}
                        </p>
                      </div>
                    </li>

                    <li className="flex gap-3 items-start">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-200/50 mt-0.5">
                        <MapPin className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-crhs-navy text-xs uppercase tracking-wider">
                          {language === 'hi' ? 'स्थान' : 'Campus Location'}
                        </p>
                        <p className="text-slate-600 text-xs sm:text-sm font-medium leading-snug">
                          {schoolConfig.location.address}, {schoolConfig.location.state}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {language === 'hi' ? '(सिरिसिया बाबू रोड के पास)' : '(Near Sirisiya Babu Road)'}
                        </p>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </ScrollReveal>

            {/* Director Compact Profile Card on About Page */}
            <ScrollReveal direction="up" delay={0.18} blur={8}>
              <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-xs">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-13 h-13 rounded-full overflow-hidden border-2 border-amber-400 shrink-0">
                    <img 
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256" 
                      alt="Er. Alok Kumar" 
                      className="w-full h-full object-cover object-top"
                      loading="lazy"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-black text-slate-900 truncate">Er. Alok Kumar</h4>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    </div>
                    <p className="text-[11px] font-bold text-amber-600 truncate">
                      {language === 'hi' ? 'संस्थापक एवं निदेशक' : 'Founder & Director'}
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium">
                      {language === 'hi' ? 'बी.टेक • मुख्य शैक्षणिक मेंटर' : 'B.Tech • Senior Academic Mentor'}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed italic bg-slate-50 p-2.5 rounded border border-slate-100">
                  "{language === 'hi' 
                    ? 'हमारा संकल्प हर छात्र को सही मार्गदर्शन और आधुनिक संसाधनों से सफलता दिलाना है।' 
                    : 'Our mission is to empower every student with conceptual clarity and modern digital tools.'}"
                </p>
              </div>
            </ScrollReveal>

            {/* Quick Mobile Action CTA Card */}
            <ScrollReveal direction="up" delay={0.24} blur={8}>
              <div className="bg-linear-to-br from-crhs-navy to-slate-900 text-white p-4 sm:p-5 rounded-xl shadow-xs border border-slate-800">
                <p className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                  {language === 'hi' ? 'नया बैच प्रवेश प्रारंभ' : 'New Batches Open'}
                </p>
                <h4 className="text-sm sm:text-base font-black mb-2 text-white">
                  {language === 'hi' ? 'अपनी तैयारी अभी शुरू करें' : 'Start Your Preparation Today'}
                </h4>
                <p className="text-slate-300 text-xs mb-4 leading-relaxed font-normal">
                  {language === 'hi' 
                    ? 'ऑनलाइन या ऑफलाइन बैच में प्रवेश हेतु आवेदन करें अथवा संपर्क करें।' 
                    : 'Apply for online or offline classroom batches today.'}
                </p>

                <div className="flex flex-col gap-2">
                  <Link
                    to="/admissions"
                    className="w-full py-2 px-3 bg-amber-500 hover:bg-amber-600 text-crhs-navy font-black text-xs uppercase tracking-wider rounded text-center transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>{language === 'hi' ? 'ऑनलाइन आवेदन करें' : 'Apply Online'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <a
                    href={`tel:${schoolConfig.contact.phonePrimary}`}
                    className="w-full py-2 px-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider rounded text-center transition-colors flex items-center justify-center gap-1.5 border border-white/20"
                  >
                    <Phone className="w-3.5 h-3.5 text-amber-400" />
                    <span>{schoolConfig.contact.phonePrimary}</span>
                  </a>
                </div>
              </div>
            </ScrollReveal>

          </div>

        </div>

      </div>
    </div>
  );
}
