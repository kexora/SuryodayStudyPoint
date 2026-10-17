import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Quote, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function PrincipalMessage() {
  const { t, language } = useLanguage();

  return (
    <div className="flex flex-col h-full w-full bg-white p-6 sm:p-8 shadow-sm border border-gray-100 justify-between">
      
      <div>
        {/* Header - Matches NoticeBoard Title Style */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-crhs-navy font-black text-lg uppercase tracking-widest border-l-4 border-amber-500 pl-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            {t('director.title')}
          </h3>
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
            {language === 'hi' ? 'निदेशक का संदेश' : 'Director Desk'}
          </span>
        </div>

        {/* Director Profile - Clean and Simple */}
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full overflow-hidden border-2 border-amber-400 shrink-0 shadow-xs">
            <img 
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256" 
              alt={language === 'hi' ? 'इंजीनियर आलोक कुमार' : 'Er. Alok Kumar'} 
              className="w-full h-full object-cover object-top"
              loading="lazy"
            />
          </div>
          <div className="min-w-0">
            <h4 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-1.5">
              <span>{t('director.name')}</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            </h4>
            <p className="text-xs font-bold text-amber-600 truncate mt-0.5">
              {t('director.sub')}
            </p>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              {language === 'hi' ? 'बी.टेक • मुख्य शैक्षणिक मेंटर' : 'B.Tech • Senior Academic Mentor'}
            </p>
          </div>
        </div>

        {/* Message Quote - Clean Typography with Amber Left Accent */}
        <div className="relative pl-4 border-l-2 border-amber-400 py-1 mb-6">
          <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed font-normal">
            "{t('director.quote')}"
          </p>
        </div>
      </div>

      {/* Footer Signature & Link */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="font-mono font-bold text-slate-800 text-[11px]">
          ~ Er. Alok Kumar
        </span>
        <Link 
          to="/about" 
          className="text-amber-600 hover:text-amber-700 font-bold text-[11px] flex items-center gap-1 hover:underline"
        >
          <span>{language === 'hi' ? 'संस्थान के बारे में पढ़ें' : 'Read More'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

    </div>
  );
}
