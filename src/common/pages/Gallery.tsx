import React from 'react';
import { GalleryGrid } from '@/common/components/GalleryGrid';
import { ScrollReveal } from '@/common/components/ui/ScrollReveal';
import { SEO } from '@/common/components/ui/SEO';
import { Camera, Image as ImageIcon, Sparkles, MapPin, Phone, ArrowRight, Building2, Monitor } from 'lucide-react';
import { schoolConfig } from '@/config/schoolConfig';
import { useLanguage } from '@/context/LanguageContext';
import { Link } from 'react-router-dom';

export function Gallery() {
  const { t, language } = useLanguage();

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800">
      <SEO 
        title="Photo Gallery | Suryoday Study Point" 
        description={`Explore the vibrant life at ${schoolConfig.schoolName} through our photo gallery. View pictures of our campus, events, sports, and classrooms.`}
        keywords={`school gallery, campus photos, school events pictures, ${schoolConfig.schoolShortName} gallery, student life photos`}
      />

      {/* Hero Section - Sleek, Theme-Consistent & Mobile-Optimized */}
      <div className="bg-crhs-navy text-white py-10 sm:py-16 md:py-20 relative overflow-hidden border-b-4 border-amber-500">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-72 sm:w-96 h-72 sm:h-96 bg-amber-500/15 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-72 sm:w-96 h-72 sm:h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          {/* Top Badge with Blur Reveal */}
          <ScrollReveal direction="up" delay={0.05} blur={10}>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30 mb-3 sm:mb-4">
              <Camera className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{language === 'hi' ? 'तस्वीरें एवं गतिविधियां' : 'Campus Photo Gallery'}</span>
            </div>
          </ScrollReveal>

          {/* Heading with Blur Reveal */}
          <ScrollReveal direction="up" delay={0.12} blur={10}>
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-black uppercase tracking-wider mb-3 sm:mb-4 text-white">
              {t('gallery.title', 'Our Gallery')}
            </h1>
          </ScrollReveal>

          {/* Subtitle with Blur Reveal */}
          <ScrollReveal direction="up" delay={0.18} blur={8}>
            <p className="text-xs sm:text-sm md:text-base text-slate-300 max-w-2xl mx-auto font-normal sm:font-medium leading-relaxed px-2">
              {t('gallery.desc', 'Explore our modern coaching campus, smart classrooms, computer test lab, and student academic activities.')}
            </p>
          </ScrollReveal>

          {/* Quick Category Chips for Mobile */}
          <ScrollReveal direction="up" delay={0.24} blur={8}>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-[11px] sm:text-xs">
              <span className="bg-white/10 backdrop-blur-xs text-amber-300 px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5 font-medium">
                <Monitor className="w-3.5 h-3.5 text-amber-400" />
                {language === 'hi' ? 'स्मार्ट क्लासरूम्स' : 'Smart Classrooms'}
              </span>
              <span className="bg-white/10 backdrop-blur-xs text-slate-200 px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5 font-medium">
                <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                {language === 'hi' ? 'भवानी छपार कैंपस' : 'Campus Views'}
              </span>
              <span className="bg-white/10 backdrop-blur-xs text-slate-200 px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                {language === 'hi' ? 'लाइब्रेरी व लैब' : 'Lab & Study Hall'}
              </span>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Main Gallery Section */}
      <div className="py-6 sm:py-10 md:py-14 max-w-6xl mx-auto px-3.5 sm:px-6 lg:px-8">
        <ScrollReveal direction="up" delay={0.1} blur={8}>
          <GalleryGrid />
        </ScrollReveal>
      </div>

      {/* Campus Tour Helpline CTA Section with Blur Reveal */}
      <div className="max-w-6xl mx-auto px-3.5 sm:px-6 lg:px-8 pb-12 sm:pb-16">
        <ScrollReveal direction="up" delay={0.14} blur={8}>
          <div className="bg-linear-to-r from-crhs-navy to-slate-900 text-white p-5 sm:p-7 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded border border-amber-400/20 mb-2 inline-block">
                {language === 'hi' ? 'कैंपस विजिट आमंत्रण' : 'Campus Experience'}
              </span>
              <h3 className="text-base sm:text-lg font-black text-white">
                {t('gallery.tour', 'Want to experience our campus in person?')}
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                {language === 'hi' 
                  ? `आप व्यक्तिगत रूप से आकर हमारे स्मार्ट क्लासरूम्स, लैब और शिक्षकों से मिल सकते हैं। पता: ${schoolConfig.location.address}` 
                  : `Schedule a center visit today to see our modern facilities firsthand. Located at ${schoolConfig.location.address}.`}
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
                to="/contact" 
                className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 border border-white/20 transition-colors"
              >
                <span>{t('gallery.book_tour', 'Contact Office')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
