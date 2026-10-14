import React from 'react';
import { GalleryGrid } from '@/common/components/GalleryGrid';
import { ScrollReveal } from '@/common/components/ui/ScrollReveal';
import { SEO } from '@/common/components/ui/SEO';
import { Camera, Image as ImageIcon } from 'lucide-react';
import { schoolConfig } from '@/config/schoolConfig';
import { useLanguage } from '@/context/LanguageContext';

export function Gallery() {
  const { t } = useLanguage();

  return (
    <>
      <SEO 
        title="Photo Gallery" 
        description={`Explore the vibrant life at ${schoolConfig.schoolName} through our photo gallery. View pictures of our campus, events, sports, and classrooms.`}
        keywords={`school gallery, campus photos, school events pictures, ${schoolConfig.schoolShortName} gallery, student life photos`}
      />

      {/* Main Gallery Section */}
      <div className="py-8 md:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal direction="up" delay={0.2}>
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-widest text-crhs-navy mb-4">{t('gallery.title', 'Our Gallery')}</h1>
            <p className="text-slate-500 font-medium max-w-2xl mx-auto">
              {t('gallery.desc')}
            </p>
          </div>
          <GalleryGrid />
        </ScrollReveal>
      </div>

      {/* CTA Section */}
      <div className="bg-slate-50 border-t border-slate-200 py-16 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <ScrollReveal direction="up">
            <ImageIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h2 className="text-2xl font-black text-crhs-navy uppercase tracking-wider mb-4">{t('gallery.tour', 'Want to see more?')}</h2>
            <p className="text-slate-600 font-medium mb-8">
              The best way to experience our campus is in person. Schedule a campus tour today to see our facilities firsthand and meet our staff.
            </p>
            <a 
              href="/contact" 
              className="inline-flex items-center justify-center font-black uppercase tracking-widest px-8 py-4 text-sm bg-crhs-navy text-white hover:bg-crhs-gold hover:text-crhs-navy border-2 border-crhs-navy transition-all"
            >
              {t('gallery.book_tour', 'Book a Campus Tour')}
            </a>
          </ScrollReveal>
        </div>
      </div>
    </>
  );
}
