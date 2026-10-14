import React from 'react';
import { ScrollReveal } from '@/common/components/ui/ScrollReveal';
import { Button } from '@/common/components/ui/Button';
import { Link } from 'react-router-dom';
import { useAdmission } from '@/context/AdmissionContext';
import { Lock, Sparkles } from 'lucide-react';

import { useLanguage } from '@/context/LanguageContext';

export function AdmissionsCTA() {
  const { activeCampaign } = useAdmission();
  const { t } = useLanguage();
  const isOpen = activeCampaign && activeCampaign.isActive;

  return (
    <section className="py-20 md:py-28 bg-crhs-navy relative overflow-hidden">
      {/* Abstract Background Design */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <ScrollReveal direction="up" delay={0.1}>
          {isOpen ? (
            <span className="text-amber-400 font-black text-xs sm:text-sm uppercase tracking-[0.3em] mb-6 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-400/20 border border-amber-400">
              <Sparkles className="w-4 h-4 text-amber-400 animate-spin" /> {t('nav.apply_online')} • Session {activeCampaign.academicYear}
            </span>
          ) : (
            <span className="text-slate-300 font-black text-xs sm:text-sm uppercase tracking-[0.3em] mb-6 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-slate-800 border border-slate-700">
              <Lock className="w-4 h-4 text-slate-400" /> [CLOSED]
            </span>
          )}

          <h2 className="text-3xl md:text-5xl font-black uppercase text-white mb-6 leading-[1.15]">
            {isOpen ? t('cta.title_open') : "Admissions Currently Closed"}
          </h2>

          <p className="text-base md:text-lg text-white/80 mb-10 font-medium max-w-2xl mx-auto leading-relaxed">
            {isOpen ? t('cta.sub_open') : "For course inquiry, demo classes, or batch schedule updates, please contact our counseling desk."}
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {isOpen ? (
              <Link to="/admissions" className="w-full sm:w-auto">
                <Button size="lg" className="w-full bg-amber-500 hover:bg-amber-600 text-crhs-navy px-10 py-4 h-auto text-base font-black uppercase tracking-wider">
                  {t('cta.btn_apply')} <span className="ml-2">→</span>
                </Button>
              </Link>
            ) : (
              <Link to="/admissions" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full border-2 border-slate-500 text-slate-300 hover:bg-slate-800 px-8 py-4 h-auto text-base font-bold uppercase">
                  View Admission Details
                </Button>
              </Link>
            )}

            <Link to="/contact" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full border-2 border-white/30 text-white hover:bg-white hover:text-crhs-navy hover:border-white px-10 py-4 h-auto text-base">
                {t('cta.btn_contact')}
              </Button>
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
