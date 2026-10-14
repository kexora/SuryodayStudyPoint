import React from 'react';

import { useLanguage } from '@/context/LanguageContext';

export function PrincipalMessage() {
  const { t } = useLanguage();

  return (
    <div className="bg-crhs-navy text-white p-8 sm:p-10 relative overflow-hidden flex flex-col gap-8 h-full justify-center border-t-4 border-amber-500">
      <div className="relative z-10 flex flex-col gap-6">
        <div className="flex gap-5 items-center">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white flex-none rounded-full overflow-hidden relative border-4 border-amber-400 shadow-lg">
            <img 
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200" 
              alt="Director, Suryoday Study Point" 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="text-[11px] sm:text-xs font-black text-amber-400 uppercase tracking-widest mb-1 sm:mb-2">{t('director.title')}</p>
            <p className="text-lg sm:text-xl font-bold tracking-tight">{t('director.name')}</p>
            <p className="text-xs text-slate-300 font-medium">{t('director.sub')}</p>
          </div>
        </div>
        <div className="relative">
          <span className="text-amber-400 text-5xl absolute -top-4 -left-3 sm:-left-6 opacity-30 leading-none font-serif">"</span>
          <p className="text-sm sm:text-base italic leading-relaxed opacity-90 relative z-10 pl-4 sm:pl-0">
            {t('director.quote')}
          </p>
        </div>
      </div>
      <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-white/5 rotate-45 z-0"></div>
    </div>
  );
}
