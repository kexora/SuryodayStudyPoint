import React from 'react';
import { ScrollReveal } from '@/common/components/ui/ScrollReveal';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export function ProgramsOverview() {
  const { t } = useLanguage();

  const programs = [
    { level: t('prog.p1_title'), grades: t('prog.p1_sub'), img: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800', desc: t('prog.p1_desc') },
    { level: t('prog.p2_title'), grades: t('prog.p2_sub'), img: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&q=80&w=800', desc: t('prog.p2_desc') },
    { level: t('prog.p3_title'), grades: t('prog.p3_sub'), img: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800', desc: t('prog.p3_desc') },
    { level: t('prog.p4_title'), grades: t('prog.p4_sub'), img: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800', desc: t('prog.p4_desc') },
  ];

  return (
    <section className="py-16 md:py-24 bg-white relative border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal direction="up" delay={0.1}>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <span className="text-amber-600 font-black text-xs md:text-sm uppercase tracking-[0.2em] mb-4 block">{t('prog.badge')}</span>
              <h2 className="text-3xl md:text-4xl font-black uppercase text-crhs-navy">{t('prog.title')}</h2>
            </div>
            <Link to="/academics" className="group inline-flex items-center text-amber-600 font-bold uppercase tracking-wider text-sm hover:text-crhs-navy transition-colors mb-2">
              {t('nav.academics')} <ArrowRight className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </ScrollReveal>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {programs.map((prog, idx) => (
            <ScrollReveal key={idx} direction="up" delay={0.1 * (idx + 1)}>
              <div className="group block relative overflow-hidden bg-slate-900 aspect-[4/5] sm:aspect-square lg:aspect-[4/5] border-t-4 border-amber-500 shadow-md">
                <img src={prog.img} alt={prog.level} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-30 group-hover:scale-110 transition-all duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-crhs-navy/95 via-crhs-navy/40 to-transparent" />
                
                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  <div className="transform translate-y-8 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                    <span className="text-amber-400 font-bold text-xs uppercase tracking-wider mb-2 block opacity-90">{prog.grades}</span>
                    <h3 className="text-xl font-black text-white mb-3">{prog.level}</h3>
                    <p className="text-white/80 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 leading-relaxed">
                      {prog.desc}
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
