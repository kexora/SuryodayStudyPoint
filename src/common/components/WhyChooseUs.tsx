import React from 'react';
import { BookOpen, Trophy, Users, Monitor, Shield, Heart } from 'lucide-react';
import { ScrollReveal } from '@/common/components/ui/ScrollReveal';
import { useLanguage } from '@/context/LanguageContext';

export function WhyChooseUs() {
  const { t } = useLanguage();

  const features = [
    { icon: Monitor, title: t('why.f1_title'), desc: t('why.f1_desc') },
    { icon: Users, title: t('why.f2_title'), desc: t('why.f2_desc') },
    { icon: BookOpen, title: t('why.f3_title'), desc: t('why.f3_desc') },
    { icon: Trophy, title: t('why.f4_title'), desc: t('why.f4_desc') },
    { icon: Shield, title: t('why.f5_title'), desc: t('why.f5_desc') },
    { icon: Heart, title: t('why.f6_title'), desc: t('why.f6_desc') },
  ];

  return (
    <section className="py-16 md:py-24 bg-slate-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal direction="up" delay={0.1}>
          <div className="text-center mb-16">
            <span className="text-amber-600 font-black text-xs md:text-sm uppercase tracking-[0.2em] mb-4 block">{t('why.badge')}</span>
            <h2 className="text-3xl md:text-4xl font-black uppercase text-crhs-navy">{t('why.title')}</h2>
          </div>
        </ScrollReveal>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <ScrollReveal key={idx} direction="up" delay={0.1 * (idx + 1)}>
                <div className="bg-white p-8 h-full border-b-4 border-transparent hover:border-amber-500 shadow-sm hover:shadow-xl transition-all duration-300 rounded-lg">
                  <div className="w-14 h-14 bg-amber-50 flex items-center justify-center mb-6 text-amber-600 rounded-lg">
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-crhs-navy">{feat.title}</h3>
                  <p className="text-slate-600 font-medium leading-relaxed">{feat.desc}</p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
